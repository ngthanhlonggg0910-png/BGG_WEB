import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScanBarcode, Package, ArrowRight, ClipboardList } from "lucide-react";

import { useLocation } from "react-router-dom";
import { Spin, Empty, Modal } from "antd";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import TextField from "../../../shared/components/ui/TextField";
import Button from "../../../shared/components/ui/Button";
import PickingMaterialCard from "../components/PickingMaterialCard";
import PickingMaterialModal from "../components/PickingMaterialModal";
import { getVatTuByRoAndPhieu } from "../api/pickingOrderAPI";

export default function PickingOrderMaterialList() {
  const location = useLocation();

  const [materialCode, setMaterialCode] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const PhieuSoanHangId = Number(location.state?.PhieuSoanHangId);
  const MaRo = location.state?.MaRo;

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    if (!PhieuSoanHangId || !MaRo) return;

    try {
      const response = await getVatTuByRoAndPhieu(PhieuSoanHangId, MaRo);
      if (!response) {
        console.log("Không lấy đc dữ liệu");
        return;
      }
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách vật tư:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [PhieuSoanHangId, MaRo]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const nplSearch = useMemo(
    () =>
      (materials ?? []).filter((item) =>
        String(item.MaCay ?? "")
          .toLowerCase()
          .includes((materialCode ?? "").trim().toLowerCase()),
      ),
    [materialCode, materials],
  );

  return (
    <MainLayout screenTitle="Nguyên vật liệu xuất">
      <div className="min-h-full bg-gray-50 p-3 sm:p-5">
        <div className="mx-auto w-full max-w-5xl space-y-5">
          {/* SCAN INPUT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <ScanBarcode size={23} className="text-egmf-primary" />

              <h2 className="text-lg font-bold text-gray-900">
                Quét mã vật tư
              </h2>
            </div>

            {/* Ô nhập mã cây */}
            <div className="min-w-0 flex-1">
              <TextField
                type="text"
                placeholder="Nhập hoặc quét mã cây..."
                value={materialCode}
                onChange={(e) => setMaterialCode(e.target.value)}
                className="!w-full mb-3"
              />
            </div>

            {/* Nút tiếp tục */}
            <Button
              type="primary"
              size="large"
              disabled={!materialCode?.trim()}
              onClick={() => setOpen(true)}
              className="
                    !flex !h-[56px] !w-full
                    !items-center !justify-center !gap-3
                    !rounded-xl !border-none
                    !bg-blue-600 !px-6
                    !text-lg !font-bold !text-white
                    !shadow-md
                    transition-all duration-200
                    hover:!bg-blue-700
                    active:!scale-[0.98]
                    disabled:!bg-gray-300
                    disabled:!text-gray-500
                    sm:!w-auto sm:!min-w-[160px]
                "
            >
              <span>Tiếp tục</span>
              <ArrowRight size={23} strokeWidth={2.5} />
            </Button>

            <p className="mt-3 text-sm font-medium text-gray-500">
              Sử dụng máy quét mã vạch hoặc nhập mã vật tư để tìm kiếm.
            </p>
          </div>

          {/* MATERIAL LIST */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* LIST HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <ClipboardList size={23} className="text-egmf-primary" />

                <h2 className="text-lg font-bold text-gray-900">
                  Danh sách nguyên vật liệu
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                {materials.length}
              </span>
            </div>

            {/* LIST CONTENT */}
            <div className="p-4 sm:p-5">
              {materials.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Package size={32} className="text-gray-400" />
                  </div>

                  <h3 className="text-base font-bold text-gray-800">
                    {materialCode.trim()
                      ? "Không tìm thấy vật tư"
                      : "Chưa có dữ liệu vật tư"}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                    {materialCode.trim()
                      ? "Không có vật tư phù hợp với mã đang tìm kiếm."
                      : "Danh sách vật tư sẽ hiển thị tại đây sau khi tải dữ liệu."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loading ? (
                    // ĐANG TẢI DỮ LIỆU
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 px-4">
                      <Spin size="large" />

                      <p className="text-center text-base font-medium text-gray-500">
                        Đang tải danh sách vật tư...
                      </p>
                    </div>
                  ) : materials.length === 0 ? (
                    // KHÔNG CÓ DỮ LIỆU
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Package size={32} className="text-gray-400" />
                      </div>

                      <h3 className="text-base font-bold text-gray-800">
                        {materialCode.trim()
                          ? "Không tìm thấy vật tư"
                          : "Chưa có dữ liệu vật tư"}
                      </h3>

                      <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                        {materialCode.trim()
                          ? "Không có vật tư phù hợp với mã đang tìm kiếm."
                          : "Danh sách vật tư sẽ hiển thị tại đây sau khi tải dữ liệu."}
                      </p>
                    </div>
                  ) : (
                    // CÓ DỮ LIỆU
                    <div className="space-y-3">
                      {materials.map((item, index) => (
                        <PickingMaterialCard
                          key={item.Id ?? item.MaCay ?? index}
                          item={item}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <PickingMaterialModal
        open={open}
        onClose={() => setOpen(false)}
        nplSearch={nplSearch}
        phieuSoanHangId={PhieuSoanHangId}
        onConfirm={fetchMaterials}
      />
    </MainLayout>
  );
}
