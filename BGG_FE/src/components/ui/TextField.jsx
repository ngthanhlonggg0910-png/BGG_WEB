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
        <span className="mb-2 block text-[15px] font-semibold text-[#41414d]">
          {label}
        </span>
      )}
      <span
        className={cn(
          "flex h-12 items-center rounded-2xl border bg-white px-3.5 transition focus-within:border-[#6865D9] focus-within:ring-4 focus-within:ring-[#6865D9]/12",
          error ? "border-red-400" : "border-[#d9d9e6]",
        )}
      >
        {icon && <span className="mr-2.5 text-[#858492]">{icon}</span>}
        <input
          className="h-full min-w-0 flex-1 bg-transparent text-base text-[#252530] outline-none placeholder:text-[#9897a5]"
          id={inputId}
          type={inputType}
          {...props}
        />
        {isPassword && (
          <button
            className="ml-2 min-h-9 rounded-xl px-2 text-sm font-medium text-[#74747f] hover:bg-[#f3f2fd] hover:text-[#5653C5]"
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
