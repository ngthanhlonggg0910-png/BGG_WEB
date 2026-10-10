import { useState } from "react";

import Icon from "./Icon";
import { cn } from "./utils";

function CollapsiblePanel({ children, defaultOpen = false, title }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button aria-expanded={isOpen} className="flex min-h-[64px] w-full items-center gap-2.5 px-4 py-3 text-left transition hover:bg-[#fbfbfe] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#6865D9]/15 sm:min-h-[70px] sm:px-[22px]" onClick={() => setIsOpen((value) => !value)} type="button">
        {title}
        <Icon className={cn("ml-auto text-[#6865D9] transition-transform", isOpen && "rotate-180")} name="chevronDown" size={18} />
      </button>
      {isOpen && <div className="border-t border-[#ececf3] p-4 sm:p-[22px]">{children}</div>}
    </div>
  );
}

export default CollapsiblePanel;
