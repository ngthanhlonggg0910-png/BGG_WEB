import { Camera, ImagePlus } from "lucide-react";

export default function DefectImageField({
  preview,
  cameraInputRef,
  imageInputRef,
  onImageChange,
  onRemove,
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-xs font-bold text-egmf-ink-secondary">
          Ảnh lỗi <span className="font-medium text-egmf-muted">(không bắt buộc)</span>
        </p>
        {preview && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold text-rose-600 transition hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
          >
            Xóa ảnh
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

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-egmf-primary-border-soft bg-white px-2 text-xs font-bold text-egmf-primary transition hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
        >
          <Camera size={16} />
          Chụp ảnh
        </button>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-egmf-border bg-white px-2 text-xs font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
        >
          <ImagePlus size={16} />
          Chọn ảnh
        </button>
      </div>

      <div className="mt-1.5 flex min-h-20 overflow-hidden rounded-xl border border-dashed border-egmf-border bg-egmf-surface-subtle">
        {preview ? (
          <img
            src={preview}
            alt="Ảnh lỗi xem trước"
            className="h-20 w-full object-cover"
          />
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-1 px-3 text-center text-egmf-muted">
            <ImagePlus size={20} strokeWidth={1.8} />
            <span className="text-xs font-medium">Chưa chọn ảnh lỗi</span>
          </div>
        )}
      </div>
    </div>
  );
}
