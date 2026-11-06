import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  PackageCheck,
  PackageOpen,
  Printer,
  RefreshCw,
  RotateCcw,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { App as AntApp, Modal, Popconfirm, Spin, message } from "antd";
import dayjs from "dayjs";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentProfile } from "../../../shared/auth/session";
import {
  getChiTietDonNhanHang,
  quetNhanCay,
  xacNhanNhanHang,
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
    // Ignore audio autoplay restrictions
  }
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

  // Batch confirming loading
  const [batchLoading, setBatchLoading] = useState(false);

  const tenNguoiNhan =
    `${profile?.HoVaTenLot || ""} ${profile?.Ten || ""}`.trim() ||
    profile?.TenDangNhap ||
    "Người nhận";
  const xiNghiepNhan =
    profile?.XiNghiep ||
    (header?.LoaiDatHang === "NguyenLieu"
      ? `Nhà cắt ${header?.NhaCat || ""}`.trim()
      : `Tổ may ${header?.ToMay || ""}`.trim());

  const loadDetail = async () => {
    if (!phieuSoanHangId) return;
    setLoading(true);
    try {
      const res = await getChiTietDonNhanHang(Number(phieuSoanHangId));
      if (res && res.success) {
        setHeader(res.header);
        setItems(res.items || []);
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
      // Auto focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phieuSoanHangId]);

  // Xử lý quét mã barcode cây
  const handleScanRoll = async (barcodeToScan) => {
    const code = (barcodeToScan || barcodeInput).trim();
    if (!code) return;

    setScanning(true);
    try {
      const res = await quetNhanCay({
        PhieuSoanHangId: Number(phieuSoanHangId),
        MaCay: code,
        tkId: profile?.TKId || 1,
        tenNguoiNhan,
        xiNghiepNhan,
        action: "xac_nhan",
      });

      if (res && res.success) {
        playBeep("success");
        setLastScanAlert({
          type: "success",
          message: res.message,
          maCay: code,
          time: new Date(),
        });
        showSuccessToast(res.message);

        // Cập nhật state nội bộ ngay lập tức để UI mượt mà
        updateRollInState(res.cay, res.summary);
        setBarcodeInput("");
      }
    } catch (err) {
      playBeep("error");
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        `Lỗi khi quét nhận mã [${code}]`;
      setLastScanAlert({
        type: "error",
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
            .reduce((sum, c) => sum + (c.SoLuongThucNhan || c.SoLuongXuat || 0), 0);
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
        TrangThaiDDH: newSummary.isHoanThanh ? "DaNhanHang" : prev.TrangThaiDDH,
      }));
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

  // Toggle collapse từng vật tư
  const toggleCollapse = (id) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lọc vật tư & cây theo bộ lọc
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

  const progress = Number(header?.TiLeNhan) || 0;
  const isFabric =
    header?.LoaiDatHang === "NguyenLieu" ||
    (!header?.LoaiDatHang && (header?.MaSoPhieuSoan || "").startsWith("NA"));

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
                  {header?.SoDonDatHang || header?.MaSoPhieuSoan || "Chi tiết nhận hàng"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                    isFabric
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700"
                  }`}
                >
                  {isFabric ? <Scissors className="size-3" /> : <Shirt className="size-3" />}
                  {header?.BoPhanNhan || (isFabric ? "Nhà cắt" : "Tổ may")}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Phiếu soạn: <strong className="text-slate-700">{header?.MaSoPhieuSoan}</strong>
                {header?.SoLSX && (
                  <> • LSX: <strong className="text-slate-700">{header?.SoLSX}</strong></>
                )}
                {header?.MaHang && (
                  <> • Mã hàng: <strong className="text-slate-700">{header?.MaHang}</strong></>
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
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>

            {/* Nút Nhận tất cả */}
            {header && header.SoCayDaNhan < header.TongSoCay && (
              <Popconfirm
                title="Nhận tất cả cây/phụ liệu?"
                description={
                  <div className="max-w-[280px] text-xs text-slate-600">
                    Xác nhận nhận đủ tất cả{" "}
                    <strong>{header.TongSoCay - header.SoCayDaNhan}</strong> cây/cuộn
                    còn lại theo đúng số lượng kho đã xuất?
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
                {header?.SoCayDaNhan || 0} / {header?.TongSoCay || 0} cây ({progress}%)
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
                <strong className="text-slate-800">{header?.NguoiXuat || "—"}</strong>
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
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                <User className="size-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">{tenNguoiNhan}</div>
                <div className="text-[11px] text-slate-500 truncate">{xiNghiepNhan}</div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              Trạng thái đơn:{" "}
              <strong className="text-slate-700">
                {header?.TrangThaiDDH === "DaNhanHang" || header?.TrangThaiNhan === "DaNhanDu"
                  ? "Đã nhận hoàn tất"
                  : "Đang kiểm nhận"}
              </strong>
            </div>
          </div>
        </div>

        {/* Khung quét barcode */}
        <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/60 to-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 sm:text-sm">
              <Barcode className="size-5 text-blue-600" />
              <span>Quét mã barcode cây / cuộn (Máy quét hoặc gõ mã)</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Nhấn <strong>Enter</strong> sau khi nhập mã
            </span>
          </div>

          <form
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
                placeholder="Quét mã cây (Ví dụ: NAH2611..., PAH2610...)"
                disabled={scanning}
                className="w-full rounded-xl border-2 border-blue-300 bg-white px-3.5 py-2.5 text-sm font-semibold tracking-wide text-slate-900 placeholder-slate-400 shadow-inner transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 disabled:shadow-none sm:text-sm"
            >
              {scanning ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              <span>Xác nhận</span>
            </button>
          </form>

          {/* Banner thông báo kết quả quét gần nhất */}
          {lastScanAlert && (
            <div
              className={`mt-3 flex items-start justify-between gap-2 rounded-xl p-3 text-xs ${
                lastScanAlert.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {lastScanAlert.type === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{lastScanAlert.message}</div>
                  <div className="mt-0.5 text-[11px] opacity-80">
                    Mã cây: <strong>{lastScanAlert.maCay}</strong> •{" "}
                    {dayjs(lastScanAlert.time).format("HH:mm:ss")}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLastScanAlert(null)}
                className="opacity-60 hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Thanh công cụ danh sách: Lọc trạng thái & Tìm kiếm vật tư */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRollFilter("ALL")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                rollFilter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Tất cả cây ({header?.TongSoCay || 0})
            </button>
            <button
              type="button"
              onClick={() => setRollFilter("UNCONFIRMED")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                rollFilter === "UNCONFIRMED"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Chờ nhận ({(header?.TongSoCay || 0) - (header?.SoCayDaNhan || 0)})
            </button>
            <button
              type="button"
              onClick={() => setRollFilter("CONFIRMED")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                rollFilter === "CONFIRMED"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Đã nhận ({header?.SoCayDaNhan || 0})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Tìm theo mã cây, tên vật tư..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {itemSearch && (
              <button
                type="button"
                onClick={() => setItemSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách vật tư & danh sách cây/cuộn con */}
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8">
            <Spin size="large" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            Không tìm thấy cây/vật tư nào phù hợp với bộ lọc
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isCollapsed = Boolean(collapsedItems[item.ChiTietPhieuSoanHangId]);
              const itemProgress =
                item.SoCay > 0 ? Math.round((item.SoCayDaNhan / item.SoCay) * 100) : 0;

              return (
                <div
                  key={item.ChiTietPhieuSoanHangId}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Header thẻ vật tư */}
                  <div
                    onClick={() => toggleCollapse(item.ChiTietPhieuSoanHangId)}
                    className="flex cursor-pointer flex-col gap-2 bg-slate-50/70 p-3.5 transition hover:bg-slate-100/70 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Layers className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 sm:text-sm">
                          {item.TenVatTu || item.MaVatTu}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span>Mã: <strong className="text-slate-700">{item.MaVatTu}</strong></span>
                          {item.MaMau && <span>• Màu: <strong>{item.MaMau}</strong></span>}
                          {item.QuyCach && <span>• Quy cách: <strong>{item.QuyCach}</strong></span>}
                          {item.DVT && <span>• ĐVT: <strong>{item.DVT}</strong></span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right text-xs">
                        <div className="font-bold text-slate-900">
                          {item.SoCayDaNhan} / {item.SoCay} cây ({itemProgress}%)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          SL: {item.SoLuongDaNhan.toLocaleString()} /{" "}
                          {item.SoLuongThucSoan.toLocaleString()} {item.DVT}
                        </div>
                      </div>

                      <div className="flex size-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
                        {isCollapsed ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronUp className="size-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bảng danh sách cây / cuộn của vật tư */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100">
                      {item.filteredCays.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          Không có cây nào theo bộ lọc này
                        </div>
                      ) : (
                        item.filteredCays.map((cay, idx) => (
                          <div
                            key={cay.MaCay}
                            className={`flex flex-col gap-2 p-3 transition sm:flex-row sm:items-center sm:justify-between ${
                              cay.isXacNhan
                                ? "bg-emerald-50/20 hover:bg-emerald-50/40"
                                : "hover:bg-slate-50/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                {idx + 1}
                              </span>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-slate-900 sm:text-sm">
                                    {cay.MaCay}
                                  </span>
                                  {cay.isXacNhan ? (
                                    <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                      <CheckCircle2 className="size-3" />
                                      Đã nhận
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                      <Clock className="size-3" />
                                      Chờ nhận
                                    </span>
                                  )}
                                </div>

                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  <span>
                                    Kho xuất:{" "}
                                    <strong className="text-slate-700">
                                      {cay.SoLuongXuat} {item.DVT}
                                    </strong>
                                  </span>
                                  {cay.isXacNhan && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Thực nhận:{" "}
                                        <strong className="text-emerald-700">
                                          {cay.SoLuongThucNhan || cay.SoLuongXuat} {item.DVT}
                                        </strong>
                                      </span>
                                      {cay.TenNguoiXacNhan && (
                                        <>
                                          <span>•</span>
                                          <span>Bởi: {cay.TenNguoiXacNhan}</span>
                                        </>
                                      )}
                                      {cay.ThoiGianXacNhan && (
                                        <span>
                                          (
                                          {dayjs(cay.ThoiGianXacNhan).format(
                                            "DD/MM HH:mm",
                                          )}
                                          )
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Nút thao tác trực tiếp trên cây */}
                            <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0">
                              {cay.isXacNhan ? (
                                <Popconfirm
                                  title="Hủy nhận cây này?"
                                  description={`Hủy nhận mã [${cay.MaCay}]?`}
                                  onConfirm={() => handleHuyNhanRoll(cay)}
                                  okText="Hủy nhận"
                                  cancelText="Đóng"
                                >
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-95"
                                  >
                                    <RotateCcw className="size-3" />
                                    <span>Hủy nhận</span>
                                  </button>
                                </Popconfirm>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleScanRoll(cay.MaCay)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                                >
                                  <Check className="size-3.5" />
                                  <span>Xác nhận nhận</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
