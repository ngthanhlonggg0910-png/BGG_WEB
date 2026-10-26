import {
  ChevronRight,
  Package,
  Search,
  SlidersHorizontal,
  ScanBarcode,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getDanhSachVatTuTheoBarcodeKien } from "../api/mappingQrApi";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

function MappingQrCard({ item, onClick }) {
  return (
    <article
      onClick={onClick}
      className="group flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-egmf-border bg-white p-4 shadow-sm transition-all duration-200 hover:border-egmf-primary-border hover:shadow-egmf-card"
    >
      <div className="min-w-0 flex-1 divide-y divide-egmf-border-subtle text-sm text-egmf-ink [&>p]:py-2.5 [&>p:first-child]:pt-0 [&>p:last-child]:pb-0 sm:text-[15px]">
        <p className="m-0">
          Ngày giám định: {formatDateTime(item.ngayGiamDinh)}
        </p>
        <p className="m-0">Số phiếu: {item.maPhieu ?? ""}</p>
        <p className="m-0">Mã hàng: {item.maHang ?? ""}</p>
        <p className="m-0">Loại giám định: {item.loaiGiamDinh ?? ""}</p>
        <p className="m-0">Lô: {item.Lo ?? ""}</p>
        <p className="m-0">Mã rổ: {item.MaRo ?? ""}</p>
        <p className="m-0">Trạng thái: {item.trangThai ?? ""}</p>
        <p className="m-0">Người tạo: {item.tenNguoiTao ?? ""}</p>
        <p className="m-0">
          Người giám định: {item.nguoiGiamDinh ?? item.tenNguoiGiamDinh ?? ""}
        </p>
      </div>
      <ChevronRight
        size={22}
        strokeWidth={2.5}
        className="mt-1 shrink-0 text-egmf-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-egmf-primary"
      />
    </article>
  );
}

export default function MappingQrBarcodePage() {
  const navigate = useNavigate();

  const [barcode, setBarcode] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  console.log(data);
  const fetchVatTu = async () => {
    const code = barcode.trim();

    if (!code) {
      showErrorToast("Vui lòng nhập barcode kiện");
      return;
    }

    if (loading) return;

    setLoading(true);
    setHasSearched(true);
    setData([]);

    try {
      const response = await getDanhSachVatTuTheoBarcodeKien(code);

      if (!response?.success) {
        showErrorToast(
          response?.message || "Lỗi lấy danh sách theo barcode kiện",
        );
        return;
      }

      const result = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      setData(result);
    } catch (error) {
      console.error("Lỗi tra cứu barcode:", error);

      showErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể kết nối đến máy chủ",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout screenTitle="Tìm barcode kiện">
      <main className="min-h-full bg-egmf-surface px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="mx-auto w-full max-w-2xl">
          {/* Tabs */}
          <nav
            aria-label="Kiểu tra cứu"
            className="mb-4 grid grid-cols-2 rounded-2xl border border-egmf-border bg-egmf-surface-raised p-1.5 shadow-egmf-card"
          >
            <button
              type="button"
              onClick={() => navigate("/mapping-qr-list")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-bold text-egmf-ink-soft transition-colors hover:bg-egmf-primary-tint"
            >
              <SlidersHorizontal size={17} />
              Theo thời gian
            </button>

            <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-2 text-center text-sm font-bold text-white shadow-egmf-primary-compact">
              <Search size={17} />
              Theo barcode kiện
            </div>
          </nav>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchVatTu();
            }}
            className="rounded-2xl border border-egmf-primary-border-soft bg-egmf-surface-raised p-2 shadow-egmf-card sm:p-2.5"
          >
            <div className="flex h-14 items-center gap-3 rounded-xl border border-egmf-border bg-white px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all focus-within:border-egmf-primary focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                <ScanBarcode size={20} strokeWidth={2.2} />
              </span>

              <input
                aria-label="Barcode kiện"
                autoComplete="off"
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-egmf-ink outline-none placeholder:font-medium placeholder:text-egmf-placeholder sm:text-base"
                placeholder="Nhập hoặc quét barcode kiện"
                spellCheck={false}
                type="search"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-egmf-primary px-4 text-[15px] font-bold text-white shadow-egmf-primary-compact transition-all hover:bg-egmf-primary-strong active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Search size={18} strokeWidth={2.5} />
                  Tra cứu barcode
                </>
              )}
            </button>
          </form>

          {/* Results */}
          <div className="mt-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 text-egmf-primary">
                <Loader2 size={32} className="animate-spin" />
                <p className="text-sm font-semibold">Đang tải dữ liệu...</p>
              </div>
            ) : data.length > 0 ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-egmf-ink">
                    Kết quả tra cứu
                  </h2>

                  <span className="rounded-full bg-egmf-primary-soft px-3 py-1 text-xs font-bold text-egmf-primary">
                    {data.length} phiếu
                  </span>
                </div>

                <div className="space-y-3">
                  {data.map((item, index) => (
                    <MappingQrCard
                      key={item.pGDId ?? index}
                      item={item}
                      onClick={() =>
                        navigate(`/mapping-qr-detail/${item.pGDId}`, {
                          state: {
                            loai: item.loaiGiamDinh,
                            maPhieu: item.maPhieu,
                          },
                        })
                      }
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised px-5 py-10 text-center shadow-egmf-card">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                  {hasSearched ? (
                    <Package size={32} />
                  ) : (
                    <ScanBarcode size={32} />
                  )}
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-egmf-ink">
                  {hasSearched
                    ? "Không tìm thấy dữ liệu"
                    : "Tìm theo barcode kiện"}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-egmf-ink-soft">
                  {hasSearched
                    ? "Không có phiếu giám định phù hợp với barcode đã nhập."
                    : "Nhập hoặc quét barcode kiện, sau đó nhấn Lọc để xem danh sách phiếu giám định."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </MainLayout>
  );
}
