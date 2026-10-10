import { useMemo, useState } from "react";
import { Empty, Input, Tree } from "antd";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers3,
  MapPin,
  Package,
  Search,
} from "lucide-react";

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

const formatThongTin = (thongTin) =>
  String(thongTin ?? "")
    .split(/\r\n|\n\r|\r|\n/)
    .map((line) => line.trim().replace(/^-\s*/, ""))
    .filter(Boolean);

export default function BasketFabricRollTree({ data = [] }) {
  const [keyword, setKeyword] = useState("");
  const [expandedKeys, setExpandedKeys] = useState([]);

  const baskets = Array.isArray(data) ? data : [];
  const fabricRolls = baskets.flatMap((basket) => basket.fabricRolls ?? []);
  const tongRo = baskets.length;
  const tongCay = fabricRolls.length;
  const tongSoLuong = fabricRolls.reduce(
    (sum, item) => sum + (Number(item.TongSoLuong) || 0),
    0,
  );

  const treeData = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase("vi-VN");

    return baskets
      .map((basket, basketIndex) => {
        const rolls = basket.fabricRolls ?? [];
        const filteredRolls = rolls.filter((item) => {
          if (!search) return true;

          return [
            basket.MaRo,
            item.MaCay,
            item.Item,
            item.MaMau,
            item.Lot,
            item.KhachHang,
            item.ThongTin,
          ].some((value) =>
            String(value ?? "")
              .toLocaleLowerCase("vi-VN")
              .includes(search),
          );
        });

        if (search && filteredRolls.length === 0) return null;

        const basketKey = `basket-${basket.RId ?? basketIndex}`;
        const isExpanded = keyword.trim()
          ? true
          : expandedKeys.includes(basketKey);
        const tongSLRo = rolls.reduce(
          (sum, item) => sum + (Number(item.TongSoLuong) || 0),
          0,
        );
        const viTri =
          rolls[0]?.TenViTri?.replace(/^-\s*Vị trí:\s*/, "") ||
          "Chưa xác định";

        return {
          key: basketKey,
          title: (
            <div
              aria-expanded={isExpanded}
              className="w-full min-w-0 cursor-pointer rounded-2xl border border-[#d9d8f4] border-l-4 border-l-[#6865D9] bg-[#fbfbfe] px-4 py-3.5 transition-colors duration-200 hover:border-[#aaa8e9] hover:bg-[#f5f4fe] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6865D9]/15 sm:px-5 sm:py-4"
              onClick={() => {
                if (!keyword.trim()) {
                  setExpandedKeys((keys) =>
                    keys.includes(basketKey)
                      ? keys.filter((key) => key !== basketKey)
                      : [...keys, basketKey],
                  );
                }
              }}
              onKeyDown={(event) => {
                if (
                  !keyword.trim() &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  setExpandedKeys((keys) =>
                    keys.includes(basketKey)
                      ? keys.filter((key) => key !== basketKey)
                      : [...keys, basketKey],
                  );
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 font-bold text-[#343367]">
                  <Package size={21} className="shrink-0 text-[#6865D9]" />
                  <span className="break-all text-base">{basket.MaRo}</span>
                </div>
                <span className="flex shrink-0 items-center gap-2 rounded-xl border border-[#d9d8f4] bg-white px-3 py-1.5 text-sm font-semibold text-[#5653C5]">
                  {rolls.length} cây
                  <ChevronDown
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    size={19}
                  />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5e5d69]">
                <span className="flex items-center gap-1.5">
                  <Layers3 size={15} className="text-[#6865D9]" />
                  Tổng SL: {formatNumber(tongSLRo)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#6865D9]" />
                  {viTri}
                </span>
              </div>
            </div>
          ),
          children: filteredRolls.map((item, index) => ({
            key: `${basketKey}-roll-${item.MaCay ?? index}-${index}`,
            isLeaf: true,
            title: (
              <div className="relative my-3 ml-4 border-l-2 border-[#d9d8e6] bg-[#fafafd] pl-4 before:absolute before:-left-px before:top-7 before:h-px before:w-4 before:-translate-x-full before:bg-[#d9d8e6]">
                <div className="w-full min-w-0 rounded-2xl border border-[#e1e1ec] bg-white p-3 transition-colors duration-200 hover:border-[#c3c1ed] sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 font-semibold text-[#252530]">
                      <FileText size={19} className="shrink-0 text-[#6865D9]" />
                      <span className="break-all text-base">{item.MaCay}</span>
                    </div>
                    <span className="rounded-xl bg-[#E9E8FB] px-3 py-1.5 text-sm font-bold text-[#5653C5]">
                      {formatNumber(item.TongSoLuong)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#74747f]">
                    <span className="break-words">
                      {item.Item || "Chưa có vật tư"}
                    </span>
                    {item.MaMau && (
                      <span className="rounded-lg bg-[#f4f3fa] px-2 py-1 font-medium text-[#5e5d69]">
                        {item.MaMau}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid border-t border-[#ececf3]">
                    {formatThongTin(item.ThongTin)
                      .filter((line) => !line.startsWith("Mã cây:"))
                      .map((line, lineIndex) => {
                        const colonIndex = line.indexOf(":");
                        const label =
                          colonIndex >= 0 ? line.slice(0, colonIndex + 1) : "";
                        const value =
                          colonIndex >= 0
                            ? line.slice(colonIndex + 1).trim()
                            : line;

                        return (
                          <div
                            key={lineIndex}
                            className="grid grid-cols-[96px_minmax(0,1fr)] gap-2 border-b border-[#f0eff5] px-3 py-2.5 text-sm leading-relaxed last:border-b-0 sm:grid-cols-[128px_minmax(0,1fr)]"
                          >
                            <span className="font-medium text-[#858492]">
                              {label}
                            </span>
                            <span className="min-w-0 break-words text-[#5e5d69]">
                              {value || "—"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ),
          })),
        };
      })
      .filter(Boolean);
  }, [baskets, expandedKeys, keyword]);

  const visibleKeys = treeData.map((item) => item.key);

  return (
    <div className="w-full min-w-0 rounded-[18px] border border-[#e1e1ec] bg-white p-4 shadow-[0_6px_18px_rgba(47,45,105,0.04)] sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[#E9E8FB] text-[#6865D9]">
          <Boxes size={21} />
        </span>
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] text-[#858492]">
            TỒN KHO
          </p>
          <h2 className="m-0 mt-0.5 text-xl font-bold tracking-[-0.025em] text-[#252530]">
            Danh sách cây vải
          </h2>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-2 min-[375px]:grid-cols-3 sm:gap-3">
        {[
          { label: "Tổng rổ", value: tongRo },
          { label: "Tổng cây", value: tongCay },
          { label: "Tổng SL", value: tongSoLuong },
        ].map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 rounded-xl bg-[#f7f7fb] p-3 sm:p-4"
          >
            <p className="mb-1 text-sm text-[#74747f]">{stat.label}</p>
            <p className="m-0 break-all text-xl font-bold tabular-nums text-[#252530] sm:text-2xl">
              {formatNumber(stat.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          size="large"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          prefix={<Search size={16} className="text-[#6865D9]" />}
          placeholder="Tìm mã cây, vật tư, LOT..."
          className="!h-auto !min-h-[52px] w-full !rounded-2xl !border-[#d9d8e6] !bg-[#fbfbfe] !px-4 shadow-none transition hover:!border-[#b9b7ed] focus-within:!border-[#6865D9] focus-within:!ring-4 focus-within:!ring-[#6865D9]/10 [&_.ant-input]:!min-h-0 [&_.ant-input]:!py-0 [&_.ant-input]:!text-base sm:max-w-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpandedKeys(visibleKeys)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#e1e1ec] px-4 text-[15px] font-semibold text-[#5e5d69] transition-colors hover:border-[#c3c1ed] hover:bg-[#f3f2fd] hover:text-[#5653C5] active:scale-[0.98] sm:flex-none"
          >
            <ChevronDown size={15} />
            Mở tất cả
          </button>
          <button
            type="button"
            onClick={() => setExpandedKeys([])}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#e1e1ec] px-4 text-[15px] font-semibold text-[#5e5d69] transition-colors hover:border-[#c3c1ed] hover:bg-[#f3f2fd] hover:text-[#5653C5] active:scale-[0.98] sm:flex-none"
          >
            <ChevronRight size={15} />
            Thu gọn
          </button>
        </div>
      </div>

      {treeData.length > 0 ? (
        <Tree
          className="w-full !bg-transparent [&_.ant-tree-indent]:!hidden [&_.ant-tree-treenode]:!w-full [&_.ant-tree-treenode]:!items-start [&_.ant-tree-treenode]:!pb-2 [&_.ant-tree-node-content-wrapper]:!h-auto [&_.ant-tree-node-content-wrapper]:!min-w-0 [&_.ant-tree-node-content-wrapper]:!flex-1 [&_.ant-tree-node-content-wrapper]:!p-0 [&_.ant-tree-node-content-wrapper]:hover:!bg-transparent [&_.ant-tree-title]:!block [&_.ant-tree-title]:!whitespace-normal [&_.ant-tree-switcher]:!hidden"
          treeData={treeData}
          expandedKeys={keyword.trim() ? visibleKeys : expandedKeys}
          onExpand={(keys) => {
            if (!keyword.trim()) setExpandedKeys(keys);
          }}
          showLine
          blockNode
          selectable={false}
        />
      ) : (
        <Empty description="Không tìm thấy cây vải" />
      )}
    </div>
  );
}
