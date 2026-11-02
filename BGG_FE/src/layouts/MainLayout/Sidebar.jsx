import {
  ChevronDown,
  ChevronRight,
  Download,
  Factory,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  Smartphone,
  UserRound,
  Warehouse,
} from "lucide-react";

import { cn } from "../../shared/components/ui/utils";
import { useState } from "react";
import { menuGroups } from "../../features/home/data/menuData";

const groupThemes = [
  {
    icon: "bg-egmf-primary-soft text-egmf-primary",
    activeIcon: "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/25",
    active: "bg-blue-50/90 text-slate-900 ring-1 ring-blue-100",
    marker: "bg-egmf-primary",
    child: "bg-egmf-primary",
  },
  {
    icon: "bg-egmf-primary-soft text-egmf-primary",
    activeIcon: "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/25",
    active: "bg-blue-50/90 text-slate-900 ring-1 ring-blue-100",
    marker: "bg-egmf-primary",
    child: "bg-egmf-primary",
  },
  {
    icon: "bg-egmf-primary-soft text-egmf-primary",
    activeIcon: "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/25",
    active: "bg-blue-50/90 text-slate-900 ring-1 ring-blue-100",
    marker: "bg-egmf-primary",
    child: "bg-egmf-primary",
  },
];

const _sidebarItems = [
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

export default function Sidebar({ selectedKey, onSelect, onInstallApp }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_12%_-5%,rgba(96,165,250,.18),transparent_28%),#ffffff]">
      <Brand />
      <TreeNavigation selectedKey={selectedKey} onSelect={onSelect} />

      <div className="mt-auto mb-[max(4.5rem,calc(env(safe-area-inset-bottom)+1rem))] shrink-0 border-t border-slate-100 bg-white/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm md:mb-0">
        {/* Lời gọi cài PWA gọn để ưu tiên không gian cho menu. */}
        {onInstallApp && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50/60 p-2 shadow-sm">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
              <Smartphone size={18} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-bold text-slate-800">
                Cài đặt ứng dụng
              </strong>
              <span className="block truncate text-[11px] text-slate-500">
                Truy cập nhanh hơn
              </span>
            </div>
            <button
              type="button"
              onClick={onInstallApp}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 text-[11px] font-bold text-egmf-primary shadow-sm transition hover:border-egmf-primary hover:bg-egmf-primary-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary/25"
              aria-label="Cài đặt ứng dụng"
            >
              <span>Cài</span>
              <Download size={14} strokeWidth={2.4} />
            </button>
          </div>
        )}

        <LogoutButton onClick={() => onSelect("Đăng xuất")} />

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <ShieldCheck size={13} />
          <span>BGG Kho · v1.0</span>
        </div>
      </div>
    </div>
  );
}

// MENU DESKTOP / DRAWER
function _Navigation({ selectedKey, onSelect }) {
  return (
    <nav aria-label="Điều hướng chính" className="flex-1 px-3 py-5">
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        MENU CHỨC NĂNG
      </p>

      <ul className="m-0 space-y-1.5 p-0">
        {_sidebarItems.map((item) => {
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

function TreeNavigation({ selectedKey, onSelect }) {
  const [groupOpen, setGroupOpen] = useState({});

  return (
    <nav aria-label="Điều hướng chính" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4 [scrollbar-width:thin]">
      <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        MENU CHỨC NĂNG
      </p>

      <button
        type="button"
        onClick={() => onSelect("workspace")}
        aria-current={selectedKey === "workspace" ? "page" : undefined}
        className={cn(
          "group mb-2.5 flex min-h-[50px] w-full items-center gap-3 rounded-2xl px-3 text-left shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary",
          selectedKey === "workspace"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25"
            : "border border-transparent bg-white/60 text-slate-600 hover:border-blue-100 hover:bg-blue-50/70 hover:text-egmf-primary-strong",
        )}
      >
        <span className={cn("grid size-9 place-items-center rounded-xl transition-transform group-hover:scale-105", selectedKey === "workspace" ? "bg-white/20 text-white" : "bg-egmf-primary-soft text-egmf-primary")}>
          <LayoutGrid size={19} strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-[15px] font-bold">Trang chủ</span>
      </button>

      <ul className="m-0 space-y-1.5 p-0">
        {menuGroups.map((group, groupIndex) => {
          const GroupIcon = group.items[0]?.icon ?? LayoutGrid;
          const isGroupActive = group.items.some((item) => item.key === selectedKey);
          const isOpen = groupOpen[group.key] ?? isGroupActive;
          const panelId = `sidebar-group-${group.key}`;
          const theme = groupThemes[groupIndex % groupThemes.length];

          return (
            <li key={group.key} className="list-none">
              <button
                type="button"
                onClick={() => setGroupOpen((current) => ({ ...current, [group.key]: !isOpen }))}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={cn(
                  "group relative flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary",
                  isGroupActive ? theme.active : "text-slate-600 hover:bg-white hover:shadow-sm",
                )}
              >
                {isGroupActive && <span className={cn("absolute bottom-3 left-0 top-3 w-1 rounded-r-full", theme.marker)} />}
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl shadow-sm transition-transform group-hover:scale-105", isGroupActive ? theme.activeIcon : theme.icon)}>
                  <GroupIcon size={19} strokeWidth={2.1} />
                </span>
                <span className="min-w-0 flex-1 text-[14px] font-bold leading-5">{group.title}</span>
                <ChevronDown size={18} className={cn("shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180", isGroupActive && "text-slate-500")} />
              </button>

              {isOpen && (
                <ul id={panelId} className="relative ml-[29px] mt-1.5 space-y-1 border-l border-slate-200/90 px-0 pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = selectedKey === item.key;

                    return (
                      <li key={item.key} className="list-none">
                        <button
                          type="button"
                          onClick={() => onSelect(item.path)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "group flex min-h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-[14px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary",
                            isActive ? "bg-white font-bold text-slate-900 shadow-sm ring-1 ring-slate-100" : "font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900",
                          )}
                        >
                          <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg transition-colors", isActive ? `${theme.child} text-white` : "bg-slate-100 text-slate-500 group-hover:bg-slate-200")}><ItemIcon size={14} strokeWidth={isActive ? 2.5 : 2} /></span>
                          <span className="min-w-0 flex-1 leading-5">{item.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="my-3 border-t border-slate-100" />
      <button
        type="button"
        onClick={() => onSelect("Thông tin")}
        aria-current={selectedKey === "Thông tin" ? "page" : undefined}
        className={cn(
          "group flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-egmf-primary",
          selectedKey === "Thông tin" ? "bg-blue-50 text-egmf-primary-strong shadow-sm ring-1 ring-blue-100" : "text-slate-600 hover:bg-white hover:shadow-sm",
        )}
      >
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20"><UserRound size={18} strokeWidth={2.1} /></span>
        <span className="flex-1 text-[14px] font-bold">Thông tin tài khoản</span>
      </button>
    </nav>
  );
}

// LOGO
function Brand() {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-egmf-primary-soft p-1.5">
        <img
          src="/ic_launcher_512.png"
          alt="BGG Kho"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0">
        <h2 className="m-0 text-xl font-extrabold tracking-tight text-slate-900">
          BGG Kho
        </h2>

        <p className="m-0 mt-0.5 text-xs font-medium text-slate-500">
          Quản lý Kho & Sản xuất
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
        group flex min-h-11 w-full items-center gap-3
        rounded-xl px-2.5 text-left
        text-sm font-semibold text-red-600
        transition-colors duration-200
        hover:bg-red-50 hover:shadow-sm
        active:bg-red-100
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-400
      "
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-50 to-rose-100 text-red-600 transition-transform group-hover:scale-105">
        <LogOut size={19} strokeWidth={2.1} />
      </span>

      <span className="flex-1">Đăng xuất</span>

      <ChevronRight size={18} className="text-red-400" />
    </button>
  );
}
