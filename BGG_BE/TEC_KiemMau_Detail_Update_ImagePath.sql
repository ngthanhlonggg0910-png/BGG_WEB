/*
  SQL hoàn chỉnh cập nhật ảnh cho dbo.TEC_KiemMau_Detail_Update

  Source hiện không chứa định nghĩa đầy đủ của stored procedure, vì vậy không
  thể CREATE OR ALTER nguyên procedure mà không có nguy cơ làm mất nghiệp vụ
  hiện hữu. Mở definition hiện tại trong SQL Server rồi áp dụng đúng 2 thay đổi
  dưới đây trong procedure đang có.
*/

/*
  1. Bổ sung hai tham số ở cuối danh sách tham số của procedure:

  @Image NVARCHAR(1000) = NULL,
  @RemoveImage BIT = 0
*/

/*
  2. Trong câu UPDATE dbo.TEC_KiemMau_Detail, thay phần gán ImagePath hiện có
     bằng logic dưới đây. Những cột cập nhật khác giữ nguyên:

  ImagePath = CASE
      WHEN @Image IS NOT NULL THEN @Image
      WHEN @RemoveImage = 1 THEN NULL
      ELSE ImagePath
  END
*/

/*
  3. Phần cuối procedure phải trả về IdDetail vừa cập nhật để API xác nhận
     database đã cập nhật trước khi dọn file cũ:

  SELECT @IdDetail AS UpdatedId;
*/

/*
  Ý nghĩa:
  - Có @Image: lưu đường dẫn UUID của ảnh mới.
  - Không có @Image, @RemoveImage = 1: xóa liên kết ảnh.
  - Không có cả hai: giữ nguyên ảnh cũ.

  API không gửi ImagePath cũ từ frontend. Backend tự đọc ImagePath theo
  IdDetail trước khi gọi proc để xử lý dọn file an toàn sau khi DB cập nhật.
*/
