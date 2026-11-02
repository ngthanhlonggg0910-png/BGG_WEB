-- Convert only pending GUID-format labels on receipt 112600010 to GNA+yyMM+00000.
-- Mapped labels, inspected rolls and deleted labels are unchanged.
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRAN;
 IF NOT EXISTS(SELECT 1 FROM dbo.WH_PhieuGiamDinh WITH(UPDLOCK,HOLDLOCK) WHERE PGDId=439 AND MaPhieu=N'112600010')
  THROW 50121,N'Không tìm thấy đúng phiếu cần đổi tem.',1;
 DECLARE @Pending TABLE(OldQr nvarchar(50) PRIMARY KEY);
 INSERT @Pending SELECT Qr FROM dbo.WH_InspectionRollQr WITH(UPDLOCK,HOLDLOCK)
 WHERE CTPGDId=5745 AND CayId IS NULL AND IsDeleted=0 AND LEN(Qr)=35 AND LEFT(Qr,3)=N'GNA';
 DECLARE @Changes TABLE(OldQr nvarchar(50),NewQr nvarchar(50));
 WHILE EXISTS(SELECT 1 FROM @Pending)
 BEGIN
  DECLARE @Old nvarchar(50),@New nvarchar(50);
  SELECT TOP(1) @Old=OldQr FROM @Pending ORDER BY OldQr;
  EXEC dbo.WH_InspectionRollQr_NextCode @New OUTPUT;
  UPDATE dbo.WH_InspectionRollQr SET Qr=@New OUTPUT deleted.Qr,inserted.Qr INTO @Changes
  WHERE Qr=@Old AND CayId IS NULL AND IsDeleted=0 AND CTPGDId=5745;
  DELETE @Pending WHERE OldQr=@Old;
 END;
 INSERT dbo.Lib_NguyenPhuLieu_Gia_FOB_Log(IdChiTiet,VTId,ChungTuId,NoiDungThayDoi,NgayThayDoi,NguoiThayDoi,DiaChiMac)
 SELECT 0,g.VTId,g.idChungTuFOB,N'Đổi tem Mapping QR chưa sử dụng sang GNA số: '+c.OldQr+N' -> '+c.NewQr,GETDATE(),N'Codex - theo yêu cầu giữ cấu trúc số',N'HiGarment'
 FROM @Changes c CROSS JOIN dbo.WH_ChiTietPhieuGiamDinh g WHERE g.CTPGDId=5745;
 COMMIT;
 SELECT * FROM @Changes ORDER BY NewQr;
END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
