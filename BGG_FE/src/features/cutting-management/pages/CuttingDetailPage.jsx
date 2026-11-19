import {
  ClipboardList,
  Layers3,
  Ruler,
  Scissors,
  StickyNote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatDateTime } from "../../../shared/utils/formatDateTime";
import { formatNumber } from "../../../shared/utils/formatNumber";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import CuttingActionBar from "../components/CuttingActionBar";
import CuttingField from "../components/CuttingField";
import CuttingReceiptHeader from "../components/CuttingReceiptHeader";
import CuttingRollList from "../components/CuttingRollList";
import CuttingSection from "../components/CuttingSection";
import LockModal from "../components/LockModal";

import {
  loadDanhSachChiTietPHTTHeoPHTId,
  getDanhSachChungLoaiTheoPHTId,
  getDsMauVaiVaMauSanPham,
  getDanhSachPOByPHTId,
  getRongSdVaDaiSdTheoMaPhieu,
  capNhatHoachToan,
  layThongTinTrai,
  capNhatTraiVai,
  layThongTinKhoaPhieu,
  layTongSoLop,
  khoaPhieu,
} from "../api/cutting.api";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";

export default function CuttingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = getCurrentUser();
  const tenDangNhap = `${user.data?.HoVaTenLot} ${user.data?.Ten}`;
  const TKId = user.data?.TKId;

  const location = useLocation();
  const phieu = location.state?.phieu;
  const [loading, setLoading] = useState(false);
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [loadingDsChiTiet, setLoadingDsChiTiet] = useState(false);
  const [dsChungLoai, setDsChungLoai] = useState([]);
  const [loadingChungLoai, setLoadingChungLoai] = useState(false);
  const [dsMau, setDsMau] = useState([]);
  const [loadingDsMau, setLoadingDsMau] = useState(false);
  const [dsPO, setDsPO] = useState([]);
  const [loadingPO, setLoadingPO] = useState(false);
  const [soDo, setSoDo] = useState([]);
  const [loadingSoDo, setLoadingSoDo] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [lockModal, setLockModal] = useState(false);
  const [ngayGioTrai, setNgayGioTrai] = useState(null);

  const [form, setForm] = useState({
    maPhieu: phieu?.PhieuHoachToanId ?? id ?? "",
    maHang: phieu?.MaHang ?? "",
    chungLoai: phieu?.LoaiNguyenLieu ?? "",
    mauVai: phieu?.MauVai ?? "",
    po: phieu?.PONo ?? "",
    soDo: phieu?.CoVocSoDo ?? "",
    rongSoDo: soDo?.KhoSoDo ?? 0,
    daiSoDo: soDo?.DaiSoDo ?? 0,
    soLop: phieu?.SoLop ?? 0,
    khoVai: phieu?.KhoVaiThucTe ?? 0,
    daiBanTrai: phieu?.DaiBanTraiThucTe ?? 0,
    soLopDaTrai: phieu?.TongSoLopDaTrai ?? 0,
    ghiChu: phieu?.GhiChu ?? "",
    ngayBatDau: phieu?.NgayThang ?? "",
    ngayKetThuc: phieu?.NgayKetThuc ?? "",
    // Thêm mới: dữ liệu tách riêng để truyền sang nối cây / insert
    mauVaiHoachToan: "",
    mauSP: "",
  });

  const receiptNumber = phieu?.SoPhieu ?? form.maPhieu;
  const soLopConLai = Math.max(
    0,
    Number(form.soLop || 0) - Number(form.soLopDaTrai || 0),
  );

  //LỌC CÂY VẢI
  const filteredDetails = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return dsChiTiet;
    return dsChiTiet.filter(
      (detail) =>
        String(detail.MaCay ?? "")
          .toLowerCase()
          .includes(query) ||
        String(detail.MauLot ?? "")
          .toLowerCase()
          .includes(query) ||
        String(detail.MauVai ?? "")
          .toLowerCase()
          .includes(query),
    );
  }, [dsChiTiet, keyword]);

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleMauChange = (value) => {
    const selected = dsMau.find(
      (item) => `${item.MauVai} / ${item.MauSanPham}` === value,
    );

    setForm((previous) => ({
      ...previous,
      // Giữ chuỗi ghép cho dropdown hiện tại.
      mauVai: value,
      // Dùng hai trường tách riêng khi tạo cây nối.
      mauVaiHoachToan: selected?.MauVai ?? "",
      mauSP: selected?.MauSanPham ?? "",
    }));
  };

  const handleFabricSplice = (detail) => {
    navigate(`/fabric-splicing-chain/${detail.ChiTietPhieuHoachToanId}`, {
      state: {
        PhieuHoachToanId: Number(detail.PhieuHoachToanId),
        ChiTietPhieuHoachToanId: Number(detail.ChiTietPhieuHoachToanId),
        MaCayGoc: detail.MaCay,
        cayGoc: detail,
        phieu,
        form,
      },
    });
  };

  //LẤY DANH SÁCH CHI TIẾT PHIẾU HOẠCH TOÁN
  useEffect(() => {
    const fetchDanhSachChiTiet = async () => {
      const phieuHoachToanId = phieu?.PhieuHoachToanId ?? id;
      if (!phieuHoachToanId) return;

      setLoadingDsChiTiet(true);

      try {
        const response =
          await loadDanhSachChiTietPHTTHeoPHTId(phieuHoachToanId);
        if (!response.success) {
          showErrorToast(
            response.message || "Lấy danh sách chi tiết PHT thất bại",
          );
          setDsChiTiet([]);
          return;
        }

        setDsChiTiet(response?.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách chi tiết PHT FE: ", error);
        showErrorToast(error?.message);
        setDsChiTiet([]);
      } finally {
        setLoadingDsChiTiet(false);
      }
    };

    fetchDanhSachChiTiet();
  }, [phieu?.PhieuHoachToanId, id]);

  //LẤY DANH SÁCH CHỦNG LOẠI
  useEffect(() => {
    const fetchDanhSachChungLoaiTheoPHTId = async () => {
      if (!phieu.PhieuHoachToanId) return;
      setLoadingChungLoai(true);
      try {
        const response = await getDanhSachChungLoaiTheoPHTId(
          phieu?.PhieuHoachToanId,
        );
        if (!response.success) {
          showErrorToast(
            response.message || "Lấy danh sách chủng loại thất bại",
          );
          setDsChungLoai([]);
          return;
        }
        const chungLoaiOptions = response?.data || [];
        setDsChungLoai(chungLoaiOptions);
        setForm((previous) => ({
          ...previous,
          chungLoai: chungLoaiOptions.some(
            (item) => String(item.ChungLoai) === String(previous.chungLoai),
          )
            ? previous.chungLoai
            : (chungLoaiOptions[0]?.ChungLoai ?? ""),
        }));
      } catch (error) {
        console.error("Lỗi lấy danh sách chủng loại: ", error);
        showErrorToast(error.message || "Lỗi lấy danh sách chủng loại");
      } finally {
        setLoadingChungLoai(false);
      }
    };

    fetchDanhSachChungLoaiTheoPHTId();
  }, [phieu?.PhieuHoachToanId]);

  //LẤY DANH SÁCH MÀU VẢI && MÀU SẢN PHẨM
  useEffect(() => {
    const fetchMau = async () => {
      if (!phieu?.PhieuHoachToanId) return;
      setLoadingDsMau(true);
      try {
        const response = await getDsMauVaiVaMauSanPham(phieu?.PhieuHoachToanId);
        if (!response.success) {
          showErrorToast(response.message || "Lỗi lấy danh sách màu");
          setDsMau([]);
          return;
        }
        const mauOptions = response?.data || [];
        setDsMau(mauOptions);
        setForm((previous) => {
          const selected =
            mauOptions.find(
              (item) =>
                `${item.MauVai} / ${item.MauSanPham}` === `${previous.mauVai}`,
            ) ?? mauOptions[0];

          return {
            ...previous,

            // Giữ nguyên chuỗi cũ cho dropdown và các chỗ đang dùng
            mauVai: selected
              ? `${selected.MauVai} / ${selected.MauSanPham}`
              : "",

            // Dữ liệu tách riêng để hiển thị/insertion nghiệp vụ
            mauVaiHoachToan: selected?.MauVai ?? "",
            mauSP: selected?.MauSanPham ?? "",
          };
        });
      } catch (error) {
        console.error("Lỗi lấy ds màu: ", error);
        showErrorToast(error.message || "Lỗi lấy danh sách màu");
      } finally {
        setLoadingDsMau(false);
      }
    };

    fetchMau();
  }, [phieu?.PhieuHoachToanId]);

  //LẤY DANH SÁCH PO THEO PHTID
  useEffect(() => {
    const fetchPO = async () => {
      if (!phieu?.PhieuHoachToanId) return;
      setLoadingPO(true);
      try {
        const response = await getDanhSachPOByPHTId(phieu?.PhieuHoachToanId);
        if (!response.success) {
          console.error("[BE][PO]: ", response);
          showErrorToast(response.message || "Không thể lấy danh sách PO");
          setDsPO([]);
          return;
        }
        const poOptions = response?.data || [];
        setDsPO(poOptions);
        setForm((previous) => ({
          ...previous,
          po: poOptions.some((item) => String(item) === String(previous.po))
            ? previous.po
            : (poOptions[0] ?? ""),
        }));
      } catch (error) {
        console.error("[API][PO]: ", error);
        showErrorToast(error.message);
        setDsPO([]);
      } finally {
        setLoadingPO(false);
      }
    };

    fetchPO();
  }, [phieu?.PhieuHoachToanId]);

  //LẤY THÔNG TIN RỘNG SƠ ĐỒ VÀ DÀI SƠ ĐỒ
  useEffect(() => {
    const fetchSoDo = async () => {
      if (!phieu?.SoPhieu) return;
      setLoadingSoDo(true);
      try {
        const response = await getRongSdVaDaiSdTheoMaPhieu(phieu?.SoPhieu);
        if (!response.success) {
          showErrorToast(response.message || "Lỗi lấy số đo");
          setSoDo([]);
          return;
        }
        setSoDo(response?.data || []);
      } catch (error) {
        console.error("CATCH: ", error);
        setSoDo([]);
      } finally {
        setLoadingSoDo(false);
      }
    };

    fetchSoDo();
  }, [phieu?.SoPhieu]);

  //LẤY DÀI SƠ ĐỒ TƯƠNG ỨNG RỘNG SƠ ĐỒ
  useEffect(() => {
    if (!soDo?.length) return;

    const selected =
      soDo.find((item) => String(item.KhoSoDo) === String(form.rongSoDo)) ??
      soDo[0];

    const daiSoDo = Number(selected.DaiSoDo ?? 0);

    setForm((prev) => ({
      ...prev,
      rongSoDo: selected.KhoSoDo,
      daiSoDo: Number(daiSoDo.toFixed(2)),
      daiBanTrai: Number((daiSoDo + 0.04).toFixed(2)),
    }));
  }, [soDo, form.rongSoDo]);

  //HÀM LẤY THÔNG TIN TRÃI VẢI
  const fetchTTTrai = async (PhieuHoachToanId) => {
    try {
      const response = await layThongTinTrai(PhieuHoachToanId);
      if (!response.success) {
        showErrorToast(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  //HÀM LẤY THÔNG TIN KHÓA PHIẾU
  const fetchTTKhoaPhieu = async (PhieuHoachToanId) => {
    try {
      const response = await layThongTinKhoaPhieu(PhieuHoachToanId);
      if (!response.success) {
        showErrorToast(response.message);
        return null;
      }
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  //HÀM LẤY TỔNG SỐ LỚP TRẢI VÀ ĐÃ TRẢI
  const fetchSLTVaDaTrai = async (PhieuHoachToanId) => {
    try {
      const response = await layTongSoLop(PhieuHoachToanId);
      if (!response.success) {
        showErrorToast(response.message || "Không thể lấy tổng số lớp");
        return null;
      }
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  //HÀM XÁC NHẬN KHÓA PHIẾU
  const handleConfirmDelete = async () => {
    try {
      const payload = {
        PhieuHoachToanId: Number(form?.maPhieu),
        DaHoachToan: true,
        TKId: Number(TKId),
        NguoiKhoaPhieu: tenDangNhap,
      };
      const response = await khoaPhieu(payload);
      if (!response.success || response.data?.KetQua !== 0) {
        showErrorToast(response.message || "Khóa phiếu thất bại");
        return;
      }
      showSuccessToast(response.message || "Khóa phiếu thành công");
      setLockModal(false);
    } catch (error) {
      console.error(error);
      showErrorToast(error.message || "Lỗi hệ thống khi khóa phiếu");
    }
  };

  //XỬ LÝ CÁC ACTION
  const handleAction = async (action) => {
    switch (action) {
      //CẬP NHẬT
      case "update": {
        const payload = {
          PhieuHoachToanId: Number(phieu?.PhieuHoachToanId),
          DaiBanTraiThucTe: Number(form.daiBanTrai),
          KhoVaiThucTe: Number(form.khoVai),
          RongSoDo: Number(form.rongSoDo),
          DaiSoDo: Number(form.daiSoDo),
        };

        try {
          setLoading(true);
          const response = await capNhatHoachToan(payload);
          if (!response.success) {
            showErrorToast(response.message || "Cập nhật thất bại");
            return;
          }

          showSuccessToast(response.message || "Cập nhật thành công");
          console.log("[UPDATE][SUCCESS]: ", response);
        } catch (error) {
          console.error("[UPDATE][ERROR]: ", error);
          showErrorToast(
            error instanceof Error
              ? error.message
              : "Cập nhật hoạch toán thất bại",
          );
        } finally {
          setLoading(false);
        }
        break;
      }
      //CẬP NHẬT TRẢI VẢI
      case "spread": {
        //Kiểm tra phiếu đã đc cập nhật chưa
        if (loading) return;
        setLoading(true);

        try {
          const ttTrai = await fetchTTTrai(Number(form.maPhieu));
          if (!ttTrai) {
            showErrorToast("Không thể lấy thông tin trải vải");
            console.error("Không thể lấy thông tin trải vải");
            return;
          }

          setNgayGioTrai(ttTrai.NgayGioTrai);

          if (
            ttTrai.DaTrai === true &&
            ttTrai.NgayGioTrai != null &&
            ttTrai.NgayGioTrai !== ""
          ) {
            showWarningToast(
              `Phiếu cập nhật này đã trãi thành công vào ngày ${formatDateTime(ttTrai.NgayGioTrai)}`,
            );
            return;
          }

          const payload = {
            PhieuHoachToanId: Number(form.maPhieu),
            TenNguoiTrai: tenDangNhap,
          };
          const response = await capNhatTraiVai(payload);

          if (!response.success) {
            showErrorToast(response.message || "Cập nhật trải vải thất bại");
            return;
          }
          showSuccessToast(response.message || "Cập nhật trải vải thành công");
        } catch (error) {
          console.error("Lỗi cập nhật trải vải:", error);
          showErrorToast(error.message || "Lỗi hệ thống khi cập nhật trải vải");
        } finally {
          setLoading(false);
        }
        break;
      }
      //KHÓA PHIẾU
      case "lock": {
        try {
          if (ngayGioTrai === null || ngayGioTrai === "") {
            showWarningToast(
              "Không thể khóa phiếu vì chưa cập nhật đã trải, Vui lòng thực hiện bước đã trải",
            );
            return;
          }
          const ttKhoaPhieu = await fetchTTKhoaPhieu(Number(form?.maPhieu));
          if (!ttKhoaPhieu) {
            showErrorToast("Không thể lấy thông tin khóa phiếu");
            return;
          }
          const tongSoLop = await fetchSLTVaDaTrai(Number(form?.maPhieu));
          if (tongSoLop.TongSoLopDaTrai < tongSoLop.TongSoLop) {
            showWarningToast(
              `Không thể khóa phiếu vì trải chưa đủ lớp.\n` +
                `Tổng số lớp đã trải: ${tongSoLop.TongSoLopDaTrai}\n` +
                `Tổng số lớp dự kiến: ${tongSoLop.TongSoLop}`,
            );
            return;
          }
          if (ttKhoaPhieu.DaHoachToan) {
            setLockModal(true);
            return;
          } else {
            showWarningToast(
              `Phiếu này đã khóa trước đó vào ngày: ${formatDateTime(ttKhoaPhieu.NgayThang)}`,
            );
            return;
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
        break;
      }
      case "splice": {
        try {
          if (location.pathname.startsWith("/cutting-detail/")) {
            const PhieuHoachToanId = Number(
              form?.maPhieu ?? location.state?.phieu?.PhieuHoachToanId,
            );

            navigate("/picking-order-scan?scanType=NOI_CAY_TAO_GOC", {
              state: {
                scanType: "NOI_CAY_TAO_GOC",
                PhieuHoachToanId,
                ChiTietPhieuHoachToanId: 0,
                phieu: location.state?.phieu,
                form,
              },
            });
            return;
          }
        } catch (error) {
          console.error("Lỗi quét cây: ", error);
        }
        break;
      }
      default:
        showErrorToast("Chức năng chưa đc hỗ trợ");
        break;
    }
  };
  return (
    <MainLayout
      screenTitle={"Phiếu hoạch toán " + receiptNumber}
      scannerForm={form}
    >
      <main className="min-h-full bg-egmf-surface px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:gap-4">
          <CuttingReceiptHeader receiptNumber={receiptNumber} />

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
            <CuttingSection title="Thông tin phiếu" icon={ClipboardList}>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <CuttingField label="Mã hàng" value={form.maHang} readOnly />
                <CuttingField
                  loading={loadingChungLoai}
                  label="Chủng loại"
                  value={form.chungLoai}
                  options={dsChungLoai.map((item) => {
                    return {
                      value: item.ChungLoai,
                      label: item.ChungLoai,
                    };
                  })}
                  onChange={(value) => updateField("chungLoai", value)}
                />

                <CuttingField
                  loading={loadingDsMau}
                  label="Màu vải"
                  value={form.mauVai}
                  onChange={handleMauChange}
                  options={dsMau.map((item) => {
                    return {
                      value: `${item.MauVai} / ${item.MauSanPham}`,
                      label: `${item.MauVai} / ${item.MauSanPham}`,
                    };
                  })}
                />

                <CuttingField
                  loading={loadingPO}
                  label="PO"
                  value={form.po}
                  onChange={(value) => updateField("po", value)}
                  options={dsPO.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                />
              </div>
            </CuttingSection>

            <CuttingSection title="Sơ đồ & yêu cầu" icon={Ruler} tone="warning">
              <div className="space-y-2.5 sm:space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-egmf-muted">
                    Cỡ vóc sơ đồ
                  </span>
                  <textarea
                    value={form.soDo}
                    readOnly
                    rows={2}
                    className="w-full resize-none rounded-lg border border-egmf-border bg-egmf-surface-subtle px-2.5 py-2 text-sm font-semibold leading-5 text-egmf-ink-secondary outline-none"
                  />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <CuttingField
                    loading={loadingSoDo}
                    label="Rộng sơ đồ"
                    value={String(form.rongSoDo ?? "")}
                    onChange={(value) => updateField("rongSoDo", value)}
                    options={soDo.map((item) => ({
                      label: String(item.KhoSoDo),
                      value: String(item.KhoSoDo),
                    }))}
                  />

                  <CuttingField
                    loading={loadingSoDo}
                    label="Dài sơ đồ"
                    value={form.daiSoDo}
                    readOnly
                  />
                  <CuttingField label="Số lớp" value={form.soLop} readOnly />
                </div>
              </div>
            </CuttingSection>
          </div>

          <CuttingSection title="Thực tế trải" icon={Scissors} tone="success">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              <CuttingField
                label="Khổ vải"
                type="number"
                value={form.khoVai}
                onChange={(value) => updateField("khoVai", value)}
              />

              <CuttingField
                label="Số lớp đã trải"
                value={form.soLopDaTrai}
                readOnly
              />
              <CuttingField
                label="Dài bàn trải"
                value={form.daiBanTrai}
                readOnly
              />

              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold text-egmf-muted">
                  Số lớp còn lại
                </p>
                <div className="flex h-12 items-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-base font-extrabold text-rose-700">
                  {formatNumber(soLopConLai)}
                </div>
              </div>
            </div>
          </CuttingSection>

          <CuttingActionBar onAction={handleAction} />

          <CuttingSection
            title="Ghi chú & thời gian"
            icon={StickyNote}
            tone="warning"
          >
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(15rem,1fr)]">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold text-egmf-muted">
                  Ghi chú
                </p>
                <div className="min-h-20 rounded-lg border border-egmf-border bg-egmf-surface-subtle px-2.5 py-2 text-sm font-medium leading-5 text-egmf-ink-secondary">
                  {form.ghiChu || "Không có ghi chú."}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-egmf-surface-subtle p-2.5">
                  <p className="m-0 text-xs font-bold text-egmf-muted">
                    Bắt đầu
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold leading-5 text-egmf-ink-secondary">
                    {formatDateTime(form.ngayBatDau)}
                  </p>
                </div>
                <div className="rounded-lg bg-egmf-surface-subtle p-2.5">
                  <p className="m-0 text-xs font-bold text-egmf-muted">
                    Kết thúc
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold leading-5 text-egmf-ink-secondary">
                    {formatDateTime(form.ngayKetThuc)}
                  </p>
                </div>
              </div>
            </div>
          </CuttingSection>

          <CuttingSection
            title="Danh sách cây vải"
            icon={Layers3}
            tone="danger"
            action={
              <span className="rounded-full bg-egmf-primary-tint px-2.5 py-1 text-xs font-bold text-egmf-primary">
                {filteredDetails.length} cây
              </span>
            }
          >
            <CuttingRollList
              details={filteredDetails}
              keyword={keyword}
              onKeywordChange={setKeyword}
              onFabricSplice={handleFabricSplice}
              loading={loadingDsChiTiet}
            />
          </CuttingSection>
        </div>
      </main>

      {lockModal && <LockModal handleConfirmDelete={handleConfirmDelete} />}
    </MainLayout>
  );
}
