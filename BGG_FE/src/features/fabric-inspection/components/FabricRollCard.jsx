import { useState } from "react";
import { Modal, QRCode } from "antd";
import {
  CheckCheck,
  ClipboardList,
  FilePenLine,
  Layers3,
  ListChecks,
  Package,
  Plus,
  Ruler,
  Trash2,
  X,
} from "lucide-react";

import AddDefectForm from "./AddFabricDefectForm";

const display = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const ROLL_ACTIONS = [
  { key: "add-defect", label: "Thêm lỗi", icon: Plus, tone: "primary" },
  { key: "measure", label: "Đo khổ", icon: Ruler },
  { key: "complete", label: "Xong cây", icon: CheckCheck, tone: "success" },
  { key: "notes", label: "Ghi chú", icon: FilePenLine },
  { key: "fabric-edge", label: "Loại biên", icon: ListChecks },
  { key: "delete", label: "Xóa", icon: Trash2, tone: "quiet" },
];

const ACTION_STYLES = {
  default:
    "border-egmf-border bg-white text-egmf-ink-secondary hover:border-egmf-primary-border hover:bg-egmf-primary-hover-soft hover:text-egmf-primary",
  primary:
    "border-egmf-primary bg-egmf-primary text-white hover:bg-egmf-primary-strong",
  success:
    "border-egmf-success-soft bg-white text-egmf-success hover:border-egmf-success hover:bg-egmf-success-soft",
  quiet:
    "border-egmf-border bg-white text-egmf-muted hover:border-egmf-primary-border hover:bg-egmf-primary-hover-soft hover:text-egmf-primary",
};

export function FabricRollCard({ item, index }) {
  console.log(item);
  const initialFormData = {
    "add-defect": {
      CTId: item?.CTId ?? null,
      MaLoi: "",
      TenLoi: "",
      ViTriKiem: "",
      SoDiem: 1,
      TuViTri: 0,
      DenViTri: 0,
      SoLoi: null,
      TongDiem: item?.TongDiem ?? 0,
      SoDiemTrungBinh: item?.DiemTrungBinh ?? 0,
      SoYard: 0,
    },
  };
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  if (!item) return null;

  const materialDetails = [
    { label: "Mã hàng", value: item.MaHang },
    { label: "Mùa", value: item.Mua },
    { label: "Số roll", value: item.SoRoll },
    { label: "LOT", value: item.Lot },
  ];
  const measurements = [
    { label: "Khổ chứng từ", value: item.KhoVaiTenTem },
    { label: "Khổ thực tế", value: item.KhoVaiThucTe },
    { label: "SL chứng từ", value: item.SoLuongChungTu },
    { label: "SL thực tế", value: item.SoLuongThucTe },
  ];
  const resultDetails = [
    { label: "Điểm trung bình", value: item.DiemTrungBinh, strong: true },
    { label: "Số cây", value: item.SoCay, strong: true },
    { label: "Người tạo", value: item.TenNguoiTao },
  ];

  const isComplete = String(item.KQKiem ?? "")
    .toLocaleLowerCase("vi-VN")
    .includes("xong");

  const handleActionClick = (action) => {
    setSelectedAction(action);

    const data = initialFormData[action.key];
    if (data) {
      setFormData({ ...data });
    } else {
      setFormData({});
    }

    setOpen(true);
  };

  const handleSubmit = () => {
    console.log("submit");
  };

  console.log(formData);

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
              {display(item.MaCayVai)}
            </h3>
          </div>
          {item.KQKiem && (
            <span
              className={`inline-flex max-w-[45%] shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold ${isComplete ? "bg-egmf-success-soft text-egmf-success" : "bg-egmf-warning-soft text-egmf-warning"}`}
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${isComplete ? "bg-egmf-success" : "bg-egmf-warning"}`}
              />
              <span className="truncate" title={display(item.KQKiem)}>
                {display(item.KQKiem)}
              </span>
            </span>
          )}
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
                {materialDetails.map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <p
                      className="m-0 truncate text-[13px] font-medium text-egmf-muted"
                      title={label}
                    >
                      {label}
                    </p>
                    <p className="m-0 mt-1 break-words text-[15px] font-semibold text-egmf-ink-secondary sm:text-base">
                      {display(value)}
                    </p>
                  </div>
                ))}
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
              {display(item.TenNPL)}
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
              {measurements.map(({ label, value }) => (
                <div key={label} className="min-w-0 px-3 py-3">
                  <p
                    className="m-0 truncate text-[12px] font-medium text-egmf-muted"
                    title={label}
                  >
                    {label}
                  </p>
                  <p className="m-0 mt-1 break-all text-[17px] font-bold text-egmf-ink">
                    {display(value)}
                  </p>
                </div>
              ))}
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
              {resultDetails.map(({ label, value, strong }) => (
                <div key={label} className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium text-egmf-muted">
                    {label}
                  </p>
                  <p
                    className={`m-0 mt-1 break-words ${strong ? "text-[18px] font-extrabold text-egmf-ink" : "text-[15px] font-semibold text-egmf-ink-secondary sm:text-base"}`}
                  >
                    {display(value)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {(item.GhiChu || item.HuongXuLy) && (
            <section className="mt-4 grid gap-3 border-t border-egmf-border-subtle pt-4 sm:grid-cols-2">
              {item.GhiChu && (
                <div className="min-w-0">
                  <p className="m-0 text-[13px] font-bold text-egmf-ink-secondary">
                    Ghi chú
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] leading-7 text-egmf-muted">
                    {display(item.GhiChu)}
                  </p>
                </div>
              )}
              {item.HuongXuLy && (
                <div className="min-w-0">
                  <p className="m-0 text-[13px] font-bold text-egmf-ink-secondary">
                    Hướng xử lý
                  </p>
                  <p className="m-0 mt-1 break-words text-[15px] leading-7 text-egmf-muted">
                    {display(item.HuongXuLy)}
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
        okText="Cập nhật"
        cancelText="Hủy"
        centered
        width={460}
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
          className:
            "!m-0 !h-14 !flex-1 !rounded-xl !bg-egmf-primary !px-4 !text-[15px] !font-bold hover:!bg-egmf-primary-strong",
        }}
        cancelButtonProps={{
          className:
            "!m-0 !h-14 !flex-1 !rounded-xl !border-egmf-border !px-4 !text-[15px] !font-bold !text-egmf-ink-secondary hover:!border-egmf-primary hover:!text-egmf-primary",
        }}
      >
        {selectedAction?.key === "add-defect" && (
          <AddDefectForm formData={formData} setFormData={setFormData} />
        )}
        {selectedAction?.key === "measure" && <div>Form đo khổ cây vải</div>}
        {selectedAction?.key === "notes" && (
          <div>Form ghi chú / hướng xử lý</div>
        )}
      </Modal>
    </>
  );
}
