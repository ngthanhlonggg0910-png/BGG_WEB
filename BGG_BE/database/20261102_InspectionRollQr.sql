-- Pending NL labels are separate from stock/inspection rolls. Reprinting never allocates a new code.
SET XACT_ABORT ON;
BEGIN TRAN;
IF OBJECT_ID(N'dbo.WH_InspectionRollQr',N'U') IS NULL
BEGIN
 CREATE TABLE dbo.WH_InspectionRollQr(
  Qr nvarchar(50) NOT NULL CONSTRAINT PK_InspectionRollQr PRIMARY KEY,
  CTPGDId bigint NOT NULL CONSTRAINT FK_InspectionRollQr_Detail REFERENCES dbo.WH_ChiTietPhieuGiamDinh(CTPGDId),
  CayId bigint NULL CONSTRAINT FK_InspectionRollQr_Roll REFERENCES dbo.WH_ChiTietPhieuGiamDinh_Cay(CayId),
  CreatedAt datetime NOT NULL CONSTRAINT DF_InspectionRollQr_Date DEFAULT(GETDATE()),
  CreatedBy nvarchar(500) NOT NULL,
  AccountId bigint NOT NULL,
  MappedAt datetime NULL,
  MappedBy nvarchar(500) NULL
 );
 CREATE INDEX IX_InspectionRollQr_Detail ON dbo.WH_InspectionRollQr(CTPGDId,CreatedAt);
 CREATE UNIQUE INDEX UX_InspectionRollQr_Roll ON dbo.WH_InspectionRollQr(CayId) WHERE CayId IS NOT NULL;
END;
IF COL_LENGTH('dbo.WH_InspectionRollQr','IsDeleted') IS NULL
 EXEC(N'ALTER TABLE dbo.WH_InspectionRollQr ADD IsDeleted bit NOT NULL CONSTRAINT DF_InspectionRollQr_Deleted DEFAULT(0), DeletedAt datetime NULL, DeletedBy nvarchar(500) NULL;');
COMMIT;
GO
-- Mapping QR uses GNA identities and does not alter the legacy NAH allocator.
CREATE OR ALTER PROCEDURE dbo.WH_InspectionRollQr_NextCode @Code nvarchar(50) OUTPUT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Own bit=0;
 IF @@TRANCOUNT=0 BEGIN BEGIN TRAN; SET @Own=1; END;
 BEGIN TRY
  DECLARE @Lock int;
  EXEC @Lock=sys.sp_getapplock @Resource=N'WH_InspectionRollQr_GNA',@LockMode=N'Exclusive',@LockOwner=N'Transaction',@LockTimeout=15000;
  IF @Lock<0 THROW 50109,N'Đang cấp mã GNA. Vui lòng thử lại.',1;
  DECLARE @Prefix nvarchar(7)=N'GNA'+FORMAT(GETDATE(),'yyMM'),@Next bigint;
  SELECT @Next=ISNULL(MAX(N),0)+1 FROM (
   SELECT TRY_CONVERT(bigint,RIGHT(Qr,5)) N FROM dbo.WH_InspectionRollQr WITH(READUNCOMMITTED) WHERE LEN(Qr)=12 AND LEFT(Qr,7)=@Prefix
   UNION ALL
   SELECT TRY_CONVERT(bigint,RIGHT(MaCay,5)) FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WITH(READUNCOMMITTED) WHERE LEN(MaCay)=12 AND LEFT(MaCay,7)=@Prefix
  ) used;
  IF @Next>99999 THROW 50110,N'Đã hết dải mã GNA trong tháng.',1;
  SET @Code=@Prefix+RIGHT(N'00000'+CONVERT(nvarchar(10),@Next),5);
  IF @Own=1 COMMIT;
 END TRY BEGIN CATCH IF @Own=1 AND @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;
GO
CREATE OR ALTER VIEW dbo.WH_InspectionRollQr_Info AS
 SELECT q.Qr,q.CTPGDId,g.PGDId,p.MaPhieu,n.Item,n.MatVatTuGhep AS MaNPL,n.DienGiai AS TenVatTu,
 n.MaChungLoai,n.MaMau,n.CodeMauVai,n.Size,n.QuyCach,n.KhoVatTu,n.DVT,g.ChungTu,g.Lot,p.Lo AS LoPhieu,
 p.TrangThai AS TrangThaiPhieu,q.CayId,COALESCE(r.MaCay,CASE WHEN q.Qr LIKE N'GNA%' THEN q.Qr END) AS MaCay,r.SL AS Quantity,r.SoRoll,r.SoYard,r.SoMet,
 q.CreatedAt,q.CreatedBy,q.MappedAt,q.MappedBy,
 CASE WHEN q.CayId IS NULL THEN N'Chờ nhập thông tin cây' ELSE N'Đã mapping' END AS TrangThai
 FROM dbo.WH_InspectionRollQr q
 JOIN dbo.WH_ChiTietPhieuGiamDinh g ON g.CTPGDId=q.CTPGDId
 JOIN dbo.WH_PhieuGiamDinh p ON p.PGDId=g.PGDId
 JOIN dbo.Lib_NguyenPhuLieu n ON n.VTId=g.VTId
 LEFT JOIN dbo.WH_ChiTietPhieuGiamDinh_Cay r ON r.CayId=q.CayId
 WHERE q.IsDeleted=0;
GO
CREATE OR ALTER PROCEDURE dbo.WH_InspectionRollQr_Create
 @CTPGDId bigint,@Count int,@AccountId bigint,@User nvarchar(500)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Count IS NULL OR @Count<1 OR @Count>1000 THROW 50100,N'Số tem phải từ 1 đến 1000.',1;
 IF ISNULL(@AccountId,0)<=0 THROW 50101,N'Thiếu tài khoản tạo tem.',1;
 BEGIN TRY
  BEGIN TRAN;
  DECLARE @PGDId bigint;
  SELECT @PGDId=PGDId FROM dbo.WH_ChiTietPhieuGiamDinh WHERE CTPGDId=@CTPGDId;
  IF NOT EXISTS(SELECT 1 FROM dbo.WH_PhieuGiamDinh p WITH(UPDLOCK,HOLDLOCK)
   WHERE p.PGDId=@PGDId AND p.LoaiGiamDinh=N'nl' AND ISNULL(p.TrangThai,N'') NOT IN(N'HUY',N'DAXACNHAN'))
   THROW 50102,N'Chỉ tạo tem cho phiếu nguyên liệu chưa hủy/xác nhận.',1;
  DECLARE @New TABLE(Qr nvarchar(50));
  WHILE @Count>0
  BEGIN
   DECLARE @Qr nvarchar(50);
   EXEC dbo.WH_InspectionRollQr_NextCode @Qr OUTPUT;
   INSERT dbo.WH_InspectionRollQr(Qr,CTPGDId,CreatedBy,AccountId) VALUES(@Qr,@CTPGDId,@User,@AccountId);
   INSERT @New VALUES(@Qr);
   SET @Count=@Count-1;
  END;
  COMMIT;
  SELECT i.* FROM dbo.WH_InspectionRollQr_Info i JOIN @New n ON n.Qr=i.Qr ORDER BY i.CreatedAt,i.Qr;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.WH_InspectionRollQr_Map
 @Qr nvarchar(50),@Quantity decimal(18,4),@SoRoll nvarchar(250),
 @AccountId bigint,@EmployeeId bigint,@User nvarchar(500),@ExpectedPGDId bigint=NULL,@InputUnit nvarchar(10)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Quantity IS NULL OR @Quantity<=0 OR @Quantity>9999999999.9999 THROW 50103,N'Số lượng cây phải lớn hơn 0 và không quá 9.999.999.999,9999.',1;
 SET @SoRoll=LTRIM(RTRIM(@SoRoll)); SET @Qr=LTRIM(RTRIM(@Qr));
 IF NULLIF(@SoRoll,N'') IS NULL THROW 50104,N'Vui lòng nhập số roll của cây.',1;
 IF ISNULL(@AccountId,0)<=0 THROW 50101,N'Thiếu tài khoản mapping.',1;
 BEGIN TRY
  BEGIN TRAN;
  DECLARE @DetailId bigint,@Picking bigint,@Existing bigint,@Unit nvarchar(50),@Status nvarchar(50),@Kind nvarchar(50);
  -- Resolve identity first, then take the same master lock used by desktop saving/confirmation.
  SELECT @DetailId=CTPGDId FROM dbo.WH_InspectionRollQr WHERE Qr=@Qr AND IsDeleted=0;
  IF @DetailId IS NULL THROW 50105,N'QR không phải tem cây nguyên liệu đã phát hành.',1;
  SELECT @Picking=PGDId FROM dbo.WH_ChiTietPhieuGiamDinh WHERE CTPGDId=@DetailId;
  SELECT @Status=p.TrangThai,@Kind=p.LoaiGiamDinh
   FROM dbo.WH_PhieuGiamDinh p WITH(UPDLOCK,HOLDLOCK)
   WHERE p.PGDId=@Picking;
  IF @ExpectedPGDId IS NOT NULL AND @Picking<>@ExpectedPGDId
   THROW 50116,N'Tem không thuộc phiếu giám định đang chọn.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.WH_InspectionRollQr WITH(UPDLOCK,HOLDLOCK) WHERE Qr=@Qr AND IsDeleted=0)
   THROW 50111,N'Tem đã bị xóa, không thể mapping.',1;
  SELECT @Existing=CayId FROM dbo.WH_InspectionRollQr WITH(UPDLOCK,HOLDLOCK) WHERE Qr=@Qr;
  -- Retried requests return the saved roll without overwriting its subsequently edited quantity.
  IF @Existing IS NOT NULL
  BEGIN
   SELECT * INTO #ExistingResult FROM dbo.WH_InspectionRollQr_Info WHERE Qr=@Qr;
   COMMIT; SELECT *,CAST(1 AS bit) AS AlreadyMapped FROM #ExistingResult; RETURN;
  END;
  IF @Kind IS NULL OR @Kind<>N'nl' OR @Status IN(N'HUY',N'DAXACNHAN')
   THROW 50106,N'Phiếu đã hủy/xác nhận hoặc không còn là phiếu nguyên liệu. Không thể mapping.',1;
  IF EXISTS(SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WITH(UPDLOCK,HOLDLOCK) WHERE QrTrangMapping=@Qr OR MaCayMappingGoc=@Qr)
   THROW 50107,N'QR đã có liên kết cây khác. Vui lòng kiểm tra trước khi mapping.',1;
  SELECT @Unit=UPPER(LTRIM(RTRIM(n.DVT))) FROM dbo.WH_ChiTietPhieuGiamDinh g
   JOIN dbo.Lib_NguyenPhuLieu n ON n.VTId=g.VTId WHERE g.CTPGDId=@DetailId;
  IF NULLIF(@Unit,N'') IS NULL THROW 50108,N'Vật tư chưa có đơn vị tính.',1;
  -- Explicit scan unit is converted to the material unit before SL and totals are saved.
  IF @InputUnit IS NOT NULL
  BEGIN
   IF @InputUnit NOT IN(N'YDS',N'M') THROW 50122,N'Đơn vị nhập chỉ được là yard hoặc mét.',1;
   IF @Unit NOT IN(N'YDS',N'YRD',N'YARD',N'YARDS',N'M',N'MTR',N'MTRS',N'MET',N'MÉT',N'METRE',N'METRES',N'METER',N'METERS')
    THROW 50122,N'Vật tư không có đơn vị chiều dài, không thể nhập yard/mét.',1;
   IF @InputUnit=N'YDS' AND @Unit IN(N'M',N'MTR',N'MTRS',N'MET',N'MÉT',N'METRE',N'METRES',N'METER',N'METERS') SET @Quantity=ROUND(@Quantity*0.9144,4);
   ELSE IF @InputUnit=N'M' AND @Unit IN(N'YDS',N'YRD',N'YARD',N'YARDS')
   BEGIN
    IF @Quantity/0.9144>9999999999.9999 THROW 50103,N'Số lượng quy đổi vượt giới hạn.',1;
    SET @Quantity=ROUND(@Quantity/0.9144,4);
   END;
   IF @Quantity<=0 THROW 50103,N'Số lượng sau quy đổi quá nhỏ.',1;
  END;

  DECLARE @Met decimal(18,4)=0,@Yard decimal(18,4)=0,@Gross decimal(18,4)=0;
  IF @Unit IN(N'YDS',N'YRD',N'YARD',N'YARDS') BEGIN SET @Yard=@Quantity; SET @Met=ROUND(@Quantity*0.9144,4); END;
  IF @Unit IN(N'M',N'MTR',N'MTRS',N'MET',N'MÉT',N'METRE',N'METRES',N'METER',N'METERS')
   BEGIN SET @Met=@Quantity; SET @Yard=ROUND(@Quantity/0.9144,4); END;
  IF @Unit IN(N'GRS',N'GROSS') BEGIN SET @Yard=@Quantity*144; SET @Met=ROUND(@Yard*0.9144,4); END;
  SET @Gross=ROUND(@Yard/144,4);
  IF LEFT(@Qr,3)<>N'GNA' OR LEN(@Qr) NOT IN(12,35)
   THROW 50120,N'Tem cũ chưa đổi sang GNA. Vui lòng làm mới và in lại tem Mapping QR.',1;
  DECLARE @MaCay nvarchar(50)=@Qr;
  IF NULLIF(@MaCay,'') IS NULL OR EXISTS(SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WITH(READUNCOMMITTED) WHERE MaCay=@MaCay)
   THROW 50110,N'Không cấp được mã cây duy nhất. Vui lòng thử lại.',1;
  DECLARE @DocDate date=CONVERT(date,GETDATE()),@Warehouse nvarchar(50)=N'';
  SELECT @DocDate=COALESCE(b.DocDate,@DocDate),@Warehouse=ISNULL(b.WarehouseCode,N'')
   FROM dbo.WH_ChiTietPhieuGiamDinh g JOIN dbo.WH_PhieuGiamDinh p ON p.PGDId=g.PGDId
   JOIN dbo.Bravo_PNK_Master b ON b.ReceiptNotesId=p.ReceiptNotesId WHERE g.CTPGDId=@DetailId;
  SELECT @DocDate=COALESCE(b.DocDate,@DocDate),@Warehouse=ISNULL(b.WarehouseCode,@Warehouse)
   FROM dbo.WH_ChiTietPhieuGiamDinh g JOIN dbo.WH_PhieuGiamDinh p ON p.PGDId=g.PGDId
   JOIN dbo.Bravo_GiayRaCong_Master b ON b.GatePassId=p.ReceiptNotesId WHERE g.CTPGDId=@DetailId;
  INSERT dbo.WH_ChiTietPhieuGiamDinh_Cay(CTPGDId,MaCay,SL,SoRoll,SoMet,SoYard,SoGross,TKId,TenNguoiTao,NguoiTao,NgayTao,
   DocDate,MaKho,QrTrangMapping,NguoiMapping,TGMapping)
   VALUES(@DetailId,@MaCay,@Quantity,@SoRoll,@Met,@Yard,@Gross,@AccountId,@User,@EmployeeId,GETDATE(),@DocDate,@Warehouse,@Qr,@User,GETDATE());
  DECLARE @CayId bigint=CONVERT(bigint,SCOPE_IDENTITY());
  UPDATE dbo.WH_InspectionRollQr SET CayId=@CayId,MappedAt=GETDATE(),MappedBy=@User WHERE Qr=@Qr;
  UPDATE g SET Thua=CASE WHEN q.Total>ISNULL(g.PKList,0) THEN q.Total-ISNULL(g.PKList,0) ELSE 0 END,
   Thieu=CASE WHEN q.Total<ISNULL(g.PKList,0) THEN ISNULL(g.PKList,0)-q.Total ELSE 0 END
   FROM dbo.WH_ChiTietPhieuGiamDinh g CROSS APPLY(SELECT ISNULL(SUM(CONVERT(float,SL)),0) Total
   FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WHERE CTPGDId=g.CTPGDId) q WHERE g.CTPGDId=@DetailId;
  INSERT dbo.Lib_NguyenPhuLieu_Gia_FOB_Log(IdChiTiet,VTId,ChungTuId,NoiDungThayDoi,NgayThayDoi,NguoiThayDoi,DiaChiMac)
   SELECT 0,VTId,idChungTuFOB,N'Mapping QR cây nguyên liệu: '+@Qr+N'; mã cây '+@MaCay+N'; số roll '+@SoRoll,
   GETDATE(),@User,N'BGG_WEB' FROM dbo.WH_ChiTietPhieuGiamDinh WHERE CTPGDId=@DetailId;
  -- Materialize the response before releasing the master lock. Reading the live view after COMMIT
  -- can otherwise deadlock with a simultaneous retry that has already acquired the next master lock.
  SELECT * INTO #SavedResult FROM dbo.WH_InspectionRollQr_Info WHERE Qr=@Qr;
  COMMIT;
  SELECT *,CAST(0 AS bit) AS AlreadyMapped FROM #SavedResult;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.WH_InspectionRollQr_Update
 @Qr nvarchar(50),@ExpectedPGDId bigint,@ExpectedQuantity decimal(18,4),@ExpectedRoll nvarchar(250),
 @Quantity decimal(18,4),@SoRoll nvarchar(250),@AccountId bigint,@User nvarchar(500),@InputUnit nvarchar(10)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Quantity IS NULL OR @Quantity<=0 OR @Quantity>9999999999.9999 THROW 50103,N'Số lượng cây không hợp lệ.',1;
 SET @SoRoll=LTRIM(RTRIM(@SoRoll));
 IF NULLIF(@SoRoll,N'') IS NULL THROW 50104,N'Vui lòng nhập số roll.',1;
 IF ISNULL(@AccountId,0)<=0 THROW 50101,N'Thiếu tài khoản cập nhật.',1;
 BEGIN TRY
  BEGIN TRAN;
  DECLARE @DetailId bigint,@PGDId bigint,@CayId bigint,@Status nvarchar(50),@Kind nvarchar(20),@MaCay nvarchar(50),@Unit nvarchar(50);
  SELECT @DetailId=CTPGDId FROM dbo.WH_InspectionRollQr WHERE Qr=@Qr AND IsDeleted=0;
  SELECT @PGDId=PGDId FROM dbo.WH_ChiTietPhieuGiamDinh WHERE CTPGDId=@DetailId;
  SELECT @Status=TrangThai,@Kind=LoaiGiamDinh FROM dbo.WH_PhieuGiamDinh WITH(UPDLOCK,HOLDLOCK) WHERE PGDId=@PGDId;
  IF @PGDId IS NULL OR @ExpectedPGDId IS NULL OR @PGDId<>@ExpectedPGDId
   THROW 50116,N'Tem không thuộc phiếu giám định đang chọn.',1;
  IF @Kind<>N'nl' OR @Status IN(N'HUY',N'DAXACNHAN') THROW 50106,N'Phiếu đã hủy/xác nhận, không thể sửa cây.',1;
  SELECT @CayId=CayId FROM dbo.WH_InspectionRollQr WITH(UPDLOCK,HOLDLOCK) WHERE Qr=@Qr AND IsDeleted=0;
  IF @CayId IS NULL THROW 50117,N'Tem chưa mapping hoặc đã xóa. Vui lòng làm mới danh sách.',1;
  SELECT @MaCay=MaCay FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WITH(UPDLOCK,HOLDLOCK) WHERE CayId=@CayId AND CTPGDId=@DetailId;
  IF @MaCay IS NULL THROW 50117,N'Không tìm thấy cây đã mapping.',1;
  IF EXISTS(SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WHERE CayId=@CayId AND (ISNULL(SoLuongXuat,0)>0 OR ISNULL(isKhoaKiemKe,0)=1))
    OR EXISTS(SELECT 1 FROM dbo.WH_ChiTietPhieuSoanHang_ChiTietCay WHERE CayId=@CayId OR MaCay=@MaCay)
   THROW 50118,N'Cây đã quét xuất hoặc khóa kiểm kê, không thể sửa từ màn hình mapping.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WHERE CayId=@CayId
    AND CONVERT(decimal(18,4),SL)=@ExpectedQuantity AND ISNULL(SoRoll,N'')=ISNULL(@ExpectedRoll,N''))
   THROW 50119,N'Thông tin cây đã được người khác sửa. Hãy đóng popup, làm mới và mở lại cây.',1;
  SELECT @Unit=UPPER(LTRIM(RTRIM(n.DVT))) FROM dbo.WH_ChiTietPhieuGiamDinh g JOIN dbo.Lib_NguyenPhuLieu n ON n.VTId=g.VTId WHERE g.CTPGDId=@DetailId;
  IF NULLIF(@Unit,N'') IS NULL THROW 50108,N'Vật tư chưa có đơn vị tính.',1;
  -- Explicit scan unit is converted to the material unit before SL and totals are saved.
  IF @InputUnit IS NOT NULL
  BEGIN
   IF @InputUnit NOT IN(N'YDS',N'M') THROW 50122,N'Đơn vị nhập chỉ được là yard hoặc mét.',1;
   IF @Unit NOT IN(N'YDS',N'YRD',N'YARD',N'YARDS',N'M',N'MTR',N'MTRS',N'MET',N'MÉT',N'METRE',N'METRES',N'METER',N'METERS')
    THROW 50122,N'Vật tư không có đơn vị chiều dài, không thể nhập yard/mét.',1;
   IF @InputUnit=N'YDS' AND @Unit IN(N'M',N'MTR',N'MTRS',N'MET',N'MÉT',N'METRE',N'METRES',N'METER',N'METERS') SET @Quantity=ROUND(@Quantity*0.9144,4);
   ELSE IF @InputUnit=N'M' AND @Unit IN(N'YDS',N'YRD',N'YARD',N'YARDS')
   BEGIN
    IF @Quantity/0.9144>9999999999.9999 THROW 50103,N'Số lượng quy đổi vượt giới hạn.',1;
    SET @Quantity=ROUND(@Quantity/0.9144,4);
   END;
   IF @Quantity<=0 THROW 50103,N'Số lượng sau quy đổi quá nhỏ.',1;
  END;

  DECLARE @Met decimal(18,4)=0,@Yard decimal(18,4)=0;
  IF @Unit IN(N'YDS',N'YRD',N'YARD',N'YARDS') BEGIN SET @Yard=@Quantity; SET @Met=ROUND(@Quantity*0.9144,4); END;
  IF @Unit IN(N'M',N'MTR',N'MTRS',N'MET',N'MÉT',N'METRE',N'METRES',N'METER',N'METERS') BEGIN SET @Met=@Quantity; SET @Yard=ROUND(@Quantity/0.9144,4); END;
  IF @Unit IN(N'GRS',N'GROSS') BEGIN SET @Yard=@Quantity*144; SET @Met=ROUND(@Yard*0.9144,4); END;
  UPDATE dbo.WH_ChiTietPhieuGiamDinh_Cay SET SL=@Quantity,SoRoll=@SoRoll,SoMet=@Met,SoYard=@Yard,SoGross=ROUND(@Yard/144,4) WHERE CayId=@CayId;
  UPDATE g SET Thua=CASE WHEN q.Total>ISNULL(g.PKList,0) THEN q.Total-ISNULL(g.PKList,0) ELSE 0 END,
   Thieu=CASE WHEN q.Total<ISNULL(g.PKList,0) THEN ISNULL(g.PKList,0)-q.Total ELSE 0 END
   FROM dbo.WH_ChiTietPhieuGiamDinh g CROSS APPLY(SELECT ISNULL(SUM(CONVERT(float,SL)),0) Total FROM dbo.WH_ChiTietPhieuGiamDinh_Cay WHERE CTPGDId=g.CTPGDId) q WHERE g.CTPGDId=@DetailId;
  INSERT dbo.Lib_NguyenPhuLieu_Gia_FOB_Log(IdChiTiet,VTId,ChungTuId,NoiDungThayDoi,NgayThayDoi,NguoiThayDoi,DiaChiMac)
   SELECT 0,VTId,idChungTuFOB,N'Sửa cây mapping QR '+@Qr+N'; SL '+CONVERT(nvarchar(50),@ExpectedQuantity)+N' -> '+CONVERT(nvarchar(50),@Quantity)
    +N'; roll '+ISNULL(@ExpectedRoll,N'')+N' -> '+@SoRoll,GETDATE(),@User,N'BGG_WEB' FROM dbo.WH_ChiTietPhieuGiamDinh WHERE CTPGDId=@DetailId;
  SELECT * INTO #UpdatedResult FROM dbo.WH_InspectionRollQr_Info WHERE Qr=@Qr;
  COMMIT; SELECT * FROM #UpdatedResult;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.WH_InspectionRollQr_Delete
 @CTPGDId bigint,@Codes xml,@AccountId bigint,@User nvarchar(500)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISNULL(@AccountId,0)<=0 THROW 50101,N'Thiếu tài khoản xóa tem.',1;
 DECLARE @Selected TABLE(Qr nvarchar(50) PRIMARY KEY);
 INSERT @Selected SELECT DISTINCT LTRIM(RTRIM(t.n.value('(text())[1]','nvarchar(50)'))) FROM @Codes.nodes('/Codes/Qr') t(n);
 IF NOT EXISTS(SELECT 1 FROM @Selected) THROW 50112,N'Chọn tem chưa mapping cần xóa.',1;
 BEGIN TRY
  BEGIN TRAN;
  DECLARE @PGDId bigint,@Kind nvarchar(20);
  SELECT @PGDId=PGDId FROM dbo.WH_ChiTietPhieuGiamDinh WHERE CTPGDId=@CTPGDId;
  SELECT @Kind=LoaiGiamDinh FROM dbo.WH_PhieuGiamDinh WITH(UPDLOCK,HOLDLOCK) WHERE PGDId=@PGDId;
  IF @Kind IS NULL OR @Kind<>N'nl' THROW 50113,N'Không tìm thấy phiếu nguyên liệu của dòng vật tư.',1;
  IF EXISTS(SELECT 1 FROM @Selected s LEFT JOIN dbo.WH_InspectionRollQr q WITH(UPDLOCK,HOLDLOCK) ON q.Qr=s.Qr
   WHERE q.Qr IS NULL OR q.CTPGDId<>@CTPGDId OR q.IsDeleted=1 OR q.CayId IS NOT NULL)
   THROW 50114,N'Có tem đã mapping, đã xóa hoặc không thuộc vật tư này. Đã dừng xóa; vui lòng làm mới danh sách.',1;
  IF EXISTS(SELECT 1 FROM dbo.WH_ChiTietPhieuGiamDinh_Cay r JOIN @Selected s ON r.QrTrangMapping=s.Qr OR r.MaCayMappingGoc=s.Qr OR r.MaCay=s.Qr)
   THROW 50115,N'Có tem đã liên kết với cây. Không thể xóa.',1;
  -- Retain the reserved code so a discarded physical label can never be issued again.
  UPDATE q SET IsDeleted=1,DeletedAt=GETDATE(),DeletedBy=@User
   FROM dbo.WH_InspectionRollQr q JOIN @Selected s ON s.Qr=q.Qr;
  INSERT dbo.Lib_NguyenPhuLieu_Gia_FOB_Log(IdChiTiet,VTId,ChungTuId,NoiDungThayDoi,NgayThayDoi,NguoiThayDoi,DiaChiMac)
   SELECT 0,g.VTId,g.idChungTuFOB,N'Xóa tem QR chưa mapping: '+s.Qr+N'; TKId='+CONVERT(nvarchar(30),@AccountId),GETDATE(),@User,N'HiGarment'
   FROM dbo.WH_ChiTietPhieuGiamDinh g CROSS JOIN @Selected s WHERE g.CTPGDId=@CTPGDId;
  COMMIT;
  SELECT COUNT(*) AS DeletedCount FROM @Selected;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;
