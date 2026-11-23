import { useMemo, useState } from "react";
import { Empty, Input } from "antd";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Package,
  Boxes,
  Layers3,
  MapPin,
  FileText,
  ReceiptText,
  Tag,
  RotateCcw,
} from "lucide-react";

const number = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
const display = (value) =>
  value == null || value === "" ? "—" : String(value);
const lines = (value) =>
  String(value ?? "")
    .split(/\r\n|\n\r|\r|\n/)
    .map((line) => line.trim().replace(/^-\s*/, ""))
    .filter(Boolean);
const getLocation = (basket) =>
  String(basket.fabricRolls?.[0]?.TenViTri ?? "")
    .replace(/^-\s*Vị trí:\s*/i, "")
    .trim() || "Chưa xác định";

function LegacyBasketFabricRollCollapse({ data = [] }) {
  const [keyword, setKeyword] = useState("");
  const [openBaskets, setOpenBaskets] = useState([]);
  const [openRolls, setOpenRolls] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const baskets = Array.isArray(data) ? data : [];

  const { filteredBaskets, totalRolls, totalQuantity } = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase("vi-VN");
    let totalRolls = 0;
    let totalQuantity = 0;
    const contains = (value) =>
      String(value ?? "")
        .toLocaleLowerCase("vi-VN")
        .includes(search);
    const filteredBaskets = baskets
      .map((basket, index) => {
        const rolls = Array.isArray(basket.fabricRolls)
          ? basket.fabricRolls
          : [];
        totalRolls += rolls.length;
        const quantity = rolls.reduce(
          (sum, roll) => sum + (Number(roll.TongSoLuong) || 0),
          0,
        );
        totalQuantity += quantity;
        const basketMatched = [
          basket.MaRo,
          basket.RId,
          getLocation(basket),
        ].some(contains);
        const matches =
          !search || basketMatched
            ? rolls
            : rolls.filter((roll) =>
                [
                  roll.MaCay,
                  roll.Item,
                  roll.MaMau,
                  roll.Lot,
                  roll.KhachHang,
                  roll.ThongTin,
                  roll.TenViTri,
                ].some(contains),
              );
        if (search && !basketMatched && matches.length === 0) return null;
        return {
          ...basket,
          _key: `basket-${basket.RId ?? index}`,
          _rolls: matches,
          _totalRolls: rolls.length,
          _quantity: quantity,
          _location: getLocation(basket),
        };
      })
      .filter(Boolean);
    return { filteredBaskets, totalRolls, totalQuantity };
  }, [data, keyword]);

  const toggleBasket = (key) =>
    setOpenBaskets((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  const toggleRoll = (key) =>
    setOpenRolls((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  const collapseAll = () => {
    setShowSummary(false);
    setOpenBaskets([]);
    setOpenRolls([]);
  };

  return (
    <div className="w-full min-w-0 space-y-4 text-slate-800">
      {/* NODE CHA: GIỮ BỐ CỤC GRADIENT VÀ 3 CHỈ SỐ */}
      <button
        type="button"
        aria-expanded={showSummary}
        onClick={() => setShowSummary((prev) => !prev)}
        style={{
          background:
            "linear-gradient(135deg, var(--egmf-primary) 0%, var(--egmf-primary-deep) 100%)",
          boxShadow: "var(--egmf-shadow-primary)",
        }}
        className="group relative w-full overflow-hidden rounded-2xl p-4 text-left text-white transition-all duration-200 hover:brightness-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-egmf-primary sm:p-5"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 sm:h-14 sm:w-14">
              <Layers3 size={27} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-xs font-extrabold uppercase tracking-[1.4px] text-white/90">
                QUẢN LÝ KHO VẢI
              </p>
              <h3 className="m-0 mt-1 text-xl font-extrabold text-white sm:text-2xl">
                Tổng quan kho
              </h3>
              <p className="m-0 mt-1 text-sm font-semibold text-white/85">
                Danh sách rổ và cây vải
              </p>
            </div>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 transition-transform duration-200 ${showSummary ? "rotate-180" : ""}`}
            >
              <ChevronDown size={25} strokeWidth={2.8} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Tổng rổ", value: baskets.length, Icon: Package },
              { label: "Cây vải", value: totalRolls, Icon: Boxes },
              { label: "Tổng SL", value: totalQuantity, Icon: Layers3 },
            ].map(({ label, value, Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-white/20 bg-white/15 px-2.5 py-3 sm:px-4"
              >
                <div className="flex items-center gap-1.5 text-white/95">
                  <Icon size={17} className="shrink-0" />
                  <span className="text-xs font-bold sm:text-sm">{label}</span>
                </div>
                <p className="m-0 mt-2 break-all text-xl font-extrabold text-white sm:text-2xl">
                  {number(value)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/25 pt-3 text-sm font-bold">
            <span>Dữ liệu kho</span>
            <span className="flex items-center gap-1.5">
              {showSummary ? "Thu gọn" : "Xem chi tiết"}
              <ChevronRight
                size={18}
                className={showSummary ? "rotate-90" : ""}
              />
            </span>
          </div>
        </div>
      </button>

      {showSummary && (
        <div className="space-y-4">
          <div className="space-y-3">
            {filteredBaskets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <Empty description="Không tìm thấy dữ liệu" />
              </div>
            ) : (
              filteredBaskets.map((basket) => {
                const isOpen = openBaskets.includes(basket._key);
                return (
                  <div
                    key={basket._key}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${isOpen ? "border-egmf-primary-border" : "border-egmf-border"}`}
                  >
                    {/* NODE RỔ */}
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleBasket(basket._key)}
                      className={`flex min-h-[88px] w-full items-center gap-3 p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-egmf-primary sm:p-4 ${isOpen ? "bg-egmf-primary-soft" : "bg-white hover:bg-egmf-primary-hover-soft"}`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isOpen ? "bg-egmf-primary text-white" : "bg-egmf-primary-soft text-egmf-primary"}`}
                      >
                        <Package size={24} strokeWidth={2.3} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="break-all text-lg font-extrabold text-egmf-ink sm:text-xl">
                            Rổ: {display(basket.MaRo)}
                          </span>
                          <span className="rounded-lg border border-egmf-primary-border-soft bg-white px-2.5 py-1 text-sm font-extrabold text-egmf-primary-deep">
                            {number(basket._totalRolls)} cây
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-semibold text-egmf-ink-secondary sm:text-base">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <MapPin
                              size={17}
                              className="shrink-0 text-egmf-primary"
                            />
                            <span className="break-words">
                              {basket._location}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers3 size={17} className="text-egmf-primary" />
                            SL: {number(basket._quantity)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform ${isOpen ? "rotate-90 border-egmf-primary bg-egmf-primary text-white" : "border-egmf-primary-border-soft bg-white text-egmf-primary"}`}
                      >
                        <ChevronRight size={23} strokeWidth={2.8} />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-egmf-primary-border-soft bg-egmf-surface-subtle px-3 py-4 sm:px-5">
                        {basket._rolls.length === 0 ? (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Rổ chưa có cây vải"
                          />
                        ) : (
                          <div className="ml-2 space-y-3 border-l-[3px] border-egmf-primary-border pl-3 sm:ml-4 sm:pl-5">
                            {basket._rolls.map((roll, index) => {
                              const rollKey = `${basket._key}-roll-${roll.MaCay ?? index}-${index}`;
                              const isRollOpen = openRolls.includes(rollKey);
                              return (
                                <div
                                  key={rollKey}
                                  className={`relative rounded-xl border bg-white shadow-sm ${isRollOpen ? "border-egmf-primary-border" : "border-egmf-border"}`}
                                >
                                  <span className="absolute -left-[15px] top-7 h-[3px] w-[14px] bg-egmf-primary-border sm:-left-[23px] sm:w-[22px]" />
                                  <button
                                    type="button"
                                    aria-expanded={isRollOpen}
                                    onClick={() => toggleRoll(rollKey)}
                                    className={`flex min-h-[76px] w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-egmf-primary sm:px-4 ${isRollOpen ? "bg-egmf-primary-soft" : "hover:bg-egmf-primary-hover-soft"}`}
                                  >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                                      <FileText size={22} strokeWidth={2.3} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="m-0 break-all text-base font-extrabold text-egmf-ink sm:text-lg">
                                        Cây: {display(roll.MaCay)}
                                      </p>
                                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-egmf-ink-soft">
                                        {roll.MaMau && (
                                          <span>
                                            Màu:{" "}
                                            <strong className="text-egmf-ink-secondary">
                                              {roll.MaMau}
                                            </strong>
                                          </span>
                                        )}
                                        {roll.Lot && (
                                          <span>
                                            Lot:{" "}
                                            <strong className="text-egmf-ink-secondary">
                                              {roll.Lot}
                                            </strong>
                                          </span>
                                        )}
                                        <span className="font-extrabold text-egmf-primary-deep">
                                          SL: {number(roll.TongSoLuong)}
                                        </span>
                                      </div>
                                    </div>
                                    <span
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-egmf-primary-border-soft bg-white text-egmf-primary transition-transform ${isRollOpen ? "rotate-90" : ""}`}
                                    >
                                      <ChevronRight
                                        size={22}
                                        strokeWidth={2.8}
                                      />
                                    </span>
                                  </button>
                                  {isRollOpen && (
                                    <div className="border-t border-egmf-primary-border-soft bg-egmf-surface-soft p-3 sm:p-4">
                                      <RollReceipt
                                        roll={roll}
                                        basket={basket}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RollReceipt({ roll, basket }) {
  const details = lines(roll.ThongTin).filter(
    (line) => !/^Mã cây\s*:/i.test(line),
  );
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-egmf-primary-border-soft bg-white shadow-[0_5px_20px_rgba(15,23,42,0.06)]">
      <div className="px-4 py-3 sm:px-5">
        {details.length > 0 && (
          <div className="mt-2">
            <h4 className="m-0 mb-3 flex items-center gap-2 text-base font-extrabold text-egmf-brand-deep">
              <Tag size={19} className="text-egmf-primary" />
              Thông tin chi tiết
            </h4>
            <div className="space-y-1 rounded-xl bg-egmf-surface-soft p-3 sm:p-4">
              {details.map((line, index) => (
                <p
                  key={index}
                  className="m-0 break-words py-1 text-[15px] font-semibold leading-7 text-egmf-ink-secondary sm:text-base"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <span className="min-w-0 flex-1 text-[15px] font-semibold text-egmf-ink-soft sm:text-base">
        {label}
      </span>
      <span className="max-w-[60%] break-words text-right text-[15px] font-extrabold text-egmf-ink sm:text-base">
        {display(value)}
      </span>
    </div>
  );
}

export default function BasketFabricRollCollapse({ data = [] }) {
  const [openRolls, setOpenRolls] = useState([]);
  const baskets = Array.isArray(data) ? data : [];

  const rolls = useMemo(
    () =>
      baskets.flatMap((basket, basketIndex) =>
        (Array.isArray(basket.fabricRolls) ? basket.fabricRolls : []).map(
          (roll, rollIndex) => ({
            ...roll,
            _key: `${basket.RId ?? basketIndex}-${roll.MaCay ?? rollIndex}-${rollIndex}`,
            _basket: basket,
          }),
        ),
      ),
    [data],
  );

  const toggleRoll = (key) =>
    setOpenRolls((previous) =>
      previous.includes(key)
        ? previous.filter((item) => item !== key)
        : [...previous, key],
    );

  return (
    <div className="w-full min-w-0 space-y-2.5">
      {rolls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-egmf-border bg-white p-6">
          <Empty description="Không tìm thấy cây vải" />
        </div>
      ) : (
        rolls.map((roll) => {
          const isOpen = openRolls.includes(roll._key);

          return (
            <article
              key={roll._key}
              className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${isOpen ? "border-egmf-primary-border" : "border-egmf-border hover:border-egmf-primary-border"}`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleRoll(roll._key)}
                className="grid w-full grid-cols-2 gap-x-3 gap-y-2 px-3.5 py-3 text-left transition hover:bg-egmf-surface-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:grid-cols-4 sm:px-4"
              >
                <RollField label="Cây" value={roll.MaCay} strong />
                <RollField label="SL" value={number(roll.TongSoLuong)} />
                <RollField label="Item" value={roll.Item} />
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <RollField label="Mã màu" value={roll.MaMau} />
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full border border-egmf-primary-border-soft bg-egmf-primary-tint text-egmf-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <ChevronDown size={16} strokeWidth={2.5} />
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-egmf-border-subtle bg-egmf-surface-subtle p-3 sm:p-4">
                  <RollReceipt roll={roll} basket={roll._basket} />
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}

function RollField({ label, value, strong = false }) {
  return (
    <span className="block min-w-0">
      <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">
        {label}
      </span>
      <span
        className={`mt-0.5 block break-words text-sm text-egmf-ink-secondary ${strong ? "font-extrabold text-egmf-ink" : "font-semibold"}`}
      >
        {display(value)}
      </span>
    </span>
  );
}
