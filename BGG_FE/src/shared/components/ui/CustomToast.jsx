import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "react-toastify";

export default function CustomToast({
  title,
  message,
  type = "error",
  closeToast,
}) {
  const isError = type === "error";

  return (
    <div className="flex w-full items-start gap-3">
      {/* Icon trạng thái */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isError ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
        }`}
      >
        {isError ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
      </div>

      {/* Nội dung */}
      <div className="min-w-0 flex-1 py-1">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{title}</h3>

        <div className="whitespace-pre-line break-words text-sm leading-6 text-gray-600">
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
        className="
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          text-gray-500
          transition-colors
          hover:bg-gray-100
          active:bg-gray-200
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#6865D9]
          touch-manipulation
        "
      >
        <X size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export const showErrorToast = (message) => {
  toast.error(
    ({ closeToast }) => (
      <CustomToast
        title="Soạn hàng thất bại"
        message={message}
        type="error"
        closeToast={closeToast}
      />
    ),
    {
      icon: false,
      closeButton: false,
      className: "custom-toast",
      progressClassName: "custom-toast-progress-error",
    },
  );
};

export const showSuccessToast = (message) => {
  toast.success(
    ({ closeToast }) => (
      <CustomToast
        title="Thành công"
        message={message}
        type="success"
        closeToast={closeToast}
      />
    ),
    {
      icon: false,
      closeButton: false,
      className: "custom-toast",
      progressClassName: "custom-toast-progress-success",
    },
  );
};
