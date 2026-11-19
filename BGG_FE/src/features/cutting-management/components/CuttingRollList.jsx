import { GitMerge, RefreshCw, Search } from "lucide-react";
import { formatDateTime } from "../../../shared/utils/formatDateTime";
import { formatNumber } from "../../../shared/utils/formatNumber";

const text = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const number = (value, unit = "") =>
  value === null || value === undefined || value === ""
    ? "—"
    : formatNumber(value) + (unit ? " " + unit : "");

function DetailField({ label, value, wide = false }) {
  return (
    <div
      className={
        "min-w-0 " +
        (wide ? "col-span-3" : "")
      }
    >
      <dt className="text-[11px] font-bold leading-4 text-egmf-muted">{label}</dt>
      <dd className="m-0 mt-0.5 break-words text-sm font-semibold leading-5 text-egmf-ink-secondary">
        {value}
      </dd>
    </div>
  );
}

function CuttingRollCard({ detail, index, onFabricSplice }) {
  const canFabricSplice = detail.isVaiNoi === true;
  const fields = [
    { label: "Màu/Lot", value: text(detail.MauLot), wide: true },
    { label: "Màu vải", value: text(detail.MauVai) },
    { label: "PO", value: text(detail.PO) },
    { label: "Item", value: text(detail.Item) },
    { label: "Tách lớp", value: text(detail.TachLop) },
    { label: "Yard", value: number(detail.Yard, "yd") },
    { label: "Mét", value: number(detail.Met, "m") },
    { label: "Cây", value: number(detail.Cay, "m") },
    { label: "Khúc", value: number(detail.Khuc, "m") },
    { label: "Thực tế", value: number(detail.ThucTe, "m") },
    { label: "Tiêu hao thực tế", value: number(detail.TieuHaoThucTe, "m") },
    { label: "Thừa", value: number(detail.Thua, "m") },
    { label: "Thiếu", value: number(detail.Thieu, "m") },
    { label: "Nguyên cây", value: number(detail.NguyenCay, "m") },
    { label: "Thu hồi 1", value: number(detail.ThuHoiMot, "m") },
    { label: "Thu hồi 2", value: number(detail.ThuHoiHai, "m") },
    { label: "Thu hồi 3", value: number(detail.ThuHoiBa, "m") },
    { label: "Số BTP", value: number(detail.SoBTP) },
    { label: "Số lớp trải", value: number(detail.SoLopTrai) },
    { label: "Đầu khúc", value: detail.isDauKhuc ? "Có" : "Không" },
    { label: "Vải nối", value: detail.isVaiNoi ? "Có" : "Không" },
    { label: "Ảnh màu", value: text(detail.AnhMau) },
    { label: "Ảnh màu GD", value: text(detail.AnhMauGD) },
    { label: "Ảnh màu PKV", value: text(detail.AnhMauPKV) },
    { label: "Người hạch toán", value: text(detail.NguoiHachToan) },
    {
      label: "Ngày quét",
      value: formatDateTime(detail.NgayQuet) || "—",
    },
    { label: "Mã phiếu", value: text(detail.PhieuHoachToanId) },
    {
      label: "Mã chi tiết phiếu",
      value: text(detail.ChiTietPhieuHoachToanId),
    },
  ];

  return (
    <article
      className={`rounded-xl border border-egmf-border bg-white p-3 shadow-sm transition hover:shadow-egmf-card ${Number(detail.isVaiNoi) === 1 ? "border-l-4 border-l-blue-500" : ""}`}
    >
      <header className="flex items-center justify-between gap-2.5 rounded-lg bg-egmf-primary-soft px-2.5 py-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <p className="m-0 shrink-0 rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] font-bold text-egmf-primary">
            Cây vải {index + 1}
          </p>
          <h3 className="m-0 min-w-0 break-all text-base font-extrabold leading-5 text-egmf-ink">
            {text(detail.MaCay)}
          </h3>
        </div>
        <button
          type="button"
          disabled={!canFabricSplice}
          onClick={() => onFabricSplice?.(detail)}
          title={
            canFabricSplice
              ? "Nối cây vải"
              : "Cây vải này không đủ điều kiện để nối"
          }
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-egmf-primary bg-egmf-primary px-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-egmf-primary/90 disabled:cursor-not-allowed disabled:border-egmf-border disabled:bg-egmf-surface-subtle disabled:text-egmf-muted disabled:hover:bg-egmf-surface-subtle sm:px-3"
        >
          <GitMerge size={16} strokeWidth={2.4} />
          Nối cây
        </button>
      </header>

      <dl className="mt-2.5 grid grid-cols-3 gap-x-3 gap-y-3">
        {fields.map((field) => (
          <DetailField key={field.label} {...field} />
        ))}
      </dl>
    </article>
  );
}

export default function CuttingRollList({
  details = [],
  keyword,
  onKeywordChange,
  onFabricSplice,
  loading = false,
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <label className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-egmf-muted"
          />
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm mã cây, màu/lot hoặc màu vải"
            className="h-11 w-full rounded-xl border border-egmf-border bg-white py-2 pl-9 pr-3 text-sm font-medium text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
          />
        </label>
        <button
          type="button"
          onClick={() => onKeywordChange("")}
          aria-label="Xóa tìm kiếm"
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-egmf-border bg-white text-egmf-muted transition hover:border-egmf-primary-border hover:text-egmf-primary"
        >
          <RefreshCw size={16} strokeWidth={2.3} />
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-32 items-center justify-center rounded-xl border border-egmf-border-subtle bg-egmf-surface-subtle px-4 text-sm font-medium text-egmf-muted">
          Đang tải danh sách cây vải...
        </div>
      ) : details.length ? (
        <div className="space-y-3">
          {details.map((detail, index) => (
            <CuttingRollCard
              key={detail.ChiTietPhieuHoachToanId ?? detail.MaCay ?? index}
              detail={detail}
              index={index}
              onFabricSplice={onFabricSplice}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-egmf-border bg-egmf-surface-subtle px-4 py-8 text-center text-sm font-medium text-egmf-muted">
          Không tìm thấy cây vải phù hợp.
        </div>
      )}
    </div>
  );
}
