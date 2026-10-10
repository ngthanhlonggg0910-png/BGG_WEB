import { useEffect } from "react";

import Icon from "./Icon";

function Drawer({ children, onClose, open }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Đóng điều hướng"
        className="absolute inset-0 bg-[#252530]/35 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside
        className="relative flex h-full w-[min(86vw,320px)] flex-col bg-white shadow-2xl"
        aria-label="Điều hướng"
      >
        <button
          aria-label="Đóng"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-2xl text-[#74747f] transition hover:bg-[#E9E8FB] hover:text-[#5653C5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6865D9]/20"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
        {children}
      </aside>
    </div>
  );
}

export default Drawer;
