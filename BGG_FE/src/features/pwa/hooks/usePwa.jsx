import { createContext, useContext, useEffect, useState } from "react";

const PwaContext = createContext(null);

export function usePwaState() {
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    let active = true;
    const connectivity = () => setOnline(navigator.onLine);
    const prompt = (event) => {
      event.preventDefault();
      setInstall(event);
    };
    const installed = () => setInstall(null);

    window.addEventListener("online", connectivity);
    window.addEventListener("offline", connectivity);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", installed);

    if (window.isSecureContext && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => {
          if (!active) return;
          if (registration.waiting) setUpdate(registration.waiting);
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (
                active &&
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdate(worker);
              }
            });
          });
        })
        .catch(() => {});
    }

    return () => {
      active = false;
      window.removeEventListener("online", connectivity);
      window.removeEventListener("offline", connectivity);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function installApp() {
    if (install) {
      await install.prompt();
      setInstall(null);
    } else {
      setInstallHelp(true);
    }
  }

  function applyUpdate() {
    if (!update) return;
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => location.reload(),
      { once: true },
    );
    update.postMessage({ type: "ACTIVATE_UPDATE" });
  }

  return {
    online,
    installHelp,
    closeInstallHelp: () => setInstallHelp(false),
    installApp,
    hasUpdate: !!update,
    applyUpdate,
  };
}

export function PwaProvider({ children }) {
  const pwa = usePwaState();
  return <PwaContext.Provider value={pwa}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error("usePwa must be used within PwaProvider");
  }
  return ctx;
}
