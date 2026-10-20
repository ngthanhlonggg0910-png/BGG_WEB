import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

/**
 * Opens the device camera and returns one detected barcode to the caller.
 * `target` is an application-defined field identifier, so the hook can be
 * reused by any form without owning its input state.
 */
export function useBarcodeScanner(onDetected) {
  const [scanTarget, setScanTarget] = useState(null);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const openScanner = (target) => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera cần HTTPS hoặc localhost.");
      return;
    }

    setScanError("");
    setScanTarget(target);
  };

  const closeScanner = () => {
    setScanTarget(null);
    setScanError("");
  };

  useEffect(() => {
    if (!scanTarget) return undefined;

    let active = true;
    let detected = false;
    let controls;

    const startScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");

        if (!active || !videoRef.current) return;

        const reader = new BrowserMultiFormatReader(undefined, {
          delayBetweenScanAttempts: 150,
          delayBetweenScanSuccess: 500,
        });

        controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: { ideal: "environment" } },
          },
          videoRef.current,
          (result) => {
            if (!active || detected || !result) return;

            const value = result.getText()?.trim();
            if (!value) return;

            detected = true;
            onDetectedRef.current?.(value, scanTarget);
            setScanTarget(null);
          },
        );

        if (!active) controls?.stop();
      } catch (err) {
        if (!active) return;

        const messages = {
          NotAllowedError: "Chưa được cấp quyền camera.",
          NotFoundError: "Không tìm thấy camera.",
          NotReadableError: "Camera đang được sử dụng.",
          OverconstrainedError: "Camera không hỗ trợ cấu hình quét.",
          SecurityError: "Trình duyệt chặn camera.",
        };

        setScanError(messages[err?.name] || "Không thể mở camera.");
      }
    };

    startScanner();

    return () => {
      active = false;
      controls?.stop();
    };
  }, [scanTarget]);

  return {
    closeScanner,
    openScanner,
    scanError,
    scanTarget,
    videoRef,
  };
}
