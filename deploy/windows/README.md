# Windows Server 2022 - HTTP

Không cần Docker, Hyper-V, IIS hoặc reboot hệ điều hành. Chạy trên nhánh production. Chỉ publish HTTP 8088; backend bind 127.0.0.1:3008. Không cấu hình SSL/chứng chỉ/redirect HTTPS.

## Chuẩn bị trên server

1. Cài Node.js 24 LTS x64 từ https://nodejs.org/en/download. Mở lại PowerShell và kiểm tra `node -v`, `npm.cmd -v`.
2. Tải Nginx Windows từ https://nginx.org/en/download.html; giải nén riêng, ví dụ `C:\Tools\nginx`. Không ghi đè Nginx của dịch vụ khác.
3. Tải NSSM x64 từ https://nssm.cc/download; ví dụ đặt executable tại `C:\Tools\nssm\nssm.exe`. Nginx là console application, NSSM bọc cả Nginx và Node thành Windows Services.
4. Copy toàn bộ mã nguồn vào thư mục cố định, ví dụ `C:\Apps\BGG_WEB`, hoặc clone sau khi các thay đổi đã commit/push. Máy server cần Internet để npm tải thư viện. Không copy node_modules/dist từ máy khác.
5. Tạo `BGG_BE\.env` theo `BGG_BE\.env.example`. Điền SQL Server, tài khoản, database và PASSWORD_SECRET_KEY thực tế. Với deploy trực tiếp Windows, DB_SERVER là IP/hostname SQL Server (hoặc localhost nếu SQL nằm trên server này), không dùng host.docker.internal. Không chia sẻ/commit .env.

## Build và chuẩn bị cấu hình

Chạy PowerShell từ thư mục gốc dự án:

```powershell
cd C:\Apps\BGG_WEB
.\deploy\windows\Prepare.ps1 -WebPort 8088 -BackendPort 3008
```

Nếu execution policy chặn script, chỉ cho phép trong phiên hiện tại rồi chạy lại:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Prepare cài thư viện, build hai ứng dụng và sinh cấu hình vào deploy/windows/runtime. Không chạy khi dịch vụ BGG đang hoạt động; xem phần cập nhật. Không cần sửa CORS vì web gọi /api cùng origin qua Nginx.

## Cài services

Mở PowerShell Administrator, tại thư mục gốc dự án:

```powershell
.\deploy\windows\Install-Services.ps1 -NginxExe C:\Tools\nginx\nginx.exe -NssmExe C:\Tools\nssm\nssm.exe
Get-Service BGG-Backend,BGG-Web
Invoke-WebRequest http://localhost:8088/ -UseBasicParsing
Invoke-RestMethod http://localhost:8088/api/database/test
```

Script kiểm tra port trống, cấu hình Nginx, từ chối ghi đè service đã có; tạo BGG-Backend và BGG-Web tự khởi động cùng Windows. Backend đọc .env từ BGG_BE; biến HOST/PORT của service ghi đè giá trị tương ứng trong .env. Không cài hoặc thay đổi SQL Server. Các service mặc định chạy LocalSystem theo NSSM; thư mục ứng dụng/.env cần giới hạn quyền ghi cho quản trị viên. Có thể cấu hình tài khoản service riêng có quyền đọc/chạy ứng dụng và ghi deploy/windows/runtime/logs theo chính sách server.

Sau khi kiểm tra local thành công, cho phép cổng HTTP:

```powershell
New-NetFirewallRule -Name BGG-HTTP -DisplayName 'BGG HTTP 8088' -Direction Inbound -Protocol TCP -LocalPort 8088 -Action Allow
```

Mở http://IP-SERVER:8088 từ máy khác. Không mở firewall cho 3008. Nếu đổi WebPort thì đổi cổng trong rule và URL tương ứng; có thể giới hạn RemoteAddress theo mạng nội bộ.

## Cập nhật hoặc đổi cổng

Chỉ dừng hai service BGG, không restart server hoặc các dịch vụ khác:

```powershell
Stop-Service BGG-Web
Stop-Service BGG-Backend
# Copy bản mã nguồn mới vào đây, hoặc git pull --ff-only nếu deploy bằng Git.
.\deploy\windows\Prepare.ps1 -WebPort 8088 -BackendPort 3008
& C:\Tools\nginx\nginx.exe -t -p "$((Resolve-Path .\deploy\windows\runtime).Path.Replace('\','/'))/" -c nginx.conf
# Nếu đổi BackendPort, cập nhật cả PORT của service:
& C:\Tools\nssm\nssm.exe set BGG-Backend AppEnvironmentExtra NODE_ENV=production HOST=127.0.0.1 PORT=3008
Start-Service BGG-Backend
Start-Service BGG-Web
```

Nếu build hoặc kiểm tra Nginx lỗi, xử lý lỗi trước khi khởi động lại. Giữ bản sao release cũ để quay lại khi cần. Không cần chạy Install-Services lần nữa. Đổi cổng ngoài thì cập nhật firewall BGG-HTTP cho đúng cổng.

## Logs và gỡ service

Logs tại deploy/windows/runtime/logs, bao gồm error.log của Nginx và stdout/stderr của services. Kiểm tra cả Event Viewer khi service không khởi động. Nếu cài dở bị lỗi, kiểm tra `Get-Service BGG-*`, gỡ các service BGG đã tạo theo lệnh dưới rồi cài lại.

```powershell
Stop-Service BGG-Web -ErrorAction SilentlyContinue
Stop-Service BGG-Backend -ErrorAction SilentlyContinue
& C:\Tools\nssm\nssm.exe remove BGG-Web confirm
& C:\Tools\nssm\nssm.exe remove BGG-Backend confirm
Remove-NetFirewallRule -Name BGG-HTTP
```

HTTP hoạt động cho web/API. Camera quét mã trên trình duyệt khi truy cập qua IP bằng HTTP có thể bị chặn do yêu cầu secure context; bộ deploy này giữ đúng HTTP theo yêu cầu.

Tài liệu: https://nginx.org/en/docs/windows.html và https://nssm.cc/commands.
