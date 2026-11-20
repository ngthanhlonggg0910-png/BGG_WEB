import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  X,
} from "lucide-react";
import {
  getTrangThaiPhieuGiamDinh,
  huyXacNhanPhieuGiamDinh,
  xacNhanPhieuGiamDinh,
} from "../api/inspectionConfirmApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";

const TRANG_THAI = {
  MOITAO: { label: "Mới tạo", className: "bg-slate-100 text-slate-700" },
  CHOKIEM: { label: "Chờ kiểm", className: "bg-amber-50 text-amber-700" },
  DAXACNHAN: { label: "Đã xác nhận", className: "bg-green-50 text-green-700" },
  HUYXACNHAN: { label: "Hủy xác nhận", className: "bg-orange-50 text-orange-700" },
  HUY: { label: "Hủy", className: "bg-red-50 text-red-700" },
};

// Cột hiển thị cho từng loại danh sách server trả về khi chặn thao tác.
const ROW_COLUMNS = {
  VUOT_CHUNG_TU: [
    ["ItemCode", "Item"],
    ["ArtCode", "Art"],
    ["ColorCode", "Màu"],
    ["SizeCode", "Size"],
    ["SLGiamDinh", "SL giám định"],
    ["SLChungTu", "SL chứng từ"],
  ],
  THIEU_KHO: [
    ["TenNPL", "NPL"],
    ["Lot", "Lot"],
    ["Kho", "Khổ"],
    ["CTPGDId", "ID"],
  ],
  CHUA_GIAM_DINH: [
    ["CTPGDId", "ID"],
    ["MaNPL", "Mã NPL"],
    ["TenNPL", "Tên NPL"],
    ["Lot", "Lot"],
  ],
  DA_XUAT: [
    ["MaCay", "Mã tem/cây"],
    ["SoLuongXuat", "SL đã xuất"],
  ],
};

const buttonBase =
  "flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

function RowsTable({ code, rows }) {
  const columns = ROW_COLUMNS[code];
  if (!columns || !Array.isArray(rows) || rows.length === 0) return null;

  return (
    <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-egmf-border">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-egmf-surface-subtle">
          <tr>
            {columns.map(([, label]) => (
              <th key={label} className="px-2.5 py-2 font-bold text-egmf-muted">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-egmf-border-subtle">
              {columns.map(([key]) => (
                <td key={key} className="px-2.5 py-1.5 font-semibold text-egmf-ink-secondary">
                  {row?.[key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Trạng thái phiếu giám định + nút Xác nhận / Hủy xác nhận (theo quyền desktop
 * btnXacNhan / btnHuyXacNhan của form frmChiTietPhieu).
 *
 * Chế độ danh sách (`quyen` + `trangThai` truyền vào): không gọi API trạng thái
 * cho từng phiếu, chỉ hiện nút gọn ở chân thẻ phiếu.
 */
export default function InspectionConfirmActions({
  pgdId,
  maPhieu,
  onStatusChange,
  onLoaded,
  quyen,
  trangThai: trangThaiProp,
  compact = false,
}) {
  const listMode = Boolean(quyen);
  const [fetchedInfo, setInfo] = useState(null);
  const info = listMode
    ? {
        MaPhieu: maPhieu,
        TrangThai: trangThaiProp ?? "",
        ThuocPhieuTong: false,
        coTheXacNhan:
          Boolean(quyen.quyenXacNhan) &&
          trangThaiProp !== "HUY" &&
          trangThaiProp !== "DAXACNHAN",
        coTheHuyXacNhan:
          Boolean(quyen.quyenHuyXacNhan) && trangThaiProp === "DAXACNHAN",
      }
    : fetchedInfo;
  const [dialog, setDialog] = useState(null);
  const [working, setWorking] = useState(false);
  // Callback mới nhất của trang cha, không làm loadStatus đổi mỗi lần render.
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  const loadStatus = useCallback(async () => {
    if (listMode) return null;
    const id = Number(pgdId);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    try {
      const response = await getTrangThaiPhieuGiamDinh(id);
      setInfo(response?.data ?? null);
      if (response?.data) onLoadedRef.current?.(response.data);
      return response?.data ?? null;
    } catch (error) {
      console.error("Không lấy được trạng thái phiếu giám định:", error);
      return null;
    }
  }, [pgdId, listMode]);

  useEffect(() => {
    if (listMode) return;
    loadStatus().then((data) => {
      if (data) onStatusChange?.(data.TrangThai);
    });
    // onStatusChange is a notification only; re-run only when the phiếu changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStatus]);

  const tenPhieu = info?.MaPhieu || maPhieu || "";

  const finish = async (response) => {
    showSuccessToast(response.message);
    setDialog(null);
    const data = await loadStatus();
    onStatusChange?.(data?.TrangThai ?? response.trangThai);
  };

  const handleResult = (response, retryWithDelete) => {
    if (response?.success) return finish(response);

    if (response?.code === "CHUA_GIAM_DINH" && retryWithDelete) {
      setDialog({ type: "chuaGiamDinh", message: response.message, rows: response.rows });
      return;
    }

    if (Array.isArray(response?.rows) && response.rows.length > 0) {
      setDialog({
        type: "blocked",
        code: response.code,
        message: response.message,
        rows: response.rows,
      });
      return;
    }

    setDialog(null);
    showErrorToast(response?.message || "Thao tác thất bại");
    if (response?.trangThai) {
      onStatusChange?.(response.trangThai);
    } else {
      loadStatus().then((data) => data && onStatusChange?.(data.TrangThai));
    }
  };

  const runXacNhan = async (xoaDongChuaGiamDinh) => {
    if (working) return;
    setWorking(true);
    try {
      const response = await xacNhanPhieuGiamDinh(Number(pgdId), xoaDongChuaGiamDinh);
      await handleResult(response, !xoaDongChuaGiamDinh);
    } catch (error) {
      setDialog(null);
      showErrorToast(error.message || "Không thể xác nhận phiếu giám định");
    } finally {
      setWorking(false);
    }
  };

  const runHuyXacNhan = async () => {
    if (working) return;
    setWorking(true);
    try {
      const response = await huyXacNhanPhieuGiamDinh(Number(pgdId));
      await handleResult(response, false);
    } catch (error) {
      setDialog(null);
      showErrorToast(error.message || "Không thể hủy xác nhận phiếu giám định");
    } finally {
      setWorking(false);
    }
  };

  if (!info) return null;
  if (compact && !info.coTheXacNhan && !info.coTheHuyXacNhan) return null;

  const trangThai = TRANG_THAI[info.TrangThai] ?? {
    label: info.TrangThai || "—",
    className: "bg-slate-100 text-slate-700",
  };
  const closeDialog = () => !working && setDialog(null);

  const buttons = (
    <div className={compact ? "grid grid-cols-1 gap-2" : "flex flex-wrap gap-2"}>
      {info.coTheHuyXacNhan && (
        <button
          type="button"
          disabled={working}
          onClick={() => setDialog({ type: "huy" })}
          className={`${buttonBase} border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 focus-visible:ring-orange-200`}
        >
          <RotateCcw size={16} strokeWidth={2.5} />
          Hủy xác nhận
        </button>
      )}
      {info.coTheXacNhan && (
        <button
          type="button"
          disabled={working}
          onClick={() => setDialog({ type: "confirm" })}
          className={`${buttonBase} bg-egmf-primary text-white shadow-egmf-primary-compact hover:bg-egmf-primary-strong focus-visible:ring-egmf-primary/20`}
        >
          <ClipboardCheck size={17} strokeWidth={2.4} />
          Xác nhận phiếu
        </button>
      )}
    </div>
  );

  return (
    // Thẻ phiếu trong danh sách có onClick mở chi tiết: chặn click (kể cả trong modal) lan lên thẻ.
    <div className="contents" onClick={(event) => event.stopPropagation()}>
      {compact ? (
        <div className="mt-2.5 border-t border-egmf-border-subtle pt-2.5">{buttons}</div>
      ) : (
      <section className="mb-3 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-egmf-border bg-white px-3.5 py-2.5 shadow-sm sm:mb-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xs font-semibold text-egmf-muted">Trạng thái phiếu</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${trangThai.className}`}>
            {trangThai.label}
          </span>
          {info.ThuocPhieuTong && (
            <span className="text-xs font-semibold text-egmf-muted">
              (thuộc phiếu tổng, xác nhận trên desktop)
            </span>
          )}
        </div>

        {buttons}
      </section>
      )}

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px]"
          onClick={closeDialog}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspection-confirm-title"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-egmf-border bg-white shadow-[0_28px_72px_rgba(15,23,42,.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start gap-3 border-b border-egmf-border-subtle px-5 pb-4 pt-5">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                  dialog.type === "confirm"
                    ? "bg-egmf-primary text-white"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {dialog.type === "confirm" ? (
                  <ClipboardCheck size={22} strokeWidth={2.4} />
                ) : (
                  <AlertTriangle size={22} strokeWidth={2.4} />
                )}
              </span>
              <div className="min-w-0">
                <h2 id="inspection-confirm-title" className="m-0 text-lg font-extrabold text-egmf-ink">
                  {dialog.type === "huy"
                    ? "Hủy xác nhận phiếu giám định"
                    : dialog.type === "blocked"
                      ? "Chưa thể thực hiện"
                      : "Xác nhận phiếu giám định"}
                </h2>
                <p className="m-0 mt-0.5 truncate text-sm font-bold text-egmf-muted">{tenPhieu}</p>
              </div>
            </header>

            <div className="px-5 py-4 text-sm leading-5 text-egmf-ink-secondary">
              {dialog.type === "confirm" && (
                <p className="m-0">
                  Xác nhận phiếu <b>{tenPhieu}</b>? Hệ thống sẽ kiểm tra số lượng so với chứng từ,
                  khóa phiếu và tạo phiếu nhập kho.
                </p>
              )}
              {dialog.type === "huy" && (
                <p className="m-0">
                  Hủy xác nhận phiếu <b>{tenPhieu}</b>? Không thể hủy nếu đã có cây được QA kiểm
                  vải hoặc vật tư đã xuất kho.
                </p>
              )}
              {dialog.type === "chuaGiamDinh" && (
                <>
                  <p className="m-0">{dialog.message}</p>
                  <p className="m-0 mt-2 font-semibold text-red-600">
                    Những dòng này (kèm dữ liệu kiểm phụ liệu của chúng) sẽ bị xóa khỏi phiếu và
                    không thể khôi phục.
                  </p>
                  <RowsTable code="CHUA_GIAM_DINH" rows={dialog.rows} />
                </>
              )}
              {dialog.type === "blocked" && (
                <>
                  <p className="m-0 font-semibold text-red-600">{dialog.message}</p>
                  <RowsTable code={dialog.code} rows={dialog.rows} />
                </>
              )}
            </div>

            <footer className="flex flex-col-reverse gap-2.5 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={working}
                className={`${buttonBase} border border-egmf-border bg-white text-egmf-ink-secondary hover:bg-egmf-primary-tint focus-visible:ring-egmf-primary/15`}
              >
                <X size={16} strokeWidth={2.5} />
                {dialog.type === "blocked" ? "Đóng" : "Hủy"}
              </button>

              {dialog.type === "confirm" && (
                <button
                  type="button"
                  disabled={working}
                  onClick={() => runXacNhan(false)}
                  className={`${buttonBase} bg-egmf-primary text-white hover:bg-egmf-primary-strong focus-visible:ring-egmf-primary/20`}
                >
                  <CheckCircle2 size={17} strokeWidth={2.5} />
                  {working ? "Đang xác nhận..." : "Xác nhận"}
                </button>
              )}
              {dialog.type === "chuaGiamDinh" && (
                <button
                  type="button"
                  disabled={working}
                  onClick={() => runXacNhan(true)}
                  className={`${buttonBase} bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200`}
                >
                  <CheckCircle2 size={17} strokeWidth={2.5} />
                  {working
                    ? "Đang xác nhận..."
                    : `Xóa ${dialog.rows?.length ?? 0} dòng và xác nhận`}
                </button>
              )}
              {dialog.type === "huy" && (
                <button
                  type="button"
                  disabled={working}
                  onClick={runHuyXacNhan}
                  className={`${buttonBase} bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-200`}
                >
                  <RotateCcw size={16} strokeWidth={2.5} />
                  {working ? "Đang hủy..." : "Hủy xác nhận"}
                </button>
              )}
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
