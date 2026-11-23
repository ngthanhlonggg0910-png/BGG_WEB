import { Radio } from "antd";

const inspectionTypes = [
  {
    value: "QA",
    label: "QA",
    description: "Kiểm tra chất lượng mẫu",
  },
  {
    value: "Autonomy",
    label: "Autonomy",
    description: "Đánh giá theo tiêu chuẩn Autonomy",
  },
];

export default function SelectedInspectionType({ value, onChange }) {
  return (
    <div>
      <Radio.Group
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 !grid !w-full grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {inspectionTypes.map(({ value: optionValue, label, description }) => {
          const isSelected = value === optionValue;

          return (
            <Radio
              key={optionValue}
              value={optionValue}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 72,
                padding: "12px 16px",
              }}
              className={`!m-0 !flex !min-h-18 !items-center !rounded-xl !border !px-4 !py-3 transition [&_.ant-radio]:!top-0 [&_.ant-radio-inner]:!size-5 [&_.ant-radio-inner]:!border-2 ${
                isSelected
                  ? "border-egmf-primary bg-egmf-primary-soft shadow-sm"
                  : "border-egmf-border bg-white hover:border-egmf-primary-border hover:bg-egmf-primary-tint"
              }`}
            >
              <span className="ml-1.5 block">
                <span className="block text-sm font-extrabold text-egmf-ink">
                  {label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-egmf-muted">
                  {description}
                </span>
              </span>
            </Radio>
          );
        })}
      </Radio.Group>
    </div>
  );
}
