import React from "react";
import {
  Package,
  Layers3,
  ScanQrCode,
  Boxes,
  ChevronRight,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation } from "react-router-dom";

export default function MappingQrMaterialDetailPage({ data, onScan }) {
  const location = useLocation();
  const materialData = data ?? location.state?.data ?? location.state ?? {};
  const { TenNPL, SLChungTu, TongCay, TongSL, DanhSachCay = [] } = materialData;

  return (
    <MainLayout screenTitle="Chi tiết vật tư">
      <main className="min-h-full bg-egmf-surface px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-5">
          {/* Thông tin NPL */}
          <section className="overflow-hidden rounded-2xl border border-egmf-border bg-white shadow-egmf-card">
            <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                <Package size={21} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-primary">
                  Nguyên phụ liệu
                </p>
                <h2 className="m-0 mt-1 break-words text-[15px] font-extrabold leading-6 text-egmf-ink sm:text-base">
                  {TenNPL || "Chưa có tên nguyên phụ liệu"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-egmf-primary-border-soft border-t border-egmf-primary-border-soft bg-egmf-primary-tint">
              {[
                { label: "SL chứng từ", value: SLChungTu, icon: Layers3 },
                { label: "Tổng cây", value: TongCay, icon: Boxes },
                { label: "Tổng SL", value: TongSL, icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="min-w-0 px-2 py-3 text-center">
                  <Icon size={15} className="mx-auto mb-1 text-egmf-primary" />
                  <p className="m-0 text-[11px] font-semibold text-egmf-muted">
                    {label}
                  </p>
                  <p className="m-0 mt-0.5 truncate text-base font-extrabold text-egmf-ink">
                    {value ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Danh sách cây */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-egmf-primary-soft text-egmf-primary">
                  <Boxes size={17} />
                </span>
                <h3 className="m-0 text-[15px] font-extrabold text-egmf-ink">
                  Danh sách cây
                </h3>
              </div>

              <span className="shrink-0 rounded-full bg-egmf-primary-soft px-3 py-1.5 text-xs font-bold text-egmf-primary">
                {DanhSachCay.length} cây
              </span>
            </div>

            <div className="space-y-3">
              {DanhSachCay.map((cay, index) => (
                <div
                  key={cay.MaCay || index}
                  className="overflow-hidden rounded-xl border border-egmf-border bg-white transition-colors hover:border-egmf-primary-border"
                >
                  {/* Mã cây */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-egmf-muted">
                        Mã cây
                      </p>
                      <p className="m-0 mt-0.5 break-all text-sm font-extrabold text-egmf-ink">
                        {cay.MaCay || "—"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-egmf-primary-soft px-2.5 py-1.5 text-xs font-extrabold text-egmf-primary">
                      Xuất: {cay.SLXuat ?? 0}
                    </span>
                  </div>

                  {/* Chi tiết */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-egmf-border-subtle px-4 py-3.5 text-sm sm:px-5">
                    <div>
                      <dt className="text-xs font-semibold text-egmf-muted">
                        Số lượng
                      </dt>
                      <dd className="m-0 mt-0.5 font-extrabold text-egmf-primary">
                        {cay.SL ?? 0}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-egmf-muted">
                        SL xuất
                      </dt>
                      <dd className="m-0 mt-0.5 font-extrabold text-egmf-ink">
                        {cay.SLXuat ?? 0}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-egmf-muted">
                        Mã QR
                      </dt>
                      <dd className="m-0 mt-0.5 break-all font-semibold text-egmf-ink-secondary">
                        {cay.MaQR || "—"}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-egmf-muted">
                        Mã số kiện
                      </dt>
                      <dd className="m-0 mt-0.5 break-all font-semibold text-egmf-ink-secondary">
                        {cay.MaSoKien || "—"}
                      </dd>
                    </div>
                  </dl>

                  {/* Nút thao tác */}
                  <div className="flex items-center justify-between gap-3 border-t border-egmf-border-subtle bg-egmf-surface-subtle px-4 py-2.5 sm:px-5">
                    <span className="text-xs font-medium text-egmf-muted">
                      Quét để cập nhật QR cây
                    </span>
                    <button
                      type="button"
                      onClick={() => onScan?.(cay)}
                      className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-egmf-primary px-3 text-xs font-bold text-white shadow-egmf-primary-compact transition hover:bg-egmf-primary-strong active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/20"
                    >
                      <ScanQrCode size={16} />
                      Quét QR
                      <ChevronRight size={15} strokeWidth={2.75} />
                    </button>
                  </div>
                </div>
              ))}

              {DanhSachCay.length === 0 && (
                <div className="rounded-xl border border-dashed border-egmf-primary-border-soft bg-egmf-surface-subtle px-5 py-10 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
                    <Boxes size={23} />
                  </span>
                  <p className="m-0 mt-3 text-sm font-bold text-egmf-ink-secondary">
                    Chưa có danh sách cây
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}
