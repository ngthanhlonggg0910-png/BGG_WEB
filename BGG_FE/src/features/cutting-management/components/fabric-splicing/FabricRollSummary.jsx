export default function FabricRollSummary({ form, fabricRoll, receiptNumber }) {
  const displayValue = (value) =>
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
      ? "-"
      : value;

  const details = [
    ["Mã cây", fabricRoll?.MaCay],
    ["Lệnh sản xuất", fabricRoll?.ProductionOrderNo],
    ["Màu / Lot", fabricRoll?.MauLot],
    ["Màu vải hoạch toán", form?.mauVaiHoachToan],
    ["Item", fabricRoll?.Item],
    ["Màu SP", form?.mauSP],
    ["Ảnh màu", fabricRoll?.AnhMau],
    ["PO hoạch toán", form?.po],
    ["Chủng loại", form?.chungLoai],
  ];
  return (
    <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
      <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-gradient-to-r from-egmf-primary-soft via-white to-white px-4 py-3">
        <h2 className="m-0 min-w-0 truncate text-lg font-extrabold tracking-tight text-egmf-ink sm:text-xl">
          {displayValue(fabricRoll?.MaCay)}
        </h2>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-egmf-primary shadow-sm ring-1 ring-egmf-primary/10">
          {`PHT_ID: ${displayValue(receiptNumber)}`}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-3 sm:p-3">
        {details.map(([label, value]) => {
          const displayedValue = displayValue(value);

          return (
            <div
              key={label}
              className="min-w-0 rounded-lg bg-egmf-surface-subtle px-2.5 py-2"
            >
              <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                {label}
              </dt>
              <dd
                className="m-0 mt-0.5 truncate text-sm font-extrabold text-egmf-ink"
                title={String(displayedValue)}
              >
                {displayedValue}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
