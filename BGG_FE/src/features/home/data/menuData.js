import {
  MapPinCheck,
  ClipboardList,
  Warehouse,
  ScanSearch,
  Factory,
  Scissors,
  Shirt,
  QrCode,
  ClipboardCheck,
} from "lucide-react";

export const menuGroups = [
  {
    key: "material-input",
    title: "Sản xuất - Nguyên liệu & Đầu vào",
    icon: Warehouse,
    items: [
      {
        key: "update-material-location",
        title: "Cập nhật vị trí NL",
        path: "/material-location-update",
        icon: MapPinCheck,
        iconTheme: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
      },
      {
        key: "warehouse",
        title: "Kho",
        path: "/warehouse",
        icon: Warehouse,
        iconTheme: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
      },
      {
        key: "mapping-qr",
        title: "Mapping QR",
        path: "/mapping-qr-option",
        icon: QrCode,
        iconTheme: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
      },
    ],
  },
  {
    key: "main-process",
    title: "Sản xuất - Quy trình chính",
    icon: Factory,
    items: [
      {
        key: "production-order-material",
        title: "Đặt hàng vật tư LSX",
        path: "/production-orders",
        icon: Factory,
        iconTheme: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
      },
      {
        key: "material-orders-list-cat",
        title: "Đơn đặt Kho Vải (Cắt)",
        path: "/production-orders?tab=ddh&type=NguyenLieu",
        icon: Scissors,
        iconTheme: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
      },
      {
        key: "material-orders-list-may",
        title: "Đơn đặt Kho Phụ Liệu (May)",
        path: "/production-orders?tab=ddh&type=PhuLieu",
        icon: Shirt,
        iconTheme: "bg-fuchsia-50 text-fuchsia-600 group-hover:bg-fuchsia-100",
      },
      {
        key: "soanhang",
        title: "Danh sách soạn hàng",
        path: "/picking-orders",
        icon: ClipboardList,
        iconTheme: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
      },
    ],
  },
  {
    key: "quality-control",
    title: "Quản lý chất lượng",
    icon: ScanSearch,
    items: [
      {
        key: "fabric-inspection",
        title: "Kiểm vải",
        path: "/fabric-inspection",
        icon: ScanSearch,
        iconTheme: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
      },
      {
        key: "accessory-inspection",
        title: "Kiểm phụ liệu",
        path: "/accessory-inspection",
        icon: ClipboardCheck,
        iconTheme: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
      },
    ],
  },
];
