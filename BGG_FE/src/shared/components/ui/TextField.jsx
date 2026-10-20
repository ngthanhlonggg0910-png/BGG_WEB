import { useId, useState } from "react";

import { cn } from "./utils";

function TextField({ className, error, icon, label, type = "text", ...props }) {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <label className={cn("block", className)} htmlFor={inputId}>
      {label && (
        <span className="mb-2 block text-[15px] font-semibold text-egmf-ink-secondary">
          {label}
        </span>
      )}
      <span
        className={cn(
          "flex h-12 items-center rounded-2xl border bg-white px-3.5 transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/12",
          error ? "border-red-400" : "border-egmf-border",
        )}
      >
        {icon && <span className="mr-2.5 text-egmf-muted-soft">{icon}</span>}
        <input
          className="h-full min-w-0 flex-1 bg-transparent text-base text-egmf-ink outline-none placeholder:text-egmf-placeholder"
          id={inputId}
          type={inputType}
          {...props}
        />
        {isPassword && (
          <button
            className="ml-2 min-h-9 rounded-xl px-2 text-sm font-medium text-egmf-muted hover:bg-egmf-surface-tint hover:text-egmf-primary-strong"
            onClick={(event) => {
              event.preventDefault();
              setShowPassword((value) => !value);
            }}
            type="button"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        )}
      </span>
      {error && (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

export default TextField;
