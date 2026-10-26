import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Minus } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { getChiTietPhieuGiamDinh, saveMapping } from "../api/mappingQrApi";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../shared/components/ui/CustomToast";
import { getCurrentUser } from "../../../shared/auth/session";

export default function InspectionDetailPage() {
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

  const [expanded, setExpanded] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState([]);
  const [temRows, setTemRows] = useState({});
  const [qrTemTrang, setQrTemTrang] = useState("");
  const [maSoKien, setMaSoKien] = useState("");
  const [saving, setSaving] = useState(false);

  //   console.log(materials);

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

  //   console.log(materials);

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) =>
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

  console.log(selected);

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

        console.log("PAYLOAD MAPPING:", payload);

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

        <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {/* SEARCH AREA */}
          <div className="overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised shadow-egmf-card">
            <div className="flex items-center justify-between gap-3 bg-egmf-surface-subtle px-4 py-3 sm:px-5">
              <div>
                <h2 className="m-0 text-base font-extrabold text-egmf-ink">
                  Tra cứu &amp; xác nhận
                </h2>
                <p className="m-0 mt-0.5 text-xs text-egmf-muted">
                  Nhập nội dung hoặc mã kiện để thao tác.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-egmf-primary text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
              >
                <ChevronDown
                  size={23}
                  className={showFilters ? "" : "rotate-180"}
                />
              </button>
            </div>

            {showFilters && (
              <div className="space-y-3 border-t border-egmf-border-subtle p-3.5 sm:p-5">
                <div>
                  <input
                    type="text"
                    value={qrTemTrang}
                    onChange={(e) => setQrTemTrang(e.target.value)}
                    placeholder="Quét hoặc nhập mã QR trắng"
                    className="h-12 w-full rounded-xl border border-egmf-border bg-white px-3 text-base outline-none focus:border-egmf-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="relative min-w-0 flex-1">
                    <input
                      type="text"
                      value={maSoKien}
                      onChange={(e) => setMaSoKien(e.target.value)}
                      placeholder="Nhập mã số kiện"
                      className="h-12 w-full rounded-xl border border-egmf-border bg-white px-3 text-base outline-none focus:border-egmf-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmMapping}
                    disabled={saving}
                    className="h-12 w-full rounded-xl bg-egmf-primary px-4 text-sm font-extrabold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
                  >
                    {saving ? "Đang lưu..." : "XÁC NHẬN"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LIST TITLE */}
          <div className="mt-5 flex items-baseline justify-between gap-3 px-1 sm:mt-6">
            <h2 className="text-base font-extrabold text-egmf-ink">
              Danh sách vật tư
            </h2>
            <span className="text-xs font-semibold text-egmf-muted">
              {selected.length > 0
                ? `Đã chọn ${selected.length}/${materials.length}`
                : `${materials.length} vật tư`}
            </span>
          </div>

          {/* MATERIAL CARDS */}
          <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
            {materials.map((item) => {
              const isSelected = selected.includes(item.CTPGDId);
              const isExpanded = expanded.includes(item.CTPGDId);
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
                <div
                  key={item.CTPGDId}
                  className={`overflow-hidden rounded-xl border bg-egmf-surface-raised transition-colors ${
                    isSelected
                      ? "border-egmf-primary-border shadow-egmf-card"
                      : "border-egmf-border hover:border-egmf-primary-border"
                  }`}
                >
                  <div
                    className={`border-l-4 ${quantityBorderClass} px-3.5 py-3.5 sm:px-5 sm:py-4`}
                  >
                    <div className="relative flex items-start gap-3">
                      {/* CHECKBOX */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(item.CTPGDId)}
                        aria-label={`Chọn vật tư ${item.MaHang || item.CTPGDId}`}
                        className="mt-1 size-5 shrink-0 rounded accent-egmf-primary"
                      />

                      {/* MATERIAL INFORMATION */}
                      <div className="min-w-0 flex-1 pr-9">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <p className="m-0 break-words text-base font-extrabold text-egmf-ink">
                            {item.MaHang || "—"}
                          </p>
                          <span className="text-sm font-semibold text-egmf-ink-secondary">
                            Size: {item.Size || "—"}
                          </span>
                        </div>
                        <p className="m-0 mt-1 break-words text-sm font-medium text-egmf-ink-secondary">
                          {item.DienGiai || "Chưa có tên nguyên phụ liệu"}
                        </p>

                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-egmf-border-subtle pt-3 text-sm sm:grid-cols-3">
                          <div className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">Mã NPL</dt>
                            <dd className="m-0 truncate font-semibold text-egmf-ink-secondary" title={item.MaChungLoai}>{item.MaChungLoai || "—"}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">Art</dt>
                            <dd className="m-0 truncate font-semibold text-egmf-ink-secondary" title={item.ArtCode}>{item.ArtCode || "—"}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">Item</dt>
                            <dd className="m-0 truncate font-semibold text-egmf-ink-secondary" title={item.Item}>{item.Item || "—"}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">Màu</dt>
                            <dd className="m-0 truncate font-semibold text-egmf-ink-secondary" title={item.ColorName}>{item.ColorName || "—"}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">Lot</dt>
                            <dd className="m-0 truncate font-semibold text-egmf-ink-secondary" title={item.Lot}>{item.Lot || "—"}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wide text-egmf-muted">HĐ mua</dt>
                            <dd className="m-0 truncate font-semibold text-egmf-ink-secondary" title={item.SoPO}>{item.SoPO || "—"}</dd>
                          </div>
                        </dl>

                        <div className="mt-3 grid grid-cols-3 divide-x divide-egmf-primary-border-soft rounded-lg bg-egmf-primary-tint py-2 text-center">
                          <div className="px-1.5">
                            <p className="m-0 text-[11px] font-bold text-egmf-muted">SL chứng từ</p>
                            <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">{item.SoLuongChungTuThucTe ?? 0}</p>
                          </div>
                          <div className="px-1.5">
                            <p className="m-0 text-[11px] font-bold text-egmf-muted">SL nhập</p>
                            <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">{loai === "pl" ? (item.TongGiamDinhPL ?? 0) : (item.TongGiamDinh ?? 0)}</p>
                          </div>
                          <div className="px-1.5">
                            <p className="m-0 text-[11px] font-bold text-egmf-muted">SL cây</p>
                            <p className="m-0 mt-0.5 text-sm font-extrabold text-egmf-ink">{item.SoLuongCay ?? 0}</p>
                          </div>
                        </div>

                        {/* QUANTITY INPUT */}
                        {isSelected && (
                          <div className="mt-3 space-y-2 border-t border-egmf-border-subtle pt-3">
                            <p className="m-0 text-xs font-bold text-egmf-primary">Số lượng tem cần mapping</p>
                            {getTemRows(item.CTPGDId).map((tem, index, rows) => (
                              <div key={tem.id} className="flex items-center gap-2">
                                <label className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-egmf-border bg-white transition focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
                                  <span className="shrink-0 border-r border-egmf-border bg-egmf-surface-subtle px-2.5 text-xs font-bold text-egmf-muted">Tem {index + 1}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    inputMode="decimal"
                                    aria-label={`Số lượng Tem ${index + 1}`}
                                    placeholder="Nhập SL"
                                    value={tem.quantity}
                                    onChange={(e) => handleChangeTemQuantity(item.CTPGDId, tem.id, e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-egmf-ink outline-none placeholder:font-normal placeholder:text-egmf-placeholder"
                                  />
                                </label>

                                {rows.length > 1 && (
                                  <button type="button" onClick={() => handleRemoveTem(item.CTPGDId, tem.id)} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-egmf-ink-soft transition hover:bg-red-50 hover:text-red-600 active:scale-95" title="Xóa tem" aria-label={`Xóa Tem ${index + 1}`}>
                                    <Minus size={20} strokeWidth={3} />
                                  </button>
                                )}
                                {index === rows.length - 1 && (
                                  <button type="button" onClick={() => handleAddTem(item.CTPGDId)} className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-egmf-primary text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-95" title="Thêm tem" aria-label="Thêm tem">
                                    <Plus size={20} strokeWidth={3} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.CTPGDId)}
                        aria-label={isExpanded ? "Ẩn thông tin thêm" : "Xem thông tin thêm"}
                        className="absolute right-0 top-0 grid size-9 shrink-0 place-items-center rounded-lg text-egmf-muted transition hover:bg-egmf-primary-tint hover:text-egmf-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
                      >
                        <ChevronRight
                          size={30}
                          strokeWidth={3}
                          className={
                            isExpanded
                              ? "rotate-90 transition-transform"
                              : "transition-transform"
                          }
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 border-t border-egmf-border-subtle pt-3 text-sm text-egmf-ink-secondary sm:grid-cols-3">
                        <div><dt className="inline text-egmf-muted">Mã chi tiết: </dt><dd className="inline m-0 font-semibold">{item.CTPGDId}</dd></div>
                        <div><dt className="inline text-egmf-muted">Tổng giám định PL: </dt><dd className="inline m-0 font-semibold">{item.TongGiamDinhPL ?? 0}</dd></div>
                        <div><dt className="inline text-egmf-muted">Số lượng kiểm: </dt><dd className="inline m-0 font-semibold">{item.SLKiem ?? 0}</dd></div>
                      </dl>
                    )}
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
