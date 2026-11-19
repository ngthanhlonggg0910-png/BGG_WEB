import { Calculator, RotateCcw } from "lucide-react";
import { formatNumber } from "../../../../shared/utils/formatNumber";

export default function FabricSplicingForm({
  recoveryValues,
  spreadLength,
  totalRecovery,
  onRecoveryChange,
  onReset,
  onSpreadLengthChange,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
      <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
            <Calculator size={17} strokeWidth={2.4} />
          </span>
          <h2 className="m-0 text-sm font-extrabold text-egmf-ink">Hạch toán</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex size-9 items-center justify-center rounded-lg text-egmf-primary transition hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
          title="Đặt lại số liệu"
          aria-label="Đặt lại số liệu"
        >
          <RotateCcw size={17} strokeWidth={2.3} />
        </button>
      </header>

      <div className="space-y-3 p-3 sm:p-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-egmf-ink-secondary">Số mét trải</span>
          <span className="flex h-11 overflow-hidden rounded-xl border border-egmf-border bg-white transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/15">
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={spreadLength}
              onChange={(event) => onSpreadLengthChange(event.target.value)}
              aria-label="Số mét trải"
              className="min-w-0 flex-1 bg-transparent px-3 text-base font-extrabold text-egmf-ink outline-none"
            />
            <span className="flex w-12 items-center justify-center border-l border-egmf-border bg-egmf-surface-subtle text-sm font-bold text-egmf-ink-secondary">
              m
            </span>
          </span>
        </label>

        <fieldset>
          <legend className="mb-1 text-xs font-bold text-egmf-ink-secondary">Thu hồi (m)</legend>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {recoveryValues.map((value, index) => (
              <input
                key={index}
                type="number"
                min="0"
                max="50"
                step="0.01"
                inputMode="decimal"
                value={value}
                onChange={(event) => onRecoveryChange(index, event.target.value)}
                aria-label={`Vải thu hồi đoạn ${index + 1}`}
                placeholder="0"
                className="h-10 min-w-0 rounded-lg border border-egmf-border bg-egmf-surface-subtle px-1 text-center text-sm font-bold text-egmf-ink outline-none transition placeholder:font-medium placeholder:text-egmf-placeholder focus:border-egmf-primary focus:bg-white focus:ring-4 focus:ring-egmf-primary/15"
              />
            ))}
          </div>
        </fieldset>

        <p className="m-0 text-right text-xs font-medium text-egmf-ink-secondary">
          Tổng thu hồi: <strong className="text-egmf-ink">{formatNumber(totalRecovery)} m</strong>
        </p>
      </div>
    </section>
  );
}
