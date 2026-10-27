import React, { useCallback, useEffect, useState } from "react";
import { Package, Layers3, Boxes, PencilLine, Trash2 } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation, useParams } from "react-router-dom";
import {
  deleteScannedRoll,
  getScannedRolls,
  updateScannedRoll,
} from "../api/mappingQrApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";

export default function MappingQrMaterialDetailPage({ data, onScan }) {
  const location = useLocation();
  const { ctpgdId } = useParams();
  console.log(ctpgdId);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollToUpdate, setRollToUpdate] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [savingQuantity, setSavingQuantity] = useState(false);
  const [rollToDelete, setRollToDelete] = useState(null);
  const [deletingRoll, setDeletingRoll] = useState(false);

  const documentQuantity = Number(
    location?.state?.item?.SoLuongChungTuThucTe ??
      rollToUpdate?.SoLuongChungTuThucTe ??
      rollToUpdate?.SL ??
      0,
  );

  const totalRollQuantity = Number(
    list
      .reduce((total, cay) => {
        const quantity = Number(cay.SL);
        return total + (Number.isFinite(quantity) ? quantity : 0);
      }, 0)
      .toFixed(4),
  );

  const fetchScannedRolls = useCallback(async () => {
    if (!ctpgdId) return;

    try {
      setLoading(true);
      const response = await getScannedRolls(Number(ctpgdId));

      if (response?.success) {
        const rolls = response.data || [];
        setList(rolls);
        return rolls;
      } else {
        setList([]);
        showErrorToast(response?.message || "Lấy dữ liệu thất bại");
        return null;
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách cây:", error);
      setList([]);
      showErrorToast("Không thể tải lại danh sách cây");
      return null;
    } finally {
      setLoading(false);
    }
  }, [ctpgdId]);

  const openUpdateModal = (cay) => {
    setRollToUpdate(cay);
    setQuantity(String(cay.SL ?? ""));
    setQuantityError("");
  };

  const closeUpdateModal = () => {
    setRollToUpdate(null);
    setQuantity("");
    setQuantityError("");
  };

  const closeDeleteModal = () => {
    if (deletingRoll) return;
    setRollToDelete(null);
  };

  const handleDeleteRoll = async () => {
    if (deletingRoll) return;

    const maCay = String(rollToDelete?.MaCay ?? "").trim();

    if (!maCay) {
      showErrorToast("Không tìm thấy mã cây để xóa");
      return;
    }

    try {
      setDeletingRoll(true);
      const response = await deleteScannedRoll(maCay);

      if (response?.success === false) {
        const refreshedRolls = await fetchScannedRolls();
        const wasDeleted =
          Array.isArray(refreshedRolls) &&
          !refreshedRolls.some(
            (cay) => String(cay.MaCay ?? "").trim() === maCay,
          );

        if (wasDeleted) {
          setRollToDelete(null);
          showSuccessToast("Đã xóa cây thành công");
          return;
        }

        throw new Error(response.message || "Xóa cây thất bại");
      }

      await fetchScannedRolls();
      showSuccessToast(response?.message || "Đã xóa cây thành công");
      setRollToDelete(null);
    } catch (error) {
      console.error("Lỗi xóa cây:", error);
      showErrorToast(error.message || "Xóa cây thất bại");
    } finally {
      setDeletingRoll(false);
    }
  };

  const handleConfirmQuantity = async () => {
    if (savingQuantity) return;

    const normalizedQuantity = String(quantity).trim().replace(",", ".");
    const enteredQuantity = Number(normalizedQuantity);
    const cayId = Number(rollToUpdate?.CayId);
    const rollCtpgdId = Number(rollToUpdate?.CTPGDId ?? ctpgdId);

    if (
      !normalizedQuantity ||
      !Number.isFinite(enteredQuantity) ||
      enteredQuantity < 0
    ) {
      setQuantityError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (enteredQuantity > documentQuantity) {
      setQuantityError("Số lượng nhập không được lớn hơn SL chứng từ");
      return;
    }

    if (!Number.isFinite(cayId) || !Number.isFinite(rollCtpgdId)) {
      showErrorToast("Không tìm thấy thông tin cây để cập nhật");
      return;
    }

    try {
      setSavingQuantity(true);

      const response = await updateScannedRoll({
        SL: enteredQuantity,
        CayId: cayId,
        CTPGDId: rollCtpgdId,
      });

      const refreshedRolls = await fetchScannedRolls();
      const updatedRoll = Array.isArray(refreshedRolls)
        ? refreshedRolls.find(
            (cay) =>
              Number(cay.CayId) === cayId &&
              Number(cay.CTPGDId) === rollCtpgdId,
          )
        : null;

      if (Number(updatedRoll?.SL) !== enteredQuantity) {
        throw new Error(
          response?.message || "Cập nhật số lượng thất bại. Vui lòng thử lại.",
        );
      }

      if (response?.success === false) {
        console.warn(
          "API cập nhật trả về thất bại nhưng dữ liệu đã được cập nhật:",
          response.message,
        );
      }

      onScan?.(rollToUpdate, enteredQuantity);
      showSuccessToast(
        response?.success === false
          ? "Cập nhật số lượng thành công"
          : (response.message || "Cập nhật số lượng thành công"),
      );
      closeUpdateModal();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng cây:", error);
      showErrorToast(error.message || "Cập nhật số lượng thất bại");
    } finally {
      setSavingQuantity(false);
    }
  };

  useEffect(() => {
    fetchScannedRolls();
  }, [fetchScannedRolls]);

  return (
    <MainLayout screenTitle="Chi tiết vật tư">
      <main className="min-h-full bg-egmf-surface px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-5">
          {/* Thông tin NPL */}
          <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
            <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                <Package size={21} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-primary">
                  Nguyên phụ liệu
                </p>
                <h2 className="m-0 mt-1 break-words text-[15px] font-extrabold leading-6 text-egmf-ink sm:text-base">
                  {location?.state?.item.TenChungLoai ||
                    "Chưa có tên nguyên phụ liệu"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-egmf-primary-border-soft border-t border-egmf-primary-border-soft bg-egmf-primary-tint">
              {[
                {
                  label: "SL chứng từ",
                  value: location?.state?.item.SoLuongChungTuThucTe,
                  icon: Layers3,
                },
                {
                  label: "Tổng cây",
                  value: location?.state?.item.SoLuongCay,
                  icon: Boxes,
                },
                {
                  label: "Tổng SL",
                  value: totalRollQuantity,
                  icon: Package,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="min-w-0 px-2 py-3 text-center">
                  <Icon size={15} className="mx-auto mb-1 text-egmf-primary" />
                  <p className="m-0 text-[11px] font-semibold text-egmf-muted">
                    {label}
                  </p>
                  <p className="m-0 mt-0.5 truncate text-base font-extrabold text-egmf-ink">
                    {value ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Danh sách cây */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                  <Boxes size={17} />
                </span>
                <h3 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                  Danh sách cây
                </h3>
              </div>

              {/* <span className="shrink-0 rounded-full bg-egmf-primary-soft px-3 py-1.5 text-xs font-bold text-egmf-primary">
                {DanhSachCay.length} cây
              </span> */}
            </div>

            <div className="space-y-3">
              {list.map((cay, index) => (
                <div
                  key={cay.MaCay || index}
                  className="overflow-hidden rounded-xl border border-egmf-border bg-white transition-colors hover:border-egmf-primary-border"
                >
                  {/* Mã cây */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                        Mã cây
                      </p>
                      <p className="m-0 mt-0.5 break-all text-sm font-extrabold text-egmf-ink">
                        {cay.MaCay || "—"}
                      </p>
                    </div>

                    {/* <span className="shrink-0 rounded-lg bg-egmf-primary-soft px-2.5 py-1.5 text-xs font-extrabold text-egmf-primary">
                      Xuất: {cay.SoLuongXuat ?? 0}
                    </span> */}
                  </div>

                  {/* Chi tiết */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-egmf-border-subtle px-4 py-3.5 text-sm sm:px-5">
                    <div>
                      <dt className="text-xs font-semibold text-egmf-muted">
                        Số lượng
                      </dt>
                      <dd className="m-0 mt-0.5 font-extrabold text-egmf-primary">
                        {cay.SL ?? 0}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-egmf-muted">
                        SL xuất
                      </dt>
                      <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
                        {cay.SoLuongXuat ?? 0}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-egmf-muted">
                        Mã QR
                      </dt>
                      <dd className="m-0 mt-0.5 break-all font-semibold text-egmf-ink-secondary">
                        {cay.QrTrangMapping || "—"}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-egmf-muted">
                        Mã số kiện
                      </dt>
                      <dd className="m-0 mt-0.5 break-all font-semibold text-egmf-ink-secondary">
                        {cay.MaSoKien || "—"}
                      </dd>
                    </div>
                  </dl>

                  {/* Nút thao tác */}
                  <div className="flex items-center justify-between gap-3 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-2.5 sm:px-5">
                    <span className="hidden items-center gap-1.5 text-xs font-semibold text-egmf-muted sm:flex">
                      <span className="size-1.5 rounded-full bg-egmf-primary" />
                      Quản lý cây
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRollToDelete(cay)}
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                      >
                        <Trash2 size={15} strokeWidth={2.5} />
                        Xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => openUpdateModal(cay)}
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-egmf-primary px-3 text-xs font-bold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
                      >
                        <PencilLine size={15} strokeWidth={2.5} />
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {list.length === 0 && (
                <div className="rounded-xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-5 py-10 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                    <Boxes size={23} />
                  </span>
                  <p className="m-0 mt-3 text-sm font-bold text-egmf-ink-secondary">
                    Chưa có danh sách cây
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {rollToUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-egmf-ink/50 p-4 backdrop-blur-[1px] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-quantity-title"
          onMouseDown={(event) => {
            if (!savingQuantity && event.target === event.currentTarget) {
              closeUpdateModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-2xl">
            <div className="flex items-start gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4 sm:px-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                <Package size={21} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2
                  id="update-quantity-title"
                  className="m-0 text-lg font-extrabold text-egmf-ink sm:text-xl"
                >
                  Cập nhật số lượng
                </h2>
                <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted sm:text-sm">
                  Điều chỉnh số lượng cho cây đã mapping
                </p>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="rounded-xl border border-egmf-primary-border-soft bg-egmf-primary-tint px-4 py-3">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-egmf-muted">
                  Mã cây
                </p>
                <p className="m-0 mt-1 break-all text-base font-extrabold text-egmf-ink">
                  {rollToUpdate.MaCay || "—"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="roll-quantity"
                    className="text-sm font-extrabold text-egmf-ink"
                  >
                    Số lượng cây
                  </label>
                  <span className="shrink-0 rounded-full bg-egmf-primary-soft px-2.5 py-1 text-xs font-bold text-egmf-primary">
                    Tối đa: {documentQuantity}
                  </span>
                </div>
                <input
                  id="roll-quantity"
                  type="number"
                  min="0"
                  max={documentQuantity}
                  step="any"
                  inputMode="decimal"
                  value={quantity}
                  disabled={savingQuantity}
                  onChange={(event) => {
                    setQuantity(event.target.value);
                    setQuantityError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleConfirmQuantity();
                    if (event.key === "Escape" && !savingQuantity) {
                      closeUpdateModal();
                    }
                  }}
                  autoFocus
                  className="mt-2 h-12 w-full rounded-xl border border-egmf-border bg-white px-3.5 text-base font-semibold text-egmf-ink outline-none transition placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10 disabled:cursor-not-allowed disabled:bg-egmf-surface-subtle"
                />
                <p className="m-0 mt-2 text-xs font-medium text-egmf-muted">
                  SL chứng từ: {documentQuantity}
                </p>
                {quantityError && (
                  <p className="m-0 mt-2 text-xs font-semibold text-egmf-warning">
                    {quantityError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeUpdateModal}
                disabled={savingQuantity}
                className="h-10 rounded-lg px-4 text-sm font-bold text-egmf-ink-secondary transition hover:bg-white hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmQuantity}
                disabled={savingQuantity}
                className="h-10 rounded-lg bg-egmf-primary px-4 text-sm font-bold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingQuantity ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rollToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-egmf-ink/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-roll-title"
          onMouseDown={(event) => {
            if (!deletingRoll && event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-2xl">
            <div className="flex items-start gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
                <Trash2 size={21} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2
                  id="delete-roll-title"
                  className="m-0 text-lg font-extrabold text-egmf-ink"
                >
                  Xóa cây
                </h2>
                <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                  Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              <p className="m-0 text-sm font-medium text-egmf-ink-secondary">
                Bạn có chắc muốn xóa cây sau?
              </p>
              <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-red-500">
                  Mã cây
                </p>
                <p className="m-0 mt-1 break-all text-sm font-extrabold text-red-700">
                  {rollToDelete.MaCay || "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-3.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingRoll}
                className="h-10 rounded-lg px-4 text-sm font-bold text-egmf-ink-secondary transition hover:bg-white hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteRoll}
                disabled={deletingRoll}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingRoll ? "Đang xóa..." : "Xóa cây"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
