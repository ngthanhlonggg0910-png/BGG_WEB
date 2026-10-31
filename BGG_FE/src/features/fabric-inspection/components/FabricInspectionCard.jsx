import { useState } from "react";
import { Modal } from "antd";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Package,
  Trash2,
  UserRound,
} from "lucide-react";
import { xoaPhieuKiem } from "../api/fabric-inspections.api";
import { formatDateTime } from "../../../shared/utils/formatDateTime";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";

export function FabricInspectionCard({ item, onClick, onDelete }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const documentNumber =
    item.SoPhieuSoan ?? item.MaSoPhieuSoan ?? item.SoPhieuKiem ?? "—";
  const documentLabel =
    (item.SoPhieuSoan ?? item.MaSoPhieuSoan)
      ? "Số phiếu soạn"
      : "Số phiếu kiểm";

  const handleConfirmDelete = async () => {
    setDeleting(true);

    try {
      const response = await xoaPhieuKiem(item.PKVId);
      if (!response.success || Number(response.data?.KetQua) !== 1) {
        showErrorToast(response.message || "Xóa phiếu thất bại!");
        setDeleteModalOpen(false);
        return;
      }

      showSuccessToast(response.message || "Xóa phiếu thành công!");
      setDeleteModalOpen(false);
      await onDelete?.(item);
    } catch (error) {
      console.error("Lỗi xóa phiếu kiểm vải:", error);
      showErrorToast(
        `Lỗi FE: ${error.message}` || "Có lỗi xảy ra khi xóa phiếu kiểm vải!",
      );
    } finally {
      setDeleting(false);
    }
  };

  const details = [
    { label: "Nhà cung cấp", value: item.TenNgan ?? item.NhaCungCap },
    { label: "Mã hàng", value: item.MaHang },
    { label: "Chủng loại", value: item.ChungLoai },
    { label: "Màu vải", value: item.MaMau ?? item.MauVai },
  ];
  const references = [
    { label: "Item", value: item.Item },
    { label: "Art", value: item.Art },
    { label: "LOT", value: item.LOT ?? item.Lot },
    { label: "Chứng từ", value: item.ChungTu },
  ];

  return (
    <>
      <article
        aria-label={`Inspection ${item.SoPhieuKiem || ""}`}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key !== "Enter" && event.key !== " ") return;

          event.preventDefault();
          onClick?.(event);
        }}
        role="button"
        tabIndex={0}
        className="group w-full overflow-hidden rounded-egmf-large border border-egmf-border bg-white text-left shadow-egmf-card transition duration-200 hover:-translate-y-0.5 hover:border-egmf-primary-border hover:bg-egmf-surface-subtle hover:shadow-[0_12px_28px_rgba(37,99,235,0.10)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:translate-y-0 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 border-b border-egmf-border-subtle bg-egmf-primary-hover-soft px-4 py-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary transition-colors group-hover:bg-egmf-primary group-hover:text-white">
            <ClipboardCheck size={22} strokeWidth={2.1} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-muted-soft">
              Số phiếu kiểm
            </span>
            <span className="mt-1 block truncate text-[18px] font-extrabold leading-tight text-egmf-ink group-hover:text-egmf-primary-strong">
              {item.SoPhieuKiem || "—"}
            </span>
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-egmf-primary transition-transform group-hover:translate-x-0.5">
            <ChevronRight size={19} strokeWidth={2.3} />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">
          {details.map((detail) => (
            <Detail key={detail.label} {...detail} />
          ))}
        </div>

        <div className="border-t border-egmf-border-subtle bg-egmf-surface-soft px-4 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {references.map((reference) => (
              <Detail key={reference.label} compact {...reference} />
            ))}
          </div>
        </div>

        <div className="space-y-2.5 border-t border-egmf-border-subtle px-4 py-3.5">
          <MetaRow
            icon={UserRound}
            label="Nhân viên kiểm"
            value={item.NhanVienKiem}
          />
          <MetaRow
            icon={CalendarDays}
            label="Ngày kiểm vải"
            value={formatDateTime(item.NgayKiemVai)}
          />
          <MetaRow
            icon={Package}
            label="Ngày nhận vải"
            value={formatDateTime(item.NgayNhanVai)}
          />
        </div>
        <div className="border-t border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-4">
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-muted-soft">
            Thao tác phiếu
          </p>
          <button
            type="button"
            aria-label={`Xóa ${documentLabel.toLowerCase()} ${documentNumber}`}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl border border-red-200 bg-white px-4 text-[15px] font-extrabold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 active:translate-y-0 active:scale-[0.98]"
            onClick={(event) => {
              // Keep this action independent from the card's detail navigation.
              event.stopPropagation();
              setDeleteModalOpen(true);
            }}
          >
            <span className="grid size-8 place-items-center rounded-lg bg-red-100 text-red-600">
              <Trash2 size={18} strokeWidth={2.4} />
            </span>
            Xóa phiếu
          </button>
        </div>
      </article>

      <Modal
        centered
        closeIcon={null}
        footer={null}
        onCancel={() => !deleting && setDeleteModalOpen(false)}
        open={deleteModalOpen}
        width="min(440px, calc(100vw - 32px))"
        styles={{
          content: { overflow: "hidden", padding: 0, borderRadius: 20 },
          body: { padding: 0 },
        }}
      >
        <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
          <div className="flex items-start gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={24} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="m-0 text-lg font-extrabold text-egmf-ink">
                Xác nhận xóa phiếu
              </h2>
              <p className="m-0 mt-1 text-sm leading-5 text-egmf-muted">
                Thao tác này không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-red-500">
              {documentLabel}
            </p>
            <p className="m-0 mt-1.5 break-all text-base font-extrabold text-red-700">
              {documentNumber}
            </p>
          </div>

          <p className="m-0 mt-4 text-sm leading-5 text-egmf-ink-secondary">
            Bạn có chắc muốn xóa phiếu này không?
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
              className="min-h-12 rounded-xl border border-egmf-border bg-white px-5 text-[15px] font-bold text-egmf-ink-secondary transition-colors hover:border-egmf-primary hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="min-h-12 rounded-xl bg-red-600 px-5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Đang xóa..." : "Xóa phiếu"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Detail({ label, value, compact = false }) {
  return (
    <div className="min-w-0">
      <p className="m-0 truncate text-[12px] font-medium text-egmf-muted">
        {label}
      </p>
      <p
        className={`m-0 mt-1 truncate ${compact ? "text-[14px] font-semibold text-egmf-ink-secondary" : "text-[15px] font-bold text-egmf-ink"}`}
        title={value || ""}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 text-sm">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="shrink-0 text-egmf-muted">{label}:</span>
      <span className="min-w-0 truncate font-bold text-egmf-ink-secondary">
        {value || "—"}
      </span>
    </div>
  );
}
