import React from "react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { useLocation, useParams } from "react-router-dom";
import ScannedRollsManagerSection from "../components/ScannedRollsManagerSection";

export default function MappingQrMaterialDetailPage({ onScan }) {
  const location = useLocation();
  const { ctpgdId } = useParams();

  return (
    <MainLayout screenTitle="Chi tiết vật tư">
      <main className="min-h-full bg-egmf-surface px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-5">
          <ScannedRollsManagerSection
            ctpgdId={ctpgdId}
            item={location?.state?.item}
            showMaterialHeader={true}
            sectionTitle="Danh sách tem / cây trong thùng"
            onScan={onScan}
          />
        </div>
      </main>
    </MainLayout>
  );
}
