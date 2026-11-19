import { CheckCircle2, GitBranch, Layers3, ScanLine } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { layDanhSachCayNoiBaoGomCayGoc } from "../api/cutting.api";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const toNumber = (value) => {
  const parsed = Number(String(value ?? 0).replace(",", "."));

  return Number.isFinite(parsed) ? parsed : 0;
};

const number = (value) => toNumber(value).toFixed(2);
const totalRecovery = (roll) =>
  [
    roll.ThuHoiMot1,
    roll.ThuHoiMot2,
    roll.ThuHoiMot3,
    roll.ThuHoiMot4,
    roll.ThuHoiMot5,
  ].reduce((total, value) => total + toNumber(value), 0);

function RollCard({ roll, isRoot = false, rootCode }) {
  const thuHoi = totalRecovery(roll);
  const isDauKhuc = roll.isDauKhuc === true || toNumber(roll.DauKhuc) > 0;

  return (
    <article
      className={`overflow-hidden rounded-xl border border-l-4 bg-white p-3 shadow-sm transition hover:border-egmf-primary-border hover:shadow-egmf-card sm:p-4 ${
        isRoot
          ? "border-egmf-primary-border border-l-egmf-primary"
          : "border-egmf-border border-l-slate-300"
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-egmf-border-subtle pb-2.5">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-600">
          {isRoot ? "Cây gốc" : "Cây con"}
        </span>
        <div className="flex items-center gap-1.5">
          {isDauKhuc && (
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              Đầu khúc{roll.SoDauKhuc ? ` ${roll.SoDauKhuc}` : ""}
            </span>
          )}
          {isRoot && (
            <CheckCircle2 size={14} className="shrink-0 text-egmf-primary" />
          )}
        </div>
      </div>
      <div className="mt-2 flex min-w-0 items-baseline justify-between gap-2 rounded-lg border border-egmf-border-subtle px-2.5 py-2">
        <p
          className="m-0 min-w-0 truncate text-base font-extrabold text-egmf-ink"
          title={roll.MaCay}
        >
          {roll.MaCay}
        </p>
        {!isRoot && (
          <span className="shrink-0 text-[11px] font-semibold text-egmf-muted">
            Nối từ: {rootCode}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-semibold text-egmf-ink-secondary">
        <span>
          Màu/Lot: {roll.MauVai || "—"} / {roll.MauLot || "—"}
        </span>
        <span>PO: {roll.PO || "—"}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 [&>div]:rounded-lg [&>div]:border [&>div]:border-egmf-border-subtle [&>div]:bg-white [&>div]:px-2.5 [&>div]:py-2">
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Mét cây</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
            {number(roll.Met)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Số mét trải</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
            {number(roll.SoMetTrai)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">
            Tiêu hao thực tế
          </dt>
          <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
            {number(roll.TieuHaoThucTe)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Thực tế</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
            {number(roll.ThucTe)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Thu hồi</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-emerald-700">
            {number(thuHoi)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Thừa</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-amber-700">
            {number(roll.Thua)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Thiếu</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-rose-700">
            {number(roll.Thieu)} m
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold text-egmf-muted">Nguyên cây</dt>
          <dd className="m-0 mt-0.5 font-extrabold text-egmf-primary">
            {number(roll.NguyenCay)} m
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-egmf-border-subtle pt-2.5">
        <span className="rounded-md bg-egmf-surface-subtle px-2 py-1 text-[11px] font-bold text-egmf-ink-secondary">
          Yard: {number(roll.Yard)} yd
        </span>
        <span className="rounded-md bg-egmf-surface-subtle px-2 py-1 text-[11px] font-bold text-egmf-ink-secondary">
          Số BTP: {Math.trunc(toNumber(roll.SoBTP))}
        </span>
        {roll.TachLop && (
          <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">
            Tách lớp: {roll.TachLop}
          </span>
        )}
      </div>
    </article>
  );
}

export default function FabricSplicingChainPage() {
  const location = useLocation();
  const { id } = useParams();
  const cayGoc = location?.state?.cayGoc ?? {};
  const chiTietPhieuHoachToanId = Number(
    cayGoc.ChiTietPhieuHoachToanId ?? id ?? 0,
  );
  const [dsCayNoi, setDsCayNoi] = useState([]);

  const cayGocTuDanhSach =
    dsCayNoi.find((roll) => roll.MaCay === cayGoc.MaCay) ?? dsCayNoi[0] ?? {};
  const thongTinCayGoc = { ...cayGocTuDanhSach, ...cayGoc };

  console.log(location);

  //LẤY DANH SÁCH CÂY NỐI THEO CÂY GỐC
  useEffect(() => {
    const fetchDsCayNoiVaGoc = async () => {
      if (!chiTietPhieuHoachToanId) {
        setDsCayNoi([]);
        return;
      }

      try {
        const response = await layDanhSachCayNoiBaoGomCayGoc(
          Number(chiTietPhieuHoachToanId),
        );
        if (!response.success) {
          showErrorToast(response.message || "Không thể lấy danh sách cây nối");
          setDsCayNoi([]);
          return;
        }
        setDsCayNoi(response?.data || []);
      } catch (error) {
        console.error("Không thể lấy ds cây nối: ", error);
        showErrorToast(error?.message || "Không thể lấy danh sách cây nối");
      }
    };
    fetchDsCayNoiVaGoc();
  }, [chiTietPhieuHoachToanId]);

  const handleScan = () => {
    console.log("Quét cây nối tiếp", data);
  };

  return (
    <MainLayout screenTitle={`Nối tiếp cây - ${thongTinCayGoc.MaCay ?? ""}`}>
      <main className="min-h-full bg-egmf-surface px-4 py-3 pb-24 text-egmf-ink sm:px-6 sm:py-4 sm:pb-24 lg:px-8 lg:pb-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(18rem,.72fr)_minmax(0,1.45fr)] lg:gap-4">
            <aside className="space-y-3 lg:sticky lg:top-3">
              <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
                <header className="flex items-center gap-2.5 border-b border-egmf-border-subtle bg-gradient-to-r from-egmf-primary-soft via-white to-white px-3 py-2.5 sm:px-4">
                  <span className="grid size-8 place-items-center rounded-lg bg-white text-egmf-primary shadow-sm ring-1 ring-egmf-primary/10">
                    <Layers3 size={17} strokeWidth={2.3} />
                  </span>
                  <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                    Cây gốc
                  </h2>
                </header>
                <div className="p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-egmf-border-subtle pb-3">
                    <p className="m-0 break-all text-base font-extrabold text-egmf-ink">
                      {thongTinCayGoc.MaCay || "—"}
                    </p>
                    <span className="rounded-full bg-egmf-primary-tint px-2.5 py-1 text-[11px] font-bold text-egmf-primary">
                      Cây gốc
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-egmf-muted">
                        Màu / Lot
                      </dt>
                      <dd className="m-0 mt-0.5 truncate font-bold text-egmf-ink-secondary">
                        {thongTinCayGoc.MauVai || "—"} /{" "}
                        {thongTinCayGoc.MauLot || "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-egmf-muted">PO</dt>
                      <dd className="m-0 mt-0.5 truncate font-bold text-egmf-ink-secondary">
                        {thongTinCayGoc.PO || "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-egmf-muted">
                        Số lớp trải
                      </dt>
                      <dd className="m-0 mt-0.5 font-bold text-egmf-ink-secondary">
                        {toNumber(thongTinCayGoc.SoLopTrai)} lớp
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-egmf-muted">
                        Đầu khúc
                      </dt>
                      <dd className="m-0 mt-0.5 font-bold text-egmf-ink-secondary">
                        {thongTinCayGoc.isDauKhuc ? "Có" : "Không"}
                      </dd>
                    </div>
                    <div className="col-span-2 min-w-0 border-t border-egmf-border-subtle pt-2.5">
                      <dt className="text-xs font-bold text-egmf-muted">
                        Ngày quét
                      </dt>
                      <dd className="m-0 mt-0.5 truncate font-bold text-egmf-ink-secondary">
                        {formatDateTime(thongTinCayGoc.NgayQuet) || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            </aside>

            <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
              <header className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-3 py-2.5 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                    <GitBranch size={17} strokeWidth={2.3} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="m-0 truncate text-sm font-extrabold text-egmf-ink">
                      Danh sách cây trong chuỗi
                    </h2>
                    <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                      Theo thứ tự quét và hạch toán
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-egmf-primary-tint px-2.5 py-1 text-xs font-bold text-egmf-primary">
                  {dsCayNoi.length} cây
                </span>
              </header>

              <div className="p-3 sm:p-4">
                <div className="space-y-2.5">
                  {dsCayNoi.map((roll, index) => (
                    <RollCard
                      key={`${roll.ChiTietPhieuHoachToanId}-${index}`}
                      roll={roll}
                      isRoot={roll.MaCay === thongTinCayGoc.MaCay}
                      rootCode={thongTinCayGoc.MaCay}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-egmf-border bg-white/95 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={handleScan}
          className="mx-auto flex min-h-12 w-full max-w-7xl items-center justify-center gap-2 rounded-xl bg-egmf-primary px-4 text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(37,99,235,.24)] transition active:scale-[0.99]"
        >
          <ScanLine size={19} strokeWidth={2.4} />
          Quét cây nối tiếp
        </button>
      </div>
    </MainLayout>
  );
}
