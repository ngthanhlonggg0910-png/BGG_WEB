import React, { useEffect, useState } from "react";
import { Modal, Spin, Checkbox } from "antd";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Layers,
  Package,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  kiemTraTienDoSoanHang,
  xacNhanXuatKho,
} from "../api/pickingOrderAPI";
import { getCurrentUser } from "../../../shared/auth/session";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

export default function ConfirmPickingModal({
  open,
  onClose,
  phieuSoanHangId,
  maSoPhieuSoan,
  onSuccess,
}) {
  const user = getCurrentUser();
  const tkId = user?.data?.TKId;
  const tenNguoiXacNhan = `${user?.data?.HoVaTenLot || ""} ${user?.data?.Ten || ""}`.trim() || "Thủ kho";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [forceComplete, setForceComplete] = useState(false);

  // Tải dữ liệu tiến độ từ backend
  const fetchProgress = async () => {
    if (!phieuSoanHangId) return;
    setLoading(true);
    setForceComplete(false);
    try {
      const res = await kiemTraTienDoSoanHang(phieuSoanHangId);
      if (res?.success && res.data) {
        setProgressData(res.data);
      } else {
        showErrorToast(res?.message || "Không thể tải tiến độ soạn hàng");
      }
    } catch (err) {
      console.error("Lỗi kiểm tra tiến độ:", err);
      showErrorToast(
        err.response?.data?.message || err.message || "Lỗi kết nối máy chủ",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && phieuSoanHangId) {
      fetchProgress();
    } else {
      setProgressData(null);
      setForceComplete(false);
    }
  }, [open, phieuSoanHangId]);

  if (!open) return null;

  const isCompleted =
    progressData?.tinhTrang?.toLowerCase() === "hoanthanh";
  const isCancelled =
    progressData?.tinhTrang?.toLowerCase() === "huy";
  const tongSoCay = progressData?.tongSoCayDaQuet ?? 0;
  const isDu100 = Boolean(progressData?.isDu100);
  const soCayChuaChot = progressData?.soCayChuaChotDot ?? 0;
  const daTungCoDot = (progressData?.danhSachDotXuat?.length ?? 0) > 0;

  // Xử lý xác nhận xuất
  const handleConfirm = async (isCompleteAction) => {
    if (!tkId) {
      showWarningToast("Không tìm thấy thông tin tài khoản người dùng!");
      return;
    }

    if (tongSoCay === 0) {
      showWarningToast("Phiếu chưa quét bất kỳ cây nào để xuất!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        phieuSoanHangId,
        xacNhanHoanTat: isCompleteAction,
        choPhepDongKhiThieu: forceComplete,
        tkId,
        tenNguoiXacNhan,
      };

      const res = await xacNhanXuatKho(payload);

      if (res?.success) {
        showSuccessToast(res.message || "Xác nhận xuất kho thành công!");
        onSuccess?.(res.data);
        onClose?.();
      } else {
        showErrorToast(res?.message || "Xác nhận xuất kho thất bại");
      }
    } catch (err) {
      console.error("Lỗi xác nhận xuất kho:", err);
      showErrorToast(
        err.response?.data?.message ||
          err.message ||
          "Có lỗi xảy ra khi xác nhận xuất kho",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      destroyOnClose
      title={
        <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <span>Xác nhận xuất kho phiếu soạn hàng</span>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : !progressData ? (
          <div className="py-8 text-center text-slate-500">
            Không có dữ liệu tiến độ của phiếu.
          </div>
        ) : (
          <>
            {/* THÔNG TIN PHIẾU */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mã phiếu:</span>
                <span className="font-bold text-slate-900">
                  {progressData.maSoPhieuSoan || maSoPhieuSoan}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : isCancelled
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isCompleted
                    ? "Đã hoàn thành"
                    : isCancelled
                      ? "Đã hủy"
                      : "Đang thực hiện"}
                </span>
              </div>
            </div>

            {/* THANH TIẾN ĐỘ */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-slate-700">Tiến độ soạn hàng</span>
                <span
                  className={`text-base font-bold ${
                    isDu100 ? "text-emerald-600" : "text-blue-600"
                  }`}
                >
                  {progressData.phanTramTienDo}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-500 ${
                    isDu100 ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(100, progressData.phanTramTienDo)}%`,
                  }}
                />
              </div>

              {/* THÔNG SỐ CHI TIẾT */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">Mặt hàng đã đủ</p>
                  <p className="mt-0.5 font-bold text-slate-800">
                    {progressData.matHangDaDu} / {progressData.tongMatHang} mặt hàng
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">Lượng thực soạn / Yêu cầu</p>
                  <p className="mt-0.5 font-bold text-slate-800">
                    {Number(progressData.tongSoLuongThucSoan).toLocaleString()}{" "}
                    / {Number(progressData.tongSoLuongYeuCau).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">Tổng cây đã quét</p>
                  <p className="mt-0.5 font-bold text-slate-800">
                    {progressData.tongSoCayDaQuet} cây
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">Cây mới chưa chốt đợt</p>
                  <p
                    className={`mt-0.5 font-bold ${
                      soCayChuaChot > 0 ? "text-blue-600" : "text-slate-500"
                    }`}
                  >
                    {soCayChuaChot} cây
                  </p>
                </div>
              </div>
            </div>

            {/* LỊCH SỬ ĐỢT XUẤT (NẾU CÓ) */}
            {daTungCoDot && (
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-sm">
                <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Các đợt xuất đã ghi nhận ({progressData.danhSachDotXuat.length} đợt)</span>
                </p>
                <div className="mt-2 max-h-32 divide-y divide-slate-100 overflow-y-auto">
                  {progressData.danhSachDotXuat.map((batch) => (
                    <div
                      key={batch.dotXuatId}
                      className="flex items-center justify-between py-1.5 text-slate-600"
                    >
                      <span className="font-semibold text-slate-800">
                        Đợt {batch.soDot}: {batch.soCay} cây ({Number(batch.tongSoLuong).toLocaleString()})
                      </span>
                      <span className="text-slate-500">
                        {batch.nguoiXuat} • {formatDateTime(batch.ngayXuat)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CẢNH BÁO VÀ HƯỚNG DẪN */}
            {isCompleted ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Phiếu đã hoàn thành xuất kho!</p>
                  <p className="mt-0.5">Toàn bộ vật tư đã được xuất và chốt hoàn tất.</p>
                </div>
              </div>
            ) : isCancelled ? (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800">
                <XCircle className="h-6 w-6 shrink-0 text-rose-600" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Phiếu soạn hàng đã bị hủy!</p>
                  <p className="mt-0.5">Không thể thực hiện các thao tác xuất kho trên phiếu này.</p>
                </div>
              </div>
            ) : tongSoCay === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Chưa quét bất kỳ cây vải/vật tư nào!</p>
                  <p className="mt-0.5">
                    Vui lòng thực hiện quét các cây nguyên phụ liệu vào phiếu trước khi xác nhận xuất kho.
                  </p>
                </div>
              </div>
            ) : isDu100 ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Đã soạn đủ 100%!</p>
                  <p className="mt-0.5">
                    Tất cả {progressData.tongMatHang} mặt hàng đã đủ số lượng yêu cầu. Bấm nút bên dưới để hoàn tất xuất kho.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-blue-900">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold">Phiếu chưa đủ 100% (Xuất trước theo đợt)</p>
                    <p className="mt-0.5 text-blue-800">
                      Mới quét được {progressData.matHangDaDu}/{progressData.tongMatHang} mặt hàng ({progressData.phanTramTienDo}%).
                      Hệ thống sẽ ghi nhận đợt xuất cho {soCayChuaChot > 0 ? `${soCayChuaChot} cây mới` : "các cây đã quét"} và giữ phiếu ở trạng thái <b>Đang thực hiện</b> để tiếp tục quét sau.
                    </p>
                  </div>
                </div>

                {/* Tuỳ chọn chốt hoàn tất dù còn thiếu */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <Checkbox
                    checked={forceComplete}
                    onChange={(e) => setForceComplete(e.target.checked)}
                    className="text-xs sm:text-sm font-medium text-slate-700"
                  >
                    Chốt hoàn tất phiếu luôn (dù còn thiếu vật tư)
                  </Checkbox>
                  {forceComplete && (
                    <p className="mt-1 pl-6 text-xs text-rose-600 font-medium">
                      ⚠️ Cảnh báo: Phiếu sẽ được chuyển sang 'Hoàn thành' và đóng đơn, không thể quét thêm!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* BUTTONS ACTION */}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Đóng
              </button>

              {!isCompleted && !isCancelled && (
                <>
                  {isDu100 || forceComplete ? (
                    <button
                      type="button"
                      disabled={submitting || tongSoCay === 0}
                      onClick={() => handleConfirm(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {submitting
                          ? "Đang xử lý..."
                          : forceComplete
                            ? "Chốt hoàn tất phiếu (dù còn thiếu)"
                            : "Xác nhận hoàn tất xuất kho (100%)"}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting || tongSoCay === 0}
                      onClick={() => handleConfirm(false)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {submitting
                          ? "Đang xử lý..."
                          : soCayChuaChot > 0
                            ? `Xác nhận xuất đợt này (${soCayChuaChot} cây mới)`
                            : "Xác nhận xuất đợt này (xuất thiếu)"}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
