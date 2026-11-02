import React, { useEffect, useMemo, useState } from "react";
import { Archive, Barcode, Check, PackageOpen, Search, X } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation } from "react-router-dom";
import { layDanhSachVatTuTheoMaQrTrang } from "../api/pickingOrderAPI";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";

import { pickFabricRoll } from "../api/pickingOrderAPI";

export default function AccessoryPickingPage() {
  const user = getCurrentUser();
  const TKId = user.data?.TKId;
  const tenNguoiQuetXuat = `${user.data?.HoVaTenLot} ${user.data?.Ten}`;
  const location = useLocation();
  const qrTrangMapping = location?.state?.MaRo;
  const phieuSoanHangId = Number(location?.state?.PhieuSoanHangId);
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.CayId === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const visibleItems = useMemo(() => {
    const keyword = searchValue.trim().toLocaleLowerCase("vi-VN");

    if (!keyword) return items;

    return items.filter((item) =>
      `${item.MaCay} ${item.TenNPL}`
        .toLocaleLowerCase("vi-VN")
        .includes(keyword),
    );
  }, [items, searchValue]);

  const fetchPL = async () => {
    if (!phieuSoanHangId || !qrTrangMapping) return;

    setLoading(true);

    try {
      const response = await layDanhSachVatTuTheoMaQrTrang(
        phieuSoanHangId,
        "",
        qrTrangMapping,
      );

      if (!response.success) {
        showErrorToast(response.message || "Không thể lấy danh sách phụ liệu");
        setItems([]);
        return;
      }

      // Load lại dữ liệu và bỏ check tất cả
      setItems(
        Array.isArray(response.data)
          ? response.data.map((item) => ({
              ...item,
              checked: false,
            }))
          : [],
      );
    } catch (error) {
      console.error("Lỗi lấy danh sách phụ liệu:", error);

      showErrorToast(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi lấy danh sách phụ liệu",
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPL();
  }, [phieuSoanHangId, qrTrangMapping]);

  const handleComfirm = async () => {
    if (submitting) return;

    const selectedItems = items.filter((item) => item.checked);

    if (selectedItems.length === 0) {
      showWarningToast("Vui lòng chọn ít nhất 1 cây!");
      return;
    }

    setSubmitting(true);

    let successCount = 0;
    const errors = [];

    try {
      for (const item of selectedItems) {
        const sl = Number(item.SLTX);

        if (!Number.isFinite(sl) || sl <= 0) {
          errors.push(`Cây ${item.MaCay}: Số lượng không hợp lệ`);
          continue;
        }

        const payload = {
          PhieuSoanHangId: phieuSoanHangId,
          MaCay: item.MaCay,
          SoLuongThucSoan: sl,
          TKQuet: Number(TKId),
          TenNguoiQuyetXuat: tenNguoiQuetXuat,
        };

        try {
          const response = await pickFabricRoll(payload);

          if (response.success) {
            successCount++;
          } else {
            errors.push(`Cây ${item.MaCay}: ${response.message}`);
          }
        } catch (error) {
          console.error("Lỗi API:", error);

          const message =
            error.response?.data?.message || error.message || "Lỗi gọi API";

          errors.push(`Cây ${item.MaCay}: ${message}`);
        }
      }

      // Chạy sau khi đã soạn hết các cây
      if (successCount === selectedItems.length) {
        showSuccessToast(`Soạn thành công ${successCount} cây!`);
      } else {
        showErrorToast(
          `Soạn thành công ${successCount}/${selectedItems.length} cây.\n${errors.join("\n")}`,
        );
      }

      // Chỉ reload 1 lần sau khi soạn xong
      if (successCount > 0) {
        await fetchPL();
      }
    } finally {
      // Chỉ mở lại nút khi toàn bộ quá trình kết thúc
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        checked: false,
      })),
    );
  };

  return (
    <MainLayout screenTitle="Phiếu soạn hàng: GPA26100104">
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-32 sm:px-6 sm:py-7 lg:px-8">
          <section className="mx-auto w-full max-w-xl">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
              <Search
                size={19}
                strokeWidth={2.25}
                className="shrink-0 text-egmf-primary"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm mã cây hoặc tên NPL..."
                className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-egmf-ink outline-none placeholder:font-normal placeholder:text-slate-400"
                aria-label="Tìm kiếm cây phụ liệu"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={16} strokeWidth={2.4} />
                </button>
              )}
            </div>
          </section>

          <main className="mt-5 grid gap-4 lg:grid-cols-2 lg:gap-5">
            {items.length === 0 ? (
              <section className="col-span-full flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:min-h-[420px]">
                <div className="max-w-sm">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                    <PackageOpen size={31} strokeWidth={1.8} />
                  </span>
                  <h2 className="mt-5 text-lg font-extrabold text-egmf-ink">
                    Chưa có cây phụ liệu cần xuất
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-egmf-muted">
                    Cây phụ liệu thuộc phiếu soạn hàng sẽ được hiển thị tại đây
                    khi có dữ liệu.
                  </p>
                  <span className="mt-5 inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                    Phiếu GPA26100104
                  </span>
                </div>
              </section>
            ) : (
              <>
                {visibleItems.map((item) => (
                  <article
                    key={item.CayId}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                      item.checked
                        ? "border-egmf-primary ring-2 ring-egmf-primary/10"
                        : "border-slate-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <label className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 py-1">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) =>
                            updateItem(item.CayId, "checked", e.target.checked)
                          }
                          className="size-7 shrink-0 cursor-pointer rounded-lg border-blue-300 text-egmf-primary accent-egmf-primary focus:ring-4 focus:ring-egmf-primary/20"
                        />
                        <span className="text-sm font-bold text-egmf-ink">
                          Chọn cây để xuất
                        </span>
                      </label>

                      <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        YC: {item.SLYeuCau}
                      </span>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                          <Barcode size={21} strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold uppercase tracking-[.08em] text-egmf-muted">
                            Mã cây
                          </span>
                          <h2 className="mt-0.5 break-all text-base font-extrabold tracking-[.01em] text-egmf-primary-strong sm:text-lg">
                            {item.MaCay}
                          </h2>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <span className="block text-xs font-semibold uppercase tracking-[.08em] text-egmf-muted">
                          Tên NPL
                        </span>
                        <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-700">
                          {item.TenNPL}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-egmf-muted">
                            <Archive size={14} className="text-egmf-primary" />
                            SL đã xuất
                          </span>
                          <strong className="mt-1 block text-lg font-extrabold text-egmf-ink">
                            {item.SoLuongXuat}
                          </strong>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className="text-xs font-semibold text-egmf-muted">
                            SL tồn
                          </span>
                          <strong className="mt-1 block text-lg font-extrabold text-egmf-ink">
                            {item.SLBD}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                        <label className="block text-xs font-bold uppercase tracking-[.08em] text-egmf-primary">
                          Số lượng thực xuất
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.SLTX}
                          onChange={(e) =>
                            updateItem(item.CayId, "SLTX", e.target.value)
                          }
                          placeholder="Nhập số lượng"
                          className="mt-1 h-9 w-full bg-transparent text-lg font-extrabold text-egmf-ink outline-none placeholder:text-sm placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </article>
                ))}

                {visibleItems.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-egmf-muted">
                    Không tìm thấy cây phụ liệu phù hợp với từ khóa “
                    {searchValue}”.
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        <footer className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 right-0 z-20 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,.08)] md:bottom-0 md:left-[270px] md:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <span className="hidden text-sm text-egmf-muted sm:block">
              Kiểm tra số lượng trước khi xác nhận xuất kho.
            </span>

            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 active:scale-[.98] sm:min-w-[120px]"
              >
                <X size={18} strokeWidth={2.4} />
                HỦY
              </button>

              <button
                disabled={submitting || loading}
                onClick={handleComfirm}
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-[0_6px_14px_rgba(37,99,235,.2)] transition hover:bg-egmf-primary-strong hover:shadow-[0_8px_18px_rgba(37,99,235,.26)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/25 active:scale-[.98] sm:min-w-[150px]"
              >
                <Check size={18} strokeWidth={2.7} />
                {submitting ? "Đang soạn..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
