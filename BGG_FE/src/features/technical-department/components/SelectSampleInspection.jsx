import { Radio } from "antd";
import { useEffect, useState } from "react";

import { showErrorToast } from "../../../shared/components/ui/CustomToast";
import { getTrangThai } from "../api/technical-department.api";

const allowedStatuses = {
  "CHƯA KIỂM": ["HÀNG ĐẠT", "HÀNG LỖI"],
  "HÀNG ĐẠT": ["HÀNG ĐẠT", "HÀNG LỖI"],
  "HÀNG LỖI": ["HÀNG LỖI", "HÀNG SỬA"],
  "HÀNG SỬA": ["HÀNG LỖI", "HÀNG SỬA"],
};

const resultStyles = {
  "HÀNG ĐẠT": "border-emerald-200 bg-emerald-50 hover:border-emerald-400",
  "HÀNG LỖI": "border-rose-200 bg-rose-50 hover:border-rose-400",
  "HÀNG SỬA": "border-orange-200 bg-orange-50 hover:border-orange-400",
};

export default function SelectSampleInspection({
  barcodeMau,
  loai,
  value,
  onChange,
}) {
  const [trangThai, setTrangThai] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!barcodeMau || !loai) {
      return undefined;
    }

    let isCancelled = false;

    const fetchTrangThai = async () => {
      setIsLoading(true);

      try {
        const response = await getTrangThai(barcodeMau, loai);
        if (!response.success) {
          showErrorToast("Lỗi lấy trạng thái");
          if (!isCancelled) setTrangThai(null);
          return;
        }

        if (!isCancelled) setTrangThai(response?.data?.TrangThai ?? null);
      } catch (error) {
        console.error(error);
        if (!isCancelled) setTrangThai(null);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchTrangThai();
    return () => {
      isCancelled = true;
    };
  }, [barcodeMau, loai]);

  const options = barcodeMau && loai ? allowedStatuses[trangThai] || [] : [];

  // console.log(options);
  return (
    <div>
      {isLoading ? (
        <div className="mt-4 flex min-h-18 items-center justify-center rounded-xl border border-egmf-border-subtle bg-egmf-surface-subtle text-sm font-semibold text-egmf-muted">
          Đang tải trạng thái...
        </div>
      ) : options.length ? (
        <Radio.Group
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-4 !grid !w-full grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {options.map((item) => {
            const isSelected = value === item;

            return (
              <Radio
                key={item}
                value={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 64,
                  padding: "12px 16px",
                }}
                className={`!m-0 !flex !min-h-16 !items-center !rounded-xl !border !px-4 !py-3 transition [&_.ant-radio]:!top-0 [&_.ant-radio-inner]:!size-5 [&_.ant-radio-inner]:!border-2 ${
                  isSelected
                    ? "border-egmf-primary bg-egmf-primary-soft shadow-sm"
                    : resultStyles[item]
                }`}
              >
                <span className="ml-1.5 text-sm font-extrabold text-egmf-ink">
                  {item}
                </span>
              </Radio>
            );
          })}
        </Radio.Group>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-egmf-border bg-egmf-surface-subtle px-4 py-3 text-sm font-medium text-egmf-muted">
          Chưa có kết quả kiểm phù hợp.
        </div>
      )}
    </div>
  );
}
