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

  console.log(data);

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
    const value = String(
      new FormData(event.currentTarget).get("keyword") ?? "",
    );

    void search(searchType, value);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh_-_192px_-_env(safe-area-inset-bottom))] w-full max-w-6xl flex-col px-4 py-3 sm:px-6 sm:py-4 md:min-h-[calc(100dvh_-_104px)] lg:px-8">
      {/* Nội dung chính */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-egmf-border bg-white shadow-sm">
        {/* Thanh màu */}
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-egmf-border-muted bg-egmf-surface-subtle px-3.5 py-2.5 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-egmf-primary text-white shadow-egmf-primary-compact">
              <Icon name="warehouse" size={18} />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-egmf-muted-soft">
                Kho hàng
              </p>

              <h2 className="mt-0.5 break-words text-base font-extrabold tracking-[-0.02em] text-egmf-ink sm:text-lg">
                {warehouseName}
              </h2>
            </div>
          </div>
        </div>

        {/* Khu vực tìm kiếm */}
        <div className="px-3.5 py-3 sm:px-4 sm:py-4">
          <div className="mt-3 grid gap-2.5 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-end">
            {/* Loại tìm kiếm */}
            <div className="relative w-full">
              <button
                aria-controls="warehouse-search-type-options"
                aria-expanded={searchTypeOpen}
                aria-haspopup="listbox"
                className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-egmf-primary-border-soft bg-white px-3.5 text-left text-sm font-semibold text-egmf-ink-secondary transition hover:border-egmf-primary-border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                onClick={() => setSearchTypeOpen((open) => !open)}
                type="button"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                  <Icon name={selectedOption.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-egmf-ink">
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
                className={`absolute inset-x-0 top-[calc(100%+6px)] z-20 grid gap-1 rounded-xl border border-egmf-primary-border-soft bg-white p-1.5 shadow-[0_12px_28px_rgba(47,45,105,0.14)] ${
                  searchTypeOpen ? "grid" : "hidden"
                }`}
              >
                {searchOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold leading-none transition ${
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
            </div>

            <form
              data-submit-on-scan="true"
              onSubmit={handleSearch}
              className="mt-0"
            >
              <div className="relative">
              <div className="flex h-12 min-w-0 items-center gap-2 rounded-xl border border-egmf-border bg-white py-1 pl-3.5 pr-[76px] transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                  <input
                    name="keyword"
                    type="search"
                    value={keyword}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    aria-label={`Tìm theo ${selectedOption.label}`}
                    placeholder={`Nhập ${selectedOption.label.toLocaleLowerCase("vi-VN")}`}
                    className="min-w-0 flex-1 bg-transparent text-sm text-egmf-ink outline-none placeholder:text-egmf-placeholder"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !keyword.trim()}
                  aria-label={loading ? "Đang tìm kiếm" : "Tìm kiếm"}
                className="absolute right-1 top-1/2 inline-flex h-10 min-w-16 -translate-y-1/2 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-egmf-primary to-blue-500 px-2.5 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(37,99,235,0.24)] transition hover:from-egmf-primary-strong hover:to-egmf-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  ) : (
                  <>
                    <Icon name="search" size={16} />
                    <span>Tìm</span>
                  </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kết quả tìm kiếm */}
        <div className="flex flex-1 flex-col border-t border-egmf-border-muted bg-egmf-surface-soft p-4">
          {loading ? (
            // Đang tải
            <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3">
              <span className="size-8 animate-spin rounded-full border-4 border-egmf-primary-soft border-t-egmf-primary" />

              <p className="text-sm text-egmf-muted">
                Đang tìm kiếm tồn kho...
              </p>
            </div>
          ) : error ? (
            // Lỗi API
            <div className="flex min-h-[280px] w-full flex-col items-center justify-center text-center">
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
            <div className="relative flex min-h-[280px] w-full flex-1">
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-egmf-primary-border-soft bg-white px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10">
                <span aria-hidden="true" className="absolute -right-12 -top-12 size-40 rounded-full bg-egmf-primary-soft/60 blur-2xl" />
                <span aria-hidden="true" className="absolute -bottom-16 -left-12 size-36 rounded-full bg-cyan-100/60 blur-2xl" />

                <span className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-egmf-primary to-blue-500 text-white shadow-egmf-primary">
                  <Icon name="package" size={25} />
                </span>

                <h3 className="relative mt-3 text-base font-extrabold text-egmf-ink sm:text-lg">
                  Chưa có dữ liệu tồn kho
                </h3>

                <p className="relative mt-1 max-w-md text-sm leading-5 text-egmf-muted">
                  Chọn loại tra cứu và nhập từ khóa để xem vị trí, số lượng tồn kho.
                </p>

                <div className="relative mt-5 grid w-full max-w-md grid-cols-2 gap-2 text-left">
                  {searchOptions.map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center gap-2 rounded-lg border border-egmf-border-subtle bg-egmf-surface-subtle px-2.5 py-2 text-xs font-bold text-egmf-ink-secondary"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-egmf-primary-soft text-egmf-primary">
                        <Icon name={option.icon} size={14} />
                      </span>
                      <span className="truncate">{option.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
