import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Barcode,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
} from "lucide-react";

import { getCurrentUser } from "../../../shared/auth/session";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { updateMaterialLocation } from "../api/materialLocationApi";

export default function MaterialLocationUpdate() {
  const navigate = useNavigate();
  const [maRo, setMaRo] = useState("");
  const [maNPL, setMaNPL] = useState("");
  const [scannedLabels, setScannedLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const maNPLRef = useRef(null);

  const confirmUpdate = async () => {
    if (submittingRef.current) return;

    const ro = maRo.trim();
    const npl = maNPL.trim();

    if (!ro || !npl) {
      toast.warning("Vui lòng nhập đầy đủ mã rọ và mã NPL.");
      return;
    }

    if (scannedLabels.some((item) => item.maNPL === npl)) {
      toast.warning("Mã NPL này đã được cập nhật.");
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

      if (!result?.success) {
        toast.error(result?.message || "Cập nhật thất bại.");
        return;
      }

      const data = result.data || {};

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
      console.error(err);
      toast.error("Có lỗi khi cập nhật vị trí.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <MainLayout screenTitle="Cập nhật vị trí nguyên liệu">
      <div className="mx-auto w-full max-w-[1000px] space-y-4 px-4 py-5 sm:px-6 md:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
              <MapPin aria-hidden="true" size={21} />
            </span>
            <h2 className="text-[19px] font-bold text-slate-900">
              Cập nhật vị trí
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-[15px] font-bold text-slate-800"
                htmlFor="maRo"
              >
                Mã rọ
              </label>
              <input
                autoComplete="off"
                className="h-14 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                id="maRo"
                onChange={(e) => setMaRo(e.target.value)}
                placeholder="Nhập mã rọ..."
                type="text"
                value={maRo}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-[15px] font-bold text-slate-800"
                htmlFor="maNPL"
              >
                Mã nguyên phụ liệu
              </label>
              <input
                autoComplete="off"
                className="h-14 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold outline-none transition focus:border-egmf-primary focus:ring-4 focus:ring-egmf-primary/10"
                id="maNPL"
                onChange={(e) => setMaNPL(e.target.value)}
                placeholder="Nhập mã NPL..."
                type="text"
                value={maNPL}
                ref={maNPLRef}
              />
            </div>
          </div>

          <button
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-egmf-primary text-[16px] font-bold text-white transition-colors hover:bg-egmf-primary-strong active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={loading || !maRo.trim() || !maNPL.trim()}
            onClick={confirmUpdate}
            type="button"
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
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="m-0 text-[17px] font-bold text-slate-900">
              Tem đã cập nhật
            </h3>
            <span className="rounded-lg bg-egmf-primary-soft px-3 py-1.5 text-sm font-bold text-egmf-primary-strong">
              {scannedLabels.length} tem
            </span>
          </div>

          {scannedLabels.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <Barcode size={30} />
              <p className="mt-2 text-sm">Chưa có tem nào</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {scannedLabels.map((item) => (
                <article
                  className="rounded-xl border border-slate-200 p-3.5"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Mã NPL</p>
                      <p className="mt-1 break-all text-[16px] font-bold text-slate-900">
                        {item.maNPL}
                      </p>
                    </div>
                    <Check className="shrink-0 text-emerald-600" size={20} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
                    <div>
                      <p className="text-slate-500">Mã rọ</p>
                      <p className="mt-1 break-all font-semibold text-egmf-primary-strong">
                        {item.maRo || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Số lượng</p>
                      <p className="mt-1 font-bold text-slate-800">
                        {item.slTrongRo ?? "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500">Vị trí</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {item.tenViTri || "—"}
                      </p>
                    </div>
                  </div>

                  {item.time && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 size={14} />
                      {item.time}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
