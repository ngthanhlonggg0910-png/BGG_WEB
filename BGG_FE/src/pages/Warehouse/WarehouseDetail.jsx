import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { searchByMaRo } from "../../api/warehouseApi";
import { searchByItemCode } from "../../api/warehouseApi";
import { searchMaterialLocations } from "../../api/warehouseApi";
import {
  getBasketsByWarehouseLocation,
  getBasketFabricRolls,
  getFabricRollsByRo,
} from "../../api/basketAPI";

import Icon from "../../components/ui/Icon";
import MainLayout from "../../layouts/MainLayout";
import WarehouseTree from "./WarehouseTree";
import BasketFabricRollTree from "../../components/Basket/BasketFabricRollCollapse";
import MaterialInfoCard from "../Material/MaterialInfoCard";

const searchOptions = [
  { value: "MA_HANG", label: "Mã hàng", icon: "barcode" },
  { value: "VAT_TU", label: "Vật tư", icon: "boxes" },
  { value: "VI_TRI", label: "Vị trí", icon: "mapPin" },
  { value: "RO", label: "Rổ/Rơ/Palet", icon: "package" },
];

const getUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Lỗi đọc thông tin tài khoản:", error);
    return null;
  }
};

export default function WarehouseDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Thông tin kho
  const warehouse = location.state?.warehouse;
  const warehouseName = warehouse?.name || "Chi tiết kho";
  const KId = warehouse?.KId || null;
  // State
  const [searchType, setSearchType] = useState("MA_HANG");
  const [keyword, setKeyword] = useState("");
  const [resultSearch, setResultSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTypeOpen, setSearchTypeOpen] = useState(false);

  // Dùng để bỏ qua kết quả từ request cũ
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  // Loại tìm kiếm đang chọn
  const selectedOption = searchOptions.find(
    (option) => option.value === searchType,
  );

  // Danh sách kết quả
  const data = Array.isArray(resultSearch?.data) ? resultSearch.data : [];

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
  }, [resultSearch]);

  // Đổi loại tìm kiếm
  const handleSearchTypeChange = (value) => {
    requestIdRef.current += 1;

    setSearchType(value);
    setKeyword("");
    setResultSearch(null);
    setError("");
    setLoading(false);
    setSearchTypeOpen(false);
  };

  // Thay đổi từ khóa
  const handleKeywordChange = (value) => {
    requestIdRef.current += 1;

    setKeyword(value);
    setResultSearch(null);
    setError("");
    setLoading(false);
  };

  // Xử lý tìm kiếm
  const handleSearch = async (event) => {
    event.preventDefault();

    // 1. Kiểm tra từ khóa
    if (!keyword.trim()) return;

    // 3. Bắt đầu tìm kiếm
    setLoading(true);
    setError("");
    setResultSearch(null);

    try {
      // 2. Lấy thông tin tài khoản
      const user = getUser();
      const TKId = user?.data?.TKId;

      if (!TKId) {
        setError("Không tìm thấy tài khoản");
        return;
      }

      let result;

      // 4. Gọi API theo loại tìm kiếm
      switch (searchType) {
        case "RO": {
          result = await searchByMaRo({
            KID: KId,
            MaHang: keyword.trim(),
            TKId: Number(TKId),
          });

          const groups = (result.data ?? []).flat();
          const data = [];

          for (const item of groups) {
            const response2 = await getFabricRollsByRo(
              KId,
              keyword.trim(),
              item.Item,
              item.Art ?? "",
              item.Lot ?? "",
              item.MaMau ?? "",
              Number(TKId),
            );

            data.push({
              ...item,
              fabricRolls: response2.data ?? [],
            });

            result = { data };
          }
          break;
        }
        case "VI_TRI":
          {
            console.log(warehouse);
            // PROC 1: Tìm các rổ theo vị trí
            const response1 = await getBasketsByWarehouseLocation(
              KId,
              keyword.trim(),
            );

            const baskets = response1.data ?? [];
            const data = [];

            // PROC 2: Tìm cây vải trong từng rổ
            for (const basket of baskets) {
              const response2 = await getBasketFabricRolls(
                KId,
                basket.MaRo,
                Number(TKId),
              );

              data.push({
                ...basket,
                fabricRolls: response2.data ?? [],
              });
            }

            result = { data };
          }
          break;

        case "VAT_TU":
          {
            const response = await searchMaterialLocations(
              Number(KId),
              keyword.trim(),
              Number(TKId),
            );

            const data = response.data ?? [];
            result = { data };
          }
          break;

        case "MA_HANG":
          {
            const response = await searchByItemCode(
              Number(KId),
              keyword.trim(),
            );
            const data = (await response.data) ?? [];
            result = { data };
          }
          break;
        default:
          setError("Chức năng chưa được hỗ trợ");
          return;
      }

      // 5. Lưu kết quả
      setResultSearch(result);
    } catch (error) {
      setError(error.message || "Tìm kiếm thất bại");
      console.log(error);
    } finally {
      // 6. Kết thúc loading
      setLoading(false);
    }
  };

  const handleViewBasketDetail = (VTId) => {
    const user = getUser();
    const TKId = user?.data?.TKId;

    if (!TKId || KId == null) {
      setError("Thiếu thông tin kho hoặc tài khoản");
      return;
    }

    navigate("/basket-detail", {
      state: {
        KID: KId,
        VTId,
        TKId: Number(TKId),
      },
    });
  };

  return (
    <MainLayout screenTitle={warehouseName}>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        {/* Nút quay lại */}
        <button
          type="button"
          onClick={() => navigate("/warehouse")}
          aria-label="Quay lại danh sách kho"
          className="
    group mb-4 inline-flex min-h-12 items-center gap-3
    rounded-xl py-1.5 pr-4
    text-[16px] font-bold text-slate-800
    transition-all duration-200 ease-out
    hover:bg-[#F5F4FF] hover:text-[#5653C5]
    active:scale-[0.97]
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-[#6865D9]
  "
        >
          {/* Icon */}
          <span
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl bg-[#E9E8FB] text-[#6865D9]
              transition-all duration-200 ease-out
              group-hover:bg-[#6865D9] group-hover:text-white
              group-active:scale-95
            "
          >
            <Icon name="arrowLeft" size={22} />
          </span>

          {/* Text */}
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            Danh sách kho
          </span>
        </button>

        {/* Nội dung chính */}
        <section className="overflow-hidden rounded-[20px] border border-[#e1e1ec] bg-white shadow-[0_8px_24px_rgba(47,45,105,0.055)]">
          {/* Thanh màu */}
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#e8e7f0] bg-[#fbfbfe] px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#6865D9] text-white shadow-[0_6px_14px_rgba(104,101,217,0.22)]">
                <Icon name="warehouse" size={21} />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#858492]">
                  Kho hàng
                </p>

                <h2 className="mt-0.5 break-words text-lg font-bold tracking-[-0.02em] text-[#252530] sm:text-xl">
                  {warehouseName}
                </h2>
              </div>
            </div>
          </div>

          {/* Khu vực tìm kiếm */}
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-xl font-bold tracking-[-0.03em] text-[#252530]">
                  Tìm kiếm tồn kho
                </p>

                <p className="mt-1 text-[15px] leading-6 text-[#74747f]">
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
                className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-[#d9d8e6] bg-white px-3.5 text-left text-[15px] font-semibold text-[#41414d] transition hover:border-[#b9b7ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6865D9]/15"
                onClick={() => setSearchTypeOpen((open) => !open)}
                type="button"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#E9E8FB] text-[#6865D9]">
                  <Icon name={selectedOption.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-[#252530]">
                    {selectedOption.label}
                  </span>
                </span>
                <Icon
                  className={`text-[#6865D9] transition-transform ${
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
                className={`absolute inset-x-0 top-[calc(100%+8px)] z-20 grid gap-1.5 rounded-2xl border border-[#d9d8e6] bg-white p-1.5 shadow-[0_12px_28px_rgba(47,45,105,0.14)] ${
                  searchTypeOpen ? "grid" : "hidden"
                }`}
              >
                {searchOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[15px] font-bold leading-none transition ${
                      searchType === option.value
                        ? "border-[#aaa8e9] bg-[#E9E8FB] text-[#5653C5]"
                        : "border-[#e1e1ec] bg-white text-[#5e5d69] hover:border-[#cac9e8] hover:bg-[#fbfbfe]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="warehouse-search-type"
                      value={option.value}
                      checked={searchType === option.value}
                      onChange={() => handleSearchTypeChange(option.value)}
                      className="m-0 size-5 shrink-0 accent-[#6865D9]"
                    />
                    <Icon
                      className="text-[#6865D9]"
                      name={option.icon}
                      size={17}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Form tìm kiếm */}
            </div>

            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <div className="flex h-[56px] min-w-0 items-center gap-2 rounded-2xl border border-[#d9d9e6] bg-white py-1.5 pl-3.5 pr-[76px] transition focus-within:border-[#6865D9] focus-within:ring-4 focus-within:ring-[#6865D9]/10">
                  <input
                    type="search"
                    value={keyword}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    aria-label={`Tìm theo ${selectedOption.label}`}
                    placeholder={`Nhập ${selectedOption.label.toLocaleLowerCase("vi-VN")}`}
                    className="min-w-0 flex-1 bg-transparent text-base text-[#252530] outline-none placeholder:text-[#9897a5]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !keyword.trim()}
                  aria-label={loading ? "Đang tìm kiếm" : "Tìm kiếm"}
                  className="absolute right-1.5 top-1/2 grid h-11 w-14 -translate-y-1/2 place-items-center rounded-xl bg-[#6865D9] text-white shadow-[0_6px_14px_rgba(104,101,217,0.20)] transition hover:bg-[#5653C5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6865D9]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="border-t border-[#e8e7f0] bg-[#f8f8fb] px-4 py-5 sm:px-6 sm:py-6">
            {loading ? (
              // Đang tải
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <span className="size-8 animate-spin rounded-full border-4 border-[#E9E8FB] border-t-[#6865D9]" />

                <p className="text-sm text-[#74747f]">
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
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#E9E8FB] text-[#6865D9]">
                    <Icon name="package" size={22} />
                  </span>

                  <h3 className="mt-4 text-base font-bold text-[#252530]">
                    Chưa có dữ liệu tồn kho
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-[#74747f]">
                    Nhập mã hàng, vật tư hoặc vị trí để bắt đầu tra cứu tồn kho.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
