import { useEffect, useRef, useState } from "react";

export function useCaptureImage() {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [upLoading, setUpLoading] = useState(false);

  //Mở camera
  const openCamera = () => {
    cameraRef.current?.click();
  };
  //Mở thư viện ảnh
  const openGallery = () => {
    fileRef.current?.click();
  };

  //Nhận ảnh từ camere hoặc thư viện
  const handleCaptureImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    e.target.value = "";
  };

  //Tạo đường dẫn xem trước
  useEffect(() => {
    if (!image) return setPreviewUrl("");
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  //Xóa ảnh
  const removeImage = () => {
    setImage(null);
  };

  //upload ảnh
  const uploadImage = async (uploadApi) => {
    if (!image || upLoading) return;
    setUpLoading(true);
    try {
      const response = await uploadApi(image);
      if (response?.success) setImage(null);
      return response;
    } finally {
      setUpLoading(false);
    }
  };

  return {
    cameraRef,
    fileRef,
    image,
    previewUrl,
    upLoading,
    openCamera,
    openGallery,
    handleCaptureImage,
    removeImage,
    uploadImage,
  };
}
