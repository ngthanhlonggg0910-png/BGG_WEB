// Temporary mock for the procedure that saves an accessory inspection rate.
// Replace this implementation with postJson(...) once the backend endpoint is available.
export async function saveAccessoryInspectionRate(payload) {
  console.info("[MOCK PROC] Save accessory inspection rate", payload);

  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    message: "Đã cập nhật tỷ lệ kiểm.",
    data: {
      KetQua: 1,
      ...payload,
    },
  };
}
