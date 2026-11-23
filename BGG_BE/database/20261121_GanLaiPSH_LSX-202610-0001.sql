/*
  Gán lại phiếu soạn hàng NA26110007, NA26110008 cho Lệnh sản xuất LSX-202610-0001.

  Bối cảnh: hai phiếu được soạn từ đơn đặt hàng vật tư của một LSX đã bị xóa trên Desktop.
  Khi xóa LSX, Desktop xóa luôn OMM_DonDatHang_LSX và OMM_DonDatHang_LSX_ChiTiet, nên phiếu
  soạn vẫn còn (LoaiLenh = 'DonDatHang', LenhId = đơn cũ) nhưng không còn đơn / LSX để nối.

  Script làm gì, cho từng phiếu:
    1. Kiểm tra: phiếu tồn tại, chưa hủy, KHÔNG thuộc Lệnh cấp phát (MRP_LCP_DonDatHang),
       và không đang gắn với một đơn LSX khác.
    2. Nếu vẫn còn đơn LSX trỏ tới phiếu (PhieuSoanHangId) -> chỉ đổi LSXId của đơn đó.
       Nếu không -> tạo lại đơn đặt hàng (OMM_DonDatHang_LSX) + chi tiết từ chi tiết phiếu soạn,
       số đơn mới dạng DDH-yyyyMM-nnnn theo tháng tạo phiếu.
    3. Nối phiếu soạn (LenhId) và từng dòng chi tiết phiếu (ChiTietLenhId, ChiTietDonDatHangId)
       vào đơn / dòng mới. Trạng thái đơn: đã nhận hết cây -> DaNhanHang; phiếu hoàn thành
       -> HoanThanh; còn lại -> DaTaoPSH.
  Không đụng tới số lượng soạn / xuất / nhận, cây vải hay phiếu xuất kho.

  CÁCH CHẠY:
    - Chạy nguyên file với @Apply = 0 (mặc định): chạy thử, in kết quả rồi ROLLBACK, không đổi gì.
    - Kiểm tra kết quả, đổi @Apply = 1 rồi chạy lại để ghi thật.
  Chạy trên database eGMF.
*/
SET XACT_ABORT ON;
SET NOCOUNT ON;

DECLARE @Apply bit = 0;                         -- 0 = chạy thử (rollback), 1 = ghi thật
DECLARE @SoLSX nvarchar(50) = N'LSX-202610-0001';

DECLARE @Phieu TABLE (MaSoPhieuSoan nvarchar(50) PRIMARY KEY);
INSERT @Phieu VALUES (N'NA26110007'), (N'NA26110008');

BEGIN TRANSACTION;

DECLARE @LSXId bigint, @SoLuongLSX int;
SELECT @SoLuongLSX = COUNT(*) FROM dbo.OMM_LenhSanXuat WHERE SoLSX = @SoLSX;
IF @SoLuongLSX <> 1
  THROW 52000, N'Không tìm thấy (hoặc trùng) Lệnh sản xuất cần gán; đã hủy.', 1;
SELECT @LSXId = LSXId FROM dbo.OMM_LenhSanXuat WHERE SoLSX = @SoLSX;

IF EXISTS (SELECT 1 FROM @Phieu p
           WHERE NOT EXISTS (SELECT 1 FROM dbo.WH_PhieuSoanHang psh WHERE psh.MaSoPhieuSoan = p.MaSoPhieuSoan))
  THROW 52001, N'Có mã phiếu soạn không tồn tại; đã hủy.', 1;

IF EXISTS (SELECT 1 FROM dbo.WH_PhieuSoanHang psh JOIN @Phieu p ON p.MaSoPhieuSoan = psh.MaSoPhieuSoan
           GROUP BY psh.MaSoPhieuSoan HAVING COUNT(*) > 1)
  THROW 52002, N'Có mã phiếu soạn bị trùng; đã hủy.', 1;

IF EXISTS (SELECT 1 FROM dbo.WH_PhieuSoanHang psh JOIN @Phieu p ON p.MaSoPhieuSoan = psh.MaSoPhieuSoan
           WHERE ISNULL(psh.TinhTrang, N'') = N'huy')
  THROW 52003, N'Có phiếu soạn đã hủy; đã hủy.', 1;

IF EXISTS (SELECT 1 FROM dbo.WH_PhieuSoanHang psh JOIN @Phieu p ON p.MaSoPhieuSoan = psh.MaSoPhieuSoan
           JOIN dbo.MRP_LCP_DonDatHang lcp ON psh.LoaiLenh = 'DonDatHang' AND lcp.DonDatHangId = psh.LenhId
           WHERE NOT EXISTS (SELECT 1 FROM dbo.OMM_DonDatHang_LSX d WHERE d.PhieuSoanHangId = psh.PhieuSoanHangId))
  THROW 52004, N'Có phiếu soạn đang thuộc một Lệnh cấp phát (MRP_LCP_DonDatHang), không phải LSX; đã hủy.', 1;

IF EXISTS (SELECT 1 FROM dbo.WH_PhieuSoanHang psh JOIN @Phieu p ON p.MaSoPhieuSoan = psh.MaSoPhieuSoan
           JOIN dbo.OMM_DonDatHang_LSX d ON d.PhieuSoanHangId = psh.PhieuSoanHangId
           JOIN dbo.OMM_LenhSanXuat lsx ON lsx.LSXId = d.LSXId
           WHERE d.LSXId <> @LSXId)
  THROW 52005, N'Có phiếu soạn đang gắn với một LSX khác vẫn còn tồn tại; đã hủy.', 1;

DECLARE @KetQua TABLE (
  MaSoPhieuSoan nvarchar(50), PhieuSoanHangId bigint, HanhDong nvarchar(50),
  DonDatHangId bigint, SoDonDatHang nvarchar(50), LoaiDatHang nvarchar(50),
  TrangThai nvarchar(50), SoDong int
);

DECLARE @PSHId bigint, @MaPSH nvarchar(50);
DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
  SELECT psh.PhieuSoanHangId, psh.MaSoPhieuSoan
  FROM dbo.WH_PhieuSoanHang psh JOIN @Phieu p ON p.MaSoPhieuSoan = psh.MaSoPhieuSoan
  ORDER BY psh.PhieuSoanHangId;
OPEN cur;
FETCH NEXT FROM cur INTO @PSHId, @MaPSH;
WHILE @@FETCH_STATUS = 0
BEGIN
  DECLARE @DDHId bigint = NULL, @SoDDH nvarchar(50) = NULL, @HanhDong nvarchar(50);
  DECLARE @Loai nvarchar(50) = CASE WHEN @MaPSH LIKE N'PA%' THEN N'PhuLieu' ELSE N'NguyenLieu' END;

  -- Trạng thái đơn theo tiến độ nhận cây của phiếu
  DECLARE @TongCay int, @CayDaNhan int, @TinhTrang nvarchar(50), @TrangThai nvarchar(50);
  SELECT @TongCay = COUNT(c.CayId),
         @CayDaNhan = SUM(CASE WHEN ISNULL(c.isXacNhan, 0) = 1 THEN 1 ELSE 0 END)
  FROM dbo.WH_ChiTietPhieuSoanHang s
  JOIN dbo.WH_ChiTietPhieuSoanHang_ChiTietCay c ON c.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId
  WHERE s.PhieuSoanHangId = @PSHId;
  SELECT @TinhTrang = ISNULL(TinhTrang, N'') FROM dbo.WH_PhieuSoanHang WHERE PhieuSoanHangId = @PSHId;
  SET @TrangThai = CASE
    WHEN @TongCay > 0 AND @CayDaNhan >= @TongCay THEN N'DaNhanHang'
    WHEN @TinhTrang = N'hoanthanh' THEN N'HoanThanh'
    ELSE N'DaTaoPSH' END;

  SELECT TOP 1 @DDHId = DonDatHangId, @SoDDH = SoDonDatHang
  FROM dbo.OMM_DonDatHang_LSX WHERE PhieuSoanHangId = @PSHId ORDER BY DonDatHangId DESC;

  IF @DDHId IS NOT NULL
  BEGIN
    -- Đơn còn tồn tại, chỉ mất LSX: đổi LSX
    UPDATE dbo.OMM_DonDatHang_LSX SET LSXId = @LSXId WHERE DonDatHangId = @DDHId;
    SET @HanhDong = N'Đổi LSX cho đơn có sẵn';
  END
  ELSE
  BEGIN
    -- Tạo lại đơn đặt hàng từ phiếu soạn
    DECLARE @NgayTao datetime, @Prefix nvarchar(30), @Seq int;
    SELECT @NgayTao = ISNULL(NgayTao, GETDATE()) FROM dbo.WH_PhieuSoanHang WHERE PhieuSoanHangId = @PSHId;
    SET @Prefix = N'DDH-' + CONVERT(nvarchar(6), @NgayTao, 112) + N'-';
    SELECT @Seq = ISNULL(MAX(TRY_CAST(RIGHT(SoDonDatHang, 4) AS int)), 0) + 1
    FROM dbo.OMM_DonDatHang_LSX WITH (UPDLOCK, HOLDLOCK)
    WHERE SoDonDatHang LIKE @Prefix + N'%';
    SET @SoDDH = @Prefix + RIGHT(N'0000' + CAST(@Seq AS nvarchar(10)), 4);

    INSERT dbo.OMM_DonDatHang_LSX (
      SoDonDatHang, LSXId, LoaiDatHang, NguoiDat, TKId, NgayDat,
      NgayCanGiao, GhiChuLot, GhiChu, TrangThai, PhieuSoanHangId
    )
    SELECT @SoDDH, @LSXId, @Loai, LEFT(ISNULL(psh.TenNguoiTao, N''), 150), psh.TKId, @NgayTao,
           psh.NgaySoan,
           LEFT(ISNULL((SELECT TOP 1 s.LOT FROM dbo.WH_ChiTietPhieuSoanHang s
                   WHERE s.PhieuSoanHangId = psh.PhieuSoanHangId AND ISNULL(s.LOT, N'') <> N''), N''), 500),
           N'Khôi phục từ phiếu soạn ' + psh.MaSoPhieuSoan + N' sau khi LSX cũ bị xóa',
           @TrangThai, psh.PhieuSoanHangId
    FROM dbo.WH_PhieuSoanHang psh WHERE psh.PhieuSoanHangId = @PSHId;
    SET @DDHId = CAST(SCOPE_IDENTITY() AS bigint);

    -- Chi tiết đơn từ chi tiết phiếu soạn, giữ cặp (dòng phiếu -> dòng đơn mới)
    DECLARE @Map TABLE (ChiTietPhieuSoanHangId bigint, CTDonDatHangId bigint);
    DELETE @Map;
    MERGE dbo.OMM_DonDatHang_LSX_ChiTiet AS t
    USING (
      SELECT s.ChiTietPhieuSoanHangId, ISNULL(s.VTId, 0) AS VTId, LEFT(ISNULL(s.Item, N''), 100) AS Item,
             LEFT(ISNULL(s.DienGiai, N''), 250) AS DienGiai, LEFT(ISNULL(s.DVT, N''), 50) AS DVT,
             LEFT(ISNULL(s.LoaiNPL, N''), 100) AS LoaiNPL, ISNULL(s.SoLuongYeuCau, 0) AS SoLuongYeuCau,
             LEFT(ISNULL(s.QuyCach, N''), 500) AS QuyCach
      FROM dbo.WH_ChiTietPhieuSoanHang s WHERE s.PhieuSoanHangId = @PSHId
    ) AS src ON 1 = 0
    WHEN NOT MATCHED THEN
      INSERT (DonDatHangId, VTId, MaVatTu, TenVatTu, DVT, LoaiNPL,
              DinhMuc, SoLuongSanPham, SoLuongYeuCau, GhiChu)
      VALUES (@DDHId, src.VTId, src.Item, src.DienGiai, src.DVT, src.LoaiNPL,
              0, 0, src.SoLuongYeuCau, src.QuyCach)
    OUTPUT src.ChiTietPhieuSoanHangId, inserted.CTDonDatHangId INTO @Map;

    UPDATE s SET s.ChiTietLenhId = m.CTDonDatHangId, s.ChiTietDonDatHangId = m.CTDonDatHangId
    FROM dbo.WH_ChiTietPhieuSoanHang s JOIN @Map m ON m.ChiTietPhieuSoanHangId = s.ChiTietPhieuSoanHangId;

    SET @HanhDong = N'Tạo lại đơn đặt hàng';
  END

  UPDATE dbo.WH_PhieuSoanHang SET LoaiLenh = 'DonDatHang', LenhId = @DDHId
  WHERE PhieuSoanHangId = @PSHId;

  INSERT @KetQua
  SELECT @MaPSH, @PSHId, @HanhDong, @DDHId, @SoDDH, d.LoaiDatHang, d.TrangThai,
         (SELECT COUNT(*) FROM dbo.OMM_DonDatHang_LSX_ChiTiet ct WHERE ct.DonDatHangId = @DDHId)
  FROM dbo.OMM_DonDatHang_LSX d WHERE d.DonDatHangId = @DDHId;

  FETCH NEXT FROM cur INTO @PSHId, @MaPSH;
END
CLOSE cur;
DEALLOCATE cur;

-- Kết quả
SELECT @SoLSX AS LenhSanXuat, * FROM @KetQua;

SELECT d.SoDonDatHang, ct.CTDonDatHangId, ct.MaVatTu, ct.TenVatTu, ct.DVT, ct.SoLuongYeuCau,
       s.ChiTietPhieuSoanHangId, s.SoLuongThucSoan
FROM @KetQua k
JOIN dbo.OMM_DonDatHang_LSX d ON d.DonDatHangId = k.DonDatHangId
JOIN dbo.OMM_DonDatHang_LSX_ChiTiet ct ON ct.DonDatHangId = d.DonDatHangId
LEFT JOIN dbo.WH_ChiTietPhieuSoanHang s ON s.ChiTietDonDatHangId = ct.CTDonDatHangId
                                       AND s.PhieuSoanHangId = d.PhieuSoanHangId
ORDER BY d.SoDonDatHang, ct.CTDonDatHangId;

IF @Apply = 1
BEGIN
  COMMIT TRANSACTION;
  PRINT N'ĐÃ GHI: các phiếu đã được gán cho ' + @SoLSX;
END
ELSE
BEGIN
  ROLLBACK TRANSACTION;
  PRINT N'CHẠY THỬ: đã rollback, chưa thay đổi gì. Đặt @Apply = 1 để ghi thật.';
END
