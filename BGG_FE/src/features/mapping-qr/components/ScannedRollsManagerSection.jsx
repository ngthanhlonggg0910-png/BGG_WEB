import React, { useCallback, useEffect, useState } from "react";
import {
  Package,
  Layers3,
  Boxes,
  PencilLine,
  Trash2,
  Scissors,
  Plus,
  Minus,
  QrCode,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  deleteScannedRoll,
  getScannedRolls,
  splitScannedRoll,
  updateScannedRoll,
} from "../api/mappingQrApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";

function buildEvenSplitRows(totalSL, count) {
  const safeTotal = Number(totalSL);
  if (!Number.isFinite(safeTotal) || safeTotal <= 0 || count < 2) {
    return Array.from({ length: Math.max(2, count) }, (_, idx) => ({
      id: idx + 1,
      quantity: "",
    }));
  }

  const isIntegerTotal = Number.isInteger(safeTotal);
  if (isIntegerTotal) {
    const base = Math.floor(safeTotal / count);
    const remainder = safeTotal - base * count;
    return Array.from({ length: count }, (_, idx) => ({
      id: idx + 1,
      quantity: String(idx === 0 ? base + remainder : base),
    }));
  }

  const base = Number((safeTotal / count).toFixed(2));
  const first = Number((safeTotal - base * (count - 1)).toFixed(2));
  return Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    quantity: String(idx === 0 ? first : base),
  }));
}

export default function ScannedRollsManagerSection({
  ctpgdId,
  item,
  qrTrangMapping = "",
  showMaterialHeader = true,
  sectionTitle = "Danh sách tem / gói trong thùng",
  onScan,
  onRollsChanged,
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update single roll quantity modal state
  const [rollToUpdate, setRollToUpdate] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [savingQuantity, setSavingQuantity] = useState(false);

  // Split roll modal state
  const [rollToSplit, setRollToSplit] = useState(null);
  const [splitRows, setSplitRows] = useState([]);
  const [splitError, setSplitError] = useState("");
  const [savingSplit, setSavingSplit] = useState(false);

  // Delete roll modal state
  const [rollToDelete, setRollToDelete] = useState(null);
  const [deletingRoll, setDeletingRoll] = useState(false);

  const user = getCurrentUser();
  const tkId = user?.data?.TKId;
  const nguoiTao = user?.data?.NguoiDungId ?? user?.data?.TKId;
  const tenNguoiTao = [user?.data?.HoVaTenLot, user?.data?.Ten]
    .filter(Boolean)
    .join(" ");

  const documentQuantity = Number(
    item?.SoLuongChungTuThucTe ??
      item?.PKList ??
      rollToUpdate?.SoLuongChungTuThucTe ??
      0,
  );

  const totalRollQuantity = Number(
    list
      .reduce((total, cay) => {
        const q = Number(cay.SL);
        return total + (Number.isFinite(q) ? q : 0);
      }, 0)
      .toFixed(4),
  );

  const fetchScannedRolls = useCallback(async () => {
    if (!ctpgdId) return null;

    try {
      setLoading(true);
      const response = await getScannedRolls(
        Number(ctpgdId),
        qrTrangMapping || undefined,
      );

      if (response?.success) {
        const rolls = response.data || [];
        setList(rolls);
        onRollsChanged?.(rolls);
        return rolls;
      } else {
        setList([]);
        showErrorToast(response?.message || "Lấy dữ liệu tem thất bại");
        return null;
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách tem/cây:", error);
      setList([]);
      showErrorToast("Không thể tải danh sách tem/cây");
      return null;
    } finally {
      setLoading(false);
    }
  }, [ctpgdId, qrTrangMapping, onRollsChanged]);

  useEffect(() => {
    fetchScannedRolls();
  }, [fetchScannedRolls]);

  // --- Update single roll handlers ---
  const openUpdateModal = (cay) => {
    setRollToUpdate(cay);
    setQuantity(String(cay.SL ?? ""));
    setQuantityError("");
  };

  const closeUpdateModal = () => {
    if (savingQuantity) return;
    setRollToUpdate(null);
    setQuantity("");
    setQuantityError("");
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
      enteredQuantity <= 0
    ) {
      setQuantityError("Vui lòng nhập số lượng thực tế lớn hơn 0");
      return;
    }

    const soLuongXuat = Number(rollToUpdate?.SoLuongXuat || 0);
    if (soLuongXuat > 0 && enteredQuantity < soLuongXuat) {
      setQuantityError(
        `Tem này đã xuất kho ${soLuongXuat}, số lượng không được nhỏ hơn số lượng đã xuất`,
      );
      return;
    }

    if (!Number.isFinite(cayId) || !Number.isFinite(rollCtpgdId)) {
      showErrorToast("Không tìm thấy thông tin tem để cập nhật");
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

      onScan?.(rollToUpdate, enteredQuantity);
      showSuccessToast(
        response?.message || "Đã cập nhật số lượng thực tế thành công",
      );
      setRollToUpdate(null);
      setQuantity("");
      setQuantityError("");
    } catch (error) {
      console.error("Lỗi cập nhật số lượng tem:", error);
      showErrorToast(error.message || "Cập nhật số lượng thất bại");
    } finally {
      setSavingQuantity(false);
    }
  };

  // --- Split roll handlers ---
  const openSplitModal = (cay) => {
    setRollToSplit(cay);
    setSplitRows(buildEvenSplitRows(cay?.SL, 2));
    setSplitError("");
  };

  const closeSplitModal = () => {
    if (savingSplit) return;
    setRollToSplit(null);
    setSplitRows([]);
    setSplitError("");
  };

  const handleQuickEvenSplit = (count) => {
    if (!rollToSplit) return;
    setSplitRows(buildEvenSplitRows(rollToSplit.SL, count));
    setSplitError("");
  };

  const handleAddSplitRow = () => {
    setSplitRows((prev) => {
      const nextId =
        prev.reduce((maxId, r) => Math.max(maxId, r.id), 0) + 1;
      return [...prev, { id: nextId, quantity: "" }];
    });
    setSplitError("");
  };

  const handleRemoveSplitRow = (rowId) => {
    setSplitRows((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((r) => r.id !== rowId);
    });
    setSplitError("");
  };

  const handleChangeSplitRowQuantity = (rowId, val) => {
    setSplitRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, quantity: val } : r)),
    );
    setSplitError("");
  };

  const totalSplitQuantity = Number(
    splitRows
      .reduce((sum, r) => {
        const val = Number(String(r.quantity ?? "").trim().replace(",", "."));
        return sum + (Number.isFinite(val) && val > 0 ? val : 0);
      }, 0)
      .toFixed(4),
  );

  const originalSplitRollSL = Number(rollToSplit?.SL ?? 0);
  const splitQuantityDiff = Number(
    (totalSplitQuantity - originalSplitRollSL).toFixed(4),
  );

  const handleConfirmSplit = async () => {
    if (savingSplit || !rollToSplit) return;

    if (splitRows.length < 2) {
      setSplitError("Cần ít nhất 2 phần để tách tem");
      return;
    }

    const parsedQuantities = [];
    for (let i = 0; i < splitRows.length; i++) {
      const raw = String(splitRows[i].quantity ?? "").trim().replace(",", ".");
      const num = Number(raw);
      if (!raw || !Number.isFinite(num) || num <= 0) {
        setSplitError(`Vui lòng nhập số lượng hợp lệ (> 0) cho Tem ${i + 1}`);
        return;
      }
      parsedQuantities.push(num);
    }

    const soLuongXuat = Number(rollToSplit?.SoLuongXuat || 0);
    if (soLuongXuat > 0 && parsedQuantities[0] < soLuongXuat) {
      setSplitError(
        `Tem gốc đã xuất kho ${soLuongXuat}, số lượng Tem 1 không được nhỏ hơn ${soLuongXuat}`,
      );
      return;
    }

    try {
      setSavingSplit(true);
      const response = await splitScannedRoll({
        CayId: Number(rollToSplit.CayId),
        CTPGDId: Number(rollToSplit.CTPGDId ?? ctpgdId),
        quantities: parsedQuantities,
        TKId: tkId ? Number(tkId) : undefined,
        TenNguoiTao: tenNguoiTao || undefined,
        NguoiTao: nguoiTao ? Number(nguoiTao) : undefined,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Tách tem thất bại");
      }

      if (Array.isArray(response.data) && response.data.length > 0) {
        const filteredData = qrTrangMapping
          ? response.data.filter(
              (r) =>
                String(r.QrTrangMapping ?? "").trim() ===
                String(qrTrangMapping).trim(),
            )
          : response.data;
        setList(filteredData);
        onRollsChanged?.(filteredData);
      } else {
        await fetchScannedRolls();
      }

      showSuccessToast(
        response.message ||
          `Đã tách tem ${rollToSplit.MaCay} thành ${parsedQuantities.length} tem thành công`,
      );
      setRollToSplit(null);
      setSplitRows([]);
      setSplitError("");
    } catch (error) {
      console.error("Lỗi tách tem:", error);
      setSplitError(error.message || "Có lỗi xảy ra khi tách tem");
      showErrorToast(error.message || "Tách tem thất bại");
    } finally {
      setSavingSplit(false);
    }
  };

  // --- Delete roll handlers ---
  const closeDeleteModal = () => {
    if (deletingRoll) return;
    setRollToDelete(null);
  };

  const handleDeleteRoll = async () => {
    if (deletingRoll) return;

    const maCay = String(rollToDelete?.MaCay ?? "").trim();

    if (!maCay) {
      showErrorToast("Không tìm thấy mã tem để xóa");
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
          showSuccessToast("Đã xóa tem thành công");
          return;
        }

        throw new Error(response.message || "Xóa tem thất bại");
      }

      await fetchScannedRolls();
      showSuccessToast(response?.message || "Đã xóa tem thành công");
      setRollToDelete(null);
    } catch (error) {
      console.error("Lỗi xóa tem:", error);
      showErrorToast(error.message || "Xóa tem thất bại");
    } finally {
      setDeletingRoll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thông tin NPL & Tổng quan số lượng */}
      {showMaterialHeader ? (
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
                {item?.TenChungLoai ||
                  item?.MatVatTuGhep ||
                  item?.DienGiai ||
                  "Chi tiết nguyên phụ liệu"}
              </h2>
              {item?.Item && (
                <p className="m-0 mt-1 inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                  Mã VT: {item.Item}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-egmf-primary-border-soft border-t border-egmf-primary-border-soft bg-egmf-primary-tint">
            {[
              {
                label: "SL chứng từ",
                value: documentQuantity || (item?.SoLuongChungTuThucTe ?? 0),
                icon: Layers3,
              },
              {
                label: "Tổng số tem",
                value: list.length,
                icon: Boxes,
              },
              {
                label: "Tổng SL thực tế",
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
      ) : (
        <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                <Boxes size={17} strokeWidth={2.3} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-base font-extrabold text-egmf-ink">
                    {sectionTitle}
                  </h2>
                  {qrTrangMapping && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-extrabold text-blue-700">
                      <QrCode size={12} />
                      {qrTrangMapping}
                    </span>
                  )}
                </div>
                <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                  Cập nhật số lượng thực tế hoặc tách 1 tem thành nhiều tem nhỏ (tự động lưu vào Phiếu giám định).
                </p>
              </div>
            </div>
            <span className="rounded-full bg-egmf-primary-soft px-3 py-1 text-xs font-extrabold text-egmf-primary">
              {list.length} tem
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-egmf-primary-border-soft border-b border-egmf-primary-border-soft bg-egmf-primary-tint">
            <div className="min-w-0 px-2 py-2.5 text-center">
              <p className="m-0 text-[11px] font-semibold text-egmf-muted">
                SL chứng từ
              </p>
              <p className="m-0 mt-0.5 truncate text-sm font-extrabold text-egmf-ink sm:text-base">
                {documentQuantity || 0}
              </p>
            </div>
            <div className="min-w-0 px-2 py-2.5 text-center">
              <p className="m-0 text-[11px] font-semibold text-egmf-muted">
                Số tem hiện tại
              </p>
              <p className="m-0 mt-0.5 truncate text-sm font-extrabold text-egmf-ink sm:text-base">
                {list.length}
              </p>
            </div>
            <div className="min-w-0 px-2 py-2.5 text-center">
              <p className="m-0 text-[11px] font-semibold text-egmf-muted">
                Tổng SL thực tế
              </p>
              <p className="m-0 mt-0.5 truncate text-sm font-extrabold text-blue-700 sm:text-base">
                {totalRollQuantity}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="py-8 text-center text-sm font-semibold text-egmf-muted">
                Đang tải danh sách tem trong thùng...
              </div>
            ) : (
              renderRollCards()
            )}
          </div>
        </section>
      )}

      {/* Danh sách tem khi showMaterialHeader = true */}
      {showMaterialHeader && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                <Boxes size={17} />
              </span>
              <h3 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                {sectionTitle}
              </h3>
            </div>
            <span className="shrink-0 rounded-full bg-egmf-primary-soft px-3 py-1 text-xs font-bold text-egmf-primary">
              {list.length} tem
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-egmf-border bg-white px-5 py-8 text-center text-sm font-semibold text-egmf-muted">
              Đang tải danh sách tem...
            </div>
          ) : (
            renderRollCards()
          )}
        </section>
      )}

      {/* Modal Cập nhật số lượng 1 tem */}
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
                <PencilLine size={21} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2
                  id="update-quantity-title"
                  className="m-0 text-lg font-extrabold text-egmf-ink sm:text-xl"
                >
                  Cập nhật số lượng thực tế
                </h2>
                <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted sm:text-sm">
                  Điều chỉnh số lượng thực tế cho tem trong thùng
                </p>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-egmf-primary-border-soft bg-egmf-primary-tint px-3.5 py-3">
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                    Mã tem / cây
                  </p>
                  <p className="m-0 mt-0.5 break-all font-mono text-sm font-extrabold text-egmf-ink">
                    {rollToUpdate.MaCay || "—"}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                    Mã thùng (QR)
                  </p>
                  <p className="m-0 mt-0.5 break-all font-mono text-sm font-bold text-egmf-primary">
                    {rollToUpdate.QrTrangMapping || "—"}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="roll-quantity"
                    className="text-sm font-extrabold text-egmf-ink"
                  >
                    Số lượng thực tế của tem
                  </label>
                  <span className="shrink-0 rounded-full bg-egmf-primary-soft px-2.5 py-1 text-xs font-bold text-egmf-primary">
                    SL hiện tại: {rollToUpdate.SL ?? 0}
                  </span>
                </div>
                <input
                  id="roll-quantity"
                  type="number"
                  min="0"
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
                  className="mt-2 h-12 w-full rounded-xl border border-egmf-border bg-white px-3.5 text-base font-extrabold text-egmf-ink outline-none transition placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10 disabled:cursor-not-allowed disabled:bg-egmf-surface-subtle"
                />
                {documentQuantity > 0 && (
                  <p className="m-0 mt-2 text-xs font-medium text-egmf-muted">
                    SL chứng từ: <strong>{documentQuantity}</strong>
                  </p>
                )}
                {quantityError && (
                  <p className="m-0 mt-2 text-xs font-semibold text-red-600">
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
                {savingQuantity ? "Đang lưu..." : "Lưu số lượng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tách tem (Chia 1 tem thành nhiều tem trong thùng) */}
      {rollToSplit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-egmf-ink/50 p-3 backdrop-blur-[1px] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="split-roll-title"
          onMouseDown={(event) => {
            if (!savingSplit && event.target === event.currentTarget) {
              closeSplitModal();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-2xl">
            <div className="flex items-start gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                <Scissors size={21} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2
                  id="split-roll-title"
                  className="m-0 text-lg font-extrabold text-egmf-ink"
                >
                  Tách tem trong thùng
                </h2>
                <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                  Tách 1 tem tổng thành nhiều tem nhỏ trong cùng thùng QR
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {/* Thông tin tem gốc */}
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2.5">
                <div>
                  <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Tem gốc
                  </p>
                  <p className="m-0 mt-0.5 break-all font-mono text-xs font-extrabold text-slate-900 sm:text-sm">
                    {rollToSplit.MaCay}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Mã thùng QR
                  </p>
                  <p className="m-0 mt-0.5 break-all font-mono text-xs font-bold text-indigo-700 sm:text-sm">
                    {rollToSplit.QrTrangMapping || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    SL tem gốc
                  </p>
                  <p className="m-0 mt-0.5 text-base font-extrabold text-indigo-700">
                    {rollToSplit.SL ?? 0}
                  </p>
                </div>
              </div>

              {/* Nút chia nhanh */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    Chia nhanh đều số lượng:
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((count) => {
                    const isActive = splitRows.length === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => handleQuickEvenSplit(count)}
                        disabled={savingSplit}
                        className={`h-9 rounded-lg border text-xs font-extrabold transition active:scale-95 ${
                          isActive
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        Chia {count} tem
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Danh sách từng tem sau khi tách */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                    Số lượng từng tem ({splitRows.length} tem)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSplitRow}
                    disabled={savingSplit}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"
                  >
                    <Plus size={14} strokeWidth={2.6} />
                    Thêm tem
                  </button>
                </div>

                {splitRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xs"
                  >
                    <div className="min-w-[132px] shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5">
                      <p className="m-0 text-xs font-extrabold text-slate-800">
                        Tem {idx + 1}
                      </p>
                      <p className="m-0 text-[10px] font-semibold text-slate-500">
                        {idx === 0
                          ? `Giữ mã ${rollToSplit.MaCay}`
                          : "Tự động tạo mã mới"}
                      </p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="Nhập SL..."
                      value={row.quantity}
                      disabled={savingSplit}
                      onChange={(e) =>
                        handleChangeSplitRowQuantity(row.id, e.target.value)
                      }
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-right text-base font-extrabold text-blue-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                    />

                    {splitRows.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitRow(row.id)}
                        disabled={savingSplit}
                        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Xóa dòng tem này"
                      >
                        <Minus size={18} strokeWidth={2.6} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tổng kết so sánh SL */}
              <div
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold ${
                  splitQuantityDiff === 0
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {splitQuantityDiff === 0 ? (
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                  )}
                  <span>
                    {splitQuantityDiff === 0
                      ? "Tổng SL sau tách khớp với tem gốc"
                      : `Chênh lệch so với tem gốc: ${
                          splitQuantityDiff > 0
                            ? `+${splitQuantityDiff}`
                            : splitQuantityDiff
                        }`}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-extrabold">
                  Tổng: {totalSplitQuantity} / {originalSplitRollSL}
                </span>
              </div>

              {splitError && (
                <p className="m-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                  {splitError}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-3.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeSplitModal}
                disabled={savingSplit}
                className="h-10 rounded-lg px-4 text-sm font-bold text-egmf-ink-secondary transition hover:bg-white hover:text-egmf-primary disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSplit}
                disabled={savingSplit}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
              >
                <Scissors size={16} strokeWidth={2.4} />
                {savingSplit
                  ? "Đang tách tem..."
                  : `Xác nhận tách ${splitRows.length} tem`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa tem */}
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
                  Xóa tem / cây
                </h2>
                <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                  Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              <p className="m-0 text-sm font-medium text-egmf-ink-secondary">
                Bạn có chắc muốn xóa tem sau?
              </p>
              <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-red-500">
                  Mã tem / cây
                </p>
                <p className="m-0 mt-1 break-all font-mono text-sm font-extrabold text-red-700">
                  {rollToDelete.MaCay || "—"} (SL: {rollToDelete.SL ?? 0})
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-3.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingRoll}
                className="h-10 rounded-lg px-4 text-sm font-bold text-egmf-ink-secondary transition hover:bg-white hover:text-egmf-primary disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteRoll}
                disabled={deletingRoll}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
              >
                {deletingRoll ? "Đang xóa..." : "Xóa tem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderRollCards() {
    if (list.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-5 py-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
            <Boxes size={21} />
          </span>
          <p className="m-0 mt-2.5 text-sm font-bold text-egmf-ink-secondary">
            Chưa có tem nào được mapping cho vật tư này
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((cay, index) => (
          <div
            key={cay.CayId || cay.MaCay || index}
            className="overflow-hidden rounded-xl border border-egmf-border bg-white shadow-2xs transition-colors hover:border-egmf-primary-border"
          >
            {/* Header mỗi tem */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-blue-700 border border-blue-200">
                  Tem #{index + 1}
                </span>
                <span className="font-mono text-sm font-extrabold text-slate-900">
                  {cay.MaCay || "—"}
                </span>
                {cay.MaCayCu && (
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                    Tách từ: {cay.MaCayCu}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 border border-blue-200">
                <span className="text-xs font-bold text-slate-500">SL:</span>
                <span className="text-base font-extrabold text-blue-700">
                  {cay.SL ?? 0}
                </span>
              </div>
            </div>

            {/* Chi tiết tem */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-egmf-border-subtle px-4 py-3 text-sm sm:grid-cols-3 sm:px-5">
              <div className="min-w-0">
                <dt className="flex items-center gap-1 text-xs font-semibold text-egmf-muted">
                  <QrCode size={13} />
                  Mã thùng (QR)
                </dt>
                <dd className="m-0 mt-0.5 break-all font-mono font-bold text-slate-800">
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

              <div>
                <dt className="text-xs font-semibold text-egmf-muted">
                  SL đã xuất
                </dt>
                <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
                  {cay.SoLuongXuat ?? 0}
                </dd>
              </div>
            </dl>

            {/* Nút thao tác: Xóa | Tách tem | Sửa SL */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-2.5 sm:px-5">
              <button
                type="button"
                onClick={() => setRollToDelete(cay)}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
              >
                <Trash2 size={14} strokeWidth={2.4} />
                Xóa
              </button>

              <button
                type="button"
                onClick={() => openSplitModal(cay)}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"
              >
                <Scissors size={14} strokeWidth={2.4} />
                Tách tem
              </button>

              <button
                type="button"
                onClick={() => openUpdateModal(cay)}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-egmf-primary px-3 text-xs font-bold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-95"
              >
                <PencilLine size={14} strokeWidth={2.4} />
                Sửa SL
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
