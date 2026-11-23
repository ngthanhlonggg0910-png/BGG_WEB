import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  PackageCheck,
  Search,
} from "lucide-react";

import SelectSampleInspection from "../components/SelectSampleInspection";
import SelectedInspectionType from "../components/SelectedInspectionType";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import SampleImageCard from "../components/SampleImageCard";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import { displayPreviewValue } from "../utils/sampleInspection.utils";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const actions = [
  { label: "Kiểm mẫu", icon: ClipboardCheck },
  { label: "Xem tài liệu kỹ thuật", icon: FileText },
];
const detailGridClass =
  "grid grid-cols-2 gap-x-5 gap-y-3 sm:gap-x-6 [&>div]:min-w-0 [&_dt]:leading-4 [&_dd]:mt-0.5 [&_dd]:leading-5 [&_dd]:break-words";

import {
  layThongTinGiayDeNghiTheoBarcodeMau,
  layDanhSachFileTaiLieuTheoBarcodeMau,
  layTrangThaiTheoBarcodeMau,
  capNhatTrangThaiBarcodeMau,
} from "../api/technical-department.api";

import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";

export default function SampleInspectionPage() {
  const [barCodeMau, setBarCodeMau] = useState("");
  const [thongTinPhieu, setThongTinPhieu] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [expanded, setExpanded] = useState(false); //
  const [isLoading, setIsLoading] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
  const [dsFileName, setDsFileName] = useState([]);
  const [dsFile, setDsFile] = useState([]);
  const [loadingFile, setLoadingFile] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const [modeModal, setModeModal] = useState("Chọn loại");
  const [selectedType, setSelectedType] = useState("QA"); //CHỌN LOẠI KIỂM
  const [kqKiem, setKqKiem] = useState("");

  const navigate = useNavigate();

  console.log(kqKiem);
  //LẤY RA DANH SÁCH FILE THUỘC BarcodeMau
  const fetchDsFile = async () => {
    setLoadingFile(true);
    try {
      const response = await layDanhSachFileTaiLieuTheoBarcodeMau(barCodeMau);
      if (!response.success) {
        showErrorToast(response.message);
        setDsFile([]);
        return;
      }
      setDsFile(response?.data || []);
      return response?.data;
    } catch (error) {
      console.error("Lấy danh sách file lỗi: ", error);
      showErrorToast(error.message);
      setDsFile([]);
    } finally {
      setLoadingFile(false);
    }
  };

  //XỬ LÝ CÁC NÚT CHỨC NĂNG
  const handleAction = async (action) => {
    switch (action) {
      case "Xem tài liệu kỹ thuật": {
        try {
          setSelectedDocumentIndex(0);
          setIsDocumentModalOpen(true);
          const data = await fetchDsFile();
          console.log("data: ", data);
          setDsFileName(
            data.map((item) => item.DuongDanLocal.split("/").pop()),
          );
        } catch (error) {
          console.error(error);
        }
        break;
      }

      case "Kiểm mẫu": {
        try {
          setOpenPopup(true);
        } catch (error) {}
      }

      default:
        "Chức năng chưa hỗ trợ";
        break;
    }
  };

  console.log(modeModal, kqKiem);

  const handleComfirmModal = async () => {
    console.log(modeModal);
    if (modeModal === "Chọn loại") {
      setModeModal("Chọn kết quả kiểm");
      return;
    }

    if (
      modeModal === "Chọn kết quả kiểm" &&
      ["HÀNG ĐẠT", "CHƯA KIỂM"].includes(kqKiem)
    ) {
      const payload = {
        TrangThai: kqKiem,
        isSua: kqKiem === "HÀNG SỬA" ? true : false,
        BarcodeMau: barCodeMau,
        LoaiKiemMau: selectedType,
      };

      const response = await capNhatTrangThaiBarcodeMau(payload);
      if (!response.success) {
        showErrorToast(response.message || "Cập nhật trạng thái thất bại");
        return;
      }
      showSuccessToast(response.message || "Cập nhật trạng thái thành công");
      setOpenPopup(false);
      setModeModal("Chọn loại");
      fetchTTGiayDeNghi();
    }

    if (
      modeModal === "Chọn kết quả kiểm" &&
      ["HÀNG LỖI", "HÀNG SỬA"].includes(kqKiem)
    ) {
      navigate("/sample-inspection/defects", {
        state: {
          barcodeMau: barCodeMau,
          loaiKiem: selectedType,
          kqKiem,
        },
      });
    }
  };

  // console.log(modeModal);

  const fetchTTGiayDeNghi = async () => {
    setIsLoading(true);
    try {
      const [response1, response2] = await Promise.all([
        layThongTinGiayDeNghiTheoBarcodeMau(barCodeMau),
        layTrangThaiTheoBarcodeMau(barCodeMau),
      ]);

      const data1 = response1?.data ?? response1;
      const data2 = response2?.data ?? response2;
      if (response1?.success === false) {
        showErrorToast(
          `Lỗi BE: ${response1.message || "Không thể lấy thông tin phiếu đề nghị"}`,
        );
        setThongTinPhieu({});
        return;
      }
      if (response2?.success === false) {
        showErrorToast(
          `Lỗi BE: ${response2.message || "Không thể trạng thái của BarcodeMau"}`,
        );
        setThongTinPhieu({});
        return;
      }
      setThongTinPhieu(
        {
          ...data1,
          ...data2,
        } || {},
      );
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
    setHasSearched(true);
    fetchTTGiayDeNghi();
  };

  return (
    <MainLayout screenTitle="Phòng kỹ thuật">
      <div className="flex min-h-full flex-1 flex-col bg-egmf-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
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
              </div>
            </div>
          </section>

          {hasSearched ? (
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
                        className="group flex min-h-12 items-center gap-3 rounded-xl border border-egmf-primary-border-soft bg-egmf-primary-soft px-3.5 text-left text-egmf-primary shadow-sm transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
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
                    <span className="size-2 rounded-full bg-rose-500" /> Cần xử
                    lý
                  </span>
                </header>
                <div className="p-3 sm:p-4 [&_dt]:!text-xs [&_dd]:!text-sm [&_h3]:!text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <p className="m-0 text-xs font-bold uppercase tracking-[0.04em]">
                        Trạng thái QA
                      </p>
                      <p
                        className={`
                      m-0 mt-1 text-base font-extrabold
                      ${
                        thongTinPhieu.TrangThai === "HÀNG LỖI"
                          ? "text-red-500"
                          : thongTinPhieu.TrangThai === "HÀNG ĐẠT"
                            ? "text-green-500"
                            : thongTinPhieu.TrangThai === "HÀNG SỬA"
                              ? "text-orange-500"
                              : "text-slate-500"
                      }
                    `}
                      >
                        {displayPreviewValue(thongTinPhieu.TrangThai)}
                      </p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-bold uppercase tracking-[0.04em]">
                        Trạng thái Autonomy
                      </p>
                      <p
                        className={`
                      m-0 mt-1 text-base font-extrabold
                      ${
                        thongTinPhieu.TrangThaiAutonomy === "HÀNG LỖI"
                          ? "text-red-500"
                          : thongTinPhieu.TrangThaiAutonomy === "HÀNG ĐẠT"
                            ? "text-green-500"
                            : thongTinPhieu.TrangThaiAutonomy === "HÀNG SỬA"
                              ? "text-orange-500"
                              : "text-slate-500"
                      }
                    `}
                      >
                        {displayPreviewValue(thongTinPhieu.TrangThaiAutonomy)}
                      </p>
                    </div>
                  </div>

                  <dl className={`mt-3 ${detailGridClass}`}>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Mã hàng
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.MaHang)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Mùa
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.Mua)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Brand
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.Brand)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Màu
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.Mau)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Size
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.Size)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Loại mẫu
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.LoaiMau)}
                      </dd>
                    </div>
                    <div className="col-span-full min-w-0 sm:col-span-2">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        KTTP
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.TenKTTP)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Nhóm may
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.NhomMay)}
                      </dd>
                    </div>
                    <div className="col-span-full min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Ngày đồng bộ
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(
                          formatDateTime(thongTinPhieu.NgayDongBo),
                        )}
                      </dd>
                    </div>
                    <div className="col-span-full min-w-0">
                      <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                        Danh sách người may mẫu
                      </dt>
                      <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                        {displayPreviewValue(thongTinPhieu.DanhSachNguoiMayMau)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => setExpanded((current) => !current)}
                    aria-expanded={expanded}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-egmf-primary-border-soft bg-egmf-primary-soft px-4 text-base font-extrabold text-egmf-primary shadow-sm transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
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
                        <dl className={detailGridClass}>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Trạng thái API
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.StatusCode)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Barcode mẫu
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.BarcodeMau)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Mã Master
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.MasterId)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              ID thông tin SP
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.IdProductInformation,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Site
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.Site)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Mã khách hàng
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.MaKhachHang)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Chủng loại
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.ChungLoai)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              PLI
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.PLI)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              PE/PM
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.PePm)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              R3 code
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.R3Code)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày đề nghị
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayDeNghi),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Hình thức TT
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.HinhThucThanhToan,
                              )}
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
                              {displayPreviewValue(thongTinPhieu.SLXuat)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              SL lưu
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.SLLuu)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Tổng SL
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.TongSL)}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ghi chú KTTP
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.GhiChuKTTP)}
                            </dd>
                          </div>
                        </dl>
                      </section>

                      <section>
                        <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                          Cắt & gửi mẫu
                        </h3>
                        <dl className={detailGridClass}>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Xác nhận QL phòng
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.XacNhanQLPhong,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày cắt
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayCat),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày yêu cầu gửi mẫu
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayYeuCauGuiMau),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Người yêu cầu gửi mail
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.NguoiYeuCauGuiMai,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày thực tế gửi mail
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayThucTeGuiMai),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Số lần gửi mail
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.SoLanGuiMailAutonomy,
                              )}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ghi chú cắt
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.GhiChuCat)}
                            </dd>
                          </div>
                        </dl>
                      </section>

                      <section>
                        <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                          Duyệt mẫu
                        </h3>
                        <dl className={detailGridClass}>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Kết quả duyệt mẫu
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.KetQuaDuyetMau,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày nhận KQ duyệt
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(
                                  thongTinPhieu.NgayNhanKQDuyetMau,
                                ),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Kết quả GOPROD
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.KqGOPROD)}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Lý do NOK
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.LyDoNOK)}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              NOK từ
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.LyDoNOKFrom)}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ghi chú tiến độ mẫu
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.GhiChuTienDoMau,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày gửi mẫu lần 2
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayGuiMau2),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Kết quả duyệt lần 2
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.KetQuaDuyetMau2,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày nhận KQ lần 2
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayNhanKQ2),
                              )}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Lý do NOK lần 2
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.LyDoNOK2)}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ghi chú gửi lần 2
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.GhiChuGui2)}
                            </dd>
                          </div>
                        </dl>
                      </section>

                      <section>
                        <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-egmf-primary">
                          Thống kê & xác nhận
                        </h3>
                        <dl className={detailGridClass}>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ngày xuất
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.NgayXuat),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              SL xuất thống kê
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.SLXuatThongKe)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              SL xuất còn lại
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.SLXuatConLai)}
                            </dd>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Ghi chú thống kê
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.GhiChuThongKe)}
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
                              {displayPreviewValue(thongTinPhieu.NguoiXacNhan)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Thời gian xác nhận
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.ThoiGianXacNhan),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Người tạo
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.NguoiTao)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Tài khoản tạo
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.TKId)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Thời gian tạo
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                formatDateTime(thongTinPhieu.ThoiGianTao),
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              New/Recolor/Carry Over
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.NewRecolorCarryOver,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Số người may mẫu
                            </dt>
                            <dd className="m-0 text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(thongTinPhieu.SoNguoiMayMau)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase text-egmf-muted">
                              Người chỉnh sửa mới nhất
                            </dt>
                            <dd className="m-0 break-words text-[13px] font-semibold text-egmf-ink-secondary">
                              {displayPreviewValue(
                                thongTinPhieu.NguoiChinhSuaMoiNhat,
                              )}
                            </dd>
                          </div>
                        </dl>
                      </section>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <section className="mt-4 mb-4 flex min-h-52 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-raised px-5 py-8 text-center sm:min-h-60 md:mb-0 md:flex-none">
              <span className="grid size-12 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                <Search size={24} strokeWidth={2} />
              </span>
              <h2 className="m-0 mt-4 text-base font-extrabold text-egmf-ink">
                Tra cứu phiếu kiểm mẫu
              </h2>
              <p className="m-0 mt-1 max-w-md text-sm leading-6 text-egmf-muted">
                Nhập hoặc quét mã phiếu để xem trạng thái, thông tin mẫu và tài
                liệu kỹ thuật.
              </p>
            </section>
          )}
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        fileNames={dsFileName}
        hasDocuments={Boolean(dsFile.length)}
        isLoadingFiles={loadingFile}
        selectedIndex={selectedDocumentIndex}
        onSelectedIndexChange={setSelectedDocumentIndex}
      />

      {openPopup && (
        <Modal
          title="Kiểm mẫu"
          open={openPopup}
          onCancel={() => setOpenPopup(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          onOk={handleComfirmModal}
        >
          {modeModal === "Chọn loại" && (
            <SelectedInspectionType
              value={selectedType}
              onChange={setSelectedType}
            />
          )}
          {modeModal === "Chọn kết quả kiểm" && (
            <SelectSampleInspection
              barcodeMau={barCodeMau}
              loai={selectedType}
              value={kqKiem}
              onChange={setKqKiem}
            />
          )}
        </Modal>
      )}
    </MainLayout>
  );
}
