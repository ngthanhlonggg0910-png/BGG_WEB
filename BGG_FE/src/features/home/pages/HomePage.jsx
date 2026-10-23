import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutGrid,
  Search,
  X,
  Layers3,
  Blocks,
  ArrowRight,
} from "lucide-react";

import FunctionGroup from "../components/FunctionGroup";
import EmptyState from "../../../shared/components/ui/EmptyState";
import { menuGroups } from "../data/menuData";
import MainLayout from "../../../layouts/MainLayout/MainLayout";

export default function Home() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  // TỔNG SỐ CHỨC NĂNG
  const totalFunctions = useMemo(
    () =>
      menuGroups.reduce(
        (total, group) => total + (group.items?.length || 0),
        0,
      ),
    [],
  );

  // TÌM KIẾM
  const visibleGroups = useMemo(() => {
    const keyword = searchValue.trim().toLocaleLowerCase("vi-VN");

    if (!keyword) return menuGroups;

    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.title.toLocaleLowerCase("vi-VN").includes(keyword),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchValue]);

  const visibleFunctionCount = visibleGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  // ĐIỀU HƯỚNG
  const handleFunctionClick = (item) => {
    if (!item) return;

    if (item.path) {
      navigate(item.path);
      return;
    }

    if (item.key === "update-material-location") {
      navigate("/material-location-update");
    } else if (item.key === "warehouse") {
      navigate("/warehouse");
    } else if (item.key === "soanhang") {
      navigate("/picking-orders");
    } else if (item.key === "production-order-material") {
      navigate("/production-orders");
    } else if (item.key === "material-orders-list") {
      navigate("/production-orders?tab=ddh");
    } else if (item.key === "fabric-inspection") {
      navigate("/fabric-inspection");
    } else {
      console.log("Chức năng được chọn:", item);
    }
  };

  return (
    <MainLayout screenTitle="KHO BÁN THÀNH PHẨM CẮT">
      <div className="mx-auto w-full max-w-[1500px] space-y-5 px-4 py-5 sm:px-6 sm:py-7 md:px-9 md:py-9">
        {/* ================= HEADER ================= */}
        <section
          className="relative overflow-hidden rounded-2xl p-4 text-white sm:p-6"
          style={{
            background:
              "linear-gradient(135deg, var(--egmf-primary) 0%, var(--egmf-primary-deep) 100%)",
          }}
        >
          {/* LỚP TRANG TRÍ NỀN */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-10"
            style={{ background: "#ffffff" }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full opacity-5"
            style={{ background: "#ffffff" }}
          />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* THÔNG TIN CHÍNH */}
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm sm:text-xs">
                  <Layers3 size={13} />
                  <span>Hệ thống Quản lý Kho & Sản xuất</span>
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  <span>v1.0</span>
                </span>
              </div>

              <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                Không gian làm việc
              </h1>

              <p className="max-w-xl text-xs text-white/80 sm:text-sm">
                Truy cập nhanh các nghiệp vụ kho, kiểm vải và cấp phát nguyên
                liệu
              </p>
            </div>

            {/* THỐNG KÊ TỔNG QUAN */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Blocks size={20} className="text-white" />
                </div>

                <div>
                  <div className="text-xl font-extrabold leading-none">
                    {totalFunctions}
                  </div>

                  <div className="mt-0.5 text-xs text-white/70">
                    Chức năng khả dụng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= KHU VỰC TÌM KIẾM ================= */}
        <section className="relative">
          <div className="flex items-center gap-3 rounded-xl border border-egmf-border bg-white px-4 py-3 shadow-xs transition focus-within:border-egmf-primary focus-within:ring-2 focus-within:ring-egmf-primary/10">
            <Search size={18} className="shrink-0 text-egmf-muted" />

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm kiếm nhanh chức năng (ví dụ: quét rổ, kiểm vải, đặt hàng, vị trí...)"
              className="w-full bg-transparent text-sm text-egmf-ink placeholder:text-egmf-muted focus:outline-none"
            />

            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="flex h-6 w-6 items-center justify-center rounded-full text-egmf-muted transition hover:bg-slate-100 hover:text-egmf-ink"
                aria-label="Xoá tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* DÒNG THÔNG BÁO KẾT QUẢ KHI ĐANG TÌM KIẾM */}
          {searchValue && (
            <div className="mt-2 flex items-center justify-between px-1 text-xs text-egmf-muted">
              <span>
                Tìm thấy{" "}
                <strong className="text-egmf-ink">
                  {visibleFunctionCount}
                </strong>{" "}
                chức năng phù hợp với &ldquo;{searchValue}&rdquo;
              </span>

              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="font-medium text-egmf-primary hover:underline"
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </section>

        {/* ================= DANH SÁCH NHÓM CHỨC NĂNG ================= */}
        {visibleGroups.length === 0 ? (
          <EmptyState
            title="Không tìm thấy chức năng"
            description={`Không có chức năng nào khớp với từ khóa "${searchValue}". Vui lòng thử lại với từ khóa khác.`}
          />
        ) : (
          <div className="space-y-6">
            {visibleGroups.map((group) => (
              <FunctionGroup
                key={group.key}
                group={group}
                defaultOpen={true}
                onFunctionClick={handleFunctionClick}
                onItemClick={handleFunctionClick}
              />
            ))}
          </div>
        )}

        {/* ================= FOOTER NHANH ================= */}
        <section className="flex flex-col items-center justify-between gap-3 rounded-xl border border-egmf-border bg-white px-5 py-4 text-xs text-egmf-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Hệ thống hoạt động bình thường · Kết nối máy chủ ổn định</span>
          </div>

          <div className="flex items-center gap-1 font-medium text-egmf-ink-secondary">
            <span>BGG Mobile Web</span>
            <span>·</span>
            <span>Phiên bản PWA 2026</span>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
