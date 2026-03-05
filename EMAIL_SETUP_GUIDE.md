# Hướng dẫn bật tính năng gửi email thông báo

## Bước 1: Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc của project (cùng level với package.json):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Bước 2: Cấu hình Gmail App Password (nếu dùng Gmail)

Vì Gmail không cho phép đăng nhập bằng password thường, bạn cần tạo App Password:

1. **Bật 2-Step Verification**:
   - Vào https://myaccount.google.com/security
   - Tìm "2-Step Verification" và bật lên

2. **Tạo App Password**:
   - Vào https://myaccount.google.com/apppasswords
   - Đăng nhập nếu được yêu cầu
   - Đặt tên app: "LabHouse Equipment"
   - Copy mật khẩu được tạo (16 ký tự, không có khoảng trắng)

3. **Dán vào file `.env.local`**:
   ```env
   SMTP_PASS=abcd1234efgh5678
   ```

## Bước 3: Khởi động lại server

```bash
# Stop server hiện tại (nếu đang chạy)
# Sau đó chạy lại:
bun dev
```

## Bước 4: Test gửi email

### Cách 1: Qua API endpoint

Gọi API `POST /api/emails`:

```bash
curl -X POST http://localhost:3000/api/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from LabHouse Equipment"
  }'
```

### Cách 2: Qua giao diện web

1. Đăng nhập vào ứng dụng
2. Tạo một đề xuất thiết bị mới (New Device)
3. Submit đề xuất
4. Hệ thống sẽ:
   - Tạo thông báo trong app
   - Gửi email cho admin (levancong.hmtu@gmail.com) và giám đốc (cong.le@roche.com)

### Cách 3: Trigger notification thủ công

Khi bạn thực hiện các thao tác sau, email sẽ được gửi tự động:

- **Tạo đề xuất thiết bị mới** → Email cho admin + director
- **Phê duyệt/Từ chối đề xuất** → Email cho người tạo đề xuất
- **Tạo báo cáo sự cố** → Email cho admin + director
- **Tạo yêu cầu hiệu chuẩn** → Email cho admin

## Kiểm tra xem email đã được gửi chưa

1. Kiểm tra console terminal:
   - Nếu thành công: log `✅ Email sent successfully`
   - Nếu lỗi: log chi tiết lỗi

2. Kiểm tra Gmail:
   - Kiểm tra hòm thư đến (bao gồm cả Spam)
   - Với Gmail: có thể cần đợi 1-2 phút

## Troubleshooting

### Lỗi "Invalid login"
→ Kiểm tra lại App Password có đúng không

### Lỗi "Less secure app access"
→ Gmail đã ngưng hỗ trợ, phải dùng App Password

### Không nhận được email
→ Kiểm tra thư mục Spam/Junk
→ Kiểm tra địa chỉ email trong mockData.ts có đúng không
