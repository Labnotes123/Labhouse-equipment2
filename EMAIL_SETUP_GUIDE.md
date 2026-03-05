# Hướng dẫn bật tính năng gửi email thông báo

## Tại sao phải tạo user và password?

Khi ứng dụng cần **gửi email thực** ra bên ngoài (không phải email giả lập), cần xác thực với máy chủ email (SMTP server) để:

- Xác nhận bạn có quyền sử dụng tài khoản email để gửi mail
- Ngăn chặn kẻ xấu lợi dụng Gmail để gửi spam
- Gmail yêu cầu bắt buộc vì lý do bảo mật

**Email gửi đi sẽ hiển thị: Gửi TỪ tài khoản Gmail của bạn → Gửi ĐẾN admin và giám đốc**

---

## Bạn cần chuẩn bị gì?

**Một tài khoản Gmail** bất kỳ của bạn (email cá nhân như xyz@gmail.com)

Tài khoản này đóng vai trò **"người gửi"** - tất cả thông báo sẽ được gửi từ email này.

**Người nhận (đã được cấu hình sẵn trong hệ thống):**
- Admin: levancong.hmtu@gmail.com
- Giám đốc: cong.le@roche.com

---

## Các bước cài đặt

### Bước 1: Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc của project (cùng level với package.json):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_GMAIL_EMAIL@gmail.com
SMTP_PASS=YOUR_APP_PASSWORD
```

**Thay thế:**
- `YOUR_GMAIL_EMAIL@gmail.com` → Email Gmail của bạn (ví dụ: minh.nguyen@gmail.com)
- `YOUR_APP_PASSWORD` → Mật khẩu ứng dụng (sẽ tạo ở bước 2)

> **Lưu ý quan trọng**: File `.env.local` nằm trong `.gitignore` nên sẽ KHÔNG bị đẩy lên GitHub. Điều này bảo mật thông tin email của bạn.

---

### Bước 2: Cấu hình Gmail App Password

Vì Gmail không cho phép đăng nhập bằng mật khẩu thường từ ứng dụng bên ngoài, bạn cần tạo "App Password" - đây là mật khẩu riêng cho ứng dụng.

**1. Bật 2-Step Verification (Xác minh 2 bước):**
   - Truy cập: https://myaccount.google.com/security
   - Tìm mục "2-Step Verification" và bật lên
   - Làm theo hướng dẫn xác minh (qua điện thoại)

**2. Tạo App Password:**
   - Sau khi bật 2-Step Verification, truy cập: https://myaccount.google.com/apppasswords
   - Đăng nhập nếu được yêu cầu
   - Chọn:
     - **Ứng dụng**: Thư (Mail)
     - **Thiết bị**: Khác (Other) - đặt tên như "LabHouse"
   - Nhấn "Tạo" → Copy mật khẩu 16 ký tự được tạo ra

**3. Dán vào file `.env.local`:**
   ```env
   SMTP_PASS=abcd1234efgh5678
   ```

---

### Bước 3: Khởi động lại server

```bash
# Stop server hiện tại (nếu đang chạy)
# Sau đó chạy lại:
bun dev
```

---

### Bước 4: Test gửi email

#### Cách 1: Qua API endpoint

```bash
curl -X POST http://localhost:3000/api/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from LabHouse Equipment"
  }'
```

#### Cách 2: Qua giao diện web

1. Đăng nhập vào ứng dụng
2. Tạo một đề xuất thiết bị mới (New Device)
3. Submit đề xuất
4. Hệ thống sẽ:
   - Tạo thông báo trong app (bell icon)
   - Gửi email cho admin (levancong.hmtu@gmail.com) và giám đốc (cong.le@roche.com)

#### Cách 3: Trigger notification thủ công

Khi bạn thực hiện các thao tác sau, email sẽ được gửi tự động:

- **Tạo đề xuất thiết bị mới** → Email cho admin + director
- **Phê duyệt/Từ chối đề xuất** → Email cho người tạo đề xuất
- **Tạo báo cáo sự cố** → Email cho admin + director
- **Tạo yêu cầu hiệu chuẩn** → Email cho admin

---

## Kiểm tra xem email đã được gửi chưa

1. **Kiểm tra console terminal:**
   - Nếu thành công: log `✅ Email sent successfully`
   - Nếu lỗi: log chi tiết lỗi

2. **Kiểm tra Gmail:**
   - Kiểm tra hòm thư đến (bao gồm cả Spam)
   - Với Gmail: có thể cần đợi 1-2 phút

---

## Troubleshooting

### Lỗi "Invalid login"
→ Kiểm tra lại App Password có đúng không

### Lỗi "Less secure app access"  
→ Gmail đã ngưng hỗ trợ, phải dùng App Password (như hướng dẫn ở trên)

### Không nhận được email
→ Kiểm tra thư mục Spam/Junk
→ Kiểm tra địa chỉ email trong mockData.ts có đúng không

### Không tìm thấy "App Password" trong tài khoản Google
→ Bạn cần bật **2-Step Verification** trước, sau đó mới thấy mục App Passwords

---

## Nếu không muốn dùng email thực

Hệ thống vẫn hoạt động bình thường mà **KHÔNG** cần cấu hình `.env.local`:

- ✅ Thông báo vẫn hiển thị trong ứng dụng (bell icon)
- ✅ Quy trình phê duyệt vẫn hoạt động
- ❌ Chỉ khi có `.env.local` mới gửi email ra ngoài

---

## Tóm tắt

| Thành phần | Vai trò | Ví dụ |
|------------|---------|-------|
| SMTP_USER | Email gửi đi (của bạn) | minh.nguyen@gmail.com |
| SMTP_PASS | App Password (16 ký tự) | abcd1234efgh5678 |
| Người nhận | Email trong hệ thống | levancong.hmtu@gmail.com, cong.le@roche.com |
