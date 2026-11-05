import React, { useEffect, useMemo, useState } from "react";
import { Archive, Barcode, Check, PackageOpen, Search, ShieldCheck, X } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation } from "react-router-dom";
import { layDanhSachVatTuTheoMaQrTrang } from "../api/pickingOrderAPI";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";
import ConfirmPickingModal from "../components/ConfirmPickingModal";

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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

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

  //Xử lý xác nhận xuất cây
  const handleComfirm = async () => {
    const checkedItems = items.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      showWarningToast("Vui lòng chọn ít nhất một cây phụ liệu!");
      return;
    }

    //kiểm tra số lượng thực xuất
    for (const item of checkedItems) {
      const sltx = Number(item.SLTX);
      if (!item.SLTX || isNaN(sltx) || sltx <= 0) {
        showWarningToast(
          `Vui lòng nhập số lượng thực xuất hợp lệ cho cây ${item.MaCay}`,
        );
        return;
      }

      if (sltx > item.SoLuong) {
        showWarningToast(
          `Số lượng thực xuất của cây ${item.MaCay} không được lớn hơn số lượng tồn (${item.SoLuong})`,
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      for (const item of checkedItems) {
        const payload = {
          PhieuSoanHangId: phieuSoanHangId,
          MaCay: item.MaCay,
          SoLuongThucSoan: Number(item.SLTX),
          TKQuet: TKId,
          TenNguoiQuyetXuat: tenNguoiQuetXuat,
        };

        const res = await pickFabricRoll(payload);

        if (!res.success) {
          showErrorToast(
            res.message || `Soạn cây ${item.MaCay} không thành công!`,
          );
          return;
        }
      }

      showSuccessToast("Soạn phụ liệu thành công!");

      // Tải lại danh sách
      await fetchPL();
    } catch (error) {
      console.error("Lỗi khi soạn phụ liệu:", error);

      showErrorToast(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi soạn phụ liệu",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        checked: false,
        SLTX: "",
      })),
    );

    setSearchValue("");
  };

  return (
    <MainLayout screenTitle={`Soạn phụ liệu: ${qrTrangMapping || ""}`}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-32 sm:px-6 sm:py-7 lg:px-8">
          {/* SEARCH & ACTIONS */}
          <section className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
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

            {/* NÚT XÁC NHẬN XUẤT KHO */}
            {phieuSoanHangId > 0 && (
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <ShieldCheck size={18} />
                <span>Xác nhận xuất kho</span>
              </button>
            )}
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
                    Mã rổ: {qrTrangMapping || "—"}
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
                          className="size-5 rounded border-slate-300 text-egmf-primary focus:ring-egmf-primary"
                        />
                        <span className="truncate text-base font-extrabold text-egmf-ink">
                          {item.MaCay}
                        </span>
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <Barcode size={14} />
                        {item.CayId}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-slate-500">Tên vật tư:</span>
                        <span className="text-right text-xs font-bold text-slate-800">
                          {item.TenNPL || item.MaVatTu || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">Màu / Quy cách:</span>
                        <span className="text-right text-xs font-semibold text-slate-700">
                          {item.Mau || "—"} / {item.QuyCach || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">Tồn rổ:</span>
                        <span className="text-xs font-extrabold text-blue-600">
                          {Number(item.SoLuong || 0).toLocaleString()} {item.DVT || ""}
                        </span>
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
              Kiểm tra số lượng trước khi xác nhận soạn.
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
                {submitting ? "Đang soạn..." : "Xác nhận soạn"}
              </button>
            </div>
          </div>
        </footer>

        {/* Modal xác nhận xuất kho */}
        <ConfirmPickingModal
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          phieuSoanHangId={phieuSoanHangId}
          onSuccess={() => {
            fetchPL();
          }}
        />
      </div>
    </MainLayout>
  );
}
