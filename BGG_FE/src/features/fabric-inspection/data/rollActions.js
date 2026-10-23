import {
  CheckCheck,
  FilePenLine,
  ListChecks,
  Plus,
  Ruler,
  Trash2,
} from "lucide-react";

export const ROLL_ACTIONS = [
  { key: "add-defect", label: "Thêm lỗi", icon: Plus, tone: "primary" },
  { key: "measure", label: "Đo khổ", icon: Ruler },
  { key: "complete", label: "Xong cây", icon: CheckCheck, tone: "success" },
  { key: "update", label: "Ghi chú / Hướng Xử Lý", icon: FilePenLine },
  { key: "fabric-edge", label: "Loại biên", icon: ListChecks },
  { key: "delete", label: "Xóa", icon: Trash2, tone: "quiet" },
];

export const ACTION_STYLES = {
  default:
    "border-egmf-border bg-white text-egmf-ink-secondary hover:border-egmf-primary-border hover:bg-egmf-primary-hover-soft hover:text-egmf-primary",
  primary:
    "border-egmf-primary bg-egmf-primary text-white hover:bg-egmf-primary-strong",
  success:
    "border-egmf-success-soft bg-white text-egmf-success hover:border-egmf-success hover:bg-egmf-success-soft",
  quiet:
    "border-egmf-border bg-white text-egmf-muted hover:border-egmf-primary-border hover:bg-egmf-primary-hover-soft hover:text-egmf-primary",
};
