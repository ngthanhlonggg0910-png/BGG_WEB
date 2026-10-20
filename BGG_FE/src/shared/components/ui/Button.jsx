import { cn } from "./utils";

function Button({
  className,
  children,
  isLoading = false,
  variant = "primary",
  ...props
}) {
  const variants = {
    primary:
      "bg-egmf-primary text-white shadow-egmf-primary hover:bg-egmf-primary-strong focus-visible:ring-egmf-primary/25",
    ghost:
      "text-egmf-ink-secondary hover:bg-egmf-primary-soft hover:text-egmf-primary-strong focus-visible:ring-egmf-primary/20",
  };

  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-semibold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
        variants[variant],
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
        />
      )}
      {children}
    </button>
  );
}

export default Button;
