import { useId } from "react";

import { cn } from "./utils";

function Checkbox({ children, className, ...props }) {
  const id = useId();
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-2 text-[15px] text-egmf-ink-soft", className)} htmlFor={id}>
      <input className="size-5 rounded-md border-egmf-border-muted text-egmf-primary focus:ring-2 focus:ring-egmf-primary/30" id={id} type="checkbox" {...props} />
      {children}
    </label>
  );
}

export default Checkbox;
