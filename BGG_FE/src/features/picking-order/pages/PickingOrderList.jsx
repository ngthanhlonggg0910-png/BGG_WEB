import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Search,
  Warehouse,
} from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, DatePicker, Empty, Spin, message } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { getCurrentUser } from "../../../shared/auth/session";
import AppSelect from "../../../shared/components/ui/AppSelect";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import PickingOrderCard from "../components/PickingOrderCard";
import { getListPickingOrderByStatus } from "../api/pickingOrderAPI";

dayjs.locale("vi");

const warehouses = [
  { value: "NA", label: "Kho nguyên liệu" },
  { value: "PA", label: "Kho phụ liệu" },
  { value: "CAT", label: "Kho vải cắt" },
  { value: "TP", label: "Kho thành phẩm" },
  { value: "BTPC", label: "Kho bán thành phẩm cắt" },
];

export default function PickingOrderList() {
  const navigate = useNavigate();

  const requestIdRef = useRef(0);

  const user = getCurrentUser();
  const tkId = user?.data?.TKId;

  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = sessionStorage.getItem("pickingDate");
    return saved ? dayjs(saved) : dayjs();
  });

  const [selectedWarehouse, setSelectedWarehouse] = useState(
    () => sessionStorage.getItem("pickingWarehouse") || "NA",
  );

  const [statusPick, setStatusPick] = useState(
    () => sessionStorage.getItem("pickingStatus") || null,
  );

  const [keyword, setKeyword] = useState(
    () => sessionStorage.getItem("pickingKeyword") || "",
  );

  const [pickingOrders, setPickingOrders] = useState(() => {
    try {
      const saved = sessionStorage.getItem("pickingOrders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hasLoaded, setHasLoaded] = useState(() => {
    return sessionStorage.getItem("pickingHasLoaded") === "true";
  });

  useEffect(() => {
    sessionStorage.setItem("pickingDate", selectedDate.format("YYYY-MM-DD"));
  }, [selectedDate]);

  useEffect(() => {
    sessionStorage.setItem("pickingWarehouse", selectedWarehouse);
  }, [selectedWarehouse]);

  useEffect(() => {
    if (statusPick === null) {
      sessionStorage.removeItem("pickingStatus");
    } else {
      sessionStorage.setItem("pickingStatus", statusPick);
    }
  }, [statusPick]);

  useEffect(() => {
    sessionStorage.setItem("pickingKeyword", keyword);
  }, [keyword]);

  useEffect(() => {
    sessionStorage.setItem("pickingOrders", JSON.stringify(pickingOrders));
  }, [pickingOrders]);

  useEffect(() => {
    sessionStorage.setItem("pickingHasLoaded", String(hasLoaded));
  }, [hasLoaded]);

  // GỌI API LẤY DANH SÁCH PHIẾU
  const fetchPickingOrders = async ({ maKho, ngaySoan, tinhTrang }) => {
    if (!maKho || !ngaySoan || !tinhTrang) {
      return;
    }

    if (tkId == null) {
      message.error("Không tìm thấy thông tin tài khoản");
      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setHasLoaded(true);
    setPickingOrders([]);

    try {
      const params = {
        maKho,
        tkId: Number(tkId),
        ngaySoan: ngaySoan.format("YYYY-MM-DD"),
        tinhTrang,
      };

      const response = await getListPickingOrderByStatus(params);

      if (requestId !== requestIdRef.current) return;

      setPickingOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      console.error("Không thể tải danh sách phiếu", error);
      setPickingOrders([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // THAY ĐỔI TRẠNG THÁI
  const handleStatusChange = (status) => {
    if (!selectedWarehouse) {
      message.warning("Vui lòng chọn kho trước");
      return;
    }

    setStatusPick(status);
    setKeyword("");

    fetchPickingOrders({
      maKho: selectedWarehouse,
      ngaySoan: selectedDate,
      tinhTrang: status,
    });
  };

  // THAY ĐỔI NGÀY
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setKeyword("");

    if (date && selectedWarehouse && statusPick) {
      fetchPickingOrders({
        maKho: selectedWarehouse,
        ngaySoan: date,
        tinhTrang: statusPick,
      });
    } else {
      requestIdRef.current += 1;
      setLoading(false);
      setPickingOrders([]);
      setHasLoaded(false);
    }
  };

  // THAY ĐỔI KHO
  const handleWarehouseChange = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setKeyword("");

    if (warehouse && selectedDate && statusPick) {
      fetchPickingOrders({
        maKho: warehouse,
        ngaySoan: selectedDate,
        tinhTrang: statusPick,
      });
    } else {
      requestIdRef.current += 1;
      setLoading(false);
      setPickingOrders([]);
      setHasLoaded(false);
    }
  };

  // TÌM KIẾM MÃ PHIẾU
  const filteredOrders = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return pickingOrders;

    return pickingOrders.filter((item) =>
      String(item.MaSoPhieuSoan ?? "")
        .toLowerCase()
        .includes(search),
    );
  }, [pickingOrders, keyword]);

  return (
    <MainLayout screenTitle="Danh sách soạn hàng">
      <ConfigProvider
        locale={viVN}
        theme={{
          components: {
            DatePicker: {
              fontSize: 16,
              controlHeight: 48,
            },
          },
        }}
      >
        <div className="picking-order-page min-h-full bg-egmf-surface p-3 sm:p-5">
          <div className="mx-auto max-w-6xl space-y-4">
            {/* BỘ LỌC */}
            <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
              {/* HEADER */}
              <div className="border-b border-egmf-border px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-egmf-primary-tint text-egmf-primary-strong">
                    <ClipboardList size={21} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[17px] font-bold leading-tight text-egmf-ink sm:text-lg">
                      Danh sách soạn hàng
                    </h2>

                    <p className="mt-1 text-sm leading-snug text-egmf-muted">
                      Lọc phiếu theo ngày, kho và trạng thái
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                {/* NGÀY + KHO */}
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                  {/* NGÀY SOẠN */}
                  <div className="min-w-0">
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold leading-none text-egmf-ink-secondary">
                      <CalendarDays size={17} className="shrink-0" />
                      Ngày soạn
                    </label>

                    <DatePicker
                      format="DD/MM/YYYY"
                      value={selectedDate}
                      onChange={handleDateChange}
                      allowClear={false}
                      inputReadOnly
                      placeholder="Chọn ngày"
                      className="picking-order-date-picker !h-[52px] !w-full !rounded-xl"
                      style={{
                        fontSize: 16,
                      }}
                    />
                  </div>

                  {/* KHO SOẠN HÀNG */}
                  <div className="min-w-0">
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold leading-none text-egmf-ink-secondary">
                      <Warehouse size={17} className="shrink-0" />
                      Kho soạn hàng
                    </label>

                    <AppSelect
                      placeholder="Chọn kho"
                      value={selectedWarehouse}
                      onChange={handleWarehouseChange}
                      options={warehouses}
                      allowClear
                      minHeight={52}
                    />
                  </div>
                </div>

                {/* TRẠNG THÁI */}
                <div>
                  <p className="mb-2.5 text-sm font-semibold text-egmf-ink-secondary">
                    Trạng thái phiếu
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* CHƯA HOÀN THÀNH */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange("chuahoanthanh")}
                      aria-pressed={statusPick === "chuahoanthanh"}
                      className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-2.5 py-2.5 text-sm font-semibold leading-tight transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ${
                        statusPick === "chuahoanthanh"
                          ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-egmf-border bg-egmf-surface text-egmf-ink-secondary hover:border-amber-300"
                      }`}
                    >
                      <Clock3 size={19} className="shrink-0" />
                      <span>Chưa hoàn thành</span>
                    </button>

                    {/* HOÀN THÀNH */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange("hoanthanh")}
                      aria-pressed={statusPick === "hoanthanh"}
                      className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-2.5 py-2.5 text-sm font-semibold leading-tight transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                        statusPick === "hoanthanh"
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-egmf-border bg-egmf-surface text-egmf-ink-secondary hover:border-emerald-300"
                      }`}
                    >
                      <CheckCircle2 size={19} className="shrink-0" />
                      <span>Hoàn thành</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* DANH SÁCH PHIẾU */}
            <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
              {/* HEADER + TÌM KIẾM */}
              <div className="border-b border-egmf-border p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[17px] font-bold text-egmf-ink sm:text-lg">
                    <ClipboardList size={21} className="text-egmf-primary" />
                    Danh sách phiếu
                  </h2>

                  {hasLoaded && (
                    <span className="shrink-0 rounded-full bg-egmf-surface-tint px-3 py-1 text-sm font-semibold text-egmf-ink-secondary">
                      {filteredOrders.length} phiếu
                    </span>
                  )}
                </div>

                {/* Ô TÌM KIẾM */}
                <div className="flex h-[52px] items-center gap-3 rounded-xl border border-egmf-border bg-egmf-surface px-3.5 transition-colors focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                  <Search size={20} className="shrink-0 text-egmf-muted" />

                  <input
                    type="text"
                    placeholder="Tìm hoặc quét mã phiếu..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="h-full w-full min-w-0 bg-transparent text-base font-medium text-egmf-ink outline-none placeholder:font-normal placeholder:text-egmf-muted"
                  />

                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword("")}
                      className="min-h-10 min-w-12 shrink-0 rounded-lg px-2.5 text-base font-bold text-egmf-muted transition-colors hover:bg-egmf-surface-tint hover:text-egmf-ink sm:min-h-0 sm:min-w-0 sm:bg-transparent sm:px-0 sm:text-sm"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* KHU VỰC RENDER PHIẾU */}
              <div className="flex-1 p-3 sm:p-4">
                {loading ? (
                  <div className="flex min-h-56 items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : !hasLoaded ? (
                  <div className="flex min-h-56 items-center justify-center">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chọn kho và trạng thái để xem phiếu"
                    />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex min-h-56 items-center justify-center">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không tìm thấy phiếu phù hợp"
                    />
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* SAU NÀY RENDER COMPONENT PHIẾU TẠI ĐÂY */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredOrders.map((item, index) => (
                        <PickingOrderCard
                          key={index}
                          item={item}
                          onClick={() => {
                            navigate(
                              `/picking-order-detail?phieuSoanHangId=${encodeURIComponent(item.PhieuSoanHangId)}`,
                              {
                              state: { order: item },
                              },
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </ConfigProvider>
    </MainLayout>
  );
}
