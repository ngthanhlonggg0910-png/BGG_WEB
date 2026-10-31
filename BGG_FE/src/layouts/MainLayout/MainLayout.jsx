import { ArrowLeft, Menu, PanelLeftClose, PanelLeftOpen, ScanBarcode } from "lucide-react";

import { useEffect, useRef, useState } from "react";
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
export default function MainLayout({ children, screenTitle, hideMobileNavigation = false, headerBackTo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrderPage = location.pathname.startsWith("/production-order");
  const isHomePage = location.pathname === "/home";
  const pwa = usePwa();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const viewportHeightRef = useRef(0);
  const {
    cameraFeatures,
    closeScanner,
    focusedInputLabel,
    scanError,
    scanStatus,
    scanTarget,
    setZoom,
    startScan,
    toggleTorch,
    torchOn,
    videoRef,
  } = useFocusedInputScanner();

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) return undefined;

    const updateKeyboardOffset = () => {
      const visibleViewportBottom = viewport.height + viewport.offsetTop;
      const layoutViewportHeight = Math.max(
        window.innerHeight,
        document.documentElement.clientHeight,
      );
      const activeElement = document.activeElement;
      const isEditableElement =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.isContentEditable;

      // Some Android browsers shrink both window.innerHeight and
      // visualViewport.height when the keyboard opens. Preserve the last
      // non-keyboard viewport height so the difference still gives the
      // keyboard height in either browser behavior.
      if (!isEditableElement) {
        viewportHeightRef.current = Math.max(
          visibleViewportBottom,
          layoutViewportHeight,
        );
      } else if (!viewportHeightRef.current) {
        viewportHeightRef.current = Math.max(
          visibleViewportBottom,
          layoutViewportHeight,
        );
      }

      const offset = Math.max(
        0,
        Math.max(viewportHeightRef.current, layoutViewportHeight) -
          visibleViewportBottom,
      );

      // Ignore the small viewport changes caused by browser chrome; a soft
      // keyboard always takes substantially more space than this.
      setKeyboardOffset(offset > 120 ? Math.round(offset) : 0);
    };

    updateKeyboardOffset();
    viewport.addEventListener("resize", updateKeyboardOffset);
    viewport.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("resize", updateKeyboardOffset);

    return () => {
      viewport.removeEventListener("resize", updateKeyboardOffset);
      viewport.removeEventListener("scroll", updateKeyboardOffset);
      window.removeEventListener("resize", updateKeyboardOffset);
    };
  }, []);

  // XÁC ĐỊNH MENU ACTIVE
  const selectedKey = (() => {
    const path = location.pathname;

    if (path === "/infor") return "Thông tin";

    if (path.startsWith("/material-location-update")) return "update-material-location";

    if (path.startsWith("/warehouse")) return "warehouse";

    if (path.startsWith("/mapping-qr")) return "mapping-qr";

    if (path.startsWith("/production")) return "production-order-material";

    if (path.startsWith("/picking-order")) return "soanhang";

    if (path.startsWith("/fabric-inspection")) return "fabric-inspection";

    return "workspace";
  })();

  // XỬ LÝ MENU
  const handleSelect = (key) => {
    setDrawerOpen(false);

    if (key.startsWith("/")) {
      navigate(key);
      return;
    }

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

    if (headerBackTo) {
      navigate(headerBackTo);
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
          bg-white ${isSidebarCollapsed ? "hidden" : isOrderPage ? "lg:flex" : "md:flex"}
        `}
      >
        <Sidebar
          selectedKey={selectedKey}
          onSelect={handleSelect}
          onInstallApp={handleInstallApp}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div className={`min-w-0 ${isSidebarCollapsed ? "ml-0" : isOrderPage ? "lg:ml-[270px]" : "md:ml-[270px]"}`}>
        {/* HEADER */}
        <header
          className="
            sticky top-0 z-20
            relative flex min-h-20 items-center gap-3 overflow-hidden
            border-b border-blue-100/90
            bg-gradient-to-r from-white via-white to-blue-50/60 px-4
            pt-[env(safe-area-inset-top)]
            backdrop-blur-md
            md:min-h-[88px] md:px-8 md:pt-0
          "
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-cyan-200/25 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute right-24 top-0 hidden h-full w-56 opacity-40 md:block [background-image:linear-gradient(rgba(37,99,235,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.14)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(90deg,transparent,#000_45%,transparent)]" />
          <div aria-hidden="true" className="pointer-events-none absolute right-12 top-1/2 hidden h-px w-32 bg-gradient-to-r from-transparent via-cyan-300 to-transparent md:block" />

          {/* MOBILE MENU / BACK BUTTON */}
          <button
            type="button"
            aria-label={
              isHomePage ? "Mở menu điều hướng" : "Quay lại trang trước"
            }
            title={isHomePage ? "Mở menu" : "Quay lại"}
            onClick={handleMobileHeaderAction}
            className={`
              group relative z-10 flex size-12 shrink-0 touch-manipulation
              items-center justify-center
              rounded-xl bg-egmf-primary-tint text-egmf-primary
              transition-all duration-200
              hover:bg-egmf-primary-soft hover:text-egmf-primary-strong
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

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? "Mở thanh điều hướng" : "Thu gọn thanh điều hướng"}
            title={isSidebarCollapsed ? "Mở thanh điều hướng" : "Thu gọn thanh điều hướng"}
            className={`relative z-10 hidden size-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-white/85 text-egmf-primary shadow-sm transition hover:border-egmf-primary hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 ${isOrderPage ? "lg:grid" : "md:grid"}`}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={19} strokeWidth={2.2} /> : <PanelLeftClose size={19} strokeWidth={2.2} />}
          </button>

          {/* SCREEN TITLE */}
          <h1 className="relative z-10 m-0 min-w-0 flex-1 truncate pb-3 text-[16px] font-extrabold tracking-[-0.02em] text-slate-900 sm:text-lg">
            {screenTitle}
            <svg
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-3 w-[70%] max-w-[260px] overflow-visible"
              viewBox="0 0 260 14"
              preserveAspectRatio="none"
            >
              <path
                d="M0 8 H24 L29 6 L34 10 L40 8 H58 L64 4 L70 12 L76 8 H96 L103 1 L110 13 L117 6 L124 8 H147 L153 5 L159 11 L166 8 H188 L194 3 L200 12 L207 8 H260"
                fill="none"
                stroke="url(#headerPulse)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <defs>
                <linearGradient id="headerPulse" x1="0" x2="260" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563EB" />
                  <stop offset="0.62" stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
          </h1>

          {/* ONLINE STATUS (GIỐNG WEB_KYDUYET) */}
          <span className="relative z-10 hidden items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#71809a] shadow-sm ring-1 ring-slate-100 lg:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                pwa.online ? "bg-[#3abc95]" : "bg-[#dc9056]"
              }`}
            />
            {pwa.online ? "Đang kết nối" : "Ngoại tuyến"}
          </span>

          {/* LOGO MOBILE */}
          <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-egmf-primary-tint p-1.5 ${isOrderPage ? "lg:hidden" : "md:hidden"}`}>
            <img
              src="/ic_launcher_512.png"
              alt="BGG Kho"
              className="h-full w-full object-contain"
            />
          </div>

          <button
            type="button"
            onClick={startScan}
            className="relative z-10 hidden h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-egmf-primary to-blue-500 px-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,.24)] transition hover:-translate-y-px hover:shadow-[0_11px_22px_rgba(37,99,235,.32)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/25 md:flex"
            title="Quét mã"
          >
            <ScanBarcode size={20} strokeWidth={2.2} />
            <span className="hidden lg:inline">Quét mã</span>
          </button>
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
        keyboardOffset={keyboardOffset}
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
        cameraFeatures={cameraFeatures}
        error={scanError}
        onClose={closeScanner}
        open={Boolean(scanTarget)}
        scanStatus={scanStatus}
        setZoom={setZoom}
        title={`Quét vào ${focusedInputLabel}`}
        toggleTorch={toggleTorch}
        torchOn={torchOn}
        videoRef={videoRef}
      />

      {pwa.installHelp && <InstallHelp onClose={pwa.closeInstallHelp} />}
    </div>
  );
}
