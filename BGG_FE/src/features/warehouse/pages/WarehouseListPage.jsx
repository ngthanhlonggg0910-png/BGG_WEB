import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Warehouse,
  Boxes,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  PackageOpen,
  ChevronRight,
} from "lucide-react";

import { getWarehousesByAccountId } from "../api/warehouseApi";
import WarehouseCard from "../components/WarehouseCard";
import WarehouseDetail from "../components/WarehouseDetailView";
import { getAccountId } from "../../../shared/auth/session";
import MainLayout from "../../../layouts/MainLayout/MainLayout";

export default function WarehouseList() {
  const navigate = useNavigate();

  const [listKho, setListKho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const accountId = useMemo(() => getAccountId(), []);

  // LẤY DANH SÁCH KHO
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!accountId) {
          throw new Error("Không tìm thấy thông tin tài khoản.");
        }

        const response = await getWarehousesByAccountId(accountId);

        if (isMounted) {
          setListKho(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải danh sách kho.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [accountId, reloadKey]);

  // TÌM KIẾM KHO
  const filteredWarehouses = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase("vi-VN");

    if (!search) return listKho;

    return listKho.filter((item) =>
      [item.MaKho, item.TenKho, item.TenThuKho].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("vi-VN")
          .includes(search),
      ),
    );
  }, [listKho, keyword]);

  const handleWarehouseClick = useCallback((item) => {
    setSelectedWarehouse({
      KId: item.KId,
      code: item.MaKho,
      keeper: item.TenThuKho,
      name: item.TenKho,
    });
  }, []);

  return (
    <MainLayout screenTitle="Kho & nguyên liệu">
      {selectedWarehouse ? (
        <WarehouseDetail
          warehouse={selectedWarehouse}
          onBack={() => setSelectedWarehouse(null)}
        />
      ) : (
        <div className="mx-auto w-full max-w-[1300px] px-4 py-5 sm:px-6 sm:py-7 md:px-8">
          <section aria-label="Danh sách kho" className="space-y-5">
            {/* HEADER */}
            <div
              className="relative overflow-hidden rounded-2xl p-4 text-white sm:p-6"
              style={{
                background:
                  "linear-gradient(135deg, var(--egmf-primary) 0%, var(--egmf-primary-deep) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-xs font-bold uppercase tracking-wider text-white/80">
                    QUẢN LÝ KHO
                  </p>

                  <h1 className="m-0 mt-2 text-[24px] font-extrabold leading-tight text-white sm:text-[28px]">
                    Danh sách kho
                  </h1>

                  <p className="m-0 mt-2 text-[14px] font-medium leading-6 text-white/85 sm:text-[15px]">
                    Chọn kho để xem thông tin và tra cứu tồn kho.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:h-14 sm:w-14">
                  <Warehouse size={27} strokeWidth={2} />
                </div>
              </div>

              {/* THỐNG KÊ */}
              <div className="relative mt-5 flex items-center justify-between rounded-xl border border-white/15 bg-white/15 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Boxes size={20} className="text-white/90" />

                  <span className="text-[15px] font-semibold text-white">
                    Tổng số kho
                  </span>
                </div>

                <span className="text-[24px] font-extrabold text-white">
                  {loading ? "—" : listKho.length}
                </span>
              </div>
            </div>

            {/* SEARCH */}
            {!error && !loading && listKho.length > 0 && (
              <div className="flex h-14 items-center gap-3 rounded-xl border border-egmf-primary-border-soft bg-white px-4 transition-colors focus-within:border-egmf-primary focus-within:ring-[3px] focus-within:ring-egmf-primary/10">
                <Search size={22} className="shrink-0 text-egmf-primary" />

                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã kho, tên kho, thủ kho..."
                  aria-label="Tìm kiếm kho"
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />

                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    aria-label="Xóa tìm kiếm"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-egmf-primary-soft text-egmf-primary transition-colors hover:bg-egmf-primary-hover"
                  >
                    <X size={19} />
                  </button>
                )}
              </div>
            )}

            {/* SECTION TITLE */}
            {!error && !loading && listKho.length > 0 && (
              <div className="flex items-center justify-between gap-3">
                <h2 className="m-0 text-[17px] font-bold text-slate-900">
                  Kho đang quản lý
                </h2>

                <span className="shrink-0 rounded-lg bg-egmf-primary-soft px-3 py-1.5 text-sm font-bold text-egmf-primary-strong">
                  {filteredWarehouses.length} kho
                </span>
              </div>
            )}

            {/* CONTENT */}
            {loading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <WarehouseSkeleton key={item} />
                ))}
              </div>
            ) : error ? (
              <StatusPanel
                icon={AlertCircle}
                title="Không thể tải danh sách kho"
                description={error}
                tone="error"
                action={
                  <button
                    type="button"
                    onClick={() => setReloadKey((prev) => prev + 1)}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-egmf-primary px-5 text-[15px] font-semibold text-white transition-colors hover:bg-egmf-primary-strong active:scale-[0.98]"
                  >
                    <RefreshCw size={18} />
                    Thử lại
                  </button>
                }
              />
            ) : listKho.length === 0 ? (
              <StatusPanel
                icon={PackageOpen}
                title="Chưa có kho nào"
                description="Danh sách kho sẽ xuất hiện tại đây khi được thiết lập."
              />
            ) : filteredWarehouses.length === 0 ? (
              <StatusPanel
                icon={Search}
                title="Không tìm thấy kho"
                description={`Không có kho phù hợp với "${keyword}".`}
                action={
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="mt-4 min-h-11 rounded-xl bg-egmf-primary-soft px-5 text-[15px] font-bold text-egmf-primary-strong transition-colors hover:bg-egmf-primary-hover"
                  >
                    Xóa tìm kiếm
                  </button>
                }
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredWarehouses.map((item) => (
                  <WarehouseCard
                    key={item.KId ?? item.MaKho}
                    code={item.MaKho}
                    name={item.TenKho}
                    keeper={item.TenThuKho}
                    onClick={() => handleWarehouseClick(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </MainLayout>
  );
}

// SKELETON
function WarehouseSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-egmf-border bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-egmf-primary-soft" />

        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-5 w-2/3 rounded bg-slate-100" />
        </div>
      </div>

      <div className="mt-5 h-px bg-slate-100" />

      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="h-4 w-20 rounded bg-egmf-primary-soft" />
      </div>
    </div>
  );
}

// EMPTY / ERROR STATE
function StatusPanel({
  icon: Icon,
  title,
  description,
  tone = "default",
  action,
}) {
  return (
    <div className="rounded-2xl border border-egmf-border bg-white px-5 py-10 text-center sm:py-12">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          tone === "error"
            ? "bg-red-50 text-red-600"
            : "bg-egmf-primary-soft text-egmf-primary"
        }`}
      >
        <Icon size={27} strokeWidth={1.9} />
      </div>

      <h3 className="m-0 mt-4 text-[18px] font-bold text-slate-900">{title}</h3>

      <p className="mx-auto mb-0 mt-2 max-w-sm text-[15px] leading-6 text-slate-500">
        {description}
      </p>

      {action}
    </div>
  );
}
