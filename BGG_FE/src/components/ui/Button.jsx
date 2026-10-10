import { cn } from "./utils";

function Button({ className, children, isLoading = false, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-[#6865D9] text-white shadow-[0_8px_18px_rgba(104,101,217,0.22)] hover:bg-[#5653C5] focus-visible:ring-[#6865D9]/25",
    ghost: "text-[#4f4e5c] hover:bg-[#E9E8FB] hover:text-[#5653C5] focus-visible:ring-[#6865D9]/20",
  };

  return (
    <button
      className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-semibold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70", variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
      {children}
    </button>
  );
}

export default Button;
