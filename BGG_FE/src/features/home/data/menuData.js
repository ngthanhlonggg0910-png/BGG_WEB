import {
  MapPinCheck,
  ClipboardList,
  Warehouse,
  ScanSearch,
  Factory,
  FileSpreadsheet,
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
        key: "material-orders-list",
        title: "Đơn đặt hàng & Tạo phiếu soạn",
        path: "/production-orders?tab=ddh",
        icon: FileSpreadsheet,
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
