import { Camera, ImagePlus, RotateCcw, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";

export default function DefectImageField({
  preview,
  hasNewImage,
  hasExistingImage,
  isExistingImageRemoved,
  cameraInputRef,
  imageInputRef,
  onImageChange,
  onRemoveNewImage,
  onRemoveExistingImage,
  onRestoreExistingImage,
  disabled = false,
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleRemove = () => {
    if (hasNewImage) {
      onRemoveNewImage?.();
      return;
    }

    if (hasExistingImage && !isExistingImageRemoved) {
      if (window.confirm("Bạn có muốn xóa ảnh lỗi hiện tại khi lưu không?")) {
        onRemoveExistingImage?.();
      }
    }
  };

  const removeLabel = hasNewImage ? "Bỏ ảnh mới" : "Xóa ảnh";

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-xs font-bold text-egmf-ink-secondary">Ảnh lỗi</p>
        {(preview || isExistingImageRemoved) && (
          <button
            type="button"
            disabled={disabled}
            onClick={
              isExistingImageRemoved
                ? onRestoreExistingImage
                : handleRemove
            }
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-extrabold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExistingImageRemoved ? (
              <RotateCcw size={17} strokeWidth={2.4} />
            ) : (
              <Trash2 size={17} strokeWidth={2.4} />
            )}
            {isExistingImageRemoved ? "Giữ lại ảnh" : removeLabel}
          </button>
        )}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onImageChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onImageChange}
      />

      <div
        className={`mt-2 overflow-hidden rounded-xl border ${
          preview
            ? "border-egmf-border bg-egmf-surface-subtle"
            : "border-dashed border-egmf-primary-border-soft bg-egmf-primary-soft/35"
        }`}
      >
        {preview ? (
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="relative block aspect-[16/9] min-h-36 w-full bg-egmf-surface-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
            aria-label="Xem ảnh lỗi kích thước lớn"
          >
            <img
              src={preview}
              alt="Ảnh lỗi xem trước"
              className="size-full object-contain"
            />
          </button>
        ) : (
          <div className="flex aspect-[16/9] min-h-36 flex-col items-center justify-center gap-2 px-4 text-center text-egmf-muted">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-egmf-primary shadow-sm">
              <ImagePlus size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="m-0 text-sm font-bold text-egmf-ink-secondary">
                Chưa có ảnh lỗi
              </p>
              <p className="m-0 mt-0.5 text-xs">Chụp ảnh hoặc chọn từ thư viện</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => cameraInputRef.current?.click()}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-egmf-primary-border-soft bg-egmf-primary-soft px-2 text-sm font-bold text-egmf-primary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera size={17} />
          Chụp ảnh
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => imageInputRef.current?.click()}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-2 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus size={17} />
          Chọn ảnh
        </button>
      </div>

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        preview={preview}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}

function ImagePreviewModal({ isOpen, preview, onClose }) {
  if (!isOpen || !preview) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Xem ảnh lỗi"
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl items-center justify-center rounded-2xl bg-white p-3 shadow-2xl sm:p-5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng ảnh lỗi"
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-xl bg-white text-egmf-muted shadow-sm transition hover:bg-egmf-surface-subtle hover:text-egmf-ink"
        >
          <X size={20} />
        </button>
        <img
          src={preview}
          alt="Ảnh lỗi kích thước lớn"
          className="max-h-[calc(100dvh-4rem)] w-auto max-w-full rounded-xl object-contain"
        />
      </section>
    </div>,
    document.body,
  );
}
