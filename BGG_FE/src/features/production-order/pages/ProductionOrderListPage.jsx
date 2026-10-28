import {
  Ban,
  CheckCircle2,
  ClipboardList,
  ClipboardPlus,
  ExternalLink,
  Eye,
  Factory,
  FilePlus2,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Scissors,
  Search,
  Shirt,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { App as AntApp, Empty, Spin, message } from "antd";
import dayjs from "dayjs";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentProfile } from "../../../shared/auth/session";
import {
  cancelMaterialOrderFromLsx,
  createPickingOrderFromMaterialOrder,
  getListProductionOrders,
  getMaterialOrderDetail,
  getMaterialOrders,
} from "../api/productionOrderAPI";

const LSX_STATUS_MAP = {
  DaDuyet: {
    label: "Đã duyệt",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  QLDHDuyet: {
    label: "QLĐH duyệt",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  KeHoachDuyet: {
    label: "KH duyệt",
    cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  MoiTao: {
    label: "Mới tạo",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

function getDdhStatusBadge(ddh) {
  const trangThai = String(ddh?.TrangThai || "")
    .trim()
    .toLowerCase();
  const tinhTrangPsh = String(ddh?.TinhTrangPSH || "")
    .trim()
    .toLowerCase();

  if (trangThai === "dahuy") {
    return {
      label: "Đã hủy",
      cls: "bg-rose-50 text-rose-700 border-rose-200 line-through",
    };
  }
  if (trangThai === "hoanthanh" || tinhTrangPsh === "hoanthanh") {
    return {
      label: "Đã xuất hoàn thành",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (tinhTrangPsh === "dangthuchien") {
    return {
      label: "Kho đang quét soạn",
      cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  }
  if (ddh?.PhieuSoanHangId && tinhTrangPsh === "moitao") {
    return {
      label: "Đã tạo PSH (Chưa quét)",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  return {
    label: "Chờ Kho tạo Phiếu soạn",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

function canCancelDdh(ddh) {
  const trangThai = String(ddh?.TrangThai || "")
    .trim()
    .toLowerCase();
  const tinhTrangPsh = String(ddh?.TinhTrangPSH || "")
    .trim()
    .toLowerCase();
  if (trangThai === "dahuy" || trangThai === "hoanthanh") return false;
  if (tinhTrangPsh === "hoanthanh" || tinhTrangPsh === "dangthuchien")
    return false;
  return true;
}

function canCreatePsh(ddh) {
  const trangThai = String(ddh?.TrangThai || "")
    .trim()
    .toLowerCase();
  const tinhTrangPsh = String(ddh?.TinhTrangPSH || "")
    .trim()
    .toLowerCase();
  if (trangThai === "dahuy") return false;
  if (ddh?.PhieuSoanHangId && tinhTrangPsh !== "huy") return false;
  return true;
}

function formatDate(val) {
  if (!val) return "—";
  const d = dayjs(val);
  return d.isValid() ? d.format("DD/MM/YYYY") : "—";
}

function formatDateTime(val) {
  if (!val) return "—";
  const d = dayjs(val);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : "—";
}

export default function ProductionOrderListPage({ initialTab }) {
  const navigate = useNavigate();
  const { modal } = AntApp.useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get("tab") || initialTab || "lsx";
  const [activeTab, setActiveTab] = useState(currentTab); // "lsx" | "ddh"

  const profile = getCurrentProfile();
  const tkId = Number(profile?.TKId || 0);
  const currentUserName = useMemo(() => {
    const full = [profile?.HoVaTenLot, profile?.Ten]
      .filter(Boolean)
      .join(" ")
      .trim();
    return full || profile?.TenDangNhap || "Người dùng Web";
  }, [profile]);

  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ddhTypeFilter, setDdhTypeFilter] = useState("ALL");
  const [ddhStatusFilter, setDdhStatusFilter] = useState("ALL");

  const [lsxList, setLsxList] = useState([]);
  const [ddhList, setDdhList] = useState([]);

  // Trạng thái thao tác tạo PSH hoặc hủy đơn
  const [creatingPshId, setCreatingPshId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Bottom sheet / Modal xem chi tiết đơn đặt hàng đã tạo
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const openedPushOrder = useRef(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDdh, setSelectedDdh] = useState(null);
  const [selectedDdhItems, setSelectedDdhItems] = useState([]);

  // Đồng bộ tab trên URL query param
  const handleChangeTab = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabKey === "ddh") {
        next.set("tab", "ddh");
      } else {
        next.delete("tab");
        next.delete("type");
      }
      return next;
    });
  };

  const fetchLsxList = async () => {
    try {
      setLoading(true);
      const res = await getListProductionOrders({});
      setLsxList(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách LSX:", err);
      message.error(err?.message || "Không thể tải danh sách Lệnh sản xuất");
    } finally {
      setLoading(false);
    }
  };

  const fetchDdhList = async () => {
    try {
      setLoading(true);
      const res = await getMaterialOrders({});
      setDdhList(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách Đơn đặt hàng LSX:", err);
      message.error(err?.message || "Không thể tải danh sách Đơn đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || initialTab || "lsx";
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    const typeFromUrl = searchParams.get("type");
    if (typeFromUrl && ["ALL", "NguyenLieu", "PhuLieu"].includes(typeFromUrl)) {
      setDdhTypeFilter(typeFromUrl);
    }
  }, [searchParams, initialTab]);

  const countCat = useMemo(
    () => ddhList.filter((d) => d.LoaiDatHang === "NguyenLieu").length,
    [ddhList],
  );
  const countMay = useMemo(
    () => ddhList.filter((d) => d.LoaiDatHang === "PhuLieu").length,
    [ddhList],
  );

  useEffect(() => {
    if (activeTab === "lsx") {
      fetchLsxList();
    } else {
      fetchDdhList();
    }
  }, [activeTab]);

  const filteredLsx = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return lsxList.filter((item) => {
      if (statusFilter !== "ALL" && item.TrangThai !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        String(item.SoLSX || "")
          .toLowerCase()
          .includes(q) ||
        String(item.MaHang || "")
          .toLowerCase()
          .includes(q) ||
        String(item.KhachHang || "")
          .toLowerCase()
          .includes(q) ||
        String(item.NhaCat || "")
          .toLowerCase()
          .includes(q) ||
        String(item.ToMay || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [lsxList, keyword, statusFilter]);

  const filteredDdh = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return ddhList.filter((item) => {
      if (ddhTypeFilter !== "ALL" && item.LoaiDatHang !== ddhTypeFilter) {
        return false;
      }
      if (ddhStatusFilter !== "ALL") {
        const itemTt = String(item.TrangThai || "").toLowerCase();
        const itemPshTt = String(item.TinhTrangPSH || "").toLowerCase();
        if (ddhStatusFilter === "ChoSoanHang") {
          if (itemTt === "dahuy" || (item.PhieuSoanHangId && itemPshTt !== "huy")) {
            return false;
          }
        } else if (ddhStatusFilter === "DaTaoPSH") {
          if (!item.PhieuSoanHangId || itemPshTt === "huy" || itemPshTt === "hoanthanh") {
            return false;
          }
        } else if (ddhStatusFilter === "HoanThanh") {
          if (itemTt !== "hoanthanh" && itemPshTt !== "hoanthanh") {
            return false;
          }
        } else if (ddhStatusFilter === "DaHuy") {
          if (itemTt !== "dahuy") {
            return false;
          }
        }
      }
      if (!q) return true;
      return (
        String(item.SoDonDatHang || "")
          .toLowerCase()
          .includes(q) ||
        String(item.SoLSX || "")
          .toLowerCase()
          .includes(q) ||
        String(item.MaHang || "")
          .toLowerCase()
          .includes(q) ||
        String(item.NguoiDat || "")
          .toLowerCase()
          .includes(q) ||
        String(item.MaSoPhieuSoan || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [ddhList, keyword, ddhTypeFilter, ddhStatusFilter]);

  const handleOpenBooking = (lsxItem, loaiDatHang) => {
    navigate(
      `/production-order-booking?lsxId=${lsxItem.LSXId}&type=${loaiDatHang}`,
      {
        state: { lsx: lsxItem, loaiDatHang },
      },
    );
  };

  const handleViewDdhDetail = async (ddh) => {
    setSelectedDdh(ddh);
    setSelectedDdhItems([]);
    setDetailModalOpen(true);
    try {
      setDetailLoading(true);
      const res = await getMaterialOrderDetail(ddh.DonDatHangId);
      if (res?.data?.header) {
        setSelectedDdh(res.data.header);
      }
      setSelectedDdhItems(
        Array.isArray(res?.data?.chiTiet) ? res.data.chiTiet : [],
      );
    } catch (err) {
      message.error(err?.message || "Không thể tải chi tiết đơn đặt hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  const notificationOrderId = Number(searchParams.get("orderId") || 0);
  useEffect(() => {
    if (!Number.isSafeInteger(notificationOrderId) || notificationOrderId <= 0 || openedPushOrder.current === notificationOrderId) return;
    openedPushOrder.current = notificationOrderId;
    void handleViewDdhDetail({ DonDatHangId: notificationOrderId });
  }, [notificationOrderId]);

  // Mở màn hình Phiếu Soạn Hàng (Picking Order)
  const handleOpenPickingOrder = (ddh, e) => {
    if (e) e.stopPropagation();
    if (!ddh?.PhieuSoanHangId) return;

    navigate(
      `/picking-order-detail?phieuSoanHangId=${encodeURIComponent(ddh.PhieuSoanHangId)}`,
      {
      state: {
        order: {
          PhieuSoanHangId: ddh.PhieuSoanHangId,
          MaSoPhieuSoan: ddh.MaSoPhieuSoan,
          DDH: ddh.SoDonDatHang,
          PO: ddh.SoLSX,
          MaHang: ddh.MaHang,
          CapCho:
            ddh.LoaiDatHang === "NguyenLieu"
              ? `Nhà cắt ${ddh.NhaCat || ""}`
              : `Tổ may ${ddh.ToMay || ""}`,
          TinhTrang: ddh.TinhTrangPSH || "moitao",
        },
      },
      },
    );
  };

  // Thủ kho duyệt đơn và TẠO PHIẾU SOẠN HÀNG TRỰC TIẾP TỪ ĐƠN
  const handleCreatePsh = (ddh, e) => {
    if (e) e.stopPropagation();
    if (!canCreatePsh(ddh)) {
      message.info(
        `Đơn [${ddh.SoDonDatHang}] đã có Phiếu soạn hàng [${ddh.MaSoPhieuSoan}].`,
      );
      return;
    }

    const loaiKhoText =
      ddh.LoaiDatHang === "NguyenLieu"
        ? "Kho Vải (NA)"
        : "Kho Phụ Liệu (PA)";

    const returnToDetail = detailModalOpen;
    setDetailModalOpen(false);
    let createdPickingOrder = null;
    let restoreDetail = false;

    modal.confirm({
      width: 600,
      centered: true,
      className: "egmf-confirm",
      icon: <span className="egmf-confirm-icon"><FilePlus2 size={24} /></span>,
      onCancel: () => { restoreDetail = returnToDetail; },
      afterClose: () => {
        if (restoreDetail) setDetailModalOpen(true);
        if (createdPickingOrder) {
          const { maPsh, pshId } = createdPickingOrder;
          modal.confirm({
            width: 560,
            centered: true,
            className: "egmf-confirm",
            title: `Phiếu soạn [${maPsh}] đã được phát hành!`,
            content:
              "Bạn có muốn mở ngay màn hình chi tiết Phiếu soạn hàng để kiểm tra hoặc bắt đầu quét xuất kho không?",
            okText: "Mở Phiếu Soạn ngay",
            okButtonProps: {
              className: "bg-blue-600 hover:bg-blue-700 text-white font-bold",
            },
            cancelText: "Ở lại danh sách đơn",
            onOk: () => {
              navigate(
                `/picking-order-detail?phieuSoanHangId=${encodeURIComponent(pshId)}`,
                {
                state: {
                  order: {
                    PhieuSoanHangId: pshId,
                    MaSoPhieuSoan: maPsh,
                    DDH: ddh.SoDonDatHang,
                    PO: ddh.SoLSX,
                    MaHang: ddh.MaHang,
                    CapCho:
                      ddh.LoaiDatHang === "NguyenLieu"
                        ? `Nhà cắt ${ddh.NhaCat || ""}`
                        : `Tổ may ${ddh.ToMay || ""}`,
                    TinhTrang: "moitao",
                  },
                },
                },
              );
            },
          });
        }
      },
      title: "Tạo phiếu soạn hàng?",
      content: (
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-slate-600">
            Tạo phiếu để <strong>{loaiKhoText}</strong> soạn và cấp vật tư cho đơn này.
          </p>
          <dl className="egmf-confirm-summary">
            <div><dt>Đơn đặt hàng</dt><dd>{ddh.SoDonDatHang}</dd></div>
            <div><dt>Mã hàng</dt><dd>{ddh.MaHang || "—"}</dd></div>
            <div><dt>Lệnh sản xuất</dt><dd>{ddh.SoLSX || "—"}</dd></div>
            <div><dt>Người đặt</dt><dd>{ddh.NguoiDat || "—"}</dd></div>
          </dl>
        </div>
      ),
      okText: "Tạo phiếu soạn",
      okButtonProps: {
        className:
          "bg-egmf-primary hover:bg-egmf-primary-deep text-white font-bold",
      },
      cancelText: "Quay lại",
      onOk: async () => {
        try {
          setCreatingPshId(ddh.DonDatHangId);
          const res = await createPickingOrderFromMaterialOrder(
            ddh.DonDatHangId,
            {
              tkId,
              nguoiTao: currentUserName,
            },
          );
          const maPsh = res?.data?.maSoPhieuSoan || "";
          const pshId = res?.data?.phieuSoanHangId;

          message.success(
            `Đã tạo Phiếu Soạn Hàng [${maPsh}] cho đơn [${ddh.SoDonDatHang}] thành công!`,
          );

          // Cập nhật selectedDdh nếu đang mở modal
          if (selectedDdh?.DonDatHangId === ddh.DonDatHangId) {
            setSelectedDdh((prev) =>
              prev
                ? {
                    ...prev,
                    TrangThai: "DaTaoPSH",
                    TenTrangThai: "Đã tạo PSH (Chưa quét)",
                    PhieuSoanHangId: pshId,
                    MaSoPhieuSoan: maPsh,
                    TinhTrangPSH: "moitao",
                  }
                : null,
            );
          }

          await fetchDdhList();

          createdPickingOrder = { maPsh, pshId };
        } catch (err) {
          message.error(err?.message || "Không thể tạo Phiếu Soạn Hàng");
        } finally {
          setCreatingPshId(null);
        }
      },
    });
  };

  const handleCancelDdh = (ddh, e) => {
    if (e) e.stopPropagation();
    if (!canCancelDdh(ddh)) {
      message.warning(
        `Đơn đặt hàng [${ddh?.SoDonDatHang}] không thể hủy ở trạng thái hiện tại!`,
      );
      return;
    }

    const returnToDetail = detailModalOpen;
    let restoreDetail = false;
    setDetailModalOpen(false);

    modal.confirm({
      width: 600,
      centered: true,
      className: "egmf-confirm",
      onCancel: () => { restoreDetail = returnToDetail; },
      afterClose: () => { if (restoreDetail) setDetailModalOpen(true); },
      title: `Hủy đơn ${ddh.SoDonDatHang}?`,
      content:
        "Đơn đặt hàng sẽ chuyển sang trạng thái Đã hủy (nếu có Phiếu soạn ở trạng thái Mới tạo chưa quét cũng sẽ tự động hủy).",
      okText: "Xác nhận hủy đơn",
      okButtonProps: { danger: true },
      cancelText: "Đóng",
      onOk: async () => {
        try {
          setCancelling(true);
          await cancelMaterialOrderFromLsx(ddh.DonDatHangId, currentUserName);
          message.success(
            `Đã hủy đơn đặt hàng [${ddh.SoDonDatHang}] thành công!`,
          );
          if (selectedDdh?.DonDatHangId === ddh.DonDatHangId) {
            setSelectedDdh((prev) =>
              prev
                ? {
                    ...prev,
                    TrangThai: "DaHuy",
                    TenTrangThai: "Đã hủy",
                    PhieuSoanHangId: null,
                    MaSoPhieuSoan: "",
                  }
                : null,
            );
          }
          await fetchDdhList();
        } catch (err) {
          message.error(err?.message || "Không thể hủy đơn đặt hàng");
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  return (
    <MainLayout screenTitle="Đặt hàng & Cấp phát vật tư LSX" headerBackTo="/home">
      <div className="min-h-full bg-egmf-surface p-2.5 sm:p-4 md:p-5">
        <div className="mx-auto max-w-6xl space-y-3 sm:space-y-4">
          {/* HEADER & CHUYỂN TAB (TỐI ƯU TOUCH CHO MOBILE & TABLET) */}
          <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
            <div className="flex items-center justify-between gap-2.5 border-b border-egmf-border px-3.5 py-3 sm:px-5 sm:py-3.5">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-egmf-primary-tint text-egmf-primary-strong">
                  <Factory size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[16px] font-extrabold leading-tight text-egmf-ink sm:text-lg">
                    {activeTab === "lsx"
                      ? "Đặt hàng Nhà Cắt & Nhà May"
                      : "Danh sách Đơn đặt & Tạo Phiếu Soạn"}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-egmf-muted sm:text-sm">
                    {activeTab === "lsx"
                      ? "Chọn Lệnh sản xuất để tính BOM và gửi đơn sang Kho"
                      : "Tiếp nhận đơn đặt hàng và chủ động phát hành Phiếu Soạn Hàng"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  activeTab === "lsx" ? fetchLsxList() : fetchDdhList()
                }
                className="inline-flex h-11 shrink-0 touch-manipulation items-center gap-1.5 rounded-xl border border-egmf-border bg-white px-3 text-xs font-bold text-egmf-ink-secondary transition active:scale-95 hover:border-egmf-primary hover:text-egmf-primary sm:px-3.5 sm:text-sm"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="hidden xs:inline sm:inline">Làm mới</span>
              </button>
            </div>

            <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
              {/* TAB BUTTONS - CAO 48PX DỄ CHẠM TRÊN ĐIỆN THOẠI & TABLET */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => handleChangeTab("lsx")}
                  className={`flex min-h-[46px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold transition-all sm:gap-2 sm:text-sm ${
                    activeTab === "lsx"
                      ? "bg-egmf-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ClipboardList size={17} className="shrink-0" />
                  <span className="truncate">
                    1. Lệnh Sản Xuất ({lsxList.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTab("ddh")}
                  className={`flex min-h-[46px] touch-manipulation items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold transition-all sm:gap-2 sm:text-sm ${
                    activeTab === "ddh"
                      ? "bg-egmf-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileSpreadsheet size={17} className="shrink-0" />
                  <span className="truncate">
                    2. Đơn Đặt Hàng ({ddhList.length})
                  </span>
                </button>
              </div>

              {/* PHÂN LOẠI KHO NHẬN ĐƠN (KHO VẢI CẮT / KHO PHỤ LIỆU MAY) */}
              {activeTab === "ddh" && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs font-bold text-slate-500">Kho nhận đơn:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDdhTypeFilter("ALL");
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete("type");
                        return next;
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      ddhTypeFilter === "ALL"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>Tất cả đơn</span>
                    <span className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {ddhList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDdhTypeFilter("NguyenLieu");
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("type", "NguyenLieu");
                        return next;
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      ddhTypeFilter === "NguyenLieu"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "border border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <Scissors size={13} />
                    <span>Kho Vải (Cắt)</span>
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                      {countCat}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDdhTypeFilter("PhuLieu");
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("type", "PhuLieu");
                        return next;
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      ddhTypeFilter === "PhuLieu"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "border border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    <Shirt size={13} />
                    <span>Kho Phụ Liệu (May)</span>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                      {countMay}
                    </span>
                  </button>
                </div>
              )}

              {/* SEARCH + HORIZONTAL FILTER PILLS */}
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
                <div className="flex h-12 flex-1 items-center gap-2.5 rounded-xl border border-egmf-border bg-egmf-surface px-3.5 focus-within:border-egmf-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-egmf-primary/15">
                  <Search size={19} className="shrink-0 text-egmf-muted" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={
                      activeTab === "lsx"
                        ? "Tìm Số LSX, Mã hàng, Khách hàng, Tổ may, Nhà cắt..."
                        : "Tìm Số ĐĐH, Số LSX, Mã hàng, Mã PSH, Người đặt..."
                    }
                    className="h-full w-full bg-transparent text-base font-medium text-egmf-ink outline-none placeholder:font-normal placeholder:text-egmf-muted"
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword("")}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 active:scale-95"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
                  {activeTab === "lsx" ? (
                    <label className="order-filter-label">
                      Trạng thái lệnh sản xuất
                      <select className="order-combobox" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="DaDuyet">Đã duyệt</option>
                        <option value="MoiTao">Mới tạo</option>
                      </select>
                    </label>
                  ) : (
                    <>
                      <label className="order-filter-label">
                        Bộ phận / Kho
                        <select className="order-combobox" value={ddhTypeFilter} onChange={(e) => setDdhTypeFilter(e.target.value)}>
                          <option value="ALL">Tất cả bộ phận / kho</option>
                          <option value="NguyenLieu">Kho Vải (Nhà cắt)</option>
                          <option value="PhuLieu">Kho Phụ liệu (Nhà may)</option>
                        </select>
                      </label>
                      <label className="order-filter-label">
                        Trạng thái đơn đặt hàng
                        <select className="order-combobox" value={ddhStatusFilter} onChange={(e) => setDdhStatusFilter(e.target.value)}>
                          <option value="ALL">Tất cả trạng thái</option>
                          <option value="ChoSoanHang">Chờ tạo phiếu soạn</option>
                          <option value="DaTaoPSH">Đã có phiếu soạn</option>
                          <option value="HoanThanh">Đã xuất</option>
                          <option value="DaHuy">Đã hủy</option>
                        </select>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* DANH SÁCH THẺ (CARDS) */}
          <section>
            {loading ? (
              <div className="flex min-h-60 items-center justify-center rounded-2xl border border-egmf-border bg-white p-6">
                <Spin size="large" />
              </div>
            ) : activeTab === "lsx" ? (
              filteredLsx.length === 0 ? (
                <div className="rounded-2xl border border-egmf-border bg-white py-12">
                  <Empty description="Không tìm thấy Lệnh sản xuất phù hợp" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  {filteredLsx.map((lsx) => {
                    const st = LSX_STATUS_MAP[lsx.TrangThai] || {
                      label: lsx.TrangThai || "Mới tạo",
                      cls: "bg-slate-100 text-slate-700 border-slate-200",
                    };

                    return (
                      <article
                        key={lsx.LSXId}
                        className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-egmf-card transition hover:border-egmf-primary/60 sm:p-4"
                      >
                        <div>
                          {/* DÒNG TRÊN: SỐ LSX + TRẠNG THÁI */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-egmf-primary-tint px-2 py-0.5 text-xs font-extrabold text-egmf-primary-strong">
                                  <Layers size={13} />
                                  {lsx.SoLSX}
                                </span>
                                <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700">
                                  {Number(
                                    lsx.TongSanLuong || 0,
                                  ).toLocaleString("vi-VN")}{" "}
                                  SP
                                </span>
                              </div>

                              <h3 className="mt-1.5 break-words text-[16px] font-extrabold leading-snug text-slate-900 sm:text-lg">
                                Mã hàng: {lsx.MaHang || "—"}
                              </h3>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:text-xs ${st.cls}`}
                            >
                              {st.label}
                            </span>
                          </div>

                          {/* LƯỚI THÔNG TIN 2 CỘT GỌN GÀNG CHO MOBILE & TABLET */}
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs sm:gap-2.5 sm:p-3 sm:text-sm">
                            <div className="min-w-0">
                              <span className="block text-[11px] font-medium text-slate-400">
                                Khách hàng
                              </span>
                              <strong className="mt-0.5 block truncate text-slate-800">
                                {lsx.KhachHang || "—"}
                              </strong>
                            </div>

                            <div className="min-w-0">
                              <span className="block text-[11px] font-medium text-slate-400">
                                Chi tiết cỡ/màu
                              </span>
                              <strong className="mt-0.5 block truncate text-slate-800">
                                {lsx.SoDongChiTiet || 0} dòng PO/Size
                              </strong>
                            </div>

                            <div className="min-w-0">
                              <span className="block text-[11px] font-medium text-slate-400">
                                Nhà cắt • Ngày cần
                              </span>
                              <strong className="mt-0.5 block truncate text-slate-800">
                                {lsx.NhaCat || "—"} ({formatDate(lsx.NgayCanMauCat)})
                              </strong>
                            </div>

                            <div className="min-w-0">
                              <span className="block text-[11px] font-medium text-slate-400">
                                Tổ may • Vào chuyền
                              </span>
                              <strong className="mt-0.5 block truncate text-slate-800">
                                {lsx.ToMay || "—"} ({formatDate(lsx.NgayVaoChuyen)})
                              </strong>
                            </div>
                          </div>

                          {/* SỐ ĐƠN ĐÃ TẠO */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700">
                              <Scissors size={12} />
                              Đơn Cắt: {lsx.SoDonCat || 0}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-800">
                              <Shirt size={12} />
                              Đơn May: {lsx.SoDonMay || 0}
                            </span>
                          </div>
                        </div>

                        {/* NÚT HÀNH ĐỘNG LỚN DỄ BẤM TRÊN TABLET & ĐIỆN THOẠI */}
                        <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => handleOpenBooking(lsx, "NguyenLieu")}
                            className="flex min-h-[48px] touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] sm:text-sm"
                          >
                            <Scissors size={16} className="shrink-0" />
                            <span>Nhà Cắt Đặt NL</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenBooking(lsx, "PhuLieu")}
                            className="flex min-h-[48px] touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-amber-700 active:scale-[0.98] sm:text-sm"
                          >
                            <Shirt size={16} className="shrink-0" />
                            <span>Nhà May Đặt PL</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )
            ) : filteredDdh.length === 0 ? (
              <div className="rounded-2xl border border-egmf-border bg-white py-12">
                <Empty description="Chưa có đơn đặt hàng nào phù hợp bộ lọc" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {filteredDdh.map((ddh) => {
                  const isCat = ddh.LoaiDatHang === "NguyenLieu";
                  const st = getDdhStatusBadge(ddh);
                  const allowCancel = canCancelDdh(ddh);
                  const allowCreatePsh = canCreatePsh(ddh);
                  const isThisCreating = creatingPshId === ddh.DonDatHangId;

                  return (
                    <article
                      key={ddh.DonDatHangId}
                      onClick={() => handleViewDdhDetail(ddh)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleViewDdhDetail(ddh);
                        }
                      }}
                      className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 shadow-egmf-card transition active:scale-[0.99] hover:border-egmf-primary/60 sm:p-4 ${
                        ddh.TrangThai === "DaHuy"
                          ? "border-slate-200 bg-slate-50/80 opacity-75"
                          : "border-slate-200/90 bg-white"
                      }`}
                    >
                      <div>
                        {/* DÒNG HEADER ĐƠN: LOẠI ĐƠN + SỐ LSX + TRẠNG THÁI */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-extrabold ${
                                  isCat
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isCat ? (
                                  <Scissors size={12} />
                                ) : (
                                  <Shirt size={12} />
                                )}
                                {isCat
                                  ? "Nhà cắt (Kho Vải)"
                                  : "Nhà may (Kho PL)"}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                • {ddh.SoLSX}
                              </span>
                            </div>

                            <h3
                              className={`mt-1.5 text-base font-extrabold sm:text-lg ${
                                ddh.TrangThai === "DaHuy"
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {ddh.SoDonDatHang}
                            </h3>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:text-xs ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </div>

                        {/* THÔNG TIN CHI TIẾT */}
                        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs sm:p-3 sm:text-sm">
                          <div className="min-w-0">
                            <span className="block text-[11px] text-slate-400">
                              Mã hàng
                            </span>
                            <strong className="mt-0.5 block truncate text-slate-800">
                              {ddh.MaHang || "—"}
                            </strong>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[11px] text-slate-400">
                              Số mặt hàng
                            </span>
                            <strong className="mt-0.5 block truncate text-egmf-primary-strong">
                              {ddh.SoMatHang || 0} dòng NPL
                            </strong>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[11px] text-slate-400">
                              Người đặt
                            </span>
                            <strong className="mt-0.5 block truncate text-slate-800">
                              {ddh.NguoiDat || "—"}
                            </strong>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[11px] text-slate-400">
                              Ngày cần giao
                            </span>
                            <strong className="mt-0.5 block truncate text-slate-800">
                              {formatDate(ddh.NgayCanGiao)}
                            </strong>
                          </div>
                          {ddh.MaSoPhieuSoan && (
                            <div className="col-span-2 flex items-center justify-between rounded-lg bg-blue-50/80 px-2.5 py-1.5">
                              <div className="text-xs text-slate-700">
                                Phiếu soạn:{" "}
                                <strong className="font-extrabold text-egmf-primary sm:text-sm">
                                  {ddh.MaSoPhieuSoan}
                                </strong>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleOpenPickingOrder(ddh, e)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                              >
                                <span>Mở PSH</span>
                                <ExternalLink size={13} />
                              </button>
                            </div>
                          )}
                          {ddh.GhiChuLot && (
                            <div className="col-span-2 truncate text-xs text-slate-600">
                              <span className="font-bold">Lot:</span>{" "}
                              {ddh.GhiChuLot}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* KHU VỰC NÚT THAO TÁC CỦA ĐƠN ĐẶT HÀNG (CÓ TẠO PHIẾU SOẠN NGAY TẠI THẺ) */}
                      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
                          {formatDateTime(ddh.NgayDat)}
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* NÚT TẠO PHIẾU SOẠN HÀNG TRỰC TIẾP TỪ ĐƠN ĐẶT */}
                          {allowCreatePsh && (
                            <button
                              type="button"
                              disabled={isThisCreating}
                              onClick={(e) => handleCreatePsh(ddh, e)}
                              className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl bg-egmf-primary px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95 hover:bg-egmf-primary-deep disabled:opacity-50"
                            >
                              <FilePlus2 size={15} />
                              <span>
                                {isThisCreating
                                  ? "Đang tạo..."
                                  : "Tạo phiếu soạn"}
                              </span>
                            </button>
                          )}

                          {/* NÚT MỞ PHIẾU SOẠN (NẾU ĐÃ CÓ PSH) */}
                          {ddh.PhieuSoanHangId && ddh.TinhTrangPSH !== "huy" && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenPickingOrder(ddh, e)}
                              className="inline-flex min-h-[38px] touch-manipulation items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-blue-700 active:scale-95 hover:bg-blue-100"
                            >
                              <ExternalLink size={14} />
                              <span>Soạn hàng</span>
                            </button>
                          )}

                          {/* NÚT HỦY ĐƠN */}
                          {allowCancel && (
                            <button
                              type="button"
                              disabled={cancelling}
                              onClick={(e) => handleCancelDdh(ddh, e)}
                              className="inline-flex min-h-[38px] touch-manipulation items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-extrabold text-rose-600 active:scale-95 hover:bg-rose-100"
                            >
                              <Ban size={14} />
                              <span>Hủy</span>
                            </button>
                          )}

                          {/* NÚT XEM CHI TIẾT */}
                          <span className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                            <Eye size={14} />
                            <span>Xem VT</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* BOTTOM SHEET (MOBILE) / MODAL (TABLET & DESKTOP) XEM CHI TIẾT ĐƠN ĐẶT HÀNG & TẠO PHIẾU SOẠN */}
      {detailModalOpen && selectedDdh && (
        <div
          className="egmf-dialog-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chi tiết đơn đặt hàng"
            className="egmf-dialog-panel flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85dvh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* THANH KÉO TRÊN MOBILE */}
            <div className="flex justify-center pt-2 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-extrabold ${
                      selectedDdh.LoaiDatHang === "NguyenLieu"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedDdh.LoaiDatHang === "NguyenLieu"
                      ? "Nhà cắt (Kho Vải)"
                      : "Nhà may (Kho Phụ Liệu)"}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    • {selectedDdh.SoLSX}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                      getDdhStatusBadge(selectedDdh).cls
                    }`}
                  >
                    {getDdhStatusBadge(selectedDdh).label}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-base font-extrabold text-slate-900 sm:text-lg">
                  {selectedDdh.SoDonDatHang} — Mã hàng: {selectedDdh.MaHang}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:scale-95 hover:bg-slate-200"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
              {/* TÓM TẮT ĐƠN */}
              <div className="mb-3.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-4 sm:text-sm">
                <div>
                  <span className="block text-[11px] text-slate-400">
                    Người đặt
                  </span>
                  <strong className="text-slate-800">
                    {selectedDdh.NguoiDat || "—"}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">
                    Ngày cần giao
                  </span>
                  <strong className="text-slate-800">
                    {formatDate(selectedDdh.NgayCanGiao)}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">
                    Phiếu soạn kho
                  </span>
                  <strong className="text-egmf-primary">
                    {selectedDdh.MaSoPhieuSoan || "Chưa tạo PSH"}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">
                    Ghi chú Lot
                  </span>
                  <strong className="text-slate-800">
                    {selectedDdh.GhiChuLot || "—"}
                  </strong>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <Spin size="large" />
                </div>
              ) : selectedDdhItems.length === 0 ? (
                <Empty description="Không có dữ liệu vật tư" />
              ) : (
                <>
                  {/* GIAO DIỆN THẺ (CARDS) CHO MOBILE & TABLET NHỎ - KHÔNG CẦN CUỘN NGANG */}
                  <div className="space-y-2.5 md:hidden">
                    {selectedDdhItems.map((it, idx) => (
                      <div
                        key={it.ChiTietId || idx}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-extrabold text-slate-700">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {it.MaVatTu}
                            </span>
                          </div>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            ĐVT: {it.DVT || "—"}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-700">
                          {it.TenVatTu}
                        </p>

                        <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-400">
                              Định mức × SP
                            </span>
                            <strong className="text-slate-700">
                              {Number(it.DinhMuc || 0).toLocaleString("vi-VN", {
                                maximumFractionDigits: 4,
                              })}{" "}
                              ×{" "}
                              {Number(it.SoLuongSanPham || 0).toLocaleString(
                                "vi-VN",
                              )}
                            </strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">
                              SL Yêu cầu
                            </span>
                            <strong className="text-sm font-extrabold text-egmf-primary">
                              {Number(it.SoLuongYeuCau || 0).toLocaleString(
                                "vi-VN",
                                { maximumFractionDigits: 4 },
                              )}
                            </strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">
                              Thực xuất
                            </span>
                            <strong className="text-sm font-extrabold text-emerald-700">
                              {Number(it.SoLuongThucXuat || 0).toLocaleString(
                                "vi-VN",
                                { maximumFractionDigits: 4 },
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BẢNG TRÊN TABLET NGANG & DESKTOP */}
                  <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                          <th className="px-3 py-2.5 text-center">#</th>
                          <th className="px-3 py-2.5">Mã vật tư</th>
                          <th className="px-3 py-2.5">Tên / Diễn giải NPL</th>
                          <th className="px-3 py-2.5 text-center">ĐVT</th>
                          <th className="px-3 py-2.5 text-right">Định mức</th>
                          <th className="px-3 py-2.5 text-right">SL SP</th>
                          <th className="px-3 py-2.5 text-right">SL Yêu cầu</th>
                          <th className="px-3 py-2.5 text-right">Thực xuất</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDdhItems.map((it, idx) => (
                          <tr
                            key={it.ChiTietId || idx}
                            className="hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-2.5 text-center font-medium text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-slate-900">
                              {it.MaVatTu}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700">
                              <div>{it.TenVatTu}</div>
                              {it.GhiChu && (
                                <div className="text-xs text-slate-400">
                                  {it.GhiChu}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center font-medium text-slate-600">
                              {it.DVT}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-600">
                              {Number(it.DinhMuc || 0).toLocaleString("vi-VN", {
                                maximumFractionDigits: 4,
                              })}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-700">
                              {Number(it.SoLuongSanPham || 0).toLocaleString(
                                "vi-VN",
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-egmf-primary">
                              {Number(it.SoLuongYeuCau || 0).toLocaleString(
                                "vi-VN",
                                { maximumFractionDigits: 4 },
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">
                              {Number(it.SoLuongThucXuat || 0).toLocaleString(
                                "vi-VN",
                                { maximumFractionDigits: 4 },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* FOOTER MODAL: NÚT TẠO PHIẾU SOẠN / MỞ PHIẾU SOẠN / HỦY ĐƠN */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-3">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="min-h-[46px] w-full rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 active:scale-[0.99] hover:bg-slate-300 sm:w-auto"
              >
                Đóng
              </button>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* NÚT TẠO PHIẾU SOẠN HÀNG TRỰC TIẾP TỪ POPUP CHI TIẾT */}
                {canCreatePsh(selectedDdh) && (
                  <button
                    type="button"
                    disabled={creatingPshId === selectedDdh.DonDatHangId}
                    onClick={(e) => handleCreatePsh(selectedDdh, e)}
                    className="inline-flex min-h-[46px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-md active:scale-[0.99] hover:bg-egmf-primary-deep disabled:opacity-50 sm:w-auto"
                  >
                    <FilePlus2 size={18} />
                    <span>
                      {creatingPshId === selectedDdh.DonDatHangId
                        ? "Đang tạo Phiếu Soạn..."
                        : "Tạo Phiếu Soạn Hàng"}
                    </span>
                  </button>
                )}

                {/* NÚT MỞ PHIẾU SOẠN (NẾU ĐÃ CÓ PSH) */}
                {selectedDdh.PhieuSoanHangId &&
                  selectedDdh.TinhTrangPSH !== "huy" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        setDetailModalOpen(false);
                        handleOpenPickingOrder(selectedDdh, e);
                      }}
                      className="inline-flex min-h-[46px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md active:scale-[0.99] hover:bg-blue-700 sm:w-auto"
                    >
                      <ExternalLink size={17} />
                      <span>
                        Mở Phiếu Soạn ({selectedDdh.MaSoPhieuSoan})
                      </span>
                    </button>
                  )}

                {/* NÚT HỦY ĐƠN ĐẶT */}
                {canCancelDdh(selectedDdh) && (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={(e) => handleCancelDdh(selectedDdh, e)}
                    className="inline-flex min-h-[46px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-xs active:scale-[0.99] hover:bg-rose-700 disabled:opacity-50 sm:w-auto"
                  >
                    <Ban size={16} />
                    <span>
                      {cancelling ? "Đang hủy..." : "Hủy đơn đặt hàng"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
