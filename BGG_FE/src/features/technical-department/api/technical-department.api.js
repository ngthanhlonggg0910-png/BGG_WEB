import { getJson, postJson, postFormData } from "../../../shared/api/httpClient";

export async function layThongTinGiayDeNghiTheoBarcodeMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_GetGiayDeNghi_ByBarcodeMau", {
    BarcodeMau: BarcodeMau,
  });
}

export async function layTrangThaiTheoBarcodeMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_GetTrangThai_ByBarCodeMau", {
    BarcodeMau: BarcodeMau,
  });
}

export async function layTenFileTrongFolder() {
  return getJson("/api/technical-department/files");
}

export async function layFileTheoTen(fileName) {
  return getJson(`/api/technical-department/files/${fileName}`);
}

export async function layDanhSachFileTaiLieuTheoBarcodeMau(BarcodeMau) {
  return postJson(
    "/api/technical-department/TEC_TaiLieuKyThuat_LayDanhSachFile_TheoBarcodeMau",
    {
      BarcodeMau: BarcodeMau,
    },
  );
}

export async function getTrangThai(BarcodeMau, Loai) {
  return postJson(
    "/api/technical-department/TEC_GetTrangThai_ByBarcodeMauAndLoai",
    {
      BarcodeMau: BarcodeMau,
      Loai: Loai,
    },
  );
}

export async function capNhatTrangThaiBarcodeMau(payload) {
  return postJson(
    "/api/technical-department/TEC_BarcodeMau_UpdateTrangThai_Mobile",
    payload,
  );
}

export async function layDanhSachLoi() {
  return getJson("/api/technical-department/TEC_KiemMau_DanhSachLoi");
}

export async function kiemTraTonTai(payload) {
  return postJson(
    "/api/technical-department/TEC_KiemMau_Master_KiemTraTonTai",
    payload,
  );
}

export async function themDongKiemMau(payload, image) {
  const formData = createDefectFormData(payload, image);
  return postFormData(
    "/api/technical-department/TEC_KiemMau_Detail_Insert",
    formData,
  );
}

export async function layDanhSachLoiKiemMau(BarcodeMau) {
  return postJson("/api/technical-department/TEC_KiemMau_Detail_Select", {
    BarcodeMau: BarcodeMau,
  });
}

export async function capNhatDongKiemMau(payload, image) {
  const formData = createDefectFormData(payload, image);

  return postFormData(
    "/api/technical-department/TEC_KiemMau_Detail_Update",
    formData,
  );
}

function createDefectFormData(payload, image) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  if (image instanceof File) {
    formData.append("file", image);
  }

  return formData;
}

export async function xoaDongKiemMau(IdDetail) {
  return postJson("/api/technical-department/TEC_KiemMau_Detail_Delete", {
    IdDetail: Number(IdDetail),
  });
}

export async function layThongTinKiemMau(BarcodeMau) {
  return postJson(
    "/api/technical-department/TEC_BarcodeMau_SelectThongTinKiemMau",
    {
      BarcodeMau: BarcodeMau,
    },
  );
}

export function layAnhKiemMau(imagePath) {
  const fileName = String(imagePath ?? "")
    .split(/[\\/]+/)
    .filter(Boolean)
    .pop();

  return fileName
    ? `/api/technical-department/sample-inspection-images/${encodeURIComponent(fileName)}`
    : "";
}
