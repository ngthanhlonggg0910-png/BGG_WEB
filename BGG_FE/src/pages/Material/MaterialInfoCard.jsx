import { useState } from "react";
import { Card } from "antd";
import { Package, Layers3, MapPin, ChevronDown } from "lucide-react";

function MaterialInfoCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  const formatText = (value) =>
    String(value ?? "")
      .replace(/\r\n|\n\r|\r/g, "\n")
      .trim();

  if (!item) return null;

  return (
    <Card
      className="!overflow-hidden !rounded-2xl !border-[#DDD9F5] !shadow-none"
      styles={{ body: { padding: 0 } }}
    >
      {/* CẤP CHA - MÃ RỌ */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className={`
          flex w-full items-center gap-3
          px-4 py-3.5 text-left
          transition-colors duration-200
          hover:bg-[#F5F4FF]
          active:bg-[#E9E8FB]
          sm:px-5
          ${expanded ? "bg-[#F2F0FF]" : "bg-white"}
        `}
      >
        {/* ICON */}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6865D9] text-white">
          <Package size={23} />
        </span>

        {/* MÃ RỌ */}
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Mã rọ / Palet
          </span>

          <span className="mt-1 block break-all text-[18px] font-extrabold leading-snug text-slate-900 sm:text-[20px]">
            {item.MaRo || "—"}
          </span>
        </span>

        {/* MŨI TÊN */}
        <span
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-lg bg-white text-[#6865D9]
            transition-transform duration-200
            ${expanded ? "rotate-180" : ""}
          `}
        >
          <ChevronDown size={22} />
        </span>
      </button>

      {/* CẤP CON - THÔNG TIN CHI TIẾT */}
      {expanded && (
        <div className="border-t border-[#DDD9F5] bg-white px-4 py-4 sm:px-5">
          <div className="space-y-4 border-l-2 border-[#DDD9F5] pl-4">
            {/* THÔNG TIN VẬT TƯ */}
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E9E8FB] text-[#6865D9]">
                <Layers3 size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">
                  Thông tin vật tư
                </p>

                <p className="m-0 mt-1 whitespace-pre-line break-words text-[16px] font-semibold leading-7 text-slate-900">
                  {formatText(item.TenRo) || "—"}
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* VỊ TRÍ */}
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#15803D]">
                <MapPin size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">
                  Vị trí hiện tại
                </p>

                <p className="m-0 mt-1 whitespace-pre-line break-words text-[16px] font-bold leading-7 text-[#15803D]">
                  {formatText(item.TenViTri) || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default MaterialInfoCard;
