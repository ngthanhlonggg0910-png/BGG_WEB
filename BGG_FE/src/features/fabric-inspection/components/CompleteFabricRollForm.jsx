import {
  ClipboardCheck,
  Droplets,
  FileText,
  Ruler,
  Weight,
  MessageSquareText,
} from "lucide-react";
import { useEffect, useMemo } from "react";

const sectionClass =
  "rounded-xl border border-egmf-border-subtle bg-egmf-surface-subtle p-3";

const inputClass =
  "h-11 w-full rounded-lg border border-egmf-border bg-white px-3 text-[15px] font-semibold text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10";

const readonlyClass = "cursor-not-allowed bg-gray-100";

function ResultCheckbox({ id, checked, label, tone = "success" }) {
  const isSuccess = tone === "success";

  return (
    <label
      htmlFor={id}
      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-[13px] font-bold ${
        isSuccess ? "text-egmf-success" : "text-red-600"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        readOnly
        className={`size-4 cursor-not-allowed rounded border-egmf-border ${
          isSuccess ? "accent-green-600" : "accent-red-600"
        }`}
      />
      {label}
    </label>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-bold text-egmf-ink-secondary"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function getMinWidth(raw) {
  if (raw == null || String(raw).trim() === "") {
    return null;
  }

  const widths = String(raw)
    .split(/\s*-\s*/)
    .map((value) =>
      Number(String(value).toUpperCase().replaceAll("CM", "").trim()),
    );

  if (
    widths.length === 0 ||
    widths.some((value) => !Number.isFinite(value) || value <= 0)
  ) {
    return null;
  }

  return Math.min(...widths);
}

export default function CompleteFabricRollForm({
  formData,
  setFormData,
  item,
}) {
  console.log(item);
  const updateForm = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 1. Lấy khổ vải nhỏ nhất (cm)
  const minWidth = useMemo(
    () => getMinWidth(item?.KhoVaiThucTe),
    [item?.KhoVaiThucTe],
  );

  // 2. Tính điểm trung bình
  const diemTrungBinh = useMemo(() => {
    const tongDiem = Number(item?.TongDiem);
    const soLuong = Number(formData?.SoLuongThucTe);

    if (
      minWidth === null ||
      item?.TongDiem == null ||
      formData?.SoLuongThucTe == null ||
      String(formData.SoLuongThucTe).trim() === "" ||
      !Number.isFinite(tongDiem) ||
      !Number.isFinite(soLuong) ||
      tongDiem < 0 ||
      soLuong <= 0
    ) {
      return null;
    }

    return (tongDiem * 36 * 100) / ((soLuong / 0.9144) * (minWidth / 2.54));
  }, [item?.TongDiem, formData?.SoLuongThucTe, minWidth]);

  // 3. Tự động xác định kết quả kiểm
  const ketQuaKiem = useMemo(() => {
    if (diemTrungBinh === null || minWidth === null) {
      return false;
    }

    const soLuongThucTe = Number(formData?.SoLuongThucTe);
    const soLuongChungTu = Number(item?.SoLuongChungTu);
    const khoVaiTenTem = Number(item?.KhoVaiTenTem);

    if (
      item?.SoLuongChungTu == null ||
      item?.KhoVaiTenTem == null ||
      String(item.KhoVaiTenTem).trim() === "" ||
      !Number.isFinite(soLuongChungTu) ||
      !Number.isFinite(khoVaiTenTem)
    ) {
      return false;
    }

    const nhomKhachHang = String(item?.nhomKhachHang ?? "")
      .trim()
      .toUpperCase();

    const datKhoVai =
      nhomKhachHang === "DECATHLON"
        ? minWidth >= khoVaiTenTem
        : minWidth >= khoVaiTenTem - 2;

    return diemTrungBinh < 25 && soLuongThucTe >= soLuongChungTu && datKhoVai;
  }, [
    diemTrungBinh,
    minWidth,
    formData?.SoLuongThucTe,
    item?.SoLuongChungTu,
    item?.KhoVaiTenTem,
    item?.nhomKhachHang,
  ]);

  // 4. Tự động xác định kết quả độ ẩm
  const ketQuaDoAm = useMemo(() => {
    const raw = formData?.DoAm;

    if (raw == null || String(raw).trim() === "") {
      return false;
    }

    const moisture = Number(raw);

    return Number.isFinite(moisture) && moisture >= 0 && moisture <= 5;
  }, [formData?.DoAm]);

  // 5. Đồng bộ kết quả tính toán vào formData
  useEffect(() => {
    setFormData((prev) => {
      if (
        prev.DiemTrungBinh === diemTrungBinh &&
        prev.KetQuaKiem === ketQuaKiem &&
        prev.KetQuaDoAm === ketQuaDoAm
      ) {
        return prev;
      }

      return {
        ...prev,
        DiemTrungBinh: diemTrungBinh,
        KetQuaKiem: ketQuaKiem,
        KetQuaDoAm: ketQuaDoAm,
      };
    });
  }, [diemTrungBinh, ketQuaKiem, ketQuaDoAm, setFormData]);

  return (
    <div className="h-[370px] space-y-3 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* KẾT QUẢ KIỂM VÀ ĐỘ ẨM */}
      <section className={`${sectionClass} space-y-2.5`}>
        <div className="flex items-center gap-3">
          <p className="flex w-[88px] shrink-0 items-center gap-1.5 text-[13px] font-bold text-egmf-ink">
            <ClipboardCheck size={16} className="text-egmf-primary" />
            Kết quả
          </p>

          <ResultCheckbox
            id="ketQuaKiemDat"
            checked={diemTrungBinh !== null && ketQuaKiem === true}
            label="Đạt"
          />

          <ResultCheckbox
            id="ketQuaKiemKhongDat"
            checked={diemTrungBinh !== null && ketQuaKiem === false}
            label="Không đạt"
            tone="danger"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="doAm"
              className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-egmf-ink"
            >
              <Droplets size={16} className="text-egmf-primary" />
              Độ ẩm
            </label>

            <div className="flex items-center gap-1">
              <ResultCheckbox
                id="ketQuaDoAmDat"
                checked={
                  formData?.DoAm !== "" && formData?.DoAm != null && ketQuaDoAm
                }
                label="Đạt"
              />

              <ResultCheckbox
                id="ketQuaDoAmKhongDat"
                checked={
                  formData?.DoAm !== "" && formData?.DoAm != null && !ketQuaDoAm
                }
                label="Không đạt"
                tone="danger"
              />
            </div>
          </div>

          <input
            id="doAm"
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            placeholder="Nhập độ ẩm"
            className={`${inputClass} h-12`}
            value={formData?.DoAm ?? ""}
            onChange={(e) => updateForm("DoAm", e.target.value)}
          />
        </div>
      </section>

      {/* THÔNG SỐ KIỂM VẢI */}
      <section className={sectionClass} aria-label="Thông số kiểm vải">
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-egmf-ink">
          <FileText size={16} className="text-egmf-primary" />
          Thông số kiểm vải
        </div>

        <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
          <Field label="Số lượng thực tế" htmlFor="soLuongThucTe">
            <input
              id="soLuongThucTe"
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              placeholder="0.0"
              className={inputClass}
              value={formData?.SoLuongThucTe ?? ""}
              onChange={(e) => updateForm("SoLuongThucTe", e.target.value)}
            />
          </Field>

          <Field label="Số lượng chứng từ" htmlFor="soLuongChungTu">
            <input
              id="soLuongChungTu"
              type="number"
              readOnly
              value={item?.SoLuongChungTu ?? ""}
              className={`${inputClass} ${readonlyClass}`}
            />
          </Field>

          <Field label="Điểm trung bình" htmlFor="diemTrungBinh">
            <input
              id="diemTrungBinh"
              type="text"
              readOnly
              value={diemTrungBinh === null ? "" : diemTrungBinh.toFixed(2)}
              className={`${inputClass} cursor-not-allowed border-egmf-primary-border-soft bg-egmf-primary-tint text-egmf-primary`}
            />
          </Field>

          <Field label="Tổng điểm" htmlFor="tongDiem">
            <input
              id="tongDiem"
              type="number"
              readOnly
              value={item?.TongDiem ?? 0}
              className={`${inputClass} cursor-not-allowed border-egmf-primary-border-soft bg-egmf-primary-tint text-egmf-primary`}
            />
          </Field>
        </div>
      </section>

      {/* KHỔ VẢI */}
      <section className={sectionClass}>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-egmf-ink">
          <Ruler size={16} className="text-egmf-primary" />
          Thông số khổ vải
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Khổ thực tế" htmlFor="khoVaiThucTe">
            <input
              id="khoVaiThucTe"
              type="text"
              readOnly
              value={item?.KhoVaiThucTe ?? ""}
              className={`${inputClass} cursor-not-allowed border-yellow-200 bg-yellow-100 font-bold text-pink-500`}
            />
          </Field>

          <Field label="Khổ chứng từ" htmlFor="khoVaiTenTem">
            <input
              id="khoVaiTenTem"
              type="text"
              readOnly
              value={item?.KhoVaiTenTem ?? ""}
              className={`${inputClass} cursor-not-allowed border-yellow-200 bg-yellow-100 font-bold text-pink-500`}
            />
          </Field>
        </div>
      </section>

      {/* TRỌNG LƯỢNG VẢI */}
      <section className={sectionClass}>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-egmf-ink">
          <Weight size={16} className="text-egmf-primary" />
          Trọng lượng vải
        </div>

        <input
          id="trongLuongVai"
          type="text"
          placeholder="Nhập trọng lượng vải"
          className={inputClass}
          value={formData?.TrongLuongVai ?? ""}
          onChange={(e) => updateForm("TrongLuongVai", e.target.value)}
        />
      </section>

      {/* GHI CHÚ */}
      <section className={sectionClass}>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-egmf-ink">
          <MessageSquareText size={16} className="text-egmf-primary" />
          Ghi chú
        </div>

        <textarea
          id="ghiChu"
          rows={4}
          placeholder="Nhập ghi chú..."
          value={formData?.GhiChu ?? ""}
          onChange={(e) => updateForm("GhiChu", e.target.value)}
          className="w-full resize-y rounded-lg border border-egmf-border bg-white p-3 text-[15px] font-medium text-egmf-ink outline-none transition placeholder:font-normal placeholder:text-egmf-placeholder focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
        />
      </section>
    </div>
  );
}
