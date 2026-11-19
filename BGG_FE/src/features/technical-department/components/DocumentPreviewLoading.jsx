import { LoaderCircle } from "lucide-react";

export default function DocumentPreviewLoading({ label }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/85 text-center text-sm font-semibold text-egmf-muted backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle size={28} className="animate-spin text-egmf-primary" />
      <span>{label}</span>
    </div>
  );
}
