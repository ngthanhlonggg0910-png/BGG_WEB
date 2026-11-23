import { useCallback, useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import {
  Download,
  ExternalLink,
  FileText,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import AppSelect from "../../../shared/components/ui/AppSelect";
import { fetchBlob } from "../../../shared/api/httpClient";
import { parseExcelSheets } from "../utils/excelPreview.utils";
import { getSelectedDocumentPreview } from "../utils/documentPreview.utils";
import DocumentPreviewLoading from "./DocumentPreviewLoading";
import PdfPreview from "./PdfPreview";

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  fileNames,
  hasDocuments,
  isLoadingFiles,
  selectedIndex,
  onSelectedIndexChange,
}) {
  const wordRef = useRef(null);
  const wordPreviewRef = useRef(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [wordFitZoom, setWordFitZoom] = useState(1);
  const [fileSearch, setFileSearch] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isWordLoading, setIsWordLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);

  const { selectedDocument, typeFile } = getSelectedDocumentPreview(
    fileNames,
    selectedIndex,
  );

  // File được tải một lần kèm token đăng nhập; ảnh/PDF/link dùng blob URL,
  // Word/Excel đọc trực tiếp từ Blob.
  const [loadedFile, setLoadedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const documentUrl = selectedDocument?.url;
  // loadedFile có thể null khi chưa chọn tài liệu (documentUrl cũng undefined),
  // nên phải kiểm tra loadedFile trước khi so URL.
  const isLoadedFileCurrent = Boolean(loadedFile && documentUrl && loadedFile.url === documentUrl);
  const fileBlob = isLoadedFileCurrent ? loadedFile.blob : null;
  const objectUrl = isLoadedFileCurrent ? loadedFile.objectUrl : "";

  useEffect(() => {
    if (!isOpen || !documentUrl) return undefined;

    let isCancelled = false;
    let createdUrl = "";
    setFileError("");

    fetchBlob(documentUrl)
      .then((blob) => {
        if (isCancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setLoadedFile({ url: documentUrl, blob, objectUrl: createdUrl });
      })
      .catch((error) => {
        console.error("Lỗi tải tài liệu:", error);
        if (!isCancelled) {
          setFileError("Không tải được tài liệu.");
          setIsImageLoading(false);
          setIsWordLoading(false);
          setIsExcelLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [isOpen, documentUrl]);

  const updateWordFitZoom = useCallback(() => {
    const previewElement = wordPreviewRef.current;
    const pageElements = wordRef.current?.querySelectorAll("section.docx");

    if (!previewElement || !pageElements?.length) return;

    const widestPage = Math.max(
      ...Array.from(pageElements, (pageElement) => pageElement.scrollWidth),
    );
    const availableWidth = previewElement.clientWidth - 16;

    if (widestPage && availableWidth) {
      setWordFitZoom(Math.min(1, availableWidth / widestPage));
    }
  }, []);

  useEffect(() => {
    setPreviewZoom(1);
    setWordFitZoom(1);
    setIsImageLoading(typeFile === 1);
    setIsWordLoading(typeFile === 2);
    setIsExcelLoading(typeFile === 3);
  }, [selectedDocument?.url, typeFile]);

  useEffect(() => {
    if (!isOpen || typeFile !== 2 || !fileBlob || !wordRef.current) {
      return undefined;
    }

    let isCancelled = false;
    setIsWordLoading(true);

    const loadWord = async () => {
      try {
        if (!isCancelled && wordRef.current) {
          wordRef.current.innerHTML = "";
          await renderAsync(fileBlob, wordRef.current);
          requestAnimationFrame(updateWordFitZoom);
        }
      } catch (error) {
        console.error("Lỗi xem Word:", error);
      } finally {
        if (!isCancelled) setIsWordLoading(false);
      }
    };

    loadWord();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, fileBlob, typeFile, updateWordFitZoom]);

  useEffect(() => {
    if (!isOpen || typeFile !== 2 || !wordPreviewRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateWordFitZoom);
    resizeObserver.observe(wordPreviewRef.current);
    return () => resizeObserver.disconnect();
  }, [isOpen, typeFile, updateWordFitZoom]);

  useEffect(() => {
    if (!isOpen || !fileBlob || typeFile !== 3) return undefined;

    let isCancelled = false;

    const loadExcel = async () => {
      setIsExcelLoading(true);
      setExcelData([]);

      try {
        const buffer = await fileBlob.arrayBuffer();
        const sheets = parseExcelSheets(buffer);

        if (!isCancelled) setExcelData(sheets);
      } catch (error) {
        console.error("Lỗi xem Excel:", error);
      } finally {
        if (!isCancelled) setIsExcelLoading(false);
      }
    };

    loadExcel();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, fileBlob, typeFile]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="egmf-dialog-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="technical-document-modal-title"
        className="egmf-dialog-panel flex h-dvh w-full max-w-none flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-egmf-border-subtle px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
              <FileText size={19} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2
                id="technical-document-modal-title"
                className="m-0 truncate text-base font-extrabold text-egmf-ink"
              >
                Tài liệu kỹ thuật
              </h2>
              <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                {fileNames.length ? `${fileNames.length} tệp đính kèm` : "Chưa có tệp đính kèm"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem tài liệu"
            className="grid size-10 shrink-0 place-items-center rounded-xl text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
          >
            <X size={21} />
          </button>
        </header>

        {hasDocuments ? (
          <div className="flex min-h-0 flex-1 flex-col bg-egmf-surface-subtle">
            <div className="shrink-0 border-b border-egmf-primary-border-soft bg-white/95 px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-4">
              <AppSelect
                disabled={isLoadingFiles}
                className="w-full"
                minHeight={36}
                menuMaxHeight={320}
                searchable
                inputValue={fileSearch}
                value={selectedIndex}
                placeholder="Nhập để tìm tên tệp..."
                onInputChange={(value, { action }) => {
                  if (action === "input-change") setFileSearch(value);
                  return value;
                }}
                onChange={(value) => {
                  setFileSearch("");
                  onSelectedIndexChange(value);
                }}
                options={fileNames.map((fileName, index) => ({
                  value: index,
                  label: fileName,
                }))}
                aria-label="Chọn tài liệu để xem"
              />
            </div>

            {selectedDocument && (
              <>
                {typeFile !== 4 && (
                  <div className="flex shrink-0 items-center justify-end gap-1 border-b border-egmf-border-subtle bg-white px-2 py-1 sm:px-3">
                  <div className="order-2 ml-1 flex items-center gap-1 border-l border-egmf-border-subtle pl-1">
                    <a
                      href={objectUrl || undefined}
                      target="_blank"
                      rel="noreferrer"
                      title="Mở tệp ở tab mới"
                      aria-label="Mở tệp ở tab mới"
                      className="grid size-8 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <a
                      href={objectUrl || undefined}
                      download={selectedDocument.name}
                      title="Tải xuống"
                      aria-label="Tải xuống"
                      className="grid size-8 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                    >
                      <Download size={16} />
                    </a>
                  </div>

                  {[1, 2].includes(typeFile) && (
                    <div className="order-1 flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Thu nhỏ nội dung"
                        disabled={previewZoom <= 0.75}
                        onClick={() =>
                          setPreviewZoom((currentZoom) =>
                            Math.max(0.75, Number((currentZoom - 0.25).toFixed(2))),
                          )
                        }
                        className="grid size-9 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ZoomOut size={17} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold tabular-nums text-egmf-ink-secondary">
                        {Math.round(
                          previewZoom * (typeFile === 2 ? wordFitZoom : 1) * 100,
                        )}
                        %
                      </span>
                      <button
                        type="button"
                        aria-label="Phóng to nội dung"
                        disabled={previewZoom >= 3}
                        onClick={() =>
                          setPreviewZoom((currentZoom) =>
                            Math.min(3, Number((currentZoom + 0.25).toFixed(2))),
                          )
                        }
                        className="grid size-9 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ZoomIn size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Đặt lại tỷ lệ nội dung"
                        onClick={() => setPreviewZoom(1)}
                        className="grid size-9 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-surface-subtle"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  )}
                  </div>
                )}

                {typeFile === 1 && (
                  <div className="relative flex min-h-0 flex-1 touch-pan-x touch-pan-y items-center justify-center overflow-auto overscroll-contain bg-slate-100 p-2 sm:p-5">
                    {isImageLoading && <DocumentPreviewLoading label="Đang tải ảnh..." />}
                    {fileError && (
                      <p className="m-0 text-sm font-semibold text-red-600">{fileError}</p>
                    )}
                    {objectUrl && (
                    <img
                      src={objectUrl}
                      alt="Xem dạng ảnh"
                      onLoad={() => setIsImageLoading(false)}
                      onError={() => setIsImageLoading(false)}
                      className="block h-auto max-h-full max-w-full object-contain"
                      style={{
                        maxWidth: `${previewZoom * 100}%`,
                        maxHeight: `${previewZoom * 100}%`,
                      }}
                    />
                    )}
                  </div>
                )}

                {typeFile === 2 && (
                  <div
                    ref={wordPreviewRef}
                    className="word-preview relative min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain bg-slate-100"
                  >
                    {isWordLoading && (
                      <DocumentPreviewLoading label="Đang tải tài liệu Word..." />
                    )}
                    <div
                      className="word-preview__scale"
                      style={{ "--document-zoom": previewZoom * wordFitZoom }}
                    >
                      <div ref={wordRef} className="min-w-full" />
                    </div>
                  </div>
                )}

                {typeFile === 3 && (
                  <div className="relative min-h-0 flex-1 bg-white">
                    {isExcelLoading && (
                      <DocumentPreviewLoading label="Đang tải bảng Excel..." />
                    )}
                    {excelData.length > 0 && (
                      <Workbook
                        key={selectedDocument.url}
                        data={excelData}
                        showToolbar={false}
                        showFormulaBar={false}
                        showSheetTabs={true}
                      />
                    )}
                  </div>
                )}

                {typeFile === 4 &&
                  (objectUrl ? (
                    <PdfPreview url={objectUrl} />
                  ) : (
                    <div className="relative flex min-h-0 flex-1 items-center justify-center bg-slate-100">
                      {fileError ? (
                        <p className="m-0 text-sm font-semibold text-red-600">{fileError}</p>
                      ) : (
                        <DocumentPreviewLoading label="Đang tải PDF..." />
                      )}
                    </div>
                  ))}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
              <FileText size={27} strokeWidth={1.8} />
            </span>
            <p className="m-0 mt-4 text-base font-extrabold text-egmf-ink">
              Chưa có tài liệu kỹ thuật
            </p>
            <p className="m-0 mt-1 max-w-md text-sm leading-6 text-egmf-muted">
              Tài liệu PDF, Excel hoặc Word sẽ hiển thị tại đây khi phiếu có tệp đính kèm.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
