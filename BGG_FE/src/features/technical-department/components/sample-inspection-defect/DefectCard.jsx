import { Pencil, Trash2 } from "lucide-react";

const severityStyles = {
  NHẸ: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  NẶNG: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  "NGHIÊM TRỌNG": "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export default function DefectCard({ defect, onEdit, onDelete }) {
  const severityClass = severityStyles[defect.severity] || "bg-slate-100 text-slate-700";

  return (
    <article className="rounded-xl border border-egmf-border bg-white p-3.5 shadow-sm transition hover:border-egmf-primary-border hover:shadow-egmf-card sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 break-words text-[15px] font-extrabold text-egmf-ink">
            {defect.defectName}
          </h2>
          <p className="m-0 mt-1 break-words text-xs font-medium text-egmf-muted">
            {[defect.defectPosition, defect.defectGroup].filter(Boolean).join(" · ") || "Chưa cập nhật vị trí / cụm lỗi"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <IconButton label="Sửa lỗi" onClick={onEdit} tone="primary">
            <Pencil size={16} />
          </IconButton>
          <IconButton label="Xóa lỗi" onClick={onDelete} tone="danger">
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-egmf-border-subtle pt-3 text-sm sm:grid-cols-4">
        <InfoItem label="Mức độ">
          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${severityClass}`}>
            {defect.severity || "—"}
          </span>
        </InfoItem>
        <InfoItem label="Số lượng">{defect.quantity ?? "—"}</InfoItem>
        <InfoItem label="Hướng xử lý" className="col-span-2 sm:col-span-1">
          {defect.handlingMethod || "—"}
        </InfoItem>
        {defect.finalResult && (
          <InfoItem label="Kết quả cuối" className="col-span-2 sm:col-span-1">
            <span className="font-extrabold text-emerald-700">{defect.finalResult}</span>
          </InfoItem>
        )}
      </dl>

      {defect.note && (
        <p className="m-0 mt-3 rounded-lg bg-egmf-surface-subtle px-3 py-2 text-xs leading-5 text-egmf-ink-secondary">
          <span className="font-bold text-egmf-muted">Ghi chú: </span>
          {defect.note}
        </p>
      )}
    </article>
  );
}

function InfoItem({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[11px] font-bold text-egmf-muted">{label}</dt>
      <dd className="m-0 mt-1 break-words font-semibold text-egmf-ink-secondary">{children}</dd>
    </div>
  );
}

function IconButton({ label, onClick, tone, children }) {
  const toneClass =
    tone === "danger"
      ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      : "text-egmf-primary hover:bg-egmf-primary-tint hover:text-egmf-primary-strong";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 ${toneClass}`}
    >
      {children}
    </button>
  );
}
