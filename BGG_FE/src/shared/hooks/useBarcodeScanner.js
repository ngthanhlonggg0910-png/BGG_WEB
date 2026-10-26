import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const DEFAULT_CAMERA_FEATURES = { torch: false, zoom: null };

const HIGH_QUALITY_REAR_CAMERA = {
  audio: false,
  video: {
    facingMode: { ideal: "environment" },
    // Ideal values let older and iOS devices select their best available
    // rear-camera resolution instead of rejecting the camera request.
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30, max: 30 },
  },
};

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

function readTrackCapabilities(track) {
  if (typeof track?.getCapabilities !== "function") return {};

  try {
    return track.getCapabilities() ?? {};
  } catch {
    return {};
  }
}

async function applyVideoConstraint(track, constraint) {
  if (typeof track?.applyConstraints !== "function") return false;

  try {
    await track.applyConstraints({ advanced: [constraint] });
    return true;
  } catch {
    // Advanced camera controls are optional and must not stop a scan.
    return false;
  }
}

/**
 * Opens the device camera and returns one detected barcode to the caller.
 * `target` is an application-defined field identifier, so the hook can be
 * reused by any form without owning its input state.
 */
export function useBarcodeScanner(onDetected) {
  const [scanTarget, setScanTarget] = useState(null);
  const [scanError, setScanError] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const [cameraFeatures, setCameraFeatures] = useState(
    DEFAULT_CAMERA_FEATURES,
  );
  const [torchOn, setTorchOn] = useState(false);
  const videoRef = useRef(null);
  const videoTrackRef = useRef(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const openScanner = useCallback((target) => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera cần HTTPS hoặc localhost.");
      return;
    }

    setScanError("");
    setScanStatus("starting");
    setCameraFeatures(DEFAULT_CAMERA_FEATURES);
    setTorchOn(false);
    setScanTarget(target);
  }, []);

  const closeScanner = useCallback(() => {
    setScanTarget(null);
    setScanError("");
    setScanStatus("idle");
    setCameraFeatures(DEFAULT_CAMERA_FEATURES);
    setTorchOn(false);
  }, []);

  const toggleTorch = useCallback(async () => {
    const track = videoTrackRef.current;
    const capabilities = readTrackCapabilities(track);

    if (!track || !capabilities.torch) return;

    const nextValue = !torchOn;
    if (await applyVideoConstraint(track, { torch: nextValue })) {
      setTorchOn(nextValue);
    }
  }, [torchOn]);

  const setZoom = useCallback(async (requestedZoom) => {
    const track = videoTrackRef.current;
    const zoomCapabilities = readTrackCapabilities(track).zoom;

    if (
      !track ||
      !Number.isFinite(zoomCapabilities?.min) ||
      !Number.isFinite(zoomCapabilities?.max)
    ) {
      return;
    }

    const zoom = Math.min(
      zoomCapabilities.max,
      Math.max(zoomCapabilities.min, Number(requestedZoom)),
    );

    if (await applyVideoConstraint(track, { zoom })) {
      setCameraFeatures((current) =>
        current.zoom
          ? { ...current, zoom: { ...current.zoom, value: zoom } }
          : current,
      );
    }
  }, []);

  useEffect(() => {
    if (!scanTarget) return undefined;

    let active = true;
    let detected = false;
    let controls;
    let stream;
    let closeTimer;

    const releaseResources = () => {
      controls?.stop();
      controls = undefined;
      stopStream(stream);

      if (videoTrackRef.current === stream?.getVideoTracks?.()[0]) {
        videoTrackRef.current = null;
      }

      const video = videoRef.current;
      if (video?.srcObject === stream) {
        video.pause();
        video.srcObject = null;
      }
    };

    const configureTrack = async (track) => {
      const capabilities = readTrackCapabilities(track);
      const supportsTorch = capabilities.torch === true;
      const supportsContinuousFocus = Array.isArray(capabilities.focusMode)
        ? capabilities.focusMode.includes("continuous")
        : false;
      const supportsZoom =
        Number.isFinite(capabilities.zoom?.min) &&
        Number.isFinite(capabilities.zoom?.max) &&
        capabilities.zoom.max > capabilities.zoom.min;

      // Best effort only: focus controls are not available in every browser.
      if (supportsContinuousFocus) {
        await applyVideoConstraint(track, { focusMode: "continuous" });
      }

      let zoom = null;
      if (supportsZoom) {
        const min = Math.max(1, capabilities.zoom.min);
        const max = Math.min(3, capabilities.zoom.max);

        if (max > min) {
          // Modest zoom makes small labels easier to decode without the
          // softness caused by aggressive digital zoom.
          const defaultValue = Math.min(max, Math.max(min, 1.25));
          const applied = await applyVideoConstraint(track, {
            zoom: defaultValue,
          });

          zoom = {
            min,
            max,
            value: applied ? defaultValue : min,
            step: 0.1,
          };
        }
      }

      if (!active) return;
      setCameraFeatures({ torch: supportsTorch, zoom });
      setScanStatus("scanning");
    };

    const startScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");

        if (!active || !videoRef.current) return;

        stream = await navigator.mediaDevices.getUserMedia(
          HIGH_QUALITY_REAR_CAMERA,
        );

        if (!active) {
          stopStream(stream);
          return;
        }

        const track = stream.getVideoTracks()[0];
        if (!track) throw new Error("Không tìm thấy luồng hình ảnh từ camera.");

        videoTrackRef.current = track;
        await configureTrack(track);

        const reader = new BrowserMultiFormatReader(undefined, {
          // 10 attempts/second stays responsive without a hot decoding loop.
          delayBetweenScanAttempts: 100,
          delayBetweenScanSuccess: 300,
        });

        controls = await reader.decodeFromStream(
          stream,
          videoRef.current,
          async (result) => {
            if (!active || detected || !result) return;

            const value = result.getText()?.trim();
            if (!value) return;

            // Lock before handing the value to app code so a QR held in the
            // frame cannot trigger duplicate callbacks or API calls.
            detected = true;
            setScanStatus("processing");
            releaseResources();

            try {
              await onDetectedRef.current?.(value, scanTarget);
              if (!active) return;

              setScanStatus("success");
              closeTimer = window.setTimeout(() => {
                if (active) setScanTarget(null);
              }, 350);
            } catch (error) {
              console.error("Lỗi xử lý mã vừa quét:", error);
              if (!active) return;

              setScanError("Không thể xử lý mã vừa quét. Vui lòng thử lại.");
              setScanStatus("error");
            }
          },
        );

        if (!active) releaseResources();
      } catch (err) {
        releaseResources();
        if (!active) return;

        const messages = {
          NotAllowedError: "Chưa được cấp quyền camera.",
          NotFoundError: "Không tìm thấy camera.",
          NotReadableError: "Camera đang được sử dụng bởi ứng dụng khác.",
          OverconstrainedError: "Camera không hỗ trợ cấu hình quét.",
          SecurityError: "Trình duyệt chặn camera.",
        };

        setScanError(messages[err?.name] || "Không thể mở camera.");
        setScanStatus("error");
      }
    };

    startScanner();

    return () => {
      active = false;
      window.clearTimeout(closeTimer);
      releaseResources();
    };
  }, [scanTarget]);

  return {
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
  };
}
