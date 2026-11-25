import {
  Barcode,
  CalendarDays,
  LoaderCircle,
  Package,
  Palette,
  Ruler,
  Shirt,
  Truck,
} from "lucide-react";

import { formatDateTime } from "../../../../shared/utils/formatDateTime";

export default function SampleInfoCard({
  sample,
  loading = false,
  inspectionType,
  fallbackBarcode,
}) {
  const sampleData = sample ?? {};
  const barcode = valueOf(sampleData.BarcodeMau) || fallbackBarcode;
  const normalizedInspectionType = String(inspectionType ?? "")
    .trim()
    .toUpperCase();
  const status =
    normalizedInspectionType === "QA"
      ? valueOf(sampleData.TrangThai)
      : valueOf(sampleData.TrangThaiAutonomy);

  if (!barcode && !loading) return null;

  return (
    <section className="mb-3 overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-sm sm:mb-4">
      <header className="flex items-start justify-between gap-3 border-b border-egmf-border-subtle bg-gradient-to-r from-egmf-primary-soft via-white to-white px-3.5 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-egmf-primary shadow-sm ring-1 ring-egmf-primary/10">
            <Package size={18} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-egmf-primary">
              Thông tin mẫu
            </p>
            <h2 className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">
              Mẫu đang kiểm
            </h2>
          </div>
        </div>
        {status && (
          <span
            className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-extrabold ${statusClass(status)}`}
          >
            <span className="font-semibold opacity-75">Trạng thái: </span>
            {status}
          </span>
        )}
      </header>

      {loading ? (
        <div className="flex min-h-24 items-center justify-center gap-2 px-4 py-5 text-sm font-semibold text-egmf-muted">
          <LoaderCircle size={18} className="animate-spin text-egmf-primary" />
          Đang tải thông tin mẫu...
        </div>
      ) : (
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-2 rounded-xl bg-egmf-surface-subtle px-3 py-2">
            <Barcode size={17} className="shrink-0 text-egmf-primary" />
            <div className="min-w-0">
              <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-egmf-muted">
                Barcode mẫu
              </p>
              <p className="m-0 truncate text-sm font-extrabold text-egmf-ink">
                {barcode || "—"}
              </p>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            <InfoItem icon={Shirt} label="Mã hàng" value={sampleData.MaHang} />
            <InfoItem label="Mùa" value={sampleData.Mua} />
            <InfoItem icon={Ruler} label="Size" value={sampleData.Size} />
            <InfoItem
              icon={Palette}
              label="Màu"
              value={sampleData.Mau ?? sampleData.Color}
            />
            <InfoItem label="Loại mẫu" value={sampleData.LoaiMau} />
            <InfoItem
              icon={Truck}
              label="Nhà cung cấp"
              value={sampleData.NhaCungCap ?? sampleData.Supplier}
            />
            <InfoItem label="DPP" value={sampleData.DPP} />
            <InfoItem label="R3 code" value={sampleData.R3Code} />
            <InfoItem
              icon={CalendarDays}
              label="Ngày tạo"
              value={formatDate(
                sampleData.NgayTao ?? sampleData.Date ?? sampleData.ThoiGianTao,
              )}
            />
          </dl>
        </div>
      )}
    </section>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  const displayValue = valueOf(value);
  if (!displayValue) return null;

  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-egmf-muted">
        {Icon && <Icon size={12} className="shrink-0" />}
        {label}
      </dt>
      <dd className="m-0 mt-0.5 break-words text-[13px] font-bold leading-5 text-egmf-ink-secondary">
        {displayValue}
      </dd>
    </div>
  );
}

function valueOf(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "";
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "";

  try {
    return formatDateTime(value);
  } catch {
    return valueOf(value);
  }
}

function statusClass(status) {
  const value = String(status).toUpperCase();

  if (value === "HÀNG LỖI") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (value === "HÀNG SỬA") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (value.includes("LỖI")) return "border-rose-100 bg-rose-50 text-rose-700";
  if (value.includes("SỬA") || value.includes("CHỜ")) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  if (value.includes("ĐẠT") || value.includes("HOÀN THÀNH")) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-600";
}
