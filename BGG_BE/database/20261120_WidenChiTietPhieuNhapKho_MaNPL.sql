/*
  Widen WH_ChiTietPhieuNhapKho.MaNPL from nvarchar(50) to nvarchar(250).

  Why: wh_PhieuNhapKho_TaoMoi copies WH_ChiTietPhieuGiamDinh.MaNPL (nvarchar(250))
  into WH_ChiTietPhieuNhapKho.MaNPL (nvarchar(50)). Confirming a phiếu giám định whose
  material code is longer than 50 characters fails with
  "String or binary data would be truncated" (e.g. PGD 112600369, CTPGDId 8759, 66 chars).
  On 2026-11-20: 847 detail lines / 126 phiếu have MaNPL > 50 (longest 236).

  Safe: widening a nullable nvarchar column is a metadata-only change; the column is
  not in any index and no schema-bound object references the table. Existing data is
  unchanged. Run once on database eGMF.
*/
SET XACT_ABORT ON;
BEGIN TRAN;

IF EXISTS (
  SELECT 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'dbo'
    AND TABLE_NAME = 'WH_ChiTietPhieuNhapKho'
    AND COLUMN_NAME = 'MaNPL'
    AND CHARACTER_MAXIMUM_LENGTH < 250
)
BEGIN
  ALTER TABLE dbo.WH_ChiTietPhieuNhapKho ALTER COLUMN MaNPL nvarchar(250) NULL;
END

COMMIT;

-- Rollback (only if no value longer than 50 has been stored since):
-- ALTER TABLE dbo.WH_ChiTietPhieuNhapKho ALTER COLUMN MaNPL nvarchar(50) NULL;
