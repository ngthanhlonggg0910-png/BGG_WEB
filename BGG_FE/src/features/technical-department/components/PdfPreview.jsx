import { useEffect, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const PLACEHOLDER_HEIGHT = 520;

function PdfPage({
  documentProxy,
  pageNumber,
  zoom,
  viewportWidth,
  scrollContainerRef,
  onError,
}) {
  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(pageNumber === 1);
  const [pageHeight, setPageHeight] = useState(PLACEHOLDER_HEIGHT);

  useEffect(() => {
    const pageElement = pageRef.current;
    if (!pageElement || isNearViewport) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { root: scrollContainerRef.current, rootMargin: "700px 0px" },
    );

    observer.observe(pageElement);
    return () => observer.disconnect();
  }, [isNearViewport, scrollContainerRef]);

  useEffect(() => {
    if (!isNearViewport || !documentProxy || !viewportWidth || !canvasRef.current) {
      return undefined;
    }

    let isCancelled = false;
    let renderTask;

    const renderPage = async () => {
      try {
        const page = await documentProxy.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.min(
          (viewportWidth - 24) / baseViewport.width,
          1,
        );
        const viewport = page.getViewport({ scale: fitScale * zoom });
        const outputScale = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;

        if (!canvas || isCancelled) return;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        setPageHeight(viewport.height + 24);

        const context = canvas.getContext("2d", { alpha: false });
        renderTask = page.render({
          canvasContext: context,
          transform:
            outputScale === 1
              ? undefined
              : [outputScale, 0, 0, outputScale, 0, 0],
          viewport,
        });
        await renderTask.promise;
      } catch (renderError) {
        if (!isCancelled && renderError?.name !== "RenderingCancelledException") {
          onError(renderError.message || "Không thể hiển thị tệp PDF.");
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [documentProxy, isNearViewport, onError, pageNumber, viewportWidth, zoom]);

  return (
    <div
      ref={pageRef}
      className="flex min-w-max justify-center py-3"
      style={{ minHeight: pageHeight }}
    >
      {isNearViewport ? (
        <canvas
          ref={canvasRef}
          aria-label={`Trang ${pageNumber} của tài liệu PDF`}
          className="bg-white shadow-md"
        />
      ) : (
        <span className="self-center text-xs font-medium text-egmf-muted">
          Trang {pageNumber}
        </span>
      )}
    </div>
  );
}

export default function PdfPreview({ url }) {
  const viewportRef = useRef(null);
  const [documentProxy, setDocumentProxy] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;
    const loadingTask = pdfjsLib.getDocument(url);

    setDocumentProxy(null);
    setPageCount(0);
    setZoom(1);
    setError("");

    loadingTask.promise
      .then((pdf) => {
        if (isCancelled) {
          pdf.destroy();
          return;
        }

        setDocumentProxy(pdf);
        setPageCount(pdf.numPages);
      })
      .catch((loadError) => {
        if (!isCancelled) setError(loadError.message || "Không thể mở tệp PDF.");
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [url]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return undefined;

    const updateViewportWidth = () => {
      setViewportWidth(viewportElement.clientWidth);
    };

    updateViewportWidth();
    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(viewportElement);
    return () => observer.disconnect();
  }, []);

  const decreaseZoom = () =>
    setZoom((currentZoom) =>
      Math.max(MIN_ZOOM, Number((currentZoom - ZOOM_STEP).toFixed(2))),
    );
  const increaseZoom = () =>
    setZoom((currentZoom) =>
      Math.min(MAX_ZOOM, Number((currentZoom + ZOOM_STEP).toFixed(2))),
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
      <div className="flex shrink-0 items-center justify-end gap-1 border-b border-egmf-border-subtle bg-white px-2 py-1 sm:px-3">
        <button
          type="button"
          aria-label="Thu nhỏ PDF"
          disabled={zoom <= MIN_ZOOM}
          onClick={decreaseZoom}
          className="grid size-9 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ZoomOut size={17} />
        </button>
        <span className="w-10 text-center text-xs font-bold tabular-nums text-egmf-ink-secondary">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          aria-label="Phóng to PDF"
          disabled={zoom >= MAX_ZOOM}
          onClick={increaseZoom}
          className="grid size-9 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ZoomIn size={17} />
        </button>
        <button
          type="button"
          aria-label="Đặt lại tỷ lệ PDF"
          onClick={() => setZoom(1)}
          className="grid size-9 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle"
        >
          <RotateCcw size={16} />
        </button>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-egmf-border-subtle" />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Mở tệp ở tab mới"
          aria-label="Mở tệp ở tab mới"
          className="grid size-8 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
        >
          <ExternalLink size={16} />
        </a>
        <a
          href={url}
          download
          title="Tải xuống"
          aria-label="Tải xuống"
          className="grid size-8 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
        >
          <Download size={16} />
        </a>
      </div>

      <div
        ref={viewportRef}
        className="min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain px-3"
      >
        {error ? (
          <p className="m-0 grid min-h-full place-items-center text-center text-sm font-medium text-rose-600">
            {error}
          </p>
        ) : documentProxy ? (
          Array.from({ length: pageCount }, (_, index) => (
            <PdfPage
              key={index + 1}
              documentProxy={documentProxy}
              pageNumber={index + 1}
              zoom={zoom}
              viewportWidth={viewportWidth}
              scrollContainerRef={viewportRef}
              onError={setError}
            />
          ))
        ) : (
          <div
            className="flex min-h-full flex-col items-center justify-center gap-3 text-sm font-semibold text-egmf-muted"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle size={28} className="animate-spin text-egmf-primary" />
            <span>Đang tải PDF...</span>
          </div>
        )}
      </div>
    </div>
  );
}
