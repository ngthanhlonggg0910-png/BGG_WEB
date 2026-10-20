import { useEffect, useState } from "react";
import { InputNumber } from "antd";
import { AlertCircle, Hash, ListFilter } from "lucide-react";

import { getDanhSachLoi } from "../api/fabric-inspections.api";
import AppSelect from "../../../shared/components/ui/AppSelect";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";

export default function AddFabricDefectForm({ formData, setFormData }) {
  const [loading, setLoading] = useState(false);
  const [dsLoi, setDsLoi] = useState([]);

  const handleChange = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const preventNonNumericKey = (event) => {
    if (["e", "E", "+", "-", "."].includes(event.key)) event.preventDefault();
  };

  useEffect(() => {
    const loadDefects = async () => {
      try {
        setLoading(true);
        const response = await getDanhSachLoi();
        if (response.success) {
          setDsLoi(response.data || []);
        } else {
          setDsLoi([]);
          showErrorToast(response.message || "Lấy danh sách lỗi thất bại!");
        }
      } catch {
        showErrorToast("Có lỗi xảy ra khi lấy danh sách lỗi!");
      } finally {
        setLoading(false);
      }
    };

    loadDefects();
  }, []);

  return (
    <div className="space-y-6 py-1">
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-[15px] font-bold text-egmf-ink-secondary">
          <ListFilter size={18} className="text-egmf-primary" />
          Mã lỗi <span className="text-egmf-warning">*</span>
        </label>
        <AppSelect
          allowClear
          disabled={loading}
          loading={loading}
          value={formData.MaLoi || null}
          placeholder="Chọn mã lỗi..."
          options={dsLoi.map((option) => ({
            value: option.MaLoi,
            label: option.TenLoi,
          }))}
          onChange={(value) => handleChange("MaLoi", value || "")}
          aria-label="Chọn mã lỗi"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[15px] font-bold text-egmf-ink-secondary">
          <AlertCircle size={18} className="text-egmf-primary" /> Điểm
        </label>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4].map((point) => {
            const active = formData.SoDiem === point;
            return (
              <button
                key={point}
                type="button"
                onClick={() => handleChange("SoDiem", point)}
                aria-pressed={active}
                className={`min-h-14 rounded-xl border text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:scale-[0.97] ${active ? "border-egmf-primary bg-egmf-primary text-white shadow-egmf-primary-compact" : "border-egmf-border bg-white text-egmf-ink-secondary hover:border-egmf-primary-border hover:bg-egmf-primary-hover-soft"}`}
              >
                {point}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-[15px] font-bold text-egmf-ink-secondary">
          <Hash size={18} className="text-egmf-primary" /> Số lỗi{" "}
          <span className="text-egmf-warning">*</span>
        </label>
        <InputNumber
          size="large"
          min={1}
          precision={0}
          controls={false}
          inputMode="numeric"
          placeholder="Nhập số lỗi"
          value={formData.SoLoi}
          onKeyDown={preventNonNumericKey}
          parser={(value) => (value || "").replace(/[^0-9]/g, "")}
          onChange={(value) =>
            handleChange("SoLoi", typeof value === "number" ? value : null)
          }
          className="!h-14 !w-full !rounded-xl !border-egmf-border"
          classNames={{
            input: "!h-full !px-4 !text-[17px] !font-bold !text-egmf-ink",
          }}
        />
      </div>
    </div>
  );
}
