# Deploy production bằng Docker Compose

Nếu deploy trực tiếp Windows Server bằng HTTP, xem [hướng dẫn Windows](deploy/windows/README.md). Không cần Docker/Hyper-V hoặc khởi động lại server.

Chạy lệnh trong thư mục gốc BGG_WEB trên nhánh production. Máy deploy cần Docker Engine/Docker Desktop đang chạy Linux containers và Docker Compose v2.

## Cấu hình

1. Copy `.env.example` thành `.env` nếu muốn đặt cổng web (mặc định 8088).
2. Copy `BGG_BE/.env.example` thành `BGG_BE/.env` nếu máy deploy chưa có file này. Điền thông tin SQL Server hiện có và PASSWORD_SECRET_KEY đúng với hệ thống. Không ghi đè file .env đang có.
3. Nếu SQL Server ở máy khác, đặt DB_SERVER là IP/hostname có thể truy cập từ container. Nếu SQL Server ở máy host Docker, dùng host.docker.internal. SQL Server phải cho phép TCP ở DB_PORT và chấp nhận kết nối từ máy deploy.

Các file .env chứa thông tin riêng, không được commit hoặc copy vào image. Frontend gọi đường dẫn tương đối /api; không cần cấu hình URL backend khi build.

## Khởi động

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend frontend
```

Mở http://localhost:8088 hoặc http://IP-may-deploy:8088. Chỉ cần cho phép cổng TCP WEB_PORT đi vào máy deploy. Backend chạy cổng 3000 trong mạng Compose, không publish ra host. SQL Server tiếp tục dùng hệ thống hiện tại, Compose không tạo database.

Đổi cổng trong file `.env`, ví dụ `WEB_PORT=9090`, rồi chạy lại `docker compose up -d`. Khi đó truy cập cổng 9090. Không cần sửa hoặc build lại image chỉ để đổi cổng.

## Kiểm tra

```powershell
Invoke-WebRequest http://localhost:8088/
Invoke-RestMethod http://localhost:8088/api/database/test
```

Trên Linux có thể dùng `curl -f http://localhost:8088/` và `curl -f http://localhost:8088/api/database/test`. Thay cổng tương ứng WEB_PORT. API database/test chỉ chạy SELECT GETDATE(). Healthcheck của container chỉ kiểm tra backend đang lắng nghe TCP; kiểm tra database bằng API riêng như trên.

## Cập nhật và dừng

```powershell
git pull --ff-only
docker compose up -d --build
docker compose down
```

Nếu dùng camera quét mã từ điện thoại qua IP máy chủ, trình duyệt thường yêu cầu HTTPS. Cấu hình TLS tại reverse proxy của môi trường deploy khi cần sử dụng camera.

## PWA khi phục vụ qua IIS

Frontend dùng `/manifest.json` để tránh lỗi IIS trả 404 cho đuôi `.webmanifest`
chưa có MIME mapping. Sau khi deploy, kiểm tra trên đúng domain, giao thức và
cổng mà điện thoại sử dụng:

```powershell
curl.exe --fail --include https://wh.bgg.vn:8088/manifest.json
curl.exe --fail --include https://wh.bgg.vn:8088/sw.js
```

Manifest phải trả HTTP 200, Content-Type `application/json` hoặc
`application/manifest+json`, và nội dung JSON có `scope: "/"`,
`start_url: "/"`, `display: "standalone"`. Không được rewrite manifest thành
`index.html`. Service worker phải trả JavaScript. Build vẫn xuất thêm
`manifest.webmanifest` để tương thích URL cũ; URL này không nằm trong cache
bắt buộc vì IIS có thể chưa hỗ trợ phần mở rộng đó.

Nếu cần phục vụ URL cũ trên IIS, bổ sung MIME mapping `.webmanifest` thành
`application/manifest+json` trong cấu hình site hiện có; giữ nguyên các rule
API/rewrite của máy chủ. Không cần thay đổi cổng hoặc URL điều hướng nội bộ.

Biểu tượng iPhone được cài lúc manifest bị lỗi có thể vẫn giữ phạm vi cũ.
Sau khi xác minh manifest mới hoạt động trên máy chủ, xóa biểu tượng đó và
thêm lại từ Safari trên cùng địa chỉ HTTPS.
