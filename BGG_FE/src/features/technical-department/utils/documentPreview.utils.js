import { getFileExtension, getFileType } from "./sampleInspection.utils";

export function getSelectedDocumentPreview(fileNames, selectedIndex) {
  const name = fileNames[selectedIndex];

  if (!name) {
    return { selectedDocument: null, typeFile: "" };
  }

  return {
    selectedDocument: {
      name,
      url: `/api/technical-department/files/${encodeURIComponent(name)}`,
      extension: getFileExtension(name),
    },
    typeFile: getFileType(name),
  };
}
