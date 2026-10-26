import Icon from "./Icon";
import { CheckCircle2, Flashlight, LoaderCircle, ScanLine, ZoomIn } from "lucide-react";

function BarcodeScannerModal({
  cameraFeatures,
  error,
  onClose,
  open,
  scanStatus,
  setZoom,
  title,
  toggleTorch,
  torchOn,
  videoRef,
}) {
  if (!open) return null;

  const isProcessing = scanStatus === "processing";
  const isSuccess = scanStatus === "success";
  const isStarting = scanStatus === "starting";
  const isConfirming = scanStatus === "confirming";
  const isPaused = scanStatus === "paused";
  const zoom = cameraFeatures?.zoom;

  return (
    <div
      aria-labelledby="scanner-title"
      aria-modal="true"
      className="egmf-dialog-overlay fixed inset-0 z-50 flex items-end justify-center bg-egmf-ink/70 sm:items-center sm:p-4"
      role="dialog"
    >
      <div className="egmf-dialog-panel max-h-[90dvh] overflow-y-auto w-full rounded-t-[28px] bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-egmf-primary">
              QUÉT MÃ
            </p>
            <h2 className="mt-1 text-lg font-bold text-egmf-ink" id="scanner-title">
              {title}
            </h2>
          </div>
          <button
            aria-label="Đóng camera"
            className="grid size-11 place-items-center rounded-2xl bg-egmf-surface-tint text-egmf-ink-soft transition hover:bg-egmf-primary-soft hover:text-egmf-primary-strong"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-black sm:aspect-video">
          <video
            autoPlay
            className="size-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[13%_10%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]"
          >
            <span className="absolute -left-0.5 -top-0.5 size-7 rounded-tl-xl border-l-4 border-t-4 border-egmf-primary" />
            <span className="absolute -right-0.5 -top-0.5 size-7 rounded-tr-xl border-r-4 border-t-4 border-egmf-primary" />
            <span className="absolute -bottom-0.5 -left-0.5 size-7 rounded-bl-xl border-b-4 border-l-4 border-egmf-primary" />
            <span className="absolute -bottom-0.5 -right-0.5 size-7 rounded-br-xl border-b-4 border-r-4 border-egmf-primary" />
          </div>

          {!error && (
            <div className="absolute inset-x-3 top-3 flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {isStarting || isConfirming || isProcessing ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 size={15} className="text-emerald-300" />
                ) : (
                  <ScanLine size={15} className="text-egmf-primary-soft" />
                )}
                {isStarting
                  ? "Đang mở camera..."
                  : isConfirming
                    ? "Đang xác minh mã..."
                  : isProcessing
                    ? "Đang xử lý mã..."
                    : isSuccess
                      ? "Quét thành công"
                      : isPaused
                        ? "Đã tạm dừng camera"
                      : "Đang quét mã"}
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-5 text-center text-sm text-white">
              {error}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-egmf-surface-subtle px-3 py-2.5 text-sm leading-5 text-egmf-muted">
          <ScanLine size={17} className="mt-0.5 shrink-0 text-egmf-primary" />
          <p className="m-0">
            Đưa mã vào trong khung, giữ chắc máy. Nếu mã nhỏ hoặc thiếu sáng,
            hãy đưa máy gần hơn, dùng zoom hoặc bật đèn flash.
          </p>
        </div>

        {(cameraFeatures?.torch || zoom) && (
          <div className="mt-3 flex items-center gap-2">
            {cameraFeatures?.torch && (
              <button
                aria-pressed={torchOn}
                className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 ${
                  torchOn
                    ? "bg-egmf-primary text-white shadow-egmf-primary-compact"
                    : "border border-egmf-border bg-white text-egmf-ink-secondary hover:bg-egmf-primary-tint"
                }`}
                onClick={toggleTorch}
                type="button"
              >
                <Flashlight size={18} />
                <span>Flash</span>
              </button>
            )}

            {zoom && (
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-egmf-border bg-white px-3 text-egmf-ink-secondary">
                <ZoomIn size={18} className="shrink-0 text-egmf-primary" />
                <input
                  aria-label="Mức phóng to camera"
                  className="h-2 min-w-0 flex-1 cursor-pointer accent-egmf-primary"
                  disabled={isProcessing || isSuccess}
                  max={zoom.max}
                  min={zoom.min}
                  onChange={(event) => setZoom(event.target.value)}
                  step={zoom.step}
                  type="range"
                  value={zoom.value}
                />
                <span className="w-8 text-right text-xs font-bold tabular-nums">
                  {Number(zoom.value).toFixed(1)}×
                </span>
              </label>
            )}
          </div>
        )}

        <p className="mt-3 text-center text-xs leading-5 text-egmf-muted">
          Flash, zoom và lấy nét liên tục chỉ hiển thị khi camera hỗ trợ.
        </p>
        <button
          className="mt-4 h-12 w-full rounded-2xl border border-egmf-border font-semibold text-egmf-ink-soft transition hover:bg-egmf-surface-tint"
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
