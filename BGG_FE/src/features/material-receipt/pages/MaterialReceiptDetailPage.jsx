import {
  Archive,
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Layers,
  Package,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  Square,
  Trash2,
  User,
  X,
} from "lucide-react";
import { App as AntApp, Modal, Popconfirm, Spin, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentProfile } from "../../../shared/auth/session";
import {
  getChiTietDonNhanHang,
  quetNhanCay,
  xacNhanNhanHang,
  xacNhanNhanThungGPA,
} from "../api/materialReceiptApi";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../shared/components/ui/CustomToast";

function playBeep(type = "success") {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
}


function cleanMaterialDisplay(tenVatTu, maVatTu, quyCach, maMau) {
  const raw = String(tenVatTu || maVatTu || 'Vật tư')
    .replace(/\s+/g, ' ')
    .trim();

  if (raw.includes('#')) {
    const rawParts = raw
      .split('#')
      .map((s) => s.trim())
      .filter(Boolean);
    const mainTitle = rawParts[0] || raw;
    const subCode =
      rawParts[1] || (maVatTu && maVatTu !== mainTitle ? maVatTu : '');
    const tags = [];
    const seenTags = new Set();

    function addTag(label, val, colorClass) {
      if (!val) return;
      const cleanVal = String(val)
        .replace(/^\[cỡ:\s*/i, '')
        .replace(/\]$/, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (
        !cleanVal ||
        cleanVal === '#' ||
        cleanVal === '##' ||
        cleanVal.includes('VC: ABC')
      )
        return;
      const key = `${label}:${cleanVal}`.toLowerCase();
      if (seenTags.has(key)) return;
      seenTags.add(key);
      tags.push({ label, val: cleanVal, colorClass });
    }

    if (maMau) {
      addTag('Màu', maMau, 'bg-purple-50 text-purple-700 border-purple-200');
    }
    if (quyCach && !quyCach.includes('VC: ABC')) {
      addTag('Quy cách', quyCach, 'bg-slate-100 text-slate-700 border-slate-200');
    }

    for (let i = 2; i < rawParts.length; i++) {
      const p = rawParts[i];
      if (
        /black|white|navy|mbo|grey|gray|red|blue|yellow|green|\(\s*\d+\s*\)/i.test(
          p,
        )
      ) {
        addTag('Màu', p, 'bg-purple-50 text-purple-700 border-purple-200');
      } else if (
        /cỡ|size/i.test(p) ||
        /^\d+[A-Z]*(\([A-Z0-9]+\))?$/i.test(p)
      ) {
        addTag('Cỡ', p, 'bg-blue-50 text-blue-700 border-blue-200');
      } else if (/\d+\s*(cm|mm|m|mtr|yds|inch|cone)/i.test(p)) {
        addTag('Kích thước', p, 'bg-sky-50 text-sky-700 border-sky-200');
      } else if (p && p !== subCode && p !== '#' && p !== '##') {
        addTag('', p, 'bg-slate-100 text-slate-600 border-slate-200');
      }
    }

    return { mainTitle, subCode, tags };
  }

  return {
    mainTitle: raw,
    subCode: maVatTu && maVatTu !== raw ? maVatTu : '',
    tags: [
      maMau
        ? {
            label: 'Màu',
            val: maMau,
            colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
          }
        : null,
      quyCach && !quyCach.includes('VC: ABC')
        ? {
            label: 'Quy cách',
            val: quyCach,
            colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
          }
        : null,
    ].filter(Boolean),
  };
}

export default function MaterialReceiptDetailPage() {
  const { phieuSoanHangId } = useParams();
  const navigate = useNavigate();
  const profile = getCurrentProfile();

  const [loading, setLoading] = useState(true);
  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);

  // Barcode input & scan
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastScanAlert, setLastScanAlert] = useState(null);
  const inputRef = useRef(null);

  // Filter rolls on detail
  const [rollFilter, setRollFilter] = useState("ALL"); // 'ALL' | 'UNCONFIRMED' | 'CONFIRMED'
  const [itemSearch, setItemSearch] = useState("");
  const [collapsedItems, setCollapsedItems] = useState({});
  const [collapsedThungs, setCollapsedThungs] = useState({});

  // View mode for Phụ liệu: 'thung' (Xem theo thùng GPA) | 'item' (Xem theo mặt hàng)
  const [viewMode, setViewMode] = useState("thung");

  // Modal nhận hàng theo Thùng GPA
  const [thungModalOpen, setThungModalOpen] = useState(false);
  const [modalThung, setModalThung] = useState(null);
  const [modalMode, setModalMode] = useState("nhan"); // 'nhan' | 'huy'
  const [modalCheckedMap, setModalCheckedMap] = useState({}); // { [cayId]: boolean }
  const [modalQtyMap, setModalQtyMap] = useState({}); // { [cayId]: number }
  const [modalSearch, setModalSearch] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Batch confirming loading
  const [batchLoading, setBatchLoading] = useState(false);
  const [scanMode, setScanMode] = useState("nhan"); // 'nhan' | 'huy'

  const tenNguoiNhan =
    `${profile?.HoVaTenLot || ""} ${profile?.Ten || ""}`.trim() ||
    profile?.TenDangNhap ||
    "Người nhận";
  const xiNghiepNhan =
    profile?.XiNghiep ||
    (header?.LoaiDatHang === "NguyenLieu"
      ? `Nhà cắt ${header?.NhaCat || ""}`.trim()
      : `Tổ may ${header?.ToMay || ""}`.trim());

  const isFabric =
    header?.LoaiDatHang === "NguyenLieu" ||
    (!header?.LoaiDatHang && (header?.MaSoPhieuSoan || "").startsWith("NA"));

  const loadDetail = async () => {
    if (!phieuSoanHangId) return;
    setLoading(true);
    try {
      const res = await getChiTietDonNhanHang(Number(phieuSoanHangId));
      if (res && res.success) {
        setHeader(res.header);
        setItems(res.items || []);
        // Nếu là phụ liệu thì mặc định xem theo thùng
        if (
          res.header?.LoaiDatHang === "PhuLieu" ||
          (res.header?.MaSoPhieuSoan || "").startsWith("PA")
        ) {
          setViewMode("thung");
        } else {
          setViewMode("item");
        }
      } else {
        showErrorToast("Không thể tải chi tiết phiếu nhận hàng");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết nhận hàng:", err);
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải chi tiết nhận hàng",
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phieuSoanHangId]);

  // Nhóm thùng GPA tự động tính toán từ items để luôn đồng bộ 100%
  const derivedThungs = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      item.cays?.forEach((cay) => {
        const gpa = (cay.MaGPA || "").trim();
        if (!map.has(gpa)) {
          map.set(gpa, {
            MaGPA: gpa,
            TenThung: gpa ? `Thùng ${gpa}` : "Phụ liệu lẻ (Chưa đóng thùng)",
            cays: [],
            TongSoCay: 0,
            SoCayDaNhan: 0,
            TongSoLuongXuat: 0,
            SoLuongDaNhan: 0,
          });
        }
        const thung = map.get(gpa);
        thung.TongSoCay += 1;
        const slXuat = Number(cay.SoLuongXuat) || 0;
        const slNhan =
          cay.SoLuongThucNhan !== null && cay.SoLuongThucNhan !== undefined
            ? Number(cay.SoLuongThucNhan)
            : cay.isXacNhan
              ? slXuat
              : 0;

        thung.TongSoLuongXuat += slXuat;
        if (cay.isXacNhan) {
          thung.SoCayDaNhan += 1;
          thung.SoLuongDaNhan += slNhan;
        }

        thung.cays.push({
          ...cay,
          MaVatTu: item.MaVatTu,
          TenVatTu: item.TenVatTu,
          MaMau: item.MaMau,
          QuyCach: item.QuyCach,
          DVT: item.DVT,
        });
      });
    });

    return Array.from(map.values())
      .map((t) => {
        let TrangThaiNhan = "ChoNhan";
        if (t.SoCayDaNhan === 0) TrangThaiNhan = "ChoNhan";
        else if (t.SoCayDaNhan < t.TongSoCay) TrangThaiNhan = "NhanMotPhan";
        else TrangThaiNhan = "DaNhanDu";
        return { ...t, TrangThaiNhan };
      })
      .sort((a, b) => {
        if (!a.MaGPA) return 1;
        if (!b.MaGPA) return -1;
        return a.MaGPA.localeCompare(b.MaGPA);
      });
  }, [items]);

  // Mở modal nhận hàng theo thùng GPA
  const handleOpenThungModal = (thung, mode = "nhan") => {
    setModalThung(thung);
    setModalMode(mode);
    setModalSearch("");

    const checkedMap = {};
    const qtyMap = {};

    thung.cays.forEach((c) => {
      if (mode === "huy") {
        checkedMap[c.CayId] = Boolean(c.isXacNhan);
      } else {
        checkedMap[c.CayId] = !c.isXacNhan;
      }
      qtyMap[c.CayId] =
        c.SoLuongThucNhan !== null && c.SoLuongThucNhan !== undefined
          ? c.SoLuongThucNhan
          : c.SoLuongXuat;
    });

    setModalCheckedMap(checkedMap);
    setModalQtyMap(qtyMap);
    setThungModalOpen(true);
  };

  // Xác nhận trong modal nhận thùng GPA
  const handleConfirmThungModal = async () => {
    if (!modalThung) return;

    const selectedCays = modalThung.cays.filter(
      (c) => modalCheckedMap[c.CayId],
    );

    if (selectedCays.length === 0) {
      showWarningToast("Vui lòng tick chọn ít nhất một vật tư để thao tác!");
      return;
    }

    setModalSubmitting(true);
    try {
      const payload = {
        PhieuSoanHangId: Number(phieuSoanHangId),
        MaGPA: modalThung.MaGPA,
        action: modalMode === "huy" ? "huy_nhan" : "xac_nhan",
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
        selectedCays: selectedCays.map((c) => ({
          CayId: c.CayId,
          ChiTietPhieuSoanHangId: c.ChiTietPhieuSoanHangId,
          SoLuongThucNhan:
            modalQtyMap[c.CayId] !== undefined
              ? Number(modalQtyMap[c.CayId])
              : Number(c.SoLuongXuat),
        })),
      };

      const res = await xacNhanNhanThungGPA(payload);
      if (res && res.success) {
        playBeep("success");
        showSuccessToast(res.message);
        setThungModalOpen(false);
        await loadDetail();
      }
    } catch (err) {
      playBeep("error");
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi xử lý nhận thùng",
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  // Hủy nhận toàn bộ một thùng GPA
  const handleHuyThung = async (thung) => {
    try {
      const res = await xacNhanNhanThungGPA({
        PhieuSoanHangId: Number(phieuSoanHangId),
        MaGPA: thung.MaGPA,
        action: "huy_nhan",
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
      });
      if (res && res.success) {
        playBeep("success");
        showSuccessToast(res.message);
        await loadDetail();
      }
    } catch (err) {
      playBeep("error");
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể hủy nhận thùng này",
      );
    }
  };

  // Quét mã barcode (Hỗ trợ cả Mã Thùng GPA và Mã Cây)
  const handleScanRoll = async (barcodeToScan, forcedAction) => {
    const code = (barcodeToScan || barcodeInput).trim();
    if (!code) return;

    // 1. Kiểm tra xem có khớp với Mã Thùng GPA nào trong đơn không
    const matchedThung = derivedThungs.find(
      (t) => t.MaGPA && t.MaGPA.toUpperCase() === code.toUpperCase(),
    );

    if (matchedThung) {
      playBeep("success");
      setBarcodeInput("");
      const actionToUse = forcedAction || (scanMode === "huy" ? "huy" : "nhan");
      handleOpenThungModal(matchedThung, actionToUse);
      return;
    }

    // 2. Nếu không khớp mã thùng GPA, xử lý quét nhận/hủy nhận mã cây lẻ
    const actionToUse =
      forcedAction || (scanMode === "huy" ? "huy_nhan" : "xac_nhan");
    setScanning(true);
    try {
      const res = await quetNhanCay({
        PhieuSoanHangId: Number(phieuSoanHangId),
        MaCay: code,
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
        action: actionToUse,
      });

      if (res && res.success) {
        playBeep("success");
        setLastScanAlert({
          type: "success",
          action: actionToUse,
          message: res.message,
          maCay: code,
          time: new Date(),
        });
        showSuccessToast(res.message);

        updateRollInState(res.cay, res.summary);
        setBarcodeInput("");
      }
    } catch (err) {
      playBeep("error");
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        `Lỗi khi ${actionToUse === "huy_nhan" ? "hủy nhận" : "quét nhận"} mã [${code}]`;
      setLastScanAlert({
        type: "error",
        action: actionToUse,
        message: errMsg,
        maCay: code,
        time: new Date(),
      });
      showErrorToast(errMsg);
    } finally {
      setScanning(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Hủy nhận 1 cây (undo)
  const handleHuyNhanRoll = async (roll) => {
    try {
      const res = await quetNhanCay({
        PhieuSoanHangId: Number(phieuSoanHangId),
        MaCay: roll.MaCay,
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
        action: "huy_nhan",
      });

      if (res && res.success) {
        showSuccessToast(res.message);
        updateRollInState(res.cay, res.summary);
      }
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message || err?.message || "Không thể hủy nhận cây",
      );
    }
  };

  // Cập nhật state local khi 1 cây thay đổi trạng thái
  const updateRollInState = (updatedCay, newSummary) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        let hasRoll = false;
        const newCays = item.cays.map((c) => {
          if (c.MaCay === updatedCay.MaCay) {
            hasRoll = true;
            return {
              ...c,
              isXacNhan: updatedCay.isXacNhan,
              SoLuongThucNhan: updatedCay.SoLuongThucNhan,
              ThoiGianXacNhan: updatedCay.ThoiGianXacNhan,
              TenNguoiXacNhan: updatedCay.TenNguoiXacNhan,
              XiNghiepXacNhan: updatedCay.XiNghiepXacNhan,
            };
          }
          return c;
        });

        if (hasRoll) {
          const soCayDaNhan = newCays.filter((c) => c.isXacNhan).length;
          const soLuongDaNhan = newCays
            .filter((c) => c.isXacNhan)
            .reduce(
              (sum, c) => sum + (c.SoLuongThucNhan || c.SoLuongXuat || 0),
              0,
            );
          return {
            ...item,
            cays: newCays,
            SoCayDaNhan: soCayDaNhan,
            SoLuongDaNhan: soLuongDaNhan,
          };
        }
        return item;
      }),
    );

    if (newSummary && header) {
      setHeader((prev) => ({
        ...prev,
        SoCayDaNhan: newSummary.SoCayDaNhan,
        TongSoCay: newSummary.TongSoCay,
        TongSoLuongXuat: newSummary.TongSoLuongXuat,
        SoLuongDaNhan: newSummary.SoLuongDaNhan,
        TrangThaiNhan: newSummary.TrangThaiNhan,
        TiLeNhan: newSummary.TiLeNhan,
        TrangThaiDDH: newSummary.isHoanThanh
          ? "DaNhanHang"
          : prev.TrangThaiDDH === "DaNhanHang"
            ? "DangNhan"
            : prev.TrangThaiDDH,
      }));
    }
  };

  // Xử lý hủy nhận tất cả đơn
  const handleBatchCancelAll = async () => {
    setBatchLoading(true);
    try {
      const res = await xacNhanNhanHang({
        PhieuSoanHangId: Number(phieuSoanHangId),
        nhanTatCa: false,
        huyNhanTatCa: true,
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
      });

      if (res && res.success) {
        playBeep("success");
        showSuccessToast(res.message || "Đã hủy nhận toàn bộ đơn hàng!");
        await loadDetail();
      }
    } catch (err) {
      playBeep("error");
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể hủy nhận đơn hàng",
      );
    } finally {
      setBatchLoading(false);
    }
  };

  // Xử lý xác nhận nhận tất cả
  const handleBatchReceiveAll = async () => {
    setBatchLoading(true);
    try {
      const res = await xacNhanNhanHang({
        PhieuSoanHangId: Number(phieuSoanHangId),
        nhanTatCa: true,
        chotHoanTat: true,
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
      });

      if (res && res.success) {
        playBeep("success");
        showSuccessToast(
          res.message || "Đã xác nhận nhận đủ tất cả theo phiếu xuất!",
        );
        await loadDetail();
      }
    } catch (err) {
      playBeep("error");
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể xác nhận nhận tất cả",
      );
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleCollapse = (id) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCollapseThung = (gpa) => {
    setCollapsedThungs((prev) => ({
      ...prev,
      [gpa]: !prev[gpa],
    }));
  };

  // Lọc vật tư theo bộ lọc
  const filteredItems = useMemo(() => {
    const term = itemSearch.trim().toLowerCase();

    return items
      .map((item) => {
        let matchingCays = item.cays;

        if (rollFilter === "UNCONFIRMED") {
          matchingCays = matchingCays.filter((c) => !c.isXacNhan);
        } else if (rollFilter === "CONFIRMED") {
          matchingCays = matchingCays.filter((c) => c.isXacNhan);
        }

        if (term) {
          matchingCays = matchingCays.filter(
            (c) =>
              (c.MaCay || "").toLowerCase().includes(term) ||
              (c.MaGPA || "").toLowerCase().includes(term) ||
              (item.MaVatTu || "").toLowerCase().includes(term) ||
              (item.TenVatTu || "").toLowerCase().includes(term),
          );
        }

        return {
          ...item,
          filteredCays: matchingCays,
        };
      })
      .filter((item) => {
        if (!term && rollFilter === "ALL") return true;
        return (
          item.filteredCays.length > 0 ||
          (term &&
            ((item.MaVatTu || "").toLowerCase().includes(term) ||
              (item.TenVatTu || "").toLowerCase().includes(term)))
        );
      });
  }, [items, rollFilter, itemSearch]);

  // Lọc danh sách thùng theo bộ lọc
  const filteredThungs = useMemo(() => {
    const term = itemSearch.trim().toLowerCase();

    return derivedThungs
      .map((thung) => {
        let matchingCays = thung.cays;

        if (rollFilter === "UNCONFIRMED") {
          matchingCays = matchingCays.filter((c) => !c.isXacNhan);
        } else if (rollFilter === "CONFIRMED") {
          matchingCays = matchingCays.filter((c) => c.isXacNhan);
        }

        if (term) {
          matchingCays = matchingCays.filter(
            (c) =>
              (c.MaCay || "").toLowerCase().includes(term) ||
              (c.MaGPA || "").toLowerCase().includes(term) ||
              (c.MaVatTu || "").toLowerCase().includes(term) ||
              (c.TenVatTu || "").toLowerCase().includes(term),
          );
        }

        return {
          ...thung,
          filteredCays: matchingCays,
        };
      })
      .filter((thung) => {
        if (!term && rollFilter === "ALL") return true;
        return (
          thung.filteredCays.length > 0 ||
          (term && (thung.MaGPA || "").toLowerCase().includes(term))
        );
      });
  }, [derivedThungs, rollFilter, itemSearch]);

  const progress = Number(header?.TiLeNhan) || 0;

  return (
    <MainLayout screenTitle="Chi tiết nhận hàng NPL">
      <div className="mx-auto w-full max-w-[1400px] space-y-4 px-3 py-4 sm:px-6 sm:py-6">
        {/* Nút quay lại & Tiêu đề */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/material-receipts")}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {header?.SoDonDatHang ||
                    header?.MaSoPhieuSoan ||
                    "Chi tiết nhận hàng"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                    isFabric
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700"
                  }`}
                >
                  {isFabric ? (
                    <Scissors className="size-3" />
                  ) : (
                    <Shirt className="size-3" />
                  )}
                  {header?.BoPhanNhan || (isFabric ? "Nhà cắt" : "Tổ may")}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Phiếu soạn:{" "}
                <strong className="text-slate-700">
                  {header?.MaSoPhieuSoan}
                </strong>
                {header?.SoLSX && (
                  <>
                    {" "}
                    • LSX:{" "}
                    <strong className="text-slate-700">{header?.SoLSX}</strong>
                  </>
                )}
                {header?.MaHang && (
                  <>
                    {" "}
                    • Mã hàng:{" "}
                    <strong className="text-slate-700">{header?.MaHang}</strong>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDetail}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <RefreshCw
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>

            {/* Nút Nhận tất cả */}
            {header && header.SoCayDaNhan < header.TongSoCay && (
              <Popconfirm
                title="Nhận tất cả cây/phụ liệu?"
                description={
                  <div className="max-w-[280px] text-xs text-slate-600">
                    Xác nhận nhận đủ tất cả{" "}
                    <strong>{header.TongSoCay - header.SoCayDaNhan}</strong>{" "}
                    cây/mục còn lại theo đúng số lượng kho đã xuất?
                  </div>
                }
                onConfirm={handleBatchReceiveAll}
                okText="Đồng ý nhận đủ"
                cancelText="Hủy"
                okButtonProps={{ loading: batchLoading }}
              >
                <button
                  type="button"
                  disabled={batchLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                >
                  <Sparkles className="size-3.5" />
                  <span>Nhận tất cả (Nhận đủ)</span>
                </button>
              </Popconfirm>
            )}

            {/* Nút Hủy nhận tất cả */}
            {header && header.SoCayDaNhan > 0 && (
              <Popconfirm
                title="Hủy nhận toàn bộ đơn hàng?"
                description={
                  <div className="max-w-[280px] text-xs text-slate-600">
                    Bạn có chắc chắn muốn hủy nhận toàn bộ{" "}
                    <strong>{header.SoCayDaNhan}</strong> mục đã nhận của đơn
                    này để hoàn nguyên về trạng thái chờ nhận không?
                  </div>
                }
                onConfirm={handleBatchCancelAll}
                okText="Đồng ý hủy nhận"
                cancelText="Đóng"
                okButtonProps={{ danger: true, loading: batchLoading }}
              >
                <button
                  type="button"
                  disabled={batchLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 active:scale-95"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Hủy nhận tất cả</span>
                </button>
              </Popconfirm>
            )}
          </div>
        </div>

        {/* Thẻ tổng quan tiến độ */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <PackageCheck className="size-4 text-blue-600" />
                Tiến độ nhận hàng
              </span>
              <span className="text-sm font-bold text-slate-900">
                {!isFabric && derivedThungs.length > 0 ? (
                  <>
                    {derivedThungs.filter((t) => t.TrangThaiNhan === "DaNhanDu")
                      .length}
                    /{derivedThungs.length} thùng{" "}
                    <span className="text-xs font-normal text-slate-500">
                      ({header?.SoCayDaNhan || 0}/{header?.TongSoCay || 0} mục •{" "}
                      {progress}%)
                    </span>
                  </>
                ) : (
                  <>
                    {header?.SoCayDaNhan || 0} / {header?.TongSoCay || 0} cây (
                    {progress}%)
                  </>
                )}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-300 ${
                  progress >= 100
                    ? "bg-emerald-500"
                    : progress > 0
                      ? "bg-blue-600"
                      : "bg-slate-300"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Tổng số lượng:{" "}
                <strong className="text-slate-800">
                  {(header?.SoLuongDaNhan || 0).toLocaleString()}
                </strong>{" "}
                / {(header?.TongSoLuongXuat || 0).toLocaleString()}
              </div>
              <div>
                Kho xuất:{" "}
                <strong className="text-slate-800">
                  {header?.NguoiXuat || "—"}
                </strong>
                {header?.NgayXuat && (
                  <span className="ml-1 text-slate-400">
                    ({dayjs(header.NgayXuat).format("DD/MM/YYYY HH:mm")})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="text-xs text-slate-500">Người thực hiện nhận</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                <User className="size-4" />
              </div>
              <div className="truncate">
                <div className="truncate text-xs font-bold text-slate-900">
                  {tenNguoiNhan}
                </div>
                <div className="truncate text-[11px] text-slate-500">
                  {xiNghiepNhan}
                </div>
              </div>
            </div>
            <div className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
              Trạng thái đơn:{" "}
              <strong className="text-slate-700">
                {header?.TrangThaiDDH === "DaNhanHang" ||
                header?.TrangThaiNhan === "DaNhanDu"
                  ? "Đã nhận hoàn tất"
                  : "Đang kiểm nhận"}
              </strong>
            </div>
          </div>
        </div>

        {/* Khung quét barcode (Máy quét / Nhập tay) */}
        <div
          className={`rounded-2xl border-2 p-4 shadow-sm transition-colors ${
            scanMode === "huy"
              ? "border-rose-300 bg-gradient-to-b from-rose-50/70 to-white"
              : "border-blue-200 bg-gradient-to-b from-blue-50/60 to-white"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Barcode
                className={`size-5 ${scanMode === "huy" ? "text-rose-600" : "text-blue-600"}`}
              />
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setScanMode("nhan");
                    inputRef.current?.focus();
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    scanMode === "nhan"
                    ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Quét để Nhận
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanMode("huy");
                    inputRef.current?.focus();
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    scanMode === "huy"
                      ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-rose-700"
                  }`}
                >
                  Quét để Hủy nhận
                </button>
              </div>
            </div>

            <span className="text-[11px] text-slate-500">
              Nhấn <strong>Enter</strong> sau khi nhập mã
            </span>
          </div>

          <form
            data-submit-on-scan="true"
            onSubmit={(e) => {
              e.preventDefault();
              handleScanRoll();
            }}
            className="mt-3 flex gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder={
                  !isFabric
                    ? scanMode === "huy"
                      ? "Quét mã tem thùng GPA (GPA...) hoặc mã cây để HỦY NHẬN..."
                      : "Quét mã tem thùng GPA (GPA...) hoặc mã cây để NHẬN..."
                    : scanMode === "huy"
                      ? "Quét hoặc nhập mã cây để HỦY NHẬN..."
                      : "Quét hoặc nhập mã cây để NHẬN (Ví dụ: NAH2611...)"
                }
                disabled={scanning}
                className={`w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm font-semibold tracking-wide text-slate-900 placeholder-slate-400 shadow-inner transition focus:outline-none focus:ring-2 ${
                  scanMode === "huy"
                    ? "border-rose-300 focus:border-rose-600 focus:ring-rose-100"
                    : "border-blue-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
              />
              {barcodeInput && (
                <button
                  type="button"
                  onClick={() => {
                    setBarcodeInput("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={scanning || !barcodeInput.trim()}
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 disabled:bg-slate-300 disabled:shadow-none sm:text-sm ${
                scanMode === "huy"
                  ? "bg-rose-600 shadow-rose-200 hover:bg-rose-700"
                  : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
              }`}
            >
              {scanning ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : scanMode === "huy" ? (
                <RotateCcw className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
              <span>
                {scanMode === "huy" ? "Xác nhận hủy" : "Xác nhận nhận"}
              </span>
            </button>
          </form>

          {/* Banner thông báo kết quả quét gần nhất */}
          {lastScanAlert && (
            <div
              className={`mt-3 flex items-center justify-between rounded-xl border p-3 text-xs animate-in fade-in slide-in-from-top-1 ${
                lastScanAlert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {lastScanAlert.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <Trash2 className="size-4 shrink-0 text-rose-600" />
                )}
                <span>
                  <strong>[{lastScanAlert.maCay}]:</strong>{" "}
                  {lastScanAlert.message}
                </span>
              </div>

              {lastScanAlert.type === "success" &&
                lastScanAlert.action !== "huy_nhan" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleScanRoll(lastScanAlert.maCay, "huy_nhan")
                    }
                    className="ml-2 inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    <RotateCcw className="size-3" />
                    Hủy nhận
                  </button>
                )}
            </div>
          )}
        </div>


        {/* Thanh công cụ xem & Bộ lọc tìm kiếm */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {/* View switcher cho Phụ Liệu */}
            {!isFabric && (
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("thung")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === "thung"
                      ? "bg-white text-fuchsia-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Package className="size-3.5" />
                  <span>Xem theo Thùng GPA ({derivedThungs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("item")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === "item"
                      ? "bg-white text-fuchsia-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="size-3.5" />
                  <span>Xem theo Mặt hàng ({items.length})</span>
                </button>
              </div>
            )}

            {/* Filter trạng thái nhận */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setRollFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  rollFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setRollFilter("UNCONFIRMED")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  rollFilter === "UNCONFIRMED"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Chưa nhận
              </button>
              <button
                type="button"
                onClick={() => setRollFilter("CONFIRMED")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  rollFilter === "CONFIRMED"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Đã nhận
              </button>
            </div>
          </div>

          {/* Ô tìm kiếm mặt hàng / mã cây / mã GPA */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Tìm mã VT, tên, mã cây, GPA..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            {itemSearch && (
              <button
                type="button"
                onClick={() => setItemSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            DANH SÁCH CHI TIẾT
            ======================================================== */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
            <Spin size="large" />
            <span className="mt-3 text-xs text-slate-500">
              Đang tải danh sách vật tư...
            </span>
          </div>
        ) : !isFabric && viewMode === "thung" ? (
          /* ========================================================
             CHẾ ĐỘ XEM THEO THÙNG GPA (DÀNH CHO PHỤ LIỆU)
             ======================================================== */
          filteredThungs.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <Package className="size-8 text-slate-300" />
              <span className="mt-2 text-xs text-slate-500">
                Không tìm thấy thùng phụ liệu nào phù hợp với bộ lọc
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredThungs.map((thung) => {
                const isExpanded = !collapsedThungs[thung.MaGPA || "LE"];
                const isDaNhanDu = thung.TrangThaiNhan === "DaNhanDu";
                const isNhanMotPhan = thung.TrangThaiNhan === "NhanMotPhan";

                return (
                  <div
                    key={thung.MaGPA || "LE"}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                  >
                    {/* Header thùng */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl font-bold ${
                            isDaNhanDu
                              ? "bg-emerald-100 text-emerald-700"
                              : isNhanMotPhan
                                ? "bg-amber-100 text-amber-700"
                                : "bg-fuchsia-100 text-fuchsia-700"
                          }`}
                        >
                          <Package className="size-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 sm:text-base">
                              {thung.MaGPA
                                ? `Tem thùng GPA: ${thung.MaGPA}`
                                : "Phụ liệu lẻ (Chưa đóng thùng)"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                                isDaNhanDu
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : isNhanMotPhan
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isDaNhanDu ? (
                                <>
                                  <Check className="size-3 text-emerald-600" />
                                  <span>Đã nhận đủ</span>
                                </>
                              ) : isNhanMotPhan ? (
                                <>
                                  <Clock className="size-3 text-amber-600" />
                                  <span>Nhận một phần</span>
                                </>
                              ) : (
                                <span>Chờ nhận</span>
                              )}
                            </span>
                          </div>

                          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>
                              Số lượng mục:{" "}
                              <strong className="text-slate-800">
                                {thung.SoCayDaNhan} / {thung.TongSoCay}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Tổng xuất:{" "}
                              <strong className="text-slate-800">
                                {thung.TongSoLuongXuat.toLocaleString()}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Đã nhận:{" "}
                              <strong className="text-emerald-700">
                                {thung.SoLuongDaNhan.toLocaleString()}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Nút Nhận thùng: Mở popup chọn vật tư */}
                        {thung.SoCayDaNhan < thung.TongSoCay && (
                          <button
                            type="button"
                            onClick={() => handleOpenThungModal(thung, "nhan")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                          >
                            <CheckSquare className="size-3.5" />
                            <span>Nhận thùng</span>
                          </button>
                        )}

                        {/* Nút Hủy nhận thùng */}
                        {thung.SoCayDaNhan > 0 && (
                          <Popconfirm
                            title="Hủy nhận thùng phụ liệu?"
                            description={
                              <div className="max-w-[260px] text-xs text-slate-600">
                                Bạn có chắc chắn muốn hủy nhận toàn bộ{" "}
                                <strong>{thung.SoCayDaNhan}</strong> mục đã nhận
                                trong {thung.TenThung}?
                              </div>
                            }
                            onConfirm={() => handleHuyThung(thung)}
                            okText="Đồng ý hủy"
                            cancelText="Đóng"
                            okButtonProps={{ danger: true }}
                          >
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 active:scale-95"
                            >
                              <RotateCcw className="size-3.5" />
                              <span>Hủy nhận thùng</span>
                            </button>
                          </Popconfirm>
                        )}

                        {/* Nút Toggle mở xem chi tiết */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleCollapseThung(thung.MaGPA || "LE")
                          }
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Danh sách vật tư trong thùng (Gộp nhóm vật tư gọn gàng, chống rối mắt) */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {(() => {
                          const matGroups = [];
                          const map = new Map();
                          thung.filteredCays.forEach((cay) => {
                            const key = cay.ChiTietPhieuSoanHangId || cay.MaVatTu || cay.TenVatTu;
                            if (!map.has(key)) {
                              const newGrp = {
                                key,
                                sample: cay,
                                cays: [],
                                tongXuat: 0,
                                daNhan: 0,
                                soGoi: 0,
                                soGoiDaNhan: 0,
                              };
                              map.set(key, newGrp);
                              matGroups.push(newGrp);
                            }
                            const grp = map.get(key);
                            grp.cays.push(cay);
                            grp.soGoi += 1;
                            grp.tongXuat += Number(cay.SoLuongXuat || 0);
                            if (cay.isXacNhan) {
                              grp.soGoiDaNhan += 1;
                              grp.daNhan += Number(cay.SoLuongThucNhan || cay.SoLuongXuat || 0);
                            }
                          });

                          return matGroups.map((grp) => {
                            const { mainTitle, subCode, tags } = cleanMaterialDisplay(
                              grp.sample.TenVatTu,
                              grp.sample.MaVatTu,
                              grp.sample.QuyCach,
                              grp.sample.MaMau
                            );
                            const isDaNhanDu = grp.soGoiDaNhan === grp.soGoi;
                            const isNhanMotPhan = grp.soGoiDaNhan > 0 && grp.soGoiDaNhan < grp.soGoi;

                            return (
                              <div
                                key={grp.key}
                                className={`p-3.5 space-y-2.5 transition ${
                                  isDaNhanDu ? "bg-emerald-50/20" : "bg-white"
                                }`}
                              >
                                {/* Header vật tư chính */}
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="space-y-1.5 flex-1 min-w-[240px]">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-base font-bold text-slate-900">
                                        {mainTitle}
                                      </span>
                                      {tags.map((t, idx) => (
                                        <span
                                          key={idx}
                                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${t.colorClass}`}
                                        >
                                          {t.label ? `${t.label}: ` : ""}{t.val}
                                        </span>
                                      ))}
                                      {isDaNhanDu ? (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                                          <Check className="size-3" /> Đã nhận đủ
                                        </span>
                                      ) : isNhanMotPhan ? (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                                          <Clock className="size-3" /> Nhận {grp.soGoiDaNhan}/{grp.soGoi} gói
                                        </span>
                                      ) : null}
                                    </div>

                                    {/* Mã VT rõ ràng, đậm, dễ đọc */}
                                    {subCode && (
                                      <div className="inline-flex flex-wrap items-baseline gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                                        <span className="font-bold text-slate-700 shrink-0">Mã VT:</span>
                                        <span className="font-mono font-bold text-slate-900 break-all select-all">
                                          {subCode}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Khối số lượng nổi bật, to rõ */}
                                  <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3.5 py-2 shrink-0">
                                    <div className="text-right">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Số lượng xuất
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-base font-extrabold text-blue-700 sm:text-lg">
                                          {grp.tongXuat.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">
                                          {grp.sample.DVT}
                                        </span>
                                        {grp.soGoi > 1 && (
                                          <span className="text-[11px] font-semibold text-slate-500">
                                            ({grp.soGoi} gói)
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {grp.daNhan > 0 ? (
                                      <div className="border-l border-slate-200 pl-3 text-right">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                          Đã nhận
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-base font-extrabold text-emerald-700 sm:text-lg">
                                            {grp.daNhan.toLocaleString()}
                                          </span>
                                          <span className="text-xs font-bold text-emerald-700">
                                            {grp.sample.DVT}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="border-l border-slate-200 pl-3 text-right">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                          Trạng thái
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500">
                                          Chờ nhận
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Chi tiết từng gói tem trong thùng */}
                                {grp.soGoi === 1 ? (
                                  (() => {
                                    const cay = grp.cays[0];
                                    return (
                                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs">
                                        <div className="flex items-center gap-3">
                                          <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5 shadow-2xs">
                                            {cay.MaCay}
                                          </span>
                                          <div className="flex items-baseline gap-1.5">
                                            <span className="text-xs text-slate-500">SL:</span>
                                            <span className={`text-sm font-extrabold ${cay.isXacNhan ? "text-emerald-700" : "text-blue-700"}`}>
                                              {cay.SoLuongXuat.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-bold text-slate-600">
                                              {cay.DVT}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {cay.isXacNhan ? (
                                            <>
                                              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                <Check className="size-3 text-emerald-600" />
                                                Đã nhận
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleHuyNhanRoll(cay)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                              >
                                                <RotateCcw className="size-3" />
                                                Hủy
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleScanRoll(cay.MaCay, "xac_nhan")
                                              }
                                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95"
                                            >
                                              <Check className="size-3.5" />
                                              Nhận gói này
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                                    <div className="flex items-center justify-between px-1 text-xs">
                                      <span className="font-bold text-slate-700">
                                        Danh sách {grp.soGoi} gói tem lẻ:
                                      </span>
                                      <span className="font-semibold text-slate-500">
                                        Đã nhận: <strong className="text-emerald-700">{grp.soGoiDaNhan}</strong>/{grp.soGoi} gói
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                      {grp.cays.map((cay) => (
                                        <div
                                          key={cay.CayId}
                                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition shadow-2xs ${
                                            cay.isXacNhan
                                              ? "border-emerald-300 bg-emerald-50/80 text-emerald-900"
                                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                                              {cay.MaCay}
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                              <span className={`text-sm font-extrabold ${cay.isXacNhan ? "text-emerald-800" : "text-slate-900"}`}>
                                                {cay.SoLuongXuat.toLocaleString()}
                                              </span>
                                              <span className="text-[11px] font-semibold text-slate-500">
                                                {cay.DVT}
                                              </span>
                                            </div>
                                          </div>

                                          <div>
                                            {cay.isXacNhan ? (
                                              <button
                                                type="button"
                                                onClick={() => handleHuyNhanRoll(cay)}
                                                title="Nhấn để hủy nhận gói này"
                                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-100/80 px-2 py-0.5 text-xs font-bold text-emerald-800 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 transition"
                                              >
                                                <Check className="size-3" />
                                                <span>Đã nhận</span>
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleScanRoll(cay.MaCay, "xac_nhan")
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95"
                                              >
                                                <Check className="size-3" />
                                                Nhận
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : filteredItems.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <Scissors className="size-8 text-slate-300" />
              <span className="mt-2 text-xs text-slate-500">
                Không tìm thấy vật tư nào phù hợp với bộ lọc
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isCollapsed = collapsedItems[item.ChiTietPhieuSoanHangId];
                const daNhanDu =
                  item.SoCay > 0 && item.SoCayDaNhan >= item.SoCay;

                return (
                  <div
                    key={item.ChiTietPhieuSoanHangId}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                  >
                    {/* Header vật tư */}
                    <div
                      onClick={() =>
                        toggleCollapse(item.ChiTietPhieuSoanHangId)
                      }
                      className="flex cursor-pointer flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 transition hover:bg-slate-100/70"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex size-9 items-center justify-center rounded-xl font-bold ${
                            daNhanDu
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {isFabric ? (
                            <Scissors className="size-4" />
                          ) : (
                            <Shirt className="size-4" />
                          )}
                        </div>

                        {(() => {
                          const { mainTitle, subCode, tags } = cleanMaterialDisplay(
                            item.TenVatTu,
                            item.MaVatTu,
                            item.QuyCach,
                            item.MaMau
                          );
                          return (
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-bold text-slate-900">
                                  {mainTitle}
                                </span>
                                {tags.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${t.colorClass}`}
                                  >
                                    {t.label ? `${t.label}: ` : ""}{t.val}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                {subCode && (
                                  <div className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">
                                    <span className="font-bold text-slate-700">Mã VT:</span>
                                    <span className="font-mono font-bold text-slate-900">{subCode}</span>
                                  </div>
                                )}
                                <span>
                                  Yêu cầu:{" "}
                                  <strong className="font-extrabold text-slate-900">
                                    {item.SoLuongYeuCau} {item.DVT}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Thực soạn:{" "}
                                  <strong>
                                    {item.SoLuongThucSoan} {item.DVT}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                            daNhanDu
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : item.SoCayDaNhan > 0
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {item.SoCayDaNhan} / {item.SoCay} cây
                        </span>

                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isCollapsed ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronUp className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Danh sách cây vải / cuộn phụ liệu */}
                    {!isCollapsed && (
                      <div className="divide-y divide-slate-100 border-t border-slate-100">
                        {item.filteredCays.map((cay) => {
                          return (
                            <div
                              key={cay.CayId}
                              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs transition ${
                                cay.isXacNhan ? "bg-emerald-50/40" : "bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  {cay.MaCay}
                                </span>
                                {cay.MaGPA && (
                                  <span className="rounded border border-fuchsia-200 bg-fuchsia-50 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-700">
                                    Thùng {cay.MaGPA}
                                  </span>
                                )}
                                <span className="text-slate-500">
                                  SL xuất:{" "}
                                  <strong className="text-slate-800">
                                    {cay.SoLuongXuat} {item.DVT}
                                  </strong>
                                </span>
                                {cay.isXacNhan && (
                                  <span className="font-bold text-emerald-700">
                                    Thực nhận:{" "}
                                    {cay.SoLuongThucNhan || cay.SoLuongXuat}{" "}
                                    {item.DVT}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {cay.isXacNhan ? (
                                  <>
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                      <Check className="size-3 text-emerald-600" />
                                      Đã nhận
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleHuyNhanRoll(cay)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                    >
                                      <RotateCcw className="size-3" />
                                      Hủy nhận
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleScanRoll(cay.MaCay, "xac_nhan")
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95"
                                  >
                                    <Check className="size-3" />
                                    Xác nhận nhận
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* ========================================================
          MODAL NHẬN VẬT TƯ THEO THÙNG GPA
          ======================================================== */}
      <Modal
        title={null}
        open={thungModalOpen}
        onCancel={() => setThungModalOpen(false)}
        footer={null}
        width={720}
        centered
        destroyOnHidden
      >
        {modalThung && (
          <div className="space-y-4">
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700">
                <Package className="size-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  {modalMode === "huy"
                    ? "Hủy nhận Thùng Phụ Liệu"
                    : "Xác nhận nhận Thùng Phụ Liệu"}
                  :{" "}
                  <span className="text-fuchsia-700">
                    {modalThung.MaGPA || "Phụ liệu lẻ"}
                  </span>
                </h2>
                <div className="text-xs text-slate-500">
                  Phiếu soạn:{" "}
                  <strong className="text-slate-700">
                    {header?.MaSoPhieuSoan}
                  </strong>{" "}
                  • Bộ phận:{" "}
                  <strong className="text-slate-700">
                    {header?.BoPhanNhan}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Actions & Search */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allChecked = modalThung.cays.every(
                      (c) => modalCheckedMap[c.CayId],
                    );
                    const next = {};
                    modalThung.cays.forEach((c) => {
                      next[c.CayId] = !allChecked;
                    });
                    setModalCheckedMap(next);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <CheckSquare className="size-3.5" />
                  <span>
                    {modalThung.cays.every((c) => modalCheckedMap[c.CayId])
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </span>
                </button>

                <span className="text-slate-500">
                  Đã chọn:{" "}
                  <strong className="text-blue-700">
                    {
                      modalThung.cays.filter((c) => modalCheckedMap[c.CayId])
                        .length
                    }
                  </strong>{" "}
                  / {modalThung.cays.length} vật tư
                </span>
              </div>

              {/* Ô lọc nhanh trong popup */}
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 size-3 text-slate-400 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Lọc mã VT, tên..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-7 pr-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Danh sách vật tư trong thùng */}
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {modalThung.cays
                .filter((c) => {
                  if (!modalSearch.trim()) return true;
                  const s = modalSearch.trim().toLowerCase();
                  return (
                    (c.MaCay || "").toLowerCase().includes(s) ||
                    (c.MaVatTu || "").toLowerCase().includes(s) ||
                    (c.TenVatTu || "").toLowerCase().includes(s)
                  );
                })
                .map((cay) => {
                  const isChecked = Boolean(modalCheckedMap[cay.CayId]);
                  return (
                    <div
                      key={cay.CayId}
                      onClick={() =>
                        setModalCheckedMap((prev) => ({
                          ...prev,
                          [cay.CayId]: !prev[cay.CayId],
                        }))
                      }
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        isChecked
                          ? "border-blue-400 bg-blue-50/40 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          setModalCheckedMap((prev) => ({
                            ...prev,
                            [cay.CayId]: e.target.checked,
                          }));
                        }}
                        className="mt-1 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      {(() => {
                        const { mainTitle, subCode, tags } = cleanMaterialDisplay(
                          cay.TenVatTu,
                          cay.MaVatTu,
                          cay.QuyCach,
                          cay.MaMau
                        );
                        return (
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900">
                                {mainTitle}
                              </span>
                              {tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${t.colorClass}`}
                                >
                                  {t.label ? `${t.label}: ` : ""}{t.val}
                                </span>
                              ))}
                              {cay.isXacNhan && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Đã nhận trước đó
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-xs">
                                {cay.MaCay}
                              </span>
                              {subCode && (
                                <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs">
                                  <strong className="text-slate-600">Mã VT:</strong>
                                  <strong className="font-mono text-slate-900">{subCode}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Số lượng */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="text-right"
                      >
                        <div className="text-[11px] text-slate-400">
                          Xuất: {cay.SoLuongXuat} {cay.DVT}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-600">
                            Nhận:
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={cay.SoLuongXuat}
                            value={modalQtyMap[cay.CayId] ?? cay.SoLuongXuat}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalQtyMap((prev) => ({
                                ...prev,
                                [cay.CayId]: val,
                              }));
                            }}
                            className="w-16 rounded-lg border border-slate-300 px-2 py-0.5 text-right text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                          />
                          <span className="text-xs text-slate-500">
                            {cay.DVT}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setThungModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {modalMode === "huy" ? (
                  <button
                    type="button"
                    onClick={handleConfirmThungModal}
                    disabled={modalSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-95 disabled:bg-slate-300"
                  >
                    {modalSubmitting ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}
                    <span>Xác nhận HỦY các mục đã chọn</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmThungModal}
                    disabled={modalSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:bg-slate-300"
                  >
                    {modalSubmitting ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    <span>Xác nhận NHẬN các mục đã chọn</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
