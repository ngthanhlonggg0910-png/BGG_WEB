import { Search, ClipboardList, ScanBarcode, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Empty, Spin } from "antd";

import { getPickingOrderDetail } from "../api/pickingOrderAPI";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import PickingItemCard from "../components/PickingItemCard";
import PickingOrderCard from "../components/PickingOrderCard";
import ConfirmPickingModal from "../components/ConfirmPickingModal";

// TRANG CHI TIẾT PHIẾU
export default function PickingOrderDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [itemDetail, setItemDetail] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // NHẬN DỮ LIỆU TỪ PICKING ORDER LIST
  const [order, setOrder] = useState(location.state?.order ?? null);
  const kho = location.state?.kho || (order?.MaSoPhieuSoan?.startsWith("NA") ? "NA" : "PA");
  const [keyword, setKeyword] = useState("");

  const fetchDetail = useCallback(async () => {
    if (!order?.PhieuSoanHangId) {
      setItemDetail([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getPickingOrderDetail(order.PhieuSoanHangId);
      setItemDetail(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi lấy chi tiết phiếu:", err);
      setItemDetail([]);
    } finally {
      setLoading(false);
    }
  }, [order?.PhieuSoanHangId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // TÍNH TOÁN TIẾN ĐỘ TÓM TẮT
  const summary = useMemo(() => {
    if (!itemDetail?.length) {
      return {
        tongMatHang: 0,
        matHangDaDu: 0,
        tongYeuCau: 0,
        tongThucSoan: 0,
        pct: 0,
        isDu100: false,
      };
    }

    let tongYeuCau = 0;
    let tongThucSoan = 0;
    let matHangDaDu = 0;

    for (const item of itemDetail) {
      const ycau = Number(item.SoLuongYeuCau) || 0;
      const thuc = Number(item.SoLuongThucSoan) || 0;
      tongYeuCau += ycau;
      tongThucSoan += thuc;
      if (thuc >= ycau && ycau > 0) {
        matHangDaDu++;
      }
    }

    const pct =
      tongYeuCau > 0
        ? Math.min(100, Math.round((tongThucSoan / tongYeuCau) * 1000) / 10)
        : 0;

    return {
      tongMatHang: itemDetail.length,
      matHangDaDu,
      tongYeuCau,
      tongThucSoan,
      pct,
      isDu100: matHangDaDu >= itemDetail.length && pct >= 99.9,
    };
  }, [itemDetail]);

  // LỌC DANH SÁCH
  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return itemDetail;

    return itemDetail.filter((item) => {
      const matchCode = String(item.MaSoPhieuSoan ?? "").toLowerCase().includes(search);
      const matchItem = String(item.Item ?? "").toLowerCase().includes(search);
      const matchDesc = String(item.DienGiai ?? "").toLowerCase().includes(search);
      const matchColor = String(item.MaMau ?? "").toLowerCase().includes(search);
      return matchCode || matchItem || matchDesc || matchColor;
    });
  }, [itemDetail, keyword]);

  const isCompleted = (order?.TinhTrang || order?.tinhTrang) === "hoanthanh";
  const isCancelled = (order?.TinhTrang || order?.tinhTrang) === "huy";

  return (
    <MainLayout screenTitle="Chi tiết phiếu soạn hàng">
      <div className="min-h-full bg-egmf-surface p-4 sm:p-5">
        <div className="mx-auto max-w-6xl space-y-4">
          {!order ? (
            <section className="rounded-2xl border border-egmf-border bg-egmf-surface-raised p-8">
              <Empty description="Không tìm thấy thông tin phiếu. Vui lòng chọn lại từ danh sách." />
            </section>
          ) : (
            <>
              {/* THÔNG TIN PHIẾU */}
              <PickingOrderCard item={order} />

              {/* THANH TIẾN ĐỘ VÀ HÀNH ĐỘNG XUẤT KHO */}
              <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised p-4 shadow-egmf-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                      <span className="text-sm font-semibold text-egmf-ink">
                        Tiến độ soạn hàng:
                      </span>
                      <span
                        className={`text-base font-bold ${
                          summary.isDu100 ? "text-emerald-600" : "text-blue-600"
                        }`}
                      >
                        {summary.pct}% ({summary.matHangDaDu}/{summary.tongMatHang} mặt hàng)
                      </span>
                    </div>

                    {/* Thanh tiến độ */}
                    <div className="h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all duration-300 ${
                          summary.isDu100 ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(100, summary.pct)}%` }}
                      />
                    </div>

                    <p className="text-xs text-egmf-muted">
                      Đã soạn: <b>{summary.tongThucSoan.toLocaleString()}</b> / {summary.tongYeuCau.toLocaleString()}
                    </p>
                  </div>

                  {/* NÚT THAO TÁC */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {!isCompleted && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/picking-order-scan", {
                            state: {
                              scanType: "picking",
                              PhieuSoanHangId: order.PhieuSoanHangId,
                              kho,
                            },
                          });
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 active:scale-95"
                      >
                        <ScanBarcode className="h-4 w-4" />
                        <span>Vào quét soạn</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setConfirmModalOpen(true)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition active:scale-95 ${
                        isCompleted
                          ? "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                          : summary.isDu100
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>{isCompleted ? "Xem chi tiết xuất kho" : "Xác nhận xuất kho"}</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* TÌM KIẾM CHI TIẾT */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-egmf-muted" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo mã vật tư, tên, màu sắc..."
                  className="w-full rounded-xl border border-egmf-border bg-white py-2.5 pl-9 pr-4 text-sm text-egmf-ink placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* CHI TIẾT SOẠN HÀNG */}
              <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
                <div>
                  {loading ? (
                    <div className="flex min-h-48 items-center justify-center">
                      <Spin size="large">
                        <div className="min-h-24 min-w-48" />
                      </Spin>
                    </div>
                  ) : !filteredItems?.length ? (
                    <div className="flex min-h-48 items-center justify-center">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          keyword
                            ? "Không tìm thấy mặt hàng phù hợp"
                            : "Chưa có dữ liệu chi tiết soạn hàng"
                        }
                      />
                    </div>
                  ) : (
                    <table className="w-full table-fixed bg-egmf-surface text-[13px] sm:text-sm">
                      <colgroup>
                        <col className="w-[12%]" />
                        <col className="w-[43%]" />
                        <col className="w-[22%]" />
                        <col className="w-[23%]" />
                      </colgroup>

                      <tbody>
                        {filteredItems.map((item, index) => (
                          <PickingItemCard
                            key={item.Id ?? index}
                            item={item}
                            index={index}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {/* MODAL XÁC NHẬN XUẤT KHO */}
              <ConfirmPickingModal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                phieuSoanHangId={order.PhieuSoanHangId}
                maSoPhieuSoan={order.MaSoPhieuSoan}
                onSuccess={(resData) => {
                  if (resData?.tinhTrang) {
                    setOrder((prev) => ({
                      ...prev,
                      TinhTrang: resData.tinhTrang,
                      tinhTrang: resData.tinhTrang,
                    }));
                  }
                  fetchDetail();
                }}
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
