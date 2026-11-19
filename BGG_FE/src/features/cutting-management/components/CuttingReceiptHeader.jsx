import Barcode from "react-barcode";
import { Scissors } from "lucide-react";

export default function CuttingReceiptHeader({ receiptNumber }) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm`}
    >
      <div className="flex flex-col items-center border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2.5 text-center">
        {receiptNumber ? (
          <div className="flex h-14 max-w-full items-center justify-center overflow-hidden">
            <Barcode
              value={String(receiptNumber)}
              format="CODE128"
              width={1.8}
              height={46}
              margin={0}
              displayValue={false}
            />
          </div>
        ) : (
          <span className="grid size-11 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
            <Scissors size={22} />
          </span>
        )}
        <h1 className="m-0 mt-1 break-all text-lg font-extrabold tracking-wide text-egmf-ink">
          {receiptNumber || "—"}
        </h1>
      </div>
    </section>
  );
}
