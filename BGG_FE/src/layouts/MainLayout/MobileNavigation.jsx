import {
  LayoutGrid,
  Warehouse,
  MapPin,
  UserRound,
  ScanBarcode,
} from "lucide-react";

// MOBILE NAVIGATION
const mobileItems = [
  {
    key: "workspace",
    icon: LayoutGrid,
    label: "Trang chủ",
  },
  {
    key: "warehouse",
    icon: Warehouse,
    label: "Kho",
  },
  {
    key: "materialLocation",
    icon: MapPin,
    label: "Cập nhật",
  },
  {
    key: "Thông tin",
    icon: UserRound,
    label: "Tài khoản",
  },
];

// BOTTOM NAVIGATION MOBILE
export default function MobileNavigation({ onScan, onSelect, selectedKey }) {
  const leftItems = mobileItems.slice(0, 2);
  const rightItems = mobileItems.slice(2);

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = selectedKey === item.key;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => onSelect(item.key)}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-egmf-primary ${
          isActive
            ? "text-egmf-primary"
            : "text-egmf-muted hover:text-egmf-ink-soft"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-x-2 top-0 h-[3px] rounded-b-full ${
            isActive ? "bg-egmf-primary" : "bg-transparent"
          }`}
        />
        <span className="flex size-8 items-center justify-center">
          <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
        </span>

        <span
          className={`w-full truncate text-center text-[10px] leading-3 ${
            isActive ? "font-bold text-egmf-primary" : "font-medium"
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-egmf-border bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[68px] max-w-[560px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px_minmax(0,1fr)_minmax(0,1fr)] items-stretch px-2">
        {leftItems.map(renderNavItem)}

        <button
          aria-label="Mở trình quét mã"
          title="Quét mã"
          className="group relative flex h-full w-full flex-col items-center justify-end gap-0.5 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-egmf-primary"
          onClick={onScan}
          type="button"
        >
          <span className="absolute -top-[18px] left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-egmf-primary text-white shadow-egmf-primary-float transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95">
            <ScanBarcode size={30} strokeWidth={2.2} />
          </span>
          <span className="relative whitespace-nowrap text-[10px] font-bold leading-3 text-egmf-primary">
            Quét mã
          </span>
        </button>

        {rightItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
