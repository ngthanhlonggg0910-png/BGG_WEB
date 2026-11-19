export default function CuttingSection({
  title,
  icon: Icon,
  tone = "primary",
  children,
  action,
}) {
  const tones = {
    primary: "bg-egmf-primary-soft text-egmf-primary",
    warning: "bg-amber-50 text-amber-700",
    success: "bg-emerald-50 text-emerald-700",
    danger: "bg-rose-50 text-rose-700",
  };

  return (
    <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
              <Icon size={17} strokeWidth={2.25} />
            </span>
          )}
          <h2 className="m-0 truncate text-sm font-extrabold text-egmf-ink">
            {title}
          </h2>
        </div>
        {action}
      </header>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}
