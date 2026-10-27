import {
  CalendarDays,
  ClipboardList,
  FileSearch,
  ChevronRight,
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
    borderRadius: 12,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
    cursor: "pointer",
    minHeight: 44,
  }),
  dropdownIndicator: (base) => ({ ...base, color: "#2563eb", padding: 9 }),
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

export default function MappingQrListPage() {
  const navigate = useNavigate();

  const location = useLocation();
  const loai = location?.state?.loai;
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

    return (
      String(item.maPhieu ?? "")
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
    if (!dateRange?.[0] || !dateRange?.[1]) {
      showErrorToast("Vui lòng chọn khoảng thời gian");
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

      const filteredData = data.filter((item) =>
        String(item.MaPhieu ?? "")
          .toLowerCase()
          .includes(keyword.trim().toLowerCase()),
      );

      setList(filteredData);
      saveFilter(loai, {
        dateRange,
        keyword,
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
    <MainLayout screenTitle="Mapping QR">
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 12,
            colorPrimary: "#2563eb",
            controlHeight: 44,
          },
        }}
      >
        <main className="min-h-full bg-egmf-surface px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <section className="mx-auto w-full max-w-7xl">
            <nav
              aria-label="Kiểu tra cứu"
              className="mb-4 grid w-full grid-cols-2 rounded-xl border border-egmf-border bg-egmf-surface-raised p-1 shadow-sm sm:mb-5 sm:w-fit sm:min-w-[440px]"
            >
              <span className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-egmf-primary px-3 text-center text-sm font-bold text-white shadow-egmf-primary-compact">
                <SlidersHorizontal size={17} strokeWidth={2.3} />
                Theo thời gian
              </span>
              <Link
                to="/mapping-qr-barcode"
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-center text-sm font-bold text-egmf-ink-soft transition-colors hover:bg-egmf-primary-tint hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
              >
                <Search size={17} strokeWidth={2.3} />
                Theo barcode kiện
              </Link>
            </nav>
            <section className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
              <div className="flex items-center gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-3.5 sm:px-5 sm:py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                  <SlidersHorizontal size={19} strokeWidth={2.3} />
                </span>
                <div>
                  <h3 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                    Bộ lọc tìm kiếm
                  </h3>
                  <p className="m-0 text-xs text-egmf-muted">
                    Chọn điều kiện trước khi tra cứu.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="min-w-0">
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-egmf-ink-secondary">
                      <CalendarDays size={16} className="text-egmf-primary" />
                      Từ ngày
                    </label>
                    <DatePicker
                      allowClear={false}
                      className="!flex !h-12 !w-full !items-center !rounded-xl [&_.ant-picker-input>input]:!text-[15px] [&_.ant-picker-input>input]:!font-medium"
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
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-egmf-ink-secondary">
                      <CalendarDays size={16} className="text-egmf-primary" />
                      Đến ngày
                    </label>
                    <DatePicker
                      allowClear={false}
                      className="!flex !h-12 !w-full !items-center !rounded-xl [&_.ant-picker-input>input]:!text-[15px] [&_.ant-picker-input>input]:!font-medium"
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

                <div className="mt-4 grid gap-3 border-t border-egmf-border-subtle pt-4 sm:grid-cols-[minmax(0,1fr)_152px] sm:items-end">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-egmf-ink-secondary">
                      Trạng thái
                    </label>
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
                    className="!h-12 !w-full !rounded-xl !bg-egmf-primary !px-5 !text-[15px] !font-bold !shadow-egmf-primary-compact hover:!bg-egmf-primary-strong sm:self-end"
                    loading={loading}
                    onClick={handleFilter}
                    type="primary"
                  >
                    Lọc
                  </Button>
                </div>
              </div>
            </section>

            <section className="mt-4 overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card sm:mt-5">
              <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                    <ClipboardList size={18} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                      Kết quả tìm kiếm
                    </h3>
                    <p className="m-0 text-xs text-egmf-muted">
                      {listFilter.length} phiếu được tìm thấy
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-egmf-border-subtle bg-egmf-surface-subtle p-4 sm:px-5">
                <div className="flex h-12 items-center gap-3 rounded-xl border border-egmf-border bg-white px-3.5 transition-colors focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                  <Search
                    size={20}
                    className="shrink-0 text-egmf-primary"
                    strokeWidth={2.25}
                  />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-egmf-ink outline-none placeholder:text-egmf-placeholder sm:text-base"
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

              <div className="p-4 sm:p-5">
                {listFilter.length === 0 ? (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-4 py-8 text-center">
                    <span className="grid size-14 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                      <FileSearch size={27} strokeWidth={1.9} />
                    </span>
                    <p className="m-0 mt-3 text-[15px] font-bold text-egmf-ink-secondary">
                      Chưa có dữ liệu phiếu giám định
                    </p>
                    <p className="m-0 mt-1 max-w-sm text-sm leading-5 text-egmf-muted">
                      Điều chỉnh bộ lọc và nhấn “Lọc kết quả” để xem danh sách.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2 xl:gap-4">
                    {listFilter.map((item, index) => {
                      return (
                        <article
                          onClick={() =>
                            navigate(`/mapping-qr-detail/${item.pGDId}`, {
                              state: {
                                loai: loai,
                                maPhieu: item.maPhieu,
                              },
                            })
                          }
                          key={item.pGDId ?? index}
                          className="group flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-egmf-border bg-white p-4 shadow-sm transition-all duration-200 hover:border-egmf-primary-border hover:shadow-egmf-card"
                        >
                          <div className="min-w-0 flex-1 divide-y divide-egmf-border-subtle text-sm text-egmf-ink [&>p]:py-2.5 [&>p:first-child]:pt-0 [&>p:last-child]:pb-0 sm:text-[15px]">
                            <p className="m-0">
                              Ngày giám định:{" "}
                              {formatDateTime(item.ngayGiamDinh)}
                            </p>

                            <p className="m-0">
                              Số phiếu: {item.maPhieu ?? ""}
                            </p>

                            <p className="m-0">Mã hàng: {item.maHang ?? ""}</p>
                            <p className="m-0">
                              Loại giám định:{" "}
                              {item.loaiGiamDinh?.trim().toLowerCase() === "pl"
                                ? "Phụ liệu"
                                : "Nguyên liệu"}
                            </p>

                            <p className="m-0">
                              Lô:{" "}
                              {Array.isArray(item?.Lo) ? item.Lo[0] : item?.Lo}
                            </p>

                            {/* <p className="m-0">Mã rọ: {item.MaRo}</p> */}

                            <p className="m-0">
                              Trạng thái:{" "}
                              {item.trangThai === "MOITAO"
                                ? "Mới tạo"
                                : item.trangThai === "DAXACNHAN"
                                  ? "Đã xác nhận"
                                  : "Hủy"}
                            </p>

                            <p className="m-0">
                              Người tạo: {item.tenNguoiTao ?? ""}
                            </p>

                            <p className="m-0">
                              Người giám định: {item.TenNguoiGiamDinh ?? ""}
                            </p>
                          </div>

                          <ChevronRight
                            size={22}
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
