import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  PackageCheck,
  Search,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import SampleImageCard from "../components/SampleImageCard";

const actions = [{ label: "Xem tài liệu kỹ thuật", icon: FileText }];

import { layThongTinGiayDeNghiTheoBarcodeMau } from "../api/technical-department.api";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function SampleInspectionPage() {
  const [barCodeMau, setBarCodeMau] = useState("");
  const [thongTinPhieu, setThongTinPhieu] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTTGiayDeNghi = async () => {
    setIsLoading(true);
    try {
      const response = await layThongTinGiayDeNghiTheoBarcodeMau(barCodeMau);
      const receiptInfo = response?.data ?? response;
      if (response?.success === false || receiptInfo?.StatusCode === 0) {
        showErrorToast(
          `Lỗi BE: ${response.message || "Không thể lấy thông tin phiếu đề nghị"}`,
        );
        setThongTinPhieu({});
        return;
      }
      setThongTinPhieu(receiptInfo || {});
      setExpanded(false);
    } catch (error) {
      console.error("[FE][Lấy thông tin phiếu đề nghị]:", error);
      showErrorToast(
        `Lỗi FE: ${error.message || "Không thể kết nối hoặc xử lý dữ liệu phiếu đề nghị"}`,
      );
      setThongTinPhieu({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!barCodeMau.trim()) {
      showErrorToast("Vui lòng nhập hoặc quét Barcode màu");
      return;
    }
    fetchTTGiayDeNghi();
  };

  const handleAction = (action) => {
    console.log("Chức năng kiểm mẫu:", action);
  };

  return (
    <MainLayout screenTitle="Kiểm mẫu">
      <div className="min-h-full bg-egmf-surface">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
          <div className="mb-3 hidden items-end justify-between gap-4 md:flex">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-egmf-primary">
                Phòng kỹ thuật
              </p>
              <h1 className="m-0 mt-1 text-2xl font-extrabold tracking-tight text-egmf-ink">
                Kiểm mẫu
              </h1>
            </div>
            <p className="m-0 text-sm text-egmf-muted">
              Tra cứu và xử lý phiếu mẫu
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
            <header className="flex min-h-14 items-center gap-2.5 border-b border-egmf-border-subtle px-3.5 py-3 sm:px-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                <Search size={17} strokeWidth={2.25} />
              </span>
              <h2 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                Tra cứu phiếu
              </h2>
            </header>
            <div className="p-3 sm:p-4">
              <div className="relative min-w-0">
                <label>
                  <span className="sr-only">Mã phiếu kiểm mẫu</span>
                  <Search
                    aria-hidden="true"
                    size={20}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-egmf-muted"
                  />
                  <input
                    value={barCodeMau}
                    onChange={(event) => setBarCodeMau(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && handleSearch()
                    }
                    placeholder="Nhập mã phiếu"
                    className="h-12 w-full rounded-xl border border-egmf-border bg-white py-2 pl-11 pr-[76px] text-base font-semibold text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading}
                  aria-label="Xem phiếu"
                  className="absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center justify-center gap-1 rounded-lg bg-egmf-primary px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/25 disabled:cursor-wait disabled:opacity-70"
                >
                  Xem
                </button>
              </div>
            </div>
          </section>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)] xl:gap-5">
            <div className="contents">
              <section className="order-1 overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card xl:col-span-2">
                <header className="flex min-h-14 items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                      <ClipboardCheck size={17} strokeWidth={2.25} />
                    </span>
                    <h2 className="m-0 truncate text-[15px] font-extrabold text-egmf-ink">
                      Thao tác nhanh
                    </h2>
                  </div>
                  <span className="rounded-full bg-egmf-primary-tint px-2.5 py-1 text-xs font-bold text-egmf-primary">
                    {actions.length} thao tác
                  </span>
                </header>
                <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 sm:p-4">
                  {actions.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleAction(label)}
                      className="group flex min-h-12 items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3.5 text-left text-amber-700 transition hover:border-amber-200 hover:bg-amber-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                    >
                      <Icon
                        size={20}
                        strokeWidth={2.2}
                        className="transition-transform group-hover:scale-110"
                      />
                      <span className="text-sm font-extrabold leading-4">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="order-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-5">
                <SampleImageCard title="Ảnh mặt trước" src="" />
                <SampleImageCard title="Ảnh mặt sau" src="" />
              </div>
            </div>

            <section className="order-2 overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
              <header className="flex min-h-14 items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                    <PackageCheck size={17} strokeWidth={2.25} />
                  </span>
                  <h2 className="m-0 truncate text-[15px] font-extrabold text-egmf-ink">
                    Thông tin phiếu
                  </h2>
                </div>
                <span className="hidden items-center gap-1.5 text-xs font-bold text-egmf-muted sm:flex">
                  <span className="size-2 rounded-full bg-rose-500" /> Cần xử lý
                </span>
              </header>
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.04em] text-rose-600">
                      Kết quả duyệt mẫu
                    </p>
                    <p className="m-0 mt-1 text-sm font-extrabold text-rose-700">
                      {thongTinPhieu.KetQuaDuyetMau ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.04em] text-amber-700">
                      Kết quả GOPROD
                    </p>
                    <p className="m-0 mt-1 text-sm font-extrabold text-amber-800">
                      {thongTinPhieu.KqGOPROD ?? "—"}
                    </p>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Mã hàng
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.MaHang ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Mùa
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.Mua ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Brand
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.Brand ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Màu
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.Mau ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Size
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.Size ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Loại mẫu
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.LoaiMau ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      KTTP
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.TenKTTP ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Nhóm may
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.NhomMay ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-3">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Ngày đồng bộ
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {formatDateTime(thongTinPhieu.NgayDongBo)}
                    </dd>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-3">
                    <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                      Danh sách người may mẫu
                    </dt>
                    <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                      {thongTinPhieu.DanhSachNguoiMayMau ?? "—"}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => setExpanded((current) => !current)}
                  aria-expanded={expanded}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-4 text-sm font-extrabold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                >
                  {expanded
                    ? "Thu gọn thông tin chi tiết"
                    : "Xem thông tin chi tiết"}
                  {expanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                {expanded && (
                  <div className="mt-3 space-y-4 border-t border-egmf-border-subtle pt-3">
                    <section>
                      <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                        Thông tin yêu cầu
                      </h3>
                      <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Trạng thái API
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.StatusCode ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Barcode mẫu
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.BarcodeMau ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Mã Master
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.MasterId ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            ID thông tin SP
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.IdProductInformation ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Site
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.Site ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Mã khách hàng
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.MaKhachHang ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Chủng loại
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.ChungLoai ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            PLI
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.PLI ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            PE/PM
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.PePm ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            R3 code
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.R3Code ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày đề nghị
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayDeNghi)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Hình thức TT
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.HinhThucThanhToan ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Có mẫu
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.IsCoMau == null
                              ? "—"
                              : thongTinPhieu.IsCoMau
                                ? "Có"
                                : "Không"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            SL xuất
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.SLXuat ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            SL lưu
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.SLLuu ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Tổng SL
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.TongSL ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ghi chú KTTP
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.GhiChuKTTP ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section>
                      <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                        Cắt & gửi mẫu
                      </h3>
                      <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Xác nhận QL phòng
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.XacNhanQLPhong ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày cắt
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayCat)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày yêu cầu gửi mẫu
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayYeuCauGuiMau)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Người yêu cầu gửi mail
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.NguoiYeuCauGuiMai ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày thực tế gửi mail
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayThucTeGuiMai)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Số lần gửi mail
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.SoLanGuiMailAutonomy ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ghi chú cắt
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.GhiChuCat ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section>
                      <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                        Duyệt mẫu
                      </h3>
                      <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Kết quả duyệt mẫu
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.KetQuaDuyetMau ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày nhận KQ duyệt
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayNhanKQDuyetMau)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Kết quả GOPROD
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.KqGOPROD ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Lý do NOK
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.LyDoNOK ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            NOK từ
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.LyDoNOKFrom ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ghi chú tiến độ mẫu
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.GhiChuTienDoMau ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày gửi mẫu lần 2
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayGuiMau2)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Kết quả duyệt lần 2
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.KetQuaDuyetMau2 ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày nhận KQ lần 2
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayNhanKQ2)}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Lý do NOK lần 2
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.LyDoNOK2 ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ghi chú gửi lần 2
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.GhiChuGui2 ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section>
                      <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                        Thống kê & xác nhận
                      </h3>
                      <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ngày xuất
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.NgayXuat)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            SL xuất thống kê
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.SLXuatThongKe ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            SL xuất còn lại
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.SLXuatConLai ?? "—"}
                          </dd>
                        </div>
                        <div className="col-span-3">
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Ghi chú thống kê
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.GhiChuThongKe ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Hoàn thành giấy đề nghị
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.XacNhanHoanThanhGiayDeNghi == null
                              ? "—"
                              : thongTinPhieu.XacNhanHoanThanhGiayDeNghi
                                ? "Có"
                                : "Không"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Người xác nhận
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.NguoiXacNhan ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Thời gian xác nhận
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.ThoiGianXacNhan)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Người tạo
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.NguoiTao ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Tài khoản tạo
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.TKId ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Thời gian tạo
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {formatDateTime(thongTinPhieu.ThoiGianTao)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            New/Recolor/Carry Over
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.NewRecolorCarryOver ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Số người may mẫu
                          </dt>
                          <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.SoNguoiMayMau ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                            Người chỉnh sửa mới nhất
                          </dt>
                          <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                            {thongTinPhieu.NguoiChinhSuaMoiNhat ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
