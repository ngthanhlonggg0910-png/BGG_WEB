import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FilePlus2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { FabricInspectionCard } from "../components/FabricInspectionCard";
import { getFabricInspections } from "../api/fabric-inspections.api";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getCurrentUser } from "../../../shared/auth/session";

export default function FabricInspectionList() {
  const navigate = useNavigate();
  const TKId = getCurrentUser().data.TKId;
  const [keyword, setKeyword] = useState("");
  const [fabricInspections, setFabricInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!TKId) {
        throw new Error("Không tìm thấy thông tin tài khoản.");
      }

      const response = await getFabricInspections(TKId);
      setFabricInspections(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách phiếu kiểm vải:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách phiếu kiểm vải.",
      );

      setFabricInspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [TKId]);

  const filteredInspections = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase("vi-VN");
    if (!search) return fabricInspections;

    return fabricInspections.filter((item) =>
      [
        item.SoPhieuKiem,
        item.TenNgan,
        item.NhaCungCap,
        item.MaHang,
        item.ChungLoai,
        item.Item,
        item.Art,
        item.LOT,
        item.Lot,
        item.MaMau,
        item.MauVai,
        item.ChungTu,
        item.NhanVienKiem,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("vi-VN")
          .includes(search),
      ),
    );
  }, [fabricInspections, keyword]);

  const handleOpenDetail = useCallback(
    (item) => {
      navigate("/fabric-inspection-detail", { state: { inspection: item } });
    },
    [navigate],
  );

  return (
    <MainLayout screenTitle="Kiểm vải">
      <div className="min-h-full bg-egmf-surface">
        <div className="mx-auto w-full max-w-[1300px] px-4 py-5 sm:px-6 sm:py-7 md:px-8">
          <section aria-label="Danh sách phiếu kiểm vải" className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setReloadKey((value) => value + 1)}
                  disabled={loading}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-4 text-[15px] font-bold text-white shadow-egmf-primary-compact transition-all hover:-translate-y-0.5 hover:bg-egmf-primary-strong hover:shadow-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/25 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Tạo mới
                </button>
                <button
                  type="button"
                  onClick={() => fetchData}
                  disabled={loading}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-egmf-primary-border bg-white px-4 text-[15px] font-bold text-egmf-primary transition-colors hover:border-egmf-primary hover:bg-egmf-primary-hover-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                >
                  <RefreshCw
                    size={19}
                    className={loading ? "animate-spin" : ""}
                  />
                  Làm mới
                </button>
              </div>

              <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-xl border border-egmf-primary-border-soft bg-white px-4 transition-colors focus-within:border-egmf-primary focus-within:ring-[3px] focus-within:ring-egmf-primary/10">
                <Search size={22} className="shrink-0 text-egmf-primary" />
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm số phiếu, mã hàng, nhà cung cấp..."
                  aria-label="Tìm kiếm phiếu kiểm vải"
                  autoComplete="off"
                  className="
                        h-full min-w-0 flex-1 bg-transparent
                        text-[16px] font-medium text-egmf-ink
                        outline-none placeholder:text-egmf-placeholder
                        [&::-webkit-search-cancel-button]:hidden
                        [&::-webkit-search-decoration]:hidden
                    "
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    aria-label="Xóa tìm kiếm"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-egmf-primary-soft text-egmf-primary transition-colors hover:bg-egmf-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary"
                  >
                    <X size={19} />
                  </button>
                )}
              </div>
            </div>

            {!loading && !error && fabricInspections.length > 0 && (
              <div className="flex items-center justify-between gap-3">
                <h2 className="m-0 text-[17px] font-bold text-egmf-ink">
                  Danh sách phiếu kiểm
                </h2>
                <span className="shrink-0 rounded-lg bg-egmf-primary-soft px-3 py-1.5 text-sm font-bold text-egmf-primary-strong">
                  {filteredInspections.length} phiếu
                </span>
              </div>
            )}

            {loading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <InspectionSkeleton key={item} />
                ))}
              </div>
            ) : error ? (
              <StatusPanel
                icon={AlertCircle}
                title="Không thể tải danh sách phiếu kiểm"
                description={error}
                tone="error"
                action={<RetryButton onClick={fetchData} />}
              />
            ) : fabricInspections.length === 0 ? (
              <StatusPanel
                icon={FilePlus2}
                title="Chưa có phiếu kiểm vải"
                description="Các phiếu kiểm vải sẽ xuất hiện tại đây khi được tạo và phân công."
              />
            ) : filteredInspections.length === 0 ? (
              <StatusPanel
                icon={Search}
                title="Không tìm thấy phiếu kiểm"
                description={`Không có phiếu kiểm phù hợp với “${keyword}”.`}
                action={
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="mt-4 min-h-11 rounded-xl bg-egmf-primary-soft px-5 text-[15px] font-bold text-egmf-primary-strong transition-colors hover:bg-egmf-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                  >
                    Xóa tìm kiếm
                  </button>
                }
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredInspections.map((item, index) => (
                  <FabricInspectionCard
                    key={item.Id ?? item.SoPhieuKiem ?? index}
                    item={item}
                    onClick={() => {
                      navigate(`/fabric-inspection/${item.PKVId}/rolls`);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

function InspectionSkeleton() {
  return (
    <div className="animate-pulse rounded-egmf-large border border-egmf-border bg-white p-4 shadow-egmf-card">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-xl bg-egmf-primary-soft" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-5 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="my-4 h-px bg-egmf-border-subtle" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 rounded-lg bg-egmf-surface-soft" />
        <div className="h-12 rounded-lg bg-egmf-surface-soft" />
      </div>
    </div>
  );
}

function StatusPanel({
  icon: Icon,
  title,
  description,
  tone = "default",
  action,
}) {
  return (
    <div className="rounded-egmf-large border border-egmf-border bg-white px-5 py-10 text-center shadow-egmf-card sm:py-12">
      <div
        className={`mx-auto grid size-14 place-items-center rounded-2xl ${tone === "error" ? "bg-red-50 text-red-600" : "bg-egmf-primary-soft text-egmf-primary"}`}
      >
        <Icon size={27} strokeWidth={1.9} />
      </div>
      <h3 className="m-0 mt-4 text-[18px] font-bold text-egmf-ink">{title}</h3>
      <p className="mx-auto mb-0 mt-2 max-w-sm text-[15px] leading-6 text-egmf-muted">
        {description}
      </p>
      {action}
    </div>
  );
}

function RetryButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-egmf-primary px-5 text-[15px] font-semibold text-white transition-colors hover:bg-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
    >
      <RefreshCw size={18} /> Thử lại
    </button>
  );
}
