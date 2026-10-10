import { useId } from "react";

import { cn } from "./utils";

function Checkbox({ children, className, ...props }) {
  const id = useId();
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-2 text-[15px] text-[#5e5d69]", className)} htmlFor={id}>
      <input className="size-5 rounded-md border-[#cfcfdd] text-[#6865D9] focus:ring-2 focus:ring-[#6865D9]/30" id={id} type="checkbox" {...props} />
      {children}
    </label>
  );
}

export default Checkbox;
