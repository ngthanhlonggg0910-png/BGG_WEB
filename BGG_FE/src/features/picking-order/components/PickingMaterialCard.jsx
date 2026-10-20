import React from "react";
import Barcode from "react-barcode";
import { formatDateTime } from "../../../shared/utils/formatDateTime";

export default function PickingMaterialCard({ item, index, onClick }) {
  if (!item) return null;

  const fields = [
    { label: "Mã cây", value: item.MaCay },
    { label: "Mã hàng PO", value: item.MaHangPO },
    { label: "Tên NPL", value: item.TenNPL },
    { label: "Lot", value: item.Lot },
    { label: "Fa", value: item.FA },
    { label: "SLBD", value: item.SLBD ?? item.quantity },
    { label: "NgayNhapKho", value: formatDateTime(item.NgayNhapKho) },
  ];

  return (
    <div
      className="
        w-full overflow-hidden
        rounded-xl border border-gray-300
        bg-white p-4
        shadow-sm
        transition-all duration-200
        hover:border-egmf-primary/40
        hover:shadow-md
      "
    >
      {/* BARCODE */}
      <div className="mb-4 flex items-center justify-center">
        {item.MaCay ? (
          <Barcode
            value={String(item.MaCay)}
            format="CODE128"
            width={2}
            height={65}
            fontSize={16}
            displayValue={true}
            margin={5}
            background="#ffffff"
            lineColor="#000000"
          />
        ) : (
          <div className="flex h-20 w-full items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            Không có mã cây
          </div>
        )}
      </div>

      {/* THÔNG TIN VẬT TƯ */}
      <div className="space-y-1">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-start gap-2 text-base leading-6"
          >
            <span className="shrink-0 font-semibold text-gray-700">
              {field.label}:
            </span>

            <span className="min-w-0 break-words font-bold text-gray-950">
              {field.value ?? ""}
            </span>
          </div>
        ))}
      </div>

      {/* TRẠNG THÁI */}
      {typeof item.completed === "boolean" && (
        <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              item.completed
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {item.completed ? "Đã xuất" : "Chưa xuất"}
          </span>
        </div>
      )}
    </div>
  );
}
