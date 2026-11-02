-- One-time correction: only the five un-mapped paper labels of receipt 112600010.
-- Existing inspected NAH stock rolls are never updated.
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRAN;
 DECLARE @Receipt bigint;
 SELECT @Receipt=PGDId FROM dbo.WH_PhieuGiamDinh WITH(UPDLOCK,HOLDLOCK) WHERE PGDId=439 AND MaPhieu=N'112600010';
 IF @Receipt IS NULL THROW 50121,N'Không tìm thấy đúng phiếu cần đổi tem.',1;
 DECLARE @Changes TABLE(OldQr nvarchar(50),NewQr nvarchar(50));
 DECLARE @Count int;
 SELECT @Count=COUNT(*) FROM dbo.WH_InspectionRollQr WITH(UPDLOCK,HOLDLOCK)
 WHERE Qr IN(N'NAH261100705',N'NAH261100706',N'NAH261100707',N'NAH261100708',N'NAH261100709');
 IF @Count NOT IN(0,5) THROW 50121,N'Danh sách tem đã thay đổi, dừng chuyển mã.',1;
 IF EXISTS(SELECT 1 FROM dbo.WH_InspectionRollQr WHERE Qr IN(N'NAH261100705',N'NAH261100706',N'NAH261100707',N'NAH261100708',N'NAH261100709') AND (CTPGDId<>5745 OR CayId IS NOT NULL OR IsDeleted=1))
  THROW 50121,N'Có tem đã mapping/xóa hoặc sai vật tư, dừng chuyển mã.',1;
 UPDATE dbo.WH_InspectionRollQr SET Qr=N'GNA'+REPLACE(CONVERT(nvarchar(36),NEWID()),N'-',N'')
 OUTPUT deleted.Qr,inserted.Qr INTO @Changes
 WHERE Qr IN(N'NAH261100705',N'NAH261100706',N'NAH261100707',N'NAH261100708',N'NAH261100709') AND CTPGDId=5745 AND CayId IS NULL AND IsDeleted=0;
 INSERT dbo.Lib_NguyenPhuLieu_Gia_FOB_Log(IdChiTiet,VTId,ChungTuId,NoiDungThayDoi,NgayThayDoi,NguoiThayDoi,DiaChiMac)
 SELECT 0,g.VTId,g.idChungTuFOB,N'Đổi tem Mapping QR chưa sử dụng: '+c.OldQr+N' -> '+c.NewQr,GETDATE(),N'Codex - theo yêu cầu chuyển GNA',N'HiGarment'
 FROM @Changes c CROSS JOIN dbo.WH_ChiTietPhieuGiamDinh g WHERE g.CTPGDId=5745;
 COMMIT;
 SELECT * FROM @Changes ORDER BY OldQr;
END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
