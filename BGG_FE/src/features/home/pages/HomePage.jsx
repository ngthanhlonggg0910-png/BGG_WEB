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
    if (item.key === "update-material-location") {
      navigate("/material-location-update");
    } else if (item.key === "warehouse") {
      navigate("/warehouse");
    } else if (item.key === "soanhang") {
      navigate("/picking-orders");
    } else if (item.key === "production-order-material") {
      navigate("/production-orders");
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
          {/* TRANG TRÍ NHẸ */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-20 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative z-10">
            {/* TITLE */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-white/80">
                  TRUNG TÂM VẬN HÀNH
                </p>

                <h1 className="m-0 mt-2 text-[24px] font-extrabold leading-tight text-white sm:text-[30px]">
                  Không gian làm việc
                </h1>

                <p className="m-0 mt-2 text-[14px] font-medium leading-6 text-white/85 sm:text-[15px]">
                  Truy cập nhanh các chức năng trong ca làm việc.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 sm:h-14 sm:w-14">
                <LayoutGrid size={27} strokeWidth={2} />
              </div>
            </div>

            {/* THỐNG KÊ */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/15 p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Layers3 size={21} />
                </div>

                <div className="min-w-0">
                  <p className="m-0 text-xs font-medium text-white/85">
                    Nhóm chức năng
                  </p>
                  <p className="m-0 mt-1 text-[22px] font-extrabold leading-none text-white">
                    {menuGroups.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/15 p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Blocks size={21} />
                </div>

                <div className="min-w-0">
                  <p className="m-0 text-xs font-medium text-white/85">
                    Tổng chức năng
                  </p>
                  <p className="m-0 mt-1 text-[22px] font-extrabold leading-none text-white">
                    {totalFunctions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SEARCH ================= */}
        <div
          role="search"
          className="
            flex h-14 w-full items-center gap-3
            rounded-xl border border-egmf-primary-border-soft
            bg-white px-4
            transition-all duration-200
            focus-within:border-egmf-primary
            focus-within:ring-[3px]
            focus-within:ring-egmf-primary/10
          "
        >
          <Search
            size={22}
            strokeWidth={2.3}
            className="shrink-0 text-egmf-primary"
          />

          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm kiếm chức năng..."
            aria-label="Tìm kiếm chức năng"
            autoComplete="off"
            className="
              h-full min-w-0 flex-1
              bg-transparent text-[16px] font-medium
              text-slate-900 outline-none
              placeholder:text-slate-400
            "
          />

          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              aria-label="Xóa tìm kiếm"
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full bg-egmf-primary-soft text-egmf-primary
                transition-colors hover:bg-egmf-primary-hover
              "
            >
              <X size={19} strokeWidth={2.4} />
            </button>
          )}
        </div>

        {/* ================= FUNCTION GROUPS ================= */}
        <section aria-label="Danh sách chức năng" className="space-y-4">
          {visibleGroups.length > 0 ? (
            visibleGroups.map((group, index) => (
              <FunctionGroup
                key={group.key}
                group={group}
                defaultOpen={searchValue.trim().length > 0 || index === 0}
                onFunctionClick={handleFunctionClick}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-egmf-primary-border-soft bg-white px-5 py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                <Search size={27} />
              </div>

              <EmptyState>Không tìm thấy chức năng phù hợp</EmptyState>

              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="
                  mt-4 inline-flex min-h-11 items-center gap-2
                  rounded-xl bg-egmf-primary px-5
                  text-[15px] font-semibold text-white
                  transition-colors hover:bg-egmf-primary-strong
                  active:scale-[0.98]
                "
              >
                Xóa tìm kiếm
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
