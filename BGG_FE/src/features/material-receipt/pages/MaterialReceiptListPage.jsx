import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  CalendarDays,
  PackageCheck,
  RefreshCw,
  Scissors,
  Search,
  Shirt,
  User,
  X,
} from "lucide-react";
import { App as AntApp, Empty, Spin } from "antd";
import dayjs from "dayjs";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentProfile } from "../../../shared/auth/session";
import { getDanhSachDonNhanHang } from "../api/materialReceiptApi";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ChoNhan", label: "Chờ nhận" },
  { key: "NhanMotPhan", label: "Nhận một phần" },
  { key: "DaNhanDu", label: "Đã nhận đủ" },
];

const TYPE_TABS = [
  { key: "ALL", label: "Tất cả NPL" },
  { key: "NguyenLieu", label: "Kho Vải (Nhà cắt)", icon: Scissors },
  { key: "PhuLieu", label: "Kho Phụ liệu (Tổ may)", icon: Shirt },
];

function getStatusBadge(trangThaiNhan) {
  switch (trangThaiNhan) {
    case "DaNhanDu":
      return {
        label: "Đã nhận đủ",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "NhanMotPhan":
      return {
        label: "Nhận một phần",
        cls: "bg-blue-50 text-blue-700 border-blue-200",
        icon: AlertCircle,
      };
    case "ChoNhan":
    default:
      return {
        label: "Chờ nhận",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      };
  }
}

export default function MaterialReceiptListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = getCurrentProfile();

  const typeParam = searchParams.get("type") || "ALL";
  const statusParam = searchParams.get("status") || "ALL";

  const [activeType, setActiveType] = useState(typeParam);
  const [activeStatus, setActiveStatus] = useState(statusParam);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ngayLoc, setNgayLoc] = useState("");

  console.log(ngayLoc);
  console.log(orders);

  useEffect(() => {
    setActiveType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    setActiveStatus(statusParam);
  }, [statusParam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDanhSachDonNhanHang({
        loaiDatHang: activeType,
        trangThai: activeStatus,
        tkId: profile?.TKId,
      });

      if (res && res.success) {
        setOrders(res.data || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn nhận hàng:", err);
      showErrorToast(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách đơn nhận hàng",
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, activeStatus]);

  // Bộ lọc tìm kiếm trên client
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term && !ngayLoc) return orders;

    return orders.filter((o) => {
      const ddh = (o.SoDonDatHang || "").toLowerCase();
      const psh = (o.MaSoPhieuSoan || "").toLowerCase();
      const lsx = (o.SoLSX || "").toLowerCase();
      const mh = (o.MaHang || "").toLowerCase();
      const bp = (o.BoPhanNhan || "").toLowerCase();
      const nguoi = (o.NguoiXuat || "").toLowerCase();

      const matchSearch =
        !term ||
        ddh.includes(term) ||
        psh.includes(term) ||
        lsx.includes(term) ||
        mh.includes(term) ||
        bp.includes(term) ||
        nguoi.includes(term);

      // Lọc theo ngày
      const ngaySoan = (o.NgaySoan || "").slice(0, 10);
      const matchDate = !ngayLoc || ngaySoan === ngayLoc;

      return matchSearch && matchDate;
    });
  }, [orders, searchTerm, ngayLoc]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = orders.length;
    const choNhan = orders.filter((o) => o.TrangThaiNhan === "ChoNhan").length;
    const motPhan = orders.filter(
      (o) => o.TrangThaiNhan === "NhanMotPhan",
    ).length;
    const daNhan = orders.filter((o) => o.TrangThaiNhan === "DaNhanDu").length;
    return { total, choNhan, motPhan, daNhan };
  }, [orders]);

  const handleTypeChange = (type) => {
    setActiveType(type);
    const params = new URLSearchParams(searchParams);
    if (type === "ALL") params.delete("type");
    else params.set("type", type);
    setSearchParams(params, { replace: true });
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    const params = new URLSearchParams(searchParams);
    if (status === "ALL") params.delete("status");
    else params.set("status", status);
    setSearchParams(params, { replace: true });
  };

  return (
    <MainLayout screenTitle="Nhận hàng NPL (Cắt / May)">
      <div className="mx-auto w-full max-w-[1400px] space-y-4 px-3 py-4 sm:px-6 sm:py-6">
        {/* Banner tiêu đề */}
        <div className="relative hidden overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-5 text-white shadow-md lg:block lg:p-6">
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <PackageCheck className="size-7 text-sky-200" />
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Nhận hàng NPL (Cắt & May)
                </h1>
              </div>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Quét mã barcode từng cây hoặc xác nhận nhận đủ theo phiếu xuất
                của kho
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25 active:scale-95 sm:text-sm"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </div>

          {/* Thống kê thẻ số liệu */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur sm:p-3">
              <div className="text-[11px] font-medium text-blue-100">
                Tổng số đơn
              </div>
              <div className="mt-0.5 text-lg font-bold sm:text-xl">
                {stats.total}
              </div>
            </div>
            <div className="rounded-xl bg-amber-400/20 p-2.5 backdrop-blur sm:p-3">
              <div className="text-[11px] font-medium text-amber-200">
                Chờ nhận
              </div>
              <div className="mt-0.5 text-lg font-bold text-amber-200 sm:text-xl">
                {stats.choNhan}
              </div>
            </div>
            <div className="rounded-xl bg-sky-400/20 p-2.5 backdrop-blur sm:p-3">
              <div className="text-[11px] font-medium text-sky-200">
                Đang nhận dở
              </div>
              <div className="mt-0.5 text-lg font-bold text-sky-100 sm:text-xl">
                {stats.motPhan}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-400/20 p-2.5 backdrop-blur sm:p-3">
              <div className="text-[11px] font-medium text-emerald-200">
                Đã nhận đủ
              </div>
              <div className="mt-0.5 text-lg font-bold text-emerald-200 sm:text-xl">
                {stats.daNhan}
              </div>
            </div>
          </div>
        </div>

        {/* Tab chuyển Kho Vải / Phụ liệu */}
        <div className="space-y-4 lg:grid lg:grid-cols-[auto_minmax(260px,1fr)_220px] lg:items-center lg:gap-3 lg:space-y-0 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3 lg:shadow-sm">
          <div className="space-y-2 lg:col-span-3 lg:border-b lg:border-slate-100 lg:pb-3">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:hidden">
              Kho nhận hàng
            </div>
            <div className="grid grid-cols-2 gap-2 px-1 lg:flex lg:gap-2 lg:px-0">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTypeChange(tab.key)}
                className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center text-xs font-semibold leading-tight transition active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm lg:shrink-0 lg:whitespace-nowrap ${
                  isActive
                    ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } ${tab.key === "PhuLieu" ? "col-span-2 lg:col-span-1" : ""}`}
              >
                {Icon && <Icon className="size-4" />}
                {tab.label}
              </button>
            );
          })}
            </div>
          </div>

        {/* Bộ lọc trạng thái & Tìm kiếm */}
        <div className="flex flex-col gap-3 lg:contents">
          {/* Status Tabs */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 lg:contents">
            <div className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:hidden">
              Trạng thái nhận hàng
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center lg:grid lg:grid-cols-4">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`min-h-12 rounded-xl px-2.5 py-2 text-xs font-medium transition sm:min-h-10 sm:py-1.5 ${
                    isActive
                      ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
            </div>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative w-full lg:min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ĐĐH, PSH, LSX, mã hàng..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Lọc theo thời gian */}
        <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 lg:h-11">
          <label
            htmlFor="material-receipt-date-filter"
            className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-600"
          >
            Lọc theo ngày
          </label>

          <div className="flex h-full min-w-0 flex-1 items-center gap-2 border-l border-slate-200 pl-2.5">
            <CalendarDays size={16} className="shrink-0 text-blue-600" />

            <input
              id="material-receipt-date-filter"
              type="date"
              value={ngayLoc}
              onChange={(e) => setNgayLoc(e.target.value)}
              className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-slate-700 outline-none [color-scheme:light]"
            />
            {ngayLoc && (
              <button
                type="button"
                onClick={() => setNgayLoc("")}
                aria-label="Xóa ngày đã chọn"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách thẻ đơn */}
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Spin size="large" />
              <span className="text-xs text-slate-500">
                Đang tải danh sách đơn nhận hàng...
              </span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-slate-500 sm:text-sm">
                  {searchTerm
                    ? "Không tìm thấy đơn nhận hàng phù hợp với từ khóa"
                    : "Hiện tại chưa có đơn hàng nào chờ nhận"}
                </span>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.TrangThaiNhan);
              const StatusIcon = statusBadge.icon;
              const isFabric =
                order.LoaiDatHang === "NguyenLieu" ||
                (!order.LoaiDatHang &&
                  (order.MaSoPhieuSoan || "").startsWith("NA"));
              const progress = Number(order.TiLeNhan) || 0;

              return (
                <div
                  key={order.PhieuSoanHangId}
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/material-receipts/${order.PhieuSoanHangId}`, {
                      state: { order },
                    })
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/material-receipts/${order.PhieuSoanHangId}`, {
                        state: { order },
                      });
                    }
                  }}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:p-5"
                >
                  <div className="space-y-4">
                    {/* Hàng nhãn trên cùng: Bộ phận nhận + Trạng thái nhận */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
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
                        {order.BoPhanNhan || (isFabric ? "Nhà cắt" : "Tổ may")}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusBadge.cls}`}
                      >
                        <StatusIcon className="size-3" />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Số Đơn Đặt Hàng & Phiếu Soạn */}
                    <div>
                      <div className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 sm:text-lg">
                        {order.SoDonDatHang || order.MaSoPhieuSoan}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>
                          PSH:{" "}
                          <strong className="text-slate-700">
                            {order.MaSoPhieuSoan}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          {order.NgayXuat
                            ? dayjs(order.NgayXuat).format("DD/MM/YYYY HH:mm")
                            : dayjs(order.NgaySoan || order.NgayTao).format(
                                "DD/MM/YYYY",
                              )}
                        </span>
                      </div>
                    </div>

                    {/* Chi tiết LSX & Mã Hàng */}
                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm">
                      <div>
                        <div className="text-[11px] uppercase font-semibold tracking-wide text-slate-400">
                          Lệnh sản xuất
                        </div>
                        <div
                          className="mt-1 truncate font-semibold text-slate-800"
                          title={order.SoLSX}
                        >
                          {order.SoLSX || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase font-semibold tracking-wide text-slate-400">
                          Mã hàng
                        </div>
                        <div
                          className="mt-1 truncate font-semibold text-slate-800"
                          title={order.MaHang}
                        >
                          {order.MaHang || "—"}
                        </div>
                      </div>
                      {order.NguoiXuat && (
                        <div className="col-span-2 flex items-center gap-1.5 border-t border-slate-200 pt-2 text-xs text-slate-600">
                          <User className="size-3.5 text-slate-400" />
                          <span>
                            Kho xuất: <strong>{order.NguoiXuat}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Thanh tiến độ nhận cây / cuộn */}
                    <div className="space-y-2.5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">
                          Tiến độ nhận hàng
                        </span>
                        <span className="font-bold text-slate-900">

                          {order.TongSoThung > 0 ? (
                            <>
                              {order.SoThungDaNhan || 0}/{order.TongSoThung} thùng{' '}
                              <span className="text-slate-500 font-normal">
                                ({order.SoCayDaNhan}/{order.TongSoCay} mục • {progress}%)
                              </span>
                            </>
                          ) : (
                            <>
                              {order.SoCayDaNhan} / {order.TongSoCay} cây ({progress}%)
                            </>
                          )}
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
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
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          Số lượng:{" "}
                          <strong className="text-slate-700">
                            {order.SoLuongDaNhan.toLocaleString()}
                          </strong>{" "}
                          / {order.TongSoLuongXuat.toLocaleString()}
                        </span>
                        {order.NguoiNhanMoiNhat && (
                          <span
                            className="truncate"
                            title={order.NguoiNhanMoiNhat}
                          >
                            Đã nhận bởi: {order.NguoiNhanMoiNhat}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
