import { WifiOff } from "lucide-react";

export default function ConnectionBanners({ online, hasUpdate, onUpdate }) {
  return (
    <>
      {!online && (
        <div className="flex items-center gap-2.5 bg-[#fff1e7] px-4 py-3 text-sm font-medium text-[#aa6632] md:px-8">
          <WifiOff size={17} className="shrink-0" />
          <span>
            Bạn đang ngoại tuyến. Kết nối lại để tải và đồng bộ dữ liệu Kho &
            Sản xuất.
          </span>
        </div>
      )}
      {hasUpdate && (
        <div className="flex items-center gap-2.5 bg-[#eaf0ff] px-4 py-3 text-sm font-medium text-[#335bb8] md:px-8">
          <span>Đã có phiên bản mới.</span>
          <button
            type="button"
            onClick={onUpdate}
            className="font-bold text-egmf-primary underline hover:text-egmf-primary-strong"
          >
            Tải lại ứng dụng
          </button>
        </div>
      )}
    </>
  );
}
