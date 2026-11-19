import { CheckCircle2, LockKeyhole, RefreshCw, GitMerge } from "lucide-react";

const actions = [
  {
    id: "update",
    label: "Cập nhật",
    icon: RefreshCw,
  },
  {
    id: "spread",
    label: "Đã trải",
    icon: CheckCircle2,
  },
  {
    id: "lock",
    label: "Khóa phiếu",
    icon: LockKeyhole,
  },
  {
    id: "splice",
    label: "Nối cây",
    icon: GitMerge,
  },
];

export default function CuttingActionBar({ onAction }) {
  return (
    <section className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {actions.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onAction(id)}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-egmf-primary-border bg-egmf-primary-soft px-3 text-[15px] font-extrabold text-egmf-primary transition hover:bg-egmf-primary-tint hover:text-egmf-primary-strong active:scale-[0.98]"
        >
          <Icon size={20} strokeWidth={2.4} />
          {label}
        </button>
      ))}
    </section>
  );
}
