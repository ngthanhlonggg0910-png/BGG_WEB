import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { mappingOptions } from "../data/mapping-qr.data";

const MappingOptionPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout screenTitle="Mapping QR">
      <main className="min-h-full bg-egmf-surface px-4 py-5 sm:px-6 sm:py-8">
        <section className="mx-auto w-full max-w-2xl">
          <header className="px-1 pb-1 sm:px-0">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.12em] text-egmf-primary">
              Thiết lập mã QR
            </p>
            <h2 className="m-0 mt-1 text-xl font-extrabold tracking-tight text-egmf-ink sm:text-2xl">
              Chọn chức năng mapping
            </h2>
          </header>

          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
            {mappingOptions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    navigate(item.path, {
                      state: {
                        loai: item.key,
                      },
                    })
                  }
                  className="group relative flex min-h-[132px] w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-egmf-border bg-egmf-surface-raised p-4 text-left shadow-egmf-card transition-all duration-200 hover:-translate-y-0.5 hover:border-egmf-primary-border hover:bg-egmf-primary-hover-soft active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 sm:min-h-[144px] sm:gap-5 sm:p-5"
                >
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-egmf-primary-soft text-egmf-primary transition-colors duration-200 group-hover:bg-egmf-primary group-hover:text-white sm:size-[76px]">
                    <Icon size={34} strokeWidth={1.9} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-egmf-primary">
                      Mapping QR
                    </span>
                    <span className="block text-lg font-extrabold text-egmf-ink sm:text-xl">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-egmf-ink-soft sm:text-[15px]">
                      {item.description}
                    </span>
                  </span>

                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-egmf-primary-border-soft bg-egmf-primary-tint text-egmf-primary transition-all duration-200 group-hover:translate-x-0.5 group-hover:border-egmf-primary group-hover:bg-egmf-primary group-hover:text-white">
                    <ArrowRight size={19} strokeWidth={2.4} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </MainLayout>
  );
};

export default MappingOptionPage;
