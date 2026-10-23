# Thông báo đơn đặt hàng qua Web Push

Chỉ gửi cho đơn mới được tạo từ BGG_WEB. HiGarment desktop không phát sự kiện này.
Danh sách người nhận được chọn tại **Tài khoản → Thông báo đơn đặt hàng**.
Danh sách áp dụng cho cả đơn nguyên liệu và phụ liệu, cho các đơn tạo sau khi lưu.

## Cấu hình máy chủ

Trong `BGG_BE`:

1. Chạy `npm ci` và `npm run push:setup` với cấu hình database trong `.env`.
   Script chỉ tạo ba bảng `BGG_WebPushRecipients`, `BGG_WebPushSubscriptions`,
   `BGG_WebPushOutbox`; không thay đổi bảng nghiệp vụ. Có thể chạy lại.
   Nếu dùng tài khoản SQL giới hạn quyền, nhờ DBA chạy `scripts/push-schema.sql`.
   Script và API tương thích database compatibility level 120 hiện tại, không cần
   đổi compatibility level hoặc sử dụng `OPENJSON`.
2. Chạy `npm run push:keys` một lần. Lưu public/private key vào `.env`:

   ```dotenv
   PUSH_ENABLED=true
   VAPID_SUBJECT=mailto:dia-chi-quan-tri-thuc-te@congty.vn
   VAPID_PUBLIC_KEY=public-key-vua-tao
   VAPID_PRIVATE_KEY=private-key-vua-tao
   PUSH_AUTH_SECRET=chuoi-ngau-nhien-bi-mat-cua-may-chu
   PUSH_MANAGE_TK_IDS=1,2
   ```

   Thay email và TKId bằng giá trị thực tế. `PUSH_MANAGE_TK_IDS` giới hạn quyền
   **sửa danh sách nhận**, không phải danh sách người nhận. Nếu để trống, mọi
   tài khoản đã đăng nhập đều có thể sửa danh sách, tương tự các thao tác nghiệp
   vụ hiện tại chưa có phân quyền. Không đưa private key hay secret vào frontend.
   Không tạo lại VAPID key mỗi lần deploy; nếu đổi key, thiết bị cần bật lại nhận.
   Nếu không khai báo `PUSH_AUTH_SECRET`, sử dụng `PASSWORD_SECRET_KEY` hiện có.
3. Build và khởi động lại backend. Build/deploy frontend cùng phiên bản này.
   Khi tắt `PUSH_ENABLED`, việc tạo đơn vẫn hoạt động và không ghi hàng đợi push.
   Khi bật, backend kiểm tra bảng và VAPID lúc khởi động để phát hiện cấu hình thiếu.
4. Cho phép backend truy cập HTTPS outbound tới dịch vụ push của Chrome/Edge,
   Firefox và Apple. Cài PWA và sử dụng trên cùng origin HTTPS (bao gồm cổng).
   Trên iPhone/iPad cần iOS 16.4+, thêm ứng dụng vào màn hình chính, mở từ biểu tượng.
   `/push-events.js` và `/sw.js` phải trả JavaScript, không bị rewrite sang HTML.

Docker: build image mới, sau đó chạy `docker compose run --rm backend npm run push:setup`
trước khi khởi động backend với `PUSH_ENABLED=true`. Hoặc chạy script setup bên trong
backend container có cấu hình database,
hoặc chạy bằng Node trên máy có kết nối database. Các script nằm trong repository;
không phụ thuộc SQL Server cài ở máy frontend. Tất cả instance backend dùng chung
VAPID key và secret.

## Sử dụng

1. Đăng xuất/đăng nhập lại sau khi deploy để nhận phiên thông báo có chữ ký.
2. Trong **Tài khoản**, tìm và tích các tài khoản nhận, bấm **Lưu người nhận**.
   Có thể chọn trước tài khoản chưa đăng ký thiết bị. Không ai nhận mặc định.
3. Trên từng điện thoại của người nhận, mở PWA, vào **Tài khoản**, bấm **Bật thông báo
   trên thiết bị này**, chấp nhận quyền của hệ điều hành. Có thể bấm **Gửi thử** ngay.
4. Tạo một đơn mới từ BGG_WEB. Mỗi đơn thực tế (kể cả đơn được tách theo kho) gửi
   một thông báo cho từng thiết bị đã đăng ký của tài khoản được chọn.
5. Bấm thông báo mở chi tiết đúng đơn; nếu cần đăng nhập, sau đăng nhập quay lại đơn.
   Đăng xuất sẽ hủy đăng ký trên trình duyệt đó, phù hợp điện thoại dùng chung.

Đổi danh sách không gửi lại các đơn cũ. Thiết bị được đăng ký sau lúc tạo đơn không
nhận lại thông báo của đơn đó. Quyền thông báo và chế độ tập trung của hệ điều hành
có thể ảnh hưởng thời điểm hiển thị; phản hồi thành công từ dịch vụ push chưa xác nhận
người nhận đã đọc. Chức năng không tự phát âm thanh hoặc vượt qua chế độ im lặng.

## Độ bền và kiểm tra

Hàng đợi được ghi trong cùng transaction SQL với đơn đặt hàng. Giao dịch rollback
không phát thông báo. Worker kiểm tra mỗi 5 giây, khóa theo lô để nhiều instance
không cùng xử lý một bản ghi. Có lease 5 phút để phục hồi sau khi tiến trình dừng.
HTTP 429/lỗi mạng/5xx được thử lại tối đa 8 lần; HTTP 404/410 xóa đăng ký đã hết hạn.
Đơn quá 24 giờ được bỏ qua. Tag theo mã đơn giúp thiết bị gộp thông báo nếu phải gửi lại
sau khi tiến trình dừng đúng lúc đã gửi nhưng chưa cập nhật trạng thái (at-least-once).
Hủy chọn tài khoản hoặc đổi người dùng trên thiết bị khiến hàng đợi chưa gửi bị bỏ qua.

Kiểm tra bằng tài khoản SQL quản trị:

```sql
SELECT State, COUNT(*) AS Total FROM dbo.BGG_WebPushOutbox GROUP BY State;
SELECT TOP (30) Id, DonDatHangId, TKId, State, Attempts, LastError, CreatedAt
FROM dbo.BGG_WebPushOutbox ORDER BY Id DESC;
```

Không log hoặc chia sẻ nội dung cột `Subscription` (chứa khóa và endpoint thiết bị).
Có thể định kỳ xóa bản ghi `sent`, `skipped`, `failed` cũ hơn thời gian lưu nội bộ.

Kiểm thử code: `npm test` trong `BGG_BE`; build bằng `npm run build` ở cả backend
và frontend. Cần thực hiện thêm kiểm tra giao nhận thực tế trên iPhone/Android sau
khi deploy key, tạo bảng và cấp quyền trên thiết bị; test mô phỏng không xác nhận
được đường truyền Apple/Google của môi trường production.
