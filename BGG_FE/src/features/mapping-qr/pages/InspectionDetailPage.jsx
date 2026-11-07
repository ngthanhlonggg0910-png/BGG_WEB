import { useEffect, useState } from "react";
import {
  ChevronRight,
  ClipboardList,
  Plus,
  Minus,
  Search,
  X,
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getChiTietPhieuGiamDinh, saveMapping } from "../api/mappingQrApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

export default function InspectionDetailPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const tenNguoiTao = `${user.data.HoVaTenLot} ${user.data.Ten}`;
  const taiKhoanThayDoi = user.data.TenDangNhap;
  const NVId = user.data.NVId;
  const TKId = user.data.TKId;
  const computerName = navigator.userAgent;
  const maccAddress = "";
  const maKho = "PA";
  const { PGDId } = useParams();
  const pgdId = Number(PGDId);
  const location = useLocation();
  const loai = location?.state?.loai;
  const maPhieu = location?.state?.maPhieu;
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState([]);
  const [temRows, setTemRows] = useState({});
  const [qrTemTrang, setQrTemTrang] = useState("");
  const [maSoKien, setMaSoKien] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(true);
  const sourcePage = location.state?.sourcePage;
  const inforPGD = location?.state?.data;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getChiTietPhieuGiamDinh(pgdId);
      if (!response?.success) {
        showErrorToast(
          response.message || "Không lấy đc danh sách chi tiết PGĐ",
        );
        setMaterials([]);
        return;
      }
      const data = Array.isArray(response.data) ? response.data : [];
      setMaterials(data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết PGĐ:", error);
      showErrorToast("Có lỗi xảy ra khi lấy danh sách chi tiết PGĐ");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getQuantityPriority = (item) => {
    const enteredQuantity = Number(
      loai === "pl" ? item.TongGiamDinhPL : item.TongGiamDinh,
    );
    const documentQuantity = Number(item.SoLuongChungTuThucTe ?? 0);

    // Xám (chưa nhập) và cam (chưa đủ/vượt) được ưu tiên lên đầu.
    if (!Number.isFinite(enteredQuantity) || enteredQuantity <= 0) return 0;
    if (enteredQuantity === documentQuantity) return 2;
    return 1;
  };

  const listFilter = materials
    .filter((item) => {
      const search = String(keyword ?? "")
        .trim()
        .toLowerCase();

      if (!search) return true;

      // Nếu nhập số và có Size khớp, ưu tiên lọc theo Size
      if (/^\d+$/.test(search)) {
        return Number(item.Size) === Number(search);
      }

      return [
        item.TenChungLoai,
        item.MaChungLoai,
        item.ArtCode,
        item.MaMau,
        item.Item,
        item.Lot,
        item.SoPO,
      ].some((value) =>
        String(value ?? "")
          .trim()
          .toLowerCase()
          .includes(search),
      );
    })
    .sort(
      (firstItem, secondItem) =>
        getQuantityPriority(firstItem) - getQuantityPriority(secondItem),
    );

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Lấy danh sách tem của từng vật tư
  const getTemRows = (ctpgdId) => {
    return temRows[ctpgdId] ?? [{ id: 1, quantity: "" }];
  };

  // Thêm một dòng tem
  const handleAddTem = (ctpgdId) => {
    setTemRows((prev) => {
      const rows = prev[ctpgdId] ?? [{ id: 1, quantity: "" }];

      return {
        ...prev,
        [ctpgdId]: [
          ...rows,
          {
            id: Math.max(...rows.map((row) => row.id)) + 1,
            quantity: "",
          },
        ],
      };
    });
  };

  // Xóa một dòng tem
  const handleRemoveTem = (ctpgdId, temId) => {
    setTemRows((prev) => {
      const rows = prev[ctpgdId] ?? [{ id: 1, quantity: "" }];

      return {
        ...prev,
        [ctpgdId]: rows.filter((row) => row.id !== temId),
      };
    });
  };

  // Cập nhật số lượng của từng tem
  const handleChangeTemQuantity = (ctpgdId, temId, value) => {
    setTemRows((prev) => {
      const rows = prev[ctpgdId] ?? [{ id: 1, quantity: "" }];

      return {
        ...prev,
        [ctpgdId]: rows.map((row) =>
          row.id === temId ? { ...row, quantity: value } : row,
        ),
      };
    });
  };

  const handleConfirmMapping = async () => {
    if (saving) return;

    const qr = qrTemTrang.trim();

    // 1. Kiểm tra QR trắng
    if (!qr) {
      showErrorToast("Vui lòng quét mã tem QR!");
      return;
    }

    // 2. Lấy danh sách vật tư đã chọn
    const selectedItems = materials.filter((item) =>
      selected.includes(item.CTPGDId),
    );

    if (selectedItems.length === 0) {
      showErrorToast("Vui lòng chọn ít nhất một item!");
      return;
    }

    const danhSachTem = [];

    // 3. Kiểm tra từng item
    for (const item of selectedItems) {
      const ctpgdId = item.CTPGDId;

      const slChungTu = Number(item.PKList ?? item.SoLuongChungTuThucTe ?? 0);

      const tongDaGiamDinh = Number(item.TongGiamDinhPL ?? 0);

      if (!Number.isFinite(slChungTu) || !Number.isFinite(tongDaGiamDinh)) {
        showErrorToast(`Số lượng item ${ctpgdId} không hợp lệ!`);
        return;
      }

      const slConLai =
        Math.round(slChungTu * 100) - Math.round(tongDaGiamDinh * 100);

      if (slConLai <= 0) {
        showErrorToast(`Item ${ctpgdId} đã hết số lượng!`);
        return;
      }

      // 4. Lấy các dòng tem
      const rows = temRows[ctpgdId] ?? [];

      if (rows.length === 0) {
        showErrorToast(`Vui lòng nhập số lượng cho item ${ctpgdId}!`);
        return;
      }

      let tongSoLuongNhap = 0;

      for (let index = 0; index < rows.length; index++) {
        const tenTem = `Tem ${index + 1}`;

        const rawValue = String(rows[index].quantity ?? "").trim();

        if (!rawValue) {
          showErrorToast(
            `Vui lòng nhập số lượng ${tenTem} của item ${ctpgdId}!`,
          );
          return;
        }

        const normalized = rawValue.replace(",", ".");

        if (!/^\d+(\.\d+)?$/.test(normalized)) {
          showErrorToast(
            `Số lượng ${tenTem} của item ${ctpgdId} không hợp lệ!`,
          );
          return;
        }

        const soLuong = Number(normalized);

        if (!Number.isFinite(soLuong) || soLuong <= 0) {
          showErrorToast(
            `Số lượng ${tenTem} của item ${ctpgdId} phải lớn hơn 0!`,
          );
          return;
        }

        const soLuongDonVi = Math.round((soLuong + Number.EPSILON) * 100);

        if (soLuongDonVi <= 0) {
          showErrorToast(
            `Số lượng ${tenTem} của item ${ctpgdId} không hợp lệ!`,
          );
          return;
        }

        tongSoLuongNhap += soLuongDonVi;

        danhSachTem.push({
          CTPGDId: ctpgdId,
          SL: soLuongDonVi / 100,
        });
      }

      // 5. Kiểm tra tổng số lượng
      if (tongSoLuongNhap > slConLai) {
        showErrorToast(
          `Tổng SL các tem của item ${ctpgdId} ` +
            `(${(tongSoLuongNhap / 100).toFixed(2)}) ` +
            `vượt SL còn lại (${(slConLai / 100).toFixed(2)})!`,
        );
        return;
      }
    }

    // 6. Gọi API Mapping
    setSaving(true);

    let successCount = 0;

    try {
      for (const tem of danhSachTem) {
        const payload = {
          CTPGDId: tem.CTPGDId,
          SL: tem.SL,
          TKId: Number(TKId),
          TenNguoiTao: tenNguoiTao,
          NguoiTao: Number(NVId),
          NoiDung: "Mapping QR trắng",
          NguoiThayDoi: tenNguoiTao,
          TaiKhoanThayDoi: taiKhoanThayDoi,
          MACAddress: maccAddress || "",
          ComputerName: computerName || "",
          MaSoKien: maSoKien.trim(),
          MaKho: maKho,
          SoMet: tem.SL,
          SoYard: tem.SL,
          SoGross: tem.SL,
          QrTrangMapping: qr,
        };

        const response = await saveMapping(payload);

        if (!response.success || Number(response.data?.KetQua) !== 1) {
          throw new Error(
            response.message || `Mapping thất bại tại item ${tem.CTPGDId}`,
          );
        }

        successCount++;
      }

      showSuccessToast(`Mapping thành công ${successCount} tem!`);

      // Reset sau khi lưu thành công
      setQrTemTrang("");
      setMaSoKien("");
      setSelected([]);
      setTemRows({});

      await fetchData();
    } catch (error) {
      console.error("Lỗi Mapping QR:", error);

      showErrorToast(
        `${error.message || "Mapping QR thất bại"}. ` +
          `Đã lưu ${successCount}/${danhSachTem.length} tem.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout screenTitle={`Phiếu giám định ${maPhieu}`}>
      <div className="min-h-full bg-egmf-surface text-[15px] text-egmf-ink">
        {/* HEADER */}
        <header className="sr-only">Thông tin chi tiết phiếu giám định</header>

        <main className="mx-auto w-full max-w-4xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          {sourcePage === "accessory-inspection" && (
            <section className="relative mb-3 overflow-hidden rounded-xl border border-egmf-primary-border-soft bg-white px-3.5 py-3 shadow-[0_3px_12px_rgba(37,99,235,0.06)] sm:mb-4 sm:px-4">
              <div className="relative flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                  <ClipboardList size={16} strokeWidth={2.3} />
                </span>
                <div>
                  <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                    Thông tin phiếu giám định
                  </h2>
                  <p className="m-0 mt-0.5 text-[11px] font-medium text-egmf-muted">
                    Tổng quan phiếu đang xử lý
                  </p>
                </div>
              </div>
              <dl className="relative mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-egmf-border-subtle pt-2.5">
                {[
                  ["Số phiếu", inforPGD.maPhieu],
                  ["Ngày giám định", formatDateTime(inforPGD.ngayGiamDinh)],
                  ["Loại giám định", inforPGD.loaiGiamDinh],
                  ["Mã hàng", inforPGD.maHang],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="inline-flex min-w-0 items-baseline gap-1.5 text-egmf-ink-secondary"
                  >
                    <dt className="shrink-0 text-[11px] font-medium text-egmf-muted">
                      {label}
                    </dt>
                    <dd className="m-0 break-words text-sm font-bold text-egmf-ink">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="mb-3 sm:mb-4">
            <div className="flex h-12 items-center gap-3 rounded-lg border border-egmf-border bg-white px-3.5 shadow-sm transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
              <Search
                size={17}
                className="shrink-0 text-egmf-primary"
                strokeWidth={2.4}
              />
              <input
                aria-label="Tìm nhanh vật tư"
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Mã hàng, NPL, lô, màu, size..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-egmf-ink outline-none placeholder:font-normal placeholder:text-egmf-placeholder sm:text-[15px]"
              />

              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-egmf-surface-tint text-egmf-muted transition hover:bg-egmf-primary-soft hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                >
                  <X size={17} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* SEARCH AREA */}
          {sourcePage !== "accessory-inspection" && (
            <div className="sticky top-[calc(80px+env(safe-area-inset-top))] z-10 -mx-1 mb-3 overflow-hidden rounded-lg border border-egmf-border bg-egmf-surface-raised/95 shadow-sm backdrop-blur-md sm:top-[88px] sm:mx-0 sm:mb-4">
              <div className="flex items-center justify-between gap-3 bg-egmf-surface-subtle/95 px-3 py-2 sm:px-3.5">
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 text-sm font-extrabold text-egmf-ink">
                    Tra cứu &amp; xác nhận
                  </h2>
                  {/* {isSearchPanelOpen && (
                  <p className="m-0 mt-0.5 text-xs font-medium text-egmf-muted">
                    Quét QR trắng, nhập mã kiện rồi xác nhận mapping
                  </p>
                )} */}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchPanelOpen((previous) => !previous)}
                  aria-label={
                    isSearchPanelOpen
                      ? "Thu gọn khu tra cứu và xác nhận"
                      : "Mở khu tra cứu và xác nhận"
                  }
                  aria-expanded={isSearchPanelOpen}
                  className="grid size-7 shrink-0 place-items-center rounded-md text-egmf-muted transition hover:bg-egmf-primary-soft hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                >
                  <ChevronRight
                    size={20}
                    strokeWidth={2.75}
                    className={
                      isSearchPanelOpen
                        ? "rotate-90 transition-transform"
                        : "-rotate-90 transition-transform"
                    }
                  />
                </button>
              </div>

              {isSearchPanelOpen && (
                <div className="grid grid-cols-2 gap-2 border-t border-egmf-border-subtle p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_116px] sm:items-center sm:gap-2.5 sm:p-2.5">
                  <div className="min-w-0">
                    <input
                      aria-label="Mã QR trắng"
                      type="text"
                      value={qrTemTrang}
                      onChange={(e) => setQrTemTrang(e.target.value)}
                      placeholder="Mã QR trắng"
                      className="h-9 w-full rounded-md border border-egmf-border bg-white px-2.5 text-sm font-medium text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                    />
                  </div>

                  <div className="min-w-0">
                    <input
                      aria-label="Mã số kiện"
                      type="text"
                      value={maSoKien}
                      onChange={(e) => setMaSoKien(e.target.value)}
                      placeholder="Mã kiện"
                      className="h-9 w-full rounded-md border border-egmf-border bg-white px-2.5 text-sm font-medium text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmMapping}
                    disabled={saving}
                    className="col-span-2 h-9 w-full rounded-md bg-egmf-primary px-3 text-xs font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1 sm:text-sm"
                  >
                    {saving ? "Đang lưu..." : "XÁC NHẬN"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LIST TITLE */}
          <div className="mt-4 flex items-baseline justify-between gap-3 px-0.5 sm:mt-5">
            <h2 className="text-sm font-extrabold text-egmf-ink sm:text-base">
              Danh sách vật tư
            </h2>
            <span className="text-xs font-semibold text-egmf-muted">
              {selected.length > 0
                ? `Đã chọn ${selected.length}/${listFilter.length}`
                : `${listFilter.length} vật tư`}
            </span>
          </div>

          {/* MATERIAL CARDS */}
          <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:gap-3.5">
            {listFilter.map((item) => {
              const isSelected = selected.includes(item.CTPGDId);
              const enteredQuantity = Number(
                loai === "pl" ? item.TongGiamDinhPL : item.TongGiamDinh,
              );
              const documentQuantity = Number(item.SoLuongChungTuThucTe ?? 0);
              const quantityBorderClass =
                !Number.isFinite(enteredQuantity) || enteredQuantity <= 0
                  ? "border-l-slate-400"
                  : enteredQuantity === documentQuantity
                    ? "border-l-[#22c55e]"
                    : "border-l-egmf-warning";

              return (
                <div key={item.CTPGDId}>
                  <div
                    className={`overflow-hidden rounded-xl border bg-egmf-surface-raised shadow-sm transition-shadow hover:shadow-md ${
                      isSelected
                        ? "border-egmf-primary-border shadow-egmf-card"
                        : "border-egmf-border hover:border-egmf-primary-border"
                    }`}
                  >
                    <div
                      className={`border-l-4 ${quantityBorderClass} px-3 py-3 sm:px-3.5 sm:py-3.5`}
                    >
                      <div className="relative flex items-start gap-2.5">
                        {/* CHECKBOX */}
                        {sourcePage !== "accessory-inspection" && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => toggleSelected(item.CTPGDId)}
                            aria-label={`Chọn vật tư ${item.MaHang || item.CTPGDId}`}
                            className="mt-0.5 size-4 shrink-0 rounded accent-egmf-primary"
                          />
                        )}

                        {/* MATERIAL INFORMATION */}
                        <div className="min-w-0 flex-1 pr-11 sm:pr-12">
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            <span className="inline-flex rounded-md bg-egmf-primary-soft px-1.5 py-0.5 text-[11px] font-extrabold text-egmf-primary">
                              ID: {item.CTPGDId ?? "—"}
                            </span>
                            <p className="m-0 break-words text-base font-extrabold text-egmf-ink sm:text-lg">
                              {item.MaHang || "—"}
                            </p>
                            <span className="text-sm font-semibold text-egmf-ink-secondary">
                              Size: {item.Size || "—"}
                            </span>
                          </div>
                          <p className="m-0 mt-1 break-words text-sm font-medium leading-5 text-egmf-ink-secondary">
                            {item.DienGiai || "Chưa có tên nguyên phụ liệu"}
                          </p>

                          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-egmf-border-subtle pt-3 text-sm sm:grid-cols-3 xl:grid-cols-4">
                            <div className="min-w-0">
                              <dt className="text-[11px] font-bold text-egmf-muted">
                                Mã NPL
                              </dt>
                              <dd
                                className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary"
                                title={item.MaChungLoai}
                              >
                                {item.MaChungLoai || "—"}
                              </dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[11px] font-bold text-egmf-muted">
                                Art
                              </dt>
                              <dd
                                className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary"
                                title={item.ArtCode}
                              >
                                {item.ArtCode || "—"}
                              </dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[11px] font-bold text-egmf-muted">
                                Màu
                              </dt>
                              <dd
                                className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary"
                                title={item.ColorCode}
                              >
                                {item.ColorCode || "—"}
                              </dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[11px] font-bold text-egmf-muted">
                                Lot
                              </dt>
                              <dd
                                className="m-0 mt-0.5 truncate font-semibold text-egmf-ink-secondary"
                                title={item.Lot}
                              >
                                {item.Lot || "—"}
                              </dd>
                            </div>
                          </dl>

                          <div className="mt-3">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm [&_dd]:leading-5 [&_dt]:text-[11px] sm:grid-cols-3 xl:grid-cols-4">
                              <div className="min-w-0">
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                                  Item
                                </dt>
                                <dd
                                  className="m-0 break-words font-semibold leading-5 text-egmf-ink-secondary"
                                  title={item.Item}
                                >
                                  {item.Item || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                                  Code màu vải
                                </dt>
                                <dd
                                  className="m-0 break-words font-semibold leading-5 text-egmf-ink-secondary"
                                  title={item.CodeMauVai}
                                >
                                  {item.CodeMauVai || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                                  HĐ mua
                                </dt>
                                <dd
                                  className="m-0 break-words font-semibold leading-5 text-egmf-ink-secondary"
                                  title={item.SoPO}
                                >
                                  {item.SoPO || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                                  Chứng từ
                                </dt>
                                <dd
                                  className="m-0 break-words font-semibold leading-5 text-egmf-ink-secondary"
                                  title={item.ChungTu}
                                >
                                  {item.ChungTu || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                                  Ngày giám định
                                </dt>
                                <dd
                                  className="m-0 break-words font-semibold leading-5 text-egmf-ink-secondary"
                                  title={item.NgayGiamDinh ?? item.ngayGiamDinh}
                                >
                                  {formatDateTime(
                                    item.NgayGiamDinh ?? item.ngayGiamDinh,
                                  ) || "—"}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                                  Người tạo
                                </dt>
                                <dd
                                  className="m-0 break-words font-semibold leading-5 text-egmf-ink-secondary"
                                  title={item.TenNguoiTao}
                                >
                                  {item.TenNguoiTao || "—"}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          <div className="mt-2.5 grid grid-cols-3 divide-x divide-egmf-border-subtle rounded-lg border border-egmf-border-subtle bg-white py-2 text-center">
                            <div className="px-1.5">
                              <p className="m-0 text-[10px] font-bold text-egmf-muted">
                                SL chứng từ
                              </p>
                              <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">
                                {item.SoLuongChungTuThucTe ?? 0}
                              </p>
                            </div>
                            <div className="px-1.5">
                              <p className="m-0 text-[11px] font-bold text-egmf-muted">
                                SL nhập
                              </p>
                              <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">
                                {loai === "pl"
                                  ? (item.TongGiamDinhPL ?? 0)
                                  : (item.TongGiamDinh ?? 0)}
                              </p>
                            </div>
                            <div className="px-1.5">
                              <p className="m-0 text-[11px] font-bold text-egmf-muted">
                                SL cây
                              </p>
                              <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">
                                {item.SoLuongCay ?? 0}
                              </p>
                            </div>
                          </div>

                          {/* QUANTITY INPUT */}
                          {isSelected && (
                            <div className="mt-2.5 space-y-2 border-t border-egmf-border-subtle pt-2.5">
                              <p className="m-0 text-xs font-bold text-egmf-primary">
                                Số lượng tem cần mapping
                              </p>
                              {getTemRows(item.CTPGDId).map(
                                (tem, index, rows) => (
                                  <div
                                    key={tem.id}
                                    className="flex items-center gap-2"
                                  >
                                    <label className="flex h-9 min-w-0 flex-1 items-center overflow-hidden rounded-md border border-egmf-border bg-white transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                                      <span className="shrink-0 border-r border-egmf-border bg-egmf-surface-subtle px-2.5 text-xs font-bold text-egmf-muted">
                                        Tem {index + 1}
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        inputMode="decimal"
                                        aria-label={`Số lượng Tem ${index + 1}`}
                                        placeholder="Nhập SL"
                                        value={tem.quantity}
                                        onChange={(e) =>
                                          handleChangeTemQuantity(
                                            item.CTPGDId,
                                            tem.id,
                                            e.target.value,
                                          )
                                        }
                                        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-egmf-ink outline-none placeholder:font-normal placeholder:text-egmf-placeholder"
                                      />
                                    </label>

                                    {rows.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveTem(item.CTPGDId, tem.id)
                                        }
                                        className="flex size-9 shrink-0 items-center justify-center rounded-md text-egmf-ink-soft transition hover:bg-red-50 hover:text-red-600 active:scale-95"
                                        title="Xóa tem"
                                        aria-label={`Xóa Tem ${index + 1}`}
                                      >
                                        <Minus size={20} strokeWidth={3} />
                                      </button>
                                    )}
                                    {index === rows.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleAddTem(item.CTPGDId)
                                        }
                                        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-egmf-primary text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-95"
                                        title="Thêm tem"
                                        aria-label="Thêm tem"
                                      >
                                        <Plus size={20} strokeWidth={3} />
                                      </button>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        {/* DETAILS */}
                        <button
                          type="button"
                          onClick={() => {
                            if (sourcePage !== "accessory-inspection") {
                              navigate(
                                `/mapping-qr/material-detail/${item.CTPGDId}`,
                                {
                                  state: {
                                    item,
                                    pgdId,
                                    loaiGiamDinh: item.loaiGiamDinh,
                                  },
                                },
                              );
                            } else {
                              navigate(`/accessory-quality-inspection`, {
                                state: {
                                  item,
                                  maPhieu: inforPGD.maPhieu,
                                  pgdId: pgdId,
                                },
                              });
                            }
                          }}
                          aria-label="Xem chi tiết vật tư"
                          title="Xem chi tiết vật tư"
                          className="group absolute right-0 top-0 grid size-9 shrink-0 touch-manipulation place-items-center rounded-lg text-egmf-muted transition-all duration-200 hover:bg-slate-100 hover:text-egmf-ink active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                        >
                          <ChevronRight
                            size={20}
                            strokeWidth={2.6}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
