// ============ USER & PROFILE TYPES ============

export interface Profile {
  id: string;
  code: string; // Mã profile do hệ thống tự sinh
  name: string;
  description: string;
  permissions: Permission[];
  detailedPermissions?: DetailedPermission[]; // New detailed permission matrix
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  category: PermissionCategory;
  name: string;
  enabled: boolean;
}

export type PermissionCategory = 
  | "quan_ly_chung" 
  | "thiet_bi_moi" 
  | "ho_so_thiet_bi" 
  | "quan_tri" 
  | "lich_su";

// ============ DETAILED PERMISSION TYPES ============
// New detailed permission structure for the Permission Matrix

export type PermissionModule = 
  | "dashboard"           // Quản lý chung
  | "new_device"           // Thiết bị mới
  | "device_profile"      // Hồ sơ thiết bị
  | "admin"               // Quản trị
  | "history";            // Lịch sử

export type DeviceProfileSubModule = 
  | "device_basic"        // Căn bản
  | "reception"           // Tiếp nhận
  | "incident"            // Báo cáo sự cố
  | "calibration"         // Hiệu chuẩn & Bảo dưỡng
  | "transfer"            // Điều chuyển & Thanh lý
  | "training"            // Đào tạo
  | "info_management";    // Thông tin quản lý

export type PermissionType = "function" | "file";

export interface DetailedPermission {
  id: string;
  module: PermissionModule;
  subModule?: DeviceProfileSubModule;
  type: PermissionType;
  name: string;
  description?: string;
  enabled: boolean;
}

// Default detailed permissions for new profiles
export const DEFAULT_DETAILED_PERMISSIONS: DetailedPermission[] = [
  // MODULE 1: QUẢN LÝ CHUNG (DASHBOARD)
  { id: "dash_access", module: "dashboard", type: "function", name: "Truy cập Tab Quản lý chung", description: "Cho phép truy cập màn hình Dashboard", enabled: true },
  { id: "dash_view_stats", module: "dashboard", type: "function", name: "Xem Thẻ cảnh báo thống kê", description: "Thiết bị mới chờ duyệt, Sự cố, Hiệu chuẩn, Bảo dưỡng...", enabled: true },
  { id: "dash_approve", module: "dashboard", type: "function", name: "Phê duyệt phiếu", description: "Hiển thị icon Tick Xanh, tự động chèn chữ ký điện tử vào PDF", enabled: true },
  { id: "dash_reject", module: "dashboard", type: "function", name: "Từ chối phiếu", description: "Hiển thị icon Dấu X Đỏ, bắt buộc nhập lý do từ chối", enabled: true },
  { id: "dash_export_excel", module: "dashboard", type: "function", name: "Xuất Excel", description: "Xuất dữ liệu Bảng danh sách chờ duyệt", enabled: true },
  { id: "dash_file_view", module: "dashboard", type: "file", name: "Xem File đính kèm", description: "Xem trực tiếp chứng từ (Báo giá, Công văn)", enabled: true },
  { id: "dash_file_download", module: "dashboard", type: "file", name: "Tải File đính kèm", description: "Tải chứng từ về máy", enabled: true },

  // MODULE 2: THIẾT BỊ MỚI (ĐỀ XUẤT)
  { id: "newdev_access", module: "new_device", type: "function", name: "Truy cập Tab Thiết bị mới", description: "Cho phép truy cập màn hình thiết bị mới", enabled: true },
  { id: "newdev_create", module: "new_device", type: "function", name: "Tạo phiếu Đề xuất mua thiết bị", description: "Sinh mã PDX tự động", enabled: true },
  { id: "newdev_edit_delete", module: "new_device", type: "function", name: "Chỉnh sửa / Xóa phiếu", description: "Chỉ khả dụng khi phiếu ở trạng thái Bản nháp hoặc Bị từ chối", enabled: true },
  { id: "newdev_export_pdf", module: "new_device", type: "function", name: "Xuất PDF Phiếu đề xuất", description: "Tự động gộp file theo biểu mẫu BM.01", enabled: true },
  { id: "newdev_register", module: "new_device", type: "function", name: "Đăng ký thiết bị vào hệ thống", description: "Chuyển dữ liệu từ Phiếu đã duyệt sang Tab Hồ sơ thiết bị", enabled: true },
  { id: "newdev_file_upload", module: "new_device", type: "file", name: "Upload File đính kèm", description: "Hiển thị icon Kẹp ghim để tải file lên (Báo giá, Catalogue)", enabled: true },
  { id: "newdev_file_view", module: "new_device", type: "file", name: "Xem File đính kèm", description: "Xem trực tiếp file đã tải lên", enabled: true },
  { id: "newdev_file_download", module: "new_device", type: "file", name: "Tải File đính kèm", description: "Tải file về máy", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.1 Căn bản
  { id: "dev_access", module: "device_profile", subModule: "device_basic", type: "function", name: "Truy cập Tab Hồ sơ thiết bị", description: "Cho phép truy cập kho thiết bị", enabled: true },
  { id: "dev_create", module: "device_profile", subModule: "device_basic", type: "function", name: "Tạo mới hồ sơ thiết bị", description: "Hiển thị nút + Đăng ký thiết bị", enabled: true },
  { id: "dev_edit", module: "device_profile", subModule: "device_basic", type: "function", name: "Cập nhật/Chỉnh sửa thông tin gốc", description: "Serial, Model, Chu kỳ bảo dưỡng...", enabled: true },
  { id: "dev_export_excel", module: "device_profile", subModule: "device_basic", type: "function", name: "Xuất Excel danh sách kho thiết bị", description: "Xuất danh sách thiết bị ra Excel", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.2 Tiếp nhận
  { id: "rec_checklist", module: "device_profile", subModule: "reception", type: "function", name: "Thực hiện Checklist tiếp nhận", description: "Kiểm tra thiết bị khi nhận", enabled: true },
  { id: "rec_survey", module: "device_profile", subModule: "reception", type: "function", name: "Lập phiếu Khảo sát lắp đặt", description: "BM.05 - Khảo sát lắp đặt", enabled: true },
  { id: "rec_return", module: "device_profile", subModule: "reception", type: "function", name: "Lập phiếu Tiếp nhận trở lại", description: "BM.07 - Tiếp nhận thiết bị sau sửa chữa", enabled: true },
  { id: "rec_file_upload", module: "device_profile", subModule: "reception", type: "file", name: "Upload File đính kèm", description: "CO, CQ, BB Bàn giao, HDSD", enabled: true },
  { id: "rec_file_view", module: "device_profile", subModule: "reception", type: "file", name: "Xem File đính kèm", description: "Xem trực tiếp giấy tờ", enabled: true },
  { id: "rec_file_download", module: "device_profile", subModule: "reception", type: "file", name: "Tải File đính kèm", description: "Tải giấy tờ về máy", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.3 Báo cáo Sự cố
  { id: "inc_create", module: "device_profile", subModule: "incident", type: "function", name: "Lập Báo cáo sự cố mới", description: "Sinh mã PSC tự động", enabled: true },
  { id: "inc_work_order", module: "device_profile", subModule: "incident", type: "function", name: "Ghi nhận Công việc Kỹ sư", description: "Work Order - Chi tiết sửa chữa", enabled: true },
  { id: "inc_approve_close", module: "device_profile", subModule: "incident", type: "function", name: "Phê duyệt đóng sự cố", description: "Xác nhận hoàn thành sửa chữa", enabled: true },
  { id: "inc_export_pdf", module: "device_profile", subModule: "incident", type: "function", name: "Xuất PDF", description: "BM.11 - Báo cáo sự cố", enabled: true },
  { id: "inc_file_upload", module: "device_profile", subModule: "incident", type: "file", name: "Upload File đính kèm", description: "Ảnh chụp lỗi, Biên bản sửa chữa của Hãng", enabled: true },
  { id: "inc_file_view", module: "device_profile", subModule: "incident", type: "file", name: "Xem File đính kèm", description: "Xem trực tiếp ảnh/biên bản", enabled: true },
  { id: "inc_file_download", module: "device_profile", subModule: "incident", type: "file", name: "Tải File đính kèm", description: "Tải file về máy", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.4 Hiệu chuẩn & Bảo dưỡng
  { id: "cal_request", module: "device_profile", subModule: "calibration", type: "function", name: "Lập phiếu Yêu cầu ngoài kế hoạch", description: "Yêu cầu hiệu chuẩn đột xuất", enabled: true },
  { id: "cal_schedule", module: "device_profile", subModule: "calibration", type: "function", name: "Lên lịch định kỳ", description: "Cài đặt chu kỳ nhắc nhở", enabled: true },
  { id: "cal_result", module: "device_profile", subModule: "calibration", type: "function", name: "Ghi nhận kết quả Đạt/Không đạt", description: "BM.09, BM.10 - Kết quả hiệu chuẩn/bảo dưỡng", enabled: true },
  { id: "cal_file_upload", module: "device_profile", subModule: "calibration", type: "file", name: "Upload File đính kèm", description: "Giấy chứng nhận hiệu chuẩn dấu đỏ, Service Report", enabled: true },
  { id: "cal_file_view", module: "device_profile", subModule: "calibration", type: "file", name: "Xem File đính kèm", description: "Xem trực tiếp giấy CN", enabled: true },
  { id: "cal_file_download", module: "device_profile", subModule: "calibration", type: "file", name: "Tải File đính kèm", description: "Tải file về máy", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.5 Điều chuyển & Thanh lý
  { id: "trans_create", module: "device_profile", subModule: "transfer", type: "function", name: "Lập phiếu Đề xuất Điều chuyển / Thanh lý", description: "Sinh mã đề xuất tự động", enabled: true },
  { id: "trans_complete", module: "device_profile", subModule: "transfer", type: "function", name: "Ghi nhận hồ sơ hoàn tất", description: "Xác nhận hoàn thành thủ tục", enabled: true },
  { id: "trans_file_upload", module: "device_profile", subModule: "transfer", type: "file", name: "Upload File đính kèm", description: "Hợp đồng bán, Biên bản tiêu hủy, Công văn mượn máy", enabled: true },
  { id: "trans_file_view", module: "device_profile", subModule: "transfer", type: "file", name: "Xem File đính kèm", description: "Xem trực tiếp hợp đồng/biên bản", enabled: true },
  { id: "trans_file_download", module: "device_profile", subModule: "transfer", type: "file", name: "Tải File đính kèm", description: "Tải file về máy", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.6 Đào tạo
  { id: "train_create", module: "device_profile", subModule: "training", type: "function", name: "Lên kế hoạch đào tạo", description: "Sinh mã PDT tự động", enabled: true },
  { id: "train_evaluate", module: "device_profile", subModule: "training", type: "function", name: "Đánh giá Đạt/Không đạt cho học viên", description: "Ghi nhận kết quả đào tạo", enabled: true },
  { id: "train_file_upload", module: "device_profile", subModule: "training", type: "file", name: "Upload File đính kèm (Giảng viên/QL)", description: "Slide bài giảng, Sách HDSD, Bảng điểm danh chữ ký tươi", enabled: true },
  { id: "train_file_view", module: "device_profile", subModule: "training", type: "file", name: "Xem File đính kèm", description: "Xem tài liệu đào tạo", enabled: true },
  { id: "train_file_download", module: "device_profile", subModule: "training", type: "file", name: "Tải File đính kèm", description: "Tải tài liệu về máy", enabled: true },

  // MODULE 3: HỒ SƠ THIẾT BỊ - 3.7 Thông tin Quản lý
  { id: "info_view", module: "device_profile", subModule: "info_management", type: "function", name: "Xem Lý lịch thiết bị", description: "BM.03 - Lý lịch thiết bị", enabled: true },
  { id: "info_change_pic", module: "device_profile", subModule: "info_management", type: "function", name: "Thay đổi người phụ trách", description: "Ghi nhận lịch sử luân chuyển nhân sự", enabled: true },
  { id: "info_print_label", module: "device_profile", subModule: "info_management", type: "function", name: "In Tem Nhãn / Mã QR Code", description: "In tem dán lên máy", enabled: true },

  // MODULE 4: QUẢN TRỊ (ADMIN SYSTEM SETTINGS)
  { id: "admin_access", module: "admin", type: "function", name: "Truy cập Tab Quản trị", description: "Cho phép vào khu vực quản trị", enabled: true },
  { id: "admin_user_mgmt", module: "admin", type: "function", name: "Quản lý Người dùng", description: "Thêm mới / Cập nhật / Khóa tài khoản", enabled: true },
  { id: "admin_profile_mgmt", module: "admin", type: "function", name: "Quản lý Profile", description: "Tạo mới / Sửa / Tick chọn ma trận phân quyền", enabled: true },
  { id: "admin_dict_mgmt", module: "admin", type: "function", name: "Quản lý Danh mục Từ điển", description: "Thêm/Sửa/Xóa Khoa phòng, Chức vụ, Nước SX, NCC...", enabled: true },
  { id: "admin_sys_config", module: "admin", type: "function", name: "Cấu hình Hệ thống", description: "Cài đặt thời gian tự động dọn rác lịch sử", enabled: true },
  { id: "admin_data_mgmt", module: "admin", type: "function", name: "Quản lý Dữ liệu (Backup & Restore)", description: "Cấu hình tự động sao lưu, Tải file nén, Phục hồi dữ liệu", enabled: true },
  { id: "admin_file_signature", module: "admin", type: "file", name: "Upload / Đổi Chữ ký số", description: "Quyền cực kỳ nhạy cảm - up ảnh chữ ký điện tử", enabled: true },
  { id: "admin_file_avatar", module: "admin", type: "file", name: "Upload / Sửa Ảnh đại diện", description: "Thay đổi avatar người dùng", enabled: true },

  // MODULE 5: LỊCH SỬ (AUDIT TRAIL)
  { id: "history_access", module: "history", type: "function", name: "Truy cập Tab Lịch sử", description: "Xem lịch sử hoạt động hệ thống", enabled: true },
  { id: "history_filter", module: "history", type: "function", name: "Sử dụng Bộ lọc tìm kiếm chéo", description: "Lọc theo Tên User, Thời gian, Tên Thiết bị, Action", enabled: true },
  { id: "history_export", module: "history", type: "function", name: "Xuất Excel dữ liệu lịch sử", description: "Xuất log hoạt động hệ thống", enabled: true },
];

export interface UserProfile {
  id: string;
  username: string;
  password: string;
  fullName: string;
  employeeId: string;
  phone: string;
  email: string;
  position: string;
  department: string;
  branch: string;
  signature?: string;
  autoAttachSignature?: boolean;
  managedDevices: string[];
  profileIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string; // Mã chi nhánh do hệ thống tự sinh
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string; // Mã khoa phòng do hệ thống tự sinh
  branchId: string; // Thuộc chi nhánh nào
  branchName?: string; // Tên chi nhánh (để hiển thị)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Position {
  id: string;
  name: string;
  code: string; // Mã vị trí do hệ thống tự sinh
  description?: string;
  departmentId: string; // Thuộc khoa phòng nào
  departmentName?: string; // Tên khoa phòng (để hiển thị)
  branchId?: string; // Chi nhánh (tự điền từ department)
  branchName?: string; // Tên chi nhánh (để hiển thị)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstallationLocation {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName?: string;
  branchId?: string;
  branchName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryConfig {
  autoDeleteEnabled: boolean;
  deleteAfterDays: number;
  lastAutoDelete?: string;
}

export interface DataScopePermission {
  id: string;
  profileId: string;
  profileName?: string;
  branchIds: string[];
  departmentIds: string[];
  deviceTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RoleTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  profileIds: string[];
  defaultScope: {
    branchIds: string[];
    departmentIds: string[];
    deviceTypes: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SecurityPolicy {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  forceLogoutVersion: number;
  updatedAt?: string;
}

export interface ConfigAuditLog {
  id: string;
  actorName: string;
  action: "create" | "update" | "delete" | "restore";
  targetType: "user" | "profile" | "branch" | "supplier" | "history_config" | "scope_permission" | "role_template" | "security_policy";
  targetId: string;
  targetName?: string;
  before?: unknown;
  after?: unknown;
  changedFields?: string[];
  changedAt: string;
}

// Mock data for the device management system

export type DeviceStatus =
  | "Đăng ký mới"
  | "Chờ vận hành"
  | "Đang vận hành"
  | "Tạm dừng"
  | "Tạm điều chuyển"
  | "Ngừng sử dụng";

export type ProposalStatus = "Bản nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối";

export interface DeviceRequirement {
  id: string;
  deviceName: string;
  manufacturer: string;
  yearOfManufacture: string;
  distributor: string;
  quantity: number;
  technicalSpecs: string;
  attachments: AttachedFile[];
}

export interface AttachedFile {
  id?: string;
  name: string;
  type: string; // MIME type or 'pdf' | 'image' | 'doc'
  url: string; // base64 or object URL
  size: number;
}

export interface ProposalApprover {
  userId: string;
  fullName: string;
  email?: string; // Email để gửi thông báo
  role: string;
  isApprover: boolean; // true = can approve, false = related person only
}

export interface NewDeviceProposal {
  id: string;
  proposalCode: string;
  necessity: string; // Sự cần thiết đầu tư thiết bị
  deviceRequirements: DeviceRequirement[];
  proposedBy: string;
  proposedById: string;
  proposedDate: string; // date of first submit (hoàn tất)
  createdDate: string; // date of creation
  status: ProposalStatus;
  approvers: ProposalApprover[];
  approvedBy?: string;
  approvedDate?: string; // hh:mm dd/mm/yyyy
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  registeredToSystem?: boolean; // whether device has been registered
  department?: string;
  updatedAt?: string;
  title?: string;
  budget?: string;
  requester?: string;
  description?: string;
  attachments?: AttachedFile[];
  code?: string;
}

export interface CalibrationSchedule {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  scheduledDate: string;
  type: "Hiệu chuẩn" | "Bảo dưỡng";
  status: "Chờ thực hiện" | "Đã hoàn thành" | "Quá hạn";
  assignedTo: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: AttachedFile[];
}

// Calibration Request - for Tab Yêu cầu Hiệu chuẩn (BM.08)
export type CalibrationRequestStatus = "Bản nháp" | "Chờ duyệt" | "Đã duyệt" | "Hoàn thành";

export interface CalibrationRequest {
  id: string;
  requestCode: string; // Format: PHC-[Năm]-[STT]
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serial: string;
  quantity: number;
  expectedDate: string;
  content: string; // Nội dung hiệu chuẩn
  notes: string;
  attachments: AttachedFile[]; // Báo giá từ nhà cung cấp
  proposedBy: string;
  proposedById: string;
  department: string;
  position: string;
  approver: string;
  relatedUsers: string[];
  status: CalibrationRequestStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

// Calibration Result - for Tab Kết quả Hiệu chuẩn (BM.09)
export type CalibrationResultStatus = "Bản nháp" | "Đã hoàn tất";
export type CalibrationConclusion = "Đạt" | "Không đạt";

export interface CalibrationResult {
  id: string;
  resultCode: string;
  requestId: string; // Link to CalibrationRequest
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serial: string;
  executionDate: string; // Ngày thực hiện
  content: string; // Nội dung hiệu chuẩn
  executionUnit: string; // Đơn vị thực hiện
  calibrationResult: string; // Kết quả hiệu chuẩn
  standard: string; // Tiêu chuẩn
  attachments: AttachedFile[]; // Chứng nhận hiệu chuẩn (PDF)
  conclusion: CalibrationConclusion;
  notes: string;
  status: CalibrationResultStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IncidentReport {
  id: string;
  reportCode: string; // Format: PSC-năm-STT (e.g., PSC-2024-001)
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  specialty: string; // Bộ phận xét nghiệm
  severity?: "low" | "medium" | "high" | "critical";
  incidentDateTime: string; // Format: hh:mm dd/mm/yyyy
  discoveredBy: string; // Người phát hiện sự cố
  discoveredByRole: string; // Chức vụ người phát hiện
  supplier: string; // Tên nhà cung ứng
  description: string; // Mô tả chi tiết sự cố
  immediateAction: string; // Hành động xử trí tức thời
  supplierAction: string; // Hành động khắc phục của nhà cung ứng
  attachments?: AttachedFile[];
  
  // Required fields before submitting
  affectsPatientResult: boolean;
  affectedPatientSid?: string; // SID bệnh nhân bị ảnh hưởng
  howAffected?: string; // Bị ảnh hưởng như thế nào
  
  requiresDeviceStop: boolean;
  stopFrom?: string; // Thời gian dừng từ
  stopTo?: string; // Đến thời gian
  
  hasProposal: boolean;
  proposal?: string; // Đề xuất thêm
  
  // Approval
  reportedBy: string; // Người báo cáo
  deviceManager: string; // Quản lý trang thiết bị
  relatedUsers: string[]; // Người liên quan
  assigneeId?: string;
  assigneeName?: string;
  
  // Status
  status: "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Hoàn thành" | "Đang khắc phục";
  
  // Resolution fields
  conclusion?: "đã khắc phục" | "chưa khắc phục";
  resolvedBy?: string;
  resolvedByType?: "nhân viên lab" | "nhà sản xuất";
  linkedWorkOrderCode?: string; // Link to supplier work order
  completionDateTime?: string; // When incident was resolved
  
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  
  // Work orders from supplier
  workOrders: WorkOrder[];
}

export interface WorkOrder {
  id: string;
  workOrderCode: string; // Format: PSC-2024-001-WO-001
  incidentReportCode: string;
  contactPerson: string; // Người liên hệ nhà cung ứng
  contactMethod: "zalo" | "điện thoại" | "email" | "tin nhắn" | "trao đổi trực tiếp";
  startDateTime: string; // Format: hh:mm dd/mm/yyyy
  endDateTime?: string; // Format: hh:mm dd/mm/yyyy
  actionDescription: string; // Mô tả hành động
  notes: string; // Ghi chú
  attachments: AttachedFile[]; // Đính kèm hình ảnh/phiếu sửa chữa
  
  // Status
  status: "Mở" | "Đóng";
  
  // Engineer signature
  engineerName?: string; // Tên người sửa chữa
  signatureUrl?: string; // Chữ ký
  isCompleted: boolean; // Đã hoàn tất (ký xong)
  conclusion?: "hoàn thành" | "xử trí 1 phần";
  
  createdAt: string;
}

export interface HistoryLog {
  id: string;
  actionCode: string;
  actionNumber: number;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  details?: string;
  targetType: "Thiết bị" | "Người dùng" | "Hệ thống" | "Đề xuất" | "Sự cố" | "Lịch" | "Hiệu chuẩn" | "Đào tạo" | "Bảo dưỡng" | "Thanh lý" | "Điều chuyển";
  targetId?: string;
  targetName?: string;
  timestamp: string;
  ipAddress?: string;
}

// ============ NOTIFICATION TYPES ============

export type NotificationType = 
  | "approval_request"      // Yêu cầu duyệt
  | "approval_approved"    // Đã duyệt
  | "approval_rejected"    // Từ chối
  | "training"             // Thông báo đào tạo
  | "calibration"          // Thông báo hiệu chuẩn
  | "incident"             // Thông báo sự cố
  | "maintenance"          // Thông báo bảo trì
  | "system";              // Thông báo hệ thống

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface SystemNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  // Người nhận thông báo
  recipientId: string;
  recipientName: string;
  // Email người nhận (để gửi notification)
  recipientEmail?: string;
  // Legacy: userId for backward compatibility
  userId?: string;
  // Người tạo thông báo (có thể là hệ thống)
  senderId?: string;
  senderName?: string;
  // Liên kết đến đối tượng liên quan
  relatedType?: "proposal" | "incident" | "calibration" | "device" | "training" | "user";
  relatedId?: string;
  relatedCode?: string; // Mã phiếu/đề xuất
  // Legacy: proposalId and proposalCode for backward compatibility
  proposalId?: string;
  proposalCode?: string;
  // Trạng thái
  isRead: boolean;
  readAt?: string;
  // Thời gian
  createdAt: string;
  // Hành động (nếu có)
  actionUrl?: string;
  actionLabel?: string;
}

// Alias for backward compatibility
export type Notification = SystemNotification;

export interface DeviceContact {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
}

export interface DeviceAccessory {
  id: string;
  name: string;
  fileUrl?: string;
  fileName?: string;
}

export interface DeviceManagerHistory {
  userId: string;
  fullName: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  specialty: string; // Chuyên khoa
  category: string; // Phân loại
  deviceType: string; // Loại thiết bị
  model: string;
  serial: string;
  location: string; // Vị trí
  manufacturer: string; // Nhà sản xuất
  countryOfOrigin: string; // Xuất xứ
  yearOfManufacture: string; // Năm sản xuất
  distributor: string; // Nhà phân phối
  managerHistory: DeviceManagerHistory[]; // Người phụ trách (current + history)
  users: string[]; // Người sử dụng thiết bị (được cấp quyền sau đào tạo)
  usageStartDate: string; // Thời gian bắt đầu sử dụng
  usageTime: string; // Thời gian sử dụng (e.g., "08:00 - 17:00 (8 giờ)")
  installationLocation: string; // Vị trí lắp đặt
  accessories: DeviceAccessory[]; // Phụ kiện đính kèm
  contacts: DeviceContact[]; // Người liên hệ
  imageUrl?: string; // Ảnh chụp thiết bị (thumbnail)
  status: DeviceStatus;
  conditionOnReceive: "Máy mới" | "Đã qua sử dụng" | "Tân trang lại"; // Tình trạng khi nhận máy
  // Maintenance schedules
  calibrationRequired: boolean;
  calibrationFrequency?: string; // e.g., "6 tháng", "1 năm"
  maintenanceRequired: boolean;
  maintenanceFrequency?: string;
  inspectionRequired: boolean;
  inspectionFrequency?: string;
  // Tracking
  lastCalibration?: string;
  nextCalibration?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  // Additional
  description?: string;
}

// Mock Devices - Updated format with all fields
export const mockDevices: Device[] = [
  {
    id: "d1",
    code: "TB-001",
    name: "Máy phân tích huyết học tự động",
    specialty: "Huyết học",
    category: "Thiết bị xét nghiệm chính",
    deviceType: "Máy xét nghiệm chính",
    model: "XN-1000",
    serial: "SYS-XN1000-2021-001",
    location: "Phòng hóa sinh – Huyết học",
    manufacturer: "Sysmex",
    countryOfOrigin: "Nhật Bản",
    yearOfManufacture: "2021",
    distributor: "Công ty TNHH Thiết bị Y tế ABC",
    users: [],
      managerHistory: [
      { userId: "4", fullName: "Phạm Thị Kỹ Thuật", startDate: "2021-03-15", isCurrent: true }
    ],
    usageStartDate: "2021-03-15",
    usageTime: "08:00 - 17:00 (8 giờ)",
    installationLocation: "Phòng hóa sinh – Huyết học",
    accessories: [],
    contacts: [
      { id: "c1", fullName: "Phạm Thị Kỹ Thuật", phone: "0912345678", email: "pham.thi.ky.thuat@labhouse.vn" }
    ],
    status: "Đang vận hành",
    conditionOnReceive: "Máy mới",
    calibrationRequired: true,
    calibrationFrequency: "6 tháng",
    maintenanceRequired: true,
    maintenanceFrequency: "3 tháng",
    inspectionRequired: true,
    inspectionFrequency: "1 năm",
    lastCalibration: "2024-01-10",
    nextCalibration: "2024-07-10",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-04-05",
    description: "Máy phân tích huyết học tự động 5 phần, công suất 100 mẫu/giờ",
  },
  {
    id: "d2",
    code: "TB-002",
    name: "Máy sinh hóa tự động",
    specialty: "Hóa sinh",
    category: "Thiết bị xét nghiệm chính",
    deviceType: "Máy xét nghiệm chính",
    model: "AU5800",
    serial: "BC-AU5800-2020-045",
    location: "Phòng hóa sinh – Huyết học",
    manufacturer: "Beckman Coulter",
    countryOfOrigin: "Hoa Kỳ",
    yearOfManufacture: "2020",
    distributor: "Công ty CP Thiết bị Y tế XYZ",
    users: [],
      managerHistory: [
      { userId: "1", fullName: "Nguyễn Văn Admin", startDate: "2020-06-20", isCurrent: true }
    ],
    usageStartDate: "2020-06-20",
    usageTime: "07:00 - 18:00 (10 giờ)",
    installationLocation: "Phòng hóa sinh – Huyết học",
    accessories: [],
    contacts: [
      { id: "c2", fullName: "Nguyễn Văn Admin", phone: "0912345679", email: "nguyen.van.admin@labhouse.vn" }
    ],
    status: "Đang vận hành",
    conditionOnReceive: "Máy mới",
    calibrationRequired: true,
    calibrationFrequency: "6 tháng",
    maintenanceRequired: true,
    maintenanceFrequency: "3 tháng",
    inspectionRequired: true,
    inspectionFrequency: "1 năm",
    lastCalibration: "2024-02-01",
    nextCalibration: "2024-08-01",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-05-01",
    description: "Máy sinh hóa tự động tốc độ cao, 1800 test/giờ",
  },
  {
    id: "d3",
    code: "TB-003",
    name: "Máy miễn dịch tự động",
    specialty: "Huyết học",
    category: "Thiết bị xét nghiệm chính",
    deviceType: "Máy xét nghiệm chính",
    model: "ARCHITECT i2000SR",
    serial: "ABB-i2000-2022-012",
    location: "Phòng nuôi cấy vi sinh",
    manufacturer: "Abbott",
    countryOfOrigin: "Hoa Kỳ",
    yearOfManufacture: "2022",
    distributor: "Công ty TNHH Dược phẩm DEF",
    users: [],
      managerHistory: [
      { userId: "6", fullName: "Vũ Thị Thiết Bị", startDate: "2022-01-10", isCurrent: true }
    ],
    usageStartDate: "2022-01-10",
    usageTime: "08:00 - 17:00 (8 giờ)",
    installationLocation: "Phòng nuôi cấy vi sinh",
    accessories: [],
    contacts: [
      { id: "c3", fullName: "Vũ Thị Thiết Bị", phone: "0912345680", email: "vu.thi.thiet.bi@labhouse.vn" }
    ],
    status: "Tạm dừng",
    conditionOnReceive: "Máy mới",
    calibrationRequired: true,
    calibrationFrequency: "6 tháng",
    maintenanceRequired: true,
    maintenanceFrequency: "3 tháng",
    inspectionRequired: true,
    inspectionFrequency: "1 năm",
    lastCalibration: "2023-12-15",
    nextCalibration: "2024-03-15",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    description: "Máy miễn dịch tự động, 200 test/giờ, đa chỉ số",
  },
  {
    id: "d4",
    code: "TB-004",
    name: "Máy PCR Real-time",
    specialty: "Vi sinh",
    category: "Thiết bị xét nghiệm chính",
    deviceType: "Máy thành phần",
    model: "CFX96 Touch",
    serial: "BR-CFX96-2021-078",
    location: "Phòng tách chiết",
    manufacturer: "Bio-Rad",
    countryOfOrigin: "Hoa Kỳ",
    yearOfManufacture: "2021",
    distributor: "Công ty TNHH Thiết bị Y tế GHI",
    users: [],
      managerHistory: [
      { userId: "5", fullName: "Hoàng Văn Chất Lượng", startDate: "2021-09-05", isCurrent: true }
    ],
    usageStartDate: "2021-09-05",
    usageTime: "09:00 - 18:00 (8 giờ)",
    installationLocation: "Phòng tách chiết",
    accessories: [],
    contacts: [
      { id: "c4", fullName: "Hoàng Văn Chất Lượng", phone: "0912345681", email: "hoang.van.chat.luong@labhouse.vn" }
    ],
    status: "Đang vận hành",
    conditionOnReceive: "Máy mới",
    calibrationRequired: true,
    calibrationFrequency: "1 năm",
    maintenanceRequired: true,
    maintenanceFrequency: "6 tháng",
    inspectionRequired: true,
    inspectionFrequency: "1 năm",
    lastCalibration: "2024-01-25",
    nextCalibration: "2025-01-25",
    lastMaintenance: "2024-01-25",
    nextMaintenance: "2024-07-25",
    description: "Máy PCR Real-time 96 giếng, độ nhạy cao",
  },
  {
    id: "d5",
    code: "TB-005",
    name: "Máy ly tâm lạnh",
    specialty: "Hóa sinh",
    category: "Thiết bị phụ trợ",
    deviceType: "Máy ly tâm",
    model: "Centrifuge 5430R",
    serial: "EPP-5430R-2023-003",
    location: "Phòng chuẩn bị hóa chất",
    manufacturer: "Eppendorf",
    countryOfOrigin: "Đức",
    yearOfManufacture: "2023",
    distributor: "Công ty TNHH JKL",
    users: [],
      managerHistory: [
      { userId: "3", fullName: "Lê Văn Trưởng Phòng", startDate: "2023-03-20", isCurrent: true }
    ],
    usageStartDate: "2023-03-20",
    usageTime: "08:00 - 17:00 (8 giờ)",
    installationLocation: "Phòng chuẩn bị hóa chất",
    accessories: [],
    contacts: [
      { id: "c5", fullName: "Lê Văn Trưởng Phòng", phone: "0912345682", email: "le.van.truong.phong@labhouse.vn" }
    ],
    status: "Đang vận hành",
    conditionOnReceive: "Máy mới",
    calibrationRequired: false,
    maintenanceRequired: true,
    maintenanceFrequency: "6 tháng",
    inspectionRequired: false,
    lastCalibration: "2024-02-10",
    nextCalibration: undefined,
    lastMaintenance: "2024-02-10",
    nextMaintenance: "2024-08-10",
    description: "Máy ly tâm lạnh, tốc độ tối đa 30,000 rpm",
  },
  {
    id: "d6",
    code: "TB-006",
    name: "Tủ an toàn sinh học cấp II",
    specialty: "Vi sinh",
    category: "Thiết bị phụ trợ",
    deviceType: "Tủ An toàn sinh học & Tủ thao tác PCR",
    model: "Safe 2020",
    serial: "TF-SAFE2020-2022-007",
    location: "Phòng nuôi cấy vi sinh",
    manufacturer: "Thermo Fisher",
    countryOfOrigin: "Hoa Kỳ",
    yearOfManufacture: "2022",
    distributor: "Công ty MNO",
    users: [],
      managerHistory: [
      { userId: "6", fullName: "Vũ Thị Thiết Bị", startDate: "2022-07-15", isCurrent: true }
    ],
    usageStartDate: "2022-07-15",
    usageTime: "08:00 - 17:00 (8 giờ)",
    installationLocation: "Phòng nuôi cấy vi sinh",
    accessories: [],
    contacts: [
      { id: "c6", fullName: "Vũ Thị Thiết Bị", phone: "0912345680", email: "vu.thi.thiet.bi@labhouse.vn" }
    ],
    status: "Chờ vận hành",
    conditionOnReceive: "Đã qua sử dụng",
    calibrationRequired: true,
    calibrationFrequency: "1 năm",
    maintenanceRequired: true,
    maintenanceFrequency: "6 tháng",
    inspectionRequired: true,
    inspectionFrequency: "1 năm",
    lastCalibration: "2023-11-20",
    nextCalibration: "2024-11-20",
    lastMaintenance: "2024-02-28",
    nextMaintenance: "2024-05-28",
    description: "Tủ an toàn sinh học cấp II loại A2, lọc HEPA",
  },
];

// Mock Proposals - new format
export const mockProposals: NewDeviceProposal[] = [
  {
    id: "p1",
    proposalCode: "PDX-2024-001",
    necessity: "Bổ sung năng lực xét nghiệm đông máu, đáp ứng nhu cầu tăng cao của bệnh nhân trong thời gian gần đây. Hiện tại phòng xét nghiệm chưa có máy đông máu tự động, phải thực hiện thủ công gây mất nhiều thời gian.",
    deviceRequirements: [
      {
        id: "dr1",
        deviceName: "Máy đông máu tự động",
        manufacturer: "Stago",
        yearOfManufacture: "2023",
        distributor: "Công ty TNHH Thiết bị Y tế ABC",
        quantity: 1,
        technicalSpecs: "Tốc độ xử lý tối thiểu 200 test/giờ, có khả năng thực hiện các xét nghiệm PT, APTT, Fibrinogen",
        attachments: [],
      },
    ],
    proposedBy: "Phạm Thị Kỹ Thuật",
    proposedById: "4",
    proposedDate: "2024-02-15",
    createdDate: "2024-02-14",
    status: "Chờ duyệt",
    approvers: [
      { userId: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", isApprover: true },
      { userId: "3", fullName: "Lê Văn Trưởng Phòng", role: "Trưởng phòng xét nghiệm", isApprover: false },
    ],
    department: "Huyết học",
  },
  {
    id: "p2",
    proposalCode: "PDX-2024-002",
    necessity: "Thay thế máy xét nghiệm nước tiểu cũ đã hết hạn sử dụng, không còn đảm bảo độ chính xác. Máy hiện tại đã sử dụng được 8 năm và thường xuyên gặp sự cố.",
    deviceRequirements: [
      {
        id: "dr2",
        deviceName: "Máy xét nghiệm nước tiểu tự động",
        manufacturer: "Sysmex",
        yearOfManufacture: "2023",
        distributor: "Công ty CP Thiết bị Y tế XYZ",
        quantity: 2,
        technicalSpecs: "Phân tích 10 thông số, tốc độ 120 mẫu/giờ, có module phân tích cặn lắng",
        attachments: [],
      },
    ],
    proposedBy: "Lê Văn Trưởng Phòng",
    proposedById: "3",
    proposedDate: "2024-02-20",
    createdDate: "2024-02-19",
    status: "Đã duyệt",
    approvers: [
      { userId: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", isApprover: true },
    ],
    approvedBy: "Trần Thị Giám Đốc",
    approvedDate: "14:30 25/02/2024",
    department: "Tổng quát",
    registeredToSystem: true,
  },
  {
    id: "p3",
    proposalCode: "PDX-2024-003",
    necessity: "Nâng cao chất lượng xét nghiệm điện giải, đáp ứng tiêu chuẩn ISO 15189. Thiết bị hiện tại không đủ độ chính xác theo yêu cầu kiểm định.",
    deviceRequirements: [
      {
        id: "dr3",
        deviceName: "Máy điện giải tự động",
        manufacturer: "Radiometer",
        yearOfManufacture: "2024",
        distributor: "Công ty TNHH Dược phẩm DEF",
        quantity: 1,
        technicalSpecs: "Đo Na+, K+, Cl-, Ca2+, pH, pCO2, pO2. Thời gian phân tích < 60 giây",
        attachments: [],
      },
    ],
    proposedBy: "Hoàng Văn Chất Lượng",
    proposedById: "5",
    proposedDate: "2024-03-01",
    createdDate: "2024-02-28",
    status: "Chờ duyệt",
    approvers: [
      { userId: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", isApprover: true },
      { userId: "6", fullName: "Vũ Thị Thiết Bị", role: "Quản lý trang thiết bị", isApprover: false },
    ],
    department: "Sinh hóa",
  },
];

// Legacy Mock Notifications (for backward compatibility with components using old format)
// Using userId instead of recipientId for compatibility
export const mockNotifications: SystemNotification[] = [];

// Mock Calibration Schedules
export const mockSchedules: CalibrationSchedule[] = [
  {
    id: "s1",
    deviceId: "d1",
    deviceName: "Máy phân tích huyết học tự động",
    deviceCode: "TB-001",
    scheduledDate: "10/07/2024",
    type: "Hiệu chuẩn",
    status: "Chờ thực hiện",
    assignedTo: "Phạm Thị Kỹ Thuật",
    notes: "Hiệu chuẩn định kỳ 6 tháng",
  },
  {
    id: "s2",
    deviceId: "d2",
    deviceName: "Máy sinh hóa tự động",
    deviceCode: "TB-002",
    scheduledDate: "01/05/2024",
    type: "Bảo dưỡng",
    status: "Chờ thực hiện",
    assignedTo: "Nguyễn Văn Admin",
    notes: "Bảo dưỡng định kỳ quý",
  },
  {
    id: "s3",
    deviceId: "d3",
    deviceName: "Máy miễn dịch tự động",
    deviceCode: "TB-003",
    scheduledDate: "15/03/2024",
    type: "Hiệu chuẩn",
    status: "Quá hạn",
    assignedTo: "Vũ Thị Thiết Bị",
    notes: "Cần hiệu chuẩn gấp",
  },
  {
    id: "s4",
    deviceId: "d4",
    deviceName: "Máy PCR Real-time",
    deviceCode: "TB-004",
    scheduledDate: "25/07/2024",
    type: "Hiệu chuẩn",
    status: "Chờ thực hiện",
    assignedTo: "Hoàng Văn Chất Lượng",
  },
  {
    id: "s5",
    deviceId: "d6",
    deviceName: "Tủ an toàn sinh học cấp II",
    deviceCode: "TB-006",
    scheduledDate: "20/05/2024",
    type: "Hiệu chuẩn",
    status: "Chờ thực hiện",
    assignedTo: "Vũ Thị Thiết Bị",
  },
  {
    id: "s6",
    deviceId: "d1",
    deviceName: "Máy phân tích huyết học tự động",
    deviceCode: "TB-001",
    scheduledDate: "10/01/2024",
    type: "Hiệu chuẩn",
    status: "Đã hoàn thành",
    assignedTo: "Phạm Thị Kỹ Thuật",
    notes: "Hiệu chuẩn định kỳ",
  },
  {
    id: "s7",
    deviceId: "d2",
    deviceName: "Máy sinh hóa tự động",
    deviceCode: "TB-002",
    scheduledDate: "01/02/2024",
    type: "Bảo dưỡng",
    status: "Đã hoàn thành",
    assignedTo: "Nguyễn Văn Admin",
    notes: "Bảo dưỡng định kỳ",
  },
  {
    id: "s8",
    deviceId: "d4",
    deviceName: "Máy PCR Real-time",
    deviceCode: "TB-004",
    scheduledDate: "25/01/2024",
    type: "Hiệu chuẩn",
    status: "Đã hoàn thành",
    assignedTo: "Hoàng Văn Chất Lượng",
    notes: "Hiệu chuẩn định kỳ",
  },
];

// Mock Calibration Requests - Tab Yêu cầu Hiệu chuẩn (BM.08)
export const mockCalibrationRequests: CalibrationRequest[] = [
  {
    id: "phc1",
    requestCode: "PHC-2024-001",
    deviceId: "d1",
    deviceName: "Máy phân tích huyết học tự động",
    deviceCode: "TB-001",
    serial: "SN-2023-001",
    quantity: 1,
    expectedDate: "10/07/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189, Sở ban ngành.",
    notes: "Hiệu chuẩn định kỳ 6 tháng theo lịch",
    attachments: [],
    proposedBy: "Phạm Thị Kỹ Thuật",
    proposedById: "user1",
    department: "Khoa Xét nghiệm",
    position: "Kỹ thuật viên",
    approver: "Dr. Nguyễn Văn Giám đốc",
    relatedUsers: ["Vũ Thị Thiết Bị"],
    status: "Chờ duyệt",
    createdAt: "2024-06-15T08:30:00Z",
  },
  {
    id: "phc2",
    requestCode: "PHC-2024-002",
    deviceId: "d2",
    deviceName: "Máy sinh hóa tự động",
    deviceCode: "TB-002",
    serial: "SN-2023-002",
    quantity: 1,
    expectedDate: "15/08/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    notes: "Kiểm tra độ chính xác các thông số sinh hóa",
    attachments: [],
    proposedBy: "Nguyễn Văn Admin",
    proposedById: "user2",
    department: "Khoa Xét nghiệm",
    position: "Kỹ thuật viên",
    approver: "Dr. Nguyễn Văn Giám đốc",
    relatedUsers: ["Hoàng Văn Chất Lượng"],
    status: "Đã duyệt",
    approvedBy: "Dr. Nguyễn Văn Giám đốc",
    approvedDate: "18/06/2024 09:00",
    createdAt: "2024-06-10T10:00:00Z",
  },
  {
    id: "phc3",
    requestCode: "PHC-2024-003",
    deviceId: "d3",
    deviceName: "Máy miễn dịch tự động",
    deviceCode: "TB-003",
    serial: "SN-2023-003",
    quantity: 1,
    expectedDate: "20/06/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu khẩn cấp - máy báo lỗi.",
    notes: "Máy báo lỗi E-1001 cần kiểm tra",
    attachments: [],
    proposedBy: "Vũ Thị Thiết Bị",
    proposedById: "user3",
    department: "Khoa Xét nghiệm",
    position: "Quản lý thiết bị",
    approver: "Dr. Nguyễn Văn Giám đốc",
    relatedUsers: ["Phạm Thị Kỹ Thuật"],
    status: "Hoàn thành",
    approvedBy: "Dr. Nguyễn Văn Giám đốc",
    approvedDate: "12/06/2024 14:30",
    createdAt: "2024-06-08T07:00:00Z",
  },
  {
    id: "phc4",
    requestCode: "PHC-2024-004",
    deviceId: "d4",
    deviceName: "Máy PCR Real-time",
    deviceCode: "TB-004",
    serial: "SN-2023-004",
    quantity: 1,
    expectedDate: "25/07/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    notes: "Hiệu chuẩn định kỳ",
    attachments: [],
    proposedBy: "Hoàng Văn Chất Lượng",
    proposedById: "user4",
    department: "Khoa Xét nghiệm",
    position: "Kỹ thuật viên",
    approver: "Dr. Nguyễn Văn Giám đốc",
    relatedUsers: ["Vũ Thị Thiết Bị"],
    status: "Bản nháp",
    createdAt: "2024-06-20T11:00:00Z",
  },
  {
    id: "phc5",
    requestCode: "PHC-2024-005",
    deviceId: "d5",
    deviceName: "Máy gây mê",
    deviceCode: "TB-005",
    serial: "SN-2023-005",
    quantity: 1,
    expectedDate: "30/08/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    notes: "Kiểm tra độ chính xác",
    attachments: [],
    proposedBy: "Trần Văn Bác sĩ",
    proposedById: "user5",
    department: "Khoa Gây mê",
    position: "Bác sĩ",
    approver: "Dr. Nguyễn Văn Giám đốc",
    relatedUsers: ["Vũ Thị Thiết Bị"],
    status: "Chờ duyệt",
    createdAt: "2024-06-22T09:00:00Z",
  },
  {
    id: "phc6",
    requestCode: "PHC-2024-006",
    deviceId: "d6",
    deviceName: "Tủ an toàn sinh học cấp II",
    deviceCode: "TB-006",
    serial: "SN-2023-006",
    quantity: 1,
    expectedDate: "20/05/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    notes: "Kiểm tra dòng khí",
    attachments: [],
    proposedBy: "Vũ Thị Thiết Bị",
    proposedById: "user3",
    department: "Khoa Xét nghiệm",
    position: "Quản lý thiết bị",
    approver: "Dr. Nguyễn Văn Giám đốc",
    relatedUsers: ["Phạm Thị Kỹ Thuật"],
    status: "Đã duyệt",
    approvedBy: "Dr. Nguyễn Văn Giám đốc",
    approvedDate: "10/05/2024 10:00",
    createdAt: "2024-05-05T08:00:00Z",
  },
];

// Mock Calibration Results - Tab Kết quả Hiệu chuẩn (BM.09)
export const mockCalibrationResults: CalibrationResult[] = [
  {
    id: "kq1",
    resultCode: "KQ-2024-001",
    requestId: "phc3",
    deviceId: "d3",
    deviceName: "Máy miễn dịch tự động",
    deviceCode: "TB-003",
    serial: "SN-2023-003",
    executionDate: "18/06/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    executionUnit: "Trung tâm Kiểm định Quốc gia",
    calibrationResult: "Tất cả các thông số đo được nằm trong giới hạn cho phép.",
    standard: "ISO 15189:2022",
    attachments: [],
    conclusion: "Đạt",
    notes: "Máy hoạt động bình thường sau khi hiệu chuẩn",
    status: "Đã hoàn tất",
    createdBy: "Vũ Thị Thiết Bị",
    createdAt: "2024-06-20T14:00:00Z",
  },
  {
    id: "kq2",
    resultCode: "KQ-2024-002",
    requestId: "phc1",
    deviceId: "d1",
    deviceName: "Máy phân tích huyết học tự động",
    deviceCode: "TB-001",
    serial: "SN-2023-001",
    executionDate: "10/01/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    executionUnit: "Trung tâm Kiểm định Quốc gia",
    calibrationResult: "Các thông số WBC, RBC, Hgb, Hct đạt chuẩn.",
    standard: "ISO 15189:2022",
    attachments: [],
    conclusion: "Đạt",
    notes: "Hiệu chuẩn định kỳ thành công",
    status: "Đã hoàn tất",
    createdBy: "Phạm Thị Kỹ Thuật",
    createdAt: "2024-01-12T10:00:00Z",
  },
  {
    id: "kq3",
    resultCode: "KQ-2024-003",
    requestId: "phc2",
    deviceId: "d2",
    deviceName: "Máy sinh hóa tự động",
    deviceCode: "TB-002",
    serial: "SN-2023-002",
    executionDate: "01/02/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    executionUnit: "Công ty Vimed",
    calibrationResult: "Các thông số Enzyme, Lipid, Glucose nằm trong giới hạn.",
    standard: "ISO 15189:2022",
    attachments: [],
    conclusion: "Đạt",
    notes: "Bảo dưỡng định kỳ hoàn tất",
    status: "Đã hoàn tất",
    createdBy: "Nguyễn Văn Admin",
    createdAt: "2024-02-05T09:00:00Z",
  },
  {
    id: "kq4",
    resultCode: "KQ-2024-004",
    requestId: "phc6",
    deviceId: "d6",
    deviceName: "Tủ an toàn sinh học cấp II",
    deviceCode: "TB-006",
    serial: "SN-2023-006",
    executionDate: "25/01/2024",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189.",
    executionUnit: "Công ty An toàn sinh học",
    calibrationResult: "Dòng khí đạt chuẩn Class II.",
    standard: "ISO 15189:2022",
    attachments: [],
    conclusion: "Đạt",
    notes: "Tủ hoạt động bình thường",
    status: "Đã hoàn tất",
    createdBy: "Hoàng Văn Chất Lượng",
    createdAt: "2024-01-28T11:00:00Z",
  },
];

// Mock Incident Reports - BM.11.QL.TC.018
export const mockIncidents: IncidentReport[] = [
  {
    id: "i1",
    reportCode: "PSC-2024-001",
    deviceId: "d3",
    deviceName: "Máy miễn dịch tự động",
    deviceCode: "TB-003",
    specialty: "Huyết học",
    incidentDateTime: "09:15 28/02/2024",
    discoveredBy: "Vũ Thị Thiết Bị",
    discoveredByRole: "Quản lý trang thiết bị",
    supplier: "Abbott",
    description: "Máy hiển thị lỗi E-1001, quạt hút không hoạt động. Cần kiểm tra và sửa chữa.",
    immediateAction: "Tạm dừng sử dụng máy, báo kỹ sư của hãng Abbott đến kiểm tra.",
    supplierAction: "",
    affectsPatientResult: false,
    requiresDeviceStop: true,
    stopFrom: "09:15 28/02/2024",
    stopTo: "",
    hasProposal: false,
    reportedBy: "Vũ Thị Thiết Bị",
    deviceManager: "Vũ Thị Thiết Bị",
    relatedUsers: ["Phạm Thị Kỹ Thuật"],
    status: "Chờ duyệt",
    createdAt: "2024-02-28T09:20:00",
    workOrders: [],
  },
  {
    id: "i2",
    reportCode: "PSC-2024-002",
    deviceId: "d1",
    deviceName: "Máy phân tích huyết học tự động",
    deviceCode: "TB-001",
    specialty: "Huyết học",
    incidentDateTime: "14:30 01/03/2024",
    discoveredBy: "Phạm Thị Kỹ Thuật",
    discoveredByRole: "Kỹ thuật viên",
    supplier: "Sysmex",
    description: "Kết quả xét nghiệm huyết học có sự sai lệch, cần hiệu chuẩn lại.",
    immediateAction: "Tạm dừng xét nghiệm trên máy, sử dụng máy dự phòng.",
    supplierAction: "02/03/2024 08:00 - 12:00, Kỹ sư Nguyễn Văn A - Thay sensor huyết học, hiệu chuẩn lại máy. Hoàn thành.",
    affectsPatientResult: true,
    affectedPatientSid: "BN-2024-00156",
    howAffected: "Kết quả WBC cao bất thường, cần xét nghiệm lại",
    requiresDeviceStop: true,
    stopFrom: "14:30 01/03/2024",
    stopTo: "02/03/2024 12:00",
    hasProposal: true,
    proposal: "Đề xuất kiểm tra định kỳ sensor hàng tháng",
    reportedBy: "Phạm Thị Kỹ Thuật",
    deviceManager: "Phạm Thị Kỹ Thuật",
    relatedUsers: ["Nguyễn Văn Admin", "Lê Văn Trưởng Phòng"],
    status: "Hoàn thành",
    createdAt: "2024-03-01T14:35:00",
    approvedBy: "Lê Văn Trưởng Phòng",
    approvedDate: "03/03/2024 10:00",
    workOrders: [
      {
        id: "wo1",
        workOrderCode: "PSC-2024-002-WO-001",
        incidentReportCode: "PSC-2024-002",
        contactPerson: "Kỹ sư Nguyễn Văn A",
        contactMethod: "trao đổi trực tiếp",
        startDateTime: "08:00 02/03/2024",
        endDateTime: "12:00 02/03/2024",
        actionDescription: "Thay sensor huyết học, vệ sinh đầu đọc, hiệu chuẩn máy",
        notes: "Máy hoạt động bình thường sau khi sửa chữa",
        attachments: [
          {
            id: "att-wo1-1",
            name: "Bien_ban_sua_chua_WO001.txt",
            type: "doc",
            url: "data:text/plain;charset=utf-8,Bien%20ban%20sua%20chua%20WO001%0ANgay%20thuc%20hien%3A%2002%2F03%2F2024%0ANoi%20dung%3A%20Thay%20sensor%20huyet%20hoc%20va%20hieu%20chuan%20lai%20may.",
            size: 1520,
          },
          {
            id: "att-wo1-2",
            name: "Anh_hien_trang_thiet_bi.png",
            type: "image",
            url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%25' height='100%25' fill='%23f8fafc'/><text x='50%25' y='45%25' font-size='24' text-anchor='middle' fill='%23334155'>MOCK ATTACHMENT</text><text x='50%25' y='58%25' font-size='18' text-anchor='middle' fill='%2364748b'>WO001 - Device Snapshot</text></svg>",
            size: 2840,
          },
        ],
        status: "Đóng",
        engineerName: "Nguyễn Văn A",
        isCompleted: true,
        conclusion: "hoàn thành",
        createdAt: "2024-03-02T08:00:00",
      },
    ],
  },
];

// Mock History Logs
export const mockHistoryLogs: HistoryLog[] = [
  // === Module: Quản trị (Hệ thống) ===
  {
    id: "h1",
    actionCode: "ACT-000001",
    actionNumber: 1,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Đăng nhập hệ thống",
    description: "Người dùng đăng nhập thành công vào hệ thống",
    targetType: "Hệ thống",
    timestamp: "2026-03-02T08:00:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h1b",
    actionCode: "ACT-000009",
    actionNumber: 9,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Tạo người dùng mới",
    description: "Tạo tài khoản người dùng mới cho nhân viên Trần Văn A",
    targetType: "Hệ thống",
    targetId: "u10",
    targetName: "Trần Văn A",
    timestamp: "2026-03-01T14:30:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h1c",
    actionCode: "ACT-000010",
    actionNumber: 10,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Cập nhật quyền profile",
    description: "Cập nhật quyền của profile Kỹ thuật viên",
    targetType: "Hệ thống",
    timestamp: "2026-02-28T10:15:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h1d",
    actionCode: "ACT-000011",
    actionNumber: 11,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Cấu hình hệ thống",
    description: "Cập nhật cấu hình tự động xóa lịch sử sau 90 ngày",
    targetType: "Hệ thống",
    timestamp: "2026-02-25T09:00:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h1e",
    actionCode: "ACT-000012",
    actionNumber: 12,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Thêm khoa phòng mới",
    description: "Thêm khoa mới: Phòng Giải phẫu bệnh",
    targetType: "Hệ thống",
    timestamp: "2026-02-20T11:30:00",
    ipAddress: "192.168.1.100",
  },
  // === Module: Thiết bị mới (Đề xuất) ===
  {
    id: "h4",
    actionCode: "ACT-000004",
    actionNumber: 4,
    userId: "3",
    userName: "Lê Văn Trưởng Phòng",
    userRole: "Trưởng phòng xét nghiệm",
    action: "Đề xuất thiết bị mới",
    description: "Tạo đề xuất PDX-2026-001 - Máy xét nghiệm nước tiểu tự động",
    targetType: "Đề xuất",
    targetId: "p1",
    targetName: "PDX-2026-001",
    timestamp: "2026-03-01T14:00:00",
    ipAddress: "192.168.1.103",
  },
  {
    id: "h5",
    actionCode: "ACT-000005",
    actionNumber: 5,
    userId: "2",
    userName: "Trần Thị Giám Đốc",
    userRole: "Giám đốc",
    action: "Phê duyệt đề xuất",
    description: "Phê duyệt đề xuất PDX-2026-001 - Máy xét nghiệm nước tiểu tự động",
    targetType: "Đề xuất",
    targetId: "p1",
    targetName: "PDX-2026-001",
    timestamp: "2026-03-01T16:00:00",
    ipAddress: "192.168.1.101",
  },
  {
    id: "h4b",
    actionCode: "ACT-000013",
    actionNumber: 13,
    userId: "3",
    userName: "Lê Văn Trưởng Phòng",
    userRole: "Trưởng phòng xét nghiệm",
    action: "Tạo đề xuất thiết bị",
    description: "Tạo đề xuất PDX-2026-002 - Máy huyết học tự động",
    targetType: "Đề xuất",
    targetId: "p2",
    targetName: "PDX-2026-002",
    timestamp: "2026-02-28T09:30:00",
    ipAddress: "192.168.1.103",
  },
  {
    id: "h4c",
    actionCode: "ACT-000014",
    actionNumber: 14,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Gửi đề xuất duyệt",
    description: "Gửi đề xuất PDX-2026-003 lên phê duyệt",
    targetType: "Đề xuất",
    targetId: "p3",
    targetName: "PDX-2026-003",
    timestamp: "2026-02-27T11:45:00",
    ipAddress: "192.168.1.102",
  },
  {
    id: "h5b",
    actionCode: "ACT-000015",
    actionNumber: 15,
    userId: "2",
    userName: "Trần Thị Giám Đốc",
    userRole: "Giám đốc",
    action: "Từ chối đề xuất",
    description: "Từ chối đề xuất PDX-2026-003 - Chưa đủ chi tiết kỹ thuật",
    targetType: "Đề xuất",
    targetId: "p3",
    targetName: "PDX-2026-003",
    timestamp: "2026-02-27T15:20:00",
    ipAddress: "192.168.1.101",
  },
  {
    id: "h4d",
    actionCode: "ACT-000016",
    actionNumber: 16,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Đăng ký thiết bị mới",
    description: "Đăng ký thiết bị TB-006 từ đề xuất PDX-2026-001",
    targetType: "Đề xuất",
    targetId: "p1",
    targetName: "TB-006",
    timestamp: "2026-03-01T17:30:00",
    ipAddress: "192.168.1.105",
  },
  // === Module: Hồ sơ thiết bị (Thiết bị) ===
  {
    id: "h2",
    actionCode: "ACT-000002",
    actionNumber: 2,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Cập nhật hồ sơ thiết bị",
    description: "Cập nhật thông tin thiết bị TB-003 - Máy miễn dịch tự động",
    targetType: "Thiết bị",
    targetId: "d3",
    targetName: "Máy miễn dịch tự động (TB-003)",
    timestamp: "2026-03-02T09:15:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h6",
    actionCode: "ACT-000006",
    actionNumber: 6,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Thêm thiết bị mới",
    description: "Thêm thiết bị TB-005 - Máy ly tâm lạnh vào hệ thống",
    targetType: "Thiết bị",
    targetId: "d5",
    targetName: "Máy ly tâm lạnh (TB-005)",
    timestamp: "2026-02-15T11:00:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h8",
    actionCode: "ACT-000008",
    actionNumber: 8,
    userId: "5",
    userName: "Hoàng Văn Chất Lượng",
    userRole: "Quản lý chất lượng",
    action: "Đề xuất hiệu chuẩn",
    description: "Đề xuất hiệu chuẩn khẩn cấp cho thiết bị TB-003",
    targetType: "Thiết bị",
    targetId: "d3",
    targetName: "Máy miễn dịch tự động (TB-003)",
    timestamp: "2026-03-01T11:00:00",
    ipAddress: "192.168.1.104",
  },
  {
    id: "h2b",
    actionCode: "ACT-000017",
    actionNumber: 17,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Cập nhật tình trạng",
    description: "Cập nhật trạng thái thiết bị TB-003 sang Tạm dừng",
    targetType: "Thiết bị",
    targetId: "d3",
    targetName: "Máy miễn dịch tự động (TB-003)",
    timestamp: "2026-02-28T14:00:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h2c",
    actionCode: "ACT-000018",
    actionNumber: 18,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Cập nhật thông tin liên hệ",
    description: "Cập nhật thông tin người liên hệ cho thiết bị TB-001",
    targetType: "Thiết bị",
    targetId: "d1",
    targetName: "Máy phân tích huyết học (TB-001)",
    timestamp: "2026-02-27T10:30:00",
    ipAddress: "192.168.1.102",
  },
  {
    id: "h2d",
    actionCode: "ACT-000019",
    actionNumber: 19,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Chuyển quản lý thiết bị",
    description: "Chuyển quản lý thiết bị TB-002 cho người dùng mới",
    targetType: "Thiết bị",
    targetId: "d2",
    targetName: "Máy sinh hóa tự động (TB-002)",
    timestamp: "2026-02-26T16:00:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h2e",
    actionCode: "ACT-000020",
    actionNumber: 20,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Thêm thiết bị",
    description: "Thêm thiết bị TB-007 - Kính hiển vi fluorescence vào hệ thống",
    targetType: "Thiết bị",
    targetId: "d7",
    targetName: "Kính hiển vi fluorescence (TB-007)",
    timestamp: "2026-02-20T09:45:00",
    ipAddress: "192.168.1.100",
  },
  // === Module: Hồ sơ thiết bị (Sự cố) ===
  {
    id: "h3",
    actionCode: "ACT-000003",
    actionNumber: 3,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Báo cáo sự cố",
    description: "Tạo báo cáo sự cố PSC-2026-001 cho thiết bị TB-003",
    targetType: "Sự cố",
    targetId: "i1",
    targetName: "PSC-2026-001",
    timestamp: "2026-03-01T10:30:00",
    ipAddress: "192.168.1.102",
  },
  {
    id: "h3b",
    actionCode: "ACT-000021",
    actionNumber: 21,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Phê duyệt báo cáo sự cố",
    description: "Phê duyệt báo cáo sự cố PSC-2026-001",
    targetType: "Sự cố",
    targetId: "i1",
    targetName: "PSC-2026-001",
    timestamp: "2026-03-01T14:00:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h3c",
    actionCode: "ACT-000022",
    actionNumber: 22,
    userId: "5",
    userName: "Hoàng Văn Chất Lượng",
    userRole: "Quản lý chất lượng",
    action: "Cập nhật tiến trình sự cố",
    description: "Cập nhật trạng thái sự cố PSC-2026-001 sang Đang khắc phục",
    targetType: "Sự cố",
    targetId: "i1",
    targetName: "PSC-2026-001",
    timestamp: "2026-03-02T08:30:00",
    ipAddress: "192.168.1.104",
  },
  {
    id: "h3d",
    actionCode: "ACT-000023",
    actionNumber: 23,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Tạo báo cáo sự cố",
    description: "Tạo báo cáo sự cố PSC-2026-002 cho thiết bị TB-001",
    targetType: "Sự cố",
    targetId: "i2",
    targetName: "PSC-2026-002",
    timestamp: "2026-02-25T11:15:00",
    ipAddress: "192.168.1.102",
  },
  {
    id: "h3e",
    actionCode: "ACT-000024",
    actionNumber: 24,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Hoàn thành sự cố",
    description: "Đánh dấu hoàn thành sự cố PSC-2026-002",
    targetType: "Sự cố",
    targetId: "i2",
    targetName: "PSC-2026-002",
    timestamp: "2026-02-28T17:00:00",
    ipAddress: "192.168.1.105",
  },
  // === Module: Hồ sơ thiết bị (Lịch - Hiệu chuẩn/Bảo dưỡng) ===
  {
    id: "h7",
    actionCode: "ACT-000007",
    actionNumber: 7,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Lên lịch hiệu chuẩn",
    description: "Lên lịch hiệu chuẩn cho thiết bị TB-001 vào ngày 10/07/2026",
    targetType: "Lịch",
    targetId: "s1",
    targetName: "Lịch hiệu chuẩn TB-001",
    timestamp: "2026-01-10T15:30:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h7b",
    actionCode: "ACT-000025",
    actionNumber: 25,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Lên lịch bảo dưỡng",
    description: "Lên lịch bảo dưỡng định kỳ cho thiết bị TB-002",
    targetType: "Lịch",
    targetId: "s2",
    targetName: "Lịch bảo dưỡng TB-002",
    timestamp: "2026-02-01T10:00:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h7c",
    actionCode: "ACT-000026",
    actionNumber: 26,
    userId: "5",
    userName: "Hoàng Văn Chất Lượng",
    userRole: "Quản lý chất lượng",
    action: "Xác nhận hiệu chuẩn",
    description: "Xác nhận hoàn thành hiệu chuẩn thiết bị TB-004",
    targetType: "Lịch",
    targetId: "s3",
    targetName: "Lịch hiệu chuẩn TB-004",
    timestamp: "2026-02-25T14:30:00",
    ipAddress: "192.168.1.104",
  },
  {
    id: "h7d",
    actionCode: "ACT-000027",
    actionNumber: 27,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Cập nhật lịch bảo dưỡng",
    description: "Cập nhật lịch bảo dưỡng thiết bị TB-005",
    targetType: "Lịch",
    targetId: "s4",
    targetName: "Lịch bảo dưỡng TB-005",
    timestamp: "2026-02-20T09:00:00",
    ipAddress: "192.168.1.102",
  },
  // === Module: Quản lý chung ===
  {
    id: "h_gen_1",
    actionCode: "ACT-000028",
    actionNumber: 28,
    userId: "2",
    userName: "Trần Thị Giám Đốc",
    userRole: "Giám đốc",
    action: "Đăng nhập hệ thống",
    description: "Người dùng đăng nhập thành công vào hệ thống",
    targetType: "Hệ thống",
    timestamp: "2026-03-02T07:30:00",
    ipAddress: "192.168.1.101",
  },
  {
    id: "h_gen_2",
    actionCode: "ACT-000029",
    actionNumber: 29,
    userId: "3",
    userName: "Lê Văn Trưởng Phòng",
    userRole: "Trưởng phòng xét nghiệm",
    action: "Xem báo cáo",
    description: "Truy cập báo cáo tổng hợp thiết bị tháng 02/2026",
    targetType: "Hệ thống",
    timestamp: "2026-03-01T08:45:00",
    ipAddress: "192.168.1.103",
  },
  {
    id: "h_gen_3",
    actionCode: "ACT-000030",
    actionNumber: 30,
    userId: "5",
    userName: "Hoàng Văn Chất Lượng",
    userRole: "Quản lý chất lượng",
    action: "Xuất báo cáo",
    description: "Xuất file báo cáo hiệu chuẩn thiết bị quý 1/2026",
    targetType: "Hệ thống",
    timestamp: "2026-02-28T16:20:00",
    ipAddress: "192.168.1.104",
  },
  {
    id: "h_gen_4",
    actionCode: "ACT-000031",
    actionNumber: 31,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Đăng nhập hệ thống",
    description: "Người dùng đăng nhập thành công vào hệ thống",
    targetType: "Hệ thống",
    timestamp: "2026-03-02T08:15:00",
    ipAddress: "192.168.1.102",
  },
  {
    id: "h_gen_5",
    actionCode: "ACT-000032",
    actionNumber: 32,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Xem danh sách thiết bị",
    description: "Truy cập danh sách thiết bị đang vận hành",
    targetType: "Hệ thống",
    timestamp: "2026-03-01T13:00:00",
    ipAddress: "192.168.1.105",
  },
];

// Exported user list for approver selection
export const MOCK_USERS_LIST: { id: string; fullName: string; role: string; email?: string }[] = [
  { id: "1", fullName: "Nguyễn Văn Admin", role: "Admin", email: "levancong.hmtu@gmail.com" },
  { id: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", email: "cong.le@roche.com" },
  { id: "3", fullName: "Lê Văn Trưởng Phòng", role: "Trưởng phòng xét nghiệm", email: "truongphong@labhouse.vn" },
  { id: "4", fullName: "Phạm Thị Kỹ Thuật", role: "Kỹ thuật viên", email: "ktv@labhouse.vn" },
  { id: "5", fullName: "Hoàng Văn Chất Lượng", role: "Quản lý chất lượng", email: "qlcl@labhouse.vn" },
  { id: "6", fullName: "Vũ Thị Thiết Bị", role: "Quản lý trang thiết bị", email: "qltb@labhouse.vn" },
];

export const departments = [
  "Huyết học",
  "Sinh hóa",
  "Miễn dịch",
  "Vi sinh",
  "Sinh học phân tử",
  "Tiền xử lý",
  "Tổng quát",
  "Nước tiểu",
];

// Configurable lists
export const specialties = ["Huyết học", "Hóa sinh", "Vi sinh", "Giải phẫu bệnh"];
export const deviceCategories = ["Máy xét nghiệm chính", "Thiết bị phụ trợ"];
export const deviceTypes = [
  "Máy xét nghiệm chính",
  "Máy thành phần",
  "Máy ủ & sấy",
  "Kính hiển vi",
  "Máy ly tâm",
  "Tủ lạnh & tủ âm sâu",
  "Nồi hấp",
  "Máy xử lý nước",
  "Tủ An toàn sinh học & Tủ thao tác PCR",
  "Tủ ấm",
  "Pippette",
  "Nhiệt kế & ẩm kế",
  "Máy vortex & spindown",
  "Cân",
  "Đầu đọc",
];
export const deviceLocations = [
  "Phòng hóa sinh – Huyết học",
  "Phòng nuôi cấy vi sinh",
  "Hành lang tầng 1",
  "Hành lang tầng 2",
  "Phòng kho",
  "Phòng tách chiết",
  "Phòng lưu mẫu và hấp sấy",
  "Phòng kháng sinh đồ",
  "Phòng chuẩn bị hóa chất",
];
export const countries = [
  "Việt Nam", "Nhật Bản", "Hoa Kỳ", "Đức", "Pháp", "Anh", "Hàn Quốc",
  "Trung Quốc", "Thụy Sĩ", "Thụy Điển", "Đan Mạch", "Hà Lan", "Ý", "Tây Ban Nha",
  "Canada", "Úc", "Singapore", "Đài Loan",
];

// Generate list of years from 1990 to current year
export const years = Array.from(
  { length: new Date().getFullYear() - 1990 + 1 },
  (_, i) => String(1990 + i)
).reverse();

// Helper to generate PDX code
export function generatePDXCode(existingProposals: NewDeviceProposal[]): string {
  const year = new Date().getFullYear();
  const yearStr = String(year);
  const sameYearProposals = existingProposals.filter((p) =>
    p.proposalCode.startsWith(`PDX-${yearStr}-`)
  );
  const nextNum = sameYearProposals.length + 1;
  return `PDX-${yearStr}-${String(nextNum).padStart(3, "0")}`;
}

// Helper to generate device code (following QL.TC.018 format)
export function generateDeviceCode(existingDevices: Device[]): string {
  const maxNum = existingDevices.reduce((max, d) => {
    const num = parseInt(d.code.replace("TB-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const nextNum = maxNum + 1;
  return `TB-${String(nextNum).padStart(3, "0")}`;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============ MOCK USER PROFILES ============

export const mockUserProfiles: UserProfile[] = [
  {
    id: "u1",
    username: "admin",
    password: "admin123",
    fullName: "Nguyễn Văn Admin",
    employeeId: "NV-001",
    phone: "0912345678",
    email: "levancong.hmtu@gmail.com",
    position: "Quản trị viên",
    department: "IT",
    branch: "LabHouse Central",
    signature: "",
    managedDevices: ["TB-001", "TB-002"],
    profileIds: ["p1"],
    isActive: true,
    createdAt: "2023-01-01T00:00:00",
  },
  {
    id: "u2",
    username: "giamdoc",
    password: "giamdoc123",
    fullName: "Trần Thị Giám Đốc",
    employeeId: "NV-002",
    phone: "0912345679",
    email: "cong.le@roche.com",
    position: "Giám đốc",
    department: "Ban Giám đốc",
    branch: "LabHouse Central",
    signature: "",
    managedDevices: [],
    profileIds: ["p2"],
    isActive: true,
    createdAt: "2023-01-01T00:00:00",
  },
  {
    id: "u3",
    username: "truongphong",
    password: "truongphong123",
    fullName: "Lê Văn Trưởng Phòng",
    employeeId: "NV-003",
    phone: "0912345680",
    email: "truongphong@labhouse.vn",
    position: "Trưởng phòng xét nghiệm",
    department: "Huyết học",
    branch: "LabHouse Central",
    signature: "",
    managedDevices: ["TB-005"],
    profileIds: ["p3"],
    isActive: true,
    createdAt: "2023-03-01T00:00:00",
  },
  {
    id: "u4",
    username: "ktv",
    password: "ktv123",
    fullName: "Phạm Thị Kỹ Thuật",
    employeeId: "NV-004",
    phone: "0912345681",
    email: "ktv@labhouse.vn",
    position: "Kỹ thuật viên",
    department: "Huyết học",
    branch: "LabHouse Central",
    signature: "",
    managedDevices: ["TB-001"],
    profileIds: ["p4"],
    isActive: true,
    createdAt: "2023-03-15T00:00:00",
  },
  {
    id: "u5",
    username: "qlcl",
    password: "qlcl123",
    fullName: "Hoàng Văn Chất Lượng",
    employeeId: "NV-005",
    phone: "0912345682",
    email: "qlcl@labhouse.vn",
    position: "Quản lý chất lượng",
    department: "Quản lý chất lượng",
    branch: "LabHouse Central",
    signature: "",
    managedDevices: ["TB-004"],
    profileIds: ["p4"],
    isActive: true,
    createdAt: "2023-04-01T00:00:00",
  },
  {
    id: "u6",
    username: "qltb",
    password: "qltb123",
    fullName: "Vũ Thị Thiết Bị",
    employeeId: "NV-006",
    phone: "0912345683",
    email: "qltb@labhouse.vn",
    position: "Quản lý trang thiết bị",
    department: "Thiết bị",
    branch: "LabHouse Central",
    signature: "",
    managedDevices: ["TB-003", "TB-006"],
    profileIds: ["p4"],
    isActive: true,
    createdAt: "2023-04-15T00:00:00",
  },
];

// ============ MOCK PROFILES ============

export const mockProfiles: Profile[] = [
  {
    id: "p1",
    code: "PF001",
    name: "Quản trị viên",
    description: "Toàn quyền quản lý hệ thống",
    permissions: [
      { id: "perm1", category: "quan_ly_chung", name: "Xem thông báo yêu cầu thiết bị mới", enabled: true },
      { id: "perm2", category: "quan_ly_chung", name: "Xem thông báo yêu cầu hiệu chuẩn", enabled: true },
      { id: "perm3", category: "quan_ly_chung", name: "Xem thông báo báo cáo sự cố", enabled: true },
      { id: "perm4", category: "thiet_bi_moi", name: "Cho phép vào mục thiết bị mới", enabled: true },
      { id: "perm5", category: "ho_so_thiet_bi", name: "Cho phép vào mục hồ sơ thiết bị", enabled: true },
      { id: "perm6", category: "ho_so_thiet_bi", name: "Cho phép vào mục tiếp nhận", enabled: true },
      { id: "perm7", category: "ho_so_thiet_bi", name: "Cho phép vào mục thông tin quản lý", enabled: true },
      { id: "perm8", category: "ho_so_thiet_bi", name: "Cho phép vào mục báo cáo sự cố", enabled: true },
      { id: "perm9", category: "ho_so_thiet_bi", name: "Cho phép vào mục hiệu chuẩn", enabled: true },
      { id: "perm10", category: "ho_so_thiet_bi", name: "Cho phép vào mục bảo dưỡng", enabled: true },
      { id: "perm11", category: "ho_so_thiet_bi", name: "Cho phép vào mục thanh lý", enabled: true },
      { id: "perm12", category: "quan_tri", name: "Cho phép vào phần quản trị", enabled: true },
      { id: "perm13", category: "quan_tri", name: "Cho phép cấu hình user và profile", enabled: true },
      { id: "perm14", category: "quan_tri", name: "Cho phép cấu hình khoa phòng", enabled: true },
      { id: "perm15", category: "lich_su", name: "Cho phép vào phần xem lịch sử", enabled: true },
    ],
    createdAt: "2023-01-01T00:00:00",
  },
  {
    id: "p2",
    code: "PF002",
    name: "Giám đốc",
    description: "Quản lý cấp cao, có quyền phê duyệt",
    permissions: [
      { id: "perm1", category: "quan_ly_chung", name: "Xem thông báo yêu cầu thiết bị mới", enabled: true },
      { id: "perm2", category: "quan_ly_chung", name: "Xem thông báo yêu cầu hiệu chuẩn", enabled: true },
      { id: "perm3", category: "quan_ly_chung", name: "Xem thông báo báo cáo sự cố", enabled: true },
      { id: "perm4", category: "thiet_bi_moi", name: "Cho phép vào mục thiết bị mới", enabled: true },
      { id: "perm5", category: "ho_so_thiet_bi", name: "Cho phép vào mục hồ sơ thiết bị", enabled: true },
      { id: "perm6", category: "ho_so_thiet_bi", name: "Cho phép vào mục tiếp nhận", enabled: true },
      { id: "perm7", category: "ho_so_thiet_bi", name: "Cho phép vào mục thông tin quản lý", enabled: true },
      { id: "perm8", category: "ho_so_thiet_bi", name: "Cho phép vào mục báo cáo sự cố", enabled: true },
      { id: "perm9", category: "ho_so_thiet_bi", name: "Cho phép vào mục hiệu chuẩn", enabled: true },
      { id: "perm10", category: "ho_so_thiet_bi", name: "Cho phép vào mục bảo dưỡng", enabled: false },
      { id: "perm11", category: "ho_so_thiet_bi", name: "Cho phép vào mục thanh lý", enabled: false },
      { id: "perm12", category: "quan_tri", name: "Cho phép vào phần quản trị", enabled: true },
      { id: "perm13", category: "quan_tri", name: "Cho phép cấu hình user và profile", enabled: false },
      { id: "perm14", category: "quan_tri", name: "Cho phép cấu hình khoa phòng", enabled: false },
      { id: "perm15", category: "lich_su", name: "Cho phép vào phần xem lịch sử", enabled: true },
    ],
    createdAt: "2023-01-01T00:00:00",
  },
  {
    id: "p3",
    code: "PF003",
    name: "Trưởng phòng",
    description: "Quản lý phòng xét nghiệm, phê duyệt đề xuất",
    permissions: [
      { id: "perm1", category: "quan_ly_chung", name: "Xem thông báo yêu cầu thiết bị mới", enabled: true },
      { id: "perm2", category: "quan_ly_chung", name: "Xem thông báo yêu cầu hiệu chuẩn", enabled: false },
      { id: "perm3", category: "quan_ly_chung", name: "Xem thông báo báo cáo sự cố", enabled: true },
      { id: "perm4", category: "thiet_bi_moi", name: "Cho phép vào mục thiết bị mới", enabled: true },
      { id: "perm5", category: "ho_so_thiet_bi", name: "Cho phép vào mục hồ sơ thiết bị", enabled: true },
      { id: "perm6", category: "ho_so_thiet_bi", name: "Cho phép vào mục tiếp nhận", enabled: false },
      { id: "perm7", category: "ho_so_thiet_bi", name: "Cho phép vào mục thông tin quản lý", enabled: true },
      { id: "perm8", category: "ho_so_thiet_bi", name: "Cho phép vào mục báo cáo sự cố", enabled: true },
      { id: "perm9", category: "ho_so_thiet_bi", name: "Cho phép vào mục hiệu chuẩn", enabled: false },
      { id: "perm10", category: "ho_so_thiet_bi", name: "Cho phép vào mục bảo dưỡng", enabled: false },
      { id: "perm11", category: "ho_so_thiet_bi", name: "Cho phép vào mục thanh lý", enabled: false },
      { id: "perm12", category: "quan_tri", name: "Cho phép vào phần quản trị", enabled: false },
      { id: "perm13", category: "quan_tri", name: "Cho phép cấu hình user và profile", enabled: false },
      { id: "perm14", category: "quan_tri", name: "Cho phép cấu hình khoa phòng", enabled: false },
      { id: "perm15", category: "lich_su", name: "Cho phép vào phần xem lịch sử", enabled: true },
    ],
    createdAt: "2023-01-01T00:00:00",
  },
  {
    id: "p4",
    code: "PF004",
    name: "Nhân viên",
    description: "Nhân viên kỹ thuật, thực hiện công việc được giao",
    permissions: [
      { id: "perm1", category: "quan_ly_chung", name: "Xem thông báo yêu cầu thiết bị mới", enabled: false },
      { id: "perm2", category: "quan_ly_chung", name: "Xem thông báo yêu cầu hiệu chuẩn", enabled: false },
      { id: "perm3", category: "quan_ly_chung", name: "Xem thông báo báo cáo sự cố", enabled: false },
      { id: "perm4", category: "thiet_bi_moi", name: "Cho phép vào mục thiết bị mới", enabled: true },
      { id: "perm5", category: "ho_so_thiet_bi", name: "Cho phép vào mục hồ sơ thiết bị", enabled: true },
      { id: "perm6", category: "ho_so_thiet_bi", name: "Cho phép vào mục tiếp nhận", enabled: false },
      { id: "perm7", category: "ho_so_thiet_bi", name: "Cho phép vào mục thông tin quản lý", enabled: false },
      { id: "perm8", category: "ho_so_thiet_bi", name: "Cho phép vào mục báo cáo sự cố", enabled: true },
      { id: "perm9", category: "ho_so_thiet_bi", name: "Cho phép vào mục hiệu chuẩn", enabled: true },
      { id: "perm10", category: "ho_so_thiet_bi", name: "Cho phép vào mục bảo dưỡng", enabled: true },
      { id: "perm11", category: "ho_so_thiet_bi", name: "Cho phép vào mục thanh lý", enabled: false },
      { id: "perm12", category: "quan_tri", name: "Cho phép vào phần quản trị", enabled: false },
      { id: "perm13", category: "quan_tri", name: "Cho phép cấu hình user và profile", enabled: false },
      { id: "perm14", category: "quan_tri", name: "Cho phép cấu hình khoa phòng", enabled: false },
      { id: "perm15", category: "lich_su", name: "Cho phép vào phần xem lịch sử", enabled: false },
    ],
    createdAt: "2023-01-01T00:00:00",
  },
];

// ============ MOCK BRANCHES ============

export const mockBranches: Branch[] = [
  {
    id: "b1",
    name: "LabHouse Central",
    code: "CN001",
    isActive: true,
    createdAt: "2023-01-01T00:00:00",
  },
  {
    id: "b2",
    name: "LabHouse District 1",
    code: "CN002",
    isActive: true,
    createdAt: "2023-01-01T00:00:00",
  },
];

// ============ MOCK DEPARTMENTS (Khoa phòng) ============

export const mockDepartments: Department[] = [
  { id: "d1", name: "Huyết học", code: "KP001", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d2", name: "Sinh hóa", code: "KP002", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d3", name: "Vi sinh", code: "KP003", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d4", name: "Miễn dịch", code: "KP004", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d5", name: "IT", code: "KP005", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d6", name: "Ban Giám đốc", code: "KP006", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d7", name: "Quản lý chất lượng", code: "KP007", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d8", name: "Thiết bị", code: "KP008", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "d9", name: "Tổng quát", code: "KP009", branchId: "b2", branchName: "LabHouse District 1", isActive: true, createdAt: "2023-01-01T00:00:00" },
];

// ============ MOCK POSITIONS ============

export const mockPositions: Position[] = [
  { id: "pos1", name: "Giám đốc", code: "VT001", departmentId: "d6", departmentName: "Ban Giám đốc", branchId: "b1", branchName: "LabHouse Central", description: "Giám đốc trung tâm", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos2", name: "Phó Giám đốc", code: "VT002", departmentId: "d6", departmentName: "Ban Giám đốc", branchId: "b1", branchName: "LabHouse Central", description: "Phó Giám đốc", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos3", name: "Trưởng phòng xét nghiệm", code: "VT003", departmentId: "d1", departmentName: "Huyết học", branchId: "b1", branchName: "LabHouse Central", description: "Trưởng phòng xét nghiệm", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos4", name: "Trưởng nhóm", code: "VT004", departmentId: "d1", departmentName: "Huyết học", branchId: "b1", branchName: "LabHouse Central", description: "Trưởng nhóm", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos5", name: "Kỹ thuật viên", code: "VT005", departmentId: "d1", departmentName: "Huyết học", branchId: "b1", branchName: "LabHouse Central", description: "Kỹ thuật viên xét nghiệm", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos6", name: "Quản lý chất lượng", code: "VT006", departmentId: "d7", departmentName: "Quản lý chất lượng", branchId: "b1", branchName: "LabHouse Central", description: "Quản lý chất lượng", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos7", name: "Quản lý trang thiết bị", code: "VT007", departmentId: "d8", departmentName: "Thiết bị", branchId: "b1", branchName: "LabHouse Central", description: "Quản lý trang thiết bị", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "pos8", name: "Quản trị viên", code: "VT008", departmentId: "d5", departmentName: "IT", branchId: "b1", branchName: "LabHouse Central", description: "Quản trị hệ thống", isActive: true, createdAt: "2023-01-01T00:00:00" },
];

// ============ MOCK INSTALLATION LOCATIONS ============

export const mockInstallationLocations: InstallationLocation[] = [
  { id: "loc1", name: "Phòng xét nghiệm Huyết học", code: "VT001", departmentId: "d1", departmentName: "Huyết học", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "loc2", name: "Phòng xét nghiệm Sinh hóa", code: "VT002", departmentId: "d2", departmentName: "Sinh hóa", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "loc3", name: "Phòng Vi sinh", code: "VT003", departmentId: "d3", departmentName: "Vi sinh", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "loc4", name: "Kho thiết bị", code: "VT004", departmentId: "d8", departmentName: "Thiết bị", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
  { id: "loc5", name: "Phòng IT", code: "VT005", departmentId: "d5", departmentName: "IT", branchId: "b1", branchName: "LabHouse Central", isActive: true, createdAt: "2023-01-01T00:00:00" },
];

// ============ MOCK SUPPLIERS ============

export const mockSuppliers: Supplier[] = [
  { id: "sup1", name: "Công ty TNHH Thiết bị Y tế ABC", code: "NCC-001", address: "123 Đường ABC, TP.HCM", phone: "02812345678", email: "abc@company.com", contactPerson: "Nguyễn Văn A", isActive: true },
  { id: "sup2", name: "Công ty CP Thiết bị Y tế XYZ", code: "NCC-002", address: "456 Đường XYZ, TP.HCM", phone: "02823456789", email: "xyz@company.com", contactPerson: "Trần Thị B", isActive: true },
  { id: "sup3", name: "Công ty TNHH Dược phẩm DEF", code: "NCC-003", address: "789 Đường DEF, TP.HCM", phone: "02834567890", email: "def@company.com", contactPerson: "Lê Văn C", isActive: true },
  { id: "sup4", name: "Công ty TNHH Thiết bị Y tế GHI", code: "NCC-004", address: "321 Đường GHI, TP.HCM", phone: "02845678901", email: "ghi@company.com", contactPerson: "Phạm Văn D", isActive: true },
  { id: "sup5", name: "Công ty MNO", code: "NCC-005", address: "654 Đường MNO, TP.HCM", phone: "02856789012", email: "mno@company.com", contactPerson: "Hoàng Văn E", isActive: true },
];

// ============ MOCK HISTORY CONFIG ============

export const mockHistoryConfig: HistoryConfig = {
  autoDeleteEnabled: false,
  deleteAfterDays: 365,
};

export const mockScopePermissions: DataScopePermission[] = [
  {
    id: "scope_1",
    profileId: "p1",
    profileName: "Quản trị viên",
    branchIds: ["b1", "b2"],
    departmentIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9"],
    deviceTypes: [...deviceTypes],
    isActive: true,
    createdAt: "2024-01-01T08:00:00",
  },
  {
    id: "scope_2",
    profileId: "p4",
    profileName: "Nhân viên",
    branchIds: ["b1"],
    departmentIds: ["d1", "d8"],
    deviceTypes: ["Máy xét nghiệm chính", "Máy thành phần", "Máy ly tâm"],
    isActive: true,
    createdAt: "2024-01-03T08:00:00",
  },
];

export const mockRoleTemplates: RoleTemplate[] = [
  {
    id: "rt_1",
    code: "TPL-ADMIN",
    name: "Template Admin",
    description: "Template đầy đủ quyền quản trị và dữ liệu",
    profileIds: ["p1"],
    defaultScope: {
      branchIds: ["b1", "b2"],
      departmentIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9"],
      deviceTypes: [...deviceTypes],
    },
    isActive: true,
    createdAt: "2024-01-05T08:00:00",
  },
  {
    id: "rt_2",
    code: "TPL-QA",
    name: "Template QA",
    description: "Template cho quản lý chất lượng",
    profileIds: ["p3", "p4"],
    defaultScope: {
      branchIds: ["b1"],
      departmentIds: ["d7"],
      deviceTypes: ["Máy xét nghiệm chính", "Tủ An toàn sinh học & Tủ thao tác PCR", "Máy PCR"],
    },
    isActive: true,
    createdAt: "2024-01-06T08:00:00",
  },
  {
    id: "rt_3",
    code: "TPL-KT",
    name: "Template Kỹ thuật",
    description: "Template cho kỹ thuật viên vận hành",
    profileIds: ["p4"],
    defaultScope: {
      branchIds: ["b1"],
      departmentIds: ["d1", "d8"],
      deviceTypes: ["Máy xét nghiệm chính", "Máy ly tâm", "Máy vortex & spindown"],
    },
    isActive: true,
    createdAt: "2024-01-07T08:00:00",
  },
];

export const mockSecurityPolicy: SecurityPolicy = {
  minPasswordLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 120,
  maxConcurrentSessions: 2,
  forceLogoutVersion: 1,
  updatedAt: "2024-01-08T08:00:00",
};

export const mockConfigAuditLogs: ConfigAuditLog[] = [
  {
    id: "audit_1",
    actorName: "Nguyễn Văn Admin",
    action: "update",
    targetType: "history_config",
    targetId: "history-config",
    targetName: "Cấu hình lịch sử",
    before: { autoDeleteEnabled: false, deleteAfterDays: 365 },
    after: { autoDeleteEnabled: true, deleteAfterDays: 180 },
    changedFields: ["autoDeleteEnabled", "deleteAfterDays"],
    changedAt: "2024-01-10T09:30:00",
  },
  {
    id: "audit_2",
    actorName: "Nguyễn Văn Admin",
    action: "update",
    targetType: "profile",
    targetId: "p3",
    targetName: "Trưởng phòng",
    before: { isActive: true },
    after: { isActive: false },
    changedFields: ["isActive"],
    changedAt: "2024-01-11T10:15:00",
  },
];

// ============ MOCK TRANSFER PROPOSALS ============

export interface TransferProposal {
  id: string;
  transferCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  plannedTransferDate: string;
  requestedBy: string;
  approver: string;
  status: "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Hoàn thành";
  createdAt: string;
  updatedAt?: string;
}

export const mockTransferProposals: TransferProposal[] = [
  {
    id: "tp1",
    transferCode: "DXC-2024-001",
    deviceId: "d3",
    deviceCode: "TB-003",
    deviceName: "Máy miễn dịch tự động",
    fromLocation: "Phòng nuôi cấy vi sinh",
    toLocation: "Phòng hóa sinh – Huyết học",
    reason: "Cần di chuyển máy sang phòng hóa sinh để phục vụ nhu cầu xét nghiệm tăng cao",
    plannedTransferDate: "2024-04-15",
    requestedBy: "Vũ Thị Thiết Bị",
    approver: "Lê Văn Trưởng Phòng",
    status: "Chờ duyệt",
    createdAt: "2024-03-01T10:00:00",
  },
  {
    id: "tp2",
    transferCode: "DXC-2024-002",
    deviceId: "d6",
    deviceCode: "TB-006",
    deviceName: "Tủ an toàn sinh học cấp II",
    fromLocation: "Phòng nuôi cấy vi sinh",
    toLocation: "Phòng Sinh học phân tử",
    reason: "Chuyển sang phòng PCR do nhu cầu mở rộng xét nghiệm COVID-19",
    plannedTransferDate: "2024-04-01",
    requestedBy: "Vũ Thị Thiết Bị",
    approver: "Trần Thị Giám Đốc",
    status: "Đã duyệt",
    createdAt: "2024-02-20T14:30:00",
  },
  {
    id: "tp3",
    transferCode: "DXC-2024-003",
    deviceId: "d4",
    deviceCode: "TB-004",
    deviceName: "Máy PCR Real-time",
    fromLocation: "Phòng tách chiết",
    toLocation: "Phòng Vi sinh",
    reason: "Tái phân bổ thiết bị theo kế hoạch sắp xếp lại phòng Lab",
    plannedTransferDate: "2024-05-10",
    requestedBy: "Hoàng Văn Chất Lượng",
    approver: "Lê Văn Trưởng Phòng",
    status: "Hoàn thành",
    createdAt: "2024-01-15T09:00:00",
    updatedAt: "2024-02-01T11:00:00",
  },
];

// ============ MOCK LIQUIDATION PROPOSALS ============

export interface LiquidationProposal {
  id: string;
  liquidationCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  reason: string;
  method: string;
  estimatedValue: string;
  plannedDate: string;
  requestedBy: string;
  approver: string;
  status: "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Hoàn thành";
  createdAt: string;
  updatedAt?: string;
}

export const mockLiquidationProposals: LiquidationProposal[] = [
  {
    id: "lp1",
    liquidationCode: "TL-2024-001",
    deviceId: "d3",
    deviceCode: "TB-003",
    deviceName: "Máy miễn dịch tự động",
    reason: "Thiết bị đã cũ, thường xuyên hỏng hóc, chi phí bảo trì cao. Máy không còn phù hợp với nhu cầu xét nghiệm hiện tại.",
    method: "Thanh lý qua đấu thầu",
    estimatedValue: "500.000.000 VNĐ",
    plannedDate: "2024-06-30",
    requestedBy: "Vũ Thị Thiết Bị",
    approver: "Trần Thị Giám Đốc",
    status: "Chờ duyệt",
    createdAt: "2024-03-05T15:00:00",
  },
  {
    id: "lp2",
    liquidationCode: "TL-2024-002",
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    reason: "Máy đã hết thời gian sử dụng theo quy định, cần thay thế bằng thiết bị mới",
    method: "Thanh lý thanh lý",
    estimatedValue: "800.000.000 VNĐ",
    plannedDate: "2024-07-31",
    requestedBy: "Phạm Thị Kỹ Thuật",
    approver: "Trần Thị Giám Đốc",
    status: "Đã duyệt",
    createdAt: "2024-02-10T10:00:00",
  },
];

// ============ MOCK TRAINING PROPOSALS ============

export interface TrainingProposal {
  id: string;
  trainingCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  topic: string;
  trainer: string;
  traineeGroup: string;
  plannedDate: string;
  approver: string;
  status: "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Hoàn thành";
  createdAt: string;
  updatedAt?: string;
}

// ============ TRAINING MODULE TYPES ============

export type TrainingPlanStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Hoàn thành";
export type InstructorType = "Chuyên gia Hãng" | "KTV trưởng" | "Nội bộ";
export type TraineeResultStatus = "Chưa đánh giá" | "Đạt" | "Không đạt";

export interface TrainingTrainee {
  userId: string;
  fullName: string;
  employeeId: string;
  department: string;
  result: TraineeResultStatus;
  resultFile?: AttachedFile;
  completedAt?: string;
}

export interface TrainingPlan {
  id: string;
  planCode: string; // PDT-2026-003
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  topic: string;
  instructorType: InstructorType;
  instructorName: string;
  trainingDate: string;
  trainingTime?: string;
  location: string;
  trainees: TrainingTrainee[];
  approver: string;
  status: TrainingPlanStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

export interface TrainingDocument {
  id: string;
  deviceId: string;
  documentCode: string;
  documentName: string;
  documentType: "Slide" | "User Manual" | "SOP" | "Chứng chỉ" | "Khác";
  description?: string;
  file: AttachedFile;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TrainingResult {
  id: string;
  planId: string;
  planCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  trainingDate: string;
  instructorName: string;
  location: string;
  attendees: TrainingTrainee[];
  attendanceFile?: AttachedFile;
  certificateFile?: AttachedFile;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export const mockTrainingPlans: TrainingPlan[] = [
  {
    id: "tp1",
    planCode: "PDT-2026-001",
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    topic: "Hướng dẫn sử dụng và bảo trì cơ bản",
    instructorType: "Chuyên gia Hãng",
    instructorName: "Kỹ sư Sysmex - Nguyễn Văn A",
    trainingDate: "2026-04-20",
    trainingTime: "09:00",
    location: "Phòng Hội trường - Tầng 2",
    trainees: [
      { userId: "u2", fullName: "Nguyễn Văn B", employeeId: "NV002", department: "Phòng Xét nghiệm", result: "Đạt" },
      { userId: "u3", fullName: "Trần Thị C", employeeId: "NV003", department: "Phòng Xét nghiệm", result: "Đạt" },
      { userId: "u4", fullName: "Lê Văn D", employeeId: "NV004", department: "Phòng Xét nghiệm", result: "Chưa đánh giá" },
    ],
    approver: "Lê Văn Trưởng Phòng",
    status: "Đã duyệt",
    createdAt: "2026-03-10T08:00:00",
    createdBy: "admin",
  },
  {
    id: "tp2",
    planCode: "PDT-2026-002",
    deviceId: "d2",
    deviceCode: "TB-002",
    deviceName: "Máy sinh hóa tự động",
    topic: "Đào tạo nâng cao - Xử lý lỗi và bảo dưỡng",
    instructorType: "KTV trưởng",
    instructorName: "Trần Văn Trưởng nhóm",
    trainingDate: "2026-05-15",
    trainingTime: "14:00",
    location: "Khu vực máy - Tầng 1",
    trainees: [
      { userId: "u2", fullName: "Nguyễn Văn B", employeeId: "NV002", department: "Phòng Hóa sinh", result: "Chưa đánh giá" },
    ],
    approver: "Trần Thị Giám Đốc",
    status: "Chờ duyệt",
    createdAt: "2026-02-28T14:00:00",
    createdBy: "admin",
  },
];

export const mockTrainingDocuments: TrainingDocument[] = [
  {
    id: "td1",
    deviceId: "d1",
    documentCode: "DOC-TB001-001",
    documentName: "Hướng dẫn sử dụng máy phân tích huyết học Sysmex XN-1000",
    documentType: "User Manual",
    description: "Manual hướng dẫn sử dụng chi tiết từng tính năng",
    file: { name: "Sysmex_XN1000_User_Manual.pdf", url: "#", size: 5242880, type: "application/pdf" },
    uploadedBy: "admin",
    uploadedAt: "2026-01-15T10:00:00",
  },
  {
    id: "td2",
    deviceId: "d1",
    documentCode: "DOC-TB001-002",
    documentName: "SOP Vận hành máy phân tích huyết học",
    documentType: "SOP",
    description: "Quy trình vận hành chuẩn (Standard Operating Procedure)",
    file: { name: "SOP_May_Huyet_Hoc.pdf", url: "#", size: 1048576, type: "application/pdf" },
    uploadedBy: "admin",
    uploadedAt: "2026-01-15T11:00:00",
  },
  {
    id: "td3",
    deviceId: "d1",
    documentCode: "DOC-TB001-003",
    documentName: "Slide buổi đào tạo ngày 20/04/2026",
    documentType: "Slide",
    description: "Bài giảng PowerPoint từ buổi đào tạo",
    file: { name: "Slide_Dao_Tao_20_04.pptx", url: "#", size: 8388608, type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
    uploadedBy: "admin",
    uploadedAt: "2026-04-20T17:00:00",
  },
  {
    id: "td4",
    deviceId: "d2",
    documentCode: "DOC-TB002-001",
    documentName: "Hướng dẫn sử dụng máy sinh hóa Beckman Coulter",
    documentType: "User Manual",
    description: "Manual vận hành máy",
    file: { name: "Beckman_Coulter_Manual.pdf", url: "#", size: 6291456, type: "application/pdf" },
    uploadedBy: "admin",
    uploadedAt: "2026-02-01T09:00:00",
  },
];

export const mockTrainingResults: TrainingResult[] = [
  {
    id: "trs1",
    planId: "tp1",
    planCode: "PDT-2026-001",
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    trainingDate: "2026-04-20",
    instructorName: "Kỹ sư Sysmex - Nguyễn Văn A",
    location: "Phòng Hội trường - Tầng 2",
    attendees: [
      { userId: "u2", fullName: "Nguyễn Văn B", employeeId: "NV002", department: "Phòng Xét nghiệm", result: "Đạt" },
      { userId: "u3", fullName: "Trần Thị C", employeeId: "NV003", department: "Phòng Xét nghiệm", result: "Đạt" },
    ],
    attendanceFile: { name: "Diem_danh_PDT-2026-001.pdf", url: "#", size: 512000, type: "application/pdf" },
    recordedBy: "admin",
    recordedAt: "2026-04-20T18:00:00",
  },
];

export const mockTrainingProposals: TrainingProposal[] = [
  {
    id: "tr1",
    trainingCode: "DT-2024-001",
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    topic: "Hướng dẫn sử dụng và bảo trì cơ bản",
    trainer: "Kỹ sư Sysmex - Nguyễn Văn A",
    traineeGroup: "Nhân viên kỹ thuật",
    plannedDate: "2024-04-20",
    approver: "Lê Văn Trưởng Phòng",
    status: "Chờ duyệt",
    createdAt: "2024-03-10T08:00:00",
  },
  {
    id: "tr2",
    trainingCode: "DT-2024-002",
    deviceId: "d2",
    deviceCode: "TB-002",
    deviceName: "Máy sinh hóa tự động",
    topic: "Đào tạo nâng cao - Xử lý lỗi và bảo dưỡng",
    trainer: "Kỹ sư Beckman Coulter - Trần Văn B",
    traineeGroup: "Toàn bộ nhân viên phòng Hóa sinh",
    plannedDate: "2024-05-15",
    approver: "Trần Thị Giám Đốc",
    status: "Đã duyệt",
    createdAt: "2024-02-28T14:00:00",
  },
  {
    id: "tr3",
    trainingCode: "DT-2024-003",
    deviceId: "d4",
    deviceCode: "TB-004",
    deviceName: "Máy PCR Real-time",
    topic: "Thực hành xét nghiệm COVID-19",
    trainer: "Kỹ sư Bio-Rad - Lê Văn C",
    traineeGroup: "Nhân viên phòng Vi sinh",
    plannedDate: "2024-03-25",
    approver: "Lê Văn Trưởng Phòng",
    status: "Hoàn thành",
    createdAt: "2024-03-01T11:00:00",
    updatedAt: "2024-03-25T17:00:00",
  },
];

// ============ MOCK ACCEPTANCE RECORDS ============

export interface AcceptanceItemKey {
  key:
    | "approvalForm"
    | "handoverRecord"
    | "installationSurvey"
    | "userManual"
    | "co"
    | "cq"
    | "contract"
    | "installationReport"
    | "usageConfirmation";
  label: string;
}

export const acceptanceItemKeys: AcceptanceItemKey[] = [
  { key: "approvalForm", label: "Phiếu đề nghị mua sắm/duyệt mua" },
  { key: "handoverRecord", label: "Biên bàn bàn giao" },
  { key: "installationSurvey", label: "Phiếu khảo sát lắp đặt (BM.05)" },
  { key: "userManual", label: "Sổ tay hướng dẫn sử dụng" },
  { key: "co", label: "Chứng chỉ CO" },
  { key: "cq", label: "Chứng chỉ CQ" },
  { key: "contract", label: "Hợp đồng mua bán" },
  { key: "installationReport", label: "Biên bản lắp đặt/hiệu chuẩn" },
  { key: "usageConfirmation", label: "Xác nhận bắt đầu sử dụng" },
];

export interface AcceptanceItemState {
  status: "missing" | "pending" | "done";
  files: AttachedFile[];
  refCode?: string;
}

export interface InstallationSurveyFormState {
  surveyDate: string;
  hasPowerSupply: boolean | null;
  hasGrounding: boolean | null;
  hasBenchSpace: boolean | null;
  hasTemperatureControl: boolean | null;
  hasHumidityControl: boolean | null;
  hasNetwork: boolean | null;
  hasWaterLine: boolean | null;
  conclusion: string;
  approver: string;
  surveyor: string;
  relatedUsers: string[];
  attachments: AttachedFile[];
  status: "Nháp" | "Chờ duyệt" | "Đã duyệt";
  approvedAt?: string;
}

export interface NewAcceptanceRecord {
  approvalCode: string;
  items: Record<string, AcceptanceItemState>;
  installationSurveyForm: InstallationSurveyFormState;
}

export interface ReturnAcceptanceFormState {
  formName: string;
  formCode: string;
  receiveCondition: string;
  note: string;
  handoverBy: string;
  receivedAt: string;
  receiver: string;
  attachments: AttachedFile[];
  completed: boolean;
  completedAt?: string;
  createdBy: string;
}

export interface ReturnAcceptanceRecord {
  handoverCode: string;
  handoverFiles: AttachedFile[];
  acceptanceForm?: ReturnAcceptanceFormState;
}

export interface ReturnTransportRow {
  id: string;
  transferCode: string;
  handoverCode: string;
  acceptanceCode: string;
  deviceCode: string;
  deviceName: string;
  model: string;
  serial: string;
  location: string;
  handoverBy: string;
  receiver: string;
  receivedAt: string;
  receiveCondition: string;
}

export const mockAcceptanceRecords: NewAcceptanceRecord[] = [
  {
    approvalCode: "PNV-2024-001",
    items: {
      approvalForm: { status: "done", files: [], refCode: "PNV-2024-001" },
      handoverRecord: { status: "done", files: [], refCode: "BBBG-001" },
      installationSurvey: { status: "pending", files: [], refCode: "" },
      userManual: { status: "done", files: [{ id: "am1", name: "Manual_XN1000.pdf", type: "pdf", url: "", size: 2500000 }], refCode: "" },
      co: { status: "done", files: [], refCode: "CO-Sysmex-001" },
      cq: { status: "done", files: [], refCode: "CQ-2023-12345" },
      contract: { status: "done", files: [], refCode: "HD-2023-001" },
      installationReport: { status: "pending", files: [], refCode: "" },
      usageConfirmation: { status: "missing", files: [], refCode: "" },
    },
    installationSurveyForm: {
      surveyDate: "2024-03-15",
      hasPowerSupply: true,
      hasGrounding: true,
      hasBenchSpace: true,
      hasTemperatureControl: true,
      hasHumidityControl: false,
      hasNetwork: true,
      hasWaterLine: false,
      conclusion: "Đạt yêu cầu lắp đặt",
      approver: "Lê Văn Trưởng Phòng",
      surveyor: "Phạm Thị Kỹ Thuật",
      relatedUsers: ["Vũ Thị Thiết Bị"],
      attachments: [],
      status: "Chờ duyệt",
    },
  },
  {
    approvalCode: "PNV-2024-002",
    items: {
      approvalForm: { status: "done", files: [], refCode: "PNV-2024-002" },
      handoverRecord: { status: "done", files: [], refCode: "BBBG-002" },
      installationSurvey: { status: "done", files: [], refCode: "BM.05-002" },
      userManual: { status: "done", files: [], refCode: "" },
      co: { status: "done", files: [], refCode: "CO-BC-001" },
      cq: { status: "done", files: [], refCode: "CQ-2023-54321" },
      contract: { status: "done", files: [], refCode: "HD-2022-015" },
      installationReport: { status: "done", files: [], refCode: "BBLD-002" },
      usageConfirmation: { status: "done", files: [], refCode: "XNVS-002" },
    },
    installationSurveyForm: {
      surveyDate: "2023-06-20",
      hasPowerSupply: true,
      hasGrounding: true,
      hasBenchSpace: true,
      hasTemperatureControl: true,
      hasHumidityControl: true,
      hasNetwork: true,
      hasWaterLine: true,
      conclusion: "Đạt yêu cầu lắp đặt, sẵn sàng vận hành",
      approver: "Trần Thị Giám Đốc",
      surveyor: "Nguyễn Văn Admin",
      relatedUsers: ["Lê Văn Trưởng Phòng", "Phạm Thị Kỹ Thuật"],
      attachments: [],
      status: "Đã duyệt",
      approvedAt: "2023-06-25T10:00:00",
    },
  },
];

export const mockReturnAcceptanceRecords: ReturnAcceptanceRecord[] = [
  {
    handoverCode: "PNT-2024-001",
    handoverFiles: [{ id: "rf1", name: "Bien_ban_chuyen_phong_TB001.pdf", type: "pdf", url: "", size: 1500000 }],
    acceptanceForm: {
      formName: "Phiếu tiếp nhận trở lại",
      formCode: "BM.05-PNT-001",
      receiveCondition: "Tốt",
      note: "Thiết bị hoạt động bình thường sau khi bảo dưỡng",
      handoverBy: "Kỹ sư Nguyễn Văn A",
      receivedAt: "10:00 15/03/2024",
      receiver: "Phạm Thị Kỹ Thuật",
      attachments: [{ id: "af1", name: "Bien_ban_nghiem_thu.pdf", type: "pdf", url: "", size: 800000 }],
      completed: true,
      completedAt: "15/03/2024 11:00",
      createdBy: "Phạm Thị Kỹ Thuật",
    },
  },
  {
    handoverCode: "PNT-2024-002",
    handoverFiles: [],
    acceptanceForm: {
      formName: "Phiếu tiếp nhận trở lại",
      formCode: "BM.05-PNT-002",
      receiveCondition: "Cần kiểm tra",
      note: "Cần hiệu chuẩn lại sau khi sửa chữa",
      handoverBy: "Kỹ sư Trần Văn B",
      receivedAt: "14:00 20/03/2024",
      receiver: "Vũ Thị Thiết Bị",
      attachments: [],
      completed: false,
      createdBy: "Vũ Thị Thiết Bị",
    },
  },
];

export const mockReturnTransportRows: ReturnTransportRow[] = [
  {
    id: "rt1",
    transferCode: "DXC-2024-001",
    handoverCode: "PNT-2024-001",
    acceptanceCode: "PNV-2024-001",
    deviceCode: "TB-003",
    deviceName: "Máy miễn dịch tự động",
    model: "ARCHITECT i2000SR",
    serial: "ABB-i2000-2022-012",
    location: "Phòng nuôi cấy vi sinh",
    handoverBy: "Kỹ sư Nguyễn Văn A",
    receiver: "Phạm Thị Kỹ Thuật",
    receivedAt: "10:00 15/03/2024",
    receiveCondition: "Tốt",
  },
  {
    id: "rt2",
    transferCode: "DXC-2024-002",
    handoverCode: "PNT-2024-002",
    acceptanceCode: "PNV-2024-002",
    deviceCode: "TB-006",
    deviceName: "Tủ an toàn sinh học cấp II",
    model: "Safe 2020",
    serial: "TF-SAFE2020-2022-007",
    location: "Phòng nuôi cấy vi sinh",
    handoverBy: "Kỹ sư Trần Văn B",
    receiver: "Vũ Thị Thiết Bị",
    receivedAt: "14:00 20/03/2024",
    receiveCondition: "Cần kiểm tra",
  },
];
