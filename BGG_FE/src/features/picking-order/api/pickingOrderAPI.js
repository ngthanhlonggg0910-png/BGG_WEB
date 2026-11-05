import { postJson } from "../../../shared/api/httpClient";
//Lấy danh sách phiếu
export async function getListPickingOrderByStatus(params) {
  return postJson(
    "/api/picking-order/wh_DanhSachPhieuSoanHangNgayVaTinhTrang",
    {
      maKho: params.maKho,
      tkId: params.tkId,
      ngaySoan: params.ngaySoan,
      tinhTrang: params.tinhTrang,
    },
  );
}

//Lấy chi tiết phiếu
export async function getPickingOrderDetail(PhieuSoanHangId) {
  return postJson(
    "/api/picking-order/wh_DanhSachChiTietPhieuSoanHang_TheoPhieuSoanHangId",
    {
      PhieuSoanHangId: PhieuSoanHangId,
    },
  );
}

//Lấy danh sách vật tư theo Mã rọ + psh
export async function getVatTuByRoAndPhieu(PhieuSoanHangId, MaRo) {
  return postJson(
    "/api/picking-order/wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHang",
    {
      PhieuSoanHangId: PhieuSoanHangId,
      SoRo: MaRo,
    },
  );
}

//nhận MaCay, SoLuongThucSoan và thực hiện phân bổ số lượng cây vải vào phiếu soạn hàng.
export async function pickFabricRoll(payload) {
  return postJson(
    "/api/picking-order/wh_ChiTietPhieuSoanHang_ThemMoi_KhongMaRo_NhieuDong_Android",
    {
      PhieuSoanHangId: payload.PhieuSoanHangId,
      MaCay: payload.MaCay,
      SoLuongThucSoan: payload.SoLuongThucSoan,
      TKQuet: payload.TKQuet,
      TenNguoiQuyetXuat: payload.TenNguoiQuyetXuat,
    },
  );
}

//Lấy danh sách vật tư theo mã qr trắng
export async function layDanhSachVatTuTheoMaQrTrang(
  phieuSoanHangId,
  maRo,
  maCay,
) {
  return postJson(
    "/api/picking-order/wh_LayDanhSachVatTuTheoMaRoVaPhieuSoanHangVaQrTrang",
    {
      PhieuSoanHangId: phieuSoanHangId,
      SoRo: maRo,
      MaCay: maCay,
    },
  );
}

// Kiểm tra tiến độ soạn hàng và các đợt xuất
export async function kiemTraTienDoSoanHang(phieuSoanHangId) {
  return postJson("/api/picking-order/wh_KiemTraTienDoSoanHang", {
    PhieuSoanHangId: Number(phieuSoanHangId),
  });
}

// Xác nhận xuất kho (xuất đợt hoặc hoàn tất xuất kho)
export async function xacNhanXuatKho(payload) {
  return postJson("/api/picking-order/wh_XacNhanXuatKho", {
    PhieuSoanHangId: Number(payload.phieuSoanHangId ?? payload.PhieuSoanHangId),
    xacNhanHoanTat: Boolean(payload.xacNhanHoanTat),
    choPhepDongKhiThieu: Boolean(payload.choPhepDongKhiThieu),
    tkId: Number(payload.tkId),
    tenNguoiXacNhan: String(payload.tenNguoiXacNhan || ""),
    ghiChu: payload.ghiChu ? String(payload.ghiChu) : undefined,
  });
}
