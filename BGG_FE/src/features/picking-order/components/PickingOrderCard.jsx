import Barcode from "react-barcode";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const InfoItem = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-egmf-muted">{label}</p>

    <p className="mt-0.5 whitespace-pre-line break-words text-sm font-semibold leading-5 text-egmf-ink">
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
      className="group w-full cursor-pointer overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm transition-all duration-200 hover:border-egmf-primary-border hover:shadow-egmf-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
    >
      {/* BARCODE */}
      <div className="flex flex-col items-center border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-3">
        {item.MaSoPhieuSoan && (
          <div className="flex w-full items-center justify-center overflow-hidden text-center">
            <Barcode
              value={String(item.MaSoPhieuSoan)}
              format="CODE128"
              width={1.25}
              height={50}
              fontSize={16}
              margin={0}
              displayValue={false}
            />
          </div>
        )}

        <h3 className="mt-1.5 break-all text-center text-lg font-extrabold tracking-wide text-egmf-ink">
          {item.MaSoPhieuSoan || "—"}
        </h3>
      </div>

      {/* THÔNG TIN PHIẾU */}
      <div className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
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
        <div className="flex items-center justify-between border-t border-egmf-border-subtle pt-2.5">
          <span className="text-xs font-bold text-egmf-muted">
            Trạng thái phiếu
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              (item.TinhTrang || item.tinhTrang) === "hoanthanh"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {(item.TinhTrang || item.tinhTrang) === "hoanthanh"
              ? "Đã hoàn thành"
              : "Chưa hoàn thành"}
          </span>
        </div>
      </div>
    </div>
  );
}
