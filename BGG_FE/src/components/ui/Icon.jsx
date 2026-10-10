import { cn } from "./utils";
import {
  ArrowLeft,
  ArrowUpRight,
  Barcode,
  Boxes,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  Grid2X2,
  List,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Package,
  ScanBarcode,
  Search,
  Settings,
  User,
  UserRound,
  Warehouse,
  X,
  Clock3,
} from "lucide-react";

const icons = {
  arrowLeft: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  barcode: Barcode,
  boxes: Boxes,
  calendar: CalendarDays,
  camera: Camera,
  check: Check,
  chevronDown: ChevronDown,
  "chevron-right": ChevronRight,
  clock: Clock3,
  close: X,
  database: Database,
  grid: Grid2X2,
  list: List,
  lock: LockKeyhole,
  login: LogIn,
  logout: LogOut,
  mapPin: MapPin,
  menu: Menu,
  package: Package,
  scanBarcode: ScanBarcode,
  search: Search,
  settings: Settings,
  user: User,
  userRound: UserRound,
  warehouse: Warehouse,
};

function Icon({ name, className, size = 20, ...props }) {
  const IconComponent = icons[name] || CircleHelp;

  return (
    <IconComponent
      aria-hidden="true"
      className={cn("shrink-0", className)}
      size={size}
      strokeWidth={1.9}
      {...props}
    />
  );
}

export default Icon;
