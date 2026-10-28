import { useMemo, useState } from "react";

import Icon from "../../../shared/components/ui/Icon";
import { useWarehouseSearch } from "../hooks/useWarehouseSearch";
import WarehouseTree from "./WarehouseTree";
import BasketFabricRollTree from "./BasketFabricRollTree";
import MaterialInfoCard from "./MaterialInfoCard";

const searchOptions = [
  { value: "MA_HANG", label: "Mã hàng", icon: "barcode" },
  { value: "VAT_TU", label: "Vật tư", icon: "boxes" },
  { value: "VI_TRI", label: "Vị trí", icon: "mapPin" },
  { value: "RO", label: "Rổ/Rơ/Palet", icon: "package" },
];
const EMPTY_DATA = [];

export default function WarehouseDetail({ warehouse, onBack }) {
  // Thông tin kho
  const warehouseName = warehouse?.name || "Chi tiết kho";
  const KId = warehouse?.KId || null;

  const { resultSearch, loading, error, search, reset } =
    useWarehouseSearch(KId);

  // State
  const [searchType, setSearchType] = useState("MA_HANG");
  const [keyword, setKeyword] = useState("");
  const [searchTypeOpen, setSearchTypeOpen] = useState(false);

  // Loại tìm kiếm đang chọn
  const selectedOption = searchOptions.find(
    (option) => option.value === searchType,
  );

  // Danh sách kết quả
  const data = Array.isArray(resultSearch?.data)
    ? resultSearch.data
    : EMPTY_DATA;

  // Tính tổng
  const { tongSoCay, tongSoLuong } = useMemo(() => {
    return data.reduce(
      (total, item) => {
        total.tongSoCay += Number(item.TongSoCay) || 0;
        total.tongSoLuong += Number(item.TongSoLuong) || 0;

        return total;
      },
      {
        tongSoCay: 0,
        tongSoLuong: 0,
      },
    );
  }, [data]);

  // Đổi loại tìm kiếm
  const handleSearchTypeChange = (value) => {
    reset();
    setSearchType(value);
    setKeyword("");
    setSearchTypeOpen(false);
  };

  // Thay đổi từ khóa
  const handleKeywordChange = (value) => {
    reset();
    setKeyword(value);
  };

  // Xử lý tìm kiếm
  const handleSearch = (event) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("keyword") ?? "");

    void search(searchType, value);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      {/* Nội dung chính */}
      <section className="overflow-hidden rounded-[20px] border border-egmf-border bg-white shadow-[0_8px_24px_rgba(47,45,105,0.055)]">
        {/* Thanh màu */}
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-egmf-border-muted bg-egmf-surface-subtle px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-egmf-primary text-white shadow-egmf-primary">
              <Icon name="warehouse" size={21} />
            </span>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-egmf-muted-soft">
                Kho hàng
              </p>

              <h2 className="mt-0.5 break-words text-lg font-bold tracking-[-0.02em] text-egmf-ink sm:text-xl">
                {warehouseName}
              </h2>
            </div>
          </div>
        </div>

        {/* Khu vực tìm kiếm */}
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-xl font-bold tracking-[-0.03em] text-egmf-ink">
                Tìm kiếm tồn kho
              </p>

              <p className="mt-1 text-[15px] leading-6 text-egmf-muted">
                Chọn thông tin cần tra cứu, sau đó nhập từ khóa.
              </p>
            </div>
          </div>

          {/* Loại tìm kiếm */}
          <div className="relative mt-5 w-full sm:max-w-md">
            <button
              aria-controls="warehouse-search-type-options"
              aria-expanded={searchTypeOpen}
              aria-haspopup="listbox"
              className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-egmf-primary-border-soft bg-white px-3.5 text-left text-[15px] font-semibold text-egmf-ink-secondary transition hover:border-egmf-primary-border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
              onClick={() => setSearchTypeOpen((open) => !open)}
              type="button"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                <Icon name={selectedOption.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold text-egmf-ink">
                  {selectedOption.label}
                </span>
              </span>
              <Icon
                className={`text-egmf-primary transition-transform ${
                  searchTypeOpen ? "rotate-180" : ""
                }`}
                name="chevronDown"
                size={18}
              />
            </button>
            <div
              id="warehouse-search-type-options"
              role="listbox"
              aria-label="Kiểu tìm kiếm"
              className={`absolute inset-x-0 top-[calc(100%+8px)] z-20 grid gap-1.5 rounded-2xl border border-egmf-primary-border-soft bg-white p-1.5 shadow-[0_12px_28px_rgba(47,45,105,0.14)] ${
                searchTypeOpen ? "grid" : "hidden"
              }`}
            >
              {searchOptions.map((option) => (
                <label
                  key={option.value}
                  className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[15px] font-bold leading-none transition ${
                    searchType === option.value
                      ? "border-egmf-primary-border bg-egmf-primary-soft text-egmf-primary-strong"
                      : "border-egmf-border bg-white text-egmf-ink-soft hover:border-egmf-primary-border-hover hover:bg-egmf-surface-subtle"
                  }`}
                >
                  <input
                    type="radio"
                    name="warehouse-search-type"
                    value={option.value}
                    checked={searchType === option.value}
                    onChange={() => handleSearchTypeChange(option.value)}
                    className="m-0 size-5 shrink-0 accent-egmf-primary"
                  />
                  <Icon
                    className="text-egmf-primary"
                    name={option.icon}
                    size={17}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            {/* Form tìm kiếm */}
          </div>

          <form data-submit-on-scan="true" onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <div className="flex h-[56px] min-w-0 items-center gap-2 rounded-2xl border border-egmf-border bg-white py-1.5 pl-3.5 pr-[76px] transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                <input
                  name="keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                  aria-label={`Tìm theo ${selectedOption.label}`}
                  placeholder={`Nhập ${selectedOption.label.toLocaleLowerCase("vi-VN")}`}
                  className="min-w-0 flex-1 bg-transparent text-base text-egmf-ink outline-none placeholder:text-egmf-placeholder"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !keyword.trim()}
                aria-label={loading ? "Đang tìm kiếm" : "Tìm kiếm"}
                className="absolute right-1.5 top-1/2 grid h-11 w-14 -translate-y-1/2 place-items-center rounded-xl bg-egmf-primary text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                ) : (
                  <Icon name="search" size={19} />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Kết quả tìm kiếm */}
        <div className="border-t border-egmf-border-muted bg-egmf-surface-soft px-4 py-5 sm:px-6 sm:py-6">
          {loading ? (
            // Đang tải
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <span className="size-8 animate-spin rounded-full border-4 border-egmf-primary-soft border-t-egmf-primary" />

              <p className="text-sm text-egmf-muted">
                Đang tìm kiếm tồn kho...
              </p>
            </div>
          ) : error ? (
            // Lỗi API
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          ) : data.length > 0 ? (
            // Có dữ liệu
            <div className="w-full min-w-0">
              {searchType === "VI_TRI" ? (
                <BasketFabricRollTree data={data} />
              ) : searchType === "RO" ? (
                <WarehouseTree
                  data={data}
                  tongSoCay={tongSoCay}
                  tongSoLuong={tongSoLuong}
                />
              ) : searchType === "VAT_TU" ? (
                <div className="flex flex-col gap-3">
                  {data.map((item, index) => (
                    <MaterialInfoCard
                      key={`${item.MaRo}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : searchType === "MA_HANG" ? (
                <div className="flex flex-col gap-3">
                  {data.map((item, index) => (
                    <MaterialInfoCard
                      key={`${item.MaRo}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            // Không có dữ liệu
            <div className="flex flex-1 items-center justify-center">
              <div className="flex max-w-sm flex-col items-center px-3 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                  <Icon name="package" size={22} />
                </span>

                <h3 className="mt-4 text-base font-bold text-egmf-ink">
                  Chưa có dữ liệu tồn kho
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-egmf-muted">
                  Nhập mã hàng, vật tư hoặc vị trí để bắt đầu tra cứu tồn kho.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
