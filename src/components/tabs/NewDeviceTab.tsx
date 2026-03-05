"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
  User,
  Calendar,
  X,
  Eye,
  Edit2,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Settings2,
  FileSpreadsheet,
  Paperclip,
  Send,
  Save,
  AlertCircle,
  UserCheck,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";
import {
  mockNotifications,
  NewDeviceProposal,
  DeviceRequirement,
  ProposalApprover,
  AttachedFile,
  SystemNotification,
  formatDate,
  generatePDXCode,
  deviceTypes,
  deviceLocations,
  specialties,
  deviceCategories,
  countries,
  years,
} from "@/lib/mockData";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { MOCK_USERS_LIST, mockUserProfiles } from "@/lib/mockData";
import { exportProposalToPDF } from "@/lib/pdf-export";

// Type alias for backward compatibility
type Notification = SystemNotification;

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "proposalCode" | "proposedDate" | "necessity" | "proposedBy" | "status";
type SortDir = "asc" | "desc";

interface RegisterDeviceForm {
  deviceCode: string;
  specialty: string;
  category: string;
  deviceType: string;
  model: string;
  serial: string;
  location: string;
  manufacturer: string;
  origin: string;
  yearOfManufacture: string;
  distributor: string;
  responsiblePerson: string;
  responsiblePersonStart: string;
  users: string[];
  conditionOnReceive: "Máy mới" | "Đã qua sử dụng" | "Tân trang lại";
  operatingHoursStart: string;
  operatingHoursEnd: string;
  installLocation: string;
  accessories: { name: string; attachments: AttachedFile[] }[];
  deviceImage: AttachedFile | null;
  hasCalibration: boolean;
  calibrationFrequency: string;
  hasMaintenance: boolean;
  maintenanceFrequency: string;
  hasInspection: boolean;
  inspectionFrequency: string;
  contacts: { name: string; phone: string; email: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyDeviceRequirement(): DeviceRequirement {
  return {
    id: `dr-${Date.now()}-${Math.random()}`,
    deviceName: "",
    manufacturer: "",
    yearOfManufacture: "",
    distributor: "",
    quantity: 1,
    technicalSpecs: "",
    attachments: [],
  };
}

function emptyRegisterForm(): RegisterDeviceForm {
  return {
    deviceCode: "",
    specialty: specialties[0],
    category: deviceCategories[0],
    deviceType: deviceTypes[0],
    model: "",
    serial: "",
    location: deviceLocations[0],
    manufacturer: "",
    origin: "Việt Nam",
    yearOfManufacture: String(new Date().getFullYear()),
    distributor: "",
    responsiblePerson: "",
    responsiblePersonStart: new Date().toISOString().split("T")[0],
    users: [],
    conditionOnReceive: "Máy mới",
    operatingHoursStart: "07:00",
    operatingHoursEnd: "17:00",
    installLocation: deviceLocations[0],
    accessories: [],
    deviceImage: null,
    hasCalibration: false,
    calibrationFrequency: "",
    hasMaintenance: false,
    maintenanceFrequency: "",
    hasInspection: false,
    inspectionFrequency: "",
    contacts: [{ name: "", phone: "", email: "" }],
  };
}

const APPROVER_ROLES = ["Giám đốc", "Trưởng phòng xét nghiệm", "Trưởng nhóm", "Quản lý trang thiết bị"];

// ─── Main Component ───────────────────────────────────────────────────────────

interface NewDeviceTabProps {
  filterPending?: boolean;
  onNavigate?: (tab: string) => void;
}

export default function NewDeviceTab({ filterPending = false, onNavigate }: NewDeviceTabProps) {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const { proposals: contextProposals, addProposal, updateProposal, addHistory } = useData();
  // ── State ──
  const [proposals, setProposals] = useState<NewDeviceProposal[]>([]);
  useEffect(() => { setProposals(contextProposals); }, [contextProposals]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(filterPending ? "Chờ duyệt" : "all");
  const [sortKey, setSortKey] = useState<SortKey>("proposedDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Column filters
  const [colFilters, setColFilters] = useState({
    proposalCode: "",
    proposedDate: "",
    proposedDateTo: "",
    necessity: "",
    proposedBy: "",
    status: "",
  });

  // Column visibility config
  const [visibleColumns, setVisibleColumns] = useState({
    proposalCode: true,
    proposedDate: true,
    necessity: true,
    proposedBy: true,
    status: true,
    actions: true,
  });
  const [showColumnConfig, setShowColumnConfig] = useState(false);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<NewDeviceProposal | null>(null);
  const [viewProposal, setViewProposal] = useState<NewDeviceProposal | null>(null);
  const [approveProposal, setApproveProposal] = useState<NewDeviceProposal | null>(null);
  const [rejectProposal, setRejectProposal] = useState<NewDeviceProposal | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [registerProposal, setRegisterProposal] = useState<NewDeviceProposal | null>(null);
  const [showApproverSelect, setShowApproverSelect] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<NewDeviceProposal | null>(null);

  // Form state
  const [formNecessity, setFormNecessity] = useState("");
  const [formDevices, setFormDevices] = useState<DeviceRequirement[]>([emptyDeviceRequirement()]);
  const [formApprovers, setFormApprovers] = useState<ProposalApprover[]>([]);
  const [approverSearch, setApproverSearch] = useState("");

  // Register device form
  const [regForm, setRegForm] = useState<RegisterDeviceForm>(emptyRegisterForm());
  const [regUserSearch, setRegUserSearch] = useState("");
  const [regOriginSearch, setRegOriginSearch] = useState("");

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Derived ──
  const canApprove = (p: NewDeviceProposal) => {
    if (!user) return false;
    return p.approvers.some((a) => a.userId === user.id && a.isApprover);
  };

  const isRelated = (p: NewDeviceProposal) => {
    if (!user) return false;
    return p.approvers.some((a) => a.userId === user.id && !a.isApprover);
  };

  const myNotifications = notifications.filter((n) => n.userId === user?.id && !n.isRead);

  // ── Filtering & Sorting ──
  const filtered = proposals
    .filter((p) => {
      // Only show own drafts
      if (p.status === "Bản nháp" && p.proposedById !== user?.id) return false;

      const matchSearch =
        p.proposalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.necessity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proposedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === "all" || p.status === filterStatus;

      const matchColCode = !colFilters.proposalCode || p.proposalCode.toLowerCase().includes(colFilters.proposalCode.toLowerCase());
      const matchColNecessity = !colFilters.necessity || p.necessity.toLowerCase().includes(colFilters.necessity.toLowerCase());
      const matchColBy = !colFilters.proposedBy || p.proposedBy.toLowerCase().includes(colFilters.proposedBy.toLowerCase());
      const matchColStatus = !colFilters.status || p.status === colFilters.status;

      let matchColDate = true;
      if (colFilters.proposedDate && p.proposedDate) {
        matchColDate = p.proposedDate >= colFilters.proposedDate;
      }
      if (colFilters.proposedDateTo && p.proposedDate) {
        matchColDate = matchColDate && p.proposedDate <= colFilters.proposedDateTo;
      }

      return matchSearch && matchStatus && matchColCode && matchColNecessity && matchColBy && matchColStatus && matchColDate;
    })
    .sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  // ── Form helpers ──
  const openNewForm = () => {
    setEditingProposal(null);
    setFormNecessity("");
    setFormDevices([emptyDeviceRequirement()]);
    setFormApprovers([]);
    setShowForm(true);
  };

  const openEditForm = (p: NewDeviceProposal) => {
    setEditingProposal(p);
    setFormNecessity(p.necessity);
    setFormDevices(p.deviceRequirements.map((d) => ({ ...d, attachments: [...d.attachments] })));
    setFormApprovers([...p.approvers]);
    setShowForm(true);
  };

  const handleAddDevice = () => setFormDevices((prev) => [...prev, emptyDeviceRequirement()]);
  const handleRemoveDevice = (id: string) => setFormDevices((prev) => prev.filter((d) => d.id !== id));
  const handleDeviceChange = (id: string, field: keyof DeviceRequirement, value: string | number) => {
    setFormDevices((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleFileAttach = (deviceId: string, files: FileList | null) => {
    if (!files) return;
    const newFiles: AttachedFile[] = Array.from(files)
      .filter((f) => f.type === "application/pdf")
      .map((f) => ({
        id: `f-${Date.now()}-${Math.random()}`,
        name: f.name,
        type: "pdf" as const,
        url: URL.createObjectURL(f),
        size: f.size,
      }));
    if (newFiles.length < files.length) {
      error("Chỉ chấp nhận PDF", "Chỉ được đính kèm file định dạng PDF");
    }
    setFormDevices((prev) =>
      prev.map((d) => d.id === deviceId ? { ...d, attachments: [...d.attachments, ...newFiles] } : d)
    );
  };

  const handleRemoveAttachment = (deviceId: string, fileId: string) => {
    setFormDevices((prev) =>
      prev.map((d) => d.id === deviceId ? { ...d, attachments: d.attachments.filter((f) => f.id !== fileId) } : d)
    );
  };

  const buildProposal = (status: "Bản nháp" | "Chờ duyệt"): NewDeviceProposal => {
    const now = new Date();
    const code = editingProposal?.proposalCode ?? generatePDXCode(proposals);
    return {
      id: editingProposal?.id ?? `p-${Date.now()}`,
      proposalCode: code,
      necessity: formNecessity,
      deviceRequirements: formDevices,
      proposedBy: user?.fullName ?? "",
      proposedById: user?.id ?? "",
      proposedDate: status === "Chờ duyệt" ? now.toISOString().split("T")[0] : (editingProposal?.proposedDate ?? ""),
      createdDate: editingProposal?.createdDate ?? now.toISOString().split("T")[0],
      status,
      approvers: formApprovers,
      department: editingProposal?.department,
    };
  };

  const handleSaveDraft = () => {
    if (!formNecessity.trim()) { error("Thiếu thông tin", "Vui lòng nhập sự cần thiết đầu tư thiết bị"); return; }
    const proposal = buildProposal("Bản nháp");
    if (editingProposal) {
      setProposals((prev) => prev.map((p) => p.id === editingProposal.id ? proposal : p));
      updateProposal(editingProposal.id, proposal).catch(console.error);
      success("Đã lưu bản nháp", `Phiếu ${proposal.proposalCode} đã được lưu`);
    } else {
      setProposals((prev) => [proposal, ...prev]);
      addProposal(proposal).catch(console.error);
      success("Đã lưu bản nháp", `Phiếu ${proposal.proposalCode} đã được lưu`);
    }
    setShowForm(false);
  };

  const handleSendProposal = () => {
    if (!formNecessity.trim()) { error("Thiếu thông tin", "Vui lòng nhập sự cần thiết đầu tư thiết bị"); return; }
    const hasEmptyDevice = formDevices.some((d) => !d.deviceName.trim());
    if (hasEmptyDevice) { error("Thiếu thông tin", "Vui lòng nhập tên thiết bị cho tất cả các mục"); return; }
    // Show approver selection
    const proposal = buildProposal("Chờ duyệt");
    setPendingFormData(proposal);
    setShowApproverSelect(true);
  };

  const handleFinalizeSend = () => {
    if (!pendingFormData) return;
    if (formApprovers.filter((a) => a.isApprover).length === 0) {
      error("Chưa chọn người duyệt", "Vui lòng chọn ít nhất một người phê duyệt");
      return;
    }
    const proposal: NewDeviceProposal = { ...pendingFormData, approvers: formApprovers, status: "Chờ duyệt" };
    if (editingProposal) {
      setProposals((prev) => prev.map((p) => p.id === editingProposal.id ? proposal : p));
      updateProposal(editingProposal.id, proposal).catch(console.error);
    } else {
      setProposals((prev) => [proposal, ...prev]);
      addProposal(proposal).catch(console.error);
    }
    // Add notifications
    const newNotifs: SystemNotification[] = formApprovers.map((a) => ({
      id: `n-${Date.now()}-${a.userId}`,
      userId: a.userId,
      recipientId: a.userId,
      recipientName: a.fullName,
      recipientEmail: a.email, // Include email for sending notifications
      priority: a.isApprover ? "high" : "medium",
      type: a.isApprover ? "approval_request" : "system",
      title: a.isApprover ? "Yêu cầu phê duyệt mới" : "Bạn được liệt kê là người liên quan",
      message: a.isApprover
        ? `Phiếu đề xuất ${proposal.proposalCode} cần được phê duyệt`
        : `Phiếu đề xuất ${proposal.proposalCode} - Bạn được liệt kê là người liên quan`,
      relatedId: proposal.id,
      relatedCode: proposal.proposalCode,
      isRead: false,
      createdAt: new Date().toISOString(),
    }));
    
    // Send notifications via API (which will also send emails)
    newNotifs.forEach(async (notif) => {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notif),
        });
      } catch (e) {
        console.error("Failed to create notification:", e);
      }
    });
    setNotifications((prev) => [...prev, ...newNotifs]);
    // Add history log
    addHistory({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: user?.id || "",
      userName: user?.fullName || "",
      userRole: user?.role || "",
      action: "Gửi đề xuất mới",
      description: `Gửi phiếu đề xuất ${proposal.proposalCode} chờ phê duyệt`,
      targetType: "Đề xuất",
      targetId: proposal.id,
      targetName: proposal.proposalCode,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    success("Đã gửi đề xuất", `Phiếu ${proposal.proposalCode} đã được gửi chờ duyệt`);
    setShowApproverSelect(false);
    setShowForm(false);
    setPendingFormData(null);
  };

  const handleApprove = (p: NewDeviceProposal) => {
    const now = new Date();
    const approvedDate = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const updates = { status: "Đã duyệt" as const, approvedBy: user?.fullName, approvedDate };
    setProposals((prev) =>
      prev.map((pr) => pr.id === p.id ? { ...pr, ...updates } : pr)
    );
    updateProposal(p.id, updates).catch(console.error);
    // Notify proposer
    const proposer = mockUserProfiles.find(u => u.id === p.proposedById);
    const proposerEmail = MOCK_USERS_LIST.find(u => u.id === p.proposedById)?.email;
    const notif: SystemNotification = {
      id: `n-${Date.now()}`,
      userId: p.proposedById,
      recipientId: p.proposedById,
      recipientName: proposer?.fullName || "",
      recipientEmail: proposerEmail,
      priority: "medium",
      type: "approval_approved",
      title: "Đề xuất đã được phê duyệt",
      message: `Phiếu đề xuất ${p.proposalCode} đã được phê duyệt bởi ${user?.fullName}`,
      relatedId: p.id,
      relatedCode: p.proposalCode,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    // Send notification via API
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notif),
    }).catch(e => console.error("Failed to create notification:", e));
    setNotifications((prev) => [...prev, notif]);
    // Add history log
    addHistory({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: user?.id || "",
      userName: user?.fullName || "",
      userRole: user?.role || "",
      action: "Phê duyệt đề xuất",
      description: `Phê duyệt phiếu đề xuất ${p.proposalCode}`,
      targetType: "Đề xuất",
      targetId: p.id,
      targetName: p.proposalCode,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    success("Đã phê duyệt", `Phiếu ${p.proposalCode} đã được phê duyệt`);
    setApproveProposal(null);
  };

  const handleReject = () => {
    if (!rejectProposal) return;
    if (!rejectReason.trim()) { error("Thiếu lý do", "Vui lòng nhập lý do từ chối"); return; }
    const updates = { status: "Từ chối" as const, rejectedBy: user?.fullName, rejectedDate: new Date().toISOString(), rejectionReason: rejectReason };
    setProposals((prev) =>
      prev.map((pr) => pr.id === rejectProposal.id ? { ...pr, ...updates } : pr)
    );
    updateProposal(rejectProposal.id, updates).catch(console.error);
    const proposer = mockUserProfiles.find(u => u.id === rejectProposal.proposedById);
    const proposerEmail = MOCK_USERS_LIST.find(u => u.id === rejectProposal.proposedById)?.email;
    const notif: SystemNotification = {
      id: `n-${Date.now()}`,
      userId: rejectProposal.proposedById,
      recipientId: rejectProposal.proposedById,
      recipientName: proposer?.fullName || "",
      recipientEmail: proposerEmail,
      priority: "high",
      type: "approval_rejected",
      title: "Đề xuất bị từ chối",
      message: `Phiếu đề xuất ${rejectProposal.proposalCode} đã bị từ chối. Lý do: ${rejectReason}`,
      relatedId: rejectProposal.id,
      relatedCode: rejectProposal.proposalCode,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    // Send notification via API
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notif),
    }).catch(e => console.error("Failed to create notification:", e));
    setNotifications((prev) => [...prev, notif]);
    // Add history log
    addHistory({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: user?.id || "",
      userName: user?.fullName || "",
      userRole: user?.role || "",
      action: "Từ chối đề xuất",
      description: `Từ chối phiếu đề xuất ${rejectProposal.proposalCode}. Lý do: ${rejectReason}`,
      targetType: "Đề xuất",
      targetId: rejectProposal.id,
      targetName: rejectProposal.proposalCode,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    error("Đã từ chối", `Phiếu ${rejectProposal.proposalCode} đã bị từ chối`);
    setRejectProposal(null);
    setRejectReason("");
  };

  const handleReopenProposal = (p: NewDeviceProposal) => {
    openEditForm({ ...p, status: "Bản nháp" });
  };

  const handleRegisterDevice = (p: NewDeviceProposal) => {
    const firstDevice = p.deviceRequirements[0];
    setRegForm({
      ...emptyRegisterForm(),
      manufacturer: firstDevice?.manufacturer ?? "",
      yearOfManufacture: firstDevice?.yearOfManufacture ?? String(new Date().getFullYear()),
      distributor: firstDevice?.distributor ?? "",
    });
    setRegisterProposal(p);
  };

  const handleFinishRegister = () => {
    if (!regForm.deviceCode.trim() || !regForm.serial.trim()) {
      error("Thiếu thông tin", "Vui lòng nhập mã thiết bị và số serial");
      return;
    }
    setProposals((prev) =>
      prev.map((p) => p.id === registerProposal?.id ? { ...p, registeredToSystem: true } : p)
    );
    if (registerProposal) {
      updateProposal(registerProposal.id, { registeredToSystem: true }).catch(console.error);
    }
    success("Đăng ký thành công", `Thiết bị ${regForm.deviceCode} đã được đăng ký vào hệ thống`);
    setRegisterProposal(null);
    setRegForm(emptyRegisterForm());
  };

  // Approver management
  const allUsers = MOCK_USERS_LIST;
  const approverCandidates = allUsers.filter((u) =>
    APPROVER_ROLES.includes(u.role) &&
    (approverSearch === "" ||
      u.fullName.toLowerCase().includes(approverSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(approverSearch.toLowerCase()))
  );

  const toggleApprover = (u: typeof allUsers[0], isApprover: boolean) => {
    setFormApprovers((prev) => {
      const exists = prev.find((a) => a.userId === u.id);
      if (exists) {
        if (exists.isApprover === isApprover) {
          return prev.filter((a) => a.userId !== u.id);
        }
        return prev.map((a) => a.userId === u.id ? { ...a, isApprover } : a);
      }
      return [...prev, { userId: u.id, fullName: u.fullName, email: u.email, role: u.role, isApprover }];
    });
  };

  const removeApprover = (userId: string) => {
    setFormApprovers((prev) => prev.filter((a) => a.userId !== userId));
  };

  // Export Excel (mock)
  const handleExportExcel = () => {
    info("Xuất Excel", "Đang xuất file Excel...");
  };

  // Export PDF with full proposal details and attachments list
  const handleExportPDF = (p: NewDeviceProposal) => {
    try {
      exportProposalToPDF(p);
      info("Xuất PDF", `Đã xuất phiếu ${p.proposalCode} thành công`);
    } catch (err) {
      error("Lỗi khi xuất PDF");
    }
  };

  // Status config
  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    "Bản nháp": { color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", icon: <Edit2 size={12} /> },
    "Chờ duyệt": { color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200", icon: <Clock size={12} /> },
    "Đã duyệt": { color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200", icon: <CheckCircle size={12} /> },
    "Từ chối": { color: "text-red-700", bg: "bg-red-100", border: "border-red-200", icon: <XCircle size={12} /> },
  };

  const renderSortIcon = (col: SortKey) => (
    <span className="inline-flex flex-col ml-1 opacity-50">
      {sortKey === col ? (
        sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <span className="text-slate-300"><ChevronUp size={10} /></span>
      )}
    </span>
  );

  // ── Render ──
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>
              <Package size={20} className="text-white" />
            </div>
            Thiết Bị Mới
          </h1>
          <p className="text-slate-500 text-sm mt-1">Đề xuất và quản lý phiếu đề xuất trang thiết bị mới</p>
        </div>
        <div className="flex items-center gap-3">
          {myNotifications.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle size={16} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">{myNotifications.length} thông báo mới</span>
            </div>
          )}
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
          >
            <Plus size={18} />
            Đề xuất thiết bị mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng phiếu", value: proposals.filter((p) => p.proposedById === user?.id || p.status !== "Bản nháp").length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Bản nháp", value: proposals.filter((p) => p.status === "Bản nháp" && p.proposedById === user?.id).length, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Chờ duyệt", value: proposals.filter((p) => p.status === "Chờ duyệt").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đã duyệt", value: proposals.filter((p) => p.status === "Đã duyệt").length, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-52"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["all", "Bản nháp", "Chờ duyệt", "Đã duyệt", "Từ chối"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === s ? "text-white shadow-sm" : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                  }`}
                  style={filterStatus === s ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" } : {}}
                >
                  {s === "all" ? "Tất cả" : s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  showColumnConfig ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Settings2 size={15} />
                Cấu hình
              </button>
              {showColumnConfig && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-20 p-3">
                  <p className="text-xs font-bold text-slate-600 mb-2">Hiển thị cột</p>
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-slate-50 rounded px-1">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600">
                        {key === "proposalCode" && "Mã phiếu"}
                        {key === "proposedDate" && "Ngày yêu cầu"}
                        {key === "necessity" && "Nội dung yêu cầu"}
                        {key === "proposedBy" && "Người đề xuất"}
                        {key === "status" && "Trạng thái"}
                        {key === "actions" && "Thao tác"}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all">
              <FileSpreadsheet size={15} />
              Xuất Excel
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
              <Settings2 size={15} />
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-transparent text-xs outline-none cursor-pointer"
              >
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} dòng</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {visibleColumns.proposalCode && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none" onClick={() => handleSort("proposalCode")}>
                    Mã phiếu {renderSortIcon("proposalCode")}
                  </th>
                )}
                {visibleColumns.proposedDate && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none" onClick={() => handleSort("proposedDate")}>
                    Ngày yêu cầu {renderSortIcon("proposedDate")}
                  </th>
                )}
                {visibleColumns.necessity && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => handleSort("necessity")}>
                    Nội dung yêu cầu {renderSortIcon("necessity")}
                  </th>
                )}
                {visibleColumns.proposedBy && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none" onClick={() => handleSort("proposedBy")}>
                    Người đề xuất {renderSortIcon("proposedBy")}
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => handleSort("status")}>
                    Trạng thái {renderSortIcon("status")}
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Thao tác</th>
                )}
              </tr>
              {/* Column filters */}
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {visibleColumns.proposalCode && (
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Lọc mã..."
                      value={colFilters.proposalCode}
                      onChange={(e) => { setColFilters((f) => ({ ...f, proposalCode: e.target.value })); setPage(1); }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  </td>
                )}
                {visibleColumns.proposedDate && (
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <input
                        type="date"
                        value={colFilters.proposedDate}
                        onChange={(e) => { setColFilters((f) => ({ ...f, proposedDate: e.target.value })); setPage(1); }}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        title="Từ ngày"
                      />
                      <input
                        type="date"
                        value={colFilters.proposedDateTo}
                        onChange={(e) => { setColFilters((f) => ({ ...f, proposedDateTo: e.target.value })); setPage(1); }}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        title="Đến ngày"
                      />
                    </div>
                  </td>
                )}
                {visibleColumns.necessity && (
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Lọc nội dung..."
                      value={colFilters.necessity}
                      onChange={(e) => { setColFilters((f) => ({ ...f, necessity: e.target.value })); setPage(1); }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  </td>
                )}
                {visibleColumns.proposedBy && (
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Lọc người..."
                      value={colFilters.proposedBy}
                      onChange={(e) => { setColFilters((f) => ({ ...f, proposedBy: e.target.value })); setPage(1); }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  </td>
                )}
                {visibleColumns.status && (
                  <td className="px-4 py-2">
                    <select
                      value={colFilters.status}
                      onChange={(e) => { setColFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    >
                      <option value="">Tất cả</option>
                      {["Bản nháp", "Chờ duyệt", "Đã duyệt", "Từ chối"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                )}
                {visibleColumns.actions && (
                  <td className="px-4 py-2">
                    <button
                      onClick={() => { setColFilters({ proposalCode: "", proposedDate: "", proposedDateTo: "", necessity: "", proposedBy: "", status: "" }); setPage(1); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      <Filter size={11} /> Xóa lọc
                    </button>
                  </td>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-4 py-12 text-center">
                    <Package size={40} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400 font-medium text-sm">Không tìm thấy phiếu đề xuất nào</p>
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const sc = statusConfig[p.status];
                  const isOwner = p.proposedById === user?.id;
                  const canApproveThis = canApprove(p);
                  const isRelatedThis = isRelated(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {visibleColumns.proposalCode && (
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{p.proposalCode}</span>
                        </td>
                      )}
                      {visibleColumns.proposedDate && (
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{p.proposedDate ? formatDate(p.proposedDate) : <span className="text-slate-300 italic">Chưa gửi</span>}</span>
                        </td>
                      )}
                      {visibleColumns.necessity && (
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-sm text-slate-700 line-clamp-2">{p.necessity}</p>
                        </td>
                      )}
                      {visibleColumns.proposedBy && (
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                              <User size={13} className="text-white" />
                            </div>
                            <span className="text-sm text-slate-700">{p.proposedBy}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                              {sc.icon}
                              {p.status}
                            </span>
                            {p.status === "Từ chối" && p.rejectionReason && (
                              <div className="relative group">
                                <AlertCircle size={14} className="text-red-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  <p className="font-semibold mb-1">Lý do từ chối:</p>
                                  <p>{p.rejectionReason}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => setViewProposal(p)}
                              title="Xem phiếu"
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                            >
                              <Eye size={14} className="text-blue-600" />
                            </button>
                            {/* Edit - owner + draft/rejected */}
                            {isOwner && (p.status === "Bản nháp" || p.status === "Từ chối") && (
                              <button
                                onClick={() => p.status === "Từ chối" ? handleReopenProposal(p) : openEditForm(p)}
                                title={p.status === "Từ chối" ? "Mở lại & chỉnh sửa" : "Chỉnh sửa"}
                                className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors"
                              >
                                <Edit2 size={14} className="text-amber-600" />
                              </button>
                            )}
                            {/* Export PDF */}
                            <button
                              onClick={() => handleExportPDF(p)}
                              title="Xuất PDF"
                              className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors"
                            >
                              <Download size={14} className="text-purple-600" />
                            </button>
                            {/* Approve - only for approvers on pending */}
                            {canApproveThis && p.status === "Chờ duyệt" && (
                              <>
                                <button
                                  onClick={() => setApproveProposal(p)}
                                  title="Phê duyệt"
                                  className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                >
                                  <CheckCircle size={14} className="text-emerald-600" />
                                </button>
                                <button
                                  onClick={() => { setRejectProposal(p); setRejectReason(""); }}
                                  title="Từ chối"
                                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                                >
                                  <XCircle size={14} className="text-red-500" />
                                </button>
                              </>
                            )}
                            {/* Register device - only after approved and not yet registered */}
                            {p.status === "Đã duyệt" && !p.registeredToSystem && (
                              <button
                                onClick={() => handleRegisterDevice(p)}
                                title="Đăng ký thiết bị"
                                className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors"
                              >
                                <ClipboardList size={14} className="text-teal-600" />
                              </button>
                            )}
                            {/* Related person indicator */}
                            {isRelatedThis && !canApproveThis && (
                              <span title="Bạn là người liên quan" className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <UserCheck size={14} className="text-indigo-500" />
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-500">
            Hiển thị {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length} phiếu
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all">
              <ChevronsLeft size={15} />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pg = start + i;
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${pg === page ? "text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                  style={pg === page ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" } : {}}
                >
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all">
              <ChevronRight size={15} />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all">
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Proposal Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  {editingProposal ? "Chỉnh sửa phiếu đề xuất" : "Phiếu đề xuất thiết bị mới"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Mã tài liệu: BM.01.QL.TC.018</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                  {editingProposal?.proposalCode ?? `PDX-${new Date().getFullYear()}-${String(proposals.length + 1).padStart(3, "0")}`}
                </span>
                <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Necessity */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Sự cần thiết đầu tư thiết bị <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formNecessity}
                  onChange={(e) => setFormNecessity(e.target.value)}
                  placeholder="Mô tả lý do tại sao cần đầu tư thiết bị này..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              {/* Device Requirements */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700">Yêu cầu về thiết bị</label>
                  <button
                    onClick={handleAddDevice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                  >
                    <Plus size={14} /> Thêm đề xuất khác
                  </button>
                </div>
                <div className="space-y-4">
                  {formDevices.map((dev, idx) => (
                    <div key={dev.id} className="border-2 border-slate-100 rounded-2xl p-4 space-y-3 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thiết bị {idx + 1}</span>
                        {formDevices.length > 1 && (
                          <button onClick={() => handleRemoveDevice(dev.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <Trash2 size={13} className="text-red-500" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Tên thiết bị <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={dev.deviceName}
                            onChange={(e) => handleDeviceChange(dev.id, "deviceName", e.target.value)}
                            placeholder="Nhập tên thiết bị"
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Hãng sản xuất</label>
                          <input
                            type="text"
                            value={dev.manufacturer}
                            onChange={(e) => handleDeviceChange(dev.id, "manufacturer", e.target.value)}
                            placeholder="Tên hãng sản xuất"
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Năm sản xuất</label>
                          <select
                            value={dev.yearOfManufacture}
                            onChange={(e) => handleDeviceChange(dev.id, "yearOfManufacture", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          >
                            <option value="">Chọn năm</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Nhà cung cấp phân phối</label>
                          <input
                            type="text"
                            value={dev.distributor}
                            onChange={(e) => handleDeviceChange(dev.id, "distributor", e.target.value)}
                            placeholder="Tên nhà cung cấp"
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Số lượng</label>
                          <input
                            type="number"
                            min={1}
                            value={dev.quantity}
                            onChange={(e) => handleDeviceChange(dev.id, "quantity", Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Yêu cầu thông số kỹ thuật</label>
                        <textarea
                          value={dev.technicalSpecs}
                          onChange={(e) => handleDeviceChange(dev.id, "technicalSpecs", e.target.value)}
                          placeholder="Mô tả thông số kỹ thuật yêu cầu..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        />
                      </div>
                      {/* Attachments - PDF only */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Đính kèm (chỉ PDF)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {dev.attachments.map((f) => (
                            <div key={f.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                              <FileText size={12} />
                              <span className="max-w-32 truncate">{f.name}</span>
                              <button onClick={() => handleRemoveAttachment(dev.id, f.id || "")} className="hover:text-red-900">
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          ref={(el) => { fileInputRefs.current[dev.id] = el; }}
                          onChange={(e) => handleFileAttach(dev.id, e.target.files)}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRefs.current[dev.id]?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all"
                        >
                          <Paperclip size={13} /> Đính kèm file PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                <Save size={16} /> Lưu bản nháp
              </button>
              <button
                onClick={handleSendProposal}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
              >
                <Send size={16} /> Gửi đề xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approver Selection Modal ── */}
      {showApproverSelect && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck size={20} className="text-blue-600" />
                  Chọn người nhận đề xuất
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Chọn người phê duyệt và người liên quan</p>
              </div>
              <button onClick={() => setShowApproverSelect(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={approverSearch}
                  onChange={(e) => setApproverSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Selected */}
              {formApprovers.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Đã chọn</p>
                  <div className="flex flex-wrap gap-2">
                    {formApprovers.map((a) => (
                      <div key={a.userId} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${a.isApprover ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
                        {a.isApprover ? <CheckCircle size={12} /> : <UserCheck size={12} />}
                        {a.fullName}
                        <span className="opacity-60">({a.isApprover ? "Duyệt" : "Liên quan"})</span>
                        <button onClick={() => removeApprover(a.userId)} className="hover:opacity-80">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidates */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Danh sách người dùng</p>
                <div className="space-y-2">
                  {approverCandidates.map((u) => {
                    const selected = formApprovers.find((a) => a.userId === u.id);
                    return (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{u.fullName}</p>
                            <p className="text-xs text-slate-400">{u.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleApprover(u, true)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selected?.isApprover ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => toggleApprover(u, false)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selected && !selected.isApprover ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
                          >
                            Liên quan
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setShowApproverSelect(false)} className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                Hủy
              </button>
              <button
                onClick={handleFinalizeSend}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
              >
                <Send size={16} /> Hoàn tất & Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Proposal Modal ── */}
      {viewProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Phiếu đề xuất trang thiết bị</h2>
                <p className="text-xs text-slate-400 mt-0.5">Mã tài liệu: BM.01.QL.TC.018 • {viewProposal.proposalCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleExportPDF(viewProposal)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-all">
                  <Download size={14} /> Xuất PDF
                </button>
                <button onClick={() => setViewProposal(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Header info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Mã phiếu</p>
                  <p className="font-mono font-bold text-blue-700 mt-0.5">{viewProposal.proposalCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Ngày yêu cầu</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{viewProposal.proposedDate ? formatDate(viewProposal.proposedDate) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Người đề xuất</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{viewProposal.proposedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Trạng thái</p>
                  <div className="mt-0.5">
                    {(() => {
                      const sc = statusConfig[viewProposal.status];
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                          {sc.icon} {viewProposal.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Necessity */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Sự cần thiết đầu tư thiết bị</p>
                <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 p-4 rounded-xl">{viewProposal.necessity}</p>
              </div>

              {/* Device requirements */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Yêu cầu về thiết bị</p>
                <div className="space-y-3">
                  {viewProposal.deviceRequirements.map((dev, idx) => (
                    <div key={dev.id} className="border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Thiết bị {idx + 1}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-slate-400">Tên thiết bị:</span> <span className="font-semibold text-slate-700">{dev.deviceName}</span></div>
                        <div><span className="text-slate-400">Hãng sản xuất:</span> <span className="font-semibold text-slate-700">{dev.manufacturer || "—"}</span></div>
                        <div><span className="text-slate-400">Năm sản xuất:</span> <span className="font-semibold text-slate-700">{dev.yearOfManufacture || "—"}</span></div>
                        <div><span className="text-slate-400">Nhà cung cấp phân phối:</span> <span className="font-semibold text-slate-700">{dev.distributor || "—"}</span></div>
                        <div><span className="text-slate-400">Số lượng:</span> <span className="font-semibold text-slate-700">{dev.quantity}</span></div>
                      </div>
                      {dev.technicalSpecs && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 mb-1">Yêu cầu thông số kỹ thuật:</p>
                          <p className="text-sm text-slate-600">{dev.technicalSpecs}</p>
                        </div>
                      )}
                      {dev.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 mb-1">Đính kèm:</p>
                          <div className="flex flex-wrap gap-2">
                            {dev.attachments.map((f) => (
                              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700 hover:bg-red-100 transition-colors">
                                <FileText size={12} /> {f.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approvers */}
              {viewProposal.approvers.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Người nhận đề xuất</p>
                  <div className="space-y-2">
                    {viewProposal.approvers.map((a) => (
                      <div key={a.userId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-sm font-semibold text-slate-700">{a.fullName}</span>
                          <span className="text-xs text-slate-400">({a.role})</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.isApprover ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                          {a.isApprover ? "Người duyệt" : "Người liên quan"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval info */}
              {viewProposal.approvedBy && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Thông tin phê duyệt</p>
                  <p className="text-sm text-emerald-700">Phê duyệt bởi: <strong>{viewProposal.approvedBy}</strong></p>
                  <p className="text-sm text-emerald-700">Thời gian: <strong>{viewProposal.approvedDate}</strong></p>
                </div>
              )}
              {viewProposal.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Lý do từ chối</p>
                  <p className="text-sm text-red-700">{viewProposal.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Confirm Modal ── */}
      {approveProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Xác nhận phê duyệt</h2>
              <p className="text-sm text-slate-500 mt-1">Bạn có chắc muốn phê duyệt phiếu <strong>{approveProposal.proposalCode}</strong>?</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl mb-5 text-sm text-slate-600">
              <p><strong>Người đề xuất:</strong> {approveProposal.proposedBy}</p>
              <p className="mt-1 line-clamp-2"><strong>Nội dung:</strong> {approveProposal.necessity}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApproveProposal(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                Hủy
              </button>
              <button
                onClick={() => handleApprove(approveProposal)}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle size={22} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Từ chối đề xuất</h2>
                  <p className="text-xs text-slate-400">{rejectProposal.proposalCode}</p>
                </div>
              </div>
              <button onClick={() => setRejectProposal(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lý do từ chối <span className="text-red-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối đề xuất..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRejectProposal(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Device Modal ── */}
      {registerProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={20} className="text-teal-600" />
                  Đăng ký thiết bị mới vào hệ thống
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Từ phiếu đề xuất {registerProposal.proposalCode}</p>
              </div>
              <button onClick={() => setRegisterProposal(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Device Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Mã thiết bị <span className="text-red-500">*</span></label>
                  <input type="text" value={regForm.deviceCode} onChange={(e) => setRegForm((f) => ({ ...f, deviceCode: e.target.value }))} placeholder="VD: TB-007" className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                </div>
                {/* Specialty */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Chuyên khoa</label>
                  <select value={regForm.specialty} onChange={(e) => setRegForm((f) => ({ ...f, specialty: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all">
                    {specialties.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Phân loại</label>
                  <select value={regForm.category} onChange={(e) => setRegForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all">
                    {deviceCategories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {/* Device Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Loại thiết bị</label>
                  <select value={regForm.deviceType} onChange={(e) => setRegForm((f) => ({ ...f, deviceType: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all">
                    {deviceTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {/* Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Model</label>
                  <input type="text" value={regForm.model} onChange={(e) => setRegForm((f) => ({ ...f, model: e.target.value }))} placeholder="Nhập model thiết bị" className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                </div>
                {/* Serial */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Số serial <span className="text-red-500">*</span></label>
                  <input type="text" value={regForm.serial} onChange={(e) => setRegForm((f) => ({ ...f, serial: e.target.value }))} placeholder="Số serial duy nhất" className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                </div>
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Vị trí</label>
                  <select value={regForm.location} onChange={(e) => setRegForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all">
                    {deviceLocations.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                {/* Manufacturer */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nhà sản xuất</label>
                  <input type="text" value={regForm.manufacturer} onChange={(e) => setRegForm((f) => ({ ...f, manufacturer: e.target.value }))} placeholder="Tên công ty sản xuất" className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                </div>
                {/* Origin */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Xuất xứ</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regOriginSearch || regForm.origin}
                      onChange={(e) => { setRegOriginSearch(e.target.value); }}
                      onFocus={() => setRegOriginSearch("")}
                      placeholder="Tìm tên nước..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                    {regOriginSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                        {countries.filter((c) => c.toLowerCase().includes(regOriginSearch.toLowerCase())).map((c) => (
                          <button key={c} onClick={() => { setRegForm((f) => ({ ...f, origin: c })); setRegOriginSearch(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors">
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Year of manufacture */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Năm sản xuất</label>
                  <select
                    value={regForm.yearOfManufacture}
                    onChange={(e) => setRegForm((f) => ({ ...f, yearOfManufacture: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  >
                    <option value="">Chọn năm</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {/* Distributor */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nhà phân phối</label>
                  <input type="text" value={regForm.distributor} onChange={(e) => setRegForm((f) => ({ ...f, distributor: e.target.value }))} placeholder="Tên nhà phân phối, nhà cung cấp" className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                </div>
                {/* Responsible person */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Người phụ trách quản lý</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regUserSearch || regForm.responsiblePerson}
                      onChange={(e) => setRegUserSearch(e.target.value)}
                      onFocus={() => setRegUserSearch("")}
                      placeholder="Tìm người phụ trách..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                    {regUserSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                        {allUsers.filter((u) => u.fullName.toLowerCase().includes(regUserSearch.toLowerCase())).map((u) => (
                          <button key={u.id} onClick={() => { setRegForm((f) => ({ ...f, responsiblePerson: u.fullName })); setRegUserSearch(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors">
                            <span className="font-semibold">{u.fullName}</span> <span className="text-slate-400 text-xs">({u.role})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Responsible person start date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày bắt đầu phụ trách</label>
                  <input type="date" value={regForm.responsiblePersonStart} onChange={(e) => setRegForm((f) => ({ ...f, responsiblePersonStart: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                </div>
                {/* Condition on receive */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Tình trạng khi nhận máy</label>
                  <select value={regForm.conditionOnReceive} onChange={(e) => setRegForm((f) => ({ ...f, conditionOnReceive: e.target.value as RegisterDeviceForm["conditionOnReceive"] }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all">
                    {["Máy mới", "Đã qua sử dụng", "Tân trang lại"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {/* Operating hours */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Thời gian sử dụng</label>
                  <div className="flex items-center gap-2">
                    <input type="time" value={regForm.operatingHoursStart} onChange={(e) => setRegForm((f) => ({ ...f, operatingHoursStart: e.target.value }))} className="flex-1 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                    <span className="text-slate-400 text-sm">đến</span>
                    <input type="time" value={regForm.operatingHoursEnd} onChange={(e) => setRegForm((f) => ({ ...f, operatingHoursEnd: e.target.value }))} className="flex-1 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" />
                  </div>
                </div>
                {/* Install location */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Vị trí lắp đặt</label>
                  <select value={regForm.installLocation} onChange={(e) => setRegForm((f) => ({ ...f, installLocation: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all">
                    {deviceLocations.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Calibration / Maintenance / Inspection toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "hasCalibration" as const, freqKey: "calibrationFrequency" as const, label: "Hiệu chuẩn", color: "emerald" },
                  { key: "hasMaintenance" as const, freqKey: "maintenanceFrequency" as const, label: "Bảo trì", color: "blue" },
                  { key: "hasInspection" as const, freqKey: "inspectionFrequency" as const, label: "Kiểm tra", color: "purple" },
                ].map((item) => (
                  <div key={item.key} className={`p-4 rounded-2xl border-2 transition-all ${regForm[item.key] ? `border-${item.color}-200 bg-${item.color}-50` : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      <button
                        onClick={() => setRegForm((f) => ({ ...f, [item.key]: !f[item.key] }))}
                        className="transition-colors"
                      >
                        {regForm[item.key]
                          ? <ToggleRight size={28} className={`text-${item.color}-500`} />
                          : <ToggleLeft size={28} className="text-slate-300" />
                        }
                      </button>
                    </div>
                    <input
                      type="text"
                      disabled={!regForm[item.key]}
                      value={regForm[item.freqKey]}
                      onChange={(e) => setRegForm((f) => ({ ...f, [item.freqKey]: e.target.value }))}
                      placeholder="Tần suất (VD: 6 tháng)"
                      className={`w-full px-3 py-2 rounded-xl border text-xs transition-all ${regForm[item.key] ? "border-slate-200 bg-white focus:border-blue-400" : "border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                    />
                  </div>
                ))}
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700">Người liên hệ</label>
                  <button
                    onClick={() => setRegForm((f) => ({ ...f, contacts: [...f.contacts, { name: "", phone: "", email: "" }] }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all"
                  >
                    <Plus size={13} /> Thêm người liên hệ
                  </button>
                </div>
                <div className="space-y-3">
                  {regForm.contacts.map((c, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
                      <input type="text" value={c.name} onChange={(e) => setRegForm((f) => ({ ...f, contacts: f.contacts.map((ct, i) => i === idx ? { ...ct, name: e.target.value } : ct) }))} placeholder="Họ tên" className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-all" />
                      <input type="tel" value={c.phone} onChange={(e) => setRegForm((f) => ({ ...f, contacts: f.contacts.map((ct, i) => i === idx ? { ...ct, phone: e.target.value } : ct) }))} placeholder="Số điện thoại" className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-all" />
                      <div className="flex gap-2">
                        <input type="email" value={c.email} onChange={(e) => setRegForm((f) => ({ ...f, contacts: f.contacts.map((ct, i) => i === idx ? { ...ct, email: e.target.value } : ct) }))} placeholder="Email" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-all" />
                        {regForm.contacts.length > 1 && (
                          <button onClick={() => setRegForm((f) => ({ ...f, contacts: f.contacts.filter((_, i) => i !== idx) }))} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0">
                            <Trash2 size={13} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setRegisterProposal(null)} className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                Hủy
              </button>
              <button
                onClick={handleFinishRegister}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}
              >
                <CheckCircle size={16} /> Hoàn tất đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
