import { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Barcode,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
} from "lucide-react";

import { getCurrentUser } from "../../../shared/auth/session";
import { showWarningToast } from "../../../shared/components/ui/CustomToast";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { updateMaterialLocation } from "../api/materialLocationApi";

export default function MaterialLocationUpdate() {
  const [maRo, setMaRo] = useState("");
  const [maNPL, setMaNPL] = useState("");
  const [scannedLabels, setScannedLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const maNPLRef = useRef(null);

  console.log(scannedLabels);

  const confirmUpdate = async ({ ro: submittedRo, npl: submittedNpl } = {}) => {
    if (submittingRef.current) return;

    const ro = (submittedRo ?? maRo).trim();
    const npl = (submittedNpl ?? maNPL).trim();

    if (!ro || !npl) {
      showWarningToast("Vui lòng nhập đầy đủ mã rọ và mã NPL.");
      return;
    }

    if (scannedLabels.some((item) => item.maNPL === npl)) {
      showWarningToast("Mã NPL này đã được cập nhật.");
      setMaNPL("");
      return;
    }

    const user = getCurrentUser();

    if (!user?.data) {
      toast.error("Không tìm thấy thông tin tài khoản.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const creator = [user.data.HoVaTenLot, user.data.Ten]
        .filter(Boolean)
        .join(" ");

      const result = await updateMaterialLocation(ro, npl, creator);

      console.log("Kết quả API:", result);

      if (!result?.success) {
        toast.error(result?.message || "Cập nhật thất bại.");
        return;
      }

      const data = result.data || {};
      console.log(data);
      setScannedLabels((prev) => [
        {
          id: `${Date.now()}-${npl}`,
          maNPL: data.MaNPL ?? npl,
          maRo: data.MaRo ?? ro,
          tenViTri: data.TenViTri,
          slTrongRo: data.SLTrongRo,
          time: data.Time,
        },
        ...prev,
      ]);

      setMaNPL("");
      maNPLRef.current?.focus();

      toast.success(result.message || "Cập nhật thành công.");
    } catch (err) {
      console.error("Lỗi updateMaterialLocation:", err);

      toast.error(err?.message || "Có lỗi khi cập nhật vị trí.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    void confirmUpdate({
      ro: String(formData.get("maRo") ?? ""),
      npl: String(formData.get("maNPL") ?? ""),
    });
  };

  return (
    <MainLayout screenTitle="Cập nhật vị trí nguyên liệu">
      <div className="min-h-full bg-egmf-surface">
        <div className="mx-auto w-full max-w-[1000px] space-y-3 px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <section className="overflow-hidden rounded-xl border border-egmf-border bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-egmf-border-subtle bg-egmf-surface-subtle px-3.5 py-2.5 sm:px-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
              <MapPin aria-hidden="true" size={17} />
            </span>
            <h2 className="text-sm font-extrabold text-egmf-ink sm:text-[15px]">
              Cập nhật vị trí
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-3.5 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-xs font-bold text-egmf-ink-secondary"
                  htmlFor="maRo"
                >
                  Mã rọ
                </label>
                <input
                  autoComplete="off"
                  className="h-12 w-full rounded-lg border border-egmf-border bg-white px-3 text-sm font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                  id="maRo"
                  name="maRo"
                  onChange={(e) => setMaRo(e.target.value)}
                  placeholder="Nhập mã rọ..."
                  type="text"
                  value={maRo}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-bold text-egmf-ink-secondary"
                  htmlFor="maNPL"
                >
                  Mã nguyên phụ liệu
                </label>
                <input
                  autoComplete="off"
                  className="h-12 w-full rounded-lg border border-egmf-border bg-white px-3 text-sm font-semibold text-egmf-ink outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                  id="maNPL"
                  name="maNPL"
                  data-submit-on-scan="true"
                  onChange={(e) => setMaNPL(e.target.value)}
                  placeholder="Nhập mã NPL..."
                  type="text"
                  value={maNPL}
                  ref={maNPLRef}
                />
              </div>
            </div>

            <button
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-egmf-primary text-sm font-extrabold text-white shadow-egmf-primary-compact transition-colors hover:bg-egmf-primary-strong active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 sm:ml-auto sm:w-[220px]"
              disabled={loading || !maRo.trim() || !maNPL.trim()}
              type="submit"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" size={21} />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check size={22} />
                  Xác nhận cập nhật
                </>
              )}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-egmf-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-egmf-border-subtle px-3.5 py-2.5 sm:px-4">
            <h3 className="m-0 text-sm font-extrabold text-egmf-ink">
              Tem đã cập nhật
            </h3>
            <span className="rounded-full bg-egmf-primary-tint px-2.5 py-1 text-xs font-bold text-egmf-primary">
              {scannedLabels.length} tem
            </span>
          </div>

          <div className="p-3.5 sm:p-4">
          {scannedLabels.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle text-egmf-muted">
              <span className="grid size-10 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary"><Barcode size={21} /></span>
              <p className="mt-2 text-sm font-medium">Chưa có tem nào</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {scannedLabels.map((item) => (
                <article
                  className="rounded-xl border border-egmf-border bg-white p-3 shadow-sm"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-egmf-muted">Mã NPL</p>
                      <p className="mt-0.5 break-all text-base font-extrabold text-egmf-ink">
                        {item.maNPL}
                      </p>
                    </div>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-egmf-success-soft text-egmf-success"><Check size={17} strokeWidth={2.8} /></span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 rounded-lg bg-egmf-surface-subtle p-2.5 text-sm">
                    <div>
                      <p className="text-[11px] font-bold text-egmf-muted">Mã rọ</p>
                      <p className="mt-0.5 break-all font-bold text-egmf-primary-strong">
                        {item.maRo || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-egmf-muted">Số lượng</p>
                      <p className="mt-0.5 font-bold text-egmf-ink-secondary">
                        {item.slTrongRo ?? "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] font-bold text-egmf-muted">Vị trí</p>
                      <p className="mt-0.5 font-semibold text-egmf-ink-secondary">
                        {item.tenViTri || "—"}
                      </p>
                    </div>
                  </div>

                  {item.time && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-egmf-muted">
                      <Clock3 size={14} />
                      {item.time}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
          </div>
        </section>
        </div>
      </div>
    </MainLayout>
  );
}
