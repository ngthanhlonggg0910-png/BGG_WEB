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
          className="relative isolate overflow-hidden rounded-[24px] border border-blue-400/35 p-5 text-white shadow-[0_20px_45px_rgba(30,64,175,.23)] sm:p-7"
          style={{
            background:
              "linear-gradient(135deg, #2563eb 0%, #1748bf 55%, #102a72 100%)",
          }}
        >
          {/* LỚP TRANG TRÍ NỀN */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-200/30 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-14 left-[28%] h-40 w-40 rounded-full bg-indigo-300/25 blur-xl"
          />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.34)_1px,transparent_1px)] [background-size:38px_38px] [mask-image:linear-gradient(115deg,#000,transparent_70%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden lg:block">
            <span className="absolute right-[8%] top-[22%] h-px w-[44%] rotate-[22deg] bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent" />
            <span className="absolute right-[22%] top-[55%] h-px w-[36%] -rotate-[28deg] bg-gradient-to-r from-transparent via-blue-100/75 to-transparent" />
            <span className="absolute right-[11%] top-[19%] size-2 rounded-full bg-cyan-100 shadow-[0_0_0_5px_rgba(103,232,249,.14),0_0_16px_rgba(103,232,249,.85)]" />
            <span className="absolute right-[42%] top-[43%] size-2.5 rounded-full bg-white shadow-[0_0_0_6px_rgba(191,219,254,.14),0_0_18px_rgba(191,219,254,.9)]" />
            <span className="absolute right-[21%] top-[67%] size-1.5 rounded-full bg-cyan-100 shadow-[0_0_0_4px_rgba(103,232,249,.14),0_0_12px_rgba(103,232,249,.8)]" />
            <span className="absolute -right-3 bottom-[-30px] size-40 rounded-[42px] border border-white/15 bg-white/[.04] rotate-12" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-1/2 hidden h-24 w-56 -translate-y-1/2 lg:block">
            <span className="absolute left-3 top-11 h-px w-40 bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
            <span className="absolute left-10 top-8 size-7 rounded-xl border border-white/40 bg-cyan-200/20 shadow-lg shadow-cyan-950/20" />
            <span className="absolute left-28 top-3 size-12 rounded-2xl border border-white/35 bg-white/15 shadow-lg shadow-blue-950/20" />
            <span className="absolute right-0 top-9 size-9 rounded-xl border border-white/40 bg-blue-300/25 shadow-lg shadow-blue-950/20" />
          </div>

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* THÔNG TIN CHÍNH */}
            <div className="max-w-2xl space-y-2 sm:space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm sm:text-xs">
                  <Layers3 size={13} className="text-cyan-200" />
                  <span>Hệ thống Quản lý Kho & Sản xuất</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-50">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" />
                  <span>v1.0</span>
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl md:text-[34px]">
                Không gian làm việc
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-blue-100 sm:text-[15px]">
                Truy cập nhanh các nghiệp vụ kho, kiểm vải và cấp phát nguyên
                liệu
              </p>
            </div>

            {/* THỐNG KÊ TỔNG QUAN */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 shadow-lg shadow-blue-950/15 backdrop-blur-md">
                <div aria-hidden="true" className="absolute -right-5 -top-5 size-16 rounded-full bg-cyan-300/20" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-400 shadow-lg shadow-cyan-950/20">
                  <Blocks size={21} className="text-blue-950" />
                </div>

                <div className="relative">
                  <div className="text-2xl font-extrabold leading-none">
                    {totalFunctions}
                  </div>

                  <div className="mt-1 text-xs font-medium text-blue-100">
                    Chức năng khả dụng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= KHU VỰC TÌM KIẾM ================= */}
        <section className="relative rounded-[20px] border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/70 p-1.5 shadow-[0_8px_20px_rgba(37,99,235,.06)]">
          <div className="flex items-center gap-3 rounded-[15px] border border-white/90 bg-white/90 px-3 py-2.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-egmf-primary/10 sm:px-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
              <Search size={18} strokeWidth={2.4} />
            </span>

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm kiếm nhanh chức năng (ví dụ: quét rổ, kiểm vải, đặt hàng, vị trí...)"
              className="h-9 w-full bg-transparent text-sm font-medium text-egmf-ink placeholder:font-normal placeholder:text-egmf-muted focus:outline-none"
            />

            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="grid size-8 place-items-center rounded-xl text-egmf-muted transition hover:bg-egmf-primary-soft hover:text-egmf-primary"
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
