import { useState } from "react";
import { AlertCircle, CalendarDays, Trash2, UserRound } from "lucide-react";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const DeclaredAccessoryDefectCard = ({ defect, onDelete }) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { MaLoi, TenLoi, SoLuongLoi, TenNguoiTao, NgayGiamDinh } = defect;

  const handleConfirmDelete = () => {
    onDelete?.(defect);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <article className="flex items-center gap-3 border-b border-egmf-border-subtle px-4 py-3.5 last:border-b-0 sm:px-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
          <AlertCircle size={20} strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-extrabold text-egmf-ink">
                {TenLoi || "Chưa có tên lỗi"}
              </p>
              <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                Mã lỗi: {MaLoi || "—"}
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-egmf-muted">
            <span className="inline-flex min-w-0 items-center gap-1">
              <UserRound size={13} />
              <span className="max-w-36 truncate">{TenNguoiTao || "—"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} />
              {formatDateTime(NgayGiamDinh)}
            </span>
          </div>
        </div>

        <span className="flex size-12 shrink-0 flex-col items-center justify-center text-center text-egmf-ink-secondary">
          <span className="text-[10px] font-bold uppercase leading-none text-egmf-muted">
            SL
          </span>
          <span className="mt-0.5 text-base font-extrabold leading-none">
            {SoLuongLoi ?? 0}
          </span>
        </span>

        <button
          type="button"
          onClick={() => setIsDeleteConfirmOpen(true)}
          aria-label={`Xóa lỗi ${TenLoi || MaLoi || "phụ liệu"}`}
          title="Xóa lỗi"
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 active:scale-[0.96]"
        >
          <Trash2 size={17} strokeWidth={2.3} />
        </button>
      </article>

      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-defect-modal-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-egmf-border bg-white shadow-[0_28px_72px_rgba(15,23,42,.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-egmf-surface-subtle px-5 pb-5 pt-6 sm:px-6">
              <span className="absolute -right-7 -top-7 size-28 rounded-full bg-red-100/80" />
              <span className="absolute -right-1 top-12 size-12 rounded-full border-[10px] border-red-100/80" />
              <div className="relative flex items-start gap-4">
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-red-500 text-white shadow-[0_10px_22px_rgba(239,68,68,.26)]">
                  <Trash2 size={26} strokeWidth={2.35} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-red-600">
                    <AlertCircle size={13} strokeWidth={2.7} />
                    Thao tác cần xác nhận
                  </span>
                  <h2
                    id="delete-defect-modal-title"
                    className="m-0 mt-2 text-lg font-extrabold text-egmf-ink"
                  >
                    Xác nhận xóa lỗi
                  </h2>
                  <p className="m-0 mt-1 text-sm leading-5 text-egmf-muted">
                    Thao tác này sẽ gỡ lỗi khỏi phiếu giám định.
                  </p>
                </div>
              </div>
            </header>

            <div className="px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-red-500 shadow-sm">
                  <AlertCircle size={20} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-red-500">
                    Lỗi phụ liệu
                  </p>
                  <p className="m-0 mt-0.5 truncate text-base font-extrabold text-egmf-ink">
                    {TenLoi || "Chưa có tên lỗi"}
                  </p>
                  <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                    Mã lỗi: {MaLoi || "—"}
                  </p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block text-[10px] font-bold uppercase text-egmf-muted">
                    SL
                  </span>
                  <span className="block text-base font-extrabold text-egmf-ink">
                    {SoLuongLoi ?? 0}
                  </span>
                </span>
              </div>
              <p className="m-0 mt-4 text-sm leading-5 text-egmf-ink-secondary">
                Bạn có chắc muốn xóa lỗi này không? Dữ liệu đã xóa không thể
                khôi phục.
              </p>
            </div>

            <footer className="flex flex-col-reverse gap-2.5 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="h-11 rounded-xl border border-egmf-border bg-white px-5 text-sm font-bold text-egmf-ink-secondary transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
              >
                <Trash2 size={17} strokeWidth={2.4} />
                Xóa lỗi
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
};

export default DeclaredAccessoryDefectCard;
