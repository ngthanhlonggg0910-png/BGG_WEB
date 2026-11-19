export const getFileExtension = (fileName) => {
  if (!fileName) return "";

  return fileName.split(".").pop().toLowerCase();
};

export function getPreviewUrl(document) {
  const isOfficeDocument = ["doc", "docx", "xls", "xlsx"].includes(
    document.extension,
  );

  if (isOfficeDocument && /^https?:\/\//i.test(document.url)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`;
  }

  return document.url;
}

export function getFileType(fileName) {
  if (!fileName) return "";
  const ext = fileName.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "bmp"].includes(ext)) return 1;
  if (["doc", "docx"].includes(ext)) return 2;
  if (["xls", "xlsx"].includes(ext)) return 3;
  if (ext === "pdf") return 4;

  return 0;
}

export function displayPreviewValue(value, fallback = "—") {
  if (value == null) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;

  return value;
}

export function getSampleStatusTone(status) {
  if (status === "HÀNG LỖI") {
    return {
      container: "border-rose-200 bg-rose-50",
      label: "text-rose-700",
      value: "text-rose-700",
    };
  }

  if (status === "HÀNG ĐẠT") {
    return {
      container: "border-emerald-200 bg-emerald-50",
      label: "text-emerald-700",
      value: "text-emerald-700",
    };
  }

  if (status === "HÀNG SỬA") {
    return {
      container: "border-amber-200 bg-amber-50",
      label: "text-amber-700",
      value: "text-amber-800",
    };
  }

  return {
    container: "border-egmf-border bg-egmf-surface-subtle",
    label: "text-egmf-muted",
    value: "text-egmf-ink-secondary",
  };
}
