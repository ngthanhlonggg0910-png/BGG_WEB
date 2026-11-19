import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
export default function LockModal({ handleConfirmDelete }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative px-6 pb-5 pt-7 text-center">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            aria-label="Đóng"
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle
              size={32}
              className="text-red-500"
              strokeWidth={1.8}
            />
          </div>

          <h2
            id="delete-modal-title"
            className="text-xl font-bold text-slate-800"
          >
            Xác nhận xóa phiếu
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Bạn có chắc chắn muốn xóa phiếu hoạch toán này không?
          </p>

          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-sm text-red-700">
            <strong>Lưu ý:</strong> Dữ liệu sau khi xóa có thể không khôi phục
            được. Vui lòng kiểm tra kỹ trước khi xác nhận.
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirmDelete}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={17} />
            {deleting ? "Đang xóa..." : "Xóa phiếu"}
          </button>
        </div>
      </div>
    </div>
  );
}
