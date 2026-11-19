import AppSelect from "../../../shared/components/ui/AppSelect";

export default function CuttingField({
  label,
  value,
  onChange,
  options,
  readOnly = false,
  type = "text",
  className = "",
  loading = false,
}) {
  const controlClassName =
    "h-12 w-full rounded-lg border border-egmf-border px-3 text-base font-semibold outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10";

  const normalizedValue = value == null ? "" : String(value);
  const normalizedOptions = options?.map((option) => ({
    ...option,
    value: String(option.value),
  }));

  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-xs font-bold text-egmf-muted">
        {label}
      </span>

      {normalizedOptions ? (
        <AppSelect
          value={normalizedValue}
          onChange={onChange}
          options={normalizedOptions}
          disabled={readOnly}
          loading={loading}
          searchable={normalizedOptions.length > 8}
          minHeight={48}
          menuMaxHeight={240}
          placeholder="Chọn dữ liệu"
          aria-label={label}
        />
      ) : (
        <input
          type={type}
          value={normalizedValue}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          className={`${controlClassName} ${
            readOnly
              ? "bg-egmf-surface-subtle text-egmf-ink-secondary"
              : "bg-white text-egmf-ink"
          }`}
        />
      )}
    </label>
  );
}
