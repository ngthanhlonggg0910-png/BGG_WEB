import {
  ChevronRight,
  Factory,
  LayoutGrid,
  LogOut,
  UserRound,
  Warehouse,
} from "lucide-react";

import { cn } from "../../shared/components/ui/utils";

const sidebarItems = [
  {
    key: "workspace",
    icon: LayoutGrid,
    label: "Không gian làm việc",
    color: "var(--egmf-primary)",
    bg: "var(--egmf-primary-soft)",
  },
  {
    key: "warehouse",
    icon: Warehouse,
    label: "Kho & nguyên liệu",
    color: "var(--egmf-warehouse)",
    bg: "var(--egmf-warehouse-soft)",
  },
  {
    key: "production",
    icon: Factory,
    label: "Sản xuất",
    color: "var(--egmf-warning)",
    bg: "var(--egmf-warning-soft)",
  },
  {
    key: "Thông tin",
    icon: UserRound,
    label: "Thông tin tài khoản",
    color: "var(--egmf-account)",
    bg: "var(--egmf-account-soft)",
  },
];

export default function Sidebar({ selectedKey, onSelect }) {
  return (
    <div className="flex h-full min-h-full flex-col bg-white">
      <Brand />
      <Navigation selectedKey={selectedKey} onSelect={onSelect} />

      <div className="border-t border-slate-100 px-3 py-4">
        <LogoutButton onClick={() => onSelect("Đăng xuất")} />

        <p className="m-0 mt-4 text-center text-xs font-medium text-slate-400">
          eGMF WebApp · v1.0
        </p>
      </div>
    </div>
  );
}

// MENU DESKTOP / DRAWER
function Navigation({ selectedKey, onSelect }) {
  return (
    <nav aria-label="Điều hướng chính" className="flex-1 px-3 py-5">
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        MENU CHỨC NĂNG
      </p>

      <ul className="m-0 space-y-1.5 p-0">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedKey === item.key;

          return (
            <li key={item.key} className="list-none">
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-[56px] w-full items-center gap-3",
                  "rounded-xl px-3 text-left",
                  "transition-all duration-200",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-egmf-primary",
                  isActive
                    ? "bg-egmf-primary-tint text-egmf-primary-strong"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-egmf-primary" />
                )}

                {/* ICON */}
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: isActive ? "var(--egmf-primary)" : item.bg,
                    color: isActive ? "var(--egmf-surface-raised)" : item.color,
                  }}
                >
                  <Icon size={21} strokeWidth={2.1} />
                </span>

                {/* LABEL */}
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[15px]",
                    isActive ? "font-bold" : "font-semibold",
                  )}
                >
                  {item.label}
                </span>

                {/* ACTIVE ARROW */}
                {isActive && (
                  <ChevronRight
                    size={19}
                    strokeWidth={2.5}
                    className="shrink-0 text-egmf-primary"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// LOGO
function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-egmf-primary-soft p-1.5">
        <img
          src="/ic_launcher_512.png"
          alt="eGMF"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0">
        <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-slate-900">
          eGMF
        </h2>

        <p className="m-0 mt-0.5 text-xs font-medium text-slate-500">
          Production System
        </p>
      </div>
    </div>
  );
}

// NÚT ĐĂNG XUẤT
function LogoutButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex min-h-[52px] w-full items-center gap-3
        rounded-xl px-3 text-left
        text-[15px] font-semibold text-red-600
        transition-colors duration-200
        hover:bg-red-50
        active:bg-red-100
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-400
      "
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-100">
        <LogOut size={21} strokeWidth={2.1} />
      </span>

      <span className="flex-1">Đăng xuất</span>

      <ChevronRight size={19} className="text-red-400" />
    </button>
  );
}

// NỘI DUNG SIDEBAR
