import { ArrowLeft, Menu, Layers3 } from "lucide-react";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BarcodeScannerModal from "../../shared/components/ui/BarcodeScannerModal";
import Drawer from "../../shared/components/ui/Drawer";
import { clearSession } from "../../shared/auth/session";
import { useFocusedInputScanner } from "../../shared/hooks/useFocusedInputScanner";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

// MAIN LAYOUT
export default function MainLayout({ children, screenTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    closeScanner,
    focusedInputLabel,
    scanError,
    scanTarget,
    startScan,
    videoRef,
  } = useFocusedInputScanner();

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
        clearSession();
        navigate("/login", { replace: true });
        break;

      default:
        break;
    }
  };

  const handleMobileHeaderAction = () => {
    if (isHomePage) {
      setDrawerOpen(true);
      return;
    }

    // Always return exactly one page in the navigation history. `history.state.idx`
    // is not available consistently on mobile browsers, so it must not gate back.
    navigate(-1);
  };

  return (
    <div className="min-h-dvh bg-egmf-surface">
      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          fixed inset-y-0 left-0 z-20
          hidden w-[270px] flex-col
          overflow-y-auto
          border-r border-egmf-border
          bg-white md:flex
        "
      >
        <Sidebar selectedKey={selectedKey} onSelect={handleSelect} />
      </aside>

      {/* MAIN CONTENT */}
      <div className="min-w-0 md:ml-[270px]">
        {/* HEADER */}
        <header
          className="
            sticky top-0 z-20
            flex min-h-20 items-center gap-3
            border-b border-egmf-border
            bg-white/95 px-4
            pt-[env(safe-area-inset-top)]
            backdrop-blur-md
            md:min-h-[88px] md:px-8 md:pt-0
          "
        >
          {/* MOBILE MENU / BACK BUTTON */}
          <button
            type="button"
            aria-label={
              isHomePage ? "Mở menu điều hướng" : "Quay lại trang trước"
            }
            title={isHomePage ? "Mở menu" : "Quay lại"}
            onClick={handleMobileHeaderAction}
            className="
              group flex size-14 shrink-0 touch-manipulation
              items-center justify-center
              text-egmf-primary
              transition-all duration-200
              hover:text-egmf-primary-strong
              active:scale-90
              focus-visible:outline-none
              focus-visible:ring-4 focus-visible:ring-egmf-primary/25
              md:hidden
            "
          >
            {isHomePage ? (
              <Menu
                size={24}
                strokeWidth={2.35}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <ArrowLeft
                size={24}
                strokeWidth={2.35}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            )}
          </button>

          {/* SCREEN TITLE */}
          <h1 className="m-0 min-w-0 flex-1 truncate text-[16px] font-extrabold text-slate-900 sm:text-lg">
            {screenTitle}
          </h1>

          {/* LOGO MOBILE */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-egmf-primary-tint p-1.5 md:hidden">
            <img
              src="/ic_launcher_512.png"
              alt="eGMF"
              className="h-full w-full object-contain"
            />
          </div>

          {/* DESKTOP BRAND BADGE */}
          <div className="hidden items-center gap-2 rounded-lg bg-egmf-primary-tint px-3 py-2 md:flex">
            <Layers3 size={17} className="text-egmf-primary" />

            <span className="text-sm font-bold text-egmf-primary-strong">
              eGMF
            </span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className="
            flex flex-col
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
      <MobileNavigation
        onScan={startScan}
        onSelect={handleSelect}
        selectedKey={selectedKey}
      />

      {/* MOBILE DRAWER */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar selectedKey={selectedKey} onSelect={handleSelect} />
      </Drawer>

      <BarcodeScannerModal
        error={scanError}
        onClose={closeScanner}
        open={Boolean(scanTarget)}
        title={`Quét vào ${focusedInputLabel}`}
        videoRef={videoRef}
      />
    </div>
  );
}
