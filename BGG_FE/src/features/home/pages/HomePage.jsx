import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Search, X, Layers3 } from "lucide-react";

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
        <section className="relative isolate min-h-[330px] overflow-hidden rounded-[28px] border-2 border-blue-200/90 bg-[linear-gradient(118deg,#ffffff_0%,#f7fbff_44%,#e8f3ff_100%)] p-5 shadow-[0_20px_44px_rgba(37,99,235,.16),0_0_0_5px_rgba(219,234,254,.72)] sm:min-h-[370px] sm:p-8 lg:min-h-[430px] lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(37,99,235,.16)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(90deg,#000,transparent_56%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-[-90px] size-72 rounded-full border-[22px] border-blue-100/85" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-12 bottom-[-130px] size-80 rounded-full border-[18px] border-cyan-100/70" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-cover bg-right bg-no-repeat lg:block"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,.98) 33%, rgba(247,251,255,.78) 46%, rgba(219,234,254,.16) 66%, rgba(37,99,235,.1) 100%), url('/images/garment-workspace-hero.png')",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-contain bg-right-bottom bg-no-repeat opacity-75 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_34%)] lg:hidden"
            style={{
              backgroundImage: "url('/images/garment-workspace-hero.png')",
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-blue-50/15 via-white/30 to-white/95 lg:hidden" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 hidden size-[410px] rounded-full border-[34px] border-white/35 lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 bottom-[-220px] hidden size-[540px] rounded-full border-[46px] border-blue-400/30 lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-[20%] hidden size-3 rounded-full bg-white shadow-[0_0_0_7px_rgba(255,255,255,.2),0_0_20px_rgba(255,255,255,.8)] lg:block" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-10 right-12 hidden text-[11px] font-bold tracking-[.22em] text-white/70 lg:block">NPL FLOW</span>

          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-between gap-8 lg:min-h-[350px] lg:max-w-[55%]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-white/70 px-3.5 py-2 text-xs font-extrabold text-blue-800 shadow-sm backdrop-blur-sm sm:px-4 sm:text-sm">
                  <Layers3 size={18} strokeWidth={2.35} className="text-egmf-primary" />
                  <span>Hệ thống Quản lý Kho & Sản xuất</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                  <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(34,197,94,.13)]" />
                  v1.0
                </span>
              </div>

              <h1 className="mt-7 text-4xl font-black tracking-[-0.055em] text-blue-950 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
                Không gian làm việc
              </h1>
              <span aria-hidden="true" className="mt-3 block h-2 w-36 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-300 sm:w-48" />

              <p className="mt-7 max-w-xl text-base font-medium leading-relaxed text-slate-500 sm:text-xl sm:leading-relaxed">
                Truy cập nhanh các nghiệp vụ kho, kiểm vải và cấp phát nguyên liệu
              </p>
            </div>

            <div className="flex items-end gap-2 text-blue-800">
              <strong className="text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl">{totalFunctions}</strong>
              <span className="pb-0.5 text-sm font-bold text-slate-500 sm:text-base">Chức năng khả dụng</span>
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
