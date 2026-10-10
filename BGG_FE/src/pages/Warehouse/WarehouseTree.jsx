import { useMemo, useState } from "react";
import { Empty } from "antd";
import {
  Warehouse,
  Package,
  Boxes,
  Layers3,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";

const PRIMARY = "#6865D9";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const display = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const normalize = (value) => String(value ?? "").toLocaleLowerCase("vi-VN");

const getRolls = (item) => {
  const rolls = item.fabricRolls ?? [];
  return Array.isArray(rolls) ? rolls.flat(Infinity) : [];
};

const commonLabels = new Set([
  "mã cây",
  "ma cay",
  "item",
  "art",
  "lot",
  "màu",
  "mã màu",
  "ma mau",
  "khách hàng",
  "khach hang",
  "brand",
  "số lượng",
  "so luong",
  "tổng số lượng",
  "tong so luong",
]);

const getDetailLines = (fabric) =>
  String(fabric.ThongTin ?? "")
    .replace(/\r\n|\n\r|\r/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean)
    .filter((line) => {
      const label = line.split(":")[0].trim().toLocaleLowerCase("vi-VN");
      return !commonLabels.has(label);
    });

export default function WarehouseTree({
  data = [],
  tongSoCay = 0,
  tongSoLuong = 0,
}) {
  const [keyword, setKeyword] = useState("");
  const [showSummary, setShowSummary] = useState(true);
  const [openGroups, setOpenGroups] = useState([]);

  const groups = Array.isArray(data) ? data : [];

  const filteredGroups = useMemo(() => {
    const search = normalize(keyword.trim());

    return groups
      .map((item, index) => {
        const rolls = getRolls(item);

        const groupMatched = [
          item.Item,
          item.Art,
          item.Lot,
          item.MaMau,
          item.TrangThaiDanhGia,
        ].some((value) => normalize(value).includes(search));

        const filteredRolls =
          !search || groupMatched
            ? rolls
            : rolls.filter((fabric) =>
                [
                  fabric.MaCay,
                  fabric.Item,
                  fabric.Art,
                  fabric.Lot,
                  fabric.MaMau,
                  fabric.KhachHang,
                  fabric.Brand,
                  fabric.ThongTin,
                ].some((value) => normalize(value).includes(search)),
              );

        if (search && !groupMatched && filteredRolls.length === 0) {
          return null;
        }

        return {
          ...item,
          _key: `group-${item.id ?? index}`,
          _rolls: filteredRolls,
          _totalRolls: rolls.length,
        };
      })
      .filter(Boolean);
  }, [data, keyword]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key],
    );
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* HEADER TỔNG QUAN */}
      <button
        type="button"
        aria-expanded={showSummary}
        onClick={() => setShowSummary((prev) => !prev)}
        className="w-full rounded-2xl p-4 text-left text-white shadow-[0_5px_16px_rgba(104,101,217,0.16)] sm:p-5"
        style={{ backgroundColor: PRIMARY }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Warehouse size={24} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-xl font-extrabold text-white">
              Tổng quan kho
            </h2>
            <p className="m-0 mt-1 text-sm font-medium text-white/85">
              Danh sách vật tư và cây vải
            </p>
          </div>

          <ChevronDown
            size={24}
            className={`shrink-0 transition-transform duration-200 ${
              showSummary ? "rotate-180" : ""
            }`}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <HeaderStat label="Nhóm vật tư" value={groups.length} />
          <HeaderStat label="Số cây" value={tongSoCay} />
          <HeaderStat label="Tổng SL" value={formatNumber(tongSoLuong)} />
        </div>
      </button>

      {showSummary && (
        <>
          {/* SEARCH */}
          <div className="flex h-14 w-full items-center gap-3 rounded-xl border border-[#D9D8F4] bg-white px-4 transition focus-within:border-[#6865D9] focus-within:ring-[3px] focus-within:ring-[#6865D9]/10">
            <Search
              size={22}
              strokeWidth={2.3}
              className="shrink-0 text-[#6865D9]"
            />

            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Item, Art, LOT, màu, mã cây, khách hàng, Brand, trạng thái, thông tin..."
              aria-label="Tìm kiếm vật tư"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />

            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                aria-label="Xóa tìm kiếm"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EFFF] text-[#6865D9]"
              >
                <X size={19} />
              </button>
            )}
          </div>

          {/* SỐ KẾT QUẢ */}
          {keyword.trim() && (
            <p className="m-0 px-1 text-sm font-semibold text-slate-600">
              Tìm thấy {filteredGroups.length} nhóm vật tư phù hợp
            </p>
          )}

          {/* DANH SÁCH NHÓM VẬT TƯ */}
          <div className="space-y-3">
            {filteredGroups.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <Empty description="Không tìm thấy dữ liệu" />
              </div>
            ) : (
              filteredGroups.map((item) => {
                const isOpen = openGroups.includes(item._key);

                return (
                  <div
                    key={item._key}
                    className="overflow-hidden rounded-2xl border border-[#E1E0ED] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                  >
                    {/* CARD NHÓM - CAO CỐ ĐỊNH */}
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleGroup(item._key)}
                      className={`flex h-[164px] w-full flex-col justify-between p-3.5 text-left transition-colors sm:p-4 ${
                        isOpen ? "bg-[#F5F4FF]" : "bg-white hover:bg-[#FAF9FF]"
                      }`}
                    >
                      {/* HÀNG 1 */}
                      <div className="flex w-full min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isOpen
                              ? "bg-[#6865D9] text-white"
                              : "bg-[#F0EFFF] text-[#6865D9]"
                          }`}
                        >
                          <Package size={23} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-xs font-semibold text-slate-500">
                            Nhóm vật tư
                          </p>

                          <h3
                            className="m-0 mt-0.5 truncate text-lg font-extrabold text-slate-900"
                            title={display(item.Item)}
                          >
                            {display(item.Item)}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-lg bg-[#F0EFFF] px-2.5 py-1.5 text-xs font-bold text-[#5653C5]">
                          {item._totalRolls} cây
                        </span>

                        <ChevronRight
                          size={22}
                          className={`shrink-0 text-[#6865D9] transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {/* HÀNG 2 */}
                      <div className="grid w-full grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                        <CompactInfo label="ART" value={item.Art} />
                        <CompactInfo label="LOT" value={item.Lot} />
                        <CompactInfo label="MÀU" value={item.MaMau} />
                      </div>

                      {/* HÀNG 3 */}
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          Tổng số lượng
                        </span>

                        <span className="truncate text-lg font-extrabold text-[#6865D9]">
                          {formatNumber(item.TongSoLuong)}
                        </span>
                      </div>
                    </button>

                    {/* CHI TIẾT CÂY VẢI */}
                    {isOpen && (
                      <div className="border-t border-[#E1E0ED] bg-[#FAFAFD] p-3 sm:p-4">
                        {item._rolls.length === 0 ? (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Nhóm chưa có cây vải"
                          />
                        ) : (
                          <div className="ml-2 space-y-3 border-l-2 border-[#C5C3EF] pl-3 sm:ml-3 sm:pl-4">
                            {item._rolls.map((fabric, index) => (
                              <div
                                key={`${item._key}-${fabric.MaCay ?? index}-${index}`}
                                className="relative"
                              >
                                <div className="absolute -left-[14px] top-7 h-0.5 w-[13px] bg-[#C5C3EF] sm:-left-[18px] sm:w-[17px]" />

                                <RollDetail fabric={fabric} group={item} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

function HeaderStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/15 px-2.5 py-3 sm:px-3">
      <p className="m-0 text-xs font-medium text-white/90">{label}</p>

      <p className="m-0 mt-1 break-all text-lg font-extrabold text-white sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function CompactInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-xs font-medium text-slate-500">{label}</p>

      <p
        className="m-0 mt-1 truncate text-[15px] font-bold text-slate-800"
        title={display(value)}
      >
        {display(value)}
      </p>
    </div>
  );
}

function RollDetail({ fabric, group }) {
  const details = getDetailLines(fabric);

  return (
    <article className="overflow-hidden rounded-xl border border-[#E1E0ED] bg-white">
      {/* MÃ CÂY */}
      <div className="flex items-center gap-3 border-b border-[#E1E0ED] bg-[#F5F4FF] px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#6865D9]">
          <FileText size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="m-0 text-xs font-semibold text-slate-500">Mã cây vải</p>

          <h4 className="m-0 mt-0.5 break-all text-lg font-extrabold text-slate-900">
            {display(fabric.MaCay)}
          </h4>
        </div>
      </div>

      {/* THÔNG TIN CHÍNH */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DetailInfo label="Khách hàng" value={fabric.KhachHang} />
          <DetailInfo label="Brand" value={fabric.Brand} />
          <DetailInfo label="Item" value={fabric.Item ?? group.Item} />
          <DetailInfo label="Art" value={fabric.Art ?? group.Art} />
          <DetailInfo label="LOT" value={fabric.Lot ?? group.Lot} />
          <DetailInfo label="Màu" value={fabric.MaMau ?? group.MaMau} />
        </div>

        {/* THÔNG TIN BỔ SUNG */}
        {details.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h5 className="m-0 mb-2 text-base font-bold text-slate-900">
              Thông tin bổ sung
            </h5>

            <div className="divide-y divide-slate-100">
              {details.map((line, index) => {
                const colonIndex = line.indexOf(":");

                if (colonIndex === -1) {
                  return (
                    <p
                      key={index}
                      className="m-0 break-words py-2.5 text-[15px] font-medium leading-6 text-slate-700"
                    >
                      {line}
                    </p>
                  );
                }

                const label = line.slice(0, colonIndex).trim();
                const value = line.slice(colonIndex + 1).trim();

                return (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-500">
                      {label}
                    </span>

                    <span className="max-w-[60%] break-words text-right text-[15px] font-bold text-slate-900">
                      {display(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TỔNG SỐ LƯỢNG */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E1E0ED] pt-4">
          <span className="text-sm font-semibold text-slate-600">
            Tổng số lượng
          </span>

          <span className="break-all text-xl font-extrabold text-[#6865D9]">
            {formatNumber(fabric.TongSoLuong)}
          </span>
        </div>
      </div>
    </article>
  );
}

function DetailInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-xs font-medium text-slate-500">{label}</p>

      <p className="m-0 mt-1 break-words text-[15px] font-bold text-slate-900">
        {display(value)}
      </p>
    </div>
  );
}
