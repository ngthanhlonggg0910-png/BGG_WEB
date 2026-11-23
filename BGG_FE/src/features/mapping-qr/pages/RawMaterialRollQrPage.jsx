import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  PencilLine,
  RefreshCw,
  ScanLine,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "antd";
import ReactSelect from "react-select";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { postJson } from "../../../shared/api/httpClient";
import { getCurrentProfile } from "../../../shared/auth/session";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";

const api = (endpoint, body) =>
  postJson(`/api/mapping-qr/roll-label/${endpoint}`, body);
const field =
  "w-full rounded-xl border border-egmf-border bg-white px-3 py-3 text-base text-egmf-ink focus:outline-none focus:ring-2 focus:ring-egmf-primary disabled:bg-egmf-surface";
const fmt = (value) =>
  Number(value ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 4 });
const quantityText = (value) =>
  value == null ? "" : String(Number(Number(value).toFixed(4)));
const isClosed = (value) =>
  ["HUY", "DAXACNHAN"].includes(String(value ?? "").toUpperCase());
const blankFilters = { Keyword: "", Status: "", FromDate: "", ToDate: "" };
const statusText = (value) =>
  ({
    MOITAO: "Mới tạo",
    XACNHAN: "Chờ xác nhận",
    DAXACNHAN: "Đã xác nhận",
    HUYXACNHAN: "Hủy xác nhận",
    HUY: "Đã hủy",
  })[value] ||
  value ||
  "—";
const dateText = (value) =>
  value && Number.isFinite(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("vi-VN", { timeZone: "Asia/Bangkok" })
    : "—";

export default function RawMaterialRollQrPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("phieu");
  const [filters, setFilters] = useState({ ...blankFilters });
  const [filterOptions, setFilterOptions] = useState({
    customers: [],
    statuses: [],
    types: [],
    creators: [],
    inspectors: [],
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [receipts, setReceipts] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("scan");
  const [code, setCode] = useState("");
  const [modal, setModal] = useState(null);
  const [roll, setRoll] = useState("");
  const [quantity, setQuantity] = useState("");
  const [inputUnit, setInputUnit] = useState("YDS");
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const lock = useRef(false);
  const scanInput = useRef(null);
  const rollInput = useRef(null);
  const quantityInput = useRef(null);
  const revision = useRef(0);
  const listRevision = useRef(0);
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const appliedFilters = useRef({ ...blankFilters });
  const listPage = useRef(1);
  const mappedRows = rows.filter((row) => row.CayId != null);
  const pending = rows.length - mappedRows.length;
  const closed = isClosed(receipt?.TrangThaiPhieu);
  const statusOptions = [
    { value: "", label: "Tất cả" },
    ...filterOptions.statuses.map((value) => ({
      value,
      label: statusText(value),
    })),
  ];

  const loadReceipts = useCallback(async (requestedPage = listPage.current) => {
    const version = ++listRevision.current;
    setLoading(true);
    setPageError("");
    try {
      const result = await api("receipts", {
        ...appliedFilters.current,
        Page: requestedPage,
        PageSize: 20,
      });
      if (version !== listRevision.current || selectedIdRef.current) return;
      setReceipts(result.data ?? []);
      setTotal(result.total ?? 0);
      setPage(result.page ?? requestedPage);
      listPage.current = result.page ?? requestedPage;
    } catch (err) {
      if (version === listRevision.current && !selectedIdRef.current)
        setPageError(err.message);
    } finally {
      if (version === listRevision.current && !selectedIdRef.current)
        setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    api("receipt-filters", {})
      .then((result) => {
        if (active) setFilterOptions(result.data);
      })
      .catch(() => {
        if (active)
          showErrorToast(
            "Chưa tải được danh mục bộ lọc. Bạn vẫn có thể tìm theo từ khóa.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const loadReceipt = useCallback(async (id, version) => {
    const result = await api("receipt", { PGDId: Number(id) });
    if (revision.current !== version) return;
    setReceipt(result.receipt);
    setRows(result.data ?? []);
  }, []);
  useEffect(() => {
    const version = ++revision.current;
    ++listRevision.current;
    setModal(null);
    setCode("");
    setTab("scan");
    setLastSaved(null);
    setPageError("");
    if (!selectedId) {
      setReceipt(null);
      setRows([]);
      void loadReceipts();
      return;
    }
    setLoading(true);
    setReceipt(null);
    setRows([]);
    loadReceipt(selectedId, version)
      .catch((err) => {
        if (revision.current === version) setPageError(err.message);
      })
      .finally(() => {
        if (revision.current === version) setLoading(false);
      });
  }, [selectedId, loadReceipt, loadReceipts]);

  function applyFilters(event) {
    event.preventDefault();
    if (
      filters.FromDate &&
      filters.ToDate &&
      filters.FromDate > filters.ToDate
    ) {
      setPageError("Từ ngày không được lớn hơn đến ngày.");
      return;
    }
    appliedFilters.current = { ...filters };
    void loadReceipts(1);
  }
  function resetFilters() {
    setFilters({ ...blankFilters });
    appliedFilters.current = { ...blankFilters };
    void loadReceipts(1);
  }
  function filterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }
  useEffect(() => {
    if (modal) {
      rollInput.current?.focus();
      rollInput.current?.select();
    } else if (receipt && tab === "scan" && !busy) scanInput.current?.focus();
  }, [modal, receipt, tab, busy]);
  useEffect(() => {
    if (!modal) return;
    function escape(event) {
      if (event.key === "Escape" && !lock.current) {
        setModal(null);
        setError("");
      }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [modal]);

  function openModal(row, editing) {
    setError("");
    setRoll(editing ? (row.SoRoll ?? "") : "");
    setInputUnit(
      editing
        ? /^(M|MTR|MTRS|MET|MÉT|METRE|METRES|METER|METERS)$/i.test(row.DVT)
          ? "M"
          : "YDS"
        : "YDS",
    );
    setQuantity(editing ? quantityText(row.Quantity) : "");
    setModal({ row, editing });
  }
  async function refresh() {
    if (lock.current || loading) return;
    setLoading(true);
    setPageError("");
    try {
      await loadReceipt(selectedId, revision.current);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }
  async function lookup(event) {
    event.preventDefault();
    const scanned = (scanInput.current?.value ?? code).trim();
    if (lock.current || !receipt || !scanned) return;
    lock.current = true;
    setBusy(true);
    try {
      const result = await api("lookup", { Qr: scanned, PGDId: receipt.PGDId });
      setCode("");
      if (result.data.CayId != null) {
        showErrorToast(
          `Quét trùng: cây ${result.data.MaCay} đã lưu — Roll ${result.data.SoRoll || "—"}, ${fmt(result.data.Quantity)} ${result.data.DVT}. Không tạo thêm cây. Bạn có thể sửa trong lịch sử đã quét.`,
        );
        await loadReceipt(selectedId, revision.current);
      } else if (isClosed(result.data.TrangThaiPhieu)) {
        showErrorToast("Phiếu đã hủy hoặc xác nhận, không thể nhập cây.");
      } else openModal(result.data, false);
    } catch (err) {
      showErrorToast(err.message);
      scanInput.current?.select();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    if (lock.current || !modal) return;
    const normalized = quantity.trim().replace(",", ".");
    if (!roll.trim() || roll.trim().length > 250) {
      setError("Nhập số roll, tối đa 250 ký tự.");
      rollInput.current?.focus();
      return;
    }
    if (
      !/^\d+(\.\d{1,4})?$/.test(normalized) ||
      Number(normalized) <= 0 ||
      Number(normalized) > 9999999999.9999
    ) {
      setError("Số lượng phải lớn hơn 0 và tối đa 4 số lẻ.");
      quantityInput.current?.focus();
      return;
    }
    const profile = getCurrentProfile();
    if (!profile?.TKId || (!modal.editing && !profile?.NVId)) {
      setError(
        "Phiên đăng nhập thiếu thông tin tài khoản/nhân viên. Vui lòng đăng nhập lại.",
      );
      return;
    }
    const body = {
      PGDId: receipt.PGDId,
      Qr: modal.row.Qr,
      Quantity: normalized,
      InputUnit: inputUnit,
      SoRoll: roll.trim(),
      AccountId: profile.TKId,
      EmployeeId: profile.NVId,
      User: `${profile.HoVaTenLot ?? ""} ${profile.Ten ?? ""}`.trim(),
      ...(modal.editing
        ? {
            ExpectedQuantity: modal.row.Quantity,
            ExpectedRoll: modal.row.SoRoll ?? "",
          }
        : {}),
    };
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api(modal.editing ? "update" : "map", body);
      setRows((current) =>
        current.map((row) => (row.Qr === result.data.Qr ? result.data : row)),
      );
      setLastSaved(result.data);
      setCode("");
      setModal(null);
      if (result.data.AlreadyMapped)
        showErrorToast(
          `Quét trùng: cây ${result.data.MaCay} đã được lưu trước đó. Giữ nguyên số roll và số lượng đã lưu.`,
        );
      else
        showSuccessToast(result.message || `Đã lưu cây ${result.data.MaCay}.`);
      try {
        await loadReceipt(selectedId, revision.current);
      } catch {
        setPageError(
          "Cây đã lưu thành công. Chưa tải lại được danh sách; hãy bấm Làm mới.",
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <MainLayout screenTitle="Mapping QR nguyên liệu">
      <main className="min-h-full bg-egmf-surface px-3 py-3 sm:px-5 sm:py-4 lg:px-7">
        <div className="mx-auto max-w-5xl space-y-3 sm:space-y-4">
          {!selectedId ? (
            <>
              <form onSubmit={applyFilters} className="space-y-3">
                <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
                  <header className="flex items-center gap-2.5 border-b border-egmf-border-subtle bg-egmf-primary-tint px-3.5 py-2.5 sm:px-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-egmf-primary shadow-sm">
                      <SlidersHorizontal size={17} />
                    </span>
                    <div className="flex-1">
                      <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                        Bộ lọc tìm kiếm
                      </h2>
                      <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                        Chọn điều kiện trước khi tra cứu.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={resetFilters}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-egmf-primary transition hover:bg-white/70 disabled:opacity-50"
                    >
                      Xóa lọc
                    </button>
                  </header>
                  <div className="p-3.5 sm:p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label
                          htmlFor="nl-from-date"
                          className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-egmf-ink-secondary"
                        >
                          <CalendarDays
                            size={16}
                            className="text-egmf-primary"
                          />{" "}
                          Từ ngày
                        </label>
                        <input
                          id="nl-from-date"
                          aria-label="Từ ngày"
                          type="date"
                          value={filters.FromDate}
                          max={filters.ToDate || undefined}
                          onChange={(event) =>
                            filterChange("FromDate", event.target.value)
                          }
                          disabled={loading}
                          className={`${field} min-w-0 !py-2.5 text-sm sm:h-11`}
                        />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor="nl-to-date"
                          className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-egmf-ink-secondary"
                        >
                          <CalendarDays
                            size={16}
                            className="text-egmf-primary"
                          />{" "}
                          Đến ngày
                        </label>
                        <input
                          id="nl-to-date"
                          aria-label="Đến ngày"
                          type="date"
                          value={filters.ToDate}
                          min={filters.FromDate || undefined}
                          onChange={(event) =>
                            filterChange("ToDate", event.target.value)
                          }
                          disabled={loading}
                          className={`${field} min-w-0 !py-2.5 text-sm sm:h-11`}
                        />
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 border-t border-egmf-border-subtle pt-3 sm:grid-cols-[minmax(0,1fr)_132px] sm:items-end">
                      <div>
                        <label
                          htmlFor="nl-receipt-status"
                          className="mb-1.5 block text-xs font-bold text-egmf-ink-secondary"
                        >
                          Trạng thái
                        </label>
                        <ReactSelect
                          inputId="nl-receipt-status"
                          aria-label="Trạng thái phiếu"
                          isSearchable={false}
                          isDisabled={loading}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          options={statusOptions}
                          value={
                            statusOptions.find(
                              (option) => option.value === filters.Status,
                            ) ?? statusOptions[0]
                          }
                          onChange={(option) =>
                            filterChange("Status", option?.value ?? "")
                          }
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: 44,
                              borderRadius: 10,
                              borderColor: state.isFocused
                                ? "#2563eb"
                                : "#e1e1ec",
                              boxShadow: state.isFocused
                                ? "0 0 0 3px rgba(37,99,235,.12)"
                                : "none",
                            }),
                            menuPortal: (base) => ({ ...base, zIndex: 1000 }),
                          }}
                        />
                      </div>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="!h-11 !w-full !rounded-xl !bg-egmf-primary !text-sm !font-bold !shadow-egmf-primary-compact"
                      >
                        Lọc
                      </Button>
                    </div>
                  </div>
                </section>
                <div className="flex gap-2 rounded-xl border border-egmf-border bg-egmf-surface-raised p-2">
                  <input
                    aria-label="Tìm phiếu giám định"
                    type="search"
                    className={field}
                    value={filters.Keyword}
                    onChange={(event) =>
                      filterChange("Keyword", event.target.value)
                    }
                    placeholder="Tìm theo mã phiếu hoặc mã QR"
                  />
                  <button
                    disabled={loading}
                    className="grid size-11 shrink-0 place-items-center rounded-lg bg-egmf-primary text-white shadow-egmf-primary-compact disabled:opacity-50"
                    aria-label="Tìm phiếu"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>
              <p className="px-1 text-xs font-semibold text-egmf-muted">
                {total} phiếu phù hợp · Trang {page}/
                {Math.max(1, Math.ceil(total / 20))}
              </p>
              {loading && <p className="text-egmf-muted">Đang tải phiếu…</p>}
              {!loading && receipts.length === 0 && !pageError && (
                <p className="rounded-xl border border-dashed border-egmf-border bg-egmf-surface-raised p-4 text-sm text-egmf-muted">
                  Không có phiếu phù hợp có tem QR.
                </p>
              )}
              <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">
                {receipts.map((item) => (
                  <button
                    key={item.PGDId}
                    onClick={() => setParams({ phieu: String(item.PGDId) })}
                    disabled={loading}
                    className="group w-full rounded-xl border border-egmf-border bg-egmf-surface-raised p-3.5 text-left shadow-sm transition hover:border-egmf-primary-border hover:shadow-egmf-card disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-base font-extrabold text-egmf-ink">
                        {item.MaPhieu}
                      </strong>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${item.TrangThaiPhieu === "HUY" ? "bg-red-50 text-red-700" : isClosed(item.TrangThaiPhieu) ? "bg-emerald-50 text-emerald-800" : "bg-egmf-primary-soft text-egmf-primary"}`}
                      >
                        {statusText(item.TrangThaiPhieu)}
                      </span>
                    </div>
                    <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-egmf-ink">
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">
                          Ngày giám định
                        </dt>
                        <dd className="font-semibold">
                          {dateText(item.NgayGiamDinh)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">Loại hình</dt>
                        <dd className="font-semibold">
                          {item.LoaiHinh === "GC"
                            ? "Gia công"
                            : item.LoaiHinh || "—"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">Khách hàng</dt>
                        <dd className="break-words font-semibold">
                          {item.KhachHang || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">Mã hàng</dt>
                        <dd className="break-words font-semibold">
                          {item.MaHang || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">Số lô</dt>
                        <dd className="break-words font-semibold">
                          {item.LoPhieu || "—"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">PO</dt>
                        <dd
                          className="line-clamp-2 break-words font-semibold"
                          title={item.DanhSachPO || ""}
                        >
                          {item.DanhSachPO || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">Người tạo</dt>
                        <dd className="break-words">
                          {item.TenNguoiTao || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">
                          Người giám định
                        </dt>
                        <dd className="break-words">
                          {item.TenNguoiGiamDinh || "—"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[10px] font-bold uppercase tracking-[0.05em] text-egmf-muted">Chứng từ</dt>
                        <dd>
                          {item.CertificateCount > 1
                            ? `${item.CertificateCount} chứng từ`
                            : item.ChungTu || "—"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-2.5 flex flex-wrap justify-between gap-2 border-t border-egmf-border-subtle pt-2.5 text-xs font-bold">
                      <span className="text-egmf-primary">
                        {item.MappedLabels}/{item.TotalLabels} cây đã quét
                      </span>
                      <span className="text-amber-700">
                        {item.PendingLabels} tem chờ
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {total > 20 && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    disabled={loading || page <= 1}
                    onClick={() => void loadReceipts(page - 1)}
                    className="rounded-xl border border-egmf-border bg-white px-4 py-2.5 font-semibold text-egmf-primary disabled:opacity-40"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm text-egmf-muted">
                    {page}/{Math.ceil(total / 20)}
                  </span>
                  <button
                    disabled={loading || page * 20 >= total}
                    onClick={() => void loadReceipts(page + 1)}
                    className="rounded-xl border border-egmf-border bg-white px-4 py-2.5 font-semibold text-egmf-primary disabled:opacity-40"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <section className="sticky top-0 z-10 overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
                <div className="border-b border-egmf-border-subtle bg-gradient-to-r from-egmf-primary-soft via-white to-white px-3.5 py-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setParams({})}
                    disabled={busy}
                    className="flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-egmf-primary transition hover:bg-white/80 disabled:opacity-50"
                  >
                    <ArrowLeft size={18} /> Đổi phiếu
                  </button>
                  <button
                    onClick={refresh}
                    disabled={loading || busy}
                    className="flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-egmf-primary transition hover:bg-white/80 disabled:opacity-50"
                  >
                    <RefreshCw size={16} /> Làm mới
                  </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="m-0 text-[10px] font-bold uppercase tracking-[0.1em] text-egmf-primary">
                        Phiếu Mapping QR
                      </p>
                      <h1 className="m-0 mt-0.5 break-words text-lg font-extrabold tracking-tight text-egmf-ink">
                        {receipt?.MaPhieu || "…"}
                      </h1>
                      <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                        Lô: {receipt?.LoPhieu || "—"}
                      </p>
                    </div>
                    {receipt?.TrangThaiPhieu && (
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-egmf-ink-secondary shadow-sm ring-1 ring-egmf-border-subtle">
                        {statusText(receipt.TrangThaiPhieu)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-egmf-border-subtle bg-egmf-surface-subtle text-center">
                  <div className="px-3 py-2.5">
                    <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">
                      Tem chờ
                    </p>
                    <p className="m-0 mt-0.5 text-sm font-extrabold text-amber-700">
                      {pending}
                    </p>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">
                      Đã quét
                    </p>
                    <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-primary">
                      {mappedRows.length} cây
                    </p>
                  </div>
                </div>
                {rows.length > 0 && (
                  <div
                    role="tablist"
                    aria-label="Mapping nguyên liệu"
                    className="grid grid-cols-2 gap-1 border-t border-egmf-border-subtle bg-white p-2"
                  >
                    <button
                      role="tab"
                      aria-selected={tab === "scan"}
                      onClick={() => setTab("scan")}
                      disabled={busy}
                      className={`min-h-10 rounded-lg px-2 text-xs font-bold transition ${tab === "scan" ? "bg-egmf-primary text-white shadow-egmf-primary-compact" : "text-egmf-muted hover:bg-egmf-surface-subtle"}`}
                    >
                      Quét cây
                    </button>
                    <button
                      role="tab"
                      aria-selected={tab === "scanned"}
                      onClick={() => setTab("scanned")}
                      disabled={busy}
                      className={`min-h-10 rounded-lg px-2 text-xs font-bold transition ${tab === "scanned" ? "bg-egmf-primary text-white shadow-egmf-primary-compact" : "text-egmf-muted hover:bg-egmf-surface-subtle"}`}
                    >
                      Cây đã quét ({mappedRows.length})
                    </button>
                  </div>
                )}
              </section>
              {loading && <p className="text-egmf-muted">Đang tải…</p>}
              {receipt && !loading && rows.length === 0 && (
                <section
                  role="status"
                  className="space-y-2 rounded-2xl border border-egmf-border bg-white p-5"
                >
                  <h2 className="font-bold text-egmf-ink">
                    Phiếu chưa tạo tem Mapping QR
                  </h2>
                  <p className="text-sm text-egmf-muted">
                    Các cây nhập theo cách giám định cũ không hiển thị tại màn
                    hình này.
                  </p>
                  {!closed && (
                    <p className="text-sm text-egmf-muted">
                      Để sử dụng Mapping QR, mở phiếu trên HiGarment, chọn vật
                      tư và bấm Mapping QR để tạo, in tem GNA. Sau đó bấm Làm
                      mới tại đây để quét cây.
                    </p>
                  )}
                  {closed && (
                    <p className="text-sm text-amber-700">
                      Phiếu đã hủy/xác nhận, không thể tạo tem hoặc mapping thêm
                      cây.
                    </p>
                  )}
                </section>
              )}
              {receipt && rows.length > 0 && tab === "scan" && (
                <section
                  role="tabpanel"
                  className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm"
                >
                  {closed ? (
                    <p className="m-0 px-3.5 py-3 text-sm font-semibold text-amber-700 sm:px-4">
                      Phiếu đã hủy/xác nhận. Chỉ xem được cây đã quét.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 border-b border-egmf-border-subtle bg-egmf-primary-tint px-3.5 py-2.5 sm:px-4">
                        <span className="grid size-8 place-items-center rounded-lg bg-white text-egmf-primary shadow-sm">
                          <ScanLine size={17} />
                        </span>
                        <div>
                          <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                            Quét QR để nhập cây
                          </h2>
                          <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                            Quét tem GNA để khai báo roll và số lượng.
                          </p>
                        </div>
                      </div>
                      <form
                        onSubmit={lookup}
                        data-submit-on-scan="true"
                        className="grid gap-2 p-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-4"
                      >
                        <input
                          ref={scanInput}
                          aria-label="QR cây nguyên liệu"
                          autoComplete="off"
                          className={`${field} !py-2.5 text-sm`}
                          value={code}
                          disabled={busy || loading}
                          placeholder="Quét mã GNA tại đây"
                          onChange={(event) => setCode(event.target.value)}
                        />
                        <button
                          disabled={busy || loading}
                          className="min-h-11 rounded-xl bg-egmf-primary px-4 text-sm font-bold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong disabled:opacity-50"
                        >
                          {busy ? "Đang đọc…" : "Quét"}
                        </button>
                      </form>
                      <p className="m-0 border-t border-egmf-border-subtle px-3.5 py-2.5 text-xs leading-5 text-egmf-muted sm:px-4">
                        Quét → nhập roll → Enter → số lượng → Enter để lưu. Lưu
                        xong tự sẵn sàng quét cây tiếp theo.
                      </p>
                    </>
                  )}
                  {lastSaved && (
                    <div className="mx-3.5 mb-3.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-800 sm:mx-4 sm:mb-4">
                      <p className="m-0 flex items-center gap-2 text-sm font-bold">
                        <CheckCircle2 size={18} /> Vừa lưu: {lastSaved.MaCay}
                      </p>
                      <p className="m-0 mt-1 text-xs">
                        Roll: {lastSaved.SoRoll} · {fmt(lastSaved.Quantity)}{" "}
                        {lastSaved.DVT}
                      </p>
                    </div>
                  )}
                </section>
              )}
              {receipt && rows.length > 0 && (
                <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
                  <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-2.5 sm:px-4">
                    <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                      Lịch sử đã quét
                    </h2>
                    <span className="rounded-full bg-egmf-primary-tint px-2 py-1 text-[11px] font-bold text-egmf-primary">
                      {mappedRows.length} cây
                    </span>
                  </header>
                  <div className="space-y-2.5 p-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 sm:p-4">
                  {mappedRows.length === 0 && (
                    <p className="m-0 rounded-xl border border-dashed border-egmf-border bg-egmf-surface-subtle p-5 text-center text-sm text-egmf-muted sm:col-span-2">
                      Chưa có cây nào được lưu. Mở tab Quét cây để bắt đầu.
                    </p>
                  )}
                  {mappedRows.map((row) => (
                    <article
                      key={row.Qr}
                      className="rounded-xl border border-egmf-border bg-white p-3 shadow-sm transition hover:border-egmf-primary-border"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <strong className="break-all text-sm font-extrabold text-egmf-ink">
                          {row.MaCay}
                        </strong>
                        <button
                          disabled={closed || busy}
                          onClick={() => openModal(row, true)}
                          className="flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-egmf-primary-border bg-egmf-primary-tint px-2.5 text-xs font-bold text-egmf-primary transition hover:bg-egmf-primary-soft disabled:opacity-40"
                        >
                          <PencilLine size={16} /> Sửa
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-egmf-primary">
                        <span>Roll: {row.SoRoll || "—"}</span>
                        <span>
                          {fmt(row.Quantity)} {row.DVT}
                        </span>
                        <span className="text-egmf-muted">
                          {fmt(row.SoYard)} yard · {fmt(row.SoMet)} mét
                        </span>
                      </div>
                      <p className="m-0 mt-2 line-clamp-2 border-t border-egmf-border-subtle pt-2 text-xs leading-5 text-egmf-muted">
                        {row.Item || row.TenVatTu} · Màu: {row.MaMau || "—"}
                      </p>
                    </article>
                  ))}
                  </div>
                </section>
              )}
            </>
          )}
          {pageError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {pageError}
            </p>
          )}
        </div>
      </main>
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
          role="presentation"
        >
          <form
            onSubmit={save}
            role="dialog"
            aria-modal="true"
            aria-labelledby="roll-popup-title"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <header className="flex items-center justify-between gap-2 border-b border-egmf-border px-4 py-3">
              <div>
                <h2
                  id="roll-popup-title"
                  className="text-lg font-extrabold text-egmf-ink"
                >
                  {modal.editing ? "Sửa thông tin cây" : "Nhập thông tin cây"}
                </h2>
                <p className="font-bold text-egmf-primary">
                  {modal.row.MaCay || modal.row.Qr}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                aria-label="Đóng popup"
                onClick={() => {
                  setModal(null);
                  setError("");
                }}
                className="rounded-lg p-2 text-egmf-muted"
              >
                <X size={22} />
              </button>
            </header>
            <div className="space-y-3 px-4 py-4">
              <p className="line-clamp-2 text-sm font-semibold text-egmf-ink">
                {modal.row.TenVatTu}
              </p>
              <p className="text-sm text-egmf-muted">
                {modal.row.Item} · Màu {modal.row.MaMau || "—"} · Phiếu{" "}
                {receipt.MaPhieu}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-bold text-egmf-ink">
                  Số roll
                  <input
                    ref={rollInput}
                    className={field}
                    value={roll}
                    autoComplete="off"
                    maxLength={250}
                    disabled={busy}
                    onChange={(event) => setRoll(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        quantityInput.current?.focus();
                        quantityInput.current?.select();
                      }
                    }}
                  />
                </label>
                <label className="block text-sm font-bold text-egmf-ink">
                  Số lượng ({inputUnit === "YDS" ? "yard" : "mét"})
                  <input
                    ref={quantityInput}
                    className={field}
                    inputMode="decimal"
                    value={quantity}
                    autoComplete="off"
                    disabled={busy}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </label>
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
            </div>
            <div className="px-4 pb-3">
              <label className="block text-sm font-bold text-egmf-ink">
                Đơn vị nhập
                <select
                  className={field}
                  value={inputUnit}
                  disabled={busy}
                  onChange={(event) => setInputUnit(event.target.value)}
                >
                  <option value="YDS">Yard (yd)</option>
                  <option value="M">Mét (m)</option>
                </select>
              </label>
              <p className="mt-1 text-xs text-egmf-muted">
                Số lượng được quy đổi về ĐVT vật tư ({modal.row.DVT}) khi lưu.
              </p>
            </div>
            <footer className="sticky bottom-0 flex gap-2 border-t border-egmf-border bg-white px-4 py-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setModal(null);
                  setError("");
                }}
                className="rounded-xl border border-egmf-border px-4 py-3 font-semibold text-egmf-muted"
              >
                Hủy
              </button>
              <button
                disabled={busy}
                className="flex-1 rounded-xl bg-egmf-primary px-4 py-3 font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Đang lưu…"
                  : modal.editing
                    ? "Lưu thay đổi"
                    : "Lưu & quét tiếp"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </MainLayout>
  );
}
