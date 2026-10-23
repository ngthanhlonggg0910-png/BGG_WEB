import { getJson, postJson } from "../../../shared/api/httpClient";

// Lấy danh sách Lệnh sản xuất (LSX)
export async function getListProductionOrders(filters = {}) {
  return postJson("/api/production-order/list", {
    tuNgay: filters.tuNgay || undefined,
    denNgay: filters.denNgay || undefined,
    trangThai: filters.trangThai || undefined,
    search: filters.search || undefined,
  });
}

// Lấy chi tiết 1 Lệnh sản xuất (header + chi tiết PO/Màu/Size + lịch sử đơn đặt)
export async function getProductionOrderDetail(lsxId) {
  return getJson(`/api/production-order/detail/${lsxId}`);
}

// Tính nhu cầu vật tư theo BOM (OMM_PO_BangDinhMuc)
export async function calculateBomMaterial(payload) {
  return postJson("/api/production-order/calculate-bom", payload);
}

// Tạo đơn đặt hàng vật tư từ LSX (TrangThai = 'ChoSoanHang')
export async function createMaterialOrderFromLsx(payload) {
  return postJson("/api/production-order/create-material-order", payload);
}

// Hủy đơn đặt hàng vật tư từ LSX (chỉ khi Kho chưa quét/xuất)
export async function cancelMaterialOrderFromLsx(donDatHangId, nguoiHuy) {
  return postJson(
    `/api/production-order/cancel-material-order/${donDatHangId}`,
    { nguoiHuy },
  );
}

// Thủ kho duyệt đơn và Tạo Phiếu Soạn Hàng (WH_PhieuSoanHang) trực tiếp từ Đơn đặt hàng LSX
export async function createPickingOrderFromMaterialOrder(
  donDatHangId,
  payload = {},
) {
  return postJson(
    `/api/production-order/create-picking-order/${donDatHangId}`,
    payload,
  );
}

// Lấy danh sách đơn đặt hàng LSX đã tạo
export async function getMaterialOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.lsxId) query.set("lsxId", String(params.lsxId));
  if (params.loaiDatHang) query.set("loaiDatHang", params.loaiDatHang);
  if (params.trangThai) query.set("trangThai", params.trangThai);
  if (params.search) query.set("search", params.search);
  if (params.tuNgay) query.set("tuNgay", params.tuNgay);
  if (params.denNgay) query.set("denNgay", params.denNgay);
  const qs = query.toString();
  return getJson(`/api/production-order/material-orders${qs ? `?${qs}` : ""}`);
}

// Lấy chi tiết vật tư của 1 đơn đặt hàng LSX
export async function getMaterialOrderDetail(donDatHangId) {
  return getJson(`/api/production-order/material-order-detail/${donDatHangId}`);
}
