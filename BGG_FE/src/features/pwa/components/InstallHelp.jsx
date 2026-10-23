import { Smartphone, X } from "lucide-react";
import { useEffect } from "react";

export default function InstallHelp({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="egmf-dialog-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[#1b2d4b]/40 p-4 backdrop-blur-[3px] sm:p-6"
      onClick={onClose}
    >
      <section
        className="egmf-dialog-panel relative max-h-[calc(100dvh-40px)] w-full max-w-[520px] overflow-auto rounded-[18px] bg-white p-6 shadow-[0_25px_80px_rgba(17,39,75,0.22)] sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#8f9cb2] transition hover:bg-[#edf2fb] hover:text-slate-700"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-egmf-primary-tint text-egmf-primary">
          <Smartphone size={24} />
        </div>

        <h2
          id="install-title"
          className="mb-2 text-[22px] font-bold tracking-tight text-[#202d45]"
        >
          Luôn sẵn sàng trên điện thoại
        </h2>

        {window.isSecureContext ? (
          <div className="mb-5 space-y-3 text-sm leading-relaxed text-[#65758d]">
            <p>
              <strong className="text-[#202d45]">iPhone/iPad:</strong> mở bằng
              Safari, chọn <strong>Chia sẻ (Share)</strong> →{" "}
              <strong>Thêm vào màn hình chính (Add to Home Screen)</strong>.
            </p>
            <p>
              <strong className="text-[#202d45]">Android:</strong> mở bằng
              Chrome, chọn menu <strong>⋮</strong> →{" "}
              <strong>Cài đặt ứng dụng</strong> hoặc{" "}
              <strong>Thêm vào màn hình chính</strong>.
            </p>
          </div>
        ) : (
          <div className="mb-5 space-y-3 text-sm leading-relaxed text-[#65758d]">
            <p>
              Bạn đang dùng phiên bản web qua HTTP. Hãy mở địa chỉ này trực tiếp
              trên trình duyệt để đăng nhập và thao tác.
            </p>
            <p className="text-xs text-[#8090a9]">
              Chức năng cài PWA và dùng giao diện khi mất mạng cần HTTPS. Bạn có
              thể lưu dấu trang hoặc tạo lối tắt nếu trình duyệt hỗ trợ.
            </p>
          </div>
        )}

        <button
          type="button"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-egmf-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-egmf-primary-strong sm:w-auto"
          onClick={onClose}
        >
          Đã hiểu
        </button>
      </section>
    </div>
  );
}
