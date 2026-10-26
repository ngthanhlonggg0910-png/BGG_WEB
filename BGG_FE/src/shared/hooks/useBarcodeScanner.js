import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const DEFAULT_CAMERA_FEATURES = { torch: false, zoom: null };
const REQUIRED_STABLE_READS = 2;
const STABLE_READ_WINDOW_MS = 900;

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
 * Opens the device camera and returns one detected QR Code value to the caller.
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
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  const videoRef = useRef(null);
  const videoTrackRef = useRef(null);
  const onDetectedRef = useRef(onDetected);
  const processingRef = useRef(false);
  const resultCandidateRef = useRef(null);
  const scanTargetRef = useRef(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    scanTargetRef.current = scanTarget;
  }, [scanTarget]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsDocumentVisible(visible);

      if (!visible && scanTargetRef.current) {
        setScanStatus("paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const openScanner = useCallback((target) => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera cần HTTPS hoặc localhost.");
      return;
    }

    setScanError("");
    setScanStatus("starting");
    setCameraFeatures(DEFAULT_CAMERA_FEATURES);
    setTorchOn(false);
    processingRef.current = false;
    resultCandidateRef.current = null;
    setScanTarget(target);
  }, []);

  const closeScanner = useCallback(() => {
    setScanTarget(null);
    setScanError("");
    setScanStatus("idle");
    setCameraFeatures(DEFAULT_CAMERA_FEATURES);
    setTorchOn(false);
    processingRef.current = false;
    resultCandidateRef.current = null;
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
    if (!isDocumentVisible) return undefined;

    let active = true;
    let controls;
    let stream;
    let closeTimer;
    const startedAt = performance.now();

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
      const supportsContinuousExposure = Array.isArray(capabilities.exposureMode)
        ? capabilities.exposureMode.includes("continuous")
        : false;
      const supportsZoom =
        Number.isFinite(capabilities.zoom?.min) &&
        Number.isFinite(capabilities.zoom?.max) &&
        capabilities.zoom.max > capabilities.zoom.min;

      // Best effort only: focus controls are not available in every browser.
      if (supportsContinuousFocus) {
        await applyVideoConstraint(track, { focusMode: "continuous" });
      }

      if (supportsContinuousExposure) {
        await applyVideoConstraint(track, { exposureMode: "continuous" });
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
        // QR-only reader avoids spending CPU on Code128/EAN/Code39 and makes
        // it impossible for a 1D barcode to be accepted by this scan flow.
        const { BrowserQRCodeReader } = await import("@zxing/browser");

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

        const reader = new BrowserQRCodeReader(undefined, {
          // ~8 attempts/second is responsive at Full HD without making
          // warehouse phones run a continuously hot decode loop.
          delayBetweenScanAttempts: 120,
          delayBetweenScanSuccess: 120,
        });

        controls = await reader.decodeFromStream(
          stream,
          videoRef.current,
          async (result) => {
            if (!active || processingRef.current || !result) return;

            // Preserve the decoded QR payload exactly. Whitespace-only values
            // are rejected, but leading/trailing whitespace is not altered.
            const value = result.getText();
            if (typeof value !== "string" || value.trim().length === 0) return;

            // ZXing may produce a transient false positive on an unfocused or
            // reflective label. Confirm the same normalized value twice in a
            // short window before any business callback/API can run.
            const now = performance.now();
            const previous = resultCandidateRef.current;
            const isSameRecentValue =
              previous?.value === value &&
              now - previous.lastSeenAt <= STABLE_READ_WINDOW_MS;

            const candidate = {
              hits: isSameRecentValue ? previous.hits + 1 : 1,
              lastSeenAt: now,
              value,
            };
            resultCandidateRef.current = candidate;

            if (candidate.hits < REQUIRED_STABLE_READS) {
              setScanStatus("confirming");
              return;
            }

            // Lock before handing the value to app code so a QR held in the
            // frame cannot trigger duplicate callbacks or API calls.
            processingRef.current = true;
            setScanStatus("processing");
            releaseResources();

            if (import.meta.env.DEV) {
              console.debug("[Scanner] Stable result confirmed", {
                durationMs: Math.round(now - startedAt),
                format: result.getBarcodeFormat?.()?.toString?.() ?? "unknown",
              });
            }

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
  }, [isDocumentVisible, scanTarget]);

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
