import { MapPin } from "lucide-react";
import { formatNumber } from "../../../shared/utils/formatNumber";

// Giữ nguyên hàm parseDienGiai(value) hiện tại ở đây.
// Phân tích chuỗi DienGiai
function parseDienGiai(value) {
  const text = String(value ?? "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const firstLan = text.search(/-?\s*Lần\s*\d+\s*:/i);
  const firstLocation = text.search(/Nơi\s*để\s*:/i);

  const endName = [firstLan, firstLocation]
    .filter((pos) => pos >= 0)
    .reduce((a, b) => Math.min(a, b), text.length);

  const name = text
    .slice(0, endName)
    .replace(/\s*-\s*$/, "")
    .trim();

  const details = [];

  const regex =
    /-?\s*Lần\s*(\d+)\s*:\s*([\d.,]+)\s*\+\s*PO\s*:\s*\[([^\]]+)\]\s*\/\s*([\d.,]+)/gi;

  for (const match of text.matchAll(regex)) {
    details.push({
      lan: Number(match[1]),
      soLuong: match[2],
      po: match[3].trim(),
    });
  }

  const locationMatch = text.match(/Nơi\s*để\s*:\s*\[([^\]]*)\]/i);

  return {
    name,
    details,
    location: locationMatch?.[1]?.trim() || "Chưa cập nhật",
  };
}

export default function PickingItemCard({ item, index }) {
  const { name, details, location } = parseDienGiai(item.DienGiai);

  const requested = Number(item.SoLuongYeuCau) || 0;
  const picked = Number(item.SoLuongThucSoan) || 0;

  return (
    <>
      <tr className="border-y border-egmf-primary-border bg-egmf-primary-tint text-egmf-ink">
        <td className="whitespace-nowrap px-2 py-2 text-center text-sm font-extrabold">
          STT
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-center text-sm font-extrabold">
          Tên hàng
        </td>
        <td className="whitespace-nowrap px-1 py-2 text-center text-sm font-extrabold">
          Đặt hàng
        </td>
        <td className="whitespace-nowrap px-1 py-2 text-center text-sm font-extrabold">
          Soạn hàng
        </td>
      </tr>

      <tr className="border-b-8 border-egmf-surface bg-white align-middle transition-colors last:border-b-0">
        <td className="px-1 py-4 text-center align-middle">
          <span className="text-xs font-extrabold text-egmf-ink">
            {index + 1}
          </span>
        </td>

        <td className="min-w-0 px-2 py-4 align-top">
          <div className="min-w-0 text-center">
            <p className="break-words text-sm font-extrabold leading-5 text-egmf-ink">
              {name || "Chưa có tên hàng"}
            </p>

            {details.length > 0 && (
              <div className="mt-4 space-y-3 text-sm leading-5 text-egmf-ink-secondary">
                {details.map((detail, i) => (
                  <div key={`${detail.lan}-${i}`} className="break-words">
                    <p className="font-bold text-egmf-ink">
                      - Lần {detail.lan}: {detail.soLuong}
                    </p>
                    <p className="font-bold text-egmf-ink">
                      + PO: [{detail.po}]/{detail.soLuongPO}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-start justify-center gap-1.5 text-sm text-egmf-ink-soft">
              <MapPin size={13} className="mt-0.5 shrink-0 text-egmf-primary" />
              <span className="break-words font-semibold">
                Nơi để: [{location}]
              </span>
            </div>
          </div>
        </td>

        <td className="px-1 py-4 text-center align-middle">
          <span className="block break-words text-sm font-extrabold tabular-nums text-egmf-ink">
            {formatNumber(requested)}
          </span>
        </td>

        <td className="px-1 py-4 text-center align-middle">
          <span className="block break-words text-sm font-extrabold tabular-nums text-egmf-ink">
            {formatNumber(picked)}
          </span>
        </td>
      </tr>
    </>
  );
}
