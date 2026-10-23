import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { getCurrentUser } from "../../../shared/auth/session";
import { taoPhieuKiemVaiThuCong } from "../api/fabric-inspections.api";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";

export default function CreateFabricInspectionForm({ onClose }) {
  const user = getCurrentUser();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    MaHang: "",
    Item: "",
    ChungLoai: "",
    Art: "",
    TenMau: "",
    LOT: "",
    NhaCungCap: "",
    NgayKiemVai: "yyyy-MM-dd",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fields = [
    { label: "Mã hàng", name: "MaHang" },
    { label: "Item", name: "Item" },
    { label: "Chủng loại", name: "ChungLoai" },
    { label: "Art", name: "Art" },
    { label: "Tên màu", name: "TenMau" },
    { label: "Lot", name: "LOT" },
    { label: "Nhà cung cấp", name: "NhaCungCap" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const payload = {
      ...formData,
      TKId: Number(user.data.TKId),
    };

    setLoading(true);

    try {
      console.log("Dữ liệu tạo phiếu:", payload);

      const response = await taoPhieuKiemVaiThuCong(payload);

      if (response.success) {
        showSuccessToast(response.message || "Tạo phiếu kiểm vải thành công");

        const soPhieuKiem = response.data?.SoPhieuKiem;
        console.log("Số phiếu vừa tạo:", soPhieuKiem);

        onClose();
      } else {
        showErrorToast(response.message || "Tạo phiếu kiểm vải thất bại");
      }
    } catch (error) {
      console.error("Lỗi tạo phiếu kiểm vải:", error);

      showErrorToast(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu kiểm vải",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id="create-fabric-inspection-form"
      onSubmit={handleSubmit}
      className="space-y-4 p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {fields.map((field) => (
          <div key={field.name} className="min-w-0 space-y-1.5">
            <label className="block text-[13px] font-bold text-egmf-ink-secondary">
              {field.label}
            </label>

            <input
              type="text"
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              className="h-12 w-full rounded-xl border border-egmf-border bg-white px-3.5 text-[15px] font-semibold text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[13px] font-bold text-egmf-ink-secondary">
          <CalendarDays size={17} className="text-egmf-primary" />
          Ngày kiểm vải
        </label>

        <input
          type="date"
          value={formData.NgayKiemVai}
          onChange={(e) => handleChange("NgayKiemVai", e.target.value)}
          className="h-12 w-full rounded-xl border border-egmf-border bg-white px-3.5 text-[15px] font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
        />
      </div>
    </form>
  );
}
