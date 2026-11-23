import { Check, ClipboardPenLine, Minus, Plus, X } from "lucide-react";
import { createPortal } from "react-dom";

import AppSelect from "../../../../shared/components/ui/AppSelect";
import DefectImageField from "./DefectImageField";

export default function DefectFormModal({
  dsLoi,
  isOpen,
  editingDefect,
  form,
  imagePreview,
  saving,
  cameraInputRef,
  imageInputRef,
  onClose,
  onSubmit,
  onFormChange,
  onDefectNameChange,
  onImageChange,
  onRemoveImage,
}) {
  if (!isOpen) return null;

  const canSave = Boolean(
    form.TenLoi && form.CumLoiId && form.MucDoNghiemTrong,
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/55 p-0 pb-[max(6rem,env(safe-area-inset-bottom))] backdrop-blur-xs sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="defect-form-title"
        className="flex h-full min-h-0 max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:max-h-[46rem] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-egmf-border-subtle bg-gradient-to-r from-egmf-primary-soft via-white to-white px-4 pb-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] sm:px-5 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-egmf-primary shadow-sm ring-1 ring-egmf-primary/10">
              <ClipboardPenLine size={18} strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <h2
                id="defect-form-title"
                className="m-0 text-base font-extrabold text-egmf-ink"
              >
                {editingDefect ? "Cập nhật lỗi" : "Thêm lỗi mới"}
              </h2>
              <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                Các trường có dấu * là bắt buộc.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Đóng biểu mẫu lỗi"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-egmf-muted transition hover:bg-white hover:text-egmf-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        <form
          id="defect-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain"
            style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
            onFocusCapture={(event) => {
              requestAnimationFrame(() =>
                event.target.scrollIntoView({ block: "nearest" }),
              );
            }}
          >
            <div className="grid gap-3 p-4 pb-8 sm:grid-cols-2 sm:p-5">
              <Field
                label="Vị trí lỗi"
                value={form.ViTriLoi}
                onChange={(ViTriLoi) => onFormChange({ ViTriLoi })}
              />
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <DefectSelectField
                  value={form.TenLoi}
                  options={dsLoi}
                  onChange={onDefectNameChange}
                />
                <Field
                  label="Hướng xử lý"
                  value={form.BienPhapXuLy}
                  onChange={(BienPhapXuLy) =>
                    onFormChange({ BienPhapXuLy })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <Field label="Cụm lỗi" value={form.CumLoi} disabled />
                <SeveritySelectField
                  value={form.MucDoNghiemTrong}
                  onChange={(MucDoNghiemTrong) =>
                    onFormChange({ MucDoNghiemTrong })
                  }
                />
              </div>
              <QuantityField
                value={form.SoLuong}
                onChange={(SoLuong) => onFormChange({ SoLuong })}
              />
              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                <div className="order-2 sm:order-1">
                  <TextArea
                    label="Ghi chú"
                    optional
                    value={form.GhiChu}
                    onChange={(GhiChu) => onFormChange({ GhiChu })}
                  />
                </div>
                <div className="order-1 sm:order-2">
                  <DefectImageField
                    preview={imagePreview}
                    cameraInputRef={cameraInputRef}
                    imageInputRef={imageInputRef}
                    onImageChange={onImageChange}
                    onRemove={onRemoveImage}
                  />
                </div>
              </div>
              {editingDefect && (
                <div className="sm:col-span-2">
                  <TextArea
                    label="Kết quả cuối cùng"
                    value={form.KetQuaCuoi}
                    onChange={(KetQuaCuoi) => onFormChange({ KetQuaCuoi })}
                  />
                </div>
              )}
            </div>
          </div>
        </form>

        <footer className="z-10 min-h-[4.75rem] shrink-0 grid grid-cols-2 gap-2 border-t border-egmf-border-subtle bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_20px_rgba(15,23,42,.06)] sm:px-5 sm:py-3">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-11 rounded-xl border border-egmf-border bg-white px-5 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="defect-form"
            disabled={!canSave || saving}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={17} strokeWidth={2.5} />
            {saving ? "Đang lưu..." : "Lưu lỗi"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function Field({ label, value, onChange, disabled = false }) {
  return (
    <label className="block min-w-0 text-xs font-bold text-egmf-ink-secondary">
      {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-egmf-border bg-white px-3 text-sm font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10 disabled:cursor-not-allowed disabled:bg-egmf-surface-subtle disabled:text-egmf-muted"
      />
    </label>
  );
}

function DefectSelectField({ value, options, onChange }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-xs font-bold text-egmf-ink-secondary">
        Tên lỗi <span className="ml-1 text-rose-600">*</span>
      </p>
      <AppSelect
        value={value}
        onChange={(defectName) => onChange(defectName ?? "")}
        options={options
          .filter((item) => item.ten_loi)
          .map((item) => ({ value: item.ten_loi, label: item.ten_loi }))}
        placeholder="Chọn lỗi"
        searchable
        allowClear
        minHeight={44}
        menuMaxHeight={240}
        className="mt-1.5"
        aria-label="Chọn hoặc tìm tên lỗi"
      />
    </div>
  );
}

function SeveritySelectField({ value, onChange }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-xs font-bold text-egmf-ink-secondary">
        Mức độ <span className="ml-1 text-rose-600">*</span>
      </p>
      <AppSelect
        value={value}
        onChange={onChange}
        options={[
          { value: "NHẸ", label: "NHẸ" },
          { value: "NẶNG", label: "NẶNG" },
          { value: "NGHIÊM TRỌNG", label: "NGHIÊM TRỌNG" },
        ]}
        minHeight={44}
        menuMaxHeight={220}
        className="mt-1.5"
        aria-label="Chọn mức độ lỗi"
      />
    </div>
  );
}

function QuantityField({ value, onChange }) {
  return (
    <div>
      <p className="m-0 text-xs font-bold text-egmf-ink-secondary">Số lượng</p>
      <div className="mt-1.5 flex h-11 w-full items-center overflow-hidden rounded-xl border border-egmf-border bg-white">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label="Giảm số lượng"
          className="grid h-full w-11 shrink-0 place-items-center border-r border-egmf-border text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-primary"
        >
          <Minus size={17} />
        </button>
        <span className="flex flex-1 items-center justify-center text-sm font-extrabold text-egmf-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label="Tăng số lượng"
          className="grid h-full w-11 shrink-0 place-items-center border-l border-egmf-border text-egmf-primary transition hover:bg-egmf-primary-tint"
        >
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}

function TextArea({ label, optional = false, value, onChange }) {
  return (
    <label className="block min-w-0 text-xs font-bold text-egmf-ink-secondary">
      {label}
      {optional && (
        <span className="ml-1 font-medium text-egmf-muted">
          (không bắt buộc)
        </span>
      )}
      <textarea
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full resize-y rounded-xl border border-egmf-border bg-white px-3 py-2.5 text-sm font-semibold leading-5 text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
      />
    </label>
  );
}
