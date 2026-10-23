import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Layers,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Scissors,
  Send,
  Shirt,
  SlidersHorizontal,
  Square,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Empty, Spin, message } from "antd";
import dayjs from "dayjs";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentProfile } from "../../../shared/auth/session";
import {
  calculateBomMaterial,
  createMaterialOrderFromLsx,
  getProductionOrderDetail,
} from "../api/productionOrderAPI";

export default function ProductionOrderBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const lsxId = Number(
    searchParams.get("lsxId") || location.state?.lsx?.LSXId || 0,
  );
  const initialType =
    searchParams.get("type") || location.state?.loaiDatHang || "NguyenLieu";

  const profile = getCurrentProfile();
  const tkId = Number(profile?.TKId || 0);
  const defaultNguoiDat = useMemo(() => {
    const full = [profile?.HoVaTenLot, profile?.Ten]
      .filter(Boolean)
      .join(" ")
      .trim();
    return full || profile?.TenDangNhap || "Người dùng Web";
  }, [profile]);

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bước thao tác trên Mobile & Tablet: "size" (Bước 1) | "bom" (Bước 2)
  const [activeStep, setActiveStep] = useState("size");
  // Đánh dấu khi người dùng đổi chọn cỡ / số lượng cần tính lại BOM
  const [bomDirty, setBomDirty] = useState(false);
  // Mở rộng / thu gọn form thông tin phiếu trên mobile
  const [infoExpanded, setInfoExpanded] = useState(false);

  const [lsxHeader, setLsxHeader] = useState(location.state?.lsx || null);
  const [sizeRows, setSizeRows] = useState([]);
  const [existingOrders, setExistingOrders] = useState([]);

  // Thông tin đơn đặt hàng
  const [loaiDatHang, setLoaiDatHang] = useState(initialType);
  const [nguoiDat, setNguoiDat] = useState(defaultNguoiDat);
  const [ngayCanGiao, setNgayCanGiao] = useState(() =>
    dayjs().format("YYYY-MM-DD"),
  );
  const [ghiChuLot, setGhiChuLot] = useState("");
  const [lotEditedManually, setLotEditedManually] = useState(false);
  const [ghiChu, setGhiChu] = useState("");

  // Bộ lọc nhanh màu trên bảng Size
  const [colorFilter, setColorFilter] = useState("ALL");

  // Danh sách vật tư BOM
  const [bomItems, setBomItems] = useState([]);

  // Hàm tính BOM
  const runCalculateBom = async (rowsToCalc, targetLoai) => {
    const selected = rowsToCalc
      .filter((r) => r.checked && Number(r.SoLuongDat) > 0)
      .map((r) => ({
        chiTietLsxId: r.ChiTietLSXId,
        poId: Number(r.POId),
        poNo: r.PONo,
        tenMau: r.TenMau,
        codeMau: r.CodeMau,
        tenSize: r.TenSize,
        soLuongSanPham: Number(r.SoLuongDat),
      }));

    if (selected.length === 0) {
      setBomItems([]);
      setBomDirty(false);
      return;
    }

    try {
      setCalculating(true);
      const res = await calculateBomMaterial({
        lsxId,
        loaiDatHang: targetLoai,
        selectedRows: selected,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setBomItems(
        list.map((it, idx) => ({
          ...it,
          _rowKey: `${it.PDMId || idx}_${idx}`,
        })),
      );
      setBomDirty(false);
    } catch (err) {
      console.error("Lỗi tính định mức BOM:", err);
      message.error(err?.message || "Không thể tính định mức vật tư");
    } finally {
      setCalculating(false);
    }
  };

  // Tải chi tiết LSX
  const loadLsxDetail = async () => {
    if (!lsxId) return;
    try {
      setLoading(true);
      const res = await getProductionOrderDetail(lsxId);
      const header = res?.data?.header || null;
      const chiTiet = Array.isArray(res?.data?.chiTiet) ? res.data.chiTiet : [];
      const orders = Array.isArray(res?.data?.donDatHangList)
        ? res.data.donDatHangList
        : [];

      setLsxHeader(header);
      setExistingOrders(orders);

      if (header) {
        const defaultDate =
          loaiDatHang === "NguyenLieu"
            ? header.NgayCanMauCat
            : header.NgayVaoChuyen;
        if (defaultDate && dayjs(defaultDate).isValid()) {
          setNgayCanGiao(dayjs(defaultDate).format("YYYY-MM-DD"));
        }
      }

      const mappedRows = chiTiet.map((r) => ({
        ...r,
        checked: true,
        SoLuongDat: Number(r.SoLuong || 0),
      }));
      setSizeRows(mappedRows);

      await runCalculateBom(mappedRows, loaiDatHang);
    } catch (err) {
      console.error("Lỗi tải chi tiết LSX:", err);
      message.error(err?.message || "Không thể tải thông tin Lệnh sản xuất");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLsxDetail();
  }, [lsxId]);

  // Tự động tổng hợp Ghi chú Lot từ các dòng đã chọn (nếu người dùng chưa tự sửa tay)
  useEffect(() => {
    if (lotEditedManually) return;
    const lots = new Set();
    sizeRows
      .filter((r) => r.checked && Number(r.SoLuongDat) > 0)
      .forEach((r) => {
        if (r.LotVaiChinh) {
          lots.add(`${r.TenMau || ""}-VC:${r.LotVaiChinh}`);
        }
        if (r.LotVaiLot) {
          lots.add(`${r.TenMau || ""}-VL:${r.LotVaiLot}`);
        }
      });
    setGhiChuLot(Array.from(lots).join("; "));
  }, [sizeRows, lotEditedManually]);

  // Đổi bộ phận đặt hàng (Nhà cắt <-> Nhà may)
  const handleSwitchLoaiDatHang = async (newLoai) => {
    if (newLoai === loaiDatHang) return;
    setLoaiDatHang(newLoai);
    if (lsxHeader) {
      const targetDate =
        newLoai === "NguyenLieu"
          ? lsxHeader.NgayCanMauCat
          : lsxHeader.NgayVaoChuyen;
      if (targetDate && dayjs(targetDate).isValid()) {
        setNgayCanGiao(dayjs(targetDate).format("YYYY-MM-DD"));
      }
    }
    await runCalculateBom(sizeRows, newLoai);
  };

  // Chuyển sang Bước 2 (Vật tư BOM) -> tự động tính lại BOM nếu có thay đổi ở Bước 1
  const handleGoToBomStep = async () => {
    setActiveStep("bom");
    if (bomDirty) {
      await runCalculateBom(sizeRows, loaiDatHang);
    }
  };

  // Danh sách các màu trong LSX
  const distinctColors = useMemo(() => {
    return Array.from(new Set(sizeRows.map((r) => r.TenMau).filter(Boolean)));
  }, [sizeRows]);

  const visibleSizeRows = useMemo(() => {
    if (colorFilter === "ALL") return sizeRows;
    return sizeRows.filter((r) => r.TenMau === colorFilter);
  }, [sizeRows, colorFilter]);

  // Gom nhóm PO + Màu để hiển thị dạng thẻ (Card) thân thiện với Tablet & Mobile
  const groupedPoColors = useMemo(() => {
    const map = new Map();
    visibleSizeRows.forEach((row) => {
      const key = `${row.POId || row.PONo}__${row.TenMau || ""}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          poId: row.POId,
          poNo: row.PONo,
          tenMau: row.TenMau,
          codeMau: row.CodeMau,
          lotVaiChinh: row.LotVaiChinh,
          lotVaiLot: row.LotVaiLot,
          rows: [],
        });
      }
      map.get(key).rows.push(row);
    });
    return Array.from(map.values());
  }, [visibleSizeRows]);

  const totalSelectedQty = useMemo(() => {
    return sizeRows
      .filter((r) => r.checked)
      .reduce((sum, r) => sum + Number(r.SoLuongDat || 0), 0);
  }, [sizeRows]);

  const selectedSizeCount = useMemo(() => {
    return sizeRows.filter((r) => r.checked && Number(r.SoLuongDat) > 0).length;
  }, [sizeRows]);

  const handleToggleRow = (chiTietLsxId) => {
    setBomDirty(true);
    setSizeRows((prev) =>
      prev.map((r) =>
        r.ChiTietLSXId === chiTietLsxId ? { ...r, checked: !r.checked } : r,
      ),
    );
  };

  const handleToggleGroup = (groupRows, nextChecked) => {
    setBomDirty(true);
    const idSet = new Set(groupRows.map((r) => r.ChiTietLSXId));
    setSizeRows((prev) =>
      prev.map((r) =>
        idSet.has(r.ChiTietLSXId) ? { ...r, checked: nextChecked } : r,
      ),
    );
  };

  const handleChangeRowQty = (chiTietLsxId, val) => {
    setBomDirty(true);
    const num = Math.max(0, Number(val || 0));
    setSizeRows((prev) =>
      prev.map((r) =>
        r.ChiTietLSXId === chiTietLsxId
          ? { ...r, SoLuongDat: num, checked: num > 0 ? true : r.checked }
          : r,
      ),
    );
  };

  const handleStepRowQty = (chiTietLsxId, delta) => {
    setBomDirty(true);
    setSizeRows((prev) =>
      prev.map((r) => {
        if (r.ChiTietLSXId !== chiTietLsxId) return r;
        const nextVal = Math.max(0, Number(r.SoLuongDat || 0) + delta);
        return { ...r, SoLuongDat: nextVal, checked: nextVal > 0 };
      }),
    );
  };

  const handleResetPlannedQty = () => {
    setBomDirty(true);
    setSizeRows((prev) =>
      prev.map((r) => ({
        ...r,
        checked: true,
        SoLuongDat: Number(r.SoLuong || 0),
      })),
    );
  };

  const handleToggleAllVisible = (checked) => {
    setBomDirty(true);
    const visibleIds = new Set(visibleSizeRows.map((r) => r.ChiTietLSXId));
    setSizeRows((prev) =>
      prev.map((r) =>
        visibleIds.has(r.ChiTietLSXId) ? { ...r, checked } : r,
      ),
    );
  };

  const handleSelectOnlyColor = async (color) => {
    setColorFilter(color);
    if (color === "ALL") return;
    const updated = sizeRows.map((r) => ({
      ...r,
      checked: r.TenMau === color,
    }));
    setSizeRows(updated);
    await runCalculateBom(updated, loaiDatHang);
  };

  const handleBomQtyChange = (rowKey, val) => {
    setBomItems((prev) =>
      prev.map((it) =>
        it._rowKey === rowKey ? { ...it, SoLuongYeuCau: val } : it,
      ),
    );
  };

  const handleStepBomQty = (rowKey, delta) => {
    setBomItems((prev) =>
      prev.map((it) => {
        if (it._rowKey !== rowKey) return it;
        const cur = Number(it.SoLuongYeuCau || 0);
        const next = Math.max(0, Math.round((cur + delta) * 10000) / 10000);
        return { ...it, SoLuongYeuCau: next };
      }),
    );
  };

  const handleBomNoteChange = (rowKey, val) => {
    setBomItems((prev) =>
      prev.map((it) => (it._rowKey === rowKey ? { ...it, GhiChu: val } : it)),
    );
  };

  const handleRemoveBomRow = (rowKey) => {
    setBomItems((prev) => prev.filter((it) => it._rowKey !== rowKey));
  };

  const handleAddManualBomRow = () => {
    setBomItems((prev) => [
      ...prev,
      {
        _rowKey: `manual_${Date.now()}`,
        VTId: null,
        MaVatTu: "",
        TenVatTu: "",
        DVT: loaiDatHang === "NguyenLieu" ? "yds" : "pcs",
        LoaiNPL: loaiDatHang === "NguyenLieu" ? "NGUYÊN LIỆU" : "PHỤ LIỆU",
        DinhMuc: 0,
        SoLuongSanPham: totalSelectedQty,
        SoLuongYeuCau: 1,
        GhiChu: "Bổ sung thủ công",
        isManual: true,
      },
    ]);
  };

  const handleManualFieldChange = (rowKey, field, val) => {
    setBomItems((prev) =>
      prev.map((it) => (it._rowKey === rowKey ? { ...it, [field]: val } : it)),
    );
  };

  // Gửi đơn đặt hàng xuống Kho
  const handleSubmitOrder = async () => {
    const validItems = bomItems.filter(
      (it) =>
        Number(it.SoLuongYeuCau) > 0 &&
        String(it.MaVatTu || "").trim() !== "",
    );

    if (validItems.length === 0) {
      message.warning(
        "Vui lòng tính nhu cầu vật tư hoặc nhập ít nhất 1 vật tư có Số lượng yêu cầu > 0",
      );
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        lsxId,
        loaiDatHang,
        nguoiDat: nguoiDat.trim() || defaultNguoiDat,
        tkId,
        ngayCanGiao: ngayCanGiao || undefined,
        ghiChuLot: ghiChuLot.trim(),
        ghiChu: ghiChu.trim(),
        items: validItems.map((it) => ({
          vtId: it.VTId ? Number(it.VTId) : null,
          maVatTu: String(it.MaVatTu || "").trim(),
          tenVatTu: String(it.TenVatTu || "").trim(),
          dvt: String(it.DVT || "").trim(),
          loaiNPL: String(
            it.LoaiNPL ||
              (loaiDatHang === "NguyenLieu" ? "NGUYÊN LIỆU" : "PHỤ LIỆU"),
          ).trim(),
          dinhMuc: Number(it.DinhMuc || 0),
          soLuongSanPham: Number(it.SoLuongSanPham || totalSelectedQty || 0),
          soLuongYeuCau: Number(it.SoLuongYeuCau || 0),
          ghiChu: String(it.GhiChu || "").trim(),
        })),
      };

      const res = await createMaterialOrderFromLsx(payload);
      const createdCode = res?.data?.soDonDatHang || "";
      message.success(
        `Đã gửi Đơn đặt hàng ${createdCode} xuống Kho (Chờ soạn hàng)!`,
      );

      await loadLsxDetail();
    } catch (err) {
      console.error("Lỗi tạo đơn đặt hàng LSX:", err);
      message.error(err?.message || "Không thể gửi đơn đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (!lsxId) {
    return (
      <MainLayout screenTitle="Đặt hàng vật tư từ LSX">
        <div className="p-6">
          <Empty description="Chưa chọn Lệnh sản xuất" />
        </div>
      </MainLayout>
    );
  }

  const isCat = loaiDatHang === "NguyenLieu";

  return (
    <MainLayout
      screenTitle={
        isCat
          ? "Nhà Cắt đặt Nguyên liệu (LSX)"
          : "Nhà May đặt Phụ liệu (LSX)"
      }
    >
      <div className="min-h-full bg-egmf-surface p-2.5 sm:p-4 md:p-5">
        <div className="mx-auto max-w-6xl space-y-3 sm:space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-egmf-border bg-white">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* 1. THẺ THÔNG TIN LSX & CHUYỂN ĐỔI BỘ PHẬN (TỐI ƯU MOBILE / TABLET) */}
              <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex items-start gap-2.5 sm:items-center">
                    <button
                      type="button"
                      onClick={() => navigate("/production-orders")}
                      className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 hover:border-egmf-primary hover:text-egmf-primary"
                      title="Quay lại danh sách LSX"
                    >
                      <ArrowLeft size={19} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-egmf-primary-tint px-2 py-0.5 text-xs font-extrabold text-egmf-primary-strong">
                          <Layers size={13} />
                          {lsxHeader?.SoLSX}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700">
                          KH:{" "}
                          {Number(
                            lsxHeader?.TongSanLuong || 0,
                          ).toLocaleString("vi-VN")}{" "}
                          SP
                        </span>
                      </div>
                      <h2 className="mt-1 truncate text-[15px] font-extrabold text-slate-900 sm:text-lg">
                        Mã hàng: {lsxHeader?.MaHang || "—"} •{" "}
                        {lsxHeader?.KhachHang || "—"}
                      </h2>
                    </div>
                  </div>

                  {/* CHUYỂN ĐỔI NHÀ CẮT / NHÀ MAY (FULL WIDTH TRÊN MOBILE, PILL TRÊN TABLET) */}
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:flex">
                    <button
                      type="button"
                      onClick={() => handleSwitchLoaiDatHang("NguyenLieu")}
                      className={`flex min-h-[42px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
                        isCat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Scissors size={15} className="shrink-0" />
                      <span>Nhà Cắt (NL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchLoaiDatHang("PhuLieu")}
                      className={`flex min-h-[42px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
                        !isCat
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Shirt size={15} className="shrink-0" />
                      <span>Nhà May (PL)</span>
                    </button>
                  </div>
                </div>

                {/* THANH TÓM TẮT THÔNG TIN ĐƠN ĐẶT (CÓ THỂ THU GỌN/MỞ RỘNG TRÊN MOBILE ĐỂ TIẾT KIỆM DIỆN TÍCH) */}
                <div className="px-3.5 py-2.5 sm:px-5 sm:py-3">
                  <button
                    type="button"
                    onClick={() => setInfoExpanded((prev) => !prev)}
                    className="flex w-full touch-manipulation items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-100"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                      <span className="inline-flex items-center gap-1 font-extrabold text-slate-800">
                        <SlidersHorizontal
                          size={14}
                          className="text-egmf-primary"
                        />
                        Thông tin phiếu:
                      </span>
                      <span className="font-semibold text-slate-600">
                        Giao:{" "}
                        <strong className="text-slate-900">
                          {ngayCanGiao
                            ? dayjs(ngayCanGiao).format("DD/MM/YYYY")
                            : "—"}
                        </strong>
                      </span>
                      <span className="font-semibold text-slate-600">
                        • Người đặt:{" "}
                        <strong className="text-slate-900">{nguoiDat}</strong>
                      </span>
                      {ghiChuLot && (
                        <span className="max-w-[220px] truncate font-semibold text-slate-600 sm:max-w-xs">
                          • Lot: <strong className="text-slate-900">{ghiChuLot}</strong>
                        </span>
                      )}
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-egmf-primary shadow-2xs">
                      {infoExpanded ? (
                        <>
                          <span>Thu gọn</span>
                          <ChevronUp size={15} />
                        </>
                      ) : (
                        <>
                          <span>Sửa / Ghi chú</span>
                          <ChevronDown size={15} />
                        </>
                      )}
                    </span>
                  </button>

                  {infoExpanded && (
                    <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Bộ phận / Kho nhận đơn
                        </label>
                        <div
                          className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-sm font-bold ${
                            isCat
                              ? "border-blue-200 bg-blue-50 text-blue-800"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {isCat ? (
                            <>
                              <Scissors size={16} className="shrink-0" />
                              <span className="truncate">
                                Nhà cắt {lsxHeader?.NhaCat || ""} → Kho NL (NA)
                              </span>
                            </>
                          ) : (
                            <>
                              <Shirt size={16} className="shrink-0" />
                              <span className="truncate">
                                Tổ may {lsxHeader?.ToMay || ""} → Kho PL (PA)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Ngày cần giao NPL
                        </label>
                        <input
                          type="date"
                          value={ngayCanGiao}
                          onChange={(e) => setNgayCanGiao(e.target.value)}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold text-slate-800 outline-none focus:border-egmf-primary focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Người đặt hàng
                        </label>
                        <input
                          type="text"
                          value={nguoiDat}
                          onChange={(e) => setNguoiDat(e.target.value)}
                          placeholder="Tên người đặt"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold text-slate-800 outline-none focus:border-egmf-primary focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Ghi chú Lot vải
                        </label>
                        <input
                          type="text"
                          value={ghiChuLot}
                          onChange={(e) => {
                            setLotEditedManually(true);
                            setGhiChuLot(e.target.value);
                          }}
                          placeholder="Lot vải chính / vải lót..."
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-800 outline-none focus:border-egmf-primary focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="mb-1 block text-xs font-bold text-slate-600">
                          Ghi chú đơn đặt hàng (Gửi Thủ kho)
                        </label>
                        <input
                          type="text"
                          value={ghiChu}
                          onChange={(e) => setGhiChu(e.target.value)}
                          placeholder="Nhập ghi chú thêm cho Kho (ví dụ: Cấp trước bàn cắt 1, ưu tiên màu BLK...)"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-800 outline-none focus:border-egmf-primary focus:bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* LỊCH SỬ ĐƠN ĐẶT ĐÃ GỬI - CUỘN NGANG GỌN GÀNG TRÊN MOBILE */}
                {existingOrders.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-3.5 py-2.5 sm:px-5">
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                      <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Đã gửi ({existingOrders.length}):
                      </span>
                      {existingOrders.map((od) => (
                        <div
                          key={od.DonDatHangId}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-2xs"
                        >
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                              od.LoaiDatHang === "NguyenLieu"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {od.LoaiDatHang === "NguyenLieu" ? "Cắt" : "May"}
                          </span>
                          <strong className="text-slate-800">
                            {od.SoDonDatHang}
                          </strong>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              od.TrangThai === "HoanThanh"
                                ? "bg-emerald-50 text-emerald-700"
                                : od.PhieuSoanHangId
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {od.MaSoPhieuSoan
                              ? `PSH: ${od.MaSoPhieuSoan}`
                              : "Chờ soạn"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 2. THANH CHUYỂN BƯỚC (STEPPER) CHO MOBILE & TABLET */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-egmf-border bg-white p-1.5 shadow-egmf-card">
                <button
                  type="button"
                  onClick={() => setActiveStep("size")}
                  className={`flex min-h-[50px] touch-manipulation items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition-all sm:text-sm ${
                    activeStep === "size"
                      ? "bg-egmf-primary text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      activeStep === "size"
                        ? "bg-white text-egmf-primary"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    1
                  </span>
                  <div className="min-w-0 text-left">
                    <div className="truncate">Chọn Cỡ & SL Đặt</div>
                    <div
                      className={`text-[11px] font-semibold ${
                        activeStep === "size"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {selectedSizeCount} cỡ •{" "}
                      {totalSelectedQty.toLocaleString("vi-VN")} SP
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleGoToBomStep}
                  className={`flex min-h-[50px] touch-manipulation items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition-all sm:text-sm ${
                    activeStep === "bom"
                      ? "bg-egmf-primary text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      activeStep === "bom"
                        ? "bg-white text-egmf-primary"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    2
                  </span>
                  <div className="min-w-0 text-left">
                    <div className="truncate">Vật tư định mức (BOM)</div>
                    <div
                      className={`text-[11px] font-semibold ${
                        activeStep === "bom"
                          ? "text-blue-100"
                          : bomDirty
                            ? "text-amber-600"
                            : "text-slate-400"
                      }`}
                    >
                      {bomDirty
                        ? "Chạm để cập nhật BOM"
                        : `${bomItems.length} mặt hàng NPL`}
                    </div>
                  </div>
                </button>
              </div>

              {/* NỘI DUNG BƯỚC 1: CHỌN PO / MÀU / SIZE THEO THẺ NHÓM (KHÔNG CẦN CUỘN NGANG) */}
              {activeStep === "size" && (
                <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
                  {/* THANH LỌC MÀU & CÔNG CỤ NHANH */}
                  <div className="space-y-2.5 border-b border-slate-100 bg-slate-50/70 p-3.5 sm:px-5">
                    {/* PILLS CHỌN MÀU CUỘN NGANG */}
                    <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
                      <button
                        type="button"
                        onClick={() => setColorFilter("ALL")}
                        className={`min-h-[40px] shrink-0 touch-manipulation rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                          colorFilter === "ALL"
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        Tất cả màu ({sizeRows.length})
                      </button>
                      {distinctColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleSelectOnlyColor(c)}
                          className={`min-h-[40px] shrink-0 touch-manipulation rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                            colorFilter === c
                              ? "bg-egmf-primary text-white shadow-2xs"
                              : "border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          Chỉ đặt màu {c}
                        </button>
                      ))}
                    </div>

                    {/* NÚT THAO TÁC NHANH */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAllVisible(true)}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                        >
                          <CheckSquare
                            size={15}
                            className="text-egmf-primary"
                          />
                          <span>Chọn tất cả</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAllVisible(false)}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                        >
                          <Square size={15} className="text-slate-400" />
                          <span>Bỏ chọn</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetPlannedQty}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                        >
                          <RotateCcw size={14} className="text-slate-500" />
                          <span>Đặt đủ SL Kế hoạch</span>
                        </button>
                      </div>

                      <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                        Tổng chọn: {totalSelectedQty.toLocaleString("vi-VN")} SP
                      </span>
                    </div>
                  </div>

                  {/* DANH SÁCH THẺ NHÓM PO + MÀU */}
                  <div className="space-y-3.5 p-3 sm:p-5">
                    {groupedPoColors.map((group) => {
                      const allChecked = group.rows.every((r) => r.checked);
                      const groupSum = group.rows
                        .filter((r) => r.checked)
                        .reduce((s, r) => s + Number(r.SoLuongDat || 0), 0);

                      return (
                        <div
                          key={group.key}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50"
                        >
                          {/* HEADER NHÓM PO + MÀU */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3.5 py-2.5 sm:px-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleGroup(group.rows, !allChecked)
                              }
                              className="flex min-h-[40px] touch-manipulation items-center gap-2.5 text-left"
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                                  allChecked
                                    ? "border-egmf-primary bg-egmf-primary text-white"
                                    : "border-slate-300 bg-white text-transparent"
                                }`}
                              >
                                <Check size={15} strokeWidth={3} />
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-sm font-extrabold text-slate-900">
                                    PO: {group.poNo || "—"}
                                  </span>
                                  <span className="rounded-lg bg-egmf-primary-tint px-2 py-0.5 text-xs font-extrabold text-egmf-primary-strong">
                                    Màu: {group.tenMau || "—"}
                                  </span>
                                </div>
                                {(group.lotVaiChinh || group.lotVaiLot) && (
                                  <div className="mt-0.5 text-[11px] text-slate-500">
                                    {group.lotVaiChinh && (
                                      <span className="mr-2">
                                        Lot VC:{" "}
                                        <strong className="text-slate-700">
                                          {group.lotVaiChinh}
                                        </strong>
                                      </span>
                                    )}
                                    {group.lotVaiLot && (
                                      <span>
                                        Lot VL:{" "}
                                        <strong className="text-slate-700">
                                          {group.lotVaiLot}
                                        </strong>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>

                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                              {groupSum.toLocaleString("vi-VN")} SP
                            </span>
                          </div>

                          {/* LƯỚI CÁC CỠ (SIZE) TRONG NHÓM */}
                          <div className="grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:p-3">
                            {group.rows.map((row) => (
                              <div
                                key={row.ChiTietLSXId}
                                className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition ${
                                  row.checked
                                    ? "border-egmf-primary/40 bg-white shadow-2xs"
                                    : "border-slate-200/70 bg-slate-100/70 opacity-65"
                                }`}
                              >
                                {/* BÊN TRÁI: CHECKBOX + TÊN CỠ + SL KẾ HOẠCH */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleRow(row.ChiTietLSXId)
                                  }
                                  className="flex min-h-[44px] min-w-0 flex-1 touch-manipulation items-center gap-2.5 text-left"
                                >
                                  <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                                      row.checked
                                        ? "border-egmf-primary bg-egmf-primary text-white"
                                        : "border-slate-300 bg-white text-transparent"
                                    }`}
                                  >
                                    <Check size={14} strokeWidth={3} />
                                  </span>
                                  <div className="min-w-0">
                                    <div className="text-sm font-extrabold text-slate-900">
                                      Cỡ {row.TenSize}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500">
                                      KH:{" "}
                                      {Number(row.SoLuong || 0).toLocaleString(
                                        "vi-VN",
                                      )}{" "}
                                      SP
                                    </div>
                                  </div>
                                </button>

                                {/* BÊN PHẢI: STEPPER [-] [SL ĐẶT] [+] DỄ BẤM TRÊN CẢM ỨNG */}
                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={!row.checked}
                                    onClick={() =>
                                      handleStepRowQty(row.ChiTietLSXId, -10)
                                    }
                                    className="flex h-10 w-9 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 active:scale-95 disabled:opacity-40"
                                    aria-label="Giảm số lượng"
                                  >
                                    <Minus size={15} />
                                  </button>

                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    disabled={!row.checked}
                                    value={row.SoLuongDat}
                                    onChange={(e) =>
                                      handleChangeRowQty(
                                        row.ChiTietLSXId,
                                        e.target.value,
                                      )
                                    }
                                    className="h-10 w-20 rounded-lg border border-slate-300 bg-white px-1.5 text-center text-base font-extrabold text-egmf-primary outline-none focus:border-egmf-primary disabled:bg-slate-100 disabled:text-slate-400"
                                  />

                                  <button
                                    type="button"
                                    disabled={!row.checked}
                                    onClick={() =>
                                      handleStepRowQty(row.ChiTietLSXId, 10)
                                    }
                                    className="flex h-10 w-9 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 active:scale-95 disabled:opacity-40"
                                    aria-label="Tăng số lượng"
                                  >
                                    <Plus size={15} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* NỘI DUNG BƯỚC 2: DANH SÁCH VẬT TƯ ĐỊNH MỨC (BOM) DẠNG THẺ TOUCH TRÊN MOBILE/TABLET */}
              {activeStep === "bom" && (
                <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 px-3.5 py-3 sm:px-5 sm:py-3.5">
                    <div>
                      <h3 className="text-[15px] font-extrabold text-slate-900 sm:text-base">
                        Danh sách Vật tư yêu cầu ({bomItems.length} mặt hàng)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tự động tính từ Bảng Định Mức (BCD) • Chạm để sửa SL yêu
                        cầu trước khi gửi Kho
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => runCalculateBom(sizeRows, loaiDatHang)}
                        disabled={calculating}
                        className="inline-flex min-h-[42px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 active:scale-95 hover:border-egmf-primary hover:text-egmf-primary"
                      >
                        <Calculator size={15} />
                        <span>Tính lại BOM</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddManualBomRow}
                        className="inline-flex min-h-[42px] touch-manipulation items-center gap-1.5 rounded-xl border border-egmf-primary bg-egmf-primary-tint px-3 py-2 text-xs font-extrabold text-egmf-primary-strong active:scale-95 hover:bg-egmf-primary hover:text-white"
                      >
                        <Plus size={16} />
                        <span>Thêm vật tư</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5">
                    {calculating ? (
                      <div className="flex min-h-48 items-center justify-center">
                        <Spin size="large" />
                      </div>
                    ) : bomItems.length === 0 ? (
                      <div className="py-10">
                        <Empty description="Chưa có vật tư nào. Hãy kiểm tra lại cỡ/màu ở Bước 1 hoặc bấm 'Thêm vật tư'" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {bomItems.map((item, idx) => (
                          <article
                            key={item._rowKey}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-egmf-primary/50"
                          >
                            <div>
                              {/* DÒNG ĐẦU: STT + MÃ VẬT TƯ + ĐVT + NÚT XÓA */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-egmf-primary-tint text-xs font-extrabold text-egmf-primary-strong">
                                    {idx + 1}
                                  </span>

                                  {item.isManual ? (
                                    <input
                                      type="text"
                                      value={item.MaVatTu}
                                      onChange={(e) =>
                                        handleManualFieldChange(
                                          item._rowKey,
                                          "MaVatTu",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Nhập mã vật tư..."
                                      className="h-10 w-full rounded-xl border border-slate-300 px-3 text-base font-bold text-slate-900 outline-none focus:border-egmf-primary"
                                    />
                                  ) : (
                                    <div className="min-w-0">
                                      <div className="truncate text-[15px] font-extrabold text-slate-900">
                                        {item.MaVatTu}
                                      </div>
                                      {item.MaChungLoai && (
                                        <div className="text-[11px] font-semibold text-slate-400">
                                          Chủng loại: {item.MaChungLoai}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5">
                                  {item.isManual ? (
                                    <input
                                      type="text"
                                      value={item.DVT}
                                      onChange={(e) =>
                                        handleManualFieldChange(
                                          item._rowKey,
                                          "DVT",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="ĐVT"
                                      className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-center text-sm font-bold"
                                    />
                                  ) : (
                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                                      {item.DVT || "—"}
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveBomRow(item._rowKey)
                                    }
                                    className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-xl text-rose-500 active:scale-95 hover:bg-rose-50"
                                    title="Xóa vật tư này"
                                  >
                                    <Trash2 size={17} />
                                  </button>
                                </div>
                              </div>

                              {/* TÊN / DIỄN GIẢI VẬT TƯ */}
                              <div className="mt-2">
                                {item.isManual ? (
                                  <input
                                    type="text"
                                    value={item.TenVatTu}
                                    onChange={(e) =>
                                      handleManualFieldChange(
                                        item._rowKey,
                                        "TenVatTu",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Nhập tên / diễn giải vật tư..."
                                    className="h-10 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-800 outline-none focus:border-egmf-primary"
                                  />
                                ) : (
                                  <>
                                    <p className="text-xs font-semibold leading-relaxed text-slate-700 sm:text-sm">
                                      {item.TenVatTu}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                                      {item.MaMau && (
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                                          Màu NPL: {item.MaMau}
                                        </span>
                                      )}
                                      {item.CodeMauSP && (
                                        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                                          Màu SP: {item.CodeMauSP}
                                        </span>
                                      )}
                                      {item.Size && (
                                        <span className="rounded-md bg-purple-50 px-2 py-0.5 font-bold text-purple-700">
                                          Cỡ: {item.Size}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* CÔNG THỨC ĐỊNH MỨC × SL SP */}
                              {!item.isManual && (
                                <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                                  <span>
                                    Định mức:{" "}
                                    <strong className="text-slate-800">
                                      {Number(
                                        item.DinhMuc || 0,
                                      ).toLocaleString("vi-VN", {
                                        maximumFractionDigits: 4,
                                      })}
                                    </strong>
                                  </span>
                                  <span>×</span>
                                  <span>
                                    SL SP:{" "}
                                    <strong className="text-slate-800">
                                      {Number(
                                        item.SoLuongSanPham || 0,
                                      ).toLocaleString("vi-VN")}
                                    </strong>
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Ô NHẬP SỐ LƯỢNG YÊU CẦU & GHI CHÚ (CẢM ỨNG LỚN 48PX) */}
                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-xs font-extrabold text-slate-700">
                                  SL Yêu cầu ({item.DVT || "ĐVT"}):
                                </label>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStepBomQty(item._rowKey, -1)
                                    }
                                    className="flex h-11 w-10 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 active:scale-95"
                                    aria-label="Giảm 1"
                                  >
                                    <Minus size={16} />
                                  </button>

                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min={0}
                                    value={item.SoLuongYeuCau}
                                    onChange={(e) =>
                                      handleBomQtyChange(
                                        item._rowKey,
                                        e.target.value,
                                      )
                                    }
                                    className="h-11 w-28 rounded-xl border border-egmf-primary/60 bg-blue-50/40 px-2.5 text-center text-base font-extrabold text-egmf-primary outline-none focus:border-egmf-primary focus:bg-white sm:w-32"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStepBomQty(item._rowKey, 1)
                                    }
                                    className="flex h-11 w-10 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 active:scale-95"
                                    aria-label="Tăng 1"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={item.GhiChu || ""}
                                onChange={(e) =>
                                  handleBomNoteChange(
                                    item._rowKey,
                                    e.target.value,
                                  )
                                }
                                placeholder="Ghi chú dòng vật tư (nếu có)..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-700 outline-none focus:border-egmf-primary focus:bg-white"
                              />
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 3. THANH HÀNH ĐỘNG CỐ ĐỊNH PHÍA DƯỚI (STICKY ACTION BAR) */}
              <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-md md:bottom-3 sm:p-4">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center justify-between text-xs sm:block sm:text-sm">
                    <span className="font-semibold text-slate-500">
                      Đã chọn:{" "}
                      <strong className="font-extrabold text-slate-900">
                        {totalSelectedQty.toLocaleString("vi-VN")} SP
                      </strong>
                    </span>
                    <span className="mx-2 hidden text-slate-300 sm:inline">
                      •
                    </span>
                    <span className="font-semibold text-slate-500">
                      Nhu cầu:{" "}
                      <strong className="font-extrabold text-egmf-primary">
                        {bomItems.length} mặt hàng NPL
                      </strong>
                    </span>
                  </div>

                  {activeStep === "size" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGoToBomStep}
                        disabled={calculating || totalSelectedQty <= 0}
                        className="flex min-h-[48px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50 sm:flex-initial sm:text-base"
                      >
                        <span>
                          {calculating
                            ? "Đang tính định mức..."
                            : "Tiếp tục: Xem Vật tư (BOM)"}
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep("size")}
                        className="flex min-h-[48px] shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-extrabold text-slate-700 active:scale-95 sm:text-sm"
                      >
                        <ArrowLeft size={16} />
                        <span>Sửa Cỡ/SL</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitOrder}
                        disabled={submitting || bomItems.length === 0}
                        className={`flex min-h-[48px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.99] disabled:opacity-50 sm:flex-initial sm:text-base ${
                          isCat
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-amber-600 hover:bg-amber-700"
                        }`}
                      >
                        <Send size={18} className="shrink-0" />
                        <span className="truncate">
                          {submitting
                            ? "Đang gửi đơn..."
                            : isCat
                              ? "Gửi Đơn Nhà Cắt (NL)"
                              : "Gửi Đơn Nhà May (PL)"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
