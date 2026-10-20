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
      className="!overflow-hidden !rounded-2xl !border-egmf-border-blue !shadow-none"
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
          hover:bg-egmf-primary-hover-soft
          active:bg-egmf-primary-soft
          sm:px-5
          ${expanded ? "bg-egmf-primary-soft" : "bg-white"}
        `}
      >
        {/* ICON */}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-egmf-primary text-white">
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
            rounded-lg bg-white text-egmf-primary
            transition-transform duration-200
            ${expanded ? "rotate-180" : ""}
          `}
        >
          <ChevronDown size={22} />
        </span>
      </button>

      {/* CẤP CON - THÔNG TIN CHI TIẾT */}
      {expanded && (
        <div className="border-t border-egmf-border-blue bg-white px-4 py-4 sm:px-5">
          <div className="space-y-4 border-l-2 border-egmf-border-blue pl-4">
            {/* THÔNG TIN VẬT TƯ */}
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-egmf-success-soft text-egmf-success">
                <MapPin size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">
                  Vị trí hiện tại
                </p>

                <p className="m-0 mt-1 whitespace-pre-line break-words text-[16px] font-bold leading-7 text-egmf-success">
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
