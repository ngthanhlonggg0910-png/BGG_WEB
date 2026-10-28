import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useBarcodeScanner } from "./useBarcodeScanner";
import { useLocation, useNavigate } from "react-router-dom";

function isScannableInput(element) {
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
}

function getInputLabel(input) {
  return (
    input.getAttribute("aria-label") ||
    input.labels?.[0]?.textContent?.trim() ||
    input.placeholder ||
    "ô đang chọn"
  );
}

const PICKING_ORDER_ID_STORAGE_KEY = "egmf.activePickingOrderId";

function getStoredPickingOrderId() {
  try {
    return window.sessionStorage.getItem(PICKING_ORDER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function rememberPickingOrderId(id) {
  if (!id) return;

  try {
    window.sessionStorage.setItem(PICKING_ORDER_ID_STORAGE_KEY, String(id));
  } catch {
    // Storage can be unavailable in private browser modes; URL/state still work.
  }
}

function resolvePickingOrderId(location) {
  const id =
    location.state?.PhieuSoanHangId ??
    location.state?.order?.PhieuSoanHangId ??
    new URLSearchParams(location.search).get("phieuSoanHangId") ??
    getStoredPickingOrderId();

  if (id) rememberPickingOrderId(id);
  return id;
}

function resolveScanType(location) {
  return (
    location.state?.scanType ??
    new URLSearchParams(location.search).get("scanType")
  );
}

export function useFocusedInputScanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const focusedInputRef = useRef(null);
  const [focusedInputLabel, setFocusedInputLabel] = useState("ô đang chọn");

  useEffect(() => {
    const trackFocusedInput = (event) => {
      if (!isScannableInput(event.target)) return;

      focusedInputRef.current = event.target;
      setFocusedInputLabel(getInputLabel(event.target));
    };

    document.addEventListener("focusin", trackFocusedInput);
    return () => document.removeEventListener("focusin", trackFocusedInput);
  }, []);

  const handleScannedValue = (value) => {
    const code = String(value ?? "");
    if (!code.trim()) return;

    // Only the picking flow needs a picking-order ID. Fabric inspection uses
    // the same scan page, but processes the scanned code in that page's form.
    if (
      location.pathname === "/picking-order-scan" &&
      resolveScanType(location) !== "fabric-inspection"
    ) {
      const PhieuSoanHangId = resolvePickingOrderId(location);

      if (!PhieuSoanHangId) {
        toast.warning("Không tìm thấy ID phiếu soạn hàng");
        return;
      }

      navigate("/picking-order-materials", {
        state: {
          PhieuSoanHangId,
          MaRo: code,
        },
      });

      return;
    }

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

    valueSetter?.call(input, code);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Either an input or its form can opt in to processing a camera scan
    // immediately, as if the user pressed Enter.
    if (
      input.dataset.submitOnScan === "true" ||
      input.form?.dataset.submitOnScan === "true"
    ) {
      input.form?.requestSubmit();
      return;
    }

    input.focus();
    toast.success("Quét mã thành công.");
  };

  const {
    cameraFeatures,
    closeScanner,
    openScanner,
    scanError,
    scanStatus,
    scanTarget,
    setZoom,
    toggleTorch,
    torchOn,
    videoRef,
  } = useBarcodeScanner(handleScannedValue);

  const startScan = () => {
    //Trang tạo phiếu kiểm vải -> chuyển đến trang quét
    if (location.pathname === "/fabric-inspection") {
      navigate("/picking-order-scan?scanType=fabric-inspection", {
        state: {
          scanType: "fabric-inspection",
        },
      });
      return;
    }
    // Trang chi tiết phiếu soạn hàng → chuyển đến trang quét rổ
    if (location.pathname === "/picking-order-detail") {
      const PhieuSoanHangId = resolvePickingOrderId(location);
      console.log(location);

      if (!PhieuSoanHangId) {
        toast.warning("Không tìm thấy ID phiếu soạn hàng");
        return;
      }

      navigate(
        `/picking-order-scan?scanType=picking&phieuSoanHangId=${encodeURIComponent(PhieuSoanHangId)}`,
        {
          state: {
            scanType: "picking",
            PhieuSoanHangId: PhieuSoanHangId,
          },
        },
      );

      return;
    }

    //Giữ nguyên chức năng quét mã hiện tại
    const input = focusedInputRef.current;

    if (!input || !document.contains(input)) {
      toast.warning("Hãy chọn ô nhập liệu trước khi quét mã.");
      return;
    }

    setFocusedInputLabel(getInputLabel(input));
    openScanner("focused-input");
  };

  return {
    cameraFeatures,
    closeScanner,
    focusedInputLabel,
    scanError,
    scanStatus,
    scanTarget,
    startScan,
    setZoom,
    toggleTorch,
    torchOn,
    videoRef,
  };
}
