import Barcode from "react-barcode";
import { CalendarDays, ClipboardList, Package, UserRound } from "lucide-react";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const InfoItem = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-sm font-medium text-egmf-muted">{label}</p>

    <p className="mt-1 whitespace-pre-line break-words text-base font-semibold text-egmf-ink">
      {value || "—"}
    </p>
  </div>
);

export default function PickingOrderCard({ item, onClick }) {
  if (!item) return null;

  return (
    <div
      role="button"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="w-full overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card"
    >
      {/* BARCODE */}
      <div className="flex flex-col items-center border-b border-egmf-border bg-white px-3 py-4">
        {item.MaSoPhieuSoan && (
          <div className="w-full overflow-hidden text-center flex items-center justify-center">
            <Barcode
              value={String(item.MaSoPhieuSoan)}
              format="CODE128"
              width={1.5}
              height={65}
              fontSize={18}
              margin={0}
              displayValue={false}
            />
          </div>
        )}

        <h3 className="mt-2 break-all text-center text-xl font-bold tracking-wide text-slate-900">
          {item.MaSoPhieuSoan || "—"}
        </h3>
      </div>

      {/* THÔNG TIN PHIẾU */}
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <InfoItem label="Mã hàng" value={item.MaHang} />
          <InfoItem label="Đơn đặt hàng" value={item.DDH} />
          <InfoItem label="PO" value={item.PO} />
          <InfoItem label="Cấp cho" value={item.CapCho} />
          <InfoItem
            label="Người đặt"
            value={String(item.NguoiDat ?? "").replace(
              /\s*GHI CHÚ:/i,
              "\nGHI CHÚ:",
            )}
          />
          <InfoItem
            label="Ngày giao hàng"
            value={formatDateTime(item.NgayGiaoHang)}
          />
        </div>

        {/* FOOTER - TRẠNG THÁI PHIẾU */}
        <div className="flex items-center justify-between border-t border-egmf-border pt-3">
          <span className="text-sm font-medium text-egmf-muted">
            Trạng thái phiếu
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              item.tinhTrang === "hoanthanh"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {item.tinhTrang === "hoanthanh"
              ? "Đã hoàn thành"
              : "Chưa hoàn thành"}
          </span>
        </div>
      </div>
    </div>
  );
}
