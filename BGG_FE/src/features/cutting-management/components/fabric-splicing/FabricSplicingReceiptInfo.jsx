import { FileText } from "lucide-react";

export default function FabricSplicingReceiptInfo({ receipt }) {
  const details = [
    ["Màu vải", receipt?.mauVaiHoachToan],
    ["Màu sản phẩm", receipt?.mauSP],
    ["PO", receipt?.po],
    ["Chủng loại", receipt?.chungLoai],
  ];
  return (
    <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
      <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
            <FileText size={17} strokeWidth={2.3} />
          </span>
          <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
            Thông tin phiếu
          </h2>
        </div>
        <span className="text-xs font-bold text-egmf-primary">
          {receipt?.SoPhieu ?? receipt?.maPhieu}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-x-3 px-3 sm:px-4">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0 py-2.5 text-sm">
            <dt className="truncate text-xs font-medium text-egmf-ink-secondary">
              {label}
            </dt>
            <dd
              className="m-0 mt-0.5 truncate font-extrabold text-egmf-ink"
              title={value}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
