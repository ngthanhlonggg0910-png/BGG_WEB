import { postJson } from "../../../shared/api/httpClient";

// Quyền Xác nhận / Hủy xác nhận của tài khoản đang đăng nhập.
export async function getQuyenXacNhanPhieu() {
  return postJson("/api/phieu-giam-dinh/quyen", {});
}

// Trạng thái phiếu + quyền Xác nhận / Hủy xác nhận của tài khoản đang đăng nhập.
export async function getTrangThaiPhieuGiamDinh(pgdId) {
  return postJson("/api/phieu-giam-dinh/trang-thai", { PGDId: pgdId });
}

// Xác nhận phiếu như desktop: kiểm tra vượt chứng từ, khổ (NL), dòng chưa
// giám định, rồi đổi trạng thái và tạo phiếu nhập kho trong một transaction.
export async function xacNhanPhieuGiamDinh(pgdId, xoaDongChuaGiamDinh = false) {
  return postJson("/api/phieu-giam-dinh/xac-nhan", {
    PGDId: pgdId,
    xoaDongChuaGiamDinh,
  });
}

export async function huyXacNhanPhieuGiamDinh(pgdId) {
  return postJson("/api/phieu-giam-dinh/huy-xac-nhan", { PGDId: pgdId });
}
