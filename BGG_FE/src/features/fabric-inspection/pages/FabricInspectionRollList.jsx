import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PackageSearch, Search, X } from "lucide-react";

import { getCayVaiTheoPhieuKiem } from "../api/fabric-inspections.api";

import { FabricRollCard } from "../components/FabricRollCard";
import MainLayout from "../../../layouts/MainLayout/MainLayout";

export default function FabricInspectionRollList({ onScan, onRollAction }) {
  const { pkvId } = useParams();

  const [rolls, setRolls] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!pkvId) throw new Error("Không tìm thấy PKVId");
      const response = await getCayVaiTheoPhieuKiem(Number(pkvId));
      setRolls(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách cây: ", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách cây",
      );
      setRolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pkvId]);

  const filteredRolls = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase("vi-VN");
    if (!search) return rolls;
    return rolls.filter((item) =>
      [
        item.MaCayVai,
        item.MaHang,
        item.Mua,
        item.SoRoll,
        item.Lot,
        item.TenNPL,
        item.SoLuongChungTu,
        item.KhoVaiTenTem,
        item.KhoVaiThucTe,
        item.SoLuongThucTe,
        item.DiemTrungBinh,
        item.GhiChu,
        item.HuongXuLy,
        item.TenNguoiTao,
        item.SoCay,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("vi-VN")
          .includes(search),
      ),
    );
  }, [keyword, rolls]);

  return (
    <MainLayout screenTitle="Chi tiết phiếu kiểm vải">
      <main className="mx-auto w-full max-w-[1300px] px-4 py-5 sm:px-6 sm:py-7 md:px-8">
        <section aria-label="Danh sách cây vải" className="space-y-5">
          <div className=" flex h-14 items-center gap-3 rounded-xl border border-egmf-primary-border-soft bg-egmf-surface-subtle px-4 transition-colors focus-within:border-egmf-primary focus-within:ring-[3px] focus-within:ring-egmf-primary/10">
            <Search size={21} className="shrink-0 text-egmf-primary" />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm mã cây, mã hàng, LOT..."
              aria-label="Tìm kiếm cây vải"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-medium text-egmf-ink outline-none placeholder:text-egmf-placeholder [&::-webkit-search-cancel-button]:hidden"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                aria-label="Xóa từ khóa tìm kiếm"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-egmf-primary-soft text-egmf-primary transition-colors hover:bg-egmf-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary"
              >
                <X size={19} />
              </button>
            )}
          </div>

          {!loading && filteredRolls.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 className="m-0 text-[17px] font-bold text-egmf-ink">
                Danh sách cây vải
              </h2>
              <span className="shrink-0 rounded-lg bg-egmf-primary-soft px-3 py-1.5 text-sm font-bold text-egmf-primary-strong">
                {filteredRolls.length} cây
              </span>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <RollSkeleton />
              <RollSkeleton />
            </div>
          ) : filteredRolls.length === 0 ? (
            <EmptyState hasSearch={Boolean(keyword)} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredRolls.map((item, index) => (
                <FabricRollCard
                  key={item?.MaCayVai}
                  item={item}
                  index={index}
                  onAction={(action, roll) => onRollAction?.(action, roll)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}

function RollSkeleton() {
  return (
    <div className="animate-pulse rounded-egmf-large border border-egmf-border bg-white p-4 shadow-egmf-card">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-egmf-primary-soft" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-egmf-surface-tint" />
          <div className="h-5 w-2/3 rounded bg-egmf-surface-tint" />
        </div>
      </div>
      <div className="my-4 h-px bg-egmf-border-subtle" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 rounded-xl bg-egmf-surface-soft" />
        <div className="h-14 rounded-xl bg-egmf-surface-soft" />
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="rounded-egmf-large border border-egmf-border bg-white px-5 py-12 text-center shadow-egmf-card">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
        <PackageSearch size={27} />
      </span>
      <h3 className="m-0 mt-4 text-[18px] font-bold text-egmf-ink">
        {hasSearch ? "Không tìm thấy cây vải" : "Chưa có cây vải"}
      </h3>
      <p className="m-0 mt-2 text-[15px] leading-6 text-egmf-muted">
        {hasSearch
          ? "Thử tìm theo mã cây, mã hàng hoặc LOT khác."
          : "Các cây vải thuộc phiếu kiểm sẽ hiển thị tại đây."}
      </p>
    </div>
  );
}
