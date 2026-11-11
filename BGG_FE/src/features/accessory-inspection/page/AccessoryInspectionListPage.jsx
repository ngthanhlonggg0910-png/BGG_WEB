import React, { useCallback, useEffect, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  Package,
  QrCode,
  ScanBarcode,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import MappingQrListPage from "../../mapping-qr/pages/MappingQrListPage";
import { getMaterialsByQrTrang } from "../../mapping-qr/api/mappingQrApi";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

const CARTON_CACHE_KEY = "accessory-inspection:last-carton-qr";

function getTrangThaiLabel(trangThai) {
  switch (String(trangThai ?? "").trim().toUpperCase()) {
    case "MOITAO":
      return {
        label: "Mới tạo",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "CHOKIEM":
      return {
        label: "Chờ kiểm",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "DAXACNHAN":
      return {
        label: "Đã xác nhận",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "HUY":
    case "HUYXACNHAN":
      return {
        label: "Đã hủy",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    default:
      return {
        label: trangThai || "—",
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

export default function AccessoryInspectionListPage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState("carton"); // "carton" | "time"
  const [barcode, setBarcode] = useState(() => {
    try {
      return sessionStorage.getItem(CARTON_CACHE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState("");

  const fetchCartonMaterials = useCallback(
    async (rawCode, silentIfEmpty = false) => {
      const code = String(rawCode ?? "").trim();
      if (!code) {
        if (!silentIfEmpty) {
          showErrorToast("Vui lòng quét hoặc nhập mã tem thùng (VD: GPA...)");
        }
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const response = await getMaterialsByQrTrang(code);
        if (!response?.success) {
          setMaterials([]);
          showErrorToast(
            response?.message || "Không lấy được danh sách vật tư theo tem thùng",
          );
          return;
        }

        const list = Array.isArray(response.data) ? response.data : [];
        setMaterials(list);

        try {
          if (list.length > 0) {
            sessionStorage.setItem(
              CARTON_CACHE_KEY,
              list[0]?.QrTrangMapping || code,
            );
          }
        } catch {
          // ignore storage quota errors
        }
      } catch (error) {
        console.error("Lỗi tra cứu tem thùng:", error);
        setMaterials([]);
        showErrorToast(
          error?.message || "Không thể kết nối máy chủ khi tra cứu tem thùng",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Tự động tải lại thùng vừa quét khi quay lại từ trang chi tiết kiểm phụ liệu
  useEffect(() => {
    try {
      const savedCode = sessionStorage.getItem(CARTON_CACHE_KEY);
      if (savedCode && savedCode.trim()) {
        fetchCartonMaterials(savedCode, true);
      }
    } catch {
      // ignore
    }
  }, [fetchCartonMaterials]);

  const handleClearCarton = () => {
    setBarcode("");
    setMaterials([]);
    setHasSearched(false);
    setFilterKeyword("");
    try {
      sessionStorage.removeItem(CARTON_CACHE_KEY);
    } catch {
      // ignore
    }
  };

  if (activeMode === "time") {
    return (
      <div className="relative">
        <MappingQrListPage
          sourcePage="accessory-inspection"
          screenTitle="Kiểm phụ liệu"
          onSwitchToCartonScan={() => setActiveMode("carton")}
        />
      </div>
    );
  }

  const firstItem = materials[0] || null;
  const effectiveCartonQr =
    firstItem?.QrTrangMapping || barcode.trim().toUpperCase();
  const totalTemsInCarton = materials.reduce(
    (sum, m) => sum + Number(m.SoTemTrongThung || 0),
    0,
  );
  const totalQtyInCarton = Number(
    materials
      .reduce((sum, m) => sum + Number(m.SoLuongTrongThung || 0), 0)
      .toFixed(4),
  );

  const filteredMaterials = materials.filter((item) => {
    const q = filterKeyword.trim().toLowerCase();
    if (!q) return true;
    return [
      item.TenChungLoai,
      item.DienGiai,
      item.Item,
      item.MaChungLoai,
      item.ColorCode,
      item.Size,
      item.Lot,
      item.SoPO,
      item.ChungTu,
    ].some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  const statusBadge = getTrangThaiLabel(firstItem?.TrangThaiPhieu);

  return (
    <MainLayout screenTitle="Kiểm phụ liệu">
      <main className="min-h-full bg-egmf-surface px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <section className="mx-auto w-full max-w-4xl space-y-3.5 sm:space-y-4">
          {/* Chuyển chế độ: Quét tem thùng (Mặc định) vs Theo thời gian */}
          <nav
            aria-label="Chế độ tra cứu kiểm phụ liệu"
            className="grid w-full max-w-md grid-cols-2 rounded-xl border border-egmf-primary-border-soft bg-white p-1.5 shadow-[0_3px_10px_rgba(37,99,235,0.07)]"
          >
            <button
              type="button"
              onClick={() => setActiveMode("carton")}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-egmf-primary to-blue-500 px-2.5 text-center text-xs font-bold text-white shadow-[0_4px_10px_rgba(37,99,235,0.22)] sm:text-sm"
            >
              <ScanBarcode size={17} strokeWidth={2.3} />
              <span>Quét tem thùng</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("time")}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg px-2.5 text-center text-xs font-bold text-egmf-ink-soft transition-all duration-200 hover:bg-egmf-primary-tint hover:text-egmf-primary-strong sm:text-sm"
            >
              <SlidersHorizontal size={17} strokeWidth={2.3} />
              <span>Theo thời gian</span>
            </button>
          </nav>

          {/* Ô Quét / Nhập mã Tem thùng GPA */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCartonMaterials(barcode);
            }}
            className="rounded-2xl border border-egmf-primary-border-soft bg-white p-3 shadow-sm sm:p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="carton-qr-input"
                className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-egmf-primary"
              >
                <QrCode size={15} strokeWidth={2.4} />
                Mã tem thùng phụ liệu (QR)
              </label>
              {materials.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCarton}
                  className="text-xs font-bold text-slate-500 hover:text-red-600"
                >
                  Quét thùng khác
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-egmf-border bg-slate-50/60 px-3 transition focus-within:border-egmf-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-egmf-primary/10">
                <ScanBarcode
                  size={20}
                  className="shrink-0 text-egmf-primary"
                  strokeWidth={2.2}
                />
                <input
                  id="carton-qr-input"
                  aria-label="Mã tem thùng"
                  autoComplete="off"
                  spellCheck={false}
                  type="search"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Quét hoặc nhập mã tem thùng (VD: GPA26110525)..."
                  className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold text-egmf-ink outline-none placeholder:font-sans placeholder:font-medium placeholder:text-egmf-placeholder sm:text-base"
                />
                {barcode && (
                  <button
                    type="button"
                    onClick={() => setBarcode("")}
                    aria-label="Xóa mã vừa nhập"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-200/70 text-slate-600 hover:bg-slate-300"
                  >
                    <X size={15} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Search size={17} strokeWidth={2.5} />
                    <span>Tra cứu thùng</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Kết quả hiển thị các vật tư đã map của Tem thùng */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-egmf-border bg-white py-14 text-egmf-primary shadow-sm">
              <Loader2 size={30} className="animate-spin" />
              <p className="m-0 text-sm font-bold">
                Đang tải danh sách vật tư trong thùng...
              </p>
            </div>
          ) : materials.length > 0 ? (
            <div className="space-y-3.5">
              {/* Thẻ Thông tin Tem thùng & Phiếu giám định gốc */}
              <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
                      <Boxes size={19} strokeWidth={2.2} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Tem thùng:
                        </span>
                        <span className="font-mono text-base font-extrabold text-blue-700">
                          {effectiveCartonQr}
                        </span>
                        {firstItem?.MaSoKien && (
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-700">
                            Kiện: {firstItem.MaSoKien}
                          </span>
                        )}
                      </div>
                      <p className="m-0 mt-0.5 text-xs font-medium text-slate-600">
                        Khi kiểm hoặc sửa/tách tem, dữ liệu sẽ tự động cập nhật vào Phiếu giám định{" "}
                        <strong className="text-slate-900">
                          {firstItem?.MaPhieu || "—"}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-xs sm:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-slate-500">
                      Phiếu giám định
                    </dt>
                    <dd className="m-0 mt-0.5 font-extrabold text-slate-900">
                      {firstItem?.MaPhieu || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Mã hàng</dt>
                    <dd className="m-0 mt-0.5 truncate font-extrabold text-slate-900">
                      {firstItem?.MaHang || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">
                      Ngày giám định
                    </dt>
                    <dd className="m-0 mt-0.5 font-bold text-slate-800">
                      {formatDateTime(firstItem?.NgayGiamDinh) || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">
                      Tổng trong thùng
                    </dt>
                    <dd className="m-0 mt-0.5 font-extrabold text-blue-700">
                      {materials.length} vật tư • {totalTemsInCarton} tem (
                      {totalQtyInCarton})
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Thanh tìm nhanh trong thùng (nếu thùng có nhiều hơn 2 vật tư) */}
              {materials.length > 2 && (
                <div className="flex h-10 items-center gap-2.5 rounded-xl border border-egmf-border bg-white px-3 shadow-2xs">
                  <Search size={16} className="shrink-0 text-egmf-primary" />
                  <input
                    type="search"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    placeholder="Lọc nhanh vật tư trong thùng (mã VT, màu, size)..."
                    className="h-full min-w-0 flex-1 bg-transparent text-xs font-medium text-egmf-ink outline-none sm:text-sm"
                  />
                  {filterKeyword && (
                    <button
                      type="button"
                      onClick={() => setFilterKeyword("")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              )}

              {/* Tiêu đề danh sách vật tư trong thùng */}
              <div className="flex items-center justify-between px-1">
                <h2 className="m-0 text-sm font-extrabold text-egmf-ink sm:text-base">
                  Vật tư đã map trong thùng ({filteredMaterials.length})
                </h2>
                <span className="text-xs font-semibold text-egmf-muted">
                  Chạm vào vật tư để kiểm &amp; tách/sửa tem
                </span>
              </div>

              {/* Danh sách thẻ vật tư trong thùng */}
              <div className="space-y-3">
                {filteredMaterials.map((item) => {
                  const isPass = item.ChoXuLy === 0 || item.ChoXuLy === false;
                  const isWaiting = item.ChoXuLy === 1 || item.ChoXuLy === true;

                  return (
                    <article
                      key={item.CTPGDId}
                      onClick={() =>
                        navigate("/accessory-quality-inspection", {
                          state: {
                            item,
                            maPhieu: item.MaPhieu,
                            pgdId: item.PGDId,
                            qrTrangMapping:
                              item.QrTrangMapping || effectiveCartonQr,
                          },
                        })
                      }
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-xs transition hover:border-egmf-primary-border hover:shadow-md"
                    >
                      <div className="border-l-4 border-l-blue-600 p-3.5 sm:p-4">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            {/* Dòng badge ID + Mã VT + Size + Trạng thái kiểm */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex rounded-md bg-egmf-primary-soft px-2 py-0.5 text-[11px] font-extrabold text-egmf-primary">
                                ID: {item.CTPGDId}
                              </span>
                              {item.Item && (
                                <span className="inline-flex rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs font-extrabold text-slate-900">
                                  Mã VT: {item.Item}
                                </span>
                              )}
                              {item.Size && (
                                <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                                  Size: {item.Size}
                                </span>
                              )}
                              {isPass && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                                  <CheckCircle2 size={12} />
                                  Pass
                                </span>
                              )}
                              {isWaiting && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700">
                                  <Clock size={12} />
                                  Chờ xử lý
                                </span>
                              )}
                              {item.LoaiTiLe && (
                                <span className="inline-flex rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                                  {item.LoaiTiLe} (SL kiểm: {item.SLKiem ?? 0})
                                </span>
                              )}
                            </div>

                            {/* Tên vật tư */}
                            <p className="m-0 mt-1.5 break-words text-sm font-extrabold leading-5 text-egmf-ink sm:text-[15px]">
                              {item.TenChungLoai ||
                                item.DienGiai ||
                                "Chưa có tên phụ liệu"}
                            </p>

                            {/* Thông tin phụ: Màu, Art, Lot, Chứng từ, PO */}
                            <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2.5 text-xs sm:grid-cols-4">
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase text-slate-400">
                                  Màu
                                </dt>
                                <dd
                                  className="m-0 truncate font-semibold text-slate-700"
                                  title={item.ColorCode}
                                >
                                  {item.ColorCode || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase text-slate-400">
                                  Art / Mã NPL
                                </dt>
                                <dd className="m-0 truncate font-semibold text-slate-700">
                                  {item.ArtCode || item.MaChungLoai || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase text-slate-400">
                                  Lot / ĐVT
                                </dt>
                                <dd className="m-0 truncate font-semibold text-slate-700">
                                  {item.Lot || "—"} ({item.DVT || "—"})
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase text-slate-400">
                                  Chứng từ
                                </dt>
                                <dd className="m-0 truncate font-semibold text-slate-700">
                                  {item.ChungTu || "—"}
                                </dd>
                              </div>
                            </dl>

                            {/* 3 Ô Số lượng: SL trong thùng | Số tem trong thùng | Tổng phiếu / Chứng từ */}
                            <div className="mt-3 grid grid-cols-3 divide-x divide-blue-100 rounded-xl border border-blue-200/80 bg-blue-50/50 py-2 text-center">
                              <div className="px-1.5">
                                <p className="m-0 text-[10px] font-bold uppercase text-blue-700">
                                  SL trong thùng
                                </p>
                                <p className="m-0 mt-0.5 text-base font-extrabold text-blue-700">
                                  {item.SoLuongTrongThung ?? 0}
                                </p>
                              </div>
                              <div className="px-1.5">
                                <p className="m-0 text-[10px] font-bold uppercase text-slate-500">
                                  Số tem thùng này
                                </p>
                                <p className="m-0 mt-0.5 text-sm font-extrabold text-slate-900">
                                  {item.SoTemTrongThung ?? 0} tem
                                </p>
                              </div>
                              <div className="px-1.5">
                                <p className="m-0 text-[10px] font-bold uppercase text-slate-500">
                                  Tổng GĐ / Chứng từ
                                </p>
                                <p className="m-0 mt-0.5 text-xs font-extrabold text-slate-700 sm:text-sm">
                                  {item.TongGiamDinhPL ?? 0} /{" "}
                                  {item.SoLuongChungTuThucTe ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>

                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-egmf-primary group-hover:text-white">
                            <ChevronRight size={20} strokeWidth={2.5} />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-egmf-primary-border-soft bg-white px-5 py-12 text-center shadow-xs">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                {hasSearched ? (
                  <Package size={32} />
                ) : (
                  <ScanBarcode size={32} />
                )}
              </div>
              <h2 className="m-0 mt-4 text-base font-extrabold text-egmf-ink sm:text-lg">
                {hasSearched
                  ? "Không tìm thấy vật tư đã map cho mã này"
                  : "Quét tem thùng để kiểm phụ liệu"}
              </h2>
              <p className="mx-auto m-0 mt-1.5 max-w-md text-xs leading-5 text-egmf-muted sm:text-sm">
                {hasSearched
                  ? "Mã tem thùng vừa quét chưa được mapping vật tư nào hoặc không tồn tại. Vui lòng kiểm tra lại."
                  : "Quét mã QR tem thùng (VD: GPA...) để hiển thị đúng danh sách các phụ liệu đã map trong thùng đó, kiểm tra chất lượng và cập nhật/tách tem."}
              </p>
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}
