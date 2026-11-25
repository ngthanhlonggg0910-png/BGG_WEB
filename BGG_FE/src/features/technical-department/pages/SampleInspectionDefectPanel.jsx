import {
  ClipboardCheck,
  ClipboardPenLine,
  FileText,
  LoaderCircle,
  PackageCheck,
  Plus,
  TriangleAlert,
  Users,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

//Import CustomHook
import { useTechnicalDocuments } from "../hook/useTechnicalDocuments";

import {
  capNhatDongKiemMau,
  capNhatTrangThaiBarcodeMau,
  kiemTraTonTai,
  layAnhKiemMau,
  layDanhSachLoi,
  layDanhSachLoiKiemMau,
  layThongTinKiemMau,
  themDongKiemMau,
  xoaDongKiemMau,
} from "../api/technical-department.api";
import { getCurrentUser } from "../../../shared/auth/session";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import DefectCard from "../components/sample-inspection-defect/DefectCard";
import DefectFormModal from "../components/sample-inspection-defect/DefectFormModal";
import SampleInfoCard from "../components/sample-inspection-defect/SampleInfoCard";

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

const DEFECT_FORM_MODE = {
  CREATE: "CREATE",
  EDIT: "EDIT",
};

export default function SampleInspectionDefectPanel({
  onSaveDefect,
  onDeleteDefect,
  onUpdateWorkers,
}) {
  const location = useLocation();
  const user = getCurrentUser();

  // Dữ liệu điều hướng từ trang kiểm mẫu.
  const barcodeMau = location.state?.barcodeMau;
  const inspectionType = location.state?.loaiKiem;

  // Trạng thái giao diện và biểu mẫu lỗi.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [defectFormMode, setDefectFormMode] = useState(null);
  const [editingDefect, setEditingDefect] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [defectImage, setDefectImage] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  // Dữ liệu từ API.
  const [defectOptions, setDefectOptions] = useState([]);
  const [defects, setDefects] = useState([]);
  const [sampleInfo, setSampleInfo] = useState(null);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [loadingSampleInfo, setLoadingSampleInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defectPendingDelete, setDefectPendingDelete] = useState(null);
  const [deletingDefect, setDeletingDefect] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    location.state?.TrangThai ?? location.state?.kqKiem ?? "",
  );

  const normalizedStatus = normalizeStatus(currentStatus);
  const canSendToRepair = normalizedStatus === "HÀNG LỖI";
  const canSendToQualified = ["HÀNG LỖI", "HÀNG SỬA"].includes(
    normalizedStatus,
  );

  // Tải danh mục lỗi để người dùng chọn trong form.
  useEffect(() => {
    let isCancelled = false;

    async function loadDefectOptions() {
      try {
        const response = await layDanhSachLoi();
        if (!response.success) {
          showErrorToast(response.message || "Lấy danh sách lỗi thất bại");
          return;
        }

        if (!isCancelled) setDefectOptions(response.data ?? []);
      } catch (error) {
        if (!isCancelled) {
          showErrorToast(error.message || "Lấy danh sách lỗi thất bại");
        }
      }
    }

    loadDefectOptions();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Tải các lỗi đã khai báo cho BarcodeMau hiện tại.
  const loadDefects = useCallback(async () => {
    if (!barcodeMau) {
      setDefects([]);
      return;
    }

    setLoadingDefects(true);
    try {
      const response = await layDanhSachLoiKiemMau(barcodeMau);
      if (!response.success) {
        showErrorToast(
          response.message || "Lấy danh sách lỗi kiểm mẫu thất bại",
        );
        return;
      }

      setDefects(response.data ?? []);
    } catch (error) {
      showErrorToast(error.message || "Lấy danh sách lỗi kiểm mẫu thất bại");
    } finally {
      setLoadingDefects(false);
    }
  }, [barcodeMau]);

  // Tải thông tin tóm tắt của mẫu hiển thị đầu trang.
  const loadSampleInfo = useCallback(async () => {
    if (!barcodeMau) {
      setSampleInfo(null);
      return;
    }

    setLoadingSampleInfo(true);
    try {
      const response = await layThongTinKiemMau(barcodeMau);
      if (!response.success) {
        showErrorToast(response.message || "Lấy thông tin kiểm mẫu thất bại");
        return;
      }

      setSampleInfo(response.data ?? null);
      const status =
        inspectionType === "QA"
          ? response.data?.TrangThai
          : response.data?.TrangThaiAutonomy;
      if (status) setCurrentStatus(status);
    } catch (error) {
      showErrorToast(error.message || "Lấy thông tin kiểm mẫu thất bại");
    } finally {
      setLoadingSampleInfo(false);
    }
  }, [barcodeMau, inspectionType]);

  useEffect(() => {
    loadDefects();
  }, [loadDefects]);

  useEffect(() => {
    loadSampleInfo();
  }, [loadSampleInfo]);

  // Ảnh đang lưu (ImagePath), File ảnh mới (defectImage) và ý định xóa ảnh
  // được tách riêng để đóng form không làm thay đổi dữ liệu đã lưu trên server.
  const resetImage = () => {
    setDefectImage(null);
    setExistingImagePath("");
    setRemoveImage(false);
  };

  // Đóng modal và dọn dữ liệu chỉ dùng cho phiên chỉnh sửa hiện tại.
  const closeForm = () => {
    setIsFormOpen(false);
    setDefectFormMode(null);
    setEditingDefect(null);
    setForm(EMPTY_FORM);
    resetImage();
  };

  // Mở form tạo lỗi mới với giá trị mặc định.
  const openCreateForm = () => {
    setDefectFormMode(DEFECT_FORM_MODE.CREATE);
    setEditingDefect(null);
    setForm(EMPTY_FORM);
    resetImage();
    setIsFormOpen(true);
  };

  // Mở form chỉnh sửa và đổ dữ liệu dòng lỗi hiện tại vào form.
  const openEditForm = (defect) => {
    setDefectFormMode(DEFECT_FORM_MODE.EDIT);
    setEditingDefect(defect);
    setForm({
      ...EMPTY_FORM,
      IdDetail: defect.IdDetail ?? defect.idDetail ?? 0,
      IdKiemMauMaster: defect.IdKiemMauMaster ?? 0,
      ViTriLoi: defect.ViTriLoi ?? "",
      TenLoi: defect.TenLoi ?? "",
      TenCumLoi: defect.TenCumLoi ?? "",
      CumLoiId: defect.CumLoiId ?? 0,
      MaLoi: defect.MaLoi ?? "",
      MucDoNghiemTrong: defect.MucDoNghiemTrong ?? "NHẸ",
      SoLuong: defect.SoLuong ?? 1,
      BienPhapXuLy: defect.BienPhapXuLy ?? "Trả sửa",
      GhiChu: defect.GhiChu ?? "",
      KetQuaCuoi: defect.KetQuaCuoi ?? "",
    });
    setDefectImage(null);
    // ImagePath là đường dẫn đã lưu trong DB; không phải File mới để upload.
    setExistingImagePath(getExistingImagePath(defect));
    setRemoveImage(false);
    setIsFormOpen(true);
  };

  // Đồng bộ các thông tin phụ thuộc khi người dùng chọn tên lỗi.
  const handleDefectNameChange = (TenLoi) => {
    const selectedDefect = defectOptions.find(
      (item) => item.ten_loi === TenLoi,
    );

    setForm((previous) => ({
      ...previous,
      TenLoi,
      CumLoi: selectedDefect?.ten ?? "",
      MaLoi: selectedDefect?.ma_loi ?? "",
      CumLoiId: selectedDefect?.id ?? 0,
    }));
  };

  const buildMasterPayload = () => ({
    BarcodeMau: barcodeMau,
    LoaiKiem: inspectionType,
    NguoiKiemMau: getFullName(user),
    TKId: Number(user?.data?.TKId),
  });

  const buildDetailPayload = (masterId, includeRemoveImage = false) => ({
    IdDetail: Number(form.IdDetail) || undefined,
    IdKiemMauMaster: Number(masterId ?? form.IdKiemMauMaster),
    BarcodeMau: barcodeMau,
    ViTriLoi: form.ViTriLoi,
    NguoiKhaiBao: getFullName(user),
    MucDoNghiemTrong: form.MucDoNghiemTrong,
    MaLoi: form.MaLoi,
    TenLoi: form.TenLoi,
    CumLoiId: Number(form.CumLoiId),
    SL: Number(form.SoLuong),
    BienPhapXuLy: form.BienPhapXuLy,
    GhiChu: form.GhiChu,
    LoaiKiem: inspectionType,
    ...(includeRemoveImage ? { RemoveImage: removeImage } : {}),
  });

  // Tạo lỗi mới, sau đó chuyển trạng thái mẫu sang HÀNG LỖI.
  const createDefect = async () => {
    const masterResponse = await kiemTraTonTai(buildMasterPayload());
    if (!masterResponse.success) {
      showErrorToast(
        masterResponse.message || "Kiểm tra phiếu kiểm mẫu thất bại",
      );
      return false;
    }

    const masterId = Number(masterResponse.data?.NewId);
    if (!Number.isSafeInteger(masterId) || masterId <= 0) {
      showErrorToast("Không lấy được ID phiếu kiểm mẫu");
      return false;
    }

    const detailResponse = await themDongKiemMau(
      buildDetailPayload(masterId),
      defectImage,
    );
    if (!detailResponse.success) {
      showErrorToast(
        detailResponse.message || "Thêm chi tiết lỗi kiểm mẫu thất bại",
      );
      return false;
    }

    const statusResponse = await capNhatTrangThaiBarcodeMau({
      BarcodeMau: barcodeMau,
      LoaiKiemMau: inspectionType,
      TrangThai: "HÀNG LỖI",
      isSua: false,
    });
    if (!statusResponse.success) {
      showErrorToast(
        statusResponse.message ||
          "Đã lưu lỗi nhưng cập nhật trạng thái thất bại",
      );
      return false;
    }

    setCurrentStatus("HÀNG LỖI");
    showSuccessToast("Thêm lỗi kiểm mẫu thành công");
    return true;
  };

  // Cập nhật thông tin của một lỗi đã tồn tại.
  const updateDefect = async () => {
    const response = await capNhatDongKiemMau(
      buildDetailPayload(undefined, true),
      defectImage,
    );
    if (!response.success) {
      showErrorToast(response.message || "Cập nhật lỗi kiểm mẫu thất bại");
      return false;
    }

    showSuccessToast("Cập nhật kiểm mẫu thành công");
    return true;
  };

  const handleDeleteDefect = (defect) => {
    const IdDetail = Number(defect.IdDetail ?? defect.idDetail);
    if (!Number.isSafeInteger(IdDetail) || IdDetail <= 0) {
      showErrorToast("Không xác định được lỗi cần xóa");
      return;
    }

    setDefectPendingDelete(defect);
  };

  const confirmDeleteDefect = async () => {
    const IdDetail = Number(
      defectPendingDelete?.IdDetail ?? defectPendingDelete?.idDetail,
    );
    if (!Number.isSafeInteger(IdDetail) || IdDetail <= 0) return;

    setDeletingDefect(true);
    try {
      const response = await xoaDongKiemMau(IdDetail);
      if (!response.success) {
        showErrorToast(response.message || "Xóa lỗi kiểm mẫu thất bại");
        return;
      }

      await Promise.all([loadDefects(), loadSampleInfo()]);
      await onDeleteDefect?.(defectPendingDelete);
      showSuccessToast(response.message || "Đã xóa lỗi kiểm mẫu");
      setDefectPendingDelete(null);
    } catch (error) {
      showErrorToast(error.message || "Xóa lỗi kiểm mẫu thất bại");
    } finally {
      setDeletingDefect(false);
    }
  };

  // Điều phối luồng lưu cho cả tạo mới và chỉnh sửa.
  const handleSave = async () => {
    const canSave = Boolean(
      form.TenLoi && form.CumLoiId && form.MucDoNghiemTrong,
    );
    if (!canSave) {
      showErrorToast("Vui lòng nhập đầy đủ các trường bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const isSaved =
        defectFormMode === DEFECT_FORM_MODE.CREATE
          ? await createDefect()
          : await updateDefect();
      if (!isSaved) return;

      await Promise.all([loadDefects(), loadSampleInfo()]);
      await onSaveDefect?.({
        ...form,
        imageFile: defectImage,
        imagePreview: defectImage ? "Ảnh mới" : layAnhKiemMau(existingImagePath),
        idDetail: editingDefect?.IdDetail ?? editingDefect?.idDetail ?? 0,
        isEditing: defectFormMode === DEFECT_FORM_MODE.EDIT,
      });
      closeForm();
    } catch (error) {
      showErrorToast(error.message || "Lưu lỗi kiểm mẫu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Chuyển mẫu có lỗi sang trạng thái HÀNG SỬA.
  const handleSendToRepair = async () => {
    if (!barcodeMau || !inspectionType) {
      showErrorToast("Thiếu Barcode mẫu hoặc loại kiểm");
      return;
    }

    setSaving(true);
    try {
      const response = await capNhatTrangThaiBarcodeMau({
        BarcodeMau: barcodeMau,
        LoaiKiemMau: inspectionType,
        TrangThai: "HÀNG SỬA",
        isSua: true,
      });
      if (!response.success) {
        showErrorToast(response.message || "Chuyển hàng sửa thất bại");
        return;
      }

      setCurrentStatus("HÀNG SỬA");
      await loadSampleInfo();
      showSuccessToast(
        response.message || "Đã chuyển mẫu sang trạng thái HÀNG SỬA",
      );
      loadDefects();
    } catch (error) {
      showErrorToast(error.message || "Có lỗi khi chuyển hàng sửa");
    } finally {
      setSaving(false);
    }
  };

  // Chuyển mẫu đã được xử lý sang trạng thái HÀNG ĐẠT.
  const handleSendToQualified = async () => {
    if (!barcodeMau || !inspectionType) {
      showErrorToast("Thiếu Barcode mẫu hoặc loại kiểm");
      return;
    }

    setSaving(true);
    try {
      const response = await capNhatTrangThaiBarcodeMau({
        BarcodeMau: barcodeMau,
        LoaiKiemMau: inspectionType,
        TrangThai: "HÀNG ĐẠT",
        isSua: false,
      });
      if (!response.success) {
        showErrorToast(response.message || "Chuyển hàng đạt thất bại");
        return;
      }

      setCurrentStatus("HÀNG ĐẠT");
      await loadSampleInfo();
      showSuccessToast(
        response.message || "Đã chuyển mẫu sang trạng thái HÀNG ĐẠT",
      );
      loadDefects();
    } catch (error) {
      showErrorToast(error.message || "Có lỗi khi chuyển hàng đạt");
    } finally {
      setSaving(false);
    }
  };

  const {
    selectedDocumentIndex,
    setSelectedDocumentIndex,
    isDocumentModalOpen,
    setIsDocumentModalOpen,
    dsFileName,
    handleViewDocuments,
    dsFile,
    loadingFile,
    fetchDsFile,
  } = useTechnicalDocuments(barcodeMau);

  return (
    <MainLayout screenTitle="Phòng kỹ thuật">
      <main className="flex min-h-full flex-1 flex-col bg-egmf-surface px-3 pt-4 text-egmf-ink sm:px-5 sm:py-5 lg:px-7 lg:py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <SampleInfoCard
            sample={sampleInfo}
            loading={loadingSampleInfo}
            inspectionType={inspectionType}
            fallbackBarcode={barcodeMau}
          />

          <section className="mb-3 overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card sm:mb-4">
            <header className="flex min-h-14 items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                  <ClipboardCheck size={17} strokeWidth={2.25} />
                </span>
                <h2 className="m-0 truncate text-[15px] font-extrabold text-egmf-ink">
                  Thao tác
                </h2>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
              <ActionButton
                icon={Plus}
                label="Thêm lỗi mới"
                onClick={openCreateForm}
                tone="rose"
              />
              <ActionButton
                icon={Users}
                label="Người may mẫu"
                onClick={onUpdateWorkers}
              />
              {canSendToRepair && (
                <ActionButton
                  icon={Wrench}
                  label={saving ? "Đang chuyển..." : "Chuyển hàng sửa"}
                  onClick={handleSendToRepair}
                  disabled={saving}
                  tone="orange"
                />
              )}

              {canSendToQualified && (
                <ActionButton
                  icon={PackageCheck}
                  label={saving ? "Đang chuyển..." : "Chuyển hàng đạt"}
                  onClick={handleSendToQualified}
                  disabled={saving}
                  tone="emerald"
                />
              )}
              <ActionButton
                icon={FileText}
                label="Xem tài liệu"
                onClick={handleViewDocuments}
              />
            </div>
          </section>

          <section className="mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card sm:mb-0">
            <header className="flex min-h-14 items-center gap-2.5 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3.5 py-3 sm:px-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                <ClipboardPenLine size={17} strokeWidth={2.25} />
              </span>
              <h2 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                Chi tiết lỗi
              </h2>
            </header>

            <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
              {loadingDefects ? (
                <LoadingDefects />
              ) : defects.length === 0 ? (
                <EmptyDefectState />
              ) : (
                <div className="space-y-2.5">
                  {defects.map((defect, index) => (
                    <DefectCard
                      key={
                        defect.IdDetail ??
                        `${defect.MaLoi ?? ""}-${defect.ThoiGianKhaiBao ?? ""}-${index}`
                      }
                      defect={defect}
                      onEdit={() => openEditForm(defect)}
                      onDelete={() => handleDeleteDefect(defect)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <DefectFormModal
        key={editingDefect?.IdDetail ?? "new-defect"}
        dsLoi={defectOptions}
        isOpen={isFormOpen}
        mode={defectFormMode}
        form={form}
        existingImageUrl={layAnhKiemMau(existingImagePath)}
        removeExistingImage={removeImage}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSave}
        onFormChange={(changes) =>
          setForm((previous) => ({ ...previous, ...changes }))
        }
        onDefectNameChange={handleDefectNameChange}
        onImageFileChange={setDefectImage}
        onRemoveExistingImage={() => setRemoveImage(true)}
        onRestoreExistingImage={() => setRemoveImage(false)}
      />

      <DeleteDefectConfirmModal
        defect={defectPendingDelete}
        deleting={deletingDefect}
        onCancel={() => setDefectPendingDelete(null)}
        onConfirm={confirmDeleteDefect}
      />

      <DocumentPreviewModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        fileNames={dsFileName}
        hasDocuments={Boolean(dsFileName.length)}
        isLoadingFiles={loadingDocuments}
        selectedIndex={selectedDocumentIndex}
        onSelectedIndexChange={setSelectedDocumentIndex}
      />
    </MainLayout>
  );
}

function DeleteDefectConfirmModal({ defect, deleting, onCancel, onConfirm }) {
  if (!defect) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-defect-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start gap-3 border-b border-egmf-border-subtle bg-gradient-to-r from-rose-50 via-white to-white px-4 py-4 sm:px-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600">
            <TriangleAlert size={22} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2
              id="delete-defect-title"
              className="m-0 text-base font-extrabold text-egmf-ink"
            >
              Xác nhận xóa lỗi
            </h2>
            <p className="m-0 mt-1 text-sm leading-5 text-egmf-ink-secondary">
              Thao tác này không thể hoàn tác.
            </p>
          </div>
        </header>

        <div className="px-4 py-4 sm:px-5">
          <p className="m-0 text-sm leading-6 text-egmf-ink-secondary">
            Bạn có chắc muốn xóa lỗi kiểm mẫu này không?
          </p>
          <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/70 px-3.5 py-3">
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-rose-600">
              Lỗi sẽ bị xóa
            </p>
            <p className="m-0 mt-1 break-words text-sm font-extrabold text-egmf-ink">
              {defect.TenLoi || "Lỗi kiểm mẫu"}
            </p>
            {defect.MaLoi && (
              <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                Mã lỗi: {defect.MaLoi}
              </p>
            )}
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-3 sm:px-5">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-egmf-border bg-white px-4 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(225,29,72,.22)] transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {deleting ? "Đang xóa..." : "Xóa lỗi"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  tone = "primary",
}) {
  const toneClass = {
    primary:
      "border-egmf-primary-border-soft bg-egmf-primary-soft text-egmf-primary hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary-strong",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100",
    orange:
      "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex min-h-12 items-center gap-3 rounded-xl border px-3.5 text-left shadow-sm transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-55 ${toneClass}`}
    >
      <Icon
        size={20}
        strokeWidth={2.2}
        className="transition-transform group-hover:scale-110"
      />
      <span className="text-sm font-extrabold leading-4">{label}</span>
    </button>
  );
}

function LoadingDefects() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-egmf-border bg-egmf-surface-subtle p-5">
      <LoaderCircle size={24} className="animate-spin text-egmf-primary" />
      <p className="mt-2 text-sm font-semibold text-egmf-muted">
        Đang tải danh sách lỗi kiểm mẫu...
      </p>
    </div>
  );
}

function EmptyDefectState() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle p-5 text-center">
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

function getFullName(user) {
  return [user?.data?.HoVaTenLot, user?.data?.Ten].filter(Boolean).join(" ");
}

function normalizeStatus(status) {
  return String(status ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function getExistingImagePath(defect) {
  return defect?.ImagePath ?? defect?.imagePath ?? "";
}
