import { useEffect, useMemo, useRef, useState } from "react";
import Barcode from "react-barcode";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  RotateCcw,
  Scissors,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import {
  loadDanhSachBanCat,
  loadDanhSachPhieuHoachToan,
} from "../api/cutting.api";
import { getCurrentUser } from "../../../shared/auth/session";
import { showErrorToast } from "../../../shared/components/ui/CustomToast";
import AppSelect from "../../../shared/components/ui/AppSelect";
import { useNavigate } from "react-router-dom";

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const getFirstValue = (item, keys) => {
  const value = keys
    .map((key) => item?.[key])
    .find(
      (candidate) =>
        candidate !== null && candidate !== undefined && candidate !== "",
    );

  return value ?? "—";
};

export default function CuttingManagementPage() {
  const user = getCurrentUser();
  const TKId = Number(user.data?.TKId);

  const [chonBan, setChonBan] = useState("");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState(false);
  const [loading] = useState(false);

  const [dsBan, setDsBan] = useState([]);
  const [loadingBanCat, setLoadingBanCat] = useState(false);
  const hasSelectedInitialTable = useRef(false);

  const splitStr = (chonBan || "").split(" # ");
  const banCat = (splitStr[0] || "").trim();
  const nhomCat = (splitStr[1] || "").replace("NHÓM CẮT ", "").trim();

  const [dsPhieuHT, setDsPhieuHT] = useState([]);
  const [loadingPhieuHT, setLoadingPhieuHT] = useState(false);

  const navigate = useNavigate();

  const fetchDsBanCat = async () => {
    if (!TKId) return;
    setLoadingBanCat(true);
    try {
      const response = await loadDanhSachBanCat(TKId);
      if (!response.success) {
        setDsBan([]);
        showErrorToast(response?.message || "Không thể lấy danh sách bàn cắt");
        return;
      }
      const cuttingTables = Array.isArray(response?.data) ? response.data : [];
      setDsBan(cuttingTables);
    } catch (error) {
      console.error("Lỗi lấy ds bàn cắt: ", error);
      setDsBan([]);
    } finally {
      setLoadingBanCat(false);
    }
  };

  const fetchDsPhieuHT = async () => {
    setLoadingPhieuHT(true);
    try {
      const payload = {
        MaHang: "",
        SoPhieu: "",
        NgayHoachToan: selectedDate,
        DaHoachToan: activeTab,
        NhomCat: nhomCat,
        BanCat: banCat,
      };

      const response = await loadDanhSachPhieuHoachToan(payload);
      if (!response.success) {
        showErrorToast(
          response.message || "Lấy danh sách phiếu hoạch toán thất bại",
        );
        setDsPhieuHT([]);
        return;
      }

      setDsPhieuHT(response?.data || []);
    } catch (error) {
      console.error("Lấy danh sách phiếu hoạch toán thất bại: ", error);
      showErrorToast(
        error?.message || "Có lỗi xảy ra khi lấy danh sách phiếu hạch toán",
      );
      setDsPhieuHT([]);
    } finally {
      setLoadingPhieuHT(false);
    }
  };

  useEffect(() => {
    fetchDsPhieuHT();
  }, [chonBan, selectedDate, activeTab]);

  useEffect(() => {
    fetchDsBanCat();
  }, [TKId]);

  useEffect(() => {
    const firstTable = dsBan[0]?.TenBanCat;

    if (hasSelectedInitialTable.current || !firstTable) return;

    setChonBan(firstTable);
    hasSelectedInitialTable.current = true;
  }, [dsBan]);

  const filteredBySoPhieu = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return dsPhieuHT.filter((item) => {
      return (
        !normalizedKeyword ||
        String(item.SoPhieu ?? "")
          .toLowerCase()
          .includes(normalizedKeyword)
      );
    });
  }, [dsPhieuHT, keyword]);

  const cuttingTableOptions = useMemo(
    () =>
      dsBan.map((item) => ({
        value: item.TenBanCat,
        label: item.TenBanCat,
      })),
    [dsBan],
  );

  const unfinishedCount = filteredBySoPhieu.filter(
    (item) => item.DaHoachToan === false,
  ).length;
  const finishedCount = filteredBySoPhieu.filter(
    (item) => item.DaHoachToan === true,
  ).length;
  const filteredDocuments = filteredBySoPhieu.filter(
    (item) => item.DaHoachToan === activeTab,
  );

  const handleReset = () => {
    setChonBan("");
    setSelectedDate(getToday());
    setKeyword("");
    setActiveTab(false);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const [year, month, day] = String(value).slice(0, 10).split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  };

  const handleViewDetail = (item) => {
    // TODO: Điều hướng đến trang chi tiết phiếu cắt.
    console.log("Chi tiết phiếu cắt:", item);
  };

  const tabs = [
    {
      count: unfinishedCount,
      icon: Clock3,
      id: "unfinished",
      value: false,
      label: "Chưa hoàn thành",
    },
    {
      count: finishedCount,
      icon: CheckCircle2,
      id: "finished",
      value: true,
      label: "Hoàn thành",
    },
  ];

  return (
    <MainLayout screenTitle="Khâu cắt">
      <main className="min-h-full bg-egmf-surface px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-3 sm:space-y-4">
          <section className="overflow-hidden rounded-xl border border-egmf-border bg-egmf-surface-raised shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3 py-2 sm:px-3.5">
              <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                Bộ lọc tìm kiếm
              </h2>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-egmf-primary transition hover:bg-egmf-primary-tint hover:text-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
              >
                <RotateCcw size={15} strokeWidth={2.4} />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2 p-2.5 sm:grid-cols-[minmax(10rem,1fr)_8.75rem_minmax(10rem,1fr)] sm:p-3">
              <label className="min-w-0">
                <span className="mb-0.5 block text-[11px] font-bold text-egmf-ink-secondary">
                  Chọn bàn cắt
                </span>
                <AppSelect
                  aria-label="Cutting table"
                  value={chonBan}
                  onChange={setChonBan}
                  options={cuttingTableOptions}
                  loading={loadingBanCat}
                  searchable
                  allowClear={Boolean(chonBan)}
                  minHeight={40}
                  menuMaxHeight={320}
                  placeholder="Chọn hoặc tìm bàn cắt"
                />
              </label>

              <label className="min-w-0">
                <span className="mb-0.5 block text-[11px] font-bold text-egmf-ink-secondary">
                  Ngày cắt
                </span>
                <input
                  aria-label="Ngày cắt"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-10 w-full rounded-lg border border-egmf-border bg-white px-2.5 text-sm font-medium text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                />
              </label>

              <label className="col-span-2 min-w-0 sm:col-span-1">
                <span className="mb-0.5 block text-[11px] font-bold text-egmf-ink-secondary">
                  Tìm kiếm
                </span>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Mã hàng hoặc mã phiếu"
                  className="h-10 w-full rounded-lg border border-egmf-border bg-white px-2.5 text-sm font-medium text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                />
              </label>
            </div>
          </section>

          <section
            aria-label="Trạng thái phiếu cắt"
            className="grid grid-cols-2 gap-1.5 rounded-xl border border-egmf-border bg-egmf-surface-raised p-1.5 shadow-sm"
            role="tablist"
          >
            {tabs.map(({ count, icon: Icon, id, label, value }) => {
              const isActive = activeTab === value;

              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(value)}
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:text-sm ${isActive ? (id === "finished" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm" : "bg-orange-50 text-orange-700 ring-1 ring-orange-200 shadow-sm") : "text-egmf-muted hover:bg-slate-50 hover:text-egmf-ink-soft"}`}
                >
                  <Icon size={17} strokeWidth={2.4} />
                  <span className="truncate">{label}</span>
                  <span
                    className={`grid min-w-5 place-items-center rounded-full bg-white px-1.5 py-0.5 text-[11px] leading-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${isActive ? (id === "finished" ? "text-emerald-700" : "text-orange-700") : "text-egmf-muted"}`}
                  >
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
                  <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                    Danh sách phiếu cắt
                  </h2>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-egmf-primary-tint px-2.5 py-1 text-xs font-bold text-egmf-primary">
                {filteredDocuments.length} phiếu
              </span>
            </div>

            <div className="p-3 sm:p-4">
              {loadingPhieuHT ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-8">
                  <div className="size-9 animate-spin rounded-full border-4 border-egmf-primary-soft border-t-egmf-primary" />
                  <p className="m-0 mt-3 text-sm font-medium text-egmf-muted">
                    Đang tải danh sách phiếu cắt...
                  </p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-4 py-8 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary">
                    <ClipboardList size={27} strokeWidth={1.9} />
                  </span>
                  <p className="m-0 mt-3 text-[15px] font-bold text-egmf-ink-secondary">
                    Không tìm thấy phiếu cắt
                  </p>
                  <p className="m-0 mt-1 max-w-sm text-sm leading-5 text-egmf-muted">
                    Điều chỉnh bộ lọc hoặc chọn lại trạng thái để xem dữ liệu.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">
                  {filteredDocuments.map((item) => {
                    const receiptNumber = String(item.SoPhieu ?? "").trim();
                    const status = getFirstValue(item, ["TrangThai"]);
                    const isSpreading =
                      String(status).trim().toLocaleUpperCase("vi-VN") ===
                      "ĐANG TRẢI";
                    const fabricAndProductColor = [
                      getFirstValue(item, ["MauVai"]),
                      getFirstValue(item, ["MauSanPham"]),
                    ]
                      .filter((value) => value !== "—")
                      .join(" / ");
                    const detailFields = [
                      {
                        label: "Ngày hoạch toán",
                        value: formatDate(
                          getFirstValue(item, ["NgayHoachToan", "NgayThang"]),
                        ),
                      },
                      {
                        label: "Lệnh sản xuất",
                        value: getFirstValue(item, [
                          "LenhSanXuat",
                          "SoLenhSanXuat",
                          "MaLenhSanXuat",
                        ]),
                      },
                      { label: "Mùa", value: getFirstValue(item, ["Mua"]) },
                      {
                        label: "Mã hàng",
                        value: getFirstValue(item, ["MaHang"]),
                      },
                      {
                        label: "Bàn may",
                        value: getFirstValue(item, ["BanMay"]),
                        wide: true,
                      },
                      {
                        label: "Loại nguyên liệu",
                        value: getFirstValue(item, ["LoaiNguyenLieu"]),
                      },
                      { label: "Art", value: getFirstValue(item, ["Art"]) },
                      {
                        label: "Ảnh màu",
                        value: getFirstValue(item, ["AnhMau"]),
                      },
                      {
                        label: "Dàn/Gạch",
                        value: getFirstValue(item, [
                          "DanGach",
                          "DanBanTraiThucTe",
                        ]),
                      },
                      { label: "NCC", value: getFirstValue(item, ["NCC"]) },
                      {
                        label: "Thành phần",
                        value: getFirstValue(item, ["ThanhPhan"]),
                      },
                      {
                        label: "PO",
                        value: getFirstValue(item, ["PONo", "PO"]),
                      },
                      {
                        label: "Màu vải/Màu sản phẩm",
                        value: fabricAndProductColor || "—",
                        wide: true,
                      },
                      {
                        label: "Cỡ vóc sơ đồ",
                        value: getFirstValue(item, ["CoVocSoDo", "CoVocSodo"]),
                        wide: true,
                      },
                      {
                        label: "Rộng sơ đồ",
                        value: getFirstValue(item, ["RongSoDo"]),
                      },
                      {
                        label: "Dài sơ đồ",
                        value: getFirstValue(item, ["DaiSoDo"]),
                      },
                      {
                        label: "Số lớp dự kiến",
                        value: getFirstValue(item, ["SoLopDuKien", "SoLop"]),
                      },
                      {
                        label: "Số lớp đã trải",
                        value: getFirstValue(item, [
                          "SoLopDaTrai",
                          "TongSoLopDaTrai",
                        ]),
                      },
                      {
                        label: "Ghi chú",
                        value: getFirstValue(item, ["GhiChu"]),
                        wide: true,
                      },
                    ];

                    return (
                      <button
                        key={item.PhieuHoachToanId}
                        type="button"
                        onClick={() =>
                          navigate(`/cutting-detail/${item.PhieuHoachToanId}`, {
                            state: {
                              phieu: item,
                            },
                          })
                        }
                        className={`group w-full rounded-xl border border-egmf-border bg-white p-3 text-left shadow-sm transition-all duration-200 hover:border-egmf-primary-border hover:shadow-egmf-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 ${isSpreading ? "border-l-4 border-l-emerald-500 hover:border-l-emerald-500" : ""}`}
                      >
                        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-egmf-border-subtle bg-egmf-surface-subtle px-2.5 py-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <h3 className="m-0 truncate text-[17px] font-extrabold leading-5 text-egmf-ink">
                              PHT: {receiptNumber || "—"}
                            </h3>
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold ${isSpreading ? "bg-emerald-50 text-emerald-700" : "bg-egmf-primary-soft text-egmf-primary"}`}
                            >
                              {status}
                            </span>
                          </div>

                          {receiptNumber && (
                            <div className="flex h-10 w-28 shrink-0 items-center justify-center overflow-hidden border-l border-egmf-border px-2.5">
                              <Barcode
                                value={receiptNumber}
                                format="CODE128"
                                width={1.35}
                                height={38}
                                margin={0}
                                displayValue={false}
                              />
                            </div>
                          )}
                        </div>

                        <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                          {detailFields
                            .filter(({ value }) => value !== "—")
                            .map(({ label, value, wide }) => {
                              const isWideField =
                                wide || String(value).length > 24;

                              return (
                                <div
                                  key={label}
                                  className={`min-w-0 text-[15px] leading-5 ${isWideField ? "col-span-2" : ""}`}
                                >
                                  <dt className="text-[11px] font-semibold leading-4 text-egmf-muted">
                                    {label}
                                  </dt>
                                  <dd className="m-0 min-w-0 break-words font-medium text-egmf-ink-secondary">
                                    {value}
                                  </dd>
                                </div>
                              );
                            })}
                        </dl>
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
