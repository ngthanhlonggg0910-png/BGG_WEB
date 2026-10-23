import { Search, ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Empty, Spin } from "antd";

import { getPickingOrderDetail } from "../api/pickingOrderAPI";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import PickingItemCard from "../components/PickingItemCard";
import PickingOrderCard from "../components/PickingOrderCard";

// TRANG CHI TIẾT PHIẾU
export default function PickingOrderDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [itemDetail, setItemDetail] = useState([]);

  // NHẬN DỮ LIỆU TỪ PICKING ORDER LIST
  const [order, setOrder] = useState(location.state?.order ?? null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!order?.MaSoPhieuSoan) {
      setItemDetail([]);
      return;
    }

    const fetchDetail = async () => {
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
    };

    fetchDetail();
  }, [order?.MaSoPhieuSoan]);

  // console.log(order.PhieuSoanHangId);

  // LỌC DANH SÁCH
  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return itemDetail;

    return itemDetail.filter((item) =>
      String(item.MaSoPhieuSoan ?? "")
        .toLowerCase()
        .includes(search),
    );
  }, [itemDetail, keyword]);

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

              {/* CHI TIẾT SOẠN HÀNG */}
              <section className="overflow-hidden border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
                {/* DANH SÁCH VẬT TƯ */}
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
                    <table className="w-full table-fixed  bg-egmf-surface text-[13px] sm:text-sm">
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
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
