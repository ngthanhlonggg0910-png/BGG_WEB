/*
  Add cancel audit columns to OMM_DonDatHang_LSX: who cancelled an LSX material order and when.

  Why: cancelling an order only set TrangThai = 'DaHuy'; the account that cancelled it was
  not stored anywhere. The web API now writes NguoiHuy / TKIdHuy / NgayHuy (taken from the
  login token). Until this script runs, the API skips those columns, so cancelling still works.

  Safe: adds three nullable columns; existing rows and the desktop app are unaffected.
  Run once on database eGMF.
*/
SET XACT_ABORT ON;
BEGIN TRAN;

IF COL_LENGTH('dbo.OMM_DonDatHang_LSX', 'NguoiHuy') IS NULL
  ALTER TABLE dbo.OMM_DonDatHang_LSX ADD NguoiHuy nvarchar(150) NULL;

IF COL_LENGTH('dbo.OMM_DonDatHang_LSX', 'TKIdHuy') IS NULL
  ALTER TABLE dbo.OMM_DonDatHang_LSX ADD TKIdHuy bigint NULL;

IF COL_LENGTH('dbo.OMM_DonDatHang_LSX', 'NgayHuy') IS NULL
  ALTER TABLE dbo.OMM_DonDatHang_LSX ADD NgayHuy datetime NULL;

COMMIT;

-- Rollback:
-- ALTER TABLE dbo.OMM_DonDatHang_LSX DROP COLUMN NguoiHuy, TKIdHuy, NgayHuy;
