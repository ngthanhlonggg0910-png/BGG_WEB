import {
  MapPinCheck,
  ClipboardList,
  Warehouse,
  ScanSearch,
  Factory,
  Scissors,
  Shirt,
  FileSpreadsheet,
  QrCode,
} from "lucide-react";

export const menuGroups = [
  {
    key: "material-input",
    title: "Sản xuất - Nguyên liệu & Đầu vào",
    items: [
      {
        key: "update-material-location",
        title: "Cập nhật vị trí NL",
        path: "/material-location-update",
        icon: MapPinCheck,
      },
      {
        key: "warehouse",
        title: "Kho",
        path: "/warehouse",
        icon: Warehouse,
      },
      {
        key: "mapping-qr",
        title: "Mapping QR",
        path: "/mapping-qr-option",
        icon: QrCode,
      },
    ],
  },
  {
    key: "main-process",
    title: "Sản xuất - Quy trình chính",
    items: [
      {
        key: "production-order-material",
        title: "Đặt hàng vật tư LSX",
        path: "/production-orders",
        icon: Factory,
      },
      {
        key: "material-orders-list-cat",
        title: "Đơn đặt Kho Vải (Cắt)",
        path: "/production-orders?tab=ddh&type=NguyenLieu",
        icon: Scissors,
      },
      {
        key: "material-orders-list-may",
        title: "Đơn đặt Kho Phụ Liệu (May)",
        path: "/production-orders?tab=ddh&type=PhuLieu",
        icon: Shirt,
      },
      {
        key: "soanhang",
        title: "Danh sách soạn hàng",
        path: "/picking-orders",
        icon: ClipboardList,
      },
    ],
  },
  {
    key: "quality-control",
    title: "Quản lý chất lượng",
    items: [
      {
        key: "fabric-inspection",
        title: "Kiểm vải",
        path: "/fabric-inspection",
        icon: ScanSearch,
      },
    ],
  },
];
