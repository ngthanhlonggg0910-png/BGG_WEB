import { postJson } from "../../../shared/api/httpClient";

/**
 * Lấy danh sách đơn nhận hàng (Nguyên liệu / Phụ liệu)
 * @param {Object} params
 * @param {string} [params.loaiDatHang] 'ALL' | 'NguyenLieu' | 'PhuLieu'
 * @param {string} [params.trangThai] 'ALL' | 'ChoNhan' | 'NhanMotPhan' | 'DaNhanDu'
 * @param {string} [params.tuNgay]
 * @param {string} [params.denNgay]
 * @param {string} [params.keyword]
 * @param {number} [params.tkId]
 */
export async function getDanhSachDonNhanHang(params = {}) {
  return postJson("/api/material-receipt/wh_DanhSachDonNhanHang", params);
}

/**
 * Lấy chi tiết đơn nhận hàng kèm danh sách cây/vật tư
 * @param {number} phieuSoanHangId
 * @param {number} [donDatHangId]
 */
export async function getChiTietDonNhanHang(phieuSoanHangId, donDatHangId) {
  return postJson("/api/material-receipt/wh_ChiTietDonNhanHang", {
    PhieuSoanHangId: phieuSoanHangId,
    DonDatHangId: donDatHangId,
  });
}

/**
 * Quét nhận một cây hoặc hủy nhận
 * @param {Object} payload
 * @param {number} payload.PhieuSoanHangId
 * @param {string} payload.MaCay
 * @param {number} [payload.SoLuongThucNhan]
 * @param {number} payload.tkId
 * @param {string} payload.tenNguoiNhan
 * @param {string} [payload.xiNghiepNhan]
 * @param {'xac_nhan'|'huy_nhan'} [payload.action]
 */
export async function quetNhanCay(payload) {
  return postJson("/api/material-receipt/wh_QuetNhanCay", payload);
}

/**
 * Xác nhận nhận tất cả hoặc chốt hoàn tất nhận hàng
 * @param {Object} payload
 * @param {number} payload.PhieuSoanHangId
 * @param {boolean} payload.nhanTatCa
 * @param {boolean} [payload.chotHoanTat]
 * @param {number} payload.tkId
 * @param {string} payload.tenNguoiNhan
 * @param {string} [payload.xiNghiepNhan]
 * @param {string} [payload.ghiChu]
 */
export async function xacNhanNhanHang(payload) {
  return postJson("/api/material-receipt/wh_XacNhanNhanHang", payload);
}
