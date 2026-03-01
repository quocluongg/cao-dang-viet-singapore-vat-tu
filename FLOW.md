Dưới đây là 3 luồng xử lý "sống còn" cho dự án:

Flow 1: Thiết lập danh mục (Admin)
Admin nhập danh sách GV.

Admin cấu hình: Môn A gồm những vật tư X, Y, Z (Định mức).

Admin phân công: GV Nguyễn Văn A dạy môn B cơ sở 1.

Flow 2: Đề xuất & Phê duyệt (UX tối ưu cho GV)
UI/UX: Khi GV tạo phiếu đề xuất, hệ thống tự lọc ra danh sách môn họ đang dạy. Khi chọn môn, hệ thống hiện luôn danh sách vật tư tương ứng kèm "số lượng định mức" để GV không phải nhập tay từ đầu.

Luồng duyệt: GV gửi -> Trưởng bộ môn/Khoa duyệt -> Phòng tài chính/Admin duyệt -> Trạng thái: Sẵn sàng cấp phát.

Flow 3: Mua sắm & Cập nhật tồn kho (Logic Dev Fullstack)
Khi Khoa đi mua hàng về: Update số lượng trong bảng vat_tu.

Tạo phieu_nhap_kho để lưu vết dòng tiền.

Logic quan trọng: Phải có cơ chế thông báo (Notification) cho GV khi hàng đã về kho để họ lên nhận.