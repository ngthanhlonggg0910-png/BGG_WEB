import { Image as ImageIcon, Maximize2 } from "lucide-react";

export default function SampleImageCard({ title, src, subtitle }) {
  return (
    <section className="group overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-sm transition-shadow duration-200 hover:shadow-egmf-card">
      <header className="flex min-h-13 items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
            <ImageIcon size={17} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate text-[15px] font-extrabold text-egmf-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="m-0 mt-0.5 truncate text-[11px] font-medium text-egmf-muted">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {src && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg text-egmf-muted transition-colors group-hover:bg-egmf-primary-tint group-hover:text-egmf-primary">
            <Maximize2 size={16} aria-hidden="true" />
            <span className="sr-only">Xem ảnh kích thước lớn</span>
          </span>
        )}
      </header>
      <div className="aspect-[16/9] min-h-40 bg-gradient-to-br from-egmf-surface-subtle via-white to-cyan-50/70 p-3 sm:p-4">
        {src ? (
          <img
            src={src}
            alt={title}
            loading="lazy"
            className="size-full rounded-xl object-contain"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center rounded-xl border border-dashed border-cyan-200 bg-white/80 px-4 text-center text-egmf-muted">
            <span className="grid size-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <ImageIcon size={22} strokeWidth={1.8} />
            </span>
            <p className="m-0 mt-2.5 text-sm font-bold text-egmf-ink-secondary">
              Chưa có hình ảnh
            </p>
            <p className="m-0 mt-1 text-xs leading-5 text-egmf-muted">
              Hình ảnh sẽ hiển thị khi có dữ liệu từ phiếu mẫu.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
