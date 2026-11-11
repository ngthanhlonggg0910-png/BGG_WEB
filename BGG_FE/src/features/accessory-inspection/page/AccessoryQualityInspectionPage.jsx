import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  PackageSearch,
  X,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import DeclaredAccessoryDefectCard from "../components/DeclaredAccessoryDefectCard";
import ScannedRollsManagerSection from "../../mapping-qr/components/ScannedRollsManagerSection";
import { useLocation } from "react-router-dom";
import {
  getAccessoryDefects,
  saveAccessoryInspectionRate,
  updateHuongXuLy,
  updateTrangThai,
  khaiBaoLoiPhuLieu,
  layDanhSachLoiKhaiBao,
  xoaLoiKhaiBao,
} from "../api/accessoryInspectionApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";
import { getComputerName } from "../../../shared/utils/getComputerName";

const CUSTOM_AQL_RATE = "Theo AQL %";
const PROCESSING_ACTIONS = {
  WAITING: { apiValue: "ChoXuLy", label: "Chờ xử lý", isPass: false },
  PASS: { apiValue: "Pass", label: "Pass", isPass: true },
};

function getInspectionRateSelection(selectedRate, customPercentage) {
  switch (selectedRate) {
    case "Theo AQL 4.0":
      return {
        LoaiTiLe: "AQL4",
        TiLe: 0,
      };
    case "Theo AQL 2.5":
      return {
        LoaiTiLe: "AQL25",
        TiLe: 0,
      };
    case "Theo AQL 1.0":
      return {
        LoaiTiLe: "AQL1",
        TiLe: 0,
      };
    case CUSTOM_AQL_RATE: {
      const TiLe = Number(customPercentage);

      if (!Number.isFinite(TiLe) || TiLe <= 0) return null;

      return {
        LoaiTiLe: "AQL0",
        TiLe,
      };
    }
    default:
      return null;
  }
}

export default function AccessoryQualityInspectionPage() {
  const [inspectionRate, setInspectionRate] = useState("");
  const [pendingInspectionRate, setPendingInspectionRate] = useState("");
  const [pendingAqlPercentage, setPendingAqlPercentage] = useState("");
  const [isSavingInspectionRate, setIsSavingInspectionRate] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState("");
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [defectOptions, setDefectOptions] = useState([]);
  const [isLoadingDefects, setIsLoadingDefects] = useState(false);
  const [pendingDefectCode, setPendingDefectCode] = useState("");
  const [pendingDefectQuantity, setPendingDefectQuantity] = useState("");
  const [isSavingDefect, setIsSavingDefect] = useState(false);
  const defectRequestInFlightRef = useRef(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [isConfirmingInspection, setIsConfirmingInspection] = useState(false);
  const [isInspectionRateModalOpen, setIsInspectionRateModalOpen] =
    useState(false);
  const [isUpdatingProcessingStatus, setIsUpdatingProcessingStatus] =
    useState(false);
  const [isConfirmInspectionModalOpen, setIsConfirmInspectionModalOpen] =
    useState(false);
  const [dsKhaiBaoLoi, setDsKhaiBaoLoi] = useState([]);
  const location = useLocation();
  const user = getCurrentUser();
  const TKId = user?.data?.TKId;
  const processingOption = PROCESSING_ACTIONS[processingAction];
  const tenNguoiTao = [user?.data?.HoVaTenLot, user?.data?.Ten]
    .filter(Boolean)
    .join(" ");

  // Dữ liệu mẫu - thay bằng dữ liệu API.
  const materialInfo = {
    maVatTu: location.state?.item?.MatVatTuGhep || "",
    idCTPGD: location.state?.item?.CTPGDId || "",
    pgdId: location.state?.pgdId || "",
    maPhieu: location?.state?.maPhieu || "",
  };

  const inspectionRateOptions = [
    "Theo AQL 4.0",
    "Theo AQL 2.5",
    "Theo AQL 1.0",
    CUSTOM_AQL_RATE,
  ];

  const fetchDsLoiKhaiBao = async () => {
    try {
      const response = await layDanhSachLoiKhaiBao();
      if (!response.success) {
        return;
      }
      setDsKhaiBaoLoi(response.data ?? []);
    } catch (error) {
      console.error("Có lỗi lấy ds lỗi khai báo FE: ", error);
    }
  };

  useEffect(() => {
    fetchDsLoiKhaiBao();
  }, []);

  const handleSelectRate = () => {
    const isCustomAqlRate =
      inspectionRate.startsWith("Theo AQL ") &&
      !inspectionRateOptions.includes(inspectionRate);

    setPendingInspectionRate(
      isCustomAqlRate ? CUSTOM_AQL_RATE : inspectionRate,
    );
    setPendingAqlPercentage(
      isCustomAqlRate
        ? inspectionRate.replace("Theo AQL ", "").replace("%", "")
        : "",
    );
    setIsInspectionRateModalOpen(true);
  };

  const handleCloseInspectionRateModal = () => {
    setIsInspectionRateModalOpen(false);
    setPendingInspectionRate("");
    setPendingAqlPercentage("");
  };

  //xử lý khi ấn kiểm tỷ lệ
  const handleUpdateInspectionRate = async () => {
    if (isSavingInspectionRate) return;

    const selectedRate = getInspectionRateSelection(
      pendingInspectionRate,
      pendingAqlPercentage,
    );

    if (!selectedRate) {
      showErrorToast("Tỷ lệ kiểm không hợp lệ.");
      return;
    }

    const payload = {
      CTPGDId: Number(materialInfo.idCTPGD),
      LoaiTiLe: selectedRate.LoaiTiLe,
      TiLe: selectedRate.TiLe,
    };

    setIsSavingInspectionRate(true);

    try {
      const response = await saveAccessoryInspectionRate(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Cập nhật tỷ lệ kiểm thất bại.");
      }

      setInspectionRate("");
      handleCloseInspectionRateModal();
      showSuccessToast(response.message || "Đã cập nhật tỷ lệ kiểm.");
    } catch (error) {
      console.error("Không thể cập nhật tỷ lệ kiểm:", error);
      showErrorToast(error.message || "Không thể cập nhật tỷ lệ kiểm.");
    } finally {
      setIsSavingInspectionRate(false);
    }
  };

  //Lấy danh sách lỗi
  const handleSelectDefect = async () => {
    defectRequestInFlightRef.current = false;
    setIsDefectModalOpen(true);
    setPendingDefectCode("");
    setPendingDefectQuantity("");
    setIsLoadingDefects(true);

    try {
      const response = await getAccessoryDefects();

      if (!response?.success) {
        throw new Error(response?.message || "Không thể lấy danh sách lỗi.");
      }

      setDefectOptions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Không thể lấy danh sách lỗi phụ liệu:", error);
      setDefectOptions([]);
      showErrorToast(error.message || "Không thể lấy danh sách lỗi phụ liệu.");
    } finally {
      setIsLoadingDefects(false);
    }
  };

  //Đóng modal
  const handleCloseDefectModal = () => {
    setIsDefectModalOpen(false);
    setPendingDefectCode("");
    setPendingDefectQuantity("");
  };

  //Khai báo lỗi
  const handleUpdateDefect = async () => {
    if (defectRequestInFlightRef.current) return;

    const selectedOption = defectOptions.find(
      (defect) => String(defect.MaLoi) === pendingDefectCode,
    );
    const quantity = Number(pendingDefectQuantity);

    if (!selectedOption || !Number.isFinite(quantity) || quantity <= 0) {
      showErrorToast("Vui lòng chọn lỗi và nhập số lượng hợp lệ.");
      return;
    }

    defectRequestInFlightRef.current = true;
    setIsSavingDefect(true);
    let savedSuccessfully = false;

    try {
      const payload = {
        CTPGDId: Number(materialInfo.idCTPGD),
        MaLoi: selectedOption.MaLoi,
        SoLuongLoi: quantity,
        TenNguoiTao: tenNguoiTao,
      };
      const response = await khaiBaoLoiPhuLieu(payload);
      if (!response.success || response.data?.KetQua !== 1) {
        showErrorToast(response.message || "Khai báo lỗi thất bại");
        return;
      }

      savedSuccessfully = true;
      showSuccessToast(response.message || "Khai báo lỗi thành công");
      setSelectedDefect("");
      handleCloseDefectModal();
      fetchDsLoiKhaiBao();
    } catch (error) {
      console.error("Lỗi khai báo phụ liệu FE: ", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi khai báo lỗi phụ liệu.",
      );
    } finally {
      if (!savedSuccessfully) {
        defectRequestInFlightRef.current = false;
      }
      setIsSavingDefect(false);
    }
  };

  //Cập nhật hướng xử lý
  const confirmProcessingStatus = async () => {
    if (isUpdatingProcessingStatus || !processingOption) return;

    const CTPGDId = Number(materialInfo.idCTPGD);

    if (!Number.isSafeInteger(CTPGDId) || CTPGDId <= 0) {
      showErrorToast("Không tìm thấy chi tiết phiếu giám định.");
      return;
    }

    setIsUpdatingProcessingStatus(true);

    try {
      const response = await updateHuongXuLy(
        processingOption.apiValue,
        CTPGDId,
      );

      if (!response?.success) {
        throw new Error(response?.message || "Cập nhật hướng xử lý thất bại.");
      }

      setProcessingAction(null);
      showSuccessToast(response.message || "Đã cập nhật hướng xử lý.");
    } catch (error) {
      console.error("Không thể cập nhật hướng xử lý:", error);
      showErrorToast(error.message || "Không thể cập nhật hướng xử lý.");
    } finally {
      setIsUpdatingProcessingStatus(false);
    }
  };

  const handleOpenConfirmInspectionModal = () => {
    setIsConfirmInspectionModalOpen(true);
  };

  const handleCloseConfirmInspectionModal = () => {
    setIsConfirmInspectionModalOpen(false);
  };

  const handleSubmitConfirmInspection = async () => {
    if (isConfirmingInspection) return;

    const PGDId = Number(materialInfo.pgdId);

    if (!Number.isSafeInteger(PGDId) || PGDId <= 0) {
      showErrorToast("Không tìm thấy phiếu giám định.");
      return;
    }

    setIsConfirmingInspection(true);

    try {
      const payload = {
        PGDId: PGDId,
        TrangThai: "DAXACNHAN",
        NoiDung:
          "Cập nhật Đã xác nhận PGD phụ liệu từ ứng dụng WebApp (Kiểm PL)",
        NguoiThayDoi: tenNguoiTao,
        TaiKhoanThayDoi: TKId,
        MACAddress: "",
        ComputerName: getComputerName(),
      };

      const response = await updateTrangThai(payload);
      if (!response?.success || response?.data?.KetQua !== 1) {
        showErrorToast(response.message || "Xác nhận phiếu giám định thất bại");
        return;
      }
      handleCloseConfirmInspectionModal();
      showSuccessToast(
        response.message || "Xác nhận phiếu giám định thành công",
      );
    } catch (error) {
      console.error("Lỗi xác nhận phiếu giám định FE: ", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Không thể xác nhận phiếu giám định.",
      );
    } finally {
      setIsConfirmingInspection(false);
    }
  };

  const handleDeleteLoiKhaiBao = async (Id) => {
    if (!Number.isSafeInteger(Number(Id)) || Number(Id) <= 0) {
      showErrorToast("ID lỗi phụ liệu không hợp lệ");
      return;
    }
    try {
      const response = await xoaLoiKhaiBao(Id);
      if (!response?.success || response?.rowsAffected < 1) {
        showErrorToast(response?.message || "Xóa lỗi phụ liệu thất bại");
        return;
      }
      showSuccessToast(response.message || "Xóa lỗi phụ liệu thành công");
      // Tải lại danh sách lỗi sau khi xóa
      await fetchDsLoiKhaiBao();
    } catch (error) {
      console.error("Lỗi xóa phụ liệu FE:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa lỗi phụ liệu.",
      );
    }
  };

  const actionButtonClass =
    "flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-egmf-border bg-white p-4 text-center text-sm font-extrabold leading-tight text-egmf-primary transition hover:border-egmf-primary hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:scale-[0.98]";
  const wideActionButtonClass =
    "flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-4 py-3 text-sm font-bold text-egmf-primary transition hover:border-egmf-primary hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:scale-[0.98]";

  return (
    <MainLayout
      screenTitle={materialInfo.maVatTu}
      headerBackTo="/accessory-inspection"
    >
      <div className="min-h-full bg-egmf-surface text-egmf-ink">
        <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-7 lg:px-8">
          <section className="rounded-2xl border border-egmf-border bg-white p-4 shadow-egmf-card sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                <ListChecks size={17} strokeWidth={2.4} />
              </span>
              <div>
                <h2 className="m-0 text-base font-extrabold text-egmf-ink">
                  Cập nhật kết quả kiểm
                </h2>
                <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                  Chọn thông tin phù hợp trước khi xác nhận phiếu.
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleSelectRate}
                className={actionButtonClass}
              >
                <ListChecks size={27} strokeWidth={2.2} />
                <span>{inspectionRate || "Chọn tỷ lệ kiểm"}</span>
              </button>

              <button
                type="button"
                onClick={handleSelectDefect}
                className={actionButtonClass}
              >
                <PackageSearch size={27} strokeWidth={2.2} />
                <span>{selectedDefect || "Chọn lỗi phụ liệu"}</span>
              </button>

              <button
                type="button"
                onClick={() => setProcessingAction("WAITING")}
                className={actionButtonClass}
              >
                <AlertCircle size={27} strokeWidth={2.2} />
                <span>Chờ xử lý</span>
              </button>

              <button
                type="button"
                onClick={() => setProcessingAction("PASS")}
                className={actionButtonClass}
              >
                <CheckCircle2 size={27} strokeWidth={2.2} />
                <span>Pass</span>
              </button>
            </div>

            <div className="mx-auto mt-5 max-w-md border-t border-egmf-border-subtle pt-4">
              <button
                type="button"
                onClick={handleOpenConfirmInspectionModal}
                className={wideActionButtonClass}
                disabled={isConfirmingInspection}
              >
                <ClipboardCheck size={19} strokeWidth={2.4} />
                {isConfirmingInspection
                  ? "Đang xác nhận..."
                  : "Xác nhận phiếu giám định"}
              </button>
            </div>
          </section>

          <ScannedRollsManagerSection
            ctpgdId={materialInfo.idCTPGD}
            item={location?.state?.item}
            showMaterialHeader={false}
            sectionTitle="Danh sách tem / gói trong thùng"
          />

          <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
            <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="m-0 text-base font-extrabold text-egmf-ink">
                  Danh sách lỗi phụ liệu
                </h2>
                <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                  Các lỗi được khai báo trong quá trình kiểm tra.
                </p>
              </div>
              <span className="rounded-full bg-egmf-primary-soft px-2.5 py-1 text-xs font-bold text-egmf-primary">
                {dsKhaiBaoLoi.length} lỗi
              </span>
            </div>

            {dsKhaiBaoLoi.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
                <span className="grid size-16 place-items-center rounded-full bg-egmf-primary-soft text-egmf-primary">
                  <PackageSearch size={31} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="m-0 text-sm font-bold text-egmf-ink-secondary">
                    Chưa có lỗi được khai báo
                  </p>
                  <p className="m-0 mt-1 text-xs text-egmf-muted">
                    Danh sách sẽ hiển thị sau khi cập nhật lỗi phụ liệu.
                  </p>
                </div>
              </div>
            ) : (
              dsKhaiBaoLoi.map((item, index) => (
                <DeclaredAccessoryDefectCard
                  key={
                    item.KhaiBaoLoiId ??
                    `${item.CTPGDId}-${item.MaLoi}-${index}`
                  }
                  defect={item}
                  onDelete={() => handleDeleteLoiKhaiBao(item.Id)}
                />
              ))
            )}
          </section>
        </main>

        {isInspectionRateModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px]"
            onClick={handleCloseInspectionRateModal}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="inspection-rate-modal-title"
              className="w-full max-w-md overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-[0_24px_56px_rgba(15,23,42,.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                  <ListChecks size={20} strokeWidth={2.3} />
                </span>
                <div className="min-w-0">
                  <h2
                    id="inspection-rate-modal-title"
                    className="m-0 text-base font-extrabold text-egmf-ink"
                  >
                    Khai báo tỉ lệ kiểm
                  </h2>
                  <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                    Chọn tỷ lệ kiểm phù hợp cho phụ liệu này.
                  </p>
                </div>
              </header>

              <div className="p-5">
                <label
                  htmlFor="inspection-rate"
                  className="block text-xs font-bold uppercase tracking-wide text-egmf-ink-secondary"
                >
                  Tỷ lệ kiểm
                </label>
                <select
                  id="inspection-rate"
                  value={pendingInspectionRate}
                  onChange={(event) => {
                    setPendingInspectionRate(event.target.value);
                    if (event.target.value !== CUSTOM_AQL_RATE) {
                      setPendingAqlPercentage("");
                    }
                  }}
                  className="mt-2 h-12 w-full rounded-xl border border-egmf-border bg-white px-3 text-sm font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/15"
                >
                  <option value="">Chọn tỉ lệ kiểm</option>
                  {inspectionRateOptions.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>

                {pendingInspectionRate === CUSTOM_AQL_RATE && (
                  <div className="mt-4">
                    <label
                      htmlFor="custom-aql-percentage"
                      className="block text-xs font-bold uppercase tracking-wide text-egmf-ink-secondary"
                    >
                      Nhập tỷ lệ AQL
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="custom-aql-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        inputMode="decimal"
                        value={pendingAqlPercentage}
                        onChange={(event) =>
                          setPendingAqlPercentage(event.target.value)
                        }
                        placeholder="Nhập phần trăm"
                        className="h-12 w-full rounded-xl border border-egmf-border bg-white px-3 pr-10 text-sm font-semibold text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/15"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm font-bold text-egmf-muted">
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <footer className="flex flex-col-reverse gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle p-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseInspectionRateModal}
                  disabled={isSavingInspectionRate}
                  className="h-11 rounded-xl border border-egmf-border bg-white px-5 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateInspectionRate}
                  disabled={
                    isSavingInspectionRate ||
                    !pendingInspectionRate ||
                    (pendingInspectionRate === CUSTOM_AQL_RATE &&
                      !pendingAqlPercentage)
                  }
                  className="h-11 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingInspectionRate ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </footer>
            </section>
          </div>
        )}

        {isDefectModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px]"
            onClick={handleCloseDefectModal}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="defect-modal-title"
              className="w-full max-w-md overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-[0_24px_56px_rgba(15,23,42,.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                  <AlertCircle size={20} strokeWidth={2.3} />
                </span>
                <div className="min-w-0">
                  <h2
                    id="defect-modal-title"
                    className="m-0 text-base font-extrabold text-egmf-ink"
                  >
                    Khai báo lỗi phụ liệu
                  </h2>
                  <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                    Chọn loại lỗi và nhập số lượng lỗi thực tế.
                  </p>
                </div>
              </header>

              <div className="space-y-4 p-5">
                <div>
                  <label
                    htmlFor="accessory-defect"
                    className="block text-xs font-bold uppercase tracking-wide text-egmf-ink-secondary"
                  >
                    Lỗi phụ liệu
                  </label>
                  <select
                    id="accessory-defect"
                    value={pendingDefectCode}
                    onChange={(event) =>
                      setPendingDefectCode(event.target.value)
                    }
                    disabled={isLoadingDefects}
                    className="mt-2 h-12 w-full rounded-xl border border-egmf-border bg-white px-3 text-sm font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/15 disabled:cursor-wait disabled:bg-egmf-surface-subtle disabled:text-egmf-muted"
                  >
                    <option value="">
                      {isLoadingDefects
                        ? "Đang tải danh sách lỗi..."
                        : "Chọn lỗi phụ liệu"}
                    </option>
                    {defectOptions.map((defect) => (
                      <option key={defect.MaLoi} value={String(defect.MaLoi)}>
                        {`${defect.MaLoi} - ${defect.TenLoi}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="defect-quantity"
                    className="block text-xs font-bold uppercase tracking-wide text-egmf-ink-secondary"
                  >
                    Số lượng lỗi
                  </label>
                  <input
                    id="defect-quantity"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={pendingDefectQuantity}
                    onChange={(event) =>
                      setPendingDefectQuantity(event.target.value)
                    }
                    placeholder="Nhập số lượng lỗi"
                    className="mt-2 h-12 w-full rounded-xl border border-egmf-border bg-white px-3 text-sm font-semibold text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/15"
                  />
                </div>
              </div>

              <footer className="flex flex-col-reverse gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle p-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseDefectModal}
                  className="h-11 rounded-xl border border-egmf-border bg-white px-5 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateDefect}
                  disabled={
                    isLoadingDefects ||
                    isSavingDefect ||
                    !pendingDefectCode ||
                    !pendingDefectQuantity
                  }
                  className="h-11 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingDefect ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </footer>
            </section>
          </div>
        )}

        {processingAction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px]"
            onClick={() =>
              !isUpdatingProcessingStatus && setProcessingAction(null)
            }
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="processing-status-modal-title"
              className="w-full max-w-md overflow-hidden rounded-3xl border border-egmf-border bg-white shadow-[0_28px_72px_rgba(15,23,42,.25)]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="relative overflow-hidden bg-gradient-to-br from-egmf-primary-soft via-white to-egmf-surface-subtle px-5 pb-5 pt-6 sm:px-6">
                <span className="absolute -right-7 -top-7 size-28 rounded-full bg-egmf-primary/10" />
                <span className="absolute -right-1 top-12 size-12 rounded-full border-[10px] border-egmf-primary/10" />
                <div className="relative flex items-start gap-4">
                  <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-egmf-primary text-white shadow-[0_10px_22px_rgba(37,99,235,.28)]">
                    {processingOption.isPass ? (
                      <CheckCircle2 size={26} strokeWidth={2.4} />
                    ) : (
                      <AlertCircle size={26} strokeWidth={2.4} />
                    )}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-egmf-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-egmf-primary">
                      {processingOption.isPass ? (
                        <CheckCircle2 size={13} strokeWidth={2.8} />
                      ) : (
                        <AlertCircle size={13} strokeWidth={2.8} />
                      )}
                      Hướng xử lý mới
                    </span>
                    <h2
                      id="processing-status-modal-title"
                      className="m-0 mt-2 text-lg font-extrabold text-egmf-ink"
                    >
                      Xác nhận hướng xử lý
                    </h2>
                    <p className="m-0 mt-1 text-sm leading-5 text-egmf-muted">
                      Thay đổi sẽ được cập nhật ngay cho phiếu giám định.
                    </p>
                  </div>
                </div>
              </header>

              <div className="px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3 rounded-2xl border border-egmf-primary/15 bg-egmf-primary-soft/60 p-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-egmf-primary shadow-sm">
                    {processingOption.isPass ? (
                      <CheckCircle2 size={19} strokeWidth={2.3} />
                    ) : (
                      <AlertCircle size={19} strokeWidth={2.3} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-muted">
                      Hướng xử lý được chọn
                    </p>
                    <p className="m-0 mt-0.5 truncate text-base font-extrabold text-egmf-ink">
                      {processingOption.label}
                    </p>
                  </div>
                </div>
                <p className="m-0 mt-4 text-sm leading-5 text-egmf-ink-secondary">
                  Bạn có chắc muốn chuyển hướng xử lý của phiếu{" "}
                  <span className="font-extrabold text-egmf-ink">
                    {materialInfo.maPhieu || "—"}
                  </span>{" "}
                  sang lựa chọn này?
                </p>
              </div>

              <footer className="flex flex-col-reverse gap-2.5 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setProcessingAction(null)}
                  disabled={isUpdatingProcessingStatus}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-5 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} strokeWidth={2.5} />
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmProcessingStatus}
                  disabled={isUpdatingProcessingStatus}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  {isUpdatingProcessingStatus ? "Đang cập nhật..." : "Xác nhận"}
                </button>
              </footer>
            </section>
          </div>
        )}

        {isConfirmInspectionModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px]"
            onClick={handleCloseConfirmInspectionModal}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-inspection-modal-title"
              className="w-full max-w-md overflow-hidden rounded-3xl border border-egmf-border bg-white shadow-[0_28px_72px_rgba(15,23,42,.25)]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="relative overflow-hidden bg-gradient-to-br from-egmf-primary-soft via-white to-egmf-surface-subtle px-5 pb-5 pt-6 sm:px-6">
                <span className="absolute -right-7 -top-7 size-28 rounded-full bg-egmf-primary/10" />
                <span className="absolute -right-1 top-12 size-12 rounded-full border-[10px] border-egmf-primary/10" />
                <div className="relative flex items-start gap-4">
                  <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-egmf-primary text-white shadow-[0_10px_22px_rgba(37,99,235,.28)]">
                    <ClipboardCheck size={26} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-egmf-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-egmf-primary">
                      <CheckCircle2 size={13} strokeWidth={2.8} />
                      Sẵn sàng xác nhận
                    </span>
                    <h2
                      id="confirm-inspection-modal-title"
                      className="m-0 mt-2 text-lg font-extrabold text-egmf-ink"
                    >
                      Xác nhận phiếu giám định
                    </h2>
                    <p className="m-0 mt-1 text-sm leading-5 text-egmf-muted">
                      Kiểm tra lại thông tin trước khi hoàn tất phiếu.
                    </p>
                  </div>
                </div>
              </header>

              <div className="px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3 rounded-2xl border border-egmf-primary/15 bg-egmf-primary-soft/60 p-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-egmf-primary shadow-sm">
                    <ClipboardCheck size={19} strokeWidth={2.3} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-muted">
                      Mã phiếu giám định
                    </p>
                    <p className="m-0 mt-0.5 truncate text-base font-extrabold text-egmf-ink">
                      {materialInfo.maPhieu || "—"}
                    </p>
                  </div>
                </div>
                <p className="m-0 mt-4 text-sm leading-5 text-egmf-ink-secondary">
                  Bạn có chắc muốn xác nhận phiếu giám định này? Thao tác sẽ
                  chuyển phiếu sang bước tiếp theo.
                </p>
              </div>

              <footer className="flex flex-col-reverse gap-2.5 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={handleCloseConfirmInspectionModal}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-5 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                >
                  <X size={17} strokeWidth={2.5} />
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmitConfirmInspection}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
                >
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  Xác nhận
                </button>
              </footer>
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
