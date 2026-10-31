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
        className="absolute inset-0 bg-egmf-ink/35 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside
        className="relative flex h-full min-h-0 w-[min(86vw,320px)] flex-col overflow-hidden bg-white shadow-2xl"
        aria-label="Điều hướng"
      >
        <button
          aria-label="Đóng"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-2xl text-egmf-muted transition hover:bg-egmf-primary-soft hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
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
