import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScanBarcode,
  Package,
  ArrowRight,
  ClipboardList,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import { Spin, Empty, Modal } from "antd";

import MainLayout from "../../../layouts/MainLayout/MainLayout";
import TextField from "../../../shared/components/ui/TextField";
import Button from "../../../shared/components/ui/Button";
import PickingMaterialCard from "../components/PickingMaterialCard";
import PickingMaterialModal from "../components/PickingMaterialModal";
import ConfirmPickingModal from "../components/ConfirmPickingModal";
import { getVatTuByRoAndPhieu } from "../api/pickingOrderAPI";

export default function PickingOrderMaterialList() {
  const location = useLocation();

  const [materialCode, setMaterialCode] = useState("");
  const [listSearch, setListSearch] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [keyword, setKeyWord] = useState("");

  const PhieuSoanHangId = Number(location.state?.PhieuSoanHangId);
  const MaRo = location.state?.MaRo;

  const fetchMaterials = useCallback(async () => {
    if (!PhieuSoanHangId || !MaRo) return;
    setLoading(true);

    try {
      const response = await getVatTuByRoAndPhieu(PhieuSoanHangId, MaRo);
      if (!response) {
        console.log("Không lấy đc dữ liệu");
        return;
      }
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách vật tư:", err);
    } finally {
      setLoading(false);
    }
  }, [PhieuSoanHangId, MaRo]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  //Seacrh rồi truyền vào modal
  const nplSearch = useMemo(
    () =>
      (materials ?? []).filter((item) =>
        String(item.MaCay ?? "")
          .toLowerCase()
          .includes((materialCode ?? "").trim().toLowerCase()),
      ),
    [materialCode, materials],
  );

  //Search bth
  const filteredMaterials = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return materials;

    return materials.filter((item) =>
      String(item.MaCay ?? "")
        .toLowerCase()
        .includes(search),
    );
  }, [keyword, materials]);

  return (
    <MainLayout screenTitle="Nguyên vật liệu xuất">
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* SEARCH CARD */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ScanBarcode size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Soạn nguyên vật liệu
                  </h1>
                  <p className="text-xs text-gray-500">
                    Mã rổ: <b>{MaRo || "—"}</b>
                  </p>
                </div>
              </div>

              {/* NÚT XÁC NHẬN XUẤT KHO TRỰC TIẾP */}
              {PhieuSoanHangId > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                >
                  <ShieldCheck size={18} />
                  <span>Xác nhận xuất kho</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <TextField
                value={materialCode}
                onChange={(e) => setMaterialCode(e.target.value)}
                placeholder="Nhập hoặc quét mã vạch cây vải..."
                size="large"
                allowClear
                autoFocus
                onPressEnter={() => {
                  if (materialCode?.trim()) {
                    setOpen(true);
                  }
                }}
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
            <div className=" border-b border-gray-100 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3 justify-between mb-4">
                <div className="flex items-center">
                  <ClipboardList size={23} className="text-egmf-primary" />

                  <h2 className="text-lg font-bold text-gray-900 ml-2">
                    Danh sách nguyên vật liệu
                  </h2>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                  {filteredMaterials.length}
                </span>
              </div>
              <div className="relative w-full">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyWord(e.target.value)}
                  placeholder="Lọc danh sách vật tư..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* LIST CONTENT */}
            <div className="p-4 sm:p-5">
              {filteredMaterials.length === 0 ? (
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
                      {filteredMaterials.map((item, index) => (
                        <PickingMaterialCard
                          key={`${item.MaCay}-${item.TenNPL}-${index}`}
                          item={item}
                          index={index}
                          PhieuSoanHangId={PhieuSoanHangId}
                          onReload={fetchMaterials}
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

      {/* Modal soạn cây */}
      <PickingMaterialModal
        open={open}
        onClose={() => setOpen(false)}
        nplSearch={nplSearch}
        phieuSoanHangId={PhieuSoanHangId}
        onReload={fetchMaterials}
      />

      {/* Modal xác nhận xuất kho */}
      <ConfirmPickingModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        phieuSoanHangId={PhieuSoanHangId}
        onSuccess={() => {
          fetchMaterials();
        }}
      />
    </MainLayout>
  );
}
