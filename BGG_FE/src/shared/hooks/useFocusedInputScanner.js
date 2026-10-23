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
    const code = String(value ?? "").trim();
    if (!code) return;

    if (location.pathname === "/picking-order-scan") {
      const PhieuSoanHangId = location.state?.PhieuSoanHangId;

      if (!PhieuSoanHangId) {
        toast.warning("Không tìm thấy ID phiếu soạn hàng");
        return;
      }

      closeScanner();

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

    valueSetter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
    toast.success("Quét mã thành công.");
  };

  const { closeScanner, openScanner, scanError, scanTarget, videoRef } =
    useBarcodeScanner(handleScannedValue);

  const startScan = () => {
    //Trang tạo phiếu kiểm vải -> chuyển đến trang quét
    if (location.pathname === "/fabric-inspection") {
      navigate("/picking-order-scan", {
        state: {
          scanType: "fabric-inspection",
        },
      });
    }
    // Trang chi tiết phiếu soạn hàng → chuyển đến trang quét rổ
    if (location.pathname === "/picking-order-detail") {
      const PhieuSoanHangId =
        location.state?.PhieuSoanHangId ??
        location.state?.order?.PhieuSoanHangId;

      if (!PhieuSoanHangId) {
        toast.warning("Không tìm thấy ID phiếu soạn hàng");
        return;
      }

      navigate("/picking-order-scan", {
        state: {
          scanType: "picking",
          PhieuSoanHangId: PhieuSoanHangId,
        },
      });

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
    closeScanner,
    focusedInputLabel,
    scanError,
    scanTarget,
    startScan,
    videoRef,
  };
}
