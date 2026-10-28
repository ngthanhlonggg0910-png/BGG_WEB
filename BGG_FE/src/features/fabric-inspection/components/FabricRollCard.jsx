import { useEffect, useState } from "react";
//ICON
import {
  ClipboardList,
  Layers3,
  Package,
  Ruler,
  X,
  Trash2,
  Construction,
  ChevronDown,
  ListChecks,
} from "lucide-react";

//DATA
import { ROLL_ACTIONS, ACTION_STYLES } from "../data/rollActions";

//API
import {
  themLoiCay,
  doKho,
  loadKetQuaDoKho,
  capNhatGhiChuHuongXuLyCayVai,
  xoaCayVai,
  xongCayVai,
} from "../api/fabric-inspections.api";

//COMPONENT
import { Modal, QRCode } from "antd";
import {
  showSuccessToast,
  showErrorToast,
} from "../../../shared/components/ui/CustomToast";

//FORM THÊM LỖI
import AddDefectForm from "./AddFabricDefectForm";
//FORM ĐO KHỔ
import FabricWidthForm from "./FabricWidthForm";
//CẬP NHẬT
import FabricNoteForm from "./FabricNoteForm";
//XONG CÂY
import CompleteFabricRollForm from "./CompleteFabricRollForm";
import { getCurrentUser } from "../../../shared/auth/session";

export function FabricRollCard({ item, index, onReload }) {
  const user = getCurrentUser();

  const initialFormData = {
    "add-defect": {
      CTId: Number(item?.CTId) ?? null,
      MaLoi: "",
      TenLoi: "",
      SoDiem: 1,
      SoLoi: null,
      TongDiem: item?.TongDiem ?? 0,
      SoDiemTrungBinh: item?.DiemTrungBinh ?? 0,
    },
    measure: {
      "ĐẦU CÂY": {
        CTId: Number(item?.CTId) ?? null,
        ViTri: "",
        KhoCM: 0,
        KhoIN: 0,
      },
      "GIỮA CÂY": {
        CTId: Number(item?.CTId) ?? null,
        ViTri: "",
        KhoCM: 0,
        KhoIN: 0,
      },
      "CUỐI CÂY": {
        CTId: Number(item?.CTId) ?? null,
        ViTri: "",
        KhoCM: 0,
        KhoIN: 0,
      },
    },
    update: {
      CTId: Number(item?.CTId) ?? null,
      GhiChu: "",
      HuongXuLy: "",
    },
    complete: {
      CTId: item?.CTId != null ? Number(item.CTId) : null,
      GhiChu: "",
      KetQuaKiem: null,
      KetQuaDoAm: false,
      DoAm: null,
      DiemTrungBinh: null,
      SoLuongThucTe: null,
      NguoiXongCay: `${user.data.HoVaTenLot} ${user.data.Ten}`,
      TrongLuongVai: null,
    },
  };

  //console.log(item);

  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isDefectListOpen, setIsDefectListOpen] = useState(false);

  if (!item) return null;

  const fetchKQDoKho = async () => {
    try {
      if (!item?.CTId) throw new Error("Không tồn tại CTId");

      const response = await loadKetQuaDoKho(Number(item.CTId));

      if (!response?.success) return;

      const update = structuredClone(initialFormData.measure);

      response.data.forEach((row) => {
        const viTri = row.ViTri.trim();

        if (update[viTri]) {
          update[viTri] = {
            ...update[viTri],
            ViTri: viTri,
            KhoCM: row.KhoCM,
            KhoIN: row.KhoIN,
          };
        }
      });

      setFormData(update);
    } catch (error) {
      console.error(error);
      showErrorToast(error.message || "Có lỗi xảy ra");
    }
  };

  const handleActionClick = async (action) => {
    setSelectedAction(action);

    const data = initialFormData[action.key];

    // Khởi tạo formData mặc định
    setFormData(data ? { ...data } : {});
    setOpen(true);

    // Nếu chọn đo khổ thì lấy dữ liệu từ Database
    if (action.key === "measure") {
      await fetchKQDoKho();
    }
  };

  const handleSubmit = async () => {
    try {
      let response;

      switch (selectedAction?.key) {
        case "add-defect":
          let {
            CTId,
            MaLoi,
            TenLoi,
            SoDiem,
            SoLoi,
            TongDiem,
            SoDiemTrungBinh,
          } = formData;

          response = await themLoiCay(
            CTId,
            MaLoi,
            TenLoi,
            SoDiem,
            SoLoi,
            TongDiem,
            SoDiemTrungBinh,
          );
          break;
        case "measure":
          for (const item of Object.values(formData)) {
            response = await doKho(
              item.CTId,
              item.ViTri,
              item.KhoCM,
              item.KhoIN,
            );
          }
          break;
        case "update": {
          const { CTId, GhiChu, HuongXuLy } = formData;
          response = await capNhatGhiChuHuongXuLyCayVai(
            CTId,
            GhiChu,
            HuongXuLy,
          );
          break;
        }
        case "complete": {
          const payload = {
            ...formData,
            CTId: Number(formData.CTId),
            DoAm:
              formData.DoAm === "" || formData.DoAm == null
                ? null
                : Number(formData.DoAm),
            SoLuongThucTe:
              formData.SoLuongThucTe === "" || formData.SoLuongThucTe == null
                ? null
                : Number(formData.SoLuongThucTe),
            DiemTrungBinh:
              formData.DiemTrungBinh == null
                ? null
                : Number(formData.DiemTrungBinh),
          };
          response = await xongCayVai(payload);
          break;
        }
        case "delete": {
          response = await xoaCayVai(item.CTId, item.CayId, item.MaCayVai);
          break;
        }

        default:
          return;
      }
      if (response?.success) {
        showSuccessToast(response.message || "Thêm lỗi thành công");
        setOpen(false);
        onReload?.();
      } else {
        showErrorToast(response.message || "Thêm lỗi thất bại");
      }
    } catch (error) {
      showErrorToast(error.message || "Có lỗi xảy ra");
    }
  };

  //console.log(formData);

  return (
    <>
      <article className="w-full overflow-hidden rounded-egmf-large border border-egmf-border bg-white shadow-egmf-card transition-shadow duration-200 hover:shadow-[0_10px_24px_rgba(37,99,235,0.09)]">
        <header className="flex items-start gap-3 border-b border-egmf-border-subtle px-4 py-4 sm:px-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
            <Layers3 size={22} strokeWidth={2.1} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.1em] text-egmf-muted-soft">
              Cây vải #{index + 1}
            </p>
            <h3 className="m-0 mt-1 break-all text-xl font-extrabold leading-tight text-egmf-ink sm:text-[22px]">
              {item.MaCayVai === null ||
              item.MaCayVai === undefined ||
              item.MaCayVai === ""
                ? "—"
                : String(item.MaCayVai)}
            </h3>
          </div>
        </header>

        <div className="px-4 py-4 sm:px-5">
          <div className="flex gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-egmf-ink">
                <Package
                  size={17}
                  className="text-egmf-primary"
                  strokeWidth={2.2}
                />
                <h4 className="m-0 text-[15px] font-bold sm:text-base">
                  Thông tin vật tư
                </h4>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                    Mã hàng
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] font-semibold text-egmf-ink-secondary sm:text-base">
                    {item.MaHang === null ||
                    item.MaHang === undefined ||
                    item.MaHang === ""
                      ? "—"
                      : String(item.MaHang)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                    Mùa
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] font-semibold text-egmf-ink-secondary sm:text-base">
                    {item.Mua === null ||
                    item.Mua === undefined ||
                    item.Mua === ""
                      ? "—"
                      : String(item.Mua)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                    Số roll
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] font-semibold text-egmf-ink-secondary sm:text-base">
                    {item.SoRoll === null ||
                    item.SoRoll === undefined ||
                    item.SoRoll === ""
                      ? "—"
                      : String(item.SoRoll)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                    LOT
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] font-semibold text-egmf-ink-secondary sm:text-base">
                    {item.Lot === null ||
                    item.Lot === undefined ||
                    item.Lot === ""
                      ? "—"
                      : String(item.Lot)}
                  </p>
                </div>
              </div>
            </div>
            {item.MaCayVai && (
              <div className="hidden shrink-0 place-items-center rounded-xl border border-egmf-border-subtle p-2 sm:grid">
                <QRCode
                  value={String(item.MaCayVai)}
                  size={72}
                  type="svg"
                  bordered={false}
                  color="var(--egmf-ink)"
                  bgColor="var(--egmf-surface-raised)"
                />
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-egmf-border-subtle pt-4">
            <p className="m-0 text-xs font-medium text-egmf-muted">
              Diễn giải / tên nguyên phụ liệu
            </p>
            <p className="m-0 mt-1.5 break-words text-[15px] font-semibold leading-7 text-egmf-ink-secondary sm:text-base">
              {item.TenNPL === null ||
              item.TenNPL === undefined ||
              item.TenNPL === ""
                ? "—"
                : String(item.TenNPL)}
            </p>
          </div>

          <section
            className="mt-4 border-t border-egmf-border-subtle pt-4"
            aria-label="Thông số cây vải"
          >
            <div className="flex items-center gap-2 text-egmf-ink">
              <Ruler
                size={17}
                className="text-egmf-primary"
                strokeWidth={2.2}
              />
              <h4 className="m-0 text-[15px] font-bold sm:text-base">
                Thông số
              </h4>
            </div>
            <div className="mt-3 grid grid-cols-2 divide-x divide-y divide-egmf-border-subtle overflow-hidden rounded-xl border border-egmf-border-subtle sm:grid-cols-4 sm:divide-y-0">
              <div className="min-w-0 px-3 py-3">
                <p className="m-0 truncate text-[12px] font-medium text-egmf-muted">
                  Khổ chứng từ
                </p>
                <p className="m-0 mt-1 break-all text-[17px] font-bold text-egmf-ink">
                  {item.KhoVaiTenTem === null ||
                  item.KhoVaiTenTem === undefined ||
                  item.KhoVaiTenTem === ""
                    ? "—"
                    : String(item.KhoVaiTenTem)}
                </p>
              </div>
              <div className="min-w-0 px-3 py-3">
                <p className="m-0 truncate text-[12px] font-medium text-egmf-muted">
                  Khổ thực tế
                </p>
                <p className="m-0 mt-1 break-all text-[17px] font-bold text-egmf-ink">
                  {item.KhoVaiThucTe === null ||
                  item.KhoVaiThucTe === undefined ||
                  item.KhoVaiThucTe === ""
                    ? "—"
                    : String(item.KhoVaiThucTe)}
                </p>
              </div>
              <div className="min-w-0 px-3 py-3">
                <p className="m-0 truncate text-[12px] font-medium text-egmf-muted">
                  SL chứng từ
                </p>
                <p className="m-0 mt-1 break-all text-[17px] font-bold text-egmf-ink">
                  {item.SoLuongChungTu === null ||
                  item.SoLuongChungTu === undefined ||
                  item.SoLuongChungTu === ""
                    ? "—"
                    : String(item.SoLuongChungTu)}
                </p>
              </div>
              <div className="min-w-0 px-3 py-3">
                <p className="m-0 truncate text-[12px] font-medium text-egmf-muted">
                  SL thực tế
                </p>
                <p className="m-0 mt-1 break-all text-[17px] font-bold text-egmf-ink">
                  {item.SoLuongThucTe === null ||
                  item.SoLuongThucTe === undefined ||
                  item.SoLuongThucTe === ""
                    ? "—"
                    : String(item.SoLuongThucTe)}
                </p>
              </div>
            </div>
          </section>

          <section
            className="mt-4 border-t border-egmf-border-subtle pt-4"
            aria-label="Kết quả kiểm tra"
          >
            <div className="flex items-center gap-2 text-egmf-ink">
              <ClipboardList
                size={17}
                className="text-egmf-primary"
                strokeWidth={2.2}
              />
              <h4 className="m-0 text-[15px] font-bold sm:text-base">
                Kết quả kiểm tra
              </h4>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <div className="min-w-0">
                <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                  Điểm trung bình
                </p>
                <p className="m-0 mt-1 break-words text-[18px] font-extrabold text-egmf-ink">
                  {item.DiemTrungBinh === null ||
                  item.DiemTrungBinh === undefined ||
                  item.DiemTrungBinh === ""
                    ? "—"
                    : String(item.DiemTrungBinh)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                  Số cây
                </p>
                <p className="m-0 mt-1 break-words text-[18px] font-extrabold text-egmf-ink">
                  {item.SoCay === null ||
                  item.SoCay === undefined ||
                  item.SoCay === ""
                    ? "—"
                    : String(item.SoCay)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                  Người tạo
                </p>
                <p className="m-0 mt-1 break-words text-[15px] font-semibold text-egmf-ink-secondary sm:text-base">
                  {item.TenNguoiTao === null ||
                  item.TenNguoiTao === undefined ||
                  item.TenNguoiTao === ""
                    ? "—"
                    : String(item.TenNguoiTao)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 border-t border-egmf-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setIsDefectListOpen((previous) => !previous)}
              aria-expanded={isDefectListOpen}
              aria-controls={`fabric-defect-list-${item.CTId}`}
              className="flex w-full items-center gap-3 rounded-xl border border-egmf-border bg-egmf-surface-subtle px-3.5 py-3 text-left transition hover:border-egmf-primary-border hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                <ListChecks size={19} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-egmf-ink">
                  Danh sách lỗi
                </span>
                <span className="mt-0.5 block text-xs font-medium text-egmf-muted">
                  Xem các lỗi được ghi nhận trên cây vải
                </span>
              </span>
              <ChevronDown
                size={20}
                strokeWidth={2.5}
                className={`shrink-0 text-egmf-muted transition-transform ${
                  isDefectListOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDefectListOpen && (
              <div
                id={`fabric-defect-list-${item.CTId}`}
                className="mt-3 overflow-hidden rounded-xl border border-egmf-border-subtle"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-left text-sm">
                    <thead className="bg-egmf-primary-tint text-[11px] font-bold uppercase tracking-wide text-egmf-ink-secondary">
                      <tr>
                        <th className="w-12 px-3 py-2.5 text-center">STT</th>
                        <th className="w-20 border-l border-egmf-primary-border-soft px-3 py-2.5">
                          V.trí
                        </th>
                        <th className="w-24 border-l border-egmf-primary-border-soft px-3 py-2.5">
                          Mã
                        </th>
                        <th className="border-l border-egmf-primary-border-soft px-3 py-2.5">
                          Tên lỗi
                        </th>
                        <th className="w-20 border-l border-egmf-primary-border-soft px-3 py-2.5 text-center">
                          T.điểm
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <span className="mx-auto grid size-10 place-items-center rounded-xl bg-egmf-surface-subtle text-egmf-muted">
                            <ListChecks size={20} />
                          </span>
                          <p className="m-0 mt-2 text-sm font-semibold text-egmf-ink-secondary">
                            Chưa có dữ liệu lỗi
                          </p>
                          <p className="m-0 mt-1 text-xs text-egmf-muted">
                            Danh sách lỗi sẽ hiển thị tại đây khi có dữ liệu.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {(item.GhiChu || item.HuongXuLy) && (
            <section className="mt-4 grid gap-3 border-t border-egmf-border-subtle pt-4 sm:grid-cols-2">
              {item.GhiChu && (
                <div className="min-w-0">
                  <p className="m-0 text-[13px] font-bold text-egmf-ink-secondary">
                    Ghi chú
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] leading-7 text-egmf-muted">
                    {item.GhiChu === null ||
                    item.GhiChu === undefined ||
                    item.GhiChu === ""
                      ? "—"
                      : String(item.GhiChu)}
                  </p>
                </div>
              )}
              {item.HuongXuLy && (
                <div className="min-w-0">
                  <p className="m-0 text-[13px] font-bold text-egmf-ink-secondary">
                    Hướng xử lý
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] leading-7 text-egmf-muted">
                    {item.HuongXuLy === null ||
                    item.HuongXuLy === undefined ||
                    item.HuongXuLy === ""
                      ? "—"
                      : String(item.HuongXuLy)}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="border-t border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-4 sm:px-5 sm:py-3">
          <p className="m-0 mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-muted-soft">
            Thao tác kiểm vải
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-2.5">
            {ROLL_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => handleActionClick(action)}
                  className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[14px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 active:scale-[0.98] sm:min-h-[52px] sm:text-[15px] ${ACTION_STYLES[action.tone ?? "default"]}`}
                >
                  <Icon size={18} strokeWidth={2.3} className="shrink-0" />
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </footer>
      </article>

      <Modal
        closeIcon={<X size={24} strokeWidth={2.4} />}
        title={
          <span className="text-lg font-extrabold text-egmf-ink">
            {selectedAction?.label}
          </span>
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText={
          selectedAction?.key === "delete"
            ? "Xóa"
            : selectedAction?.key === "complete"
              ? "Hoàn tất kiểm cây"
              : "Cập nhật"
        }
        cancelText="Hủy"
        centered
        width="min(460px, calc(100vw - 32px))"
        styles={{
          content: {
            overflow: "hidden",
            padding: 0,
            borderRadius: 20,
          },
          header: {
            margin: 0,
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--egmf-border-subtle)",
          },
          body: {
            maxHeight: "calc(100dvh - 200px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            padding: "16px 20px",
          },
          footer: {
            display: "flex",
            gap: 12,
            margin: 0,
            padding: "12px 20px 20px",
            borderTop: "1px solid var(--egmf-border-subtle)",
          },
          close: {
            alignItems: "center",
            background: "var(--egmf-primary-soft)",
            borderRadius: 12,
            color: "var(--egmf-primary)",
            display: "flex",
            height: 44,
            insetBlockStart: 10,
            insetInlineEnd: 12,
            justifyContent: "center",
            width: 44,
          },
        }}
        okButtonProps={{
          danger: selectedAction?.key === "delete",
          className: `
            !m-0 !h-14 !flex-1 !rounded-xl !px-4
            !text-[15px] !font-bold
            ${
              selectedAction?.key === "delete"
                ? "!bg-red-600 hover:!bg-red-700"
                : "!bg-egmf-primary hover:!bg-egmf-primary-strong"
            }
          `,
        }}
        cancelButtonProps={{
          className:
            "!m-0 !h-14 !flex-1 !rounded-xl !border-egmf-border !px-4 !text-[15px] !font-bold !text-egmf-ink-secondary hover:!border-egmf-primary hover:!text-egmf-primary",
        }}
      >
        {selectedAction?.key === "add-defect" && (
          <AddDefectForm formData={formData} setFormData={setFormData} />
        )}
        {selectedAction?.key === "measure" && (
          <FabricWidthForm formData={formData} setFormData={setFormData} />
        )}
        {selectedAction?.key === "update" && (
          <FabricNoteForm formData={formData} setFormData={setFormData} />
        )}
        {selectedAction?.key === "delete" && (
          <div className="flex flex-col items-center py-4 text-center">
            {/* Icon */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Trash2 size={28} strokeWidth={2} className="text-red-500" />
            </div>

            {/* Nội dung */}
            <p className="text-base font-medium text-gray-600">
              Bạn có chắc muốn xóa cây vải này?
            </p>

            {/* Mã cây vải */}
            <div className="mt-4 w-full rounded-xl bg-gray-50 px-4 py-4">
              <p className="text-xs font-medium text-gray-500">Mã cây vải</p>
              <p className="mt-1 break-all text-lg font-bold text-gray-900">
                {item.MaCayVai}
              </p>
            </div>

            {/* Cảnh báo */}
            <p className="mt-4 text-sm text-red-500">
              Dữ liệu đã xóa không thể khôi phục.
            </p>
          </div>
        )}
        {selectedAction?.key === "complete" && (
          <CompleteFabricRollForm
            formData={formData}
            setFormData={setFormData}
            item={item}
          />
        )}
        {selectedAction?.key === "fabric-edge" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E8FB]">
              <Construction size={32} className="text-[#6865D9]" />
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              Tính năng đang phát triển
            </h3>

            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Chức năng này hiện chưa được hỗ trợ. Vui lòng quay lại sau!
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
