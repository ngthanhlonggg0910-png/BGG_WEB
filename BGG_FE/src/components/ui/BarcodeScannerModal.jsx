import Icon from "./Icon";

function BarcodeScannerModal({ error, onClose, open, title, videoRef }) {
  if (!open) return null;

  return (
    <div
      aria-labelledby="scanner-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#252530]/70 sm:items-center sm:p-4"
      role="dialog"
    >
      <div className="w-full overflow-hidden rounded-t-[28px] bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-[#6865D9]">
              QUÉT BARCODE
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#252530]" id="scanner-title">
              {title}
            </h2>
          </div>
          <button
            aria-label="Đóng camera"
            className="grid size-11 place-items-center rounded-2xl bg-[#f3f2fd] text-[#5e5d69] transition hover:bg-[#E9E8FB] hover:text-[#5653C5]"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-[18px] bg-black sm:aspect-video">
          <video
            autoPlay
            className="size-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-5 text-center text-sm text-white">
              {error}
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-sm leading-6 text-[#74747f]">
          Đưa mã vào giữa khung để quét tự động.
        </p>
        <button
          className="mt-4 h-12 w-full rounded-2xl border border-[#e1e1ec] font-semibold text-[#5e5d69] transition hover:bg-[#f7f7fb]"
          onClick={onClose}
          type="button"
        >
          Hủy quét
        </button>
      </div>
    </div>
  );
}

export default BarcodeScannerModal;
