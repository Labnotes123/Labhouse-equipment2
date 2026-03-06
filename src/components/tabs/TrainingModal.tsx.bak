"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileText,
  Download,
  Upload,
  Settings,
  Search,
  Filter,
  Check,
  XCircle,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Paperclip,
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { Device, TrainingPlan, TrainingDocument, TrainingResult, TrainingTrainee, UserProfile, AttachedFile } from "@/lib/mockData";
import type { User } from "@/contexts/AuthContext";

interface TrainingModalProps {
  show: boolean;
  device: Device;
  users: UserProfile[];
  trainingPlans: TrainingPlan[];
  trainingDocuments: TrainingDocument[];
  trainingResults: TrainingResult[];
  planCounter: number;
  editingPlanId: string | null;
  onClose: () => void;
  onPlansChange: (plans: TrainingPlan[]) => void;
  onDocumentsChange: (docs: TrainingDocument[]) => void;
  onResultsChange: (results: TrainingResult[]) => void;
  onPlanCounterChange: (count: number) => void;
  onEditingPlanChange: (id: string | null) => void;
  onDeviceUpdate: (deviceId: string, updates: Partial<Device>) => void;
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void;
  onNotification: (type: "bell" | "email", title: string, message: string) => void;
  currentUser: User | null;
  addHistory?: (log: {
    actionCode: string;
    actionNumber: number;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    description: string;
    targetType: "Thiết bị" | "Người dùng" | "Hệ thống" | "Đề xuất" | "Sự cố" | "Lịch" | "Hiệu chuẩn" | "Đào tạo" | "Bảo dưỡng" | "Thanh lý" | "Điều chuyển";
    targetId: string;
    targetName: string;
    timestamp: string;
  }) => Promise<void>;
}

// Tab types
type TrainingTab = "plans" | "documents" | "results";

// Column config for tables
interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
}

// Pagination
interface PaginationState {
  page: number;
  pageSize: number;
}

// Training plan form
interface TrainingPlanForm {
  topic: string;
  instructorType: "Chuyên gia Hãng" | "KTV trưởng" | "Nội bộ";
  instructorName: string;
  trainingDate: string;
  trainingTime: string;
  location: string;
  approver: string;
  selectedTrainees: TrainingTrainee[];
  notes: string;
}

// Training document form
interface TrainingDocumentForm {
  documentName: string;
  documentType: "Slide" | "User Manual" | "SOP" | "Chứng chỉ" | "Khác";
  description: string;
  file: AttachedFile | null;
}

// Training result form
interface TrainingResultForm {
  attendeeResults: { userId: string; result: "Đạt" | "Không đạt" }[];
  attendanceFile: AttachedFile | null;
  certificateFile: AttachedFile | null;
  notes: string;
}

// Status badge helper
function getStatusBadge(status: string) {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    "Nháp": { bg: "bg-slate-100", text: "text-slate-700", icon: <Clock size={12} /> },
    "Chờ duyệt": { bg: "bg-amber-100", text: "text-amber-700", icon: <Clock size={12} /> },
    "Đã duyệt": { bg: "bg-blue-100", text: "text-blue-700", icon: <CheckCircle size={12} /> },
    "Từ chối": { bg: "bg-red-100", text: "text-red-700", icon: <XCircle size={12} /> },
    "Hoàn thành": { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle size={12} /> },
  };
  const config = statusConfig[status] || statusConfig["Nháp"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
}

// Table component with search, filter, pagination
function SmartTrainingTable<T extends { id: string }>({
  data,
  columns,
  searchKeys,
  onRowClick,
  emptyMessage = "Không có dữ liệu",
  pageSizes = [5, 10, 15, 20],
}: {
  data: T[];
  columns: ColumnConfig[];
  searchKeys: (keyof T)[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSizes?: number[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10 });
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(columns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        return value && String(value).toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm, searchKeys]);

  // Paginate
  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredData.slice(start, start + pagination.pageSize);
  }, [filteredData, pagination]);

  const totalPages = Math.ceil(filteredData.length / pagination.pageSize);

  const toggleColumn = (key: string) => {
    setColumnConfig((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    );
  };

  const visibleColumns = columnConfig.filter((col) => col.visible);

  return (
    <div className="space-y-3">
      {/* Search and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Column Settings */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              title="Cấu hình cột"
            >
              <Settings size={18} className="text-slate-600" />
            </button>
            {showColumnSettings && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px] p-2">
                <div className="text-xs font-semibold text-slate-600 px-2 py-1 mb-1">Hiển thị cột</div>
                {columnConfig.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm text-slate-700">{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-slate-700"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-slate-50 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-600">
                      {/* Render cell based on key - can be customized */}
                      {String((row as Record<string, unknown>)[col.key] || "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Hiển thị</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}
            className="px-2 py-1 border border-slate-200 rounded-lg text-sm"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-600">dòng</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
            disabled={pagination.page === 1}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50"
            title="Trang đầu"
          >
            <ChevronLeft size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 text-sm text-slate-600">
            Trang {pagination.page} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= totalPages}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: totalPages }))}
            disabled={pagination.page >= totalPages}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50"
            title="Trang cuối"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Export to Excel function
function exportToExcel(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

// Main Training Modal Component
export default function TrainingModal({
  show,
  device,
  users,
  trainingPlans,
  trainingDocuments,
  trainingResults,
  planCounter,
  editingPlanId,
  onClose,
  onPlansChange,
  onDocumentsChange,
  onResultsChange,
  onPlanCounterChange,
  onEditingPlanChange,
  onDeviceUpdate,
  showToast,
  onNotification,
  currentUser,
  addHistory,
}: TrainingModalProps) {
  const [activeTab, setActiveTab] = useState<TrainingTab>("plans");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  
  // Plans state
  const [planForm, setPlanForm] = useState<TrainingPlanForm>({
    topic: "",
    instructorType: "Chuyên gia Hãng",
    instructorName: "",
    trainingDate: "",
    trainingTime: "",
    location: "",
    approver: "",
    selectedTrainees: [],
    notes: "",
  });
  const [showTraineeSelector, setShowTraineeSelector] = useState(false);
  const [traineeSearch, setTraineeSearch] = useState("");
  
  // Documents state
  const [docForm, setDocForm] = useState<TrainingDocumentForm>({
    documentName: "",
    documentType: "User Manual",
    description: "",
    file: null,
  });
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<TrainingDocument | null>(null);
  
  // Results state
  const [selectedPlanForResult, setSelectedPlanForResult] = useState<TrainingPlan | null>(null);
  const [resultForm, setResultForm] = useState<TrainingResultForm>({
    attendeeResults: [],
    attendanceFile: null,
    certificateFile: null,
    notes: "",
  });
  
  // Filter states
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [docFilter, setDocFilter] = useState<string>("all");
  
  // Notification state (bell badge)
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Filter data
  const devicePlans = trainingPlans.filter((p) => p.deviceId === device.id);
  const deviceDocs = trainingDocuments.filter((d) => d.deviceId === device.id);
  const deviceResults = trainingResults.filter((r) => r.deviceId === device.id);

  const filteredPlans = planFilter === "all" ? devicePlans : devicePlans.filter((p) => p.status === planFilter);
  const filteredDocs = docFilter === "all" ? deviceDocs : deviceDocs.filter((d) => d.documentType === docFilter);

  // Load editing plan
  useEffect(() => {
    if (editingPlanId) {
      const plan = devicePlans.find((p) => p.id === editingPlanId);
      if (plan) {
        setPlanForm({
          topic: plan.topic,
          instructorType: plan.instructorType,
          instructorName: plan.instructorName,
          trainingDate: plan.trainingDate,
          trainingTime: plan.trainingTime || "",
          location: plan.location,
          approver: plan.approver,
          selectedTrainees: plan.trainees,
          notes: plan.notes || "",
        });
        setViewMode("form");
      }
    }
  }, [editingPlanId, devicePlans]);

  // Handlers
  const handleCreatePlan = () => {
    onEditingPlanChange(null);
    setPlanForm({
      topic: "",
      instructorType: "Chuyên gia Hãng",
      instructorName: "",
      trainingDate: "",
      trainingTime: "",
      location: "",
      approver: "",
      selectedTrainees: [],
      notes: "",
    });
    setViewMode("form");
  };

  const handleSavePlan = (status: "Nháp" | "Chờ duyệt") => {
    if (!planForm.topic || !planForm.instructorName || !planForm.trainingDate || !planForm.approver) {
      showToast("error", "Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const newPlanCode = editingPlanId
      ? devicePlans.find((p) => p.id === editingPlanId)?.planCode || `PDT-${year}-${String(planCounter).padStart(3, "0")}`
      : `PDT-${year}-${String(planCounter).padStart(3, "0")}`;

    const planData: TrainingPlan = {
      id: editingPlanId || `tp-${Date.now()}`,
      planCode: newPlanCode,
      deviceId: device.id,
      deviceCode: device.code,
      deviceName: device.name,
      topic: planForm.topic,
      instructorType: planForm.instructorType,
      instructorName: planForm.instructorName,
      trainingDate: planForm.trainingDate,
      trainingTime: planForm.trainingTime,
      location: planForm.location,
      trainees: planForm.selectedTrainees,
      approver: planForm.approver,
      notes: planForm.notes,
      status,
      createdAt: editingPlanId ? devicePlans.find((p) => p.id === editingPlanId)?.createdAt || now : now,
      createdBy: currentUser?.username || "admin",
      updatedAt: status === "Chờ duyệt" ? now : undefined,
    };

    if (editingPlanId) {
      onPlansChange(trainingPlans.map((p) => (p.id === editingPlanId ? planData : p)));
    } else {
      onPlansChange([planData, ...trainingPlans]);
      onPlanCounterChange(planCounter + 1);
    }

    setViewMode("list");
    onEditingPlanChange(null);
    showToast("success", "Thành công", `Đã lưu kế hoạch đào tạo ${newPlanCode}`);

    // Send notification if submitting for approval
    if (status === "Chờ duyệt") {
      setHasNewNotification(true);
      onNotification("bell", "Đề xuất đào tạo mới", `Kế hoạch ${newPlanCode} chờ phê duyệt`);
      onNotification("email", "Phê duyệt đào tạo", `Có kế hoạch đào tạo ${device.name} chờ bạn duyệt`);
      
      // Add history log
      addHistory?.({
        actionCode: `ACT-${String(Date.now()).slice(-6)}`,
        actionNumber: Date.now(),
        userId: currentUser?.id || "",
        userName: currentUser?.fullName || currentUser?.username || "",
        userRole: currentUser?.role || "",
        action: "Gửi phê duyệt",
        description: `Gửi kế hoạch đào tạo ${newPlanCode} để phê duyệt`,
        targetType: "Đào tạo",
        targetId: planData.id,
        targetName: newPlanCode,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleApprovePlan = (plan: TrainingPlan) => {
    const updatedPlan = { ...plan, status: "Đã duyệt" as const, updatedAt: new Date().toISOString() };
    onPlansChange(trainingPlans.map((p) => (p.id === plan.id ? updatedPlan : p)));
    showToast("success", "Thành công", `Đã phê duyệt kế hoạch ${plan.planCode}`);
    
    // Add history log
    addHistory?.({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: currentUser?.id || "",
      userName: currentUser?.fullName || currentUser?.username || "",
      userRole: currentUser?.role || "",
      action: "Phê duyệt",
      description: `Phê duyệt kế hoạch đào tạo ${plan.planCode}`,
      targetType: "Đào tạo",
      targetId: plan.id,
      targetName: plan.planCode,
      timestamp: new Date().toISOString(),
    });
    
    // Notify trainees
    plan.trainees.forEach((trainee) => {
      onNotification("bell", "Lịch đào tạo", `Bạn có lịch đào tạo ${device.name} vào ngày ${plan.trainingDate}`);
    });
  };

  const handleUploadDocument = () => {
    if (!docForm.documentName || !docForm.file) {
      showToast("error", "Lỗi", "Vui lòng nhập tên tài liệu và tải lên file");
      return;
    }

    const docData: TrainingDocument = {
      id: `td-${Date.now()}`,
      deviceId: device.id,
      documentCode: `DOC-${device.code}-${String(deviceDocs.length + 1).padStart(3, "0")}`,
      documentName: docForm.documentName,
      documentType: docForm.documentType,
      description: docForm.description,
      file: docForm.file!,
      uploadedBy: currentUser?.username || "admin",
      uploadedAt: new Date().toISOString(),
    };

    onDocumentsChange([docData, ...trainingDocuments]);
    setDocForm({ documentName: "", documentType: "User Manual", description: "", file: null });
    showToast("success", "Thành công", "Đã tải lên tài liệu đào tạo");
  };

  const handleSaveResult = () => {
    if (!selectedPlanForResult) return;

    const hasUngraded = resultForm.attendeeResults.some((a) => !a.result);
    if (hasUngraded) {
      showToast("error", "Lỗi", "Vui lòng đánh giá tất cả học viên");
      return;
    }

    const now = new Date().toISOString();
    const resultData: TrainingResult = {
      id: `trs-${Date.now()}`,
      planId: selectedPlanForResult.id,
      planCode: selectedPlanForResult.planCode,
      deviceId: device.id,
      deviceCode: device.code,
      deviceName: device.name,
      trainingDate: selectedPlanForResult.trainingDate,
      instructorName: selectedPlanForResult.instructorName,
      location: selectedPlanForResult.location,
      attendees: selectedPlanForResult.trainees.map((t) => ({
        ...t,
        result: resultForm.attendeeResults.find((a) => a.userId === t.userId)?.result || "Không đạt",
        completedAt: now,
      })),
      attendanceFile: resultForm.attendanceFile || undefined,
      certificateFile: resultForm.certificateFile || undefined,
      notes: resultForm.notes,
      recordedBy: currentUser?.username || "admin",
      recordedAt: now,
    };

    onResultsChange([resultData, ...trainingResults]);

    // Update plan status
    const updatedPlan = { ...selectedPlanForResult, status: "Hoàn thành" as const, updatedAt: now };
    onPlansChange(trainingPlans.map((p) => (p.id === selectedPlanForResult.id ? updatedPlan : p)));

    // AUTOMATION: Auto-grant device permission to passed trainees
    const passedTrainees = resultData.attendees.filter((a) => a.result === "Đạt");
    if (passedTrainees.length > 0) {
      const currentUsers = device.users || [];
      const newUsers = [...new Set([...currentUsers, ...passedTrainees.map((t) => t.userId)])];
      onDeviceUpdate(device.id, { users: newUsers });
      showToast("success", "Tự động cấp quyền", `${passedTrainees.length} nhân viên đã được cấp quyền sử dụng thiết bị`);
    }

    // AUTOMATION: Auto-update device status if training completed
    if (device.status === "Chờ vận hành" && passedTrainees.length > 0) {
      onDeviceUpdate(device.id, { status: "Đang vận hành" });
      showToast("success", "Thiết bị sẵn sàng", `${device.name} đã đủ điều kiện và sẵn sàng phục vụ xét nghiệm!`);
    }

    // Add history log
    addHistory?.({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: currentUser?.id || "",
      userName: currentUser?.fullName || currentUser?.username || "",
      userRole: currentUser?.role || "",
      action: "Ghi nhận kết quả",
      description: `Ghi nhận kết quả đào tạo ${selectedPlanForResult.planCode}, ${passedTrainees.length} người đạt`,
      targetType: "Đào tạo",
      targetId: selectedPlanForResult.id,
      targetName: selectedPlanForResult.planCode,
      timestamp: new Date().toISOString(),
    });

    setSelectedPlanForResult(null);
    setResultForm({
      attendeeResults: [],
      attendanceFile: null,
      certificateFile: null,
      notes: "",
    });
    showToast("success", "Thành công", "Đã ghi nhận kết quả đào tạo");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: AttachedFile | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
      });
    }
  };

  // Filtered users for trainee selector
  const filteredUsers = users.filter(
    (u) =>
      u.isActive &&
      (u.fullName.toLowerCase().includes(traineeSearch.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(traineeSearch.toLowerCase()))
  );

  // Tab definitions
  const tabs = [
    { id: "plans" as const, label: "Lên kế hoạch", icon: <Clock size={16} /> },
    { id: "documents" as const, label: "Kho tài liệu", icon: <BookOpen size={16} /> },
    { id: "results" as const, label: "Chốt kết quả", icon: <GraduationCap size={16} /> },
  ];

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">Đào tạo vận hành thiết bị</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Module Đào tạo</span>
            </div>
            <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasNewNotification && (
              <span className="relative">
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </span>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "plans" && devicePlans.filter((p) => p.status === "Chờ duyệt").length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                    {devicePlans.filter((p) => p.status === "Chờ duyệt").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          {/* ===== TAB 1: LÊN KẾ HOẠCH ===== */}
          {activeTab === "plans" && (
            <div className="space-y-4">
              {viewMode === "list" ? (
                <>
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Nháp">Nháp</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                      </select>
                      <button
                        onClick={() => exportToExcel(`Dao_Tao_${device.code}`, ["Mã", "Chủ đề", "Giảng viên", "Ngày", "Trạng thái"], 
                          filteredPlans.map((p) => [p.planCode, p.topic, p.instructorName, p.trainingDate, p.status]))}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet size={16} />
                        Xuất Excel
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePlan}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Tạo kế hoạch đào tạo
                    </button>
                  </div>

                  {/* Plans Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã kế hoạch</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Chủ đề</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Giảng viên</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày dự kiến</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Số học viên</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPlans.map((plan) => (
                          <tr key={plan.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-indigo-700">{plan.planCode}</td>
                            <td className="px-4 py-3 text-slate-700">{plan.topic}</td>
                            <td className="px-4 py-3 text-slate-600">{plan.instructorName}</td>
                            <td className="px-4 py-3 text-slate-600">{plan.trainingDate}</td>
                            <td className="px-4 py-3 text-slate-600">
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                {plan.trainees.length}
                              </div>
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(plan.status)}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    onEditingPlanChange(plan.id);
                                    setPlanForm({
                                      topic: plan.topic,
                                      instructorType: plan.instructorType,
                                      instructorName: plan.instructorName,
                                      trainingDate: plan.trainingDate,
                                      trainingTime: plan.trainingTime || "",
                                      location: plan.location,
                                      approver: plan.approver,
                                      selectedTrainees: plan.trainees,
                                      notes: plan.notes || "",
                                    });
                                    setViewMode("form");
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setViewingDoc(null);
                                    setShowDocViewer(true);
                                  }}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                  title="Xem chi tiết"
                                >
                                  <Eye size={16} />
                                </button>
                                {plan.status === "Chờ duyệt" && (
                                  <button
                                    onClick={() => handleApprovePlan(plan)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                    title="Phê duyệt"
                                  >
                                    <Check size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredPlans.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                              Chưa có kế hoạch đào tạo nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Plan Form */
                <div className="space-y-4 max-w-6xl mx-auto">
                  <button
                    onClick={() => {
                      setViewMode("list");
                      onEditingPlanChange(null);
                    }}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {editingPlanId ? "Chỉnh sửa kế hoạch đào tạo" : "Tạo kế hoạch đào tạo mới"}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mã kế hoạch</label>
                        <input
                          type="text"
                          readOnly
                          value={editingPlanId
                            ? devicePlans.find((p) => p.id === editingPlanId)?.planCode || ""
                            : `PDT-${new Date().getFullYear()}-${String(planCounter).padStart(3, "0")}`}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại giảng viên</label>
                        <select
                          value={planForm.instructorType}
                          onChange={(e) => setPlanForm({ ...planForm, instructorType: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                          <option value="Chuyên gia Hãng">Chuyên gia Hãng</option>
                          <option value="KTV trưởng">KTV trưởng</option>
                          <option value="Nội bộ">Nội bộ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chủ đề đào tạo *</label>
                      <input
                        type="text"
                        value={planForm.topic}
                        onChange={(e) => setPlanForm({ ...planForm, topic: e.target.value })}
                        placeholder="Nhập nội dung đào tạo..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên giảng viên *</label>
                        <input
                          type="text"
                          value={planForm.instructorName}
                          onChange={(e) => setPlanForm({ ...planForm, instructorName: e.target.value })}
                          placeholder={planForm.instructorType === "Chuyên gia Hãng" ? "Kỹ sư Sysmex - Nguyễn Văn A" : "Nhập tên giảng viên..."}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngày đào tạo *</label>
                        <input
                          type="date"
                          value={planForm.trainingDate}
                          onChange={(e) => setPlanForm({ ...planForm, trainingDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Giờ đào tạo</label>
                        <input
                          type="time"
                          value={planForm.trainingTime}
                          onChange={(e) => setPlanForm({ ...planForm, trainingTime: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Địa điểm *</label>
                        <input
                          type="text"
                          value={planForm.location}
                          onChange={(e) => setPlanForm({ ...planForm, location: e.target.value })}
                          placeholder="Phòng Hội trường - Tầng 2"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt *</label>
                      <select
                        value={planForm.approver}
                        onChange={(e) => setPlanForm({ ...planForm, approver: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      >
                        <option value="">Chọn người phê duyệt...</option>
                        {users
                          .filter((u) => u.position.includes("Quản lý") || u.position.includes("Giám đốc") || u.position.includes("Trưởng"))
                          .map((u) => (
                            <option key={u.id} value={u.fullName}>
                              {u.fullName} - {u.position}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">Danh sách học viên</label>
                        <button
                          onClick={() => setShowTraineeSelector(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Thêm học viên
                        </button>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-3 min-h-[80px]">
                        {planForm.selectedTrainees.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {planForm.selectedTrainees.map((t) => (
                              <span
                                key={t.userId}
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-sm"
                              >
                                {t.fullName}
                                <button
                                  onClick={() =>
                                    setPlanForm({
                                      ...planForm,
                                      selectedTrainees: planForm.selectedTrainees.filter((tr) => tr.userId !== t.userId),
                                    })
                                  }
                                  className="hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-2">Chưa chọn học viên nào</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                      <textarea
                        value={planForm.notes}
                        onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                        rows={2}
                        placeholder="Ghi chú thêm..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setViewMode("list");
                          onEditingPlanChange(null);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button onClick={() => handleSavePlan("Nháp")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                        Lưu nháp
                      </button>
                      <button onClick={() => handleSavePlan("Chờ duyệt")} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                        Gửi phê duyệt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 2: KHO TÀI LIỆU ===== */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={docFilter}
                    onChange={(e) => setDocFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="all">Tất cả loại tài liệu</option>
                    <option value="Slide">Slide</option>
                    <option value="User Manual">User Manual</option>
                    <option value="SOP">SOP</option>
                    <option value="Chứng chỉ">Chứng chỉ</option>
                  </select>
                  <button
                    onClick={() => exportToExcel(`Tai_Lieu_Dao_Tao_${device.code}`, ["Mã", "Tên tài liệu", "Loại", "Người tải", "Ngày"],
                      filteredDocs.map((d) => [d.documentCode, d.documentName, d.documentType, d.uploadedBy, d.uploadedAt.split("T")[0]]))}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    Xuất Excel
                  </button>
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Upload size={16} />
                  Tải lên tài liệu mới
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Tên tài liệu..."
                    value={docForm.documentName}
                    onChange={(e) => setDocForm({ ...docForm, documentName: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                  <select
                    value={docForm.documentType}
                    onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value as any })}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="Slide">Slide</option>
                    <option value="User Manual">User Manual</option>
                    <option value="SOP">SOP</option>
                    <option value="Chứng chỉ">Chứng chỉ</option>
                    <option value="Khác">Khác</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Mô tả..."
                    value={docForm.description}
                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-center cursor-pointer hover:bg-white hover:border-indigo-400 transition-colors">
                      <Upload size={14} className="inline mr-1" />
                      {docForm.file ? docForm.file.name.slice(0, 20) + "..." : "Chọn file"}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => handleFileUpload(e, (f) => setDocForm({ ...docForm, file: f }))} />
                    </label>
                    <button
                      onClick={handleUploadDocument}
                      className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
                    >
                      Tải lên
                    </button>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã tài liệu</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên tài liệu</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Loại</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Người tải</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày tải</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-600 text-xs">{doc.documentCode}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{doc.documentName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.documentType === "SOP" ? "bg-blue-100 text-blue-700" :
                            doc.documentType === "Slide" ? "bg-purple-100 text-purple-700" :
                            doc.documentType === "User Manual" ? "bg-green-100 text-green-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {doc.documentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{doc.uploadedBy}</td>
                        <td className="px-4 py-3 text-slate-600">{doc.uploadedAt.split("T")[0]}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => {
                                setViewingDoc(doc);
                                setShowDocViewer(true);
                              }}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                              title="Xem tài liệu"
                            >
                              <Eye size={16} />
                            </button>
                            <a
                              href={doc.file.url}
                              download={doc.file.name}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Tải về"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDocs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          Chưa có tài liệu đào tạo nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== TAB 3: CHỐT KẾT QUẢ ===== */}
          {activeTab === "results" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="all">Tất cả kế hoạch</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>
              </div>

              {/* Plans pending results */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã kế hoạch</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Chủ đề</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày đào tạo</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Số học viên</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {devicePlans
                      .filter((p) => planFilter === "all" || p.status === planFilter)
                      .filter((p) => p.status === "Đã duyệt" || p.status === "Hoàn thành")
                      .map((plan) => {
                        const hasResult = deviceResults.some((r) => r.planId === plan.id);
                        return (
                          <tr key={plan.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-indigo-700">{plan.planCode}</td>
                            <td className="px-4 py-3 text-slate-700">{plan.topic}</td>
                            <td className="px-4 py-3 text-slate-600">{plan.trainingDate}</td>
                            <td className="px-4 py-3 text-slate-600">{plan.trainees.length}</td>
                            <td className="px-4 py-3">{getStatusBadge(plan.status)}</td>
                            <td className="px-4 py-3 text-center">
                              {hasResult ? (
                                <span className="text-green-600 text-sm flex items-center justify-center gap-1">
                                  <CheckCircle size={14} />
                                  Đã ghi nhận
                                </span>
                              ) : plan.status === "Đã duyệt" ? (
                                <button
                                  onClick={() => {
                                    setSelectedPlanForResult(plan);
                                    setResultForm({
                                      attendeeResults: plan.trainees.map((t) => ({ userId: t.userId, result: "Đạt" as const })),
                                      attendanceFile: null,
                                      certificateFile: null,
                                      notes: "",
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 flex items-center gap-1 mx-auto"
                                >
                                  <Plus size={14} />
                                  Ghi nhận kết quả
                                </button>
                              ) : (
                                <span className="text-slate-400 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    {devicePlans.filter((p) => p.status === "Đã duyệt" || p.status === "Hoàn thành").length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          Không có kế hoạch nào cần ghi nhận kết quả
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Results History */}
              {deviceResults.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Lịch sử kết quả đào tạo</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã kết quả</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Kế hoạch</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày đào tạo</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Đạt/Không đạt</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Người ghi nhận</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deviceResults.map((result) => {
                          const passed = result.attendees.filter((a) => a.result === "Đạt").length;
                          const failed = result.attendees.filter((a) => a.result === "Không đạt").length;
                          return (
                            <tr key={result.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono text-slate-600 text-xs">{result.id}</td>
                              <td className="px-4 py-3 text-indigo-700">{result.planCode}</td>
                              <td className="px-4 py-3 text-slate-600">{result.trainingDate}</td>
                              <td className="px-4 py-3">
                                <span className="text-green-600 font-medium">{passed} Đạt</span>
                                {failed > 0 && <span className="text-red-600 font-medium ml-2">{failed} Không đạt</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{result.recordedBy}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Xem chi tiết">
                                    <Eye size={16} />
                                  </button>
                                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="In kết quả">
                                    <Printer size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trainee Selector Modal */}
        {showTraineeSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowTraineeSelector(false)}>
            <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Chọn học viên</h3>
                <button onClick={() => setShowTraineeSelector(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã NV..."
                    value={traineeSearch}
                    onChange={(e) => setTraineeSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                    autoFocus
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredUsers.map((user) => {
                    const isSelected = planForm.selectedTrainees.some((t) => t.userId === user.id);
                    return (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer ${isSelected ? "bg-indigo-50" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setPlanForm({
                                ...planForm,
                                selectedTrainees: planForm.selectedTrainees.filter((t) => t.userId !== user.id),
                              });
                            } else {
                              setPlanForm({
                                ...planForm,
                                selectedTrainees: [
                                  ...planForm.selectedTrainees,
                                  {
                                    userId: user.id,
                                    fullName: user.fullName,
                                    employeeId: user.employeeId,
                                    department: user.department,
                                    result: "Chưa đánh giá",
                                  },
                                ],
                              });
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{user.fullName}</div>
                          <div className="text-xs text-slate-500">{user.employeeId} - {user.department}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowTraineeSelector(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
                >
                  Xác nhận ({planForm.selectedTrainees.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Form Modal */}
        {selectedPlanForResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setSelectedPlanForResult(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Ghi nhận kết quả đào tạo</h3>
                  <p className="text-sm text-slate-500">{selectedPlanForResult.planCode} - {selectedPlanForResult.topic}</p>
                </div>
                <button onClick={() => setSelectedPlanForResult(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                {/* Attendees List */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Đánh giá học viên</label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Học viên</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-700">Mã NV</th>
                          <th className="px-3 py-2 text-center font-medium text-slate-700">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPlanForResult.trainees.map((trainee) => (
                          <tr key={trainee.userId}>
                            <td className="px-3 py-2 text-slate-700">{trainee.fullName}</td>
                            <td className="px-3 py-2 text-slate-500 text-xs">{trainee.employeeId}</td>
                            <td className="px-3 py-2">
                              <select
                                value={resultForm.attendeeResults.find((a) => a.userId === trainee.userId)?.result || "Đạt"}
                                onChange={(e) => {
                                  setResultForm({
                                    ...resultForm,
                                    attendeeResults: resultForm.attendeeResults.map((a) =>
                                      a.userId === trainee.userId ? { ...a, result: e.target.value as "Đạt" | "Không đạt" } : a
                                    ),
                                  });
                                }}
                                className={`w-full px-2 py-1 rounded-lg text-sm border ${
                                  resultForm.attendeeResults.find((a) => a.userId === trainee.userId)?.result === "Không đạt"
                                    ? "border-red-300 bg-red-50 text-red-700"
                                    : "border-green-300 bg-green-50 text-green-700"
                                }`}
                              >
                                <option value="Đạt">Đạt</option>
                                <option value="Không đạt">Không đạt</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attachments */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">File điểm danh (bắt buộc)</label>
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
                      <Paperclip size={14} />
                      {resultForm.attendanceFile ? resultForm.attendanceFile.name.slice(0, 15) + "..." : "Chọn file scan điểm danh"}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileUpload(e, (f) => setResultForm({ ...resultForm, attendanceFile: f }))} />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">File chứng chỉ (nếu có)</label>
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
                      <Paperclip size={14} />
                      {resultForm.certificateFile ? resultForm.certificateFile.name.slice(0, 15) + "..." : "Chọn file chứng chỉ"}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileUpload(e, (f) => setResultForm({ ...resultForm, certificateFile: f }))} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                  <textarea
                    value={resultForm.notes}
                    onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                    rows={2}
                    placeholder="Ghi chú thêm..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                  />
                </div>

                {/* Automation Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Tự động hóa sau khi lưu:</p>
                      <ul className="list-disc list-inside mt-1 text-amber-700">
                        <li>Nhân viên "Đạt" sẽ được cấp quyền sử dụng thiết bị</li>
                        <li>Thiết bị "Chờ vận hành" sẽ chuyển sang "Đang vận hành"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                <button onClick={() => setSelectedPlanForResult(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  Hủy
                </button>
                <button onClick={handleSaveResult} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {showDocViewer && viewingDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowDocViewer(false)}>
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{viewingDoc.documentName}</h3>
                  <p className="text-sm text-slate-500">{viewingDoc.documentCode} - {viewingDoc.documentType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={viewingDoc.file.url} download={viewingDoc.file.name} className="p-2 hover:bg-slate-100 rounded-lg" title="Tải về">
                    <Download size={18} />
                  </a>
                  <button onClick={() => setShowDocViewer(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-100 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <FileText size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Xem trực tiếp file PDF</p>
                  <p className="text-sm">{viewingDoc.file.name}</p>
                  <p className="text-xs mt-2">Kích thước: {(viewingDoc.file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
