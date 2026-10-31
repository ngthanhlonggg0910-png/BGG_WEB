import { BadgeCheck, CircleAlert, TriangleAlert, X } from "lucide-react";
import { toast } from "react-toastify";

const toastVariants = {
  success: {
    icon: BadgeCheck,
    label: "Thành công",
    iconClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    markerClass: "bg-emerald-500",
  },
  error: {
    icon: CircleAlert,
    label: "Không thể thực hiện",
    iconClass: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
    markerClass: "bg-rose-500",
  },
  warning: {
    icon: TriangleAlert,
    label: "Lưu ý",
    iconClass: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    markerClass: "bg-amber-500",
  },
};

export default function CustomToast({
  title,
  message,
  type = "error",
  closeToast,
}) {
  const variant = toastVariants[type] ?? toastVariants.error;
  const Icon = variant.icon;

  return (
    <div className="flex w-full items-start gap-3.5">
      {/* Icon trạng thái */}
      <span className={`mt-0.5 h-10 w-1 shrink-0 rounded-full ${variant.markerClass}`} />
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${variant.iconClass}`}
      >
        <Icon size={23} strokeWidth={2.25} />
      </div>

      {/* Nội dung */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="mb-1 text-[15px] font-extrabold tracking-[-0.01em] text-slate-900">
          {title || variant.label}
        </h3>

        <div className="whitespace-pre-line break-words text-sm leading-5 text-slate-500">
          {message}
        </div>
      </div>

      {/* Nút đóng - vùng bấm 44x44px */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          closeToast?.();
        }}
        aria-label="Đóng thông báo"
        className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 touch-manipulation"
      >
        <X size={19} strokeWidth={2.5} />
      </button>
    </div>
  );
}

const showToast = (type, message) => {
  toast[type](
    ({ closeToast }) => (
      <CustomToast
        message={message}
        type={type}
        closeToast={closeToast}
      />
    ),
    {
      icon: false,
      closeButton: false,
      className: `custom-toast custom-toast--${type}`,
      progressClassName: `custom-toast-progress-${type}`,
    },
  );
};

export const showErrorToast = (message) => showToast("error", message);

export const showSuccessToast = (message) => showToast("success", message);

export const showWarningToast = (message) => showToast("warning", message);
