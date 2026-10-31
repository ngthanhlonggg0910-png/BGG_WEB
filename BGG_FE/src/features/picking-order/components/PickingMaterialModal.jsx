import { useEffect, useState } from "react";
import { Modal, InputNumber } from "antd";
import { PackageCheck, X, Check } from "lucide-react";
import { getCurrentUser } from "../../../shared/auth/session";
import { pickFabricRoll } from "../api/pickingOrderAPI";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";

export default function PickingMaterialModal({
  open,
  onClose,
  nplSearch,
  onReload,
  phieuSoanHangId,
}) {
  const user = getCurrentUser();
  const tkQuet = Number(user.data.TKId);
  const tenNguoiQuyetXuat =
    `${user.data?.HoVaTenLot ?? ""} ${user.data.Ten}`.trim();

  const item = Array.isArray(nplSearch) ? nplSearch[0] : nplSearch;

  const [slBanDau, setSlBanDau] = useState();
  const [sltx, setSltx] = useState(0);
  const [slt, setSlt] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const availableQuantity = Number(item?.SLBD) || 0;

  useEffect(() => {
    if (!open || !item) return;

    setSltx(Number(item.SLBD));
  }, [open, item?.MaCay, item?.SLBD]);

  useEffect(() => {
    if (!open || !item) return;

    const remaining = availableQuantity - Number(sltx || 0);

    setSlt(Number(remaining));
  }, [open, item, availableQuantity, sltx]);

  const handleConfirm = async () => {
    if (!item || confirming) return;

    const sltxNumber = Number(sltx);
    const sltNumber = Number(slt);

    if (
      sltx === "" ||
      slt === "" ||
      !Number.isFinite(sltxNumber) ||
      !Number.isFinite(sltNumber) ||
      sltxNumber <= 0 ||
      sltNumber < 0
    ) {
      showWarningToast("Số lượng không hợp lệ!");
      return;
    }

    setConfirming(true);

    try {
      const payload = {
        PhieuSoanHangId: phieuSoanHangId,
        MaCay: item.MaCay,
        SoLuongThucSoan: sltxNumber,
        TKQuet: tkQuet,
        TenNguoiQuyetXuat: tenNguoiQuyetXuat,
      };

      console.log(sltxNumber);

      const result = await pickFabricRoll(payload);

      if (result.success === false) {
        showErrorToast(
          Array.isArray(result.message)
            ? result.message.join("\n")
            : result.message || "Soạn hàng thất bại",
        );
        return;
      }

      showSuccessToast("Soạn hàng thành công!");
      console.log("Bắt đầu reload danh sách");

      await onReload?.();

      console.log("Reload danh sách hoàn tất");
      onClose?.();
    } catch (error) {
      console.error("Lỗi xác nhận soạn hàng:", error);

      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        "Có lỗi xảy ra khi soạn hàng";

      showErrorToast(
        Array.isArray(errorMessage)
          ? errorMessage.join("\n")
          : String(errorMessage),
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      destroyOnHidden
      maskClosable={!confirming}
      closable={!confirming}
      closeIcon={<X size={20} />}
      title={
        <div className="flex items-center gap-2">
          <PackageCheck size={22} className="text-blue-600" />
          <span className="text-lg font-bold text-gray-900">
            Xác nhận xuất hàng
          </span>
        </div>
      }
      styles={{
        content: {
          borderRadius: 16,
          padding: 0,
          overflow: "hidden",
        },
        header: {
          padding: "16px",
          margin: 0,
          borderBottom: "1.5px solid #cbd5e1",
        },
        body: {
          padding: "16px",
        },
      }}
    >
      {item ? (
        <div className="space-y-4">
          {/* THÔNG TIN VẬT TƯ */}
          <div className="space-y-3 rounded-xl border border-gray-200 border-l-[3px] border-l-blue-500 bg-gray-50/60 p-3.5">
            {/* TÊN HÀNG */}
            <p className="min-w-0 break-words text-base font-bold leading-6 text-gray-900">
              Tên hàng: {item.TenNPL || "Chưa có tên vật tư"}
            </p>

            {/* MÃ CÂY */}
            <p className="min-w-0 break-all text-base font-bold leading-6 text-gray-900">
              Mã cây: {item.MaCay || "—"}
            </p>

            {/* SỐ LƯỢNG BAN ĐẦU */}
            <p className="text-base font-bold leading-6 text-gray-900">
              SLBD: {String(item?.SLBD ?? 0)}
            </p>
          </div>

          {/* ĐƯỜNG PHÂN CÁCH */}
          <div className="border-t border-gray-200" />

          {/* SỐ LƯỢNG THỰC XUẤT */}
          <div className="space-y-2">
            <label
              htmlFor="picking-sltx"
              className="block text-sm font-semibold text-gray-700"
            >
              Số lượng thực xuất (SLTX)
            </label>

            <InputNumber
              id="picking-sltx"
              value={sltx}
              onChange={(value) => setSltx(value)}
              min={0}
              controls={false}
              step={0.01}
              inputMode="decimal"
              className="
                !w-full !rounded-lg
                [&_.ant-input-number-input]:!h-12
                [&_.ant-input-number-input]:!px-3
                [&_.ant-input-number-input]:!text-lg
                [&_.ant-input-number-input]:!font-semibold
              "
            />
          </div>

          {/* SỐ LƯỢNG TRẢ */}
          <div className="space-y-2">
            <label
              htmlFor="picking-slt"
              className="block text-sm font-semibold text-gray-700"
            >
              Số lượng tồn (SLT)
            </label>

            <InputNumber
              id="picking-slt"
              value={slt}
              onChange={(value) => setSlt(value)}
              min={0}
              step={0.01}
              controls={false}
              inputMode="decimal"
              className="
                !w-full !rounded-lg
                [&_.ant-input-number-input]:!h-12
                [&_.ant-input-number-input]:!px-3
                [&_.ant-input-number-input]:!text-lg
                [&_.ant-input-number-input]:!font-semibold
              "
            />
          </div>

          {/* FOOTER */}
          <div className="-mx-4 -mb-4 mt-6 border-t-[1.5px] border-slate-300 bg-gray-50 p-5">
            <div className="grid grid-cols-2 gap-3">
              {/* HỦY */}
              <button
                type="button"
                disabled={confirming}
                onClick={onClose}
                className="
                  flex h-12 items-center justify-center
                  rounded-xl border border-gray-300
                  bg-white text-base font-bold !text-lg
                  text-gray-700 transition-all
                  hover:bg-gray-100
                  active:scale-[0.98]
                  disabled:opacity-50
                "
              >
                Hủy
              </button>

              {/* XÁC NHẬN */}
              <button
                type="button"
                disabled={confirming}
                onClick={handleConfirm}
                className="
                  flex h-12 items-center justify-center gap-2
                  rounded-xl bg-blue-600
                  px-3 text-base !font-bold text-white
                  transition-all
                  hover:bg-blue-700
                  active:scale-[0.98]
                  disabled:opacity-50
                  !text-lg
                "
              >
                <Check size={19} />
                {confirming ? "Đang xử lý" : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          Không tìm thấy thông tin vật tư.
        </div>
      )}
    </Modal>
  );
}
