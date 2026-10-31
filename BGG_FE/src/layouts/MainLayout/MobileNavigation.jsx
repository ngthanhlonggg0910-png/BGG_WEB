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
export default function MobileNavigation({
  keyboardOffset = 0,
  onScan,
  onSelect,
  selectedKey,
  tabletLayout = false,
}) {
  const leftItems = mobileItems.slice(0, 2);
  const rightItems = mobileItems.slice(2);

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive =
      selectedKey === item.key ||
      (item.key === "materialLocation" && selectedKey === "update-material-location");

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => onSelect(item.key)}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-egmf-primary ${
          isActive
            ? "text-egmf-primary"
            : "text-egmf-muted hover:text-egmf-ink-soft"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-x-4 top-0 h-[3px] rounded-b-full transition-all ${
            isActive ? "bg-gradient-to-r from-egmf-primary to-cyan-400 shadow-[0_2px_8px_rgba(37,99,235,.38)]" : "bg-transparent"
          }`}
        />
        <span className={`grid size-9 place-items-center rounded-xl transition-all duration-200 ${isActive ? "bg-egmf-primary-soft text-egmf-primary shadow-sm" : "text-egmf-muted group-hover:bg-blue-50 group-hover:text-egmf-primary"}`}>
          <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
        </span>

        <span
          className={`w-full truncate text-center text-[10px] leading-3 transition-colors ${
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
      className={`fixed inset-x-0 z-30 overflow-visible border-t border-blue-100/90 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,.97),rgba(248,251,255,.98))] shadow-[0_-10px_30px_rgba(37,99,235,.12)] backdrop-blur-xl transition-[bottom] duration-200 ease-out ${keyboardOffset > 0 ? "pb-0" : "pb-[env(safe-area-inset-bottom)]"} ${tabletLayout ? "lg:hidden" : "md:hidden"}`}
      style={{ bottom: keyboardOffset }}
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      <div className="mx-auto grid h-[72px] max-w-[560px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px_minmax(0,1fr)_minmax(0,1fr)] items-stretch px-2">
        {leftItems.map(renderNavItem)}

        <button
          aria-label="Mở trình quét mã"
          title="Quét mã"
          className="group relative flex h-full w-full flex-col items-center justify-end gap-1 pb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-egmf-primary"
          onClick={onScan}
          type="button"
        >
          <span className="absolute -top-[23px] left-1/2 flex size-[66px] -translate-x-1/2 items-center justify-center rounded-[22px] border-4 border-white bg-gradient-to-br from-egmf-primary via-blue-600 to-cyan-500 text-white shadow-[0_12px_24px_rgba(37,99,235,.38)] transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95">
            <ScanBarcode size={30} strokeWidth={2.2} />
          </span>
          <span className="relative whitespace-nowrap text-[10px] font-extrabold leading-3 text-egmf-primary">
            Quét mã
          </span>
        </button>

        {rightItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
