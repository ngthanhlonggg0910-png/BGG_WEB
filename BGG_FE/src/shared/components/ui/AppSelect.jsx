import ReactSelect, { components } from "react-select";
import { ChevronDown, X } from "lucide-react";

import { cn } from "./utils";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "var(--app-select-height, 56px)",
    border: `1px solid ${state.isFocused ? "var(--egmf-primary)" : "var(--egmf-border)"}`,
    borderRadius: 14,
    backgroundColor: "var(--egmf-surface-raised)",
    boxShadow: state.isFocused ? "var(--egmf-focus-ring)" : "0 1px 2px rgba(15, 23, 42, 0.02)",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    opacity: state.isDisabled ? 0.64 : 1,
    transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
    ":hover": {
      borderColor: "var(--egmf-primary)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    minHeight: "var(--app-select-height, 56px)",
    padding: "0 10px 0 16px",
  }),
  singleValue: (base) => ({
    ...base,
    margin: 0,
    color: "var(--egmf-ink)",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.4,
  }),
  placeholder: (base) => ({
    ...base,
    margin: 0,
    color: "var(--egmf-placeholder)",
    fontSize: 16,
    fontWeight: 500,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: "var(--egmf-ink)",
    fontSize: 16,
    fontWeight: 600,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    minHeight: "var(--app-select-height, 56px)",
    paddingRight: 4,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    display: "flex",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 10,
    color: "var(--egmf-primary)",
    ":hover": {
      backgroundColor: "var(--egmf-primary-hover-soft)",
      color: "var(--egmf-primary-strong)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    display: "flex",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 10,
    color: "var(--egmf-muted)",
    ":hover": {
      backgroundColor: "var(--egmf-surface-soft)",
      color: "var(--egmf-ink-secondary)",
    },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 1100 }),
  menu: (base) => ({
    ...base,
    overflow: "hidden",
    marginTop: 8,
    border: "1px solid var(--egmf-border)",
    borderRadius: 18,
    backgroundColor: "var(--egmf-surface-raised)",
    boxShadow: "0 18px 36px rgba(37, 99, 235, 0.16)",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 280,
    padding: 7,
    overscrollBehavior: "contain",
  }),
  option: (base, state) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    minHeight: 56,
    padding: "12px 16px",
    borderRadius: 12,
    backgroundColor: state.isSelected
      ? "var(--egmf-primary-soft)"
      : state.isFocused
        ? "var(--egmf-primary-hover-soft)"
        : "transparent",
    color: state.isSelected ? "var(--egmf-primary-strong)" : "var(--egmf-ink-secondary)",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: state.isSelected ? 700 : 600,
    lineHeight: 1.35,
    ":active": { backgroundColor: "var(--egmf-primary-soft)" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    padding: 16,
    color: "var(--egmf-muted)",
    fontSize: 15,
  }),
};

function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={20} strokeWidth={2.2} />
    </components.DropdownIndicator>
  );
}

function ClearIndicator(props) {
  return (
    <components.ClearIndicator {...props}>
      <X size={18} strokeWidth={2.4} />
    </components.ClearIndicator>
  );
}

/**
 * Select giao diện dùng chung. onChange vẫn trả về value đầu tiên để giữ nguyên
 * cách các màn hình hiện tại đang xử lý dữ liệu.
 */
export default function AppSelect({
  allowClear = false,
  className,
  disabled = false,
  loading = false,
  minHeight = 56,
  onChange,
  options = [],
  value,
  ...props
}) {
  const selectedOption = options.find((option) => option.value === value) || null;

  return (
    <div
      className={cn("w-full", className)}
      style={{ "--app-select-height": `${minHeight}px` }}
    >
      <ReactSelect
        {...props}
        unstyled
        aria-live="polite"
        isClearable={allowClear}
        isDisabled={disabled || loading}
        isLoading={loading}
        isSearchable={false}
        closeMenuOnScroll={false}
        captureMenuScroll
        menuPlacement="bottom"
        menuPosition="fixed"
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        menuShouldBlockScroll
        menuShouldScrollIntoView={false}
        noOptionsMessage={() => "Không có dữ liệu"}
        options={options}
        styles={selectStyles}
        value={selectedOption}
        components={{ DropdownIndicator, ClearIndicator }}
        onChange={(option, actionMeta) => onChange?.(option?.value, option, actionMeta)}
      />
    </div>
  );
}
