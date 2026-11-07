import { Warehouse, ChevronRight, ArrowUpRight, UserRound } from "lucide-react";

export default function WarehouseCard({ code, name, keeper, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Xem chi tiết kho ${name || code}`}
      className="
        group flex w-full flex-col rounded-xl
        border border-egmf-border bg-white p-3 text-left
        transition-all duration-200
        hover:border-egmf-primary-border hover:bg-egmf-surface-subtle
        active:scale-[0.99] active:bg-egmf-primary-hover-soft
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-egmf-primary
        sm:p-3.5
      "
    >
      {/* HEADER */}
      <div className="flex w-full min-w-0 items-center gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-egmf-primary-soft text-egmf-primary transition-colors group-hover:bg-egmf-primary group-hover:text-white">
          <Warehouse size={21} strokeWidth={2.1} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Tên kho
          </p>

          <h3
            className="m-0 mt-0.5 line-clamp-2 text-base font-extrabold leading-5 text-slate-900 sm:text-[17px]"
            title={name}
          >
            {name || "Chưa có tên kho"}
          </h3>
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-egmf-primary-hover-soft text-egmf-primary transition-transform group-hover:translate-x-0.5">
          <ChevronRight size={19} strokeWidth={2.4} />
        </div>
      </div>

      {/* THÔNG TIN */}
      <div className="mt-3 w-full border-t border-slate-100 pt-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-bold text-slate-500">Mã kho</p>

            <p className="m-0 mt-0.5 break-all text-sm font-bold text-slate-800">
              {code || "—"}
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-egmf-primary">
            Xem chi tiết
            <ArrowUpRight size={15} />
          </span>
        </div>

        {/* THỦ KHO */}
        {keeper && (
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-egmf-surface-soft px-2.5 py-2">
            <UserRound size={16} className="shrink-0 text-egmf-primary" />

            <span className="text-xs font-medium text-slate-500">Thủ kho:</span>

            <span className="min-w-0 truncate text-sm font-bold text-slate-800">
              {keeper}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
