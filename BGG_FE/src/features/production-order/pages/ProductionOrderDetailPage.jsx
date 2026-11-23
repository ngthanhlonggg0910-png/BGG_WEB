import {
  Ban,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileSpreadsheet,
  Layers,
  PackageCheck,
  RefreshCw,
  Scissors,
  Search,
  Shirt,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Empty, Spin, message } from "antd";
import dayjs from "dayjs";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import {
  getMaterialOrderPermissions,
  getProductionOrderMaterialTracking,
  NO_MATERIAL_ORDER_PERMISSION as NO_QUYEN,
  toMaterialOrderPermissions as toQuyen,
} from "../api/productionOrderAPI";

const NHAN_STATUS = {
  DaNhanDu: {
    label: "Đã nhận đủ",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
  },
  NhanMotPhan: {
    label: "Nhận một phần",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    bar: "bg-amber-500",
  },
  ChuaNhan: {
    label: "Chưa nhận",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
    bar: "bg-slate-300",
  },
};

function fmtQty(n) {
  return Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 4 });
}

function fmtDate(val, withTime = false) {
  if (!val) return "—";
  const d = dayjs(val);
  if (!d.isValid()) return "—";
  return d.format(withTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY");
}

function normalize(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

function percent(dat, nhan) {
  if (!dat || dat <= 0) return nhan > 0 ? 100 : 0;
  return Math.min(100, Math.round((nhan / dat) * 1000) / 10);
}

function StatusChip({ status }) {
  const st = NHAN_STATUS[status] || NHAN_STATUS.ChuaNhan;
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:text-xs ${st.cls}`}
    >
      {st.label}
    </span>
  );
}

function ProgressBar({ dat, nhan, status }) {
  const st = NHAN_STATUS[status] || NHAN_STATUS.ChuaNhan;
  const pct = percent(dat, nhan);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${st.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 shrink-0 text-right text-xs font-bold text-slate-600">
        {pct}%
      </span>
    </div>
  );
}

function QtyCell({ label, value, dvt, tone }) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-900",
    received: "border-emerald-200 bg-emerald-50 text-emerald-700",
    missing: "border-rose-300 bg-rose-50 text-rose-600",
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={`min-w-0 rounded-xl border px-1.5 py-2 text-center sm:px-2 sm:py-2.5 ${tones[tone]}`}>
      <span className="block text-xs font-bold text-slate-500 sm:text-sm">{label}</span>
      <strong className="mt-0.5 block break-words text-xl font-black leading-tight tabular-nums sm:text-2xl lg:text-[28px]">
        {value}
      </strong>
      {dvt && (
        <span className="block text-xs font-semibold text-slate-500 sm:text-sm">{dvt}</span>
      )}
    </div>
  );
}

function QtyGrid({ dvt, dat, nhan, conLai }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      <QtyCell label="Đã đặt" value={fmtQty(dat)} dvt={dvt} tone="neutral" />
      <QtyCell label="Đã nhận" value={fmtQty(nhan)} dvt={dvt} tone="received" />
      <QtyCell
        label={conLai > 0 ? "Còn thiếu" : "Còn lại"}
        value={conLai > 0 ? fmtQty(conLai) : "Đủ ✓"}
        dvt={conLai > 0 ? dvt : ""}
        tone={conLai > 0 ? "missing" : "done"}
      />
    </div>
  );
}

const TAB_BTN =
  "flex min-h-[46px] touch-manipulation items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-extrabold transition-all sm:gap-2 sm:px-2.5 sm:text-sm";

export default function ProductionOrderDetailPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const lsxId = Number(searchParams.get("lsxId") || 0);
  const rawTab = searchParams.get("tab");
  const tab = ["vattu", "don", "huy"].includes(rawTab) ? rawTab : "vattu";

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [quyen, setQuyen] = useState(NO_QUYEN);
  const coQuyenDatHang = quyen.datHang;
  const [loaiFilter, setLoaiFilter] = useState("ALL");
  const [chiConThieu, setChiConThieu] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const load = useCallback(async () => {
    if (!lsxId) return;
    try {
      setLoading(true);
      const res = await getProductionOrderMaterialTracking(lsxId);
      setData(res?.data || null);
    } catch (err) {
      message.error(err?.message || "Không thể tải thông tin vật tư của Lệnh sản xuất");
    } finally {
      setLoading(false);
    }
  }, [lsxId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    getMaterialOrderPermissions()
      .then((res) => active && setQuyen(toQuyen(res?.data)))
      .catch(() => active && setQuyen(NO_QUYEN));
    return () => {
      active = false;
    };
  }, []);

  const header = data?.header;
  const summary = data?.summary;
  const orders = useMemo(() => data?.orders || [], [data]);
  const activeOrders = useMemo(() => orders.filter((o) => !o.isDaHuy), [orders]);
  const cancelledOrders = useMemo(() => orders.filter((o) => o.isDaHuy), [orders]);

  const q = normalize(keyword);
  const matchLoai = (loai) => loaiFilter === "ALL" || loai === loaiFilter;

  const visibleMaterials = useMemo(
    () =>
      (data?.materials || []).filter((m) => {
        if (loaiFilter !== "ALL" && m.LoaiDatHang !== loaiFilter) return false;
        if (chiConThieu && !(m.SoLuongConLai > 0)) return false;
        if (!q) return true;
        return (
          normalize(m.MaVatTu).includes(q) ||
          normalize(m.TenVatTu).includes(q) ||
          m.donDatHang.some((d) => normalize(d.SoDonDatHang).includes(q))
        );
      }),
    [data, loaiFilter, chiConThieu, q],
  );

  const visibleOrders = (tab === "huy" ? cancelledOrders : activeOrders).filter(
    (o) => {
      if (!matchLoai(o.LoaiDatHang)) return false;
      if (chiConThieu && tab !== "huy" && o.TrangThaiNhan === "DaNhanDu") return false;
      if (!q) return true;
      return (
        normalize(o.SoDonDatHang).includes(q) ||
        normalize(o.MaSoPhieuSoan).includes(q) ||
        o.lines.some(
          (l) => normalize(l.MaVatTu).includes(q) || normalize(l.TenVatTu).includes(q),
        )
      );
    },
  );

  const setTab = (next) => {
    const p = new URLSearchParams(searchParams);
    p.set("tab", next);
    setSearchParams(p, { replace: true });
  };

  const openBooking = (loai) => {
    navigate(`/production-order-booking?lsxId=${lsxId}&type=${loai}`, {
      state: { lsx: header, loaiDatHang: loai },
    });
  };

  if (!lsxId) {
    return (
      <MainLayout screenTitle="Chi tiết vật tư LSX" headerBackTo="/production-orders">
        <div className="p-6">
          <Empty description="Thiếu mã Lệnh sản xuất" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout screenTitle="Chi tiết vật tư LSX" headerBackTo="/production-orders">
      <div className="min-h-full bg-egmf-surface p-2.5 sm:p-4 md:p-5">
        <div className="mx-auto max-w-6xl space-y-3 sm:space-y-4">
          {/* THÔNG TIN LỆNH SẢN XUẤT */}
          <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
            <div className="flex items-start justify-between gap-2.5 border-b border-egmf-border px-3.5 py-3 sm:px-5 sm:py-3.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-egmf-primary-tint px-2 py-0.5 text-xs font-extrabold text-egmf-primary-strong">
                    <Layers size={13} />
                    {header?.SoLSX || `LSX #${lsxId}`}
                  </span>
                </div>
                <h2 className="mt-1.5 break-words text-[16px] font-extrabold leading-snug text-egmf-ink sm:text-lg">
                  Mã hàng: {header?.MaHang || "—"}
                </h2>
                <p className="mt-0.5 text-xs text-egmf-muted sm:text-sm">
                  {header?.KhachHang || "—"} • Nhà cắt {header?.NhaCat || "—"} • Tổ may{" "}
                  {header?.ToMay || "—"}
                </p>
                {header && (
                  <div className="mt-2 inline-flex items-baseline gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:px-4">
                    <span className="text-sm font-bold text-emerald-800 sm:text-base">
                      Số lượng LSX
                    </span>
                    <strong className="text-3xl font-black leading-none tabular-nums text-emerald-700 sm:text-4xl">
                      {fmtQty(header.TongSanLuong)}
                    </strong>
                    <span className="text-base font-extrabold text-emerald-700">SP</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={load}
                className="inline-flex h-11 shrink-0 touch-manipulation items-center gap-1.5 rounded-xl border border-egmf-border bg-white px-3 text-xs font-bold text-egmf-ink-secondary transition active:scale-95 hover:border-egmf-primary hover:text-egmf-primary sm:px-3.5 sm:text-sm"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>

            {summary && (
              <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-5">
                <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                  <span className="block text-[11px] font-medium text-slate-400 sm:text-xs">
                    Đơn hiện hành
                  </span>
                  <strong className="block text-2xl font-black tabular-nums sm:text-3xl text-slate-900">
                    {summary.soDonHienHanh}
                  </strong>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
                  <span className="block text-[11px] font-medium text-emerald-700/70 sm:text-xs">
                    Đơn đã nhận đủ
                  </span>
                  <strong className="block text-2xl font-black tabular-nums sm:text-3xl text-emerald-700">
                    {summary.soDonDaNhanDu}/{summary.soDonHienHanh}
                  </strong>
                </div>
                <div className="rounded-xl bg-rose-50 p-2.5 text-center">
                  <span className="block text-[11px] font-medium text-rose-700/70 sm:text-xs">
                    Vật tư còn thiếu
                  </span>
                  <strong className="block text-2xl font-black tabular-nums sm:text-3xl text-rose-600">
                    {summary.soMatHangConThieu}/{summary.soMatHang}
                  </strong>
                </div>
              </div>
            )}

            {coQuyenDatHang && (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-3 pb-3 pt-3 sm:px-5 sm:pb-4">
                <button
                  type="button"
                  onClick={() => openBooking("NguyenLieu")}
                  className="flex min-h-[48px] touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] sm:text-sm"
                >
                  <Scissors size={16} className="shrink-0" />
                  <span>Nhà Cắt Đặt NL</span>
                </button>
                <button
                  type="button"
                  onClick={() => openBooking("PhuLieu")}
                  className="flex min-h-[48px] touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-amber-700 active:scale-[0.98] sm:text-sm"
                >
                  <Shirt size={16} className="shrink-0" />
                  <span>Nhà May Đặt PL</span>
                </button>
              </div>
            )}
          </section>

          {/* TAB + BỘ LỌC */}
          <section className="space-y-3 rounded-2xl border border-egmf-border bg-egmf-surface-raised p-3 shadow-egmf-card sm:p-5">
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setTab("vattu")}
                className={`${TAB_BTN} ${tab === "vattu" ? "bg-egmf-primary text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <PackageCheck size={16} className="shrink-0" />
                <span className="truncate">Theo vật tư ({summary?.soMatHang ?? 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("don")}
                className={`${TAB_BTN} ${tab === "don" ? "bg-egmf-primary text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <FileSpreadsheet size={16} className="shrink-0" />
                <span className="truncate">Đơn đặt ({activeOrders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("huy")}
                className={`${TAB_BTN} ${tab === "huy" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-rose-700"}`}
              >
                <Ban size={16} className="shrink-0" />
                <span className="truncate">Đã hủy ({cancelledOrders.length})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
              <label className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã / tên vật tư, số đơn, số PSH"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-egmf-primary"
                />
              </label>
              <select
                value={loaiFilter}
                onChange={(e) => setLoaiFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-egmf-primary"
              >
                <option value="ALL">Tất cả kho</option>
                <option value="NguyenLieu">Kho Vải (Nhà cắt)</option>
                <option value="PhuLieu">Kho Phụ liệu (Nhà may)</option>
              </select>
              {tab !== "huy" && (
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={chiConThieu}
                    onChange={(e) => setChiConThieu(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Chỉ còn thiếu
                </label>
              )}
            </div>
          </section>

          {/* NỘI DUNG */}
          <section>
            {loading && !data ? (
              <div className="flex min-h-60 items-center justify-center rounded-2xl border border-egmf-border bg-white p-6">
                <Spin size="large" />
              </div>
            ) : tab === "vattu" ? (
              visibleMaterials.length === 0 ? (
                <div className="rounded-2xl border border-egmf-border bg-white py-12">
                  <Empty description="Chưa có vật tư nào được đặt cho Lệnh sản xuất này" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {visibleMaterials.map((m) => (
                    <article
                      key={m.key}
                      className="space-y-2.5 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-egmf-card sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
                              m.LoaiDatHang === "NguyenLieu"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {m.LoaiDatHang === "NguyenLieu" ? (
                              <Scissors size={12} />
                            ) : (
                              <Shirt size={12} />
                            )}
                            {m.MaVatTu || "—"}
                          </span>
                          <h3 className="mt-1 break-words text-sm font-bold leading-snug text-slate-900 sm:text-base">
                            {m.TenVatTu || "—"}
                          </h3>
                        </div>
                        <StatusChip status={m.TrangThaiNhan} />
                      </div>
                      <QtyGrid
                        dvt={m.DVT}
                        dat={m.SoLuongDat}
                        nhan={m.SoLuongDaNhan}
                        conLai={m.SoLuongConLai}
                      />
                      <ProgressBar
                        dat={m.SoLuongDat}
                        nhan={m.SoLuongDaNhan}
                        status={m.TrangThaiNhan}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {m.donDatHang.map((d) => (
                          <span
                            key={`${d.DonDatHangId}`}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700"
                          >
                            {d.SoDonDatHang}:{" "}
                            <strong className="font-black tabular-nums text-slate-900">
                              {fmtQty(d.SoLuongDaNhan)}/{fmtQty(d.SoLuongDat)}
                            </strong>
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : visibleOrders.length === 0 ? (
              <div className="rounded-2xl border border-egmf-border bg-white py-12">
                <Empty
                  description={
                    tab === "huy" ? "Không có đơn đã hủy" : "Chưa có đơn đặt hàng phù hợp"
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {visibleOrders.map((o) => {
                  const expanded = expandedOrderId === o.DonDatHangId;
                  const isCat = o.LoaiDatHang === "NguyenLieu";
                  return (
                    <article
                      key={o.DonDatHangId}
                      className={`rounded-2xl border bg-white shadow-egmf-card ${o.isDaHuy ? "border-rose-200" : "border-slate-200/90"}`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(expanded ? null : o.DonDatHangId)}
                        className="w-full space-y-2.5 p-3.5 text-left sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-extrabold ${
                                  isCat ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"
                                }`}
                              >
                                {isCat ? <Scissors size={12} /> : <Shirt size={12} />}
                                {o.SoDonDatHang}
                              </span>
                              {o.MaSoPhieuSoan && (
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                  PSH {o.MaSoPhieuSoan}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                              {o.TenTrangThai} • Đặt {fmtDate(o.NgayDat, true)} bởi{" "}
                              {o.NguoiDat || "—"}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {o.isDaHuy ? (
                              <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 sm:text-xs">
                                Đã hủy
                              </span>
                            ) : (
                              <StatusChip status={o.TrangThaiNhan} />
                            )}
                            {expanded ? (
                              <ChevronUp size={18} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={18} className="text-slate-400" />
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <QtyCell
                            label="Mặt hàng đã đủ"
                            value={`${o.SoMatHangDaNhanDu}/${o.SoMatHang}`}
                            tone={o.SoMatHang > 0 && o.SoMatHangDaNhanDu >= o.SoMatHang ? "done" : "neutral"}
                          />
                          <QtyCell
                            label="Cây/kiện đã nhận"
                            value={`${o.SoCayDaNhan}/${o.SoCay}`}
                            tone={o.SoCay > 0 && o.SoCayDaNhan >= o.SoCay ? "done" : "neutral"}
                          />
                        </div>
                        {o.NgayCanGiao && (
                          <p className="text-sm font-semibold text-slate-600">
                            Cần giao: {fmtDate(o.NgayCanGiao)}
                          </p>
                        )}
                        {!o.isDaHuy && (
                          <ProgressBar
                            dat={o.SoMatHang}
                            nhan={o.SoMatHangDaNhanDu}
                            status={o.TrangThaiNhan}
                          />
                        )}
                      </button>

                      {expanded && (
                        <div className="space-y-2 border-t border-slate-100 p-3 sm:p-4">
                          {o.lines.length === 0 ? (
                            <p className="text-sm text-slate-500">Đơn không có dòng vật tư.</p>
                          ) : (
                            o.lines.map((l) => (
                              <div
                                key={l.CTDonDatHangId}
                                className="space-y-2 rounded-xl border border-slate-100 p-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-extrabold text-slate-500">
                                      {l.MaVatTu || "—"}
                                    </p>
                                    <p className="break-words text-sm font-semibold text-slate-900">
                                      {l.TenVatTu || "—"}
                                    </p>
                                  </div>
                                  <StatusChip status={l.TrangThaiNhan} />
                                </div>
                                <QtyGrid
                                  dvt={l.DVT}
                                  dat={l.SoLuongDat}
                                  nhan={l.SoLuongDaNhan}
                                  conLai={l.SoLuongConLai}
                                />
                                <p className="text-sm text-slate-600">
                                  Kho đã xuất {fmtQty(l.SoLuongXuat)} • {l.SoCayDaNhan}/{l.SoCay}{" "}
                                  cây/kiện đã nhận
                                  {l.ThoiGianNhanMoiNhat
                                    ? ` • Nhận gần nhất ${fmtDate(l.ThoiGianNhanMoiNhat, true)}`
                                    : ""}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <p className="flex items-center gap-1.5 px-1 text-xs text-slate-500">
            <ClipboardList size={14} className="shrink-0" />
            Đã nhận = số lượng Xí nghiệp đã quét xác nhận nhận hàng. Còn lại = đã đặt − đã
            nhận (đơn đã hủy không tính).
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
