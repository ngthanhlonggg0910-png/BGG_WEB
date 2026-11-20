import { useRef } from "react";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";

const ISO = "YYYY-MM-DD";
const DISPLAY = "DD/MM/YYYY";

// Khoảng thời gian hay dùng: một chạm là chọn xong, không cần mở lịch.
const PRESETS = [
  { key: "today", label: "Hôm nay", range: () => [dayjs(), dayjs()] },
  {
    key: "yesterday",
    label: "Hôm qua",
    range: () => [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
  },
  { key: "7d", label: "7 ngày", range: () => [dayjs().subtract(6, "day"), dayjs()] },
  { key: "30d", label: "30 ngày", range: () => [dayjs().subtract(29, "day"), dayjs()] },
  { key: "month", label: "Tháng này", range: () => [dayjs().startOf("month"), dayjs()] },
];

function sameDay(a, b) {
  return Boolean(a && b && dayjs(a).isSame(b, "day"));
}

function DateField({ label, value, min, max, onChange }) {
  const inputRef = useRef(null);
  const iso = value ? dayjs(value).format(ISO) : "";

  // Mở bộ chọn ngày của hệ điều hành khi chạm bất kỳ đâu trong ô.
  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-bold text-egmf-ink-secondary">{label}</span>
      <span className="relative flex h-11 items-center gap-2 rounded-lg border border-egmf-border bg-white px-3 transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
        <CalendarDays size={17} strokeWidth={2.2} className="shrink-0 text-egmf-primary" />
        {/* Luôn hiển thị dd/mm/yyyy, không phụ thuộc ngôn ngữ trình duyệt. */}
        <span
          aria-hidden="true"
          className={`truncate text-[15px] ${
            iso ? "font-semibold text-egmf-ink" : "font-medium text-egmf-placeholder"
          }`}
        >
          {iso ? dayjs(value).format(DISPLAY) : "dd/mm/yyyy"}
        </span>
        {/* Ô ngày gốc (trong suốt, phủ cả ô): trên điện thoại/tablet mở bộ chọn ngày của hệ điều hành. */}
        <input
          ref={inputRef}
          type="date"
          aria-label={label}
          value={iso}
          min={min ? dayjs(min).format(ISO) : undefined}
          max={max ? dayjs(max).format(ISO) : undefined}
          onClick={openPicker}
          onChange={(event) =>
            onChange(event.target.value ? dayjs(event.target.value) : null)
          }
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        />
      </span>
    </label>
  );
}

/**
 * Chọn khoảng ngày thân thiện cho điện thoại/tablet: nút chọn nhanh + ô ngày gốc
 * của hệ điều hành. `value` là [dayjs | null, dayjs | null].
 * `onPresetSelect(range)` được gọi thêm khi bấm nút chọn nhanh (ví dụ để lọc ngay).
 */
export default function DateRangeQuickPicker({ value, onChange, onPresetSelect }) {
  const [from, to] = value ?? [null, null];
  const activePreset = PRESETS.find((preset) => {
    const [presetFrom, presetTo] = preset.range();
    return sameDay(from, presetFrom) && sameDay(to, presetTo);
  })?.key;

  const setFrom = (date) => {
    // Giữ Từ ngày <= Đến ngày.
    onChange([date, date && to && dayjs(date).isAfter(to, "day") ? date : to]);
  };
  const setTo = (date) => {
    onChange([date && from && dayjs(date).isBefore(from, "day") ? date : from, date]);
  };

  return (
    <div>
      <div
        role="group"
        aria-label="Chọn nhanh khoảng thời gian"
        className="-mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PRESETS.map((preset) => {
          const active = preset.key === activePreset;
          return (
            <button
              key={preset.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                const range = preset.range();
                onChange(range);
                onPresetSelect?.(range);
              }}
              className={`h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 ${
                active
                  ? "border-egmf-primary bg-egmf-primary text-white shadow-egmf-primary-compact"
                  : "border-egmf-border bg-white text-egmf-ink-secondary hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <DateField label="Từ ngày" value={from} max={to} onChange={setFrom} />
        <DateField label="Đến ngày" value={to} min={from} onChange={setTo} />
      </div>
    </div>
  );
}
