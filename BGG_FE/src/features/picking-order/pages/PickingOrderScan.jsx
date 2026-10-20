import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Keyboard, ScanBarcode, ScanQrCode } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";

export default function PickingOrderScan() {
  const location = useLocation();
  const navigate = useNavigate();

  const [basketCode, setBasketCode] = useState("");
  const PhieuSoanHangId = location.state?.PhieuSoanHangId;

  const handleScan = (e) => {
    e.preventDefault();

    const MaRo = basketCode.trim();

    if (!PhieuSoanHangId || !MaRo) {
      toast.warning("Thiếu mã phiếu soạn hàng hoặc mã rổ");
      return;
    }

    const payload = {
      PhieuSoanHangId: PhieuSoanHangId,
      MaRo: basketCode,
    };

    navigate("/picking-order-materials", {
      state: payload,
    });

    return;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <MainLayout screenTitle="Quét rổ soạn hàng">
      <div className="flex min-h-0 flex-1 flex-col bg-egmf-surface px-4 py-5 sm:px-6 sm:py-8 md:px-8">
        <section className="relative isolate mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-egmf-border bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-7">
          <ScanQrCode
            aria-hidden="true"
            strokeWidth={1}
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 size-72 -translate-x-1/2 -translate-y-1/2 text-egmf-primary/15 sm:size-96"
          />

          <div className="relative z-10 mb-6 text-center sm:mb-7">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary sm:mb-4 sm:size-14">
              <ScanBarcode size={27} strokeWidth={2} />
            </div>

            <h1 className="text-lg font-extrabold tracking-tight text-egmf-ink sm:text-2xl">
              Quét mã rổ
            </h1>

            <p className="mx-auto mt-1.5 max-w-md text-sm font-medium leading-5 text-egmf-ink-soft sm:mt-2 sm:leading-6 sm:text-[15px]">
              Dùng máy quét mã vạch hoặc nhập mã rổ để tiếp tục soạn hàng.
            </p>
          </div>

          <form
            onSubmit={handleScan}
            className="relative z-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_152px] sm:items-stretch"
          >
            <div className="flex h-14 items-center gap-3 rounded-xl border border-egmf-border bg-egmf-surface px-3.5 transition-colors focus-within:border-egmf-primary focus-within:ring-4 focus-within:ring-egmf-primary/10">
              <ScanBarcode
                size={22}
                strokeWidth={2}
                className="shrink-0 text-egmf-primary"
              />

              <input
                ref={inputRef}
                type="text"
                value={basketCode}
                onChange={(e) => setBasketCode(e.target.value)}
                placeholder="Nhập hoặc quét mã rổ..."
                autoComplete="off"
                spellCheck={false}
                aria-label="Mã rổ"
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-egmf-ink outline-none placeholder:font-medium placeholder:text-egmf-muted sm:text-[17px]"
              />
            </div>

            <button
              type="submit"
              className="flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-egmf-primary px-5 text-base font-bold text-white shadow-egmf-primary transition-colors hover:bg-egmf-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/25 sm:h-auto"
            >
              Tiếp tục
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </form>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-2 border-t border-egmf-border pt-4 text-center sm:mt-5 sm:pt-5">
            <Keyboard size={16} className="shrink-0 text-egmf-muted" />
            <p className="text-xs font-medium text-egmf-ink-soft sm:text-sm">
              Nhấn Enter sau khi quét để tiếp tục
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
