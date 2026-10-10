import { Warehouse, ChevronRight, ArrowUpRight, UserRound } from "lucide-react";

export default function WarehouseCard({ code, name, keeper, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Xem chi tiết kho ${name || code}`}
      className="
        group flex w-full flex-col rounded-2xl
        border border-[#E1E0ED] bg-white p-4 text-left
        transition-all duration-200
        hover:border-[#BDBAF0] hover:bg-[#FCFBFF]
        active:scale-[0.99] active:bg-[#F5F4FF]
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[#6865D9]
        sm:p-5
      "
    >
      {/* HEADER */}
      <div className="flex w-full min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E9E8FB] text-[#6865D9] transition-colors group-hover:bg-[#6865D9] group-hover:text-white">
          <Warehouse size={25} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tên kho
          </p>

          <h3
            className="m-0 mt-1 line-clamp-2 text-[18px] font-extrabold leading-6 text-slate-900"
            title={name}
          >
            {name || "Chưa có tên kho"}
          </h3>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F4FF] text-[#6865D9] transition-transform group-hover:translate-x-0.5">
          <ChevronRight size={22} strokeWidth={2.4} />
        </div>
      </div>

      {/* THÔNG TIN */}
      <div className="mt-4 w-full border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-xs font-medium text-slate-500">Mã kho</p>

            <p className="m-0 mt-1 break-all text-[16px] font-bold text-slate-800">
              {code || "—"}
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-bold text-[#6865D9]">
            Xem chi tiết
            <ArrowUpRight size={17} />
          </span>
        </div>

        {/* THỦ KHO */}
        {keeper && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F8F8FC] px-3 py-2.5">
            <UserRound size={17} className="shrink-0 text-[#6865D9]" />

            <span className="text-sm font-medium text-slate-500">Thủ kho:</span>

            <span className="min-w-0 truncate text-sm font-bold text-slate-800">
              {keeper}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
