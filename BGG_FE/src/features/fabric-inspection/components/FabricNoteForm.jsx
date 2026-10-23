import { useState } from "react";

export default function FabricNoteForm({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Ghi chú
        </label>
        <input
          type="text"
          name="GhiChu"
          value={formData?.GhiChu || ""}
          onChange={handleChange}
          placeholder="Nhập ghi chú..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#6865D9] focus:ring-2 focus:ring-[#6865D9]/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Hướng xử lý
        </label>
        <input
          type="text"
          name="HuongXuLy"
          value={formData?.HuongXuLy || ""}
          onChange={handleChange}
          placeholder="Nhập hướng xử lý..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#6865D9] focus:ring-2 focus:ring-[#6865D9]/20"
        />
      </div>
    </form>
  );
}
