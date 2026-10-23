import { ArrowLeft, Menu, Layers3 } from "lucide-react";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BarcodeScannerModal from "../../shared/components/ui/BarcodeScannerModal";
import Drawer from "../../shared/components/ui/Drawer";
import { clearSession } from "../../shared/auth/session";
import { useFocusedInputScanner } from "../../shared/hooks/useFocusedInputScanner";
import { usePwa } from "../../features/pwa/hooks/usePwa";
import ConnectionBanners from "../../features/pwa/components/ConnectionBanners";
import InstallHelp from "../../features/pwa/components/InstallHelp";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

// MAIN LAYOUT
export default function MainLayout({ children, screenTitle, hideMobileNavigation = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrderPage = location.pathname.startsWith("/production-order");
  const isHomePage = location.pathname === "/home";
  const pwa = usePwa();

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
        navigate("/production-orders");
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

    navigate(-1);
  };

  const handleInstallApp = () => {
    setDrawerOpen(false);
    pwa.installApp();
  };

  return (
    <div className="min-h-dvh bg-egmf-surface">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-20
          hidden w-[270px] flex-col
          overflow-y-auto
          border-r border-egmf-border
          bg-white ${isOrderPage ? "lg:flex" : "md:flex"}
        `}
      >
        <Sidebar
          selectedKey={selectedKey}
          onSelect={handleSelect}
          onInstallApp={handleInstallApp}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div className={`min-w-0 ${isOrderPage ? "lg:ml-[270px]" : "md:ml-[270px]"}`}>
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
            className={`
              group flex size-14 shrink-0 touch-manipulation
              items-center justify-center
              text-egmf-primary
              transition-all duration-200
              hover:text-egmf-primary-strong
              active:scale-90
              focus-visible:outline-none
              focus-visible:ring-4 focus-visible:ring-egmf-primary/25
              ${isOrderPage ? "lg:hidden" : "md:hidden"}
            `}
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

          {/* ONLINE STATUS (GIỐNG WEB_KYDUYET) */}
          <span className="hidden items-center gap-1.5 text-xs font-medium text-[#8b98ad] lg:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                pwa.online ? "bg-[#3abc95]" : "bg-[#dc9056]"
              }`}
            />
            {pwa.online ? "Đang kết nối" : "Ngoại tuyến"}
          </span>

          {/* LOGO MOBILE */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-egmf-primary-tint p-1.5 ${isOrderPage ? "lg:hidden" : "md:hidden"}`}>
            <img
              src="/ic_launcher_512.png"
              alt="eGMF"
              className="h-full w-full object-contain"
            />
          </div>

          {/* DESKTOP BRAND BADGE */}
          <div className={`hidden items-center gap-2 rounded-lg bg-egmf-primary-tint px-3 py-2 ${isOrderPage ? "lg:flex" : "md:flex"}`}>
            <Layers3 size={17} className="text-egmf-primary" />

            <span className="text-sm font-bold text-egmf-primary-strong">
              eGMF
            </span>
          </div>
        </header>

        {/* BANNERS TRẠNG THÁI MẠNG & CẬP NHẬT PWA */}
        <ConnectionBanners
          online={pwa.online}
          hasUpdate={pwa.hasUpdate}
          onUpdate={pwa.applyUpdate}
        />

        {/* PAGE CONTENT */}
        <main
          className={`
            flex flex-col
            min-h-[calc(100dvh-80px)]
            ${hideMobileNavigation ? "pb-0" : isOrderPage ? "pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-0" : "pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-0"}
            md:min-h-[calc(100dvh-88px)]
          `}
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      {!hideMobileNavigation && <MobileNavigation
        tabletLayout={isOrderPage}
        onScan={startScan}
        onSelect={handleSelect}
        selectedKey={selectedKey}
      />}

      {/* MOBILE DRAWER */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar
          selectedKey={selectedKey}
          onSelect={handleSelect}
          onInstallApp={handleInstallApp}
        />
      </Drawer>

      <BarcodeScannerModal
        error={scanError}
        onClose={closeScanner}
        open={Boolean(scanTarget)}
        title={`Quét vào ${focusedInputLabel}`}
        videoRef={videoRef}
      />

      {pwa.installHelp && <InstallHelp onClose={pwa.closeInstallHelp} />}
    </div>
  );
}
