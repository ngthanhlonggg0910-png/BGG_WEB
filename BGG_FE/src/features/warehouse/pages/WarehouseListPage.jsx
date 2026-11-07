import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  X,
  RefreshCw,
  AlertCircle,
  PackageOpen,
} from "lucide-react";

import { getWarehousesByAccountId } from "../api/warehouseApi";
import WarehouseCard from "../components/WarehouseCard";
import WarehouseDetail from "../components/WarehouseDetailView";
import { getAccountId } from "../../../shared/auth/session";
import MainLayout from "../../../layouts/MainLayout/MainLayout";

export default function WarehouseList() {
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
        <div className="mx-auto w-full max-w-[1300px] px-4 py-3 sm:px-6 sm:py-4 md:px-8">
          <section aria-label="Danh sách kho" className="space-y-3 sm:space-y-4">

            {/* SEARCH */}
            {!error && !loading && listKho.length > 0 && (
              <div className="flex h-12 items-center gap-2.5 rounded-lg border border-egmf-primary-border-soft bg-white px-3 transition-colors focus-within:border-egmf-primary focus-within:ring-[3px] focus-within:ring-egmf-primary/10">
                <Search size={19} className="shrink-0 text-egmf-primary" />

                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã kho, tên kho, thủ kho..."
                  aria-label="Tìm kiếm kho"
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px]"
                />

                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    aria-label="Xóa tìm kiếm"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-egmf-primary-soft text-egmf-primary transition-colors hover:bg-egmf-primary-hover"
                  >
                    <X size={19} />
                  </button>
                )}
              </div>
            )}

            {/* SECTION TITLE */}
            {!error && !loading && listKho.length > 0 && (
              <div className="flex items-center justify-between gap-3">
                <h2 className="m-0 text-sm font-extrabold text-slate-900 sm:text-[15px]">
                  Kho đang quản lý
                </h2>

                <span className="shrink-0 rounded-full bg-egmf-primary-soft px-2.5 py-1 text-xs font-bold text-egmf-primary-strong">
                  {filteredWarehouses.length} kho
                </span>
              </div>
            )}

            {/* CONTENT */}
            {loading ? (
              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
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
              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
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
