import { AlertTriangle, Info, Layers3, Save, X } from "lucide-react";
import { formatNumber } from "../../../../shared/utils/formatNumber";

export default function FabricSplicingResult({
  mode,
  result = {},
  remainderChoice,
  onChooseRemainder,
  onSave,
  saving = false,
  onReset,
}) {
  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
        <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
              <Layers3 size={17} strokeWidth={2.3} />
            </span>
            <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
              Kết quả
            </h2>
          </div>
          <span className="text-xs font-medium text-egmf-ink-secondary">
            Tự cập nhật
          </span>
        </header>

        <div className="grid grid-cols-2 gap-2 p-3 sm:p-4">
          <ResultCard
            label="Tiêu hao thực tế"
            value={result.tieuHaoThucTe}
            tone="primary"
          />
          <ResultCard label="Còn lại" value={result.conLai} tone="success" />
          <ResultCard
            label="Thu hồi"
            value={result.tongThuHoi}
            tone="neutral"
          />
          <ResultCard label="Thừa" value={result.thua} tone="warning" />
        </div>

        {result.vuotDinhMuc && (
          <div className="mx-3 mb-3 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold leading-5 text-rose-700 sm:mx-4 sm:mb-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Tiêu hao vượt mức cho phép {formatNumber(result.phanTram)}% của cây
            vải.
          </div>
        )}

        {result.canChonXuLyConLai && (
          <div className="mx-3 mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:mx-4 sm:mb-4">
            <div className="flex gap-2 text-xs font-semibold leading-5 text-amber-800">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p className="m-0">
                Còn {formatNumber(result.conLai)} m. Hãy xác nhận phần vải này
                là nguyên cây hay thiếu vải.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChooseRemainder?.("NGUYEN_CAY")}
                className={`rounded-lg border px-3 py-2 text-sm font-extrabold transition ${
                  remainderChoice === "NGUYEN_CAY"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Nguyên cây
              </button>
              <button
                type="button"
                onClick={() => onChooseRemainder?.("THIEU")}
                className={`rounded-lg border px-3 py-2 text-sm font-extrabold transition ${
                  remainderChoice === "THIEU"
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
                }`}
              >
                Thiếu vải
              </button>
            </div>
          </div>
        )}

        {result.thieu > 0 && (
          <div className="mx-3 mb-3 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold leading-5 text-rose-700 sm:mx-4 sm:mb-4">
            <Info size={16} className="mt-0.5 shrink-0" />
            Xử lý thiếu vải: {formatNumber(result.thieu)} m.
          </div>
        )}

        {result.nguyenCay > 0 && (
          <div className="mx-3 mb-3 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold leading-5 text-emerald-700 sm:mx-4 sm:mb-4">
            <Info size={16} className="mt-0.5 shrink-0" />
            Ghi nhận nguyên cây: {formatNumber(result.nguyenCay)} m.
          </div>
        )}
      </section>

      <div className="grid grid-cols-[1fr_3rem] gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || result.vuotDinhMuc || result.batBuocChon}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(5,150,105,.18)] transition hover:bg-emerald-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={19} strokeWidth={2.4} />
          {mode === "THEM_CAY_NOI" ? "Lưu cây nối" : "Lưu cây gốc"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex h-12 items-center justify-center rounded-xl border border-egmf-border bg-white text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
          aria-label="Hủy số liệu"
          title="Hủy số liệu"
        >
          <X size={19} strokeWidth={2.4} />
        </button>
      </div>
    </>
  );
}

function ResultCard({ label, value, tone }) {
  const styles = {
    primary: "border-egmf-primary/15 bg-egmf-primary-soft text-egmf-primary",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <div className={`min-w-0 rounded-xl border p-2.5 ${styles[tone]}`}>
      <p className="m-0 text-xs font-bold leading-4 text-egmf-ink-secondary">
        {label}
      </p>
      <p className="m-0 mt-1 truncate text-lg font-extrabold tracking-tight">
        {formatNumber(value)} <span className="text-xs font-bold">m</span>
      </p>
    </div>
  );
}
