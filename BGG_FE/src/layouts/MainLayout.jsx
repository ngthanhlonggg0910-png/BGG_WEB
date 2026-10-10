import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LayoutGrid,
  Warehouse,
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Factory,
  Layers3,
  MapPin,
  ScanBarcode,
} from "lucide-react";

import BarcodeScannerModal from "../components/ui/BarcodeScannerModal";
import Drawer from "../components/ui/Drawer";
import { cn } from "../components/ui/utils";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";

// MÀU CHỦ ĐẠO
const PRIMARY = "#6865D9";

// MENU CHÍNH
const sidebarItems = [
  {
    key: "workspace",
    icon: LayoutGrid,
    label: "Không gian làm việc",
    color: "#6865D9",
    bg: "#E9E8FB",
  },
  {
    key: "warehouse",
    icon: Warehouse,
    label: "Kho & nguyên liệu",
    color: "#0F9B75",
    bg: "#DCFCE7",
  },
  {
    key: "production",
    icon: Factory,
    label: "Sản xuất",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    key: "Thông tin",
    icon: UserRound,
    label: "Thông tin tài khoản",
    color: "#DB5384",
    bg: "#FCE7F3",
  },
];

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

// LOGO
function Brand({ compact = false }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        compact ? "" : "border-b border-slate-100 px-5 py-5",
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E9E8FB] p-1.5">
        <img
          src="/ic_launcher_512.png"
          alt="eGMF"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0">
        <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-slate-900">
          eGMF
        </h2>

        <p className="m-0 mt-0.5 text-xs font-medium text-slate-500">
          Production System
        </p>
      </div>
    </div>
  );
}

// MENU DESKTOP / DRAWER
function Navigation({ selectedKey, onSelect }) {
  return (
    <nav aria-label="Điều hướng chính" className="flex-1 px-3 py-5">
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        MENU CHỨC NĂNG
      </p>

      <ul className="m-0 space-y-1.5 p-0">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedKey === item.key;

          return (
            <li key={item.key} className="list-none">
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-[56px] w-full items-center gap-3",
                  "rounded-xl px-3 text-left",
                  "transition-all duration-200",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[#6865D9]",
                  isActive
                    ? "bg-[#F0EFFF] text-[#5653C5]"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#6865D9]" />
                )}

                {/* ICON */}
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: isActive ? "#6865D9" : item.bg,
                    color: isActive ? "#FFFFFF" : item.color,
                  }}
                >
                  <Icon size={21} strokeWidth={2.1} />
                </span>

                {/* LABEL */}
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[15px]",
                    isActive ? "font-bold" : "font-semibold",
                  )}
                >
                  {item.label}
                </span>

                {/* ACTIVE ARROW */}
                {isActive && (
                  <ChevronRight
                    size={19}
                    strokeWidth={2.5}
                    className="shrink-0 text-[#6865D9]"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// NÚT ĐĂNG XUẤT
function LogoutButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex min-h-[52px] w-full items-center gap-3
        rounded-xl px-3 text-left
        text-[15px] font-semibold text-red-600
        transition-colors duration-200
        hover:bg-red-50
        active:bg-red-100
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-400
      "
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-100">
        <LogOut size={21} strokeWidth={2.1} />
      </span>

      <span className="flex-1">Đăng xuất</span>

      <ChevronRight size={19} className="text-red-400" />
    </button>
  );
}

// NỘI DUNG SIDEBAR
function SidebarContent({ selectedKey, onSelect }) {
  return (
    <div className="flex h-full min-h-full flex-col bg-white">
      <Brand />

      <Navigation selectedKey={selectedKey} onSelect={onSelect} />

      {/* FOOTER */}
      <div className="border-t border-slate-100 px-3 py-4">
        <LogoutButton onClick={() => onSelect("Đăng xuất")} />

        <p className="m-0 mt-4 text-center text-xs font-medium text-slate-400">
          eGMF WebApp · v1.0
        </p>
      </div>
    </div>
  );
}

// BOTTOM NAVIGATION MOBILE
function MobileNavigation({ onScan, onSelect }) {
  const leftItems = mobileItems.slice(0, 2);
  const rightItems = mobileItems.slice(2);

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => onSelect(item.key)}
        className="group flex min-h-[58px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors duration-200 hover:bg-[#F8F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6865D9]"
      >
        <span className="flex h-8 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 group-hover:text-[#6865D9]">
          <Icon size={21} strokeWidth={2} />
        </span>

        <span className="w-full truncate text-center text-[10px] font-semibold leading-3 text-slate-500">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-3 z-30 md:hidden"
      style={{
        bottom:
          "max(12px, env(safe-area-inset-bottom), calc(100lvh - 100dvh + 12px))",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-5 items-end rounded-2xl border border-[#E4E2F2] bg-white px-1.5 py-2">
        {leftItems.map(renderNavItem)}

        <button
          aria-label="Quét mã vào ô đang chọn"
          className="group relative z-10 -mx-3 flex min-h-[68px] w-[calc(100%+1.5rem)] flex-col items-center justify-end gap-1 rounded-xl px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6865D9]"
          onClick={onScan}
          type="button"
        >
          <span className="absolute -top-8 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border-4 border-[#F6F7FB] bg-[#6865D9] text-white shadow-[0_8px_18px_rgba(104,101,217,0.3)] transition-transform duration-200 group-hover:-translate-y-0.5">
            <ScanBarcode size={28} strokeWidth={2.3} />
          </span>
          <span className="w-full pt-9 text-center text-[10px] font-bold leading-3 text-[#5653C5]">
            Quét mã
          </span>
        </button>

        {rightItems.map(renderNavItem)}
      </div>
    </nav>
  );
}

// MAIN LAYOUT
export default function MainLayout({ children, screenTitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const focusedInputRef = useRef(null);

  useEffect(() => {
    const isScannableInput = (element) => {
      if (element instanceof HTMLTextAreaElement) {
        return !element.disabled && !element.readOnly;
      }

      if (!(element instanceof HTMLInputElement)) return false;

      const unsupportedTypes = [
        "button",
        "checkbox",
        "color",
        "file",
        "hidden",
        "image",
        "password",
        "radio",
        "range",
        "reset",
        "submit",
      ];

      return (
        !element.disabled &&
        !element.readOnly &&
        !unsupportedTypes.includes(element.type)
      );
    };

    const trackFocusedInput = (event) => {
      if (isScannableInput(event.target)) {
        focusedInputRef.current = event.target;
      }
    };

    document.addEventListener("focusin", trackFocusedInput);
    return () => document.removeEventListener("focusin", trackFocusedInput);
  }, []);

  const getFocusedInputLabel = () => {
    const input = focusedInputRef.current;

    if (!input || !document.contains(input)) return "ô đang chọn";

    return (
      input.getAttribute("aria-label") ||
      input.labels?.[0]?.textContent?.trim() ||
      input.placeholder ||
      "ô đang chọn"
    );
  };

  const handleScannedValue = (value) => {
    const input = focusedInputRef.current;

    if (!input || !document.contains(input)) {
      toast.warning("Hãy chọn ô nhập liệu trước khi quét mã.");
      return;
    }

    const prototype =
      input instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value",
    )?.set;

    valueSetter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
    toast.success("Quét mã thành công.");
  };

  const { closeScanner, openScanner, scanError, scanTarget, videoRef } =
    useBarcodeScanner(handleScannedValue);

  const startGlobalScan = () => {
    const input = focusedInputRef.current;

    if (!input || !document.contains(input)) {
      toast.warning("Hãy chọn ô nhập liệu trước khi quét mã.");
      return;
    }

    openScanner("focused-input");
  };

  // XÁC ĐỊNH MENU ACTIVE
  const selectedKey = (() => {
    const path = location.pathname;

    if (path === "/infor") return "Thông tin";

    if (path.startsWith("/material-location-update")) return "materialLocation";

    if (path.startsWith("/warehouse")) return "warehouse";

    if (path.startsWith("/production")) return "production";

    return "workspace";
  })();

  // XỬ LÝ MENU
  const handleSelect = (key) => {
    setDrawerOpen(false);

    switch (key) {
      case "workspace":
        navigate("/");
        break;

      case "warehouse":
        navigate("/warehouse");
        break;

      case "materialLocation":
        navigate("/material-location-update");
        break;

      case "Thông tin":
        navigate("/infor");
        break;

      case "production":
        // Chưa có route sản xuất trong code hiện tại
        break;

      case "Đăng xuất":
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        navigate("/login", { replace: true });
        break;

      default:
        break;
    }
  };

  return (
    <div className="min-h-dvh bg-[#F6F7FB]">
      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          fixed inset-y-0 left-0 z-20
          hidden w-[270px] flex-col
          overflow-y-auto
          border-r border-[#E6E5EF]
          bg-white md:flex
        "
      >
        <SidebarContent selectedKey={selectedKey} onSelect={handleSelect} />
      </aside>

      {/* MAIN CONTENT */}
      <div className="min-w-0 md:ml-[270px]">
        {/* HEADER */}
        <header
          className="
            sticky top-0 z-20
            flex min-h-20 items-center gap-3
            border-b border-[#E6E5EF]
            bg-white/95 px-4
            pt-[env(safe-area-inset-top)]
            backdrop-blur-md
            md:min-h-[88px] md:px-8 md:pt-0
          "
        >
          {/* MENU BUTTON MOBILE */}
          <button
            type="button"
            aria-label="Mở menu điều hướng"
            onClick={() => setDrawerOpen(true)}
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl bg-[#E9E8FB]
              text-[#6865D9]
              transition-colors duration-200
              hover:bg-[#DCD9F8]
              active:scale-95
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-[#6865D9]
              md:hidden
            "
          >
            <Menu size={23} strokeWidth={2.2} />
          </button>

          {/* SCREEN TITLE */}
          <h1 className="m-0 min-w-0 flex-1 truncate text-[16px] font-extrabold text-slate-900 sm:text-lg">
            {screenTitle}
          </h1>

          {/* LOGO MOBILE */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0EFFF] p-1.5 md:hidden">
            <img
              src="/ic_launcher_512.png"
              alt="eGMF"
              className="h-full w-full object-contain"
            />
          </div>

          {/* DESKTOP BRAND BADGE */}
          <div className="hidden items-center gap-2 rounded-lg bg-[#F0EFFF] px-3 py-2 md:flex">
            <Layers3 size={17} className="text-[#6865D9]" />

            <span className="text-sm font-bold text-[#5653C5]">eGMF</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className="
            min-h-[calc(100dvh-80px)]
            pb-[calc(96px+env(safe-area-inset-bottom))]
            md:min-h-[calc(100dvh-88px)]
            md:pb-0
          "
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNavigation onScan={startGlobalScan} onSelect={handleSelect} />

      {/* MOBILE DRAWER */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SidebarContent selectedKey={selectedKey} onSelect={handleSelect} />
      </Drawer>

      <BarcodeScannerModal
        error={scanError}
        onClose={closeScanner}
        open={Boolean(scanTarget)}
        title={`Quét vào ${getFocusedInputLabel()}`}
        videoRef={videoRef}
      />
    </div>
  );
}
