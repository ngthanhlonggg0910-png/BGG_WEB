import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  RotateCcw,
  Scissors,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const mockData = [
  { id: 1, maPhieu: "PC-20261105-001", maHang: "N264WDW121", ngayCat: "2026-11-05", soLuong: 1200, trangThai: "unfinished" },
  { id: 2, maPhieu: "PC-20261105-002", maHang: "N264UDW121", ngayCat: "2026-11-05", soLuong: 850, trangThai: "finished" },
  { id: 3, maPhieu: "PC-20261105-003", maHang: "N264WDW121", ngayCat: "2026-11-05", soLuong: 600, trangThai: "unfinished" },
];

export default function CuttingManagementPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("unfinished");
  const [loading] = useState(false);
  const [documents] = useState(mockData);

  const filteredByDate = useMemo(
    () => documents.filter((item) => {
      const normalizedKeyword = keyword.trim().toLowerCase();

      return (
        (!selectedDate || item.ngayCat === selectedDate)
        && (!normalizedKeyword
          || item.maHang.toLowerCase().includes(normalizedKeyword)
          || item.maPhieu.toLowerCase().includes(normalizedKeyword))
      );
    }),
    [documents, selectedDate, keyword],
  );

  const unfinishedCount = filteredByDate.filter((item) => item.trangThai === "unfinished").length;
  const finishedCount = filteredByDate.filter((item) => item.trangThai === "finished").length;
  const filteredDocuments = filteredByDate.filter((item) => item.trangThai === activeTab);

  const handleReset = () => {
    setSelectedDate(getToday());
    setKeyword("");
    setActiveTab("unfinished");
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleViewDetail = (item) => {
    // TODO: Điều hướng đến trang chi tiết phiếu cắt.
    console.log("Chi tiết phiếu cắt:", item);
  };

  const tabs = [
    { count: unfinishedCount, icon: Clock3, id: "unfinished", label: "Chưa hoàn thành" },
    { count: finishedCount, icon: CheckCircle2, id: "finished", label: "Hoàn thành" },
  ];

  return (
    <MainLayout screenTitle="Khâu cắt">
      <main className="min-h-full bg-egmf-surface px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-3 sm:space-y-4">
          <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3.5 py-2.5 sm:px-4">
              <h2 className="m-0 text-sm font-extrabold text-egmf-ink">Bộ lọc tìm kiếm</h2>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-egmf-primary transition hover:bg-egmf-primary-tint hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
              >
                <RotateCcw size={15} strokeWidth={2.4} />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
            </div>

            <div className="grid gap-2.5 p-3 sm:p-3.5 md:grid-cols-2 md:gap-3">
              <label className="min-w-0">
                <span className="mb-1 block text-xs font-bold text-egmf-ink-secondary">Ngày cắt</span>
                <input aria-label="Ngày cắt" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-11 w-full rounded-lg border border-egmf-border bg-white px-3 text-sm font-medium text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10" />
              </label>

              <label className="min-w-0">
                <span className="mb-1 block text-xs font-bold text-egmf-ink-secondary">Tìm kiếm</span>
                <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Mã hàng hoặc mã phiếu" className="h-11 w-full rounded-lg border border-egmf-border bg-white px-3 text-sm font-medium text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10" />
              </label>
            </div>
          </section>

          <section aria-label="Trạng thái phiếu cắt" className="grid grid-cols-2 gap-1.5 rounded-xl border border-egmf-border bg-egmf-surface-raised p-1.5 shadow-sm" role="tablist">
            {tabs.map(({ count, icon: Icon, id, label }) => {
              const isActive = activeTab === id;

              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(id)}
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:text-sm ${isActive ? id === "finished" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm" : "bg-orange-50 text-orange-700 ring-1 ring-orange-200 shadow-sm" : "text-egmf-muted hover:bg-slate-50 hover:text-egmf-ink-soft"}`}
                >
                  <Icon size={17} strokeWidth={2.4} />
                  <span className="truncate">{label}</span>
                  <span className={`grid min-w-5 place-items-center rounded-full bg-white px-1.5 py-0.5 text-[11px] leading-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${isActive ? id === "finished" ? "text-emerald-700" : "text-orange-700" : "text-egmf-muted"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-2.5 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                  <Scissors size={17} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 text-sm font-extrabold text-egmf-ink">Danh sách phiếu cắt</h2>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-egmf-primary-tint px-2.5 py-1 text-xs font-bold text-egmf-primary">{filteredDocuments.length} phiếu</span>
            </div>

            <div className="p-3 sm:p-4">
              {loading ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-8">
                  <div className="size-9 animate-spin rounded-full border-4 border-egmf-primary-soft border-t-egmf-primary" />
                  <p className="m-0 mt-3 text-sm font-medium text-egmf-muted">Đang tải danh sách phiếu cắt...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-4 py-8 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary"><ClipboardList size={27} strokeWidth={1.9} /></span>
                  <p className="m-0 mt-3 text-[15px] font-bold text-egmf-ink-secondary">Không tìm thấy phiếu cắt</p>
                  <p className="m-0 mt-1 max-w-sm text-sm leading-5 text-egmf-muted">Điều chỉnh bộ lọc hoặc chọn lại trạng thái để xem dữ liệu.</p>
                </div>
              ) : (
                <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">
                  {filteredDocuments.map((item) => {
                    const isFinished = item.trangThai === "finished";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleViewDetail(item)}
                        className="group w-full rounded-xl border border-egmf-border bg-white p-3 text-left shadow-sm transition-all duration-200 hover:border-egmf-primary-border hover:shadow-egmf-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-egmf-muted">Mã phiếu cắt</p>
                            <h3 className="m-0 mt-1 truncate text-[15px] font-extrabold text-egmf-ink sm:text-base">{item.maPhieu}</h3>
                          </div>
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-surface-tint text-egmf-muted transition group-hover:bg-egmf-primary-soft group-hover:text-egmf-primary">
                            <ChevronRight size={18} strokeWidth={2.5} />
                          </span>
                        </div>

                        <dl className="mt-2.5 grid grid-cols-2 gap-2.5 rounded-lg bg-egmf-surface-subtle p-2.5">
                          <div className="min-w-0">
                            <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Mã hàng</dt>
                            <dd className="m-0 mt-0.5 truncate text-sm font-bold text-egmf-ink-secondary">{item.maHang}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Số lượng cắt</dt>
                            <dd className="m-0 mt-0.5 text-sm font-bold text-egmf-ink-secondary">{item.soLuong.toLocaleString("vi-VN")}</dd>
                          </div>
                        </dl>

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-egmf-muted">
                            <CalendarDays size={14} className="text-egmf-primary" /> {formatDate(item.ngayCat)}
                          </span>
                          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${isFinished ? "bg-egmf-success-soft text-egmf-success" : "bg-egmf-warning-soft text-egmf-warning"}`}>
                            {isFinished ? "Hoàn thành" : "Chưa hoàn thành"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}
