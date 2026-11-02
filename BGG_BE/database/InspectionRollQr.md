# Giám định nguyên liệu bằng tem QR từng cây

## Triển khai

1. Chạy `NVS_RMWAREHOUSE/Database/20261102_InspectionRollQr.sql` trên CSDL dùng chung của HiGarment và BGG_WEB. Bản sao cùng nội dung nằm tại `BGG_BE/database/20261102_InspectionRollQr.sql`.
2. Build/cập nhật NVS_RMWAREHOUSE.dll cùng bản HiGarment hiện tại.
3. Build và triển khai cả BGG_BE và BGG_FE bằng quy trình của BGG_WEB. Hai phía phải dùng cùng CSDL. Chỉ cập nhật frontend sẽ thiếu API mới.
4. Đóng/mở lại chi tiết phiếu HiGarment và tải lại web/PWA.

Script thêm bảng/view/proc Mapping QR, không thay đổi bộ cấp mã NAH và quy trình nhập cây thủ công cũ.

## Sử dụng

1. Trong phiếu giám định nguyên liệu (GC hoặc FOB), chọn dòng vật tư thuộc đúng chứng từ, bấm **Mapping QR**.
2. Nhập số cây cần chuẩn bị, bấm **Cấp QR GNA và in tem 4×6** (1–1000 tem/lần). Mỗi tem có mã GNA + yyMM + 5 số thứ tự (ví dụ GNA261100001), liên kết với vật tư đã chọn. Khi mapping, mã cây MaCay và QrTrangMapping đều là mã GNA đã in. Không cấp thêm NAH. In tem chưa tạo cây hay tồn kho. Cây NAH đã giám định vẫn giữ nguyên; tem NAH chờ đã chuyển sang GNA cần in lại.
3. Dán một tem lên một cây. Nếu hủy cửa sổ in hoặc cần in lại, chọn dòng tem và bấm **In lại các tem đã chọn**, không tạo tem mới.
4. Trên BGG_WEB vào **Mapping QR → Nguyên liệu — nhập cây bằng QR**. Tìm/lọc và chọn phiếu giám định trước. Ở tab **Quét cây**, quét QR; popup nhập tự mở. Quét tem của phiếu khác bị chặn.
5. Trong popup nhập **Số roll**, nhấn Enter sang **Số lượng/chiều dài** (mặc định yard, có thể chọn mét; hệ thống quy đổi về ĐVT vật tư khi lưu), nhấn Enter hoặc **Lưu & quét tiếp**. Khi lưu thành công popup tự đóng và con trỏ trở lại ô QR.
6. Tiếp tục quét cây khác ngay. Tab **Cây đã quét** lưu danh sách theo phiếu, vẫn có sau khi tải lại trang; bấm **Sửa** để đổi số roll/số lượng. Cây đã quét xuất/khóa kiểm kê hoặc phiếu đã xác nhận không sửa được ở đây.
7. Trên HiGarment bấm **Làm mới**/mở lại phiếu để xem chi tiết cây vừa mapping. Tiếp tục nghiệp vụ giám định, xác nhận, nhập kho, xuất kho như trước.
8. Tem in không hiển thị số roll và số lượng. Hai thông tin này chỉ nhập/xem trên màn hình mapping và chi tiết cây HiGarment; in lại tem vẫn dùng đúng QR GNA cũ.

## Xóa tem chưa mapping

Trong cửa sổ Mapping QR, chọn một hoặc nhiều tem chờ rồi bấm **Xóa tem chưa mapping** và xác nhận. Chọn lẫn tem đã mapping thì toàn bộ yêu cầu bị chặn. CSDL kiểm tra lại trạng thái khi xóa để tránh xóa tem vừa được điện thoại mapping. Tem đã xóa không còn tra cứu/mapping được; mã QR được giữ trong lịch sử, không cấp lại. Hủy tem giấy tương ứng sau khi xóa.

## Quy tắc

- Một QR chỉ có một cây; gửi lại cùng yêu cầu hoặc hai máy cùng quét không tạo thêm cây, không ghi đè số liệu đã lưu.
- Có thể sửa số roll/số lượng tại tab Cây đã quét khi cây chưa xuất và phiếu chưa xác nhận. Hệ thống đối chiếu dữ liệu gốc để tránh ghi đè sửa đổi của người khác. Quét lại QR đã có cây không tạo thêm cây.
- Phiếu đã hủy/xác nhận không được phát hành tem mới hoặc mapping tem chờ. Các tem đã mapping vẫn tra cứu/in lại được.
- Tem chưa mapping không được tính vào tổng cây, số lượng giám định, báo cáo tồn hay số lượng có thể xuất.
- Quy đổi YDS/met/gross theo đơn vị vật tư; không lấy cùng một số cho mét và yard. Với đơn vị không phải chiều dài, lưu số lượng theo ĐVT và không tự diễn giải là mét/yard.
- Giữ nguyên chức năng nhập tay/Excel và mapping phụ liệu. Không dùng màn hình mapping phụ liệu để nhập tem cây nguyên liệu mới.
- Tem đã mapping giữ liên kết với cây; không xóa cây này để tránh tái sử dụng QR vật lý cho cây khác. Tem chờ chưa dùng trên phiếu đã xác nhận giữ nguyên, không chuyển sang phiếu khác.

## Kiểm tra

- `NVS_RMWAREHOUSE/Tests/Test-InspectionRollQr.ps1`: LocalDB riêng, tự xóa database thử nghiệm, kiểm tra in tem, mapping, quy đổi, retry, khóa phiếu, rollback và hai yêu cầu đồng thời.
- `BGG_BE`: `npm run test -- test/inspection-roll-qr.spec.ts` và `npm run build`.
- `BGG_FE`: `npm run build`.
- Kiểm tra mẫu tem chờ/đã mapping 60 × 40 mm (ngang 6 cm, cao 4 cm): mỗi QR một trang, không in số lượng/số roll ở cả trước và sau mapping. Khi in thực tế dùng tỷ lệ 100%, không fit-to-page.
## Danh sách phiếu trên web
Hiển thị ngày giám định, mã hàng/PO, khách hàng, lô, loại hình, người tạo/người giám định, chứng từ, trạng thái phiếu và số cây đã quét/tem chờ. Tìm từ khóa theo phiếu, mã hàng, PO, lô, khách hàng, tên người phụ trách, chứng từ, vật tư và QR. Bộ lọc gồm từ/đến ngày giám định và trạng thái phiếu. Phân trang 20 phiếu; giữ bộ lọc khi quay lại danh sách. Liệt kê mọi phiếu giám định nguyên liệu phù hợp bộ lọc, kể cả phiếu chưa tạo tem QR.

Lịch sử cây đã quét hiển thị ngay dưới ô quét và trong tab Cây đã quét. Quét lại cây đã lưu hiển thị cảnh báo trùng, không tạo cây mới hoặc ghi đè dữ liệu. Phiếu chưa có tem hiển thị hướng dẫn tạo tem GNA trên HiGarment.
