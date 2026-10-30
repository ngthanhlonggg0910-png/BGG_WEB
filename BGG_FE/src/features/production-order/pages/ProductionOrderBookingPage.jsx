import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Calculator,
  Check,
  CheckCircle2,
  CheckSquare,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Scissors,
  Send,
  Shirt,
  SlidersHorizontal,
  Square,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { App as AntApp, Empty, Modal, Spin, message } from "antd";
import dayjs from "dayjs";

import "../order-mobile.css";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentProfile } from "../../../shared/auth/session";
import {
  calculateBomMaterial,
  cancelMaterialOrderFromLsx,
  createMaterialOrderFromLsx,
  getProductionOrderDetail,
} from "../api/productionOrderAPI";

function normalizeSearchText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

function isNguyenLieuItem(loaiNPL) {
  const s = String(loaiNPL || "")
    .trim()
    .toUpperCase();
  return (
    s.includes("NGUYÊN LIỆU") ||
    s.includes("NGUYEN LIEU") ||
    s.includes("VẢI") ||
    s.includes("VAI") ||
    s.includes("MEX")
  );
}

function canCancelOrder(od) {
  const trangThai = String(od?.TrangThai || "")
    .trim()
    .toLowerCase();
  const tinhTrangPsh = String(od?.TinhTrangPSH || "")
    .trim()
    .toLowerCase();
  if (trangThai === "dahuy" || trangThai === "hoanthanh") return false;
  if (tinhTrangPsh === "hoanthanh" || tinhTrangPsh === "dangthuchien")
    return false;
  return true;
}

function getOrderStatusChip(od) {
  const trangThai = String(od?.TrangThai || "")
    .trim()
    .toLowerCase();
  const tinhTrangPsh = String(od?.TinhTrangPSH || "")
    .trim()
    .toLowerCase();

  if (trangThai === "dahuy") {
    return {
      text: "Đã hủy",
      cls: "bg-rose-50 text-rose-600 border-rose-200 line-through",
    };
  }
  if (trangThai === "hoanthanh" || tinhTrangPsh === "hoanthanh") {
    return {
      text: od?.MaSoPhieuSoan
        ? `Đã xuất (${od.MaSoPhieuSoan})`
        : "Đã hoàn tất xuất kho",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (tinhTrangPsh === "dangthuchien") {
    return {
      text: od?.MaSoPhieuSoan
        ? `Đang quét (${od.MaSoPhieuSoan})`
        : "Kho đang quét soạn",
      cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  }
  if (od?.PhieuSoanHangId && tinhTrangPsh === "moitao") {
    return {
      text: od?.MaSoPhieuSoan
        ? `PSH: ${od.MaSoPhieuSoan} (Chưa quét)`
        : "Đã tạo PSH (Chưa quét)",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  return {
    text: "Chờ Kho tạo PSH",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

export default function ProductionOrderBookingPage() {
  const navigate = useNavigate();
  const { modal } = AntApp.useApp();
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
  const [cancellingId, setCancellingId] = useState(null);

  // Bước thao tác trên Mobile & Tablet: "size" (Bước 1) | "bom" (Bước 2)
  const [activeStep, setActiveStep] = useState("size");
  // Đánh dấu khi người dùng đổi chọn cỡ / số lượng cần tính lại BOM
  const [bomDirty, setBomDirty] = useState(false);
  // Mở rộng / thu gọn form thông tin phiếu trên mobile
  const [infoExpanded, setInfoExpanded] = useState(false);

  const [lsxHeader, setLsxHeader] = useState(location.state?.lsx || null);
  const [sizeRows, setSizeRows] = useState([]);
  const [existingOrders, setExistingOrders] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Thông tin đơn đặt hàng ("ALL" | "NguyenLieu" | "PhuLieu" đồng bộ với Desktop)
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

  // Danh sách vật tư BOM (có thuộc tính checked giống cột Chon trên Desktop)
  const [bomItems, setBomItems] = useState([]);

  // Tìm kiếm và bộ lọc nhanh NPL (Nguyên Phụ Liệu) ở Bước 2
  const [bomSearchKeyword, setBomSearchKeyword] = useState("");
  const [bomCategoryFilter, setBomCategoryFilter] = useState("ALL"); // "ALL" | "NGUYEN_LIEU" | "PHU_LIEU"
  const [bomStatusFilter, setBomStatusFilter] = useState("ALL"); // "ALL" | "CHECKED" | "UNCHECKED"
  // Tìm kiếm nhanh cỡ/màu ở Bước 1
  const [sizeKeyword, setSizeKeyword] = useState("");

  // Hàm tính BOM
  const runCalculateBom = async (rowsToCalc, targetLoai, currentLot) => {
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
      setBomDirty(true);
      const res = await calculateBomMaterial({
        lsxId,
        loaiDatHang: targetLoai,
        ghiChuLot: currentLot ?? ghiChuLot,
        selectedRows: selected,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      // Khi lọc riêng Nhà Cắt (NguyenLieu) hoặc Nhà May (PhuLieu) -> chọn sẵn để thuận tiện thao tác;
      // Khi chọn Tất cả (ALL) -> để người dùng chủ động tích chọn (hoặc bấm nút Chọn Nguyên liệu / Phụ liệu) giống Desktop
      const defaultChecked = targetLoai !== "ALL";
      setBomItems(
        list.map((it, idx) => ({
          ...it,
          checked: defaultChecked,
          GhiChu: it.GhiChuLot || it.GhiChu || currentLot || ghiChuLot || "",
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
          loaiDatHang === "PhuLieu"
            ? header.NgayVaoChuyen
            : header.NgayCanMauCat || header.NgayVaoChuyen;
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

      // Tính lot tự động ban đầu giống Desktop (VC: ... | VL: ...)
      const lotChinhSet = new Set();
      const lotLotSet = new Set();
      mappedRows.forEach((r) => {
        if (r.LotVaiChinh && String(r.LotVaiChinh).trim()) {
          lotChinhSet.add(String(r.LotVaiChinh).trim());
        }
        if (r.LotVaiLot && String(r.LotVaiLot).trim()) {
          lotLotSet.add(String(r.LotVaiLot).trim());
        }
      });
      const lotParts = [];
      if (lotChinhSet.size > 0)
        lotParts.push(`VC: ${Array.from(lotChinhSet).join(", ")}`);
      if (lotLotSet.size > 0)
        lotParts.push(`VL: ${Array.from(lotLotSet).join(", ")}`);
      const initialLot = lotParts.join(" | ");
      if (!lotEditedManually) {
        setGhiChuLot(initialLot);
      }

      await runCalculateBom(mappedRows, loaiDatHang, initialLot);
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

  // Tự động tổng hợp Ghi chú Lot từ các dòng đã chọn (đồng bộ chuẩn Desktop: VC: ... | VL: ...)
  useEffect(() => {
    if (lotEditedManually) return;
    const lotChinhSet = new Set();
    const lotLotSet = new Set();
    sizeRows
      .filter((r) => r.checked && Number(r.SoLuongDat) > 0)
      .forEach((r) => {
        if (r.LotVaiChinh && String(r.LotVaiChinh).trim()) {
          lotChinhSet.add(String(r.LotVaiChinh).trim());
        }
        if (r.LotVaiLot && String(r.LotVaiLot).trim()) {
          lotLotSet.add(String(r.LotVaiLot).trim());
        }
      });
    const lotParts = [];
    if (lotChinhSet.size > 0)
      lotParts.push(`VC: ${Array.from(lotChinhSet).join(", ")}`);
    if (lotLotSet.size > 0)
      lotParts.push(`VL: ${Array.from(lotLotSet).join(", ")}`);
    setGhiChuLot(lotParts.join(" | "));
  }, [sizeRows, lotEditedManually]);

  // Đổi bộ phận đặt hàng (Nhà cắt / Nhà may / Tất cả NL & PL)
  const handleSwitchLoaiDatHang = async (newLoai) => {
    if (newLoai === loaiDatHang) return;
    setLoaiDatHang(newLoai);
    if (lsxHeader) {
      const targetDate =
        newLoai === "PhuLieu"
          ? lsxHeader.NgayVaoChuyen
          : lsxHeader.NgayCanMauCat || lsxHeader.NgayVaoChuyen;
      if (targetDate && dayjs(targetDate).isValid()) {
        setNgayCanGiao(dayjs(targetDate).format("YYYY-MM-DD"));
      }
    }
    await runCalculateBom(sizeRows, newLoai, ghiChuLot);
  };

  // Chuyển sang Bước 2 (Vật tư BOM) -> tự động tính lại BOM nếu có thay đổi ở Bước 1
  const handleGoToBomStep = async () => {
    if (calculating || submitting || selectedSizeCount === 0) return;
    setActiveStep("bom");
    if (bomDirty) {
      await runCalculateBom(sizeRows, loaiDatHang, ghiChuLot);
    }
  };

  // Danh sách các màu trong LSX
  const distinctColors = useMemo(() => {
    return Array.from(new Set(sizeRows.map((r) => r.TenMau).filter(Boolean)));
  }, [sizeRows]);

  const visibleSizeRows = useMemo(() => {
    let rows = sizeRows;
    if (colorFilter !== "ALL") {
      rows = rows.filter((r) => r.TenMau === colorFilter);
    }
    const q = normalizeSearchText(sizeKeyword);
    if (!q) return rows;
    return rows.filter((r) => {
      const po = normalizeSearchText(r.PONo);
      const mau = normalizeSearchText(r.TenMau);
      const codeMau = normalizeSearchText(r.CodeMau);
      const size = normalizeSearchText(r.TenSize);
      return (
        po.includes(q) ||
        mau.includes(q) ||
        codeMau.includes(q) ||
        size.includes(q)
      );
    });
  }, [sizeRows, colorFilter, sizeKeyword]);

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

  const checkedBomItems = useMemo(() => {
    return bomItems.filter((it) => it.checked && Number(it.SoLuongYeuCau) > 0);
  }, [bomItems]);

  const checkedNlCount = useMemo(() => {
    return checkedBomItems.filter((it) => isNguyenLieuItem(it.LoaiNPL)).length;
  }, [checkedBomItems]);

  const checkedPlCount = useMemo(() => {
    return checkedBomItems.filter((it) => !isNguyenLieuItem(it.LoaiNPL)).length;
  }, [checkedBomItems]);

  const countNlTotal = useMemo(() => {
    return bomItems.filter((it) => isNguyenLieuItem(it.LoaiNPL)).length;
  }, [bomItems]);

  const countPlTotal = useMemo(() => {
    return bomItems.filter((it) => !isNguyenLieuItem(it.LoaiNPL)).length;
  }, [bomItems]);

  const visibleBomItems = useMemo(() => {
    const q = normalizeSearchText(bomSearchKeyword);
    return bomItems.filter((item) => {
      // 1. Lọc theo nhóm NPL (Nguyên liệu / Phụ liệu)
      if (bomCategoryFilter === "NGUYEN_LIEU" && !isNguyenLieuItem(item.LoaiNPL)) {
        return false;
      }
      if (bomCategoryFilter === "PHU_LIEU" && isNguyenLieuItem(item.LoaiNPL)) {
        return false;
      }

      // 2. Lọc theo trạng thái đã tích chọn hay chưa
      if (bomStatusFilter === "CHECKED" && !item.checked) {
        return false;
      }
      if (bomStatusFilter === "UNCHECKED" && item.checked) {
        return false;
      }

      // 3. Tìm kiếm theo từ khóa (Mã NPL, Tên NPL, Loại NPL, Màu SP, Cỡ, ĐVT, Ghi chú)
      if (!q) return true;

      const ma = normalizeSearchText(item.MaVatTu);
      const ten = normalizeSearchText(item.TenVatTu);
      const loai = normalizeSearchText(item.LoaiNPL);
      const mau = normalizeSearchText(item.CodeMauSP);
      const size = normalizeSearchText(item.Size);
      const dvt = normalizeSearchText(item.DVT);
      const ghiChu = normalizeSearchText(item.GhiChu);

      return (
        ma.includes(q) ||
        ten.includes(q) ||
        loai.includes(q) ||
        mau.includes(q) ||
        size.includes(q) ||
        dvt.includes(q) ||
        ghiChu.includes(q)
      );
    });
  }, [bomItems, bomSearchKeyword, bomCategoryFilter, bomStatusFilter]);

  // Chọn hoặc bỏ chọn toàn bộ các mục NPL đang hiển thị trong bộ lọc tìm kiếm
  const handleToggleAllVisibleBom = (checked) => {
    const visibleRowKeys = new Set(visibleBomItems.map((it) => it._rowKey));
    setBomItems((prev) =>
      prev.map((it) =>
        visibleRowKeys.has(it._rowKey) ? { ...it, checked } : it,
      ),
    );
  };

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
    await runCalculateBom(updated, loaiDatHang, ghiChuLot);
  };

  // Thao tác chọn vật tư BOM giống hệt Desktop (Chọn tất cả / Chọn Nguyên liệu / Chọn Phụ liệu / Bỏ chọn)
  const handleToggleBomItem = (rowKey) => {
    setBomItems((prev) =>
      prev.map((it) =>
        it._rowKey === rowKey ? { ...it, checked: !it.checked } : it,
      ),
    );
  };

  const handleSelectBomByType = (mode) => {
    setBomItems((prev) =>
      prev.map((it) => {
        if (mode === "ALL") return { ...it, checked: true };
        if (mode === "NONE") return { ...it, checked: false };
        if (mode === "NGUYEN_LIEU")
          return { ...it, checked: isNguyenLieuItem(it.LoaiNPL) };
        if (mode === "PHU_LIEU")
          return { ...it, checked: !isNguyenLieuItem(it.LoaiNPL) };
        return it;
      }),
    );
  };

  const handleBomQtyChange = (rowKey, val) => {
    setBomItems((prev) =>
      prev.map((it) =>
        it._rowKey === rowKey
          ? {
              ...it,
              SoLuongYeuCau: val,
              checked: Number(val) > 0 ? true : it.checked,
            }
          : it,
      ),
    );
  };

  const handleStepBomQty = (rowKey, delta) => {
    setBomItems((prev) =>
      prev.map((it) => {
        if (it._rowKey !== rowKey) return it;
        const cur = Number(it.SoLuongYeuCau || 0);
        const next = Math.max(0, Math.round((cur + delta) * 10000) / 10000);
        return { ...it, SoLuongYeuCau: next, checked: next > 0 };
      }),
    );
  };

  const handleBomNoteChange = (rowKey, val) => {
    setBomItems((prev) =>
      prev.map((it) => (it._rowKey === rowKey ? { ...it, GhiChu: val } : it)),
    );
  };

  // Hủy đơn đặt hàng đã gửi (khi Kho chưa quét/xuất) giống Desktop
  const handleCancelOrder = (od) => {
    if (!canCancelOrder(od)) {
      message.warning(
        `Đơn [${od.SoDonDatHang}] đang ở trạng thái "${od.TenTrangThai || od.TrangThai}", không thể hủy!`,
      );
      return;
    }

    const returnToHistory = historyOpen;
    setHistoryOpen(false);

    modal.confirm({

      width: 560,

      centered: true,

      className: "egmf-confirm",
      afterClose: () => { if (returnToHistory) setHistoryOpen(true); },
      title: `Hủy đơn đặt hàng [${od.SoDonDatHang}]?`,
      content:
        "Đơn đặt hàng sẽ chuyển sang trạng thái Đã hủy (nếu có Phiếu soạn ở trạng thái Mới tạo chưa quét cũng sẽ tự động hủy).",
      okText: "Xác nhận hủy đơn",
      okButtonProps: { danger: true },
      cancelText: "Đóng",
      onOk: async () => {
        try {
          setCancellingId(od.DonDatHangId);
          await cancelMaterialOrderFromLsx(
            od.DonDatHangId,
            nguoiDat.trim() || defaultNguoiDat,
          );
          message.success(
            `Đã hủy đơn đặt hàng [${od.SoDonDatHang}] thành công!`,
          );
          await loadLsxDetail();
        } catch (err) {
          message.error(err?.message || "Không thể hủy đơn đặt hàng");
        } finally {
          setCancellingId(null);
        }
      },
    });
  };

  // Gửi đơn đặt hàng xuống Kho (tự động tách đơn Kho Vải & Kho Phụ Liệu nếu chọn cả 2 loại giống Desktop)
  const handleSubmitOrder = async () => {
    if (submitting || calculating) return;
    if (bomDirty) {
      message.warning("Số lượng đã thay đổi. Vui lòng tính lại vật tư trước khi gửi.");
      return;
    }
    if (selectedSizeCount === 0) {
      message.warning("Vui lòng tích chọn ít nhất 1 cỡ có Số lượng đặt > 0!");
      return;
    }

    if (checkedBomItems.length === 0) {
      message.warning(
        "Vui lòng tích chọn ít nhất 1 dòng vật tư có Số lượng yêu cầu > 0 để gửi sang Kho!",
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
        items: checkedBomItems.map((it) => ({
          vtId: it.VTId ? Number(it.VTId) : 0,
          maVatTu: String(it.MaVatTu || "").trim(),
          tenVatTu: String(it.TenVatTu || "").trim(),
          dvt: String(it.DVT || "").trim(),
          loaiNPL: String(
            it.LoaiNPL ||
              (loaiDatHang === "PhuLieu" ? "PHỤ LIỆU" : "NGUYÊN LIỆU"),
          ).trim(),
          dinhMuc: Number(it.DinhMuc || 0),
          soLuongSanPham: Number(it.SoLuongSanPham || totalSelectedQty || 0),
          soLuongYeuCau: Number(it.SoLuongYeuCau || 0),
          ghiChuLot: String(it.GhiChu || ghiChuLot || "").trim(),
          ghiChu: String(it.GhiChu || ghiChuLot || "").trim(),
        })),
      };

      const res = await createMaterialOrderFromLsx(payload);
      const createdCode = res?.data?.soDonDatHang || "";
      const createdList = Array.isArray(res?.data?.createdOrders)
        ? res.data.createdOrders
        : [];

      const boPhanText =
        loaiDatHang === "NguyenLieu"
          ? "Nhà Cắt (Kho Vải)"
          : loaiDatHang === "PhuLieu"
            ? "Nhà May (Kho Phụ Liệu)"
            : "Tất cả (Kho Vải & Kho Phụ Liệu)";

      let navigated = false;
      const handleBackOut = () => {
        if (navigated) return;
        navigated = true;
        const targetType =
          loaiDatHang && ["NguyenLieu", "PhuLieu"].includes(loaiDatHang)
            ? `&type=${loaiDatHang}`
            : "";
        navigate(`/production-orders?tab=ddh${targetType}`);
      };

      modal.success({
        width: 560,
        centered: true,
        className: "egmf-confirm",
        icon: (
          <span className="egmf-confirm-icon !bg-emerald-50 !text-emerald-600">
            <CheckCircle2 size={24} />
          </span>
        ),
        title: "Gửi đơn đặt hàng thành công!",
        content: (
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-slate-600">
              {createdList.length > 1
                ? `Đã tách và gửi thành công ${createdList.length} đơn đặt hàng sang Kho Vải & Kho Phụ Liệu.`
                : `Đơn đặt hàng đã được gửi thành công xuống Kho (chờ Thủ kho tạo Phiếu soạn).`}
            </p>
            <dl className="egmf-confirm-summary">
              <div>
                <dt>Mã đơn đặt</dt>
                <dd className="font-bold text-emerald-700">{createdCode || "—"}</dd>
              </div>
              <div>
                <dt>Lệnh sản xuất</dt>
                <dd>{lsxHeader?.SoLSX || "—"}</dd>
              </div>
              <div>
                <dt>Mã hàng</dt>
                <dd>{lsxHeader?.MaHang || "—"}</dd>
              </div>
              <div>
                <dt>Bộ phận đặt</dt>
                <dd>{boPhanText}</dd>
              </div>
              {ngayCanGiao && (
                <div>
                  <dt>Ngày cần giao</dt>
                  <dd>
                    {dayjs(ngayCanGiao).isValid()
                      ? dayjs(ngayCanGiao).format("DD/MM/YYYY")
                      : ngayCanGiao}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        ),
        okText: "Đồng ý",
        okButtonProps: {
          className: "bg-emerald-600 hover:bg-emerald-700 text-white font-bold",
        },
        onOk: handleBackOut,
        afterClose: handleBackOut,
      });
    } catch (err) {
      console.error("Lỗi tạo đơn đặt hàng LSX:", err);
      message.error(err?.message || "Không thể gửi đơn đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (!lsxId) {
    return (
      <MainLayout screenTitle="Đặt hàng vật tư từ LSX" headerBackTo="/production-orders">
        <div className="p-6">
          <Empty description="Chưa chọn Lệnh sản xuất" />
        </div>
      </MainLayout>
    );
  }

  const isCat = loaiDatHang === "NguyenLieu";
  const isMay = loaiDatHang === "PhuLieu";
  const isAll = loaiDatHang === "ALL";

  return (
    <MainLayout
      hideMobileNavigation
      headerBackTo="/production-orders"
      screenTitle={
        isCat
          ? "Nhà Cắt đặt Nguyên liệu (LSX)"
          : isMay
            ? "Nhà May đặt Phụ liệu (LSX)"
            : "Đặt hàng Vật tư Tổng hợp (LSX)"
      }
    >
      <div className="order-page order-booking min-h-full bg-egmf-surface p-2.5 sm:p-4 md:p-5">
        <div className="mx-auto max-w-6xl space-y-3 sm:space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-egmf-border bg-white">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* 1. THẺ THÔNG TIN LSX & CHUYỂN ĐỔI BỘ PHẬN (TỐI ƯU MOBILE / TABLET, ĐỒNG BỘ DESKTOP) */}
              <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-3.5 xl:flex-row xl:items-center xl:justify-between sm:px-5">
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
                        <span className="inline-flex items-center gap-1 rounded-md bg-egmf-primary-tint px-2 py-0.5 text-sm font-extrabold text-egmf-primary-strong">
                          <Layers size={13} />
                          {lsxHeader?.SoLSX}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-extrabold text-emerald-700">
                          Kế hoạch:{" "}
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

                  {/* CHUYỂN ĐỔI NHÀ CẮT / NHÀ MAY / TẤT CẢ (ĐỒNG BỘ VỚI DESKTOP) */}
                  <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSwitchLoaiDatHang("NguyenLieu")}
                      className={`flex min-h-[42px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-extrabold transition sm:px-3 sm:text-sm ${
                        isCat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Scissors size={14} className="shrink-0" />
                      <span>Nhà cắt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchLoaiDatHang("PhuLieu")}
                      className={`flex min-h-[42px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-extrabold transition sm:px-3 sm:text-sm ${
                        isMay
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Shirt size={14} className="shrink-0" />
                      <span>Nhà may</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchLoaiDatHang("ALL")}
                      className={`flex min-h-[42px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-extrabold transition sm:px-3 sm:text-sm ${
                        isAll
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Layers size={14} className="shrink-0" />
                      <span>Cả hai</span>
                    </button>
                  </div>
                </div>

                {/* THANH TÓM TẮT THÔNG TIN ĐƠN ĐẶT (CÓ THỂ THU GỌN/MỞ RỘNG TRÊN MOBILE ĐỂ TIẾT KIỆM DIỆN TÍCH) */}
                <div className="px-3.5 py-2.5 sm:px-5 sm:py-3">
                  <button
                    type="button"
                    aria-expanded={infoExpanded}
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
                          • Lot:{" "}
                          <strong className="text-slate-900">{ghiChuLot}</strong>
                        </span>
                      )}
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-sm font-bold text-egmf-primary shadow-2xs">
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
                        <label className="mb-1 block text-sm font-bold text-slate-600">
                          Bộ phận / Kho nhận đơn
                        </label>
                        <div
                          className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-sm font-bold ${
                            isCat
                              ? "border-blue-200 bg-blue-50 text-blue-800"
                              : isMay
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-slate-300 bg-slate-100 text-slate-800"
                          }`}
                        >
                          {isCat ? (
                            <>
                              <Scissors size={16} className="shrink-0" />
                              <span className="truncate">
                                Nhà cắt {lsxHeader?.NhaCat || ""} → Kho NL (NA)
                              </span>
                            </>
                          ) : isMay ? (
                            <>
                              <Shirt size={16} className="shrink-0" />
                              <span className="truncate">
                                Tổ may {lsxHeader?.ToMay || ""} → Kho PL (PA)
                              </span>
                            </>
                          ) : (
                            <>
                              <Layers size={16} className="shrink-0" />
                              <span className="truncate">
                                Tự tách đơn: Kho Vải (NA) & Kho PL (PA)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-bold text-slate-600">
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
                        <label className="mb-1 block text-sm font-bold text-slate-600">
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
                        <label className="mb-1 block text-sm font-bold text-slate-600">
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
                        <label className="mb-1 block text-sm font-bold text-slate-600">
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

                <div className="border-t border-slate-100 px-3.5 py-2.5 sm:px-5">
                  <button type="button" onClick={() => setHistoryOpen(true)} className="order-color-only" aria-haspopup="dialog">
                    Lịch sử đặt hàng ({existingOrders.length})
                  </button>
                </div>
              </section>

              {/* 2. THANH CHUYỂN BƯỚC (STEPPER) CHO MOBILE & TABLET */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-egmf-border bg-white p-1.5 shadow-egmf-card">
                <button
                  type="button"
                  onClick={() => setActiveStep("size")}
                  aria-current={activeStep === "size" ? "step" : undefined}
                  className={`flex min-h-[50px] touch-manipulation items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold transition-all sm:text-sm ${
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
                    <div className="truncate">Chọn số lượng</div>
                    <div
                      className={`text-xs font-semibold ${
                        activeStep === "size"
                          ? "text-blue-100"
                          : "text-slate-500"
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
                  disabled={calculating || submitting || selectedSizeCount === 0}
                  aria-current={activeStep === "bom" ? "step" : undefined}
                  className={`flex min-h-[50px] touch-manipulation items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold transition-all sm:text-sm ${
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
                    <div className="truncate">Kiểm tra vật tư</div>
                    <div
                      className={`text-xs font-semibold ${
                        activeStep === "bom"
                          ? "text-blue-100"
                          : bomDirty
                            ? "text-amber-600"
                            : "text-slate-500"
                      }`}
                    >
                      {bomDirty
                        ? "Cần cập nhật vật tư"
                        : `Đã chọn ${checkedBomItems.length}/${bomItems.length} vật tư`}
                    </div>
                  </div>
                </button>
              </div>

              {/* NỘI DUNG BƯỚC 1: CHỌN PO / MÀU / SIZE THEO THẺ NHÓM */}
              {activeStep === "size" && (
                <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
                  {/* THANH LỌC MÀU & CÔNG CỤ NHANH */}
                  <div className="space-y-2.5 border-b border-slate-100 bg-slate-50/70 p-3.5 sm:px-5">
                    <p className="text-sm text-slate-600">Đã chọn sẵn số lượng kế hoạch. Chỉ sửa nếu cần đặt ít hơn.</p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="relative flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-egmf-primary focus-within:ring-2 focus-within:ring-egmf-primary/15">
                        <Search size={17} className="shrink-0 text-slate-400" />
                        <input
                          type="text"
                          value={sizeKeyword}
                          onChange={(e) => setSizeKeyword(e.target.value)}
                          placeholder="Lọc theo PO, màu, cỡ..."
                          className="h-full w-full bg-transparent py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {sizeKeyword && (
                          <button
                            type="button"
                            onClick={() => setSizeKeyword("")}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                            aria-label="Xóa tìm kiếm"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <label className="order-filter-label !mb-0">
                        <select className="order-combobox" value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
                          <option value="ALL">Tất cả màu ({distinctColors.length})</option>
                          {distinctColors.map((color) => <option key={color} value={color}>{color}</option>)}
                        </select>
                      </label>
                    </div>

                    {colorFilter !== "ALL" && (
                      <button type="button" className="order-color-only" onClick={() => handleSelectOnlyColor(colorFilter)}>
                        Chỉ đặt màu {colorFilter} (bỏ các màu khác)
                      </button>
                    )}
                    {/* NÚT THAO TÁC NHANH */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAllVisible(true)}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 active:scale-95"
                        >
                          <CheckSquare
                            size={15}
                            className="text-egmf-primary"
                          />
                          <span>Chọn tất cả cỡ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAllVisible(false)}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 active:scale-95"
                        >
                          <Square size={15} className="text-slate-500" />
                          <span>Bỏ chọn</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetPlannedQty}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 active:scale-95"
                        >
                          <RotateCcw size={14} className="text-slate-500" />
                          <span>Đặt đủ SL Kế hoạch</span>
                        </button>
                      </div>

                      <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-700">
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
                                  <span className="rounded-lg bg-egmf-primary-tint px-2 py-0.5 text-sm font-extrabold text-egmf-primary-strong">
                                    Màu: {group.tenMau || "—"}
                                  </span>
                                </div>
                                {(group.lotVaiChinh || group.lotVaiLot) && (
                                  <div className="mt-0.5 text-xs text-slate-500">
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

                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-extrabold text-emerald-700">
                              {groupSum.toLocaleString("vi-VN")} SP
                            </span>
                          </div>

                          {/* LƯỚI CÁC CỠ (SIZE) TRONG NHÓM */}
                          <div className="order-size-grid grid grid-cols-1 gap-2 p-2.5 sm:p-3">
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
                                    <div className="text-xs font-medium text-slate-500">
                                      Kế hoạch:{" "}
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
                                      handleStepRowQty(row.ChiTietLSXId, -1)
                                    }
                                    className="flex h-10 w-9 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 active:scale-95 disabled:opacity-40"
                                    aria-label={`Giảm 1 sản phẩm cỡ ${row.TenSize}`}
                                  >
                                    <Minus size={15} />
                                  </button>

                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    disabled={!row.checked}
                                    aria-label={`Số lượng đặt cỡ ${row.TenSize}`}
                                    value={row.SoLuongDat}
                                    onChange={(e) =>
                                      handleChangeRowQty(
                                        row.ChiTietLSXId,
                                        e.target.value,
                                      )
                                    }
                                    className="h-10 w-20 rounded-lg border border-slate-300 bg-white px-1.5 text-center text-base font-extrabold text-egmf-primary outline-none focus:border-egmf-primary disabled:bg-slate-100 disabled:text-slate-500"
                                  />

                                  <button
                                    type="button"
                                    disabled={!row.checked}
                                    onClick={() =>
                                      handleStepRowQty(row.ChiTietLSXId, 1)
                                    }
                                    className="flex h-10 w-9 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 active:scale-95 disabled:opacity-40"
                                    aria-label={`Tăng 1 sản phẩm cỡ ${row.TenSize}`}
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

              {/* NỘI DUNG BƯỚC 2: DANH SÁCH VẬT TƯ ĐỊNH MỨC (BOM) CÓ CHECKBOX CHỌN NHƯ DESKTOP */}
              {activeStep === "bom" && (
                <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
                  <div className="space-y-3 border-b border-slate-100 bg-slate-50/70 px-3.5 py-3 sm:px-5 sm:py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div>
                        <h3 className="text-[15px] font-extrabold text-slate-900 sm:text-base">
                          Kiểm tra vật tư (Đã chọn{" "}
                          {checkedBomItems.length}/{bomItems.length} mặt hàng)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Số lượng đã được tính sẵn. Kiểm tra trước khi gửi kho.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          runCalculateBom(sizeRows, loaiDatHang, ghiChuLot)
                        }
                        disabled={calculating}
                        className="inline-flex min-h-[40px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 active:scale-95 hover:border-egmf-primary hover:text-egmf-primary"
                      >
                        <Calculator size={15} />
                        <span>Tính lại vật tư</span>
                      </button>
                    </div>

                    {/* THANH TÌM KIẾM NPL */}
                    <div className="relative flex min-h-[46px] w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 shadow-2xs focus-within:border-egmf-primary focus-within:ring-2 focus-within:ring-egmf-primary/15">
                      <Search size={18} className="shrink-0 text-slate-400" />
                      <input
                        type="text"
                        value={bomSearchKeyword}
                        onChange={(e) => setBomSearchKeyword(e.target.value)}
                        placeholder="Tìm kiếm NPL: mã vật tư, tên, loại, màu SP, cỡ..."
                        className="h-full w-full bg-transparent py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
                      />
                      {bomSearchKeyword && (
                        <button
                          type="button"
                          onClick={() => setBomSearchKeyword("")}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90"
                          aria-label="Xóa tìm kiếm"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* BỘ LỌC NHANH THEO NHÓM NPL VÀ TRẠNG THÁI */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Phân loại:</span>
                        <button
                          type="button"
                          onClick={() => setBomCategoryFilter("ALL")}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all active:scale-95 ${
                            bomCategoryFilter === "ALL"
                              ? "bg-slate-900 text-white shadow-2xs"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>Tất cả</span>
                          <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                            {bomItems.length}
                          </span>
                        </button>

                        {countNlTotal > 0 && (
                          <button
                            type="button"
                            onClick={() => setBomCategoryFilter("NGUYEN_LIEU")}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all active:scale-95 ${
                              bomCategoryFilter === "NGUYEN_LIEU"
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "border border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100"
                            }`}
                          >
                            <Scissors size={12} />
                            <span>Nguyên liệu</span>
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                              {countNlTotal}
                            </span>
                          </button>
                        )}

                        {countPlTotal > 0 && (
                          <button
                            type="button"
                            onClick={() => setBomCategoryFilter("PHU_LIEU")}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all active:scale-95 ${
                              bomCategoryFilter === "PHU_LIEU"
                                ? "bg-amber-600 text-white shadow-2xs"
                                : "border border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100"
                            }`}
                          >
                            <Shirt size={12} />
                            <span>Phụ liệu</span>
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                              {countPlTotal}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500">Trạng thái:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setBomStatusFilter((prev) =>
                              prev === "CHECKED" ? "ALL" : "CHECKED",
                            )
                          }
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all active:scale-95 ${
                            bomStatusFilter === "CHECKED"
                              ? "bg-emerald-700 text-white shadow-2xs"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                          <span>Đã chọn ({checkedBomItems.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* DÒNG THÔNG BÁO KẾT QUẢ ĐANG LỌC & THAO TÁC NHANH */}
                    {(bomSearchKeyword.trim() ||
                      bomCategoryFilter !== "ALL" ||
                      bomStatusFilter !== "ALL") && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50/80 px-3 py-2 text-xs text-blue-900">
                        <div className="flex items-center gap-1.5">
                          <Filter size={13} className="text-blue-600" />
                          <span>
                            Tìm thấy <strong>{visibleBomItems.length}</strong> /{" "}
                            {bomItems.length} NPL
                            {bomSearchKeyword.trim() && (
                              <span> cho từ khóa &ldquo;{bomSearchKeyword}&rdquo;</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {visibleBomItems.length > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleAllVisibleBom(true)}
                                className="rounded-md bg-white px-2 py-1 font-bold text-blue-700 shadow-2xs hover:bg-blue-100 active:scale-95"
                              >
                                Chọn mục đang lọc
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAllVisibleBom(false)}
                                className="rounded-md bg-white px-2 py-1 font-bold text-slate-600 shadow-2xs hover:bg-slate-100 active:scale-95"
                              >
                                Bỏ chọn mục đang lọc
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setBomSearchKeyword("");
                              setBomCategoryFilter("ALL");
                              setBomStatusFilter("ALL");
                            }}
                            className="rounded-md bg-blue-200/60 px-2 py-1 font-bold text-blue-800 hover:bg-blue-200 active:scale-95"
                          >
                            Xóa lọc
                          </button>
                        </div>
                      </div>
                    )}

                    {/* THANH NÚT CHỌN VẬT TƯ NHANH GIỐNG HỆT DESKTOP */}
                    <details>
                      <summary className="cursor-pointer py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
                        Thao tác chọn hàng loạt (Desktop)
                      </summary>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectBomByType("ALL")}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-700 active:scale-95 hover:border-egmf-primary"
                        >
                          <CheckSquare size={14} className="text-egmf-primary" />
                          <span>Chọn tất cả</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectBomByType("NGUYEN_LIEU")}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-700 active:scale-95 hover:bg-blue-100"
                        >
                          <Scissors size={14} />
                          <span>Chọn Nguyên liệu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectBomByType("PHU_LIEU")}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-extrabold text-amber-800 active:scale-95 hover:bg-amber-100"
                        >
                          <Shirt size={14} />
                          <span>Chọn Phụ liệu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectBomByType("NONE")}
                          className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 active:scale-95"
                        >
                          <Square size={14} className="text-slate-500" />
                          <span>Bỏ chọn</span>
                        </button>
                      </div>
                    </details>
                  </div>

                  <div className="p-3 sm:p-5">
                    {calculating ? (
                      <div className="flex min-h-48 items-center justify-center">
                        <Spin size="large" />
                      </div>
                    ) : bomItems.length === 0 ? (
                      <div className="py-10">
                        <Empty description="Không tìm thấy định mức vật tư (BCD) phù hợp cho PO/Màu/Cỡ đã chọn" />
                      </div>
                    ) : visibleBomItems.length === 0 ? (
                      <div className="py-12 text-center">
                        <Empty
                          description={
                            bomSearchKeyword.trim()
                              ? `Không tìm thấy NPL nào khớp với "${bomSearchKeyword}"`
                              : "Không tìm thấy NPL nào phù hợp bộ lọc đã chọn"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBomSearchKeyword("");
                            setBomCategoryFilter("ALL");
                            setBomStatusFilter("ALL");
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-egmf-primary hover:text-egmf-primary active:scale-95"
                        >
                          <RotateCcw size={14} />
                          <span>Đặt lại bộ lọc & tìm kiếm</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {visibleBomItems.map((item, idx) => {
                          const isNL = isNguyenLieuItem(item.LoaiNPL);
                          return (
                            <article
                              key={item._rowKey}
                              className={`flex flex-col justify-between rounded-2xl border p-3.5 transition ${
                                item.checked
                                  ? "border-egmf-primary/60 bg-white shadow-2xs"
                                  : "border-slate-200/80 bg-slate-50/70 opacity-70"
                              }`}
                            >
                              <div>
                                {/* DÒNG ĐẦU: CHECKBOX CHỌN + MÃ VẬT TƯ + NHÓM NPL + ĐVT */}
                                <div className="flex items-start justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleBomItem(item._rowKey)
                                    }
                                    className="flex min-w-0 flex-1 touch-manipulation items-start gap-2.5 text-left"
                                  >
                                    <span
                                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                                        item.checked
                                          ? "border-egmf-primary bg-egmf-primary text-white"
                                          : "border-slate-300 bg-white text-transparent"
                                      }`}
                                    >
                                      <Check size={14} strokeWidth={3} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-sm font-bold text-slate-500">
                                          #{idx + 1}
                                        </span>
                                        <span
                                          className={`rounded-md px-1.5 py-0.5 text-sm font-extrabold ${
                                            isNL
                                              ? "bg-blue-100 text-blue-800"
                                              : "bg-amber-100 text-amber-800"
                                          }`}
                                        >
                                          {item.LoaiNPL ||
                                            (isNL
                                              ? "NGUYÊN LIỆU"
                                              : "PHỤ LIỆU")}
                                        </span>
                                      </div>
                                      <div className="mt-0.5 truncate text-[15px] font-extrabold text-slate-900">
                                        {item.MaVatTu}
                                      </div>
                                    </div>
                                  </button>

                                  <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-extrabold text-slate-700">
                                    {item.DVT || "—"}
                                  </span>
                                </div>

                                {/* TÊN / DIỄN GIẢI VẬT TƯ */}
                                <div
                                  onClick={() =>
                                    handleToggleBomItem(item._rowKey)
                                  }
                                  className="mt-2 cursor-pointer"
                                >
                                  <p className="text-base font-semibold leading-relaxed text-slate-700">
                                    {item.TenVatTu}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
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
                                </div>

                                {/* CÔNG THỨC ĐỊNH MỨC × SL SP */}
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
                              </div>

                              {/* Ô NHẬP SỐ LƯỢNG YÊU CẦU & GHI CHÚ LOT */}
                              <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                                <div className="order-material-quantity flex items-center justify-between gap-2">
                                  <label className="text-sm font-extrabold text-slate-700">
                                    Số lượng đặt ({item.DVT || "ĐVT"}):
                                  </label>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={!item.checked}
                                      onClick={() =>
                                        handleStepBomQty(item._rowKey, -1)
                                      }
                                      className="flex h-11 w-10 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 active:scale-95 disabled:opacity-40"
                                      aria-label="Giảm 1"
                                    >
                                      <Minus size={16} />
                                    </button>

                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.01"
                                      min={0}
                                      disabled={!item.checked}
                                      aria-label={`Số lượng đặt vật tư ${item.MaVatTu}`}
                                      value={item.SoLuongYeuCau}
                                      onChange={(e) =>
                                        handleBomQtyChange(
                                          item._rowKey,
                                          e.target.value,
                                        )
                                      }
                                      className="h-11 w-28 rounded-xl border border-egmf-primary/60 bg-blue-50/40 px-2.5 text-center text-base font-extrabold text-egmf-primary outline-none focus:border-egmf-primary focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 sm:w-32"
                                    />

                                    <button
                                      type="button"
                                      disabled={!item.checked}
                                      onClick={() =>
                                        handleStepBomQty(item._rowKey, 1)
                                      }
                                      className="flex h-11 w-10 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 active:scale-95 disabled:opacity-40"
                                      aria-label="Tăng 1"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                </div>

                                <input
                                  type="text"
                                  disabled={!item.checked}
                                  aria-label={`Ghi chú vật tư ${item.MaVatTu}`}
                                  value={item.GhiChu || ""}
                                  onChange={(e) =>
                                    handleBomNoteChange(
                                      item._rowKey,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Ghi chú Lot / quy cách dòng vật tư..."
                                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-700 outline-none focus:border-egmf-primary focus:bg-white disabled:opacity-50"
                                />
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 3. THANH HÀNH ĐỘNG CỐ ĐỊNH PHÍA DƯỚI (STICKY ACTION BAR) */}
              <div className="order-action-bar">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 text-xs sm:text-sm">
                    <span className="font-semibold text-slate-500">
                      Đặt:{" "}
                      <strong className="font-extrabold text-slate-900">
                        {totalSelectedQty.toLocaleString("vi-VN")} SP
                      </strong>
                    </span>
                    <span className="hidden text-slate-300 sm:inline">•</span>
                    <span className="font-semibold text-slate-500">
                      Vật tư:{" "}
                      <strong className="font-extrabold text-egmf-primary">
                        {checkedBomItems.length}/{bomItems.length} mặt hàng
                      </strong>
                      {checkedNlCount > 0 && checkedPlCount > 0 && (
                        <span className="ml-1 text-sm font-bold text-emerald-700">
                          (Tự tách 2 đơn: {checkedNlCount} NL + {checkedPlCount}{" "}
                          PL)
                        </span>
                      )}
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
                            : "Tiếp tục"}
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep("size")}
                        className="flex min-h-[48px] shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-extrabold text-slate-700 active:scale-95 sm:text-sm"
                      >
                        <ArrowLeft size={16} />
                        <span>Quay lại</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitOrder}
                        disabled={submitting || calculating || bomDirty || selectedSizeCount === 0 || checkedBomItems.length === 0}
                        className={`flex min-h-[48px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.99] disabled:opacity-50 sm:flex-initial sm:text-base ${
                          isCat
                            ? "bg-blue-600 hover:bg-blue-700"
                            : isMay
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <Send size={18} className="shrink-0" />
                        <span className="truncate">
                          {submitting
                            ? "Đang gửi đơn..."
                            : `Gửi đơn (${checkedBomItems.length})`}
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
      <Modal
        title={`Lịch sử đặt hàng — ${lsxHeader?.SoLSX || ""}`}
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={<button type="button" className="order-color-only" onClick={() => setHistoryOpen(false)}>Đóng</button>}
        width={640}
        styles={{ body: { maxHeight: "65dvh", overflowY: "auto", padding: 16 }, header: { padding: "16px 48px 0 16px" }, footer: { padding: "0 16px 16px" } }}
      >
        <div className="order-page space-y-3">
          {existingOrders.length === 0 ? <Empty description="Chưa có đơn đặt hàng" /> : existingOrders.map((order) => {
            const status = getOrderStatusChip(order);
            return (
              <article key={order.DonDatHangId} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-base text-slate-900">{order.SoDonDatHang}</strong>
                  <span className={`rounded-full border px-2 py-1 text-sm ${status.cls}`}>{status.text}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {order.LoaiDatHang === "NguyenLieu" ? "Nhà cắt · Nguyên liệu" : "Nhà may · Phụ liệu"}
                </p>
                {order.NguoiDat && <p className="mt-1 text-sm text-slate-600">Người đặt: {order.NguoiDat}</p>}
                {order.NgayDat && dayjs(order.NgayDat).isValid() && <p className="mt-1 text-sm text-slate-600">Ngày đặt: {dayjs(order.NgayDat).format("DD/MM/YYYY HH:mm")}</p>}
                {canCancelOrder(order) && (
                  <button type="button" disabled={cancellingId === order.DonDatHangId} onClick={() => handleCancelOrder(order)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 disabled:opacity-50">
                    <Ban size={16} />{cancellingId === order.DonDatHangId ? "Đang hủy..." : "Hủy đơn"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </Modal>
    </MainLayout>
  );
}
