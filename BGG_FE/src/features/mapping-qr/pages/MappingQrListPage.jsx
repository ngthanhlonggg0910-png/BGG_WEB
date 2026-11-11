import {
  ClipboardList,
  FileSearch,
  ChevronRight,
  ScanBarcode,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, ConfigProvider, DatePicker } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { formatDateTime } from "../../../shared/utils/formatDateTime";
import ReactSelect from "react-select";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import {
  getDanhSachTrangThaiPhieuGiamDinh,
  getDanhSachPhieuGiamDinhTheoThoiGian,
  getDanhSachVatTuTheoBarcodeKien,
} from "../api/mappingQrApi";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";

// const statusOptions = [
//   { label: "Tất cả", value: "all" },
//   { label: "Chưa giám định", value: "chua-giam-dinh" },
//   { label: "Đang giám định", value: "dang-giam-dinh" },
//   { label: "Hoàn thành", value: "hoan-thanh" },
// ];

const FILTER_CACHE_TTL = 30 * 60 * 1000;

function getFilterCacheKey(loai) {
  return `mapping-qr:list-filter:${String(loai ?? "default")}`;
}

function readSavedFilter(loai) {
  try {
    const rawCache = sessionStorage.getItem(getFilterCacheKey(loai));
    if (!rawCache) return null;

    const cache = JSON.parse(rawCache);
    if (
      !cache?.savedAt ||
      Date.now() - cache.savedAt > FILTER_CACHE_TTL ||
      !Array.isArray(cache.list)
    ) {
      sessionStorage.removeItem(getFilterCacheKey(loai));
      return null;
    }

    return cache;
  } catch {
    return null;
  }
}

function saveFilter(loai, { dateRange, keyword, list, status }) {
  try {
    sessionStorage.setItem(
      getFilterCacheKey(loai),
      JSON.stringify({
        fromDate: dateRange[0]?.format("YYYY-MM-DD") ?? null,
        keyword,
        list,
        savedAt: Date.now(),
        status,
        toDate: dateRange[1]?.format("YYYY-MM-DD") ?? null,
      }),
    );
  } catch {
    // The page continues normally if private mode or quota blocks storage.
  }
}

const statusSelectStyles = {
  control: (base, state) => ({
    ...base,
    "&:hover": { borderColor: "#93c5fd" },
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#2563eb" : "#e1e1ec",
    borderRadius: 10,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
    cursor: "pointer",
    height: 40,
    minHeight: 40,
  }),
  dropdownIndicator: (base) => ({ ...base, color: "#2563eb", padding: 7 }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 40,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 1000 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#eff6ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#252530",
    cursor: "pointer",
    fontWeight: state.isSelected ? 700 : 500,
  }),
  valueContainer: (base) => ({ ...base, padding: "0 12px" }),
};

export default function MappingQrListPage({
  sourcePage,
  screenTitle = "Mapping QR",
  onSwitchToCartonScan,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAccessoryInspection = sourcePage === "accessory-inspection";
  const loai = isAccessoryInspection ? "pl" : location.state?.loai;

  const [savedFilter] = useState(() => readSavedFilter(loai));
  const [statusOptions, setStatusOptions] = useState([]);
  const [keyword, setKeyword] = useState(savedFilter?.keyword ?? "");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(savedFilter?.list ?? []);
  const [dateRange, setDateRange] = useState(() => [
    savedFilter?.fromDate ? dayjs(savedFilter.fromDate) : null,
    savedFilter?.toDate ? dayjs(savedFilter.toDate) : null,
  ]);
  const [status, setStatus] = useState(savedFilter?.status ?? null);

  const listFilter = list.filter((item) => {
    const search = keyword?.trim().toLowerCase() || "";
    if (!search) return true;
    if (
      item._matchedBarcode &&
      String(item._matchedBarcode).toLowerCase().includes(search)
    ) {
      return true;
    }

    return (
      String(item.maPhieu ?? item.MaPhieu ?? "")
        .toLowerCase()
        .includes(search) ||
      String(item.Lo ?? "")
        .toLowerCase()
        .includes(search) ||
      String(item.maHang ?? "")
        .toLowerCase()
        .includes(search)
    );
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await getDanhSachTrangThaiPhieuGiamDinh();
      if (!response.success) {
        showErrorToast(
          response?.message || "Không lấy được danh sách trạng thái",
        );
        return;
      }

      const options = (response.data ?? []).map((item) => ({
        label: item.TenTrangThai,
        value: item.TrangThai,
      }));

      setStatusOptions(options);
    } catch (error) {
      console.error("Lỗi lấy danh sách trạng thái:", error);
      showErrorToast("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    const cleanKeyword = keyword.trim();
    const isBarcodePattern = /^(GPA|PAH|NAH)/i.test(cleanKeyword);

    // Nếu người dùng nhập mã barcode kiện (VD: GPA26110306) hoặc chưa chọn ngày nhưng có nhập mã để tìm
    if (isBarcodePattern || ((!dateRange?.[0] || !dateRange?.[1]) && cleanKeyword)) {
      setLoading(true);
      try {
        const barcodeRes = await getDanhSachVatTuTheoBarcodeKien(cleanKeyword);
        if (barcodeRes?.success && Array.isArray(barcodeRes.data) && barcodeRes.data.length > 0) {
          const matchedItems = barcodeRes.data.map((item) => ({
            ...item,
            _matchedBarcode: cleanKeyword.toLowerCase(),
          }));
          setList(matchedItems);
          saveFilter(loai, {
            dateRange,
            keyword: cleanKeyword,
            list: matchedItems,
            status,
          });
          return;
        }
        if (!dateRange?.[0] || !dateRange?.[1]) {
          setList([]);
          showErrorToast(`Không tìm thấy phiếu giám định cho mã "${cleanKeyword}"`);
          return;
        }
      } catch (error) {
        console.error("Lỗi tra cứu barcode kiện:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!dateRange?.[0] || !dateRange?.[1]) {
      showErrorToast("Vui lòng chọn khoảng thời gian hoặc nhập mã barcode kiện");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        LoaiGiamDinh: loai,
        KieuThoiGian: "time",
        NgayBatDau: dateRange[0].format("YYYY-MM-DD"),
        NgayKetThuc: dateRange[1].format("YYYY-MM-DD"),
        TrangThai: status || "ALL",
      };

      const response = await getDanhSachPhieuGiamDinhTheoThoiGian(payload);

      if (!response.success) {
        showErrorToast(response.message || "Lọc dữ liệu thất bại");
        return;
      }

      const data = response.data ?? [];

      let filteredData = cleanKeyword
        ? data.filter((item) => {
            const q = cleanKeyword.toLowerCase();
            return (
              String(item.maPhieu ?? item.MaPhieu ?? "")
                .toLowerCase()
                .includes(q) ||
              String(item.Lo ?? "")
                .toLowerCase()
                .includes(q) ||
              String(item.maHang ?? "")
                .toLowerCase()
                .includes(q)
            );
          })
        : data;

      // Nếu lọc theo ngày không khớp mã phiếu, thử tìm theo barcode kiện (GPA...)
      if (cleanKeyword && filteredData.length === 0) {
        const barcodeRes = await getDanhSachVatTuTheoBarcodeKien(cleanKeyword);
        if (barcodeRes?.success && Array.isArray(barcodeRes.data) && barcodeRes.data.length > 0) {
          filteredData = barcodeRes.data.map((item) => ({
            ...item,
            _matchedBarcode: cleanKeyword.toLowerCase(),
          }));
        }
      }

      setList(filteredData);
      saveFilter(loai, {
        dateRange,
        keyword: cleanKeyword,
        list: filteredData,
        status,
      });
    } catch (error) {
      console.error("Lỗi lọc dữ liệu:", error);
      showErrorToast("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <MainLayout screenTitle={screenTitle}>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 12,
            colorPrimary: "#2563eb",
            controlHeight: 40,
          },
        }}
      >
        <main className="min-h-full bg-egmf-surface px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <section className="mx-auto w-full max-w-7xl">
            <nav
              aria-label="Kiểu tra cứu"
              className="mb-3 grid w-full max-w-md grid-cols-2 rounded-xl border border-egmf-primary-border-soft bg-white p-1.5 shadow-[0_3px_10px_rgba(37,99,235,0.07)] sm:w-fit sm:min-w-[400px]"
            >
              <span className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-egmf-primary to-blue-500 px-2.5 text-center text-xs font-bold text-white shadow-[0_4px_10px_rgba(37,99,235,0.22)] sm:text-sm">
                <SlidersHorizontal size={17} strokeWidth={2.4} />
                <span>Theo thời gian</span>
              </span>
              {typeof onSwitchToCartonScan === "function" ? (
                <button
                  type="button"
                  onClick={onSwitchToCartonScan}
                  className="group flex min-h-10 items-center justify-center gap-2 rounded-lg px-2.5 text-center text-xs font-bold text-egmf-ink-soft transition-all duration-200 hover:bg-egmf-primary-tint hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:text-sm"
                >
                  <ScanBarcode size={17} strokeWidth={2.3} className="transition-transform duration-200 group-hover:scale-110" />
                  <span>Quét tem thùng</span>
                </button>
              ) : (
                <Link
                  to="/mapping-qr-barcode"
                  className="group flex min-h-10 items-center justify-center gap-2 rounded-lg px-2.5 text-center text-xs font-bold text-egmf-ink-soft transition-all duration-200 hover:bg-egmf-primary-tint hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:text-sm"
                >
                  <ScanBarcode size={17} strokeWidth={2.3} className="transition-transform duration-200 group-hover:scale-110" />
                  <span>Theo barcode kiện</span>
                </Link>
              )}
            </nav>
            <section className="rounded-xl border border-egmf-border bg-egmf-surface-raised p-3 shadow-sm sm:p-4">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="min-w-0">
                    <label className="mb-1 block text-xs font-bold text-egmf-ink-secondary">Từ ngày</label>
                    <DatePicker
                      allowClear={false}
                      className="!flex !h-10 !w-full !items-center !rounded-lg [&_.ant-picker-input>input]:!text-sm [&_.ant-picker-input>input]:!font-medium"
                      format="DD/MM/YYYY"
                      onChange={(date) =>
                        setDateRange((previous) => [
                          date,
                          previous?.[1] ?? null,
                        ])
                      }
                      value={dateRange?.[0]}
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1 block text-xs font-bold text-egmf-ink-secondary">Đến ngày</label>
                    <DatePicker
                      allowClear={false}
                      className="!flex !h-10 !w-full !items-center !rounded-lg [&_.ant-picker-input>input]:!text-sm [&_.ant-picker-input>input]:!font-medium"
                      format="DD/MM/YYYY"
                      onChange={(date) =>
                        setDateRange((previous) => [
                          previous?.[0] ?? null,
                          date,
                        ])
                      }
                      value={dateRange?.[1]}
                    />
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_96px] items-end gap-2.5 border-t border-egmf-border-subtle pt-2.5 sm:grid-cols-[minmax(0,1fr)_112px] sm:gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-egmf-ink-secondary">Trạng thái</label>
                    <ReactSelect
                      aria-label="Trạng thái phiếu"
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      options={statusOptions}
                      value={
                        statusOptions.find(
                          (option) => option.value === status,
                        ) ?? null
                      }
                      onChange={(option) => setStatus(option?.value ?? "all")}
                      styles={statusSelectStyles}
                    />
                  </div>

                  <Button
                    className="!h-[40px] !w-full !rounded-lg !bg-egmf-primary !px-3 !text-sm !font-bold !shadow-egmf-primary-compact hover:!bg-egmf-primary-strong"
                    loading={loading}
                    onClick={handleFilter}
                    type="primary"
                  >
                    Lọc
                  </Button>
                </div>
            </section>

            <section className="mt-3 overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm sm:mt-4">
              <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-2.5 sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                    <ClipboardList size={16} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="m-0 text-sm font-extrabold text-egmf-ink">
                      Kết quả tìm kiếm
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-egmf-primary-tint px-2 py-1 text-[11px] font-bold text-egmf-primary">{listFilter.length} phiếu</span>
              </div>

              <div className="border-b border-egmf-border-subtle bg-egmf-surface-subtle p-3 sm:px-4">
                <div className="flex h-10 items-center gap-2.5 rounded-lg border border-egmf-border bg-white px-3 transition-colors focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                  <Search
                    size={18}
                    className="shrink-0 text-egmf-primary"
                    strokeWidth={2.25}
                  />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-egmf-ink outline-none placeholder:text-egmf-placeholder"
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleFilter();
                    }}
                    placeholder="Tìm theo mã phiếu hoặc barcode kiện"
                    type="search"
                    value={keyword}
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {listFilter.length === 0 ? (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-4 py-6 text-center">
                    <span className="grid size-11 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                      <FileSearch size={22} strokeWidth={1.9} />
                    </span>
                    <p className="m-0 mt-2.5 text-sm font-bold text-egmf-ink-secondary">
                      Chưa có dữ liệu phiếu giám định
                    </p>
                    <p className="m-0 mt-1 max-w-sm text-xs leading-5 text-egmf-muted">
                      Điều chỉnh bộ lọc và nhấn “Lọc kết quả” để xem danh sách.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">
                    {listFilter.map((item, index) => {
                      return (
                        <article
                          onClick={() =>
                            navigate(`/mapping-qr-detail/${item.pGDId}`, {
                              state: {
                                loai: loai,
                                maPhieu: item.maPhieu,
                                sourcePage: sourcePage,
                                data: item,
                              },
                            })
                          }
                          key={item.pGDId ?? index}
                          className="group flex cursor-pointer items-start justify-between gap-2.5 rounded-xl border border-egmf-border bg-white p-3 shadow-sm transition-all duration-200 hover:border-egmf-primary-border hover:shadow-egmf-card"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 border-b border-egmf-border-subtle pb-2">
                              <div className="min-w-0">
                                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-egmf-muted">Số phiếu</p>
                                <p className="m-0 mt-0.5 truncate text-sm font-extrabold text-egmf-ink">{item.maPhieu ?? ""}</p>
                              </div>
                              <span className="shrink-0 text-[11px] font-medium text-egmf-muted">{formatDateTime(item.ngayGiamDinh)}</span>
                            </div>

                            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Mã hàng</dt>
                                <dd className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary">{item.maHang ?? "—"}</dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Loại giám định</dt>
                                <dd className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary">{item.loaiGiamDinh?.trim().toLowerCase() === "pl" ? "Phụ liệu" : "Nguyên liệu"}</dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Lô</dt>
                                <dd className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary">{(Array.isArray(item?.Lo) ? item.Lo[0] : item?.Lo) || "—"}</dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Trạng thái</dt>
                                <dd className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary">
                                  {item.trangThai === "MOITAO"
                                    ? "Mới tạo"
                                    : item.trangThai === "CHOKIEM"
                                      ? "Chờ kiểm"
                                      : item.trangThai === "DAXACNHAN"
                                        ? "Đã xác nhận"
                                        : item.trangThai === "HUYXACNHAN"
                                          ? "Hủy xác nhận"
                                          : "Hủy"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Người tạo</dt>
                                <dd className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary">{item.tenNguoiTao ?? "—"}</dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Người giám định</dt>
                                <dd className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary">{item.TenNguoiGiamDinh ?? "—"}</dd>
                              </div>
                            </dl>
                          </div>

                          <ChevronRight
                            size={18}
                            strokeWidth={2.5}
                            className="mt-1 shrink-0 text-egmf-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-egmf-primary"
                          />
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </section>
        </main>
      </ConfigProvider>
    </MainLayout>
  );
}
