import React from "react";
import { Input } from "antd";
import { ArrowLeftRight, Ruler } from "lucide-react";

export default function FabricWidthForm({ formData, setFormData }) {
  const sections = ["ĐẦU CÂY", "GIỮA CÂY", "CUỐI CÂY"];
  const handleChange = (title, value) => {
    setFormData((prev) => {
      const update = (viTri) => ({
        ...(prev?.[viTri] ?? {}),
        ViTri: viTri,
        KhoCM: Number(value),
        KhoIN: value === "" ? 0 : Number((Number(value) / 2.54).toFixed(2)),
      });

      return title === "ĐẦU CÂY"
        ? {
            "ĐẦU CÂY": update("ĐẦU CÂY"),
            "GIỮA CÂY": update("GIỮA CÂY"),
            "CUỐI CÂY": update("CUỐI CÂY"),
          }
        : {
            ...prev,
            [title]: update(title),
          };
    });
  };

  return (
    <div className="space-y-1.5 py-0.5 sm:space-y-2">
      <div className="hidden items-center gap-1.5 px-0.5 sm:flex">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-egmf-primary-soft text-egmf-primary">
          <Ruler size={16} strokeWidth={2.25} />
        </span>
        <p className="m-0 text-[12px] font-semibold leading-4 text-egmf-muted">
          Nhập khổ vải theo centimet, hệ thống tự quy đổi sang inch.
        </p>
      </div>

      {sections.map((title, index) => (
        <section
          key={title}
          className="rounded-lg border border-egmf-border-subtle bg-egmf-surface-subtle p-2 sm:p-2.5"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-egmf-primary-soft text-[11px] font-extrabold text-egmf-primary">
                {index + 1}
              </span>
              <h3 className="m-0 whitespace-nowrap text-[13px] font-bold text-egmf-ink">
                {title}
              </h3>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-egmf-muted">
              CM <ArrowLeftRight size={13} /> IN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="min-w-0 space-y-1">
              <label className="sr-only sm:not-sr-only sm:block sm:text-[12px] sm:font-bold sm:text-egmf-ink-secondary">
                Khổ thực tế <span className="font-medium text-egmf-muted">(cm)</span>
              </label>
              <Input
                type="number"
                placeholder="CM"
                aria-label={`Khổ thực tế ${title} (cm)`}
                value={formData?.[title]?.KhoCM ?? ""}
                onChange={(e) => handleChange(title, e.target.value)}
                className="!h-11 !rounded-md !border-egmf-border !bg-white sm:!h-10"
                classNames={{
                  input: "!h-full !px-2.5 !text-[14px] !font-semibold !text-egmf-ink",
                }}
              />
            </div>

            <div className="min-w-0 space-y-1">
              <label className="sr-only sm:not-sr-only sm:block sm:text-[12px] sm:font-bold sm:text-egmf-ink-secondary">
                Quy đổi <span className="font-medium text-egmf-muted">(in)</span>
              </label>
              <Input
                placeholder="IN"
                aria-label={`Quy đổi ${title} (inch)`}
                readOnly
                value={
                  formData?.[title]?.KhoCM === ""
                    ? ""
                    : (Number(formData?.[title]?.KhoCM) / 2.54).toFixed(2)
                }
                className="!h-11 !rounded-md !border-egmf-primary-border-soft !bg-egmf-primary-tint sm:!h-10"
                classNames={{
                  input: "!h-full !px-2.5 !text-[14px] !font-semibold !text-egmf-primary",
                }}
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
