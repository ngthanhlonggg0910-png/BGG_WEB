import {
  Clock3,
  ImageOff,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";

import { layAnhKiemMau } from "../../api/technical-department.api";
import { formatDateTime } from "../../../../shared/utils/formatDateTime";

const severityStyles = {
  NHẸ: "border-emerald-100 bg-emerald-50 text-emerald-700",
  "TRUNG BÌNH": "border-amber-100 bg-amber-50 text-amber-700",
  NẶNG: "border-orange-100 bg-orange-50 text-orange-700",
  "NGHIÊM TRỌNG": "border-rose-100 bg-rose-50 text-rose-700",
};

export default function DefectCard({ defect, onEdit, onDelete }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const {
    TenLoi: name = "Chưa xác định lỗi",
    MaLoi: code,
    ViTriLoi: position,
    CumLoi: group,
    MucDoNghiemTrong: severity = "—",
    SL: quantity = "—",
    BienPhapXuLy: handlingMethod = "—",
    GhiChu: note,
    KetQuaCuoi: finalResult,
    NguoiKhaiBao: reporter,
    ThoiGianKhaiBao: reportedAt,
    ImagePath: imagePath,
  } = defect;
  const severityClass =
    severityStyles[severity] ?? "border-slate-200 bg-slate-50 text-slate-600";
  const imageUrl = layAnhKiemMau(imagePath);
  const hasImage = Boolean(imageUrl);
  const openImageModal = () => setIsImageModalOpen(true);

  return (
    <>
      <article
        className={`overflow-hidden rounded-xl border border-egmf-border bg-white shadow-sm transition hover:border-egmf-primary-border hover:shadow-egmf-card ${"cursor-pointer"}`}
        onClick={openImageModal}
        onKeyDown={(event) => {
          if (["Enter", " "].includes(event.key)) {
            event.preventDefault();
            openImageModal();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Xem ảnh lỗi ${name}`}
      >
        <div className="p-3.5 sm:p-4">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="m-0 break-words text-[15px] font-extrabold leading-5 text-egmf-ink">
                {name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-egmf-muted">
                {code && <span className="font-bold">{code}</span>}
                {(position || group) && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin size={13} className="shrink-0 text-egmf-primary" />
                    <span className="truncate">
                      {[position, group].filter(Boolean).join(" • ")}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-[10px] font-extrabold ${severityClass}`}
              >
                {severity}
              </span>
            </div>
          </header>

          <dl className="mt-3 grid grid-cols-2 divide-x divide-egmf-border-subtle rounded-lg bg-egmf-surface-subtle text-sm">
            <InfoItem label="Số lượng">{quantity}</InfoItem>
            <InfoItem label="Xử lý">{handlingMethod}</InfoItem>
          </dl>

          <section
            className="mt-3 border-l-4 border-emerald-400 bg-emerald-50/70 px-3 py-2.5"
            aria-label="Kết quả cuối"
          >
            <h3 className="m-0 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
              Kết quả cuối
            </h3>
            <p
              className={`m-0 mt-1 whitespace-pre-wrap break-words text-sm leading-5 ${finalResult ? "font-semibold text-egmf-ink" : "italic text-egmf-muted"}`}
            >
              {finalResult || "Chưa cập nhật"}
            </p>
          </section>

          {note && (
            <p className="m-0 mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-egmf-ink-secondary">
              <span className="font-bold text-egmf-muted">Ghi chú: </span>
              {note}
            </p>
          )}

          {(reporter || reportedAt) && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-egmf-border-subtle pt-2.5 text-xs text-egmf-muted">
              {reporter && (
                <span className="inline-flex items-center gap-1">
                  <UserRound size={13} />
                  {reporter}
                </span>
              )}
              {reportedAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} />
                  {formatDateTime(reportedAt)}
                </span>
              )}
            </div>
          )}
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-3.5 py-2.5 sm:px-4 sm:py-2">
          <ActionButton label="Sửa" onClick={onEdit} tone="primary">
            <Pencil size={14} />
          </ActionButton>
          <ActionButton label="Xóa" onClick={onDelete} tone="danger">
            <Trash2 size={14} />
          </ActionButton>
        </footer>
      </article>

      <DefectImagePreviewModal
        isOpen={isImageModalOpen}
        image={imageUrl}
        hasImage={hasImage}
        defectName={name}
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
}

function InfoItem({ label, children }) {
  return (
    <div className="min-w-0 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-egmf-muted">
        {label}
      </dt>
      <dd className="m-0 mt-0.5 break-words text-sm font-bold text-egmf-ink-secondary">
        {children}
      </dd>
    </div>
  );
}

function ActionButton({ label, onClick, tone, children }) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-100"
      : "border-egmf-primary-border-soft bg-white text-egmf-primary hover:bg-egmf-primary-tint focus-visible:ring-egmf-primary/15";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      disabled={!onClick}
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 sm:h-8 sm:min-h-8 sm:gap-1.5 sm:rounded-md sm:px-2.5 sm:text-xs ${toneClass}`}
    >
      {children}
      {label}
    </button>
  );
}

function DefectImagePreviewModal({
  isOpen,
  image,
  hasImage,
  defectName,
  onClose,
}) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const closeModal = () => {
    setIsZoomed(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-sm sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="defect-image-preview-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id="defect-image-preview-title"
              className="m-0 truncate text-base font-extrabold text-egmf-ink"
            >
              Ảnh lỗi
            </h2>
            <p className="m-0 mt-0.5 truncate text-xs font-medium text-egmf-muted">
              {defectName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {hasImage && (
              <button
                type="button"
                onClick={() => setIsZoomed((current) => !current)}
                aria-label={isZoomed ? "Thu nhỏ ảnh" : "Phóng to ảnh"}
                title={isZoomed ? "Thu nhỏ ảnh" : "Phóng to ảnh"}
                className="grid size-11 place-items-center rounded-xl text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
              >
                {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
              </button>
            )}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Đóng xem ảnh lỗi"
              className="grid size-11 place-items-center rounded-xl text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
            >
              <X size={21} />
            </button>
          </div>
        </header>

        <div className="flex max-h-[calc(100dvh-6.5rem)] items-center justify-center overflow-auto bg-white p-2 sm:max-h-[calc(100dvh-8rem)] sm:p-4">
          {!hasImage || hasLoadError ? (
            <div className="flex min-h-52 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-5 py-8 text-center text-egmf-muted">
              <span className="grid size-14 place-items-center rounded-2xl bg-white text-egmf-primary shadow-sm ring-1 ring-egmf-primary/10">
                <ImageOff size={28} />
              </span>
              <p className="m-0 text-base font-extrabold text-egmf-ink-secondary">
                {hasImage ? "Không tải được ảnh lỗi" : "Chưa có ảnh lỗi"}
              </p>
              <p className="m-0 text-sm leading-5">
                Ảnh kiểm mẫu sẽ hiển thị tại đây khi có dữ liệu.
              </p>
            </div>
          ) : (
            <img
              src={image}
              alt={`Ảnh lỗi ${defectName}`}
              onError={() => setHasLoadError(true)}
              onClick={() => setIsZoomed((current) => !current)}
              className={`h-auto max-h-[calc(100dvh-7rem)] rounded-lg object-contain shadow-sm transition-transform sm:max-h-[calc(100dvh-9rem)] ${
                isZoomed
                  ? "w-[170%] max-w-none cursor-zoom-out"
                  : "w-full max-w-full cursor-zoom-in"
              }`}
            />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
