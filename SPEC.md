# Đặc tả Phân hệ Quản lý Dữ liệu & Sao lưu (Database Backup & Restore)

## 1. Tổng quan (Overview)

**Mục đích:** Cung cấp tính năng sao lưu và khôi phục dữ liệu để đảm bảo an toàn cho hệ thống quản lý phòng Lab theo chuẩn ISO 15189.

**Vị trí:** Phân hệ nằm trong Tab Quản trị (Admin Tab).

---

## 2. Giao diện người dùng (UI Layout)

### 2.1. Bố cục chính

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 QUẢN LÝ DỮ LIỆU & SAO LƯU                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   💾 SAO LƯU        │  │   🔄 KHÔI PHỤC      │              │
│  │                     │  │                     │              │
│  │  [Tạo bản sao lưu]  │  │  [Chọn file .json] │              │
│  │                     │  │                     │              │
│  │  Bản sao lưu gần    │  │  Khôi phục dữ liệu │              │
│  │  nhất: 2026-03-04   │  │  từ file backup    │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📋 LỊCH SỬ SAO LƯU                                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  #  │ Ngày tạo      │ Kích thước │ Số bản ghi │ Thao tác  ││
│  │  1  │ 2026-03-04    │ 2.5 MB     │ 1,250       │ [Tải] [X] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ⚙️ CẤU HÌNH SAO LƯU TỰ ĐỘNG                               ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  ☑️ Bật sao lưu tự động                                     ││
│  │  Tần suất: [Hàng ngày ▼]   Thời điểm: [02:00 ▼]           ││
│  │  Số bản giữ lại: [10 ▼] bản gần nhất                        ││
│  │  [Lưu cấu hình]                                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Các thành phần giao diện

| Thành phần | Mô tả |
|------------|-------|
| **Card Sao lưu** | Hiển thị nút "Tạo bản sao lưu", thông tin bản sao lưu gần nhất |
| **Card Khôi phục** | Nút chọn file (.json), cảnh báo trước khi khôi phục |
| **Bảng Lịch sử** | Danh sách các bản sao lưu |
| **Cấu hình tự động** | Toggle bật/tắt, dropdown tần suất, thời điểm, số bản giữ lại |

---

## 3. Chức năng chi tiết

### 3.1. Sao lưu (Backup)

1. **Tạo bản sao lưu thủ công:**
   - Thu thập dữ liệu từ tất cả các bảng (devices, users, branches, positions, etc.)
   - Xuất file JSON với metadata (version, createdAt, createdBy, totalRecords)
   - Tự động tải về máy với tên: `labhouse_backup_YYYY-MM-DD_HHMMSS.json`

2. **Lưu trữ metadata:**
   - ID, Ngày tạo, Người tạo, Kích thước, Số bản ghi

### 3.2. Khôi phục (Restore)

1. **Chọn file:** Người dùng tải file .json lên
2. **Validate:** Kiểm tra định dạng và version
3. **Xác nhận:** Modal cảnh báo với checkbox xác nhận bắt buộc
4. **Thực hiện:** Ghi đè dữ liệu và reload ứng dụng

### 3.3. Cấu hình tự động

| Tham số | Giá trị |
|---------|---------|
| Bật/Tắt | On/Off |
| Tần suất | Hàng ngày, Hàng tuần, Hàng tháng |
| Thời điểm | 00:00 - 23:00 |
| Số bản giữ lại | 5 - 30 |

---

## 4. Quy tắc nghiệp vụ

- **Quyền:** Chỉ Admin và Giám đốc mới có quyền sao lưu/khôi phục
- **Xác nhận:** Bắt buộc tick checkbox khi khôi phục
- **Lịch sử:** Tự động xóa các bản cũ khi vượt giới hạn

---

## 5. Cấu trúc dữ liệu Backup

```json
{
  "version": "1.0",
  "createdAt": "2026-03-04T15:00:00Z",
  "createdBy": "admin",
  "totalRecords": 1250,
  "data": {
    "devices": [...],
    "users": [...],
    "branches": [...],
    "positions": [...],
    "suppliers": [...],
    "calibrationRequests": [...],
    "calibrationResults": [...],
    "incidents": [...],
    "schedules": [...],
    "proposals": [...],
    "profiles": [...],
    "history": [...]
  }
}
```
