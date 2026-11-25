import { useState } from "react";
import { layDanhSachFileTaiLieuTheoBarcodeMau } from "../api/technical-department.api";

export function useTechnicalDocuments(barCodeMau) {
  const [dsFile, setDsFile] = useState([]);
  const [loadingFile, setLoadingFile] = useState(false);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [dsFileName, setDsFileName] = useState([]);

  const fetchDsFile = async () => {
    setLoadingFile(true);
    try {
      const response = await layDanhSachFileTaiLieuTheoBarcodeMau(barCodeMau);
      if (!response.success) {
        showErrorToast(response.message);
        setDsFile([]);
        return;
      }
      setDsFile(response?.data || []);
      return response?.data;
    } catch (error) {
      console.error("Lấy danh sách file lỗi: ", error);
      showErrorToast(error.message);
      setDsFile([]);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleViewDocuments = async () => {
    try {
      setSelectedDocumentIndex(0);
      setIsDocumentModalOpen(true);

      const data = await fetchDsFile();
      setDsFileName(data.map((item) => item.DuongDanLocal.split("/").pop()));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    selectedDocumentIndex,
    setSelectedDocumentIndex,
    isDocumentModalOpen,
    setIsDocumentModalOpen,
    dsFileName,
    handleViewDocuments,
    dsFile,
    loadingFile,
    fetchDsFile,
  };
}
