import {
  ChevronDown,
  ClipboardPenLine,
  Clock3,
  LoaderCircle,
  Plus,
  Tag,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  layDanhSachLoi,
  kiemTraTonTai,
  themDongKiemMau,
  capNhatTrangThaiBarcodeMau,
  layDanhSachLoiKiemMau,
} from "../api/technical-department.api";

import { getCurrentUser } from "../../../shared/auth/session";
import { error } from "@fortune-sheet/core";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";
import DefectCard from "../components/sample-inspection-defect/DefectCard";
import DefectFormModal from "../components/sample-inspection-defect/DefectFormModal";
import { showSuccessToast } from "../../../shared/components/ui/CustomToast";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const REPAIRING_STATUS = "HÀNG SỬA";
const EMPTY_FORM = {
  ViTriLoi: "",
  TenLoi: "",
  CumLoi: "",
  CumLoiId: 0,
  MaLoi: "",
  MucDoNghiemTrong: "NHẸ",
  SoLuong: 1,
  BienPhapXuLy: "Trả sửa",
  GhiChu: "",
  KetQuaCuoi: "",
};

export default function SampleInspectionDefectPanel({
  currentStatus,
  defects = [],
  onSaveDefect,
  onDeleteDefect,
  onChangeStatus,
  onUpdateWorkers,
  saving = false,
}) {
  const location = useLocation();
  const user = getCurrentUser();
  const barcodeMau = location?.state?.barcodeMau;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [defectImage, setDefectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const cameraInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [dsLoi, setDsLoi] = useState([]);
  const [loadingLoiKiemMau, setLoadingLoiKiemMau] = useState(false);
  const [dsLoiKiemMau, setDsLoiKiemMau] = useState([]);

  const isRepairing = currentStatus === REPAIRING_STATUS;
  const statusLabel = currentStatus || "CHƯA KIỂM";
  const seriousDefectCount = defects.filter(
    (defect) => defect.MucDoNghiemTrong === "NGHIÊM TRỌNG",
  ).length;

  useEffect(() => {
    const fetchDsLoi = async () => {
      try {
        const response = await layDanhSachLoi();
        if (!response.success) {
          showErrorToast(response.message || "Lấy danh sách lỗi thất bại");
          return;
        }
        setDsLoi(response?.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDsLoi();
  }, []);

  //LẤY DANH SÁCH LỖI KIỂM MẪU
  const fetchDanhSachLoiKiemMau = async () => {
    setLoadingLoiKiemMau(true);
    try {
      if (!barcodeMau) return;
      const response = await layDanhSachLoiKiemMau(barcodeMau);
      if (!response.success) {
        showErrorToast(
          response.message || "Lấy danh sách lỗi kiểm mẫu thất bại",
        );
        return;
      }
      setDsLoiKiemMau(response?.data || []);
    } catch (error) {
      console.error(error);
      showErrorToast(error.message || "Lấy danh sách lỗi kiểm mẫu thất bại");
    } finally {
      setLoadingLoiKiemMau(false);
    }
  };

  useEffect(() => {
    fetchDanhSachLoiKiemMau();
  }, [barcodeMau]);

  console.log(dsLoiKiemMau);

  const resetImage = () => {
    setDefectImage(null);
    setImagePreview("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDefect(null);
    resetImage();
  };

  const openCreateForm = () => {
    setEditingDefect(null);
    setForm(EMPTY_FORM);
    resetImage();
    setIsFormOpen(true);
  };

  const openEditForm = (defect) => {
    setEditingDefect(defect);
    setForm({
      ViTriLoi: defect.ViTriLoi ?? "",
      TenLoi: defect.TenLoi ?? "",
      CumLoi: defect.CumLoi ?? "",
      CumLoiId: defect.CumLoiId ?? 0,
      MaLoi: defect.MaLoi ?? "",
      MucDoNghiemTrong: defect.MucDoNghiemTrong ?? "NHẸ",
      SoLuong: defect.SoLuong ?? 1,
      BienPhapXuLy: defect.BienPhapXuLy ?? "Trả sửa",
      GhiChu: defect.GhiChu ?? "",
      KetQuaCuoi: defect.KetQuaCuoi ?? "",
    });
    setDefectImage(null);
    setImagePreview(
      defect.defectImageUrl ?? defect.imageUrl ?? defect.image ?? "",
    );
    setIsFormOpen(true);
  };

  //Khi chọn lại tên lỗi sẽ tự động cập nhật lại form với 4 field dưới
  const handleDefectNameChange = (TenLoi) => {
    const loiDuocChon = dsLoi.find((item) => item.ten_loi === TenLoi);
    console.log(loiDuocChon);
    setForm((prev) => ({
      ...prev,
      TenLoi,
      CumLoi: loiDuocChon?.ten ?? "",
      MaLoi: loiDuocChon?.ma_loi ?? "",
      CumLoiId: loiDuocChon?.id ?? 0,
    }));
  };

  const handleImageChange = (event) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;

    if (!imageFile.type.startsWith("image/")) {
      showErrorToast("Vui lòng chọn tệp ảnh hợp lệ");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDefectImage(imageFile);
      setImagePreview(reader.result?.toString() ?? "");
    };
    reader.readAsDataURL(imageFile);
  };

  const handleSave = async () => {
    const canSave = Boolean(
      form.TenLoi && form.CumLoiId && form.MucDoNghiemTrong,
    );
    if (!canSave) return;

    const masterPayload = {
      BarcodeMau: location?.state?.barcodeMau,
      LoaiKiem: location?.state?.loaiKiem,
      NguoiKiemMau: `${user.data.HoVaTenLot} ${user.data.Ten}`,
      TKId: Number(user.data.TKId),
    };

    const masterResponse = await kiemTraTonTai(masterPayload);
    if (!masterResponse.success) {
      showErrorToast(error.message || "Kiểm tra phiếu kiểm mẫu thất bại");
      return;
    }

    const masterId = masterResponse.data?.NewId;

    if (!Number.isSafeInteger(Number(masterId)) || Number(masterId) <= 0) {
      showErrorToast("Không lấy được ID phiếu kiểm mẫu");
    }

    const detailPayload = {
      IdKiemMauMaster: Number(masterId),
      BarcodeMau: masterPayload?.BarcodeMau,
      ViTriLoi: form?.ViTriLoi,
      NguoiKhaiBao: `${user?.data?.HoVaTenLot} ${user?.data?.Ten}`,
      MucDoNghiemTrong: form?.MucDoNghiemTrong,
      MaLoi: form?.MaLoi,
      TenLoi: form?.TenLoi,
      CumLoiId: Number(form?.CumLoiId),
      SL: Number(form?.SoLuong),
      BienPhapXuLy: form?.BienPhapXuLy,
      GhiChu: form?.GhiChu,
      LoaiKiem: masterPayload.LoaiKiem,
      Image: null,
    };

    console.log("PAYLOAD: ", detailPayload);

    const detailResponse = await themDongKiemMau(detailPayload);

    if (!detailResponse.success) {
      showErrorToast(
        detailResponse.message || "Thêm chi tiết lỗi kiểm mẫu thất bại",
      );
      return;
    }

    //Cập nhật trạng thái mẫu thành HÀNG LỖI
    const statusPayload = {
      TrangThai: "HÀNG LỖI",
      isSua: false,
      BarcodeMau: masterPayload.BarcodeMau,
      LoaiKiemMau: masterPayload.LoaiKiem,
    };

    const statusResponse = await capNhatTrangThaiBarcodeMau(statusPayload);
    if (!statusResponse.success) {
      showErrorToast(
        statusResponse.message ||
          "Đã lưu lỗi nhưng cập nhật trạng thái thất bại",
      );
      return;
    }

    showSuccessToast("Thêm lỗi kiểm mẫu thành công");
    //Cập nhật danh sách lỗi trên giao diện
    await onSaveDefect?.({
      ...form,
      imageFile: defectImage,
      imagePreview,
      idDetail: editingDefect?.idDetail ?? 0,
      isEditing: Boolean(editingDefect),
    });

    closeForm();
  };

  console.log(form);

  return (
    <MainLayout screenTitle="Phòng kỹ thuật">
      <main className="flex min-h-full flex-1 flex-col bg-egmf-surface px-3 pt-4 text-egmf-ink sm:px-5 sm:py-5 lg:px-7 lg:py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <section className="mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card sm:mb-0">
            <div className="flex flex-col gap-2.5 border-b border-egmf-border-subtle bg-egmf-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <button
                type="button"
                onClick={openCreateForm}
                className="group flex min-h-11 items-center justify-center gap-2.5 rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(225,29,72,.24)] transition hover:bg-rose-700 hover:shadow-[0_8px_18px_rgba(225,29,72,.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 sm:w-fit sm:min-w-40"
              >
                <span className="grid size-6 place-items-center rounded-lg bg-white/15 transition group-hover:bg-white/20">
                  <Plus size={17} strokeWidth={2.75} />
                </span>
                <span>Thêm lỗi mới</span>
              </button>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={onUpdateWorkers}
                  className="group flex min-h-11 items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-3.5 text-sm font-bold text-egmf-ink-secondary shadow-sm transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:px-4"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-egmf-surface-subtle text-egmf-muted transition group-hover:bg-egmf-primary-soft group-hover:text-egmf-primary">
                    <Users size={16} />
                  </span>
                  <span className="whitespace-nowrap">Người may mẫu</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus?.(REPAIRING_STATUS)}
                  disabled={isRepairing || saving}
                  className="group flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 text-sm font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-55 sm:px-4"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-white/70 text-orange-600 transition group-hover:bg-white">
                    <Wrench size={16} />
                  </span>
                  <span className="whitespace-nowrap">
                    {isRepairing ? "Đang hàng sửa" : "Chuyển hàng sửa"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
              {defects.length > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <p className="m-0 text-sm font-extrabold text-egmf-ink">
                    Chi tiết lỗi
                  </p>
                  <p className="m-0 text-xs font-medium text-egmf-muted">
                    Chọn biểu tượng để chỉnh sửa hoặc xóa
                  </p>
                </div>
              )}
              {defects.length === 0 ? (
                <EmptyDefectList
                  dsLoiKiemMau={dsLoiKiemMau}
                  loading={loadingLoiKiemMau}
                />
              ) : (
                <div className="space-y-2.5">
                  {defects.map((defect) => (
                    <DefectCard
                      key={defect.idDetail}
                      defect={defect}
                      onEdit={() => openEditForm(defect)}
                      onDelete={() => onDeleteDefect?.(defect)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <DefectFormModal
        dsLoi={dsLoi}
        isOpen={isFormOpen}
        editingDefect={editingDefect}
        form={form}
        imagePreview={imagePreview}
        saving={saving}
        cameraInputRef={cameraInputRef}
        imageInputRef={imageInputRef}
        onClose={closeForm}
        onSubmit={handleSave}
        onFormChange={(changes) =>
          setForm((previous) => ({ ...previous, ...changes }))
        }
        onDefectNameChange={handleDefectNameChange}
        onImageChange={handleImageChange}
        onRemoveImage={resetImage}
      />
    </MainLayout>
  );
}

function SummaryItem({ label, value, tone = "default", className = "" }) {
  const toneClass = {
    default: "border-egmf-border-subtle bg-white text-egmf-ink",
    danger: "border-rose-100 bg-rose-50 text-rose-700",
    warning: "border-orange-100 bg-orange-50 text-orange-700",
  }[tone];

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass} ${className}`}>
      <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] opacity-70">
        {label}
      </p>
      <p className="m-0 mt-0.5 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function EmptyDefectList({ dsLoiKiemMau, loading }) {
  const defectList = Array.isArray(dsLoiKiemMau) ? dsLoiKiemMau : [];
  const [isDefectListOpen, setIsDefectListOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-egmf-border bg-egmf-surface-subtle p-5">
        <LoaderCircle size={24} className="animate-spin text-egmf-primary" />
        <p className="mt-2 text-sm font-semibold text-egmf-muted">
          Đang tải danh sách lỗi kiểm mẫu...
        </p>
      </div>
    );
  }

  if (defectList.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle p-5 text-center">
        <ClipboardPenLine size={28} className="text-egmf-primary" />
        <h3 className="mt-2 text-sm font-bold text-egmf-ink">
          Chưa có lỗi được khai báo
        </h3>
        <p className="mt-1 text-sm text-egmf-muted">
          Thêm lỗi đầu tiên để theo dõi kết quả kiểm mẫu.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-subtle">
      <button
        type="button"
        onClick={() => setIsDefectListOpen((previous) => !previous)}
        aria-expanded={isDefectListOpen}
        className="flex min-h-14 w-full items-center justify-between gap-3 bg-white px-3.5 py-3 text-left transition hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:px-4"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
            <ClipboardPenLine size={16} strokeWidth={2.25} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold text-egmf-ink">
              Danh sách lỗi kiểm mẫu
            </span>
            <span className="mt-0.5 block text-xs font-medium text-egmf-muted">
              {defectList.length} lỗi đã được khai báo
            </span>
          </span>
        </span>
        <ChevronDown
          size={19}
          className={`shrink-0 text-egmf-muted transition-transform duration-200 ${isDefectListOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isDefectListOpen && (
        <div className="space-y-2 border-t border-egmf-border-subtle p-3 sm:p-4">
          {defectList.map((item, index) => {
        const severity = displayValue(item.MucDoNghiemTrong);
        const severityClass =
          severityStyles[item.MucDoNghiemTrong] ??
          "border-egmf-border bg-egmf-surface-subtle text-egmf-ink-secondary";

        const hasImage = isSupportedImageSource(item.Image);

        return (
          <article
            key={`${item.MaLoi ?? ""}-${item.ThoiGianKhaiBao ?? ""}-${index}`}
            className="rounded-xl border border-egmf-border bg-egmf-surface-raised p-3 shadow-sm transition-colors hover:border-egmf-primary-border sm:px-4"
          >
            {/* TẦNG 1: TÊN LỖI VÀ MỨC ĐỘ */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                  <Tag size={16} />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="m-0 break-words text-[15px] font-extrabold leading-5 text-egmf-ink">
                      {displayValue(item.TenLoi)}
                    </h3>

                    <span className="text-xs font-semibold text-egmf-muted">
                      {displayValue(item.MaLoi)}
                    </span>
                  </div>

                  <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                    {displayValue(item.LoaiKiem)}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-extrabold ${severityClass}`}
              >
                {severity}
              </span>
            </div>

            {/* TẦNG 2: THÔNG TIN CHÍNH */}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-egmf-surface-subtle px-3 py-2.5 sm:grid-cols-3">
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-medium text-egmf-muted">
                  Vị trí lỗi
                </p>
                <p className="m-0 mt-0.5 break-words text-sm font-semibold text-egmf-ink-secondary">
                  {displayValue(item.ViTriLoi)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="m-0 text-[11px] font-medium text-egmf-muted">
                  Số lượng
                </p>
                <p className="m-0 mt-0.5 text-sm font-bold text-egmf-ink">
                  {displayValue(item.SL)}
                </p>
              </div>

              <div className="col-span-2 min-w-0 sm:col-span-1">
                <p className="m-0 text-[11px] font-medium text-egmf-muted">
                  Biện pháp xử lý
                </p>
                <p className="m-0 mt-0.5 break-words text-sm font-semibold text-egmf-ink-secondary">
                  {displayValue(item.BienPhapXuLy)}
                </p>
              </div>
            </div>

            {/* TẦNG 3: NGƯỜI KHAI BÁO, THỜI GIAN, ẢNH */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-egmf-muted">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound size={13} />
                  {displayValue(item.NguoiKhaiBao)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} />
                  {hasValue(item.ThoiGianKhaiBao)
                    ? formatDateTime(item.ThoiGianKhaiBao)
                    : "—"}
                </span>
              </div>

              {hasImage && (
                <img
                  src={String(item.Image).trim()}
                  alt={`Ảnh lỗi ${displayValue(item.TenLoi)}`}
                  className="size-10 rounded-md border border-egmf-border object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* GHI CHÚ: CHỈ HIỆN KHI CÓ */}
            {hasValue(item.GhiChu) && (
              <p className="m-0 mt-2 border-t border-egmf-border pt-2 text-xs leading-5 text-egmf-ink-secondary">
                <span className="font-bold text-egmf-muted">Ghi chú: </span>
                <span className="break-words">{item.GhiChu}</span>
              </p>
            )}
          </article>
        );
          })}
        </div>
      )}
    </section>
  );
}

const severityStyles = {
  NHẸ: "border-emerald-100 bg-emerald-50 text-emerald-700",
  "TRUNG BÌNH": "border-amber-100 bg-amber-50 text-amber-700",
  NẶNG: "border-orange-100 bg-orange-50 text-orange-700",
  "NGHIÊM TRỌNG": "border-rose-100 bg-rose-50 text-rose-700",
};

function displayValue(value) {
  return hasValue(value) ? String(value) : "—";
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function isSupportedImageSource(value) {
  if (!hasValue(value)) return false;

  const image = String(value).trim();
  if (image.startsWith("data:image/")) return true;

  try {
    const url = new URL(image);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
