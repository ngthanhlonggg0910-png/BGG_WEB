import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Package,
  UserRound,
} from "lucide-react";

import { formatDateTime } from "../../../shared/utils/formatDateTime";

export function FabricInspectionCard({ item, onClick }) {
  const details = [
    { label: "Nhà cung cấp", value: item.TenNgan ?? item.NhaCungCap },
    { label: "Mã hàng", value: item.MaHang },
    { label: "Chủng loại", value: item.ChungLoai },
    { label: "Màu vải", value: item.MaMau ?? item.MauVai },
  ];
  const references = [
    { label: "Item", value: item.Item },
    { label: "Art", value: item.Art },
    { label: "LOT", value: item.LOT ?? item.Lot },
    { label: "Chứng từ", value: item.ChungTu },
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-egmf-large border border-egmf-border bg-white text-left shadow-egmf-card transition duration-200 hover:-translate-y-0.5 hover:border-egmf-primary-border hover:bg-egmf-surface-subtle hover:shadow-[0_12px_28px_rgba(37,99,235,0.10)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:translate-y-0 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 border-b border-egmf-border-subtle bg-egmf-primary-hover-soft px-4 py-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary transition-colors group-hover:bg-egmf-primary group-hover:text-white">
          <ClipboardCheck size={22} strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-muted-soft">
            Số phiếu kiểm
          </span>
          <span className="mt-1 block truncate text-[18px] font-extrabold leading-tight text-egmf-ink group-hover:text-egmf-primary-strong">
            {item.SoPhieuKiem || "—"}
          </span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-egmf-primary transition-transform group-hover:translate-x-0.5">
          <ChevronRight size={19} strokeWidth={2.3} />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">
        {details.map((detail) => (
          <Detail key={detail.label} {...detail} />
        ))}
      </div>

      <div className="border-t border-egmf-border-subtle bg-egmf-surface-soft px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {references.map((reference) => (
            <Detail key={reference.label} compact {...reference} />
          ))}
        </div>
      </div>

      <div className="space-y-2.5 border-t border-egmf-border-subtle px-4 py-3.5">
        <MetaRow
          icon={UserRound}
          label="Nhân viên kiểm"
          value={item.NhanVienKiem}
        />
        <MetaRow
          icon={CalendarDays}
          label="Ngày kiểm vải"
          value={formatDateTime(item.NgayKiemVai)}
        />
        <MetaRow
          icon={Package}
          label="Ngày nhận vải"
          value={formatDateTime(item.NgayNhanVai)}
        />
      </div>
    </button>
  );
}

function Detail({ label, value, compact = false }) {
  return (
    <div className="min-w-0">
      <p className="m-0 truncate text-[12px] font-medium text-egmf-muted">
        {label}
      </p>
      <p
        className={`m-0 mt-1 truncate ${compact ? "text-[14px] font-semibold text-egmf-ink-secondary" : "text-[15px] font-bold text-egmf-ink"}`}
        title={value || ""}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 text-sm">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="shrink-0 text-egmf-muted">{label}:</span>
      <span className="min-w-0 truncate font-bold text-egmf-ink-secondary">
        {value || "—"}
      </span>
    </div>
  );
}
