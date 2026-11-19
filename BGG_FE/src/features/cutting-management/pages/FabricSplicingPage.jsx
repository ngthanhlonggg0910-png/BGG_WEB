import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import FabricRollSummary from "../components/fabric-splicing/FabricRollSummary";
import FabricSplicingMetrics from "../components/fabric-splicing/FabricSplicingMetrics";
import FabricSplicingReceiptInfo from "../components/fabric-splicing/FabricSplicingReceiptInfo";
import FabricSplicingResult from "../components/fabric-splicing/FabricSplicingResult";
import {
  layThongTinCayGoc,
  quetNhanCayGoc,
  themCayNoi,
  quetNhanCayHoachToanThuong,
} from "../api/cutting.api";
import { useLocation, useNavigate } from "react-router-dom";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

export default function FabricSplicingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  //TẠO DL TỪ LOCATION
  const form = location.state?.form ?? {};
  const maCay = location.state?.MaCay;
  const maCayGoc = location.state?.MaCayGoc ?? "";
  const isHoachToanThuong = location?.state?.mode === "HOACH_TOAN_THUONG";
  const isThemCayNoi = location.state?.mode === "THEM_CAY_NOI";
  const phieuHoachToanId = Number(location.state?.PhieuHoachToanId ?? 0);
  const chiTietPhieuHoachToanId = Number(
    location.state?.ChiTietPhieuHoachToanId ?? 0,
  );

  const [ketQuaLuu, setKetQuaLuu] = useState({});
  const [ttCay, setTTCay] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!maCay || !phieuHoachToanId) {
      showErrorToast("Thiếu mã cây hoặc Phiếu hoạch toán.");
      return;
    }

    if (ketQuaLuu.tieuHaoThucTe <= 0) {
      showWarningToast("Vui lòng nhập số mét trải lớn hơn 0.");
      return;
    }

    if (ketQuaLuu.daiBanTraiThucTe <= 0) {
      showErrorToast("Phiếu chưa có dài bàn trải thực tế.");
      return;
    }

    if (ketQuaLuu.vuotDinhMuc) {
      showErrorToast(
        `Không thể hạch toán vượt ${ketQuaLuu.phanTram}% chiều dài cây vải.`,
      );
      return;
    }

    if (ketQuaLuu.canChonCachXuLyPhanConLai && !ketQuaLuu.luaChonPhanConLai) {
      showWarningToast(
        "Vui lòng chọn phần còn lại là Nguyên cây hoặc Thiếu vải.",
      );
      return;
    }

    if (ketQuaLuu.thuHoiKhongHopLe) {
      showWarningToast("Mỗi giá trị thu hồi phải từ 0 đến 50 mét.");
      return;
    }

    const payload = {
      PhieuHoachToanId: phieuHoachToanId,
      MaCay: maCay,
      MauVai: form.mauVaiHoachToan ?? "",
      MauSP: form.mauSP ?? "",
      PO: form.po ?? "",
      ChungLoai: form.chungLoai ?? "",
      MauLot: ttCay.MauLot ?? ttCay.Lot ?? ttCay.lot ?? "",
      Yard: toNumber(ttCay.Yard ?? ttCay.yard),
      Met: toNumber(ttCay.Met ?? ttCay.met),
      SoMetTrai: isHoachToanThuong ? 0 : ketQuaLuu.soMetTrai,
      SoLopTrai: isHoachToanThuong ? ketQuaLuu.soLopTrai : 0,
      TieuHaoThucTe: ketQuaLuu.tieuHaoThucTe,
      ThucTe: ketQuaLuu.tieuHaoThucTe,
      Thua: ketQuaLuu.thua,
      Thieu: ketQuaLuu.thieu,
      NguyenCay: ketQuaLuu.nguyenCay,
      ThuHoi1: isHoachToanThuong ? toNumber(ketQuaLuu.thuHoi?.[0]) : 0,
      ThuHoi2: isHoachToanThuong ? toNumber(ketQuaLuu.thuHoi?.[1]) : 0,
      ThuHoi3: isHoachToanThuong ? toNumber(ketQuaLuu.thuHoi?.[2]) : 0,
      ThuHoi4: isHoachToanThuong ? toNumber(ketQuaLuu.thuHoi?.[3]) : 0,
      ThuHoi5: isHoachToanThuong ? toNumber(ketQuaLuu.thuHoi?.[4]) : 0,
      // Luồng tính BTP chưa được xây ở UI này.
      SoBTP: ketQuaLuu.soBTP,
      DaiBanTraiThucTe: ketQuaLuu.daiBanTraiThucTe,
    };

    console.log("payload: ", payload);

    if (isThemCayNoi && !chiTietPhieuHoachToanId) {
      showErrorToast("Thiếu ID cây gốc để thêm cây nối.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (isThemCayNoi) {
        response = await themCayNoi({
          ...payload,
          ChiTietPhieuHoachToanId: chiTietPhieuHoachToanId,
        });
      } else if (isHoachToanThuong) {
        response = await quetNhanCayHoachToanThuong(payload);
      } else {
        response = await quetNhanCayGoc(payload);
      }

      if (!response.success) {
        showErrorToast(
          response.message ||
            (isThemCayNoi
              ? "Thêm cây nối thất bại!"
              : isHoachToanThuong
                ? "Hoạch toán thường thất bại"
                : "Tạo cây gốc thất bại!"),
        );
        return;
      }

      showSuccessToast(
        response.message ||
          (isThemCayNoi
            ? "Thêm cây nối tiếp thành công!"
            : isHoachToanThuong
              ? "Hoạch toán thường thành công"
              : "Tạo cây gốc nối thành công!"),
      );

      // Khi phần còn lại được xử lý là nguyên cây, tiếp tục ngay luồng nối cây.
      // Dùng ID chi tiết do API tạo trả về để trang vẫn hoạt động khi reload.
      const chiTietCayGocMoiId =
        !isThemCayNoi && !isHoachToanThuong
          ? Number(response.data?.ChiTietPhieuHoachToanId ?? 0)
          : 0;

      if (
        !isThemCayNoi &&
        !isHoachToanThuong &&
        ketQuaLuu.nguyenCay > 0 &&
        chiTietCayGocMoiId > 0
      ) {
        navigate(`/fabric-splicing-chain/${chiTietCayGocMoiId}`, {
          replace: true,
          state: {
            PhieuHoachToanId: phieuHoachToanId,
            ChiTietPhieuHoachToanId: chiTietCayGocMoiId,
            MaCayGoc: maCay,
            cayGoc: {
              ...ttCay,
              ...payload,
              ChiTietPhieuHoachToanId: chiTietCayGocMoiId,
            },
            form,
            phieu: location.state?.phieu,
          },
        });
        return;
      }

      //CÂY NỐI QUAY VỀ MÀN HÌNH NỐI CÂY
      if (isThemCayNoi) {
        navigate(`/fabric-splicing-chain/${chiTietPhieuHoachToanId}`, {
          replace: true,
          state: {
            PhieuHoachToanId: phieuHoachToanId,
            ChiTietPhieuHoachToanId: chiTietPhieuHoachToanId,
            MaCayGoc: maCayGoc,
            cayGoc: {
              PhieuHoachToanId: phieuHoachToanId,
              ChiTietPhieuHoachToanId: chiTietPhieuHoachToanId,
              MaCay: maCayGoc,
            },
            form,
            phieu: location.state?.phieu,
          },
        });
        return;
      }

      //CÂY GỐC QUAY VỀ TRANG CHI TIẾT PHT
      navigate(`/cutting-detail/${phieuHoachToanId}`, {
        replace: true,
        state: { phieu: location.state?.phieu },
      });
    } catch (error) {
      console.error(
        isThemCayNoi ? "Lỗi thêm cây nối tiếp:" : "Lỗi tạo cây gốc:",
        error,
      );
      showErrorToast(
        error.message ||
          (isThemCayNoi
            ? "Lỗi hệ thống khi thêm cây nối tiếp."
            : isHoachToanThuong
              ? "Lỗi hệ thống khi hoạch toán thường"
              : "Lỗi hệ thống khi tạo cây gốc."),
      );
    } finally {
      setSaving(false);
    }
  };

  console.log(location);

  useEffect(() => {
    if (!maCay || !phieuHoachToanId) {
      showErrorToast("Thiếu mã cây hoặc Phiếu hoạch toán.");
      return;
    }

    const fetchTTCay = async () => {
      try {
        const response = await layThongTinCayGoc({
          MaCay: maCay,
          PhieuHoachToanId: Number(phieuHoachToanId),
        });

        if (!response.success) {
          showErrorToast(response.message || "Không thể lấy thông tin cây");
          setTTCay({});
          return;
        }

        // Phòng trường hợp API SQL trả mảng một dòng
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        setTTCay(data ?? {});
      } catch (error) {
        console.error("Lỗi khi lấy thông tin cây:", error);
        showErrorToast(error.message || "Lỗi khi lấy thông tin cây");
      }
    };

    fetchTTCay();
  }, [maCay, phieuHoachToanId]);

  return (
    <MainLayout screenTitle="Nối cây vải">
      <main className="min-h-full bg-egmf-surface px-4 py-3 pb-[calc(9rem+env(safe-area-inset-bottom))] text-egmf-ink sm:px-6 sm:py-4 md:pb-24 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="space-y-3 sm:space-y-4">
            <FabricRollSummary
              form={form}
              fabricRoll={ttCay}
              receiptNumber={location?.state?.PhieuHoachToanId}
            />
            <FabricSplicingMetrics
              cayVai={ttCay}
              thongTinPhieu={form}
              onThayDoiKetQua={setKetQuaLuu}
              mode={location?.state?.mode}
            />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 border-t border-egmf-border/80 bg-egmf-surface/90 px-4 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur-xl sm:px-6 md:bottom-0 md:left-[270px] md:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-2 rounded-2xl border border-egmf-border bg-white/95 p-2 shadow-[0_8px_24px_rgba(15,23,42,.1)] sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-egmf-border bg-white px-4 text-sm font-extrabold text-egmf-ink-secondary transition hover:-translate-y-px hover:border-egmf-primary-border hover:bg-egmf-primary-tint hover:text-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32"
            >
              <X size={18} strokeWidth={2.4} />
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-egmf-primary to-blue-500 px-5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(32,107,196,.28)] transition hover:-translate-y-px hover:shadow-[0_12px_24px_rgba(32,107,196,.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-36"
            >
              <Save size={18} strokeWidth={2.4} />
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
