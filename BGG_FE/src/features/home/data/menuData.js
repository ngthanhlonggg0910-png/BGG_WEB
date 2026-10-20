import {
  MapPinCheck,
  ClipboardList,
  Warehouse,
  ScanSearch,
} from "lucide-react";

export const menuGroups = [
  {
    key: "material-input",
    title: "Sản xuất - Nguyên liệu & Đầu vào",
    items: [
      {
        key: "update-material-location",
        title: "Cập nhật vị trí NL",
        icon: MapPinCheck,
      },
      { key: "warehouse", title: "Kho", icon: Warehouse },
    ],
  },
  {
    key: "main-process",
    title: "Sản xuất - Quy trình chính",
    items: [
      {
        key: "soanhang",
        title: "Danh sách soạn hàng",
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
        icon: ScanSearch,
      },
    ],
  },
];
