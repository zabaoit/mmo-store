# 🚀 MMO Account Selling Platform - Hướng dẫn sử dụng

Chào mừng bạn đến với hệ thống bán tài khoản MMO tự động Enterprise. Dưới đây là hướng dẫn chi tiết để bạn cài đặt và vận hành website.

## 🛠️ Yêu cầu hệ thống
- **Node.js**: 18.x trở lên
- **Supabase Account**: Để quản lý Database và Auth.
- **VietQR/Bank Account**: Để nhận thanh toán.

## 📦 Cài đặt nhanh

1. **Clone & Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường**:
   - Tạo file `.env.local` từ file mẫu:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Khởi tạo Database**:
   - Truy cập vào [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
   - Copy nội dung từ file `supabase/schema.sql` và chạy (Run).

4. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   Website sẽ chạy tại: `http://localhost:3000`

---

## 📘 Hướng dẫn vận hành (Admin)

### 1. Quản lý Sản phẩm
- Truy cập `/admin/products`.
- **Thêm sản phẩm**: Nhập tên, giá, và danh mục (Gmail, Facebook, ...).
- **Import kho hàng**: Sử dụng nút "Import kho hàng" để dán danh sách tài khoản định dạng `user|pass|2fa`. Hệ thống sẽ tự động mã hóa và lưu trữ.

### 2. Duyệt đơn hàng
- Khi khách hàng đặt hàng, đơn hàng sẽ ở trạng thái **Chờ thanh toán**.
- Khách hàng tải ảnh bill lên -> Trạng thái thành **Chờ duyệt**.
- Admin vào `/admin/orders`, xem bill và nhấn **Duyệt**.
- Hệ thống sẽ tự động lấy tài khoản từ kho và gửi cho khách hàng.

### 3. Cấu hình ngân hàng
- Vào `/admin/settings` -> Tab **Thanh toán**.
- Cập nhật số tài khoản, tên ngân hàng và chủ tài khoản. Mã QR VietQR sẽ tự động cập nhật theo thông tin này.

---

## 🛒 Quy trình mua hàng (Khách)
1. Chọn sản phẩm -> **Mua ngay**.
2. Kiểm tra giỏ hàng -> **Thanh toán**.
3. Chuyển khoản theo mã QR và mã đơn hàng hiển thị trên màn hình.
4. Tải ảnh bill lên và chờ quản trị viên phê duyệt.
5. Sau khi hoàn tất, vào **Lịch sử đơn hàng** để tải danh sách tài khoản đã mua.

---

## 🔒 Bảo mật & RLS
Hệ thống sử dụng **Row Level Security (RLS)** của Supabase:
- Khách hàng: Chỉ xem được sản phẩm và đơn hàng của chính mình.
- Admin: Có toàn quyền quản lý kho hàng và duyệt đơn.
- Tài khoản trong kho (Inventory) được bảo vệ nghiêm ngặt, chỉ xuất đầu ra sau khi đơn hàng được `COMPLETED`.

---
*Chúc bạn kinh doanh thuận lợi! Nếu có thắc mắc, vui lòng kiểm tra file `walkthrough.md` hoặc liên hệ kỹ thuật.*
