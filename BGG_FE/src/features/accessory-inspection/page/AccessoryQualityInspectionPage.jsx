import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  PackageSearch,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation } from "react-router-dom";
import { saveAccessoryInspectionRate } from "../api/accessoryInspectionApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";

const CUSTOM_AQL_RATE = "Theo AQL %";

export default function AccessoryQualityInspectionPage() {
  const [inspectionRate, setInspectionRate] = useState("");
  const [isInspectionRateModalOpen, setIsInspectionRateModalOpen] =
    useState(false);
  const [pendingInspectionRate, setPendingInspectionRate] = useState("");
  const [pendingAqlPercentage, setPendingAqlPercentage] = useState("");
  const [isSavingInspectionRate, setIsSavingInspectionRate] = useState(false);
  const [selectedDefect] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [items] = useState([]);
  const location = useLocation();

  // Dữ liệu mẫu - thay bằng dữ liệu API.
  const materialInfo = {
    maVatTu: location.state?.item?.MatVatTuGhep || "",
    idCTPGD: location.state?.item?.CTPGDId || "",
  };
  const inspectionRateOptions = [
    "Theo AQL 4.0",
    "Theo AQL 2.5",
    "Theo AQL 1.0",
    CUSTOM_AQL_RATE,
  ];

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

  const handleUpdateInspectionRate = async () => {
    if (isSavingInspectionRate) return;

    const rate =
      pendingInspectionRate === CUSTOM_AQL_RATE
        ? `Theo AQL ${pendingAqlPercentage}%`
        : pendingInspectionRate;

    const payload = {
      CTPGDId: Number(materialInfo.idCTPGD),
      TyLeKiem: pendingInspectionRate,
      AQLPercentage:
        pendingInspectionRate === CUSTOM_AQL_RATE
          ? Number(pendingAqlPercentage)
          : null,
      GiaTriTyLeKiem: rate,
    };

    setIsSavingInspectionRate(true);

    console.log(payload);

    try {
      const response = await saveAccessoryInspectionRate(payload);

      if (!response?.success || Number(response.data?.KetQua) !== 1) {
        throw new Error(response?.message || "Cập nhật tỷ lệ kiểm thất bại.");
      }

      setInspectionRate(rate);
      setIsInspectionRateModalOpen(false);
      showSuccessToast(response.message || "Đã cập nhật tỷ lệ kiểm.");
    } catch (error) {
      console.error("Không thể cập nhật tỷ lệ kiểm:", error);
      showErrorToast(error.message || "Không thể cập nhật tỷ lệ kiểm.");
    } finally {
      setIsSavingInspectionRate(false);
    }
  };

  const handleSelectDefect = () => {
    // TODO: Mở modal chọn lỗi phụ liệu.
    console.log("Chọn lỗi phụ liệu");
  };

  const handleUpdateStatus = (status) => {
    setProcessingStatus(status);
    // TODO: Gọi API cập nhật từng dòng.
  };

  const handleConfirm = () => {
    // TODO: Gọi API xác nhận phiếu giám định.
    console.log("Xác nhận PGD", materialInfo.idCTPGD);
  };

  const actionButtonClass = (isActive) =>
    `flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:scale-[0.98] ${
      isActive
        ? "border-egmf-primary bg-egmf-primary text-white shadow-egmf-primary-compact"
        : "border-egmf-border bg-white text-egmf-primary hover:border-egmf-primary hover:bg-egmf-primary-tint"
    }`;

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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-egmf-ink-secondary">
                  Tỷ lệ kiểm
                </label>
                <button
                  type="button"
                  onClick={handleSelectRate}
                  className={actionButtonClass(Boolean(inspectionRate))}
                >
                  {inspectionRate || "Chọn tỷ lệ kiểm"}
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-egmf-ink-secondary">
                  Lỗi phụ liệu
                </label>
                <button
                  type="button"
                  onClick={handleSelectDefect}
                  className={actionButtonClass(Boolean(selectedDefect))}
                >
                  {selectedDefect || "Chọn lỗi phụ liệu"}
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-egmf-ink-secondary">
                  Hướng xử lý
                </label>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("CHO_XU_LY")}
                  className={actionButtonClass(
                    processingStatus === "CHO_XU_LY",
                  )}
                >
                  <AlertCircle size={18} strokeWidth={2.3} />
                  Chờ xử lý
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-egmf-ink-secondary">
                  Hướng xử lý
                </label>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("PASS")}
                  className={actionButtonClass(processingStatus === "PASS")}
                >
                  <CheckCircle2 size={18} strokeWidth={2.3} />
                  Pass
                </button>
              </div>
            </div>

            <div className="mt-5 border-t border-egmf-border-subtle pt-4">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-egmf-primary px-4 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 active:scale-[0.98] sm:ml-auto sm:w-auto"
              >
                <ClipboardCheck size={19} strokeWidth={2.4} />
                Xác nhận phiếu giám định
              </button>
            </div>
          </section>

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
                {items.length} lỗi
              </span>
            </div>

            {items.length === 0 ? (
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
              <div className="divide-y divide-egmf-border-subtle">
                {items.map((item, index) => (
                  <div key={item.id ?? index} className="px-4 py-3.5 sm:px-5">
                    <p className="m-0 font-bold text-egmf-ink">{item.tenLoi}</p>
                    <p className="m-0 mt-1 text-sm text-egmf-ink-secondary">
                      {item.moTa}
                    </p>
                  </div>
                ))}
              </div>
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
      </div>
    </MainLayout>
  );
}
