/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useRef, useId, useEffect } from "react";
import {
  Cpu,
  Search,
  Grid3X3,
  List,
  Plus,
  X,
  Save,
  Tag,
  Hash,
  Factory,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Globe,
  Package,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  Upload,
  Eye,
  Settings,
  Printer,
  QrCode,
  RotateCcw,
  Wrench,
  ClipboardCheck,
  Truck,
  AlertTriangle,
  History,
  MoreHorizontal,
  Trash2,
  Edit,
  XCircle,
  Check,
  Image,
  Paperclip,
  CheckSquare,
  Square,
  Gauge,
  ArrowRightLeft,
  FileCheck,
  FilePlus,
  ClipboardList,
  Send,
  MessageSquare,
  Contact,
  Users,
  Briefcase,
  Building2,
  Link,
  File,
  EyeIcon,
  Filter,
  RefreshCw,
  GraduationCap,
  Microscope,
  Handshake,
  BookOpen,
  Award,
  ShieldCheck,
  FlaskConical,
  FileSignature,
  ListChecks,
  Table,
} from "lucide-react";
import ReturnAcceptanceFormModal from "./ReturnAcceptanceFormModal";
import ReturnAcceptanceSection from "./ReturnAcceptanceSection";
import DeviceRegistrationModal from "./DeviceRegistrationModal";
import CalibrationModal from "./CalibrationModal";
import MaintenanceModal from "./MaintenanceModal";
import TransferModal from "./TransferModal";
import LiquidationModal from "./LiquidationModal";
import TrainingModal from "./TrainingModal";
import IncidentReportModal from "./IncidentReportModal";
import DeviceManagementModal from "./DeviceManagementModal";
import {
  Device,
  DeviceStatus,
  DeviceContact,
  DeviceAccessory,
  DeviceManagerHistory,
  generateDeviceCode,
  formatDate,
  MOCK_USERS_LIST,
  specialties,
  deviceCategories,
  deviceTypes,
  deviceLocations,
  countries,
  IncidentReport,
  WorkOrder,
  AttachedFile,
  mockUserProfiles,
  UserProfile,
  TrainingPlan,
  TrainingDocument,
  TrainingResult,
  mockTrainingPlans,
  mockTrainingDocuments,
  mockTrainingResults,
} from "@/lib/mockData";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "grid" | "list";

export interface Column {
  key: string;
  label: string;
  visible: boolean;
  width?: number;
}

export type WorkflowStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Hoàn thành";

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
  status: WorkflowStatus;
  createdAt: string;
  updatedAt?: string;
}

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
  status: WorkflowStatus;
  createdAt: string;
  updatedAt?: string;
}

type AcceptanceMainTab = "new" | "return";
export type ReturnAcceptanceTab = "checklist" | "transport";
type AcceptanceStatus = "missing" | "pending" | "done";
type AcceptanceItemKey =
  | "approvalForm"
  | "handoverRecord"
  | "installationSurvey"
  | "userManual"
  | "co"
  | "cq"
  | "contract"
  | "installationReport"
  | "usageConfirmation";

interface AcceptanceItemState {
  status: AcceptanceStatus;
  files: AttachedFile[];
  refCode?: string;
}

interface InstallationSurveyFormState {
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

interface NewAcceptanceRecord {
  approvalCode: string;
  items: Record<AcceptanceItemKey, AcceptanceItemState>;
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

interface AcceptanceTableColumn {
  key:
    | "code"
    | "name"
    | "model"
    | "serial"
    | "location"
    | "status"
    | "manufacturer"
    | "yearOfManufacture"
    | "countryOfOrigin"
    | "distributor"
    | "contactPerson"
    | "phone"
    | "email"
    | "usageStartDate"
    | "image";
  label: string;
  visible: boolean;
}

const ACCEPTANCE_REQUIRED_KEYS: AcceptanceItemKey[] = [
  "approvalForm",
  "handoverRecord",
  "installationSurvey",
  "userManual",
  "co",
  "cq",
  "contract",
  "installationReport",
];

const ACCEPTANCE_TABLE_DEFAULT_COLUMNS: AcceptanceTableColumn[] = [
  { key: "code", label: "Mã thiết bị", visible: true },
  { key: "name", label: "Tên thiết bị", visible: true },
  { key: "model", label: "Model", visible: true },
  { key: "serial", label: "Số serial", visible: true },
  { key: "location", label: "Vị trí", visible: true },
  { key: "status", label: "Trạng thái", visible: true },
  { key: "manufacturer", label: "Nhà sản xuất", visible: false },
  { key: "yearOfManufacture", label: "Năm sản xuất", visible: false },
  { key: "countryOfOrigin", label: "Xuất xứ", visible: false },
  { key: "distributor", label: "Nhà phân phối", visible: false },
  { key: "contactPerson", label: "Người liên hệ", visible: false },
  { key: "phone", label: "Số điện thoại", visible: false },
  { key: "email", label: "Email liên hệ", visible: false },
  { key: "usageStartDate", label: "Bắt đầu sử dụng", visible: false },
  { key: "image", label: "Hình ảnh", visible: false },
];

const mockTransferProposals: TransferProposal[] = [
  {
    id: "tr1",
    transferCode: "DC-2026-001",
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    fromLocation: "Phòng hóa sinh – Huyết học",
    toLocation: "Phòng xét nghiệm vệ tinh - Cơ sở 2",
    reason: "Điều phối khối lượng mẫu theo năng lực vận hành giữa hai cơ sở.",
    plannedTransferDate: "2026-03-05",
    requestedBy: "Phạm Thị Kỹ Thuật",
    approver: "Lê Văn Trưởng Phòng",
    status: "Chờ duyệt",
    createdAt: "2026-03-01T08:30:00",
  },
  {
    id: "tr2",
    transferCode: "DC-2026-002",
    deviceId: "d3",
    deviceCode: "TB-003",
    deviceName: "Máy miễn dịch tự động",
    fromLocation: "Phòng nuôi cấy vi sinh",
    toLocation: "Kho lưu thiết bị chờ tái phân bổ",
    reason: "Tạm điều chuyển chờ bảo trì tổng quát và tái phân bổ.",
    plannedTransferDate: "2026-02-25",
    requestedBy: "Vũ Thị Thiết Bị",
    approver: "Nguyễn Văn Admin",
    status: "Đã duyệt",
    createdAt: "2026-02-20T10:15:00",
    updatedAt: "2026-02-21T15:00:00",
  },
];

const mockLiquidationProposals: LiquidationProposal[] = [
  {
    id: "tl1",
    liquidationCode: "TL-2026-001",
    deviceId: "d6",
    deviceCode: "TB-006",
    deviceName: "Tủ an toàn sinh học cấp II",
    reason: "Thiết bị xuống cấp, chi phí sửa chữa vượt ngưỡng đầu tư mới.",
    method: "Thanh lý bán đấu giá",
    estimatedValue: "35000000",
    plannedDate: "2026-03-10",
    requestedBy: "Vũ Thị Thiết Bị",
    approver: "Trần Thị Giám Đốc",
    status: "Chờ duyệt",
    createdAt: "2026-03-01T09:00:00",
  },
  {
    id: "tl2",
    liquidationCode: "TL-2026-002",
    deviceId: "d8",
    deviceCode: "TB-008",
    deviceName: "Máy đo đông máu tự động",
    reason: "Ngừng sử dụng theo kế hoạch thay thế thiết bị mới.",
    method: "Hủy theo quy định chất thải y tế",
    estimatedValue: "0",
    plannedDate: "2026-02-20",
    requestedBy: "Nguyễn Văn Admin",
    approver: "Trần Thị Giám Đốc",
    status: "Hoàn thành",
    createdAt: "2026-02-15T08:00:00",
    updatedAt: "2026-02-22T17:30:00",
  },
];

// Action button configuration with icons and colors
const actionButtons = [
  { key: "accept", label: "Tiếp nhận", icon: ClipboardCheck, color: "emerald", bg: "bg-emerald-500", hover: "hover:bg-emerald-600" },
  { key: "info", label: "Thông tin quản lý", icon: Settings, color: "blue", bg: "bg-blue-500", hover: "hover:bg-blue-600" },
  { key: "incident", label: "Báo cáo sự cố", icon: AlertTriangle, color: "red", bg: "bg-red-500", hover: "hover:bg-red-600" },
  { key: "calibration", label: "Hiệu chuẩn", icon: Gauge, color: "purple", bg: "bg-purple-500", hover: "hover:bg-purple-600" },
  { key: "maintenance", label: "Bảo dưỡng", icon: Wrench, color: "orange", bg: "bg-orange-500", hover: "hover:bg-orange-600" },
  { key: "transfer", label: "Điều chuyển", icon: ArrowRightLeft, color: "cyan", bg: "bg-cyan-500", hover: "hover:bg-cyan-600" },
  { key: "dispose", label: "Thanh lý", icon: Trash2, color: "slate", bg: "bg-slate-500", hover: "hover:bg-slate-600" },
  { key: "training", label: "Đào tạo", icon: GraduationCap, color: "indigo", bg: "bg-indigo-500", hover: "hover:bg-indigo-600" },
];

const statusConfig: Record<DeviceStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  "Đăng ký mới": { color: "text-blue-700", bg: "bg-blue-100", icon: <FileText size={13} /> },
  "Chờ vận hành": { color: "text-amber-700", bg: "bg-amber-100", icon: <Clock size={13} /> },
  "Đang vận hành": { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 size={13} /> },
  "Tạm dừng": { color: "text-red-700", bg: "bg-red-100", icon: <AlertCircle size={13} /> },
  "Tạm điều chuyển": { color: "text-purple-700", bg: "bg-purple-100", icon: <Truck size={13} /> },
  "Ngừng sử dụng": { color: "text-slate-600", bg: "bg-slate-100", icon: <XCircle size={13} /> },
};

const deviceColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

// Default columns for table view
const defaultColumns: Column[] = [
  { key: "code", label: "Mã thiết bị", visible: true, width: 100 },
  { key: "name", label: "Tên thiết bị", visible: true, width: 200 },
  { key: "model", label: "Model", visible: true, width: 150 },
  { key: "serial", label: "Số serial", visible: true, width: 150 },
  { key: "location", label: "Vị trí", visible: true, width: 180 },
  { key: "manufacturer", label: "Nhà sản xuất", visible: true, width: 150 },
  { key: "yearOfManufacture", label: "Năm SX", visible: true, width: 80 },
  { key: "countryOfOrigin", label: "Xuất xứ", visible: true, width: 100 },
  { key: "distributor", label: "Nhà phân phối", visible: false, width: 180 },
  { key: "contactPerson", label: "Người liên hệ", visible: false, width: 140 },
  { key: "phone", label: "Điện thoại", visible: false, width: 110 },
  { key: "email", label: "Email", visible: false, width: 180 },
  { key: "usageStartDate", label: "Ngày SD", visible: false, width: 100 },
  { key: "image", label: "Hình ảnh", visible: false, width: 80 },
  { key: "status", label: "Trạng thái", visible: true, width: 130 },
  { key: "actions", label: "Thao tác", visible: true, width: 80 },
];

export default function DeviceProfileTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const uniqueId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const accessoryFileInputRef = useRef<HTMLInputElement | null>(null);
  const newAcceptanceAttachmentInputRef = useRef<HTMLInputElement>(null);
  const returnHandoverAttachmentInputRef = useRef<HTMLInputElement>(null);
  const returnAcceptanceFormAttachmentInputRef = useRef<HTMLInputElement>(null);
  
  const { devices: contextDevices, addDevice, updateDevice, incidents, schedules, addHistory } = useData();
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => { setDevices(contextDevices); }, [contextDevices]);

  // Listen for bypass event
  useEffect(() => {
    const handleOpenIncident = (e: Event) => {
      const { deviceId } = (e as CustomEvent).detail;
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        setSelectedDeviceForAction(device);
        setActiveModal("incident");
      }
    };
    window.addEventListener("openIncidentReport", handleOpenIncident);
    return () => window.removeEventListener("openIncidentReport", handleOpenIncident);
  }, [devices]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceDetailSubTab, setDeviceDetailSubTab] = useState<"info" | "incidents" | "calibration">("info");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  // Table specific states
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [sortColumn, setSortColumn] = useState<string>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  
  // Filter states for each column
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedDeviceForAction, setSelectedDeviceForAction] = useState<Device | null>(null);
  const [deviceCounter, setDeviceCounter] = useState(0);
  
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);
  const [attachmentViewerTitle, setAttachmentViewerTitle] = useState("");
  const [attachmentViewerFiles, setAttachmentViewerFiles] = useState<AttachedFile[]>([]);

  // Transfer and liquidation workflow state
  const [transferRecords, setTransferRecords] = useState<TransferProposal[]>(mockTransferProposals);
  const [liquidationRecords, setLiquidationRecords] = useState<LiquidationProposal[]>(mockLiquidationProposals);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(mockTrainingPlans);
  const [trainingDocuments, setTrainingDocuments] = useState<TrainingDocument[]>(mockTrainingDocuments);
  const [trainingResults, setTrainingResults] = useState<TrainingResult[]>(mockTrainingResults);
  const [transferCounter, setTransferCounter] = useState(3);
  const [liquidationCounter, setLiquidationCounter] = useState(3);
  const [planCounter, setPlanCounter] = useState(2);
  const [transferViewMode, setTransferViewMode] = useState<"list" | "form">("list");
  const [liquidationViewMode, setLiquidationViewMode] = useState<"list" | "form">("list");
  const [trainingViewMode, setTrainingViewMode] = useState<"list" | "form">("list");
  const [transferFilterStatus, setTransferFilterStatus] = useState<string>("all");
  const [liquidationFilterStatus, setLiquidationFilterStatus] = useState<string>("all");
  const [trainingFilterStatus, setTrainingFilterStatus] = useState<string>("all");
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);
  const [editingLiquidationId, setEditingLiquidationId] = useState<string | null>(null);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferProposal | null>(null);
  const [selectedLiquidation, setSelectedLiquidation] = useState<LiquidationProposal | null>(null);
  const [transferForm, setTransferForm] = useState<Partial<TransferProposal>>({
    fromLocation: "",
    toLocation: "",
    reason: "",
    plannedTransferDate: "",
    requestedBy: "",
    approver: "",
    status: "Nháp",
  });
  const [liquidationForm, setLiquidationForm] = useState<Partial<LiquidationProposal>>({
    reason: "",
    method: "",
    estimatedValue: "",
    plannedDate: "",
    requestedBy: "",
    approver: "",
    status: "Nháp",
  });
  
  // Device registration form
  const [form, setForm] = useState<Partial<Device>>({
    code: "",
    name: "",
    specialty: specialties[0],
    category: deviceCategories[0],
    deviceType: deviceTypes[0],
    model: "",
    serial: "",
    location: deviceLocations[0],
    manufacturer: "",
    countryOfOrigin: "",
    yearOfManufacture: "",
    distributor: "",
    usageStartDate: "",
    usageTime: "",
    installationLocation: "",
    accessories: [],
    contacts: [],
    status: "Đăng ký mới",
    conditionOnReceive: "Máy mới",
    calibrationRequired: false,
    calibrationFrequency: "",
    maintenanceRequired: false,
    maintenanceFrequency: "",
    inspectionRequired: false,
    inspectionFrequency: "",
  });
  
  // Info submenu state
  const [infoSubmenu, setInfoSubmenu] = useState<"history" | "change-manager" | "change-contact" | "print-label" | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showInfoDropdown, setShowInfoDropdown] = useState<string | null>(null);
  
  // Change manager state
  const [newManagerSearch, setNewManagerSearch] = useState("");
  const [newManagerStartDate, setNewManagerStartDate] = useState("");
  const [showManagerSearchDropdown, setShowManagerSearchDropdown] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState<{ id: string; fullName: string } | null>(null);
  
  // Print label state
  const [showQRCode, setShowQRCode] = useState(true);
  const [showLabelInfo, setShowLabelInfo] = useState(true);
  
  // Edit contact state
  const [editingContact, setEditingContact] = useState<Partial<DeviceContact>>(() => {
    // Initialize with existing contact if available
    if (selectedDevice) {
      const existingContact = selectedDevice.contacts?.[0];
      if (existingContact) {
        return {
          fullName: existingContact.fullName,
          phone: existingContact.phone,
          email: existingContact.email,
          address: existingContact.address || "",
        };
      }
    }
    return { fullName: "", phone: "", email: "", address: "" };
  });
  
  // Accessory and contact form states
  const [newAccessory, setNewAccessory] = useState("");
  const [newAccessoryFile, setNewAccessoryFile] = useState<{ name: string; url: string } | null>(null);
  const [newContact, setNewContact] = useState<Partial<DeviceContact>>({
    fullName: "",
    phone: "",
    email: "",
  });
  
  // Device photo
  const [devicePhoto, setDevicePhoto] = useState<{ name: string; url: string } | null>(null);
  
  // Acceptance workflow state
  const [acceptanceMainTab, setAcceptanceMainTab] = useState<AcceptanceMainTab>("new");
  const [returnAcceptanceTab, setReturnAcceptanceTab] = useState<ReturnAcceptanceTab>("checklist");
  const [acceptanceColumns, setAcceptanceColumns] = useState<AcceptanceTableColumn[]>(ACCEPTANCE_TABLE_DEFAULT_COLUMNS);
  const [showAcceptanceColumnConfig, setShowAcceptanceColumnConfig] = useState(false);
  const [acceptanceFilters, setAcceptanceFilters] = useState<Record<string, string>>({});
  const [selectedNewAcceptanceDeviceId, setSelectedNewAcceptanceDeviceId] = useState<string | null>(null);
  const [selectedReturnAcceptanceDeviceId, setSelectedReturnAcceptanceDeviceId] = useState<string | null>(null);
  const [newAcceptanceRecords, setNewAcceptanceRecords] = useState<Record<string, NewAcceptanceRecord>>({});
  const [returnAcceptanceRecords, setReturnAcceptanceRecords] = useState<Record<string, ReturnAcceptanceRecord>>({});
  const [surveyUserSearch, setSurveyUserSearch] = useState("");
  const [returnTransportFilterFrom, setReturnTransportFilterFrom] = useState("");
  const [returnTransportFilterTo, setReturnTransportFilterTo] = useState("");
  const [editingReturnForm, setEditingReturnForm] = useState<ReturnAcceptanceFormState | null>(null);
  const [activeNewAcceptanceUploadKey, setActiveNewAcceptanceUploadKey] = useState<AcceptanceItemKey | null>(null);
  const [showBm05SurveyModal, setShowBm05SurveyModal] = useState(false);
  const [showReturnFormModal, setShowReturnFormModal] = useState(false);
  const [returnReceiverSearch, setReturnReceiverSearch] = useState("");
  const [showReturnReceiverDropdown, setShowReturnReceiverDropdown] = useState(false);
  
  // Search states for dropdowns
  const [countrySearch, setCountrySearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  
  // Real-time search filter
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        d.code.toLowerCase().includes(searchLower) ||
        d.serial.toLowerCase().includes(searchLower) ||
        d.model.toLowerCase().includes(searchLower) ||
        d.name.toLowerCase().includes(searchLower);
      
      const matchesStatus = filterStatus === "all" || d.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, filterStatus]);
  
  // Sorting, filtering and pagination for table view
  const sortedDevices = useMemo(() => {
    if (viewMode !== "list") return filteredDevices;
    
    let result = [...filteredDevices];
    
    // Apply column filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(device => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const deviceValue = getDeviceFieldValue(device, key);
          if (typeof deviceValue === 'string') {
            return deviceValue.toLowerCase().includes(value.toLowerCase());
          }
          return true;
        });
      });
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      const aVal = getDeviceFieldValue(a, sortColumn);
      const bVal = getDeviceFieldValue(b, sortColumn);
      
      const aStr = typeof aVal === 'string' ? aVal : '';
      const bStr = typeof bVal === 'string' ? bVal : '';
      
      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredDevices, sortColumn, sortDirection, viewMode, filters]);

  // Export to Excel function
  const exportToExcel = () => {
    const visibleColumns = columns.filter(c => c.visible && c.key !== 'actions');
    const headers = visibleColumns.map(c => c.label);
    const rows = sortedDevices.map(device => {
      return visibleColumns.map(col => {
        const value = getDeviceFieldValue(device, col.key);
        return typeof value === 'string' ? value : '';
      });
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_sach_thiet_bi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success('Xuất file thành công', 'Danh sách thiết bị đã được xuất ra file Excel');
  };

  const formatDateTimeLabel = (value?: string) => {
    if (!value) return "—";
    if (value.includes("/")) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("vi-VN");
  };

  const downloadCsvFile = (filename: string, headers: string[], rows: string[][], successMessage: string) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success("Xuất file thành công", successMessage);
  };

  const openAttachmentViewer = (title: string, files: AttachedFile[]) => {
    setAttachmentViewerTitle(title);
    setAttachmentViewerFiles(files);
    setShowAttachmentViewer(true);
  };

  const handleDownloadAttachment = (file: AttachedFile) => {
    if (!file.url) {
      error("Lỗi", "File đính kèm không hợp lệ");
      return;
    }

    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewAttachment = (file: AttachedFile) => {
    if (!file.url) {
      error("Lỗi", "Không tìm thấy tệp để xem");
      return;
    }
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  const openPrintableWindow = (title: string, lines: string[]) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      error("Lỗi", "Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup và thử lại.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { font-size: 20px; margin-bottom: 16px; }
            p { margin: 6px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${lines.map((line) => `<p>${line}</p>`).join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getWorkflowStatusClass = (status: WorkflowStatus) => {
    if (status === "Hoàn thành") return "bg-green-100 text-green-700";
    if (status === "Đã duyệt") return "bg-blue-100 text-blue-700";
    if (status === "Chờ duyệt") return "bg-amber-100 text-amber-700";
    if (status === "Từ chối") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const saveTransferProposal = (status: WorkflowStatus) => {
    if (!selectedDeviceForAction || !transferForm.toLocation || !transferForm.reason || !transferForm.approver) {
      error("Lỗi", "Vui lòng nhập nơi điều chuyển, lý do và người phê duyệt");
      return;
    }

    const nowIso = new Date().toISOString();
    const baseData: TransferProposal = {
      id: editingTransferId || `transfer-${Date.now()}`,
      transferCode: editingTransferId
        ? transferRecords.find((record) => record.id === editingTransferId)?.transferCode || `DC-${new Date().getFullYear()}-${String(transferCounter).padStart(3, "0")}`
        : `DC-${new Date().getFullYear()}-${String(transferCounter).padStart(3, "0")}`,
      deviceId: selectedDeviceForAction.id,
      deviceCode: selectedDeviceForAction.code,
      deviceName: selectedDeviceForAction.name,
      fromLocation: transferForm.fromLocation || selectedDeviceForAction.location,
      toLocation: transferForm.toLocation || "",
      reason: transferForm.reason || "",
      plannedTransferDate: transferForm.plannedTransferDate || "",
      requestedBy: transferForm.requestedBy || user?.fullName || "",
      approver: transferForm.approver || "",
      status,
      createdAt: editingTransferId
        ? transferRecords.find((record) => record.id === editingTransferId)?.createdAt || nowIso
        : nowIso,
      updatedAt: nowIso,
    };

    if (editingTransferId) {
      setTransferRecords(transferRecords.map((record) => (record.id === editingTransferId ? baseData : record)));
    } else {
      setTransferRecords([baseData, ...transferRecords]);
      setTransferCounter((prev) => prev + 1);
    }

    setTransferViewMode("list");
    setEditingTransferId(null);
    success("Thành công", status === "Chờ duyệt" ? "Đã gửi phiếu điều chuyển phê duyệt" : "Đã lưu phiếu điều chuyển");
  };

  const saveLiquidationProposal = (status: WorkflowStatus) => {
    if (!selectedDeviceForAction || !liquidationForm.reason || !liquidationForm.method || !liquidationForm.approver) {
      error("Lỗi", "Vui lòng nhập lý do, phương thức và người phê duyệt");
      return;
    }

    const nowIso = new Date().toISOString();
    const baseData: LiquidationProposal = {
      id: editingLiquidationId || `liquidation-${Date.now()}`,
      liquidationCode: editingLiquidationId
        ? liquidationRecords.find((record) => record.id === editingLiquidationId)?.liquidationCode || `TL-${new Date().getFullYear()}-${String(liquidationCounter).padStart(3, "0")}`
        : `TL-${new Date().getFullYear()}-${String(liquidationCounter).padStart(3, "0")}`,
      deviceId: selectedDeviceForAction.id,
      deviceCode: selectedDeviceForAction.code,
      deviceName: selectedDeviceForAction.name,
      reason: liquidationForm.reason || "",
      method: liquidationForm.method || "",
      estimatedValue: liquidationForm.estimatedValue || "0",
      plannedDate: liquidationForm.plannedDate || "",
      requestedBy: liquidationForm.requestedBy || user?.fullName || "",
      approver: liquidationForm.approver || "",
      status,
      createdAt: editingLiquidationId
        ? liquidationRecords.find((record) => record.id === editingLiquidationId)?.createdAt || nowIso
        : nowIso,
      updatedAt: nowIso,
    };

    if (editingLiquidationId) {
      setLiquidationRecords(liquidationRecords.map((record) => (record.id === editingLiquidationId ? baseData : record)));
    } else {
      setLiquidationRecords([baseData, ...liquidationRecords]);
      setLiquidationCounter((prev) => prev + 1);
    }

    setLiquidationViewMode("list");
    setEditingLiquidationId(null);
    success("Thành công", status === "Chờ duyệt" ? "Đã gửi phiếu thanh lý phê duyệt" : "Đã lưu phiếu thanh lý");
  };
  
  const paginatedDevices = useMemo(() => {
    if (viewMode !== "list" || pageSize === -1) return sortedDevices;
    const start = (currentPage - 1) * pageSize;
    return sortedDevices.slice(start, start + pageSize);
  }, [sortedDevices, currentPage, pageSize, viewMode]);
  
  const totalPages = Math.ceil(sortedDevices.length / pageSize);
  
  function getDeviceFieldValue(device: Device, key: string): string | React.ReactNode {
    const primaryContact = device.contacts?.[0];
    switch (key) {
      case "code": return device.code;
      case "name": return device.name;
      case "model": return device.model;
      case "serial": return device.serial;
      case "location": return device.location;
      case "manufacturer": return device.manufacturer;
      case "yearOfManufacture": return device.yearOfManufacture;
      case "countryOfOrigin": return device.countryOfOrigin;
      case "distributor": return device.distributor || '—';
      case "contactPerson": return primaryContact?.fullName || '—';
      case "phone": return primaryContact?.phone || '—';
      case "email": return primaryContact?.email || '—';
      case "usageStartDate": return formatDate(device.usageStartDate);
      case "image": return device.imageUrl ? <img src={device.imageUrl} alt="" className="w-10 h-10 object-cover rounded" /> : '—';
      case "status": return (
        <span className={`${statusConfig[device.status].bg} ${statusConfig[device.status].color} py-0.5 px-2 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
          {statusConfig[device.status].icon}
          {device.status}
        </span>
      );
      default: return "";
    }
  }
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Filtered managers for dropdown
  const filteredManagers = useMemo(() => {
    const managers = MOCK_USERS_LIST.filter(u => 
      u.fullName.toLowerCase().includes(newManagerSearch.toLowerCase())
    );
    return managers;
  }, [newManagerSearch]);

  const acceptanceUsers = useMemo(() => {
    const normalized = surveyUserSearch.trim().toLowerCase();
    if (!normalized) return MOCK_USERS_LIST;
    return MOCK_USERS_LIST.filter((userItem) => userItem.fullName.toLowerCase().includes(normalized));
  }, [surveyUserSearch]);

  const getAttachmentTypeFromName = (filename: string): AttachedFile["type"] => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) return "pdf";
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp")) {
      return "image";
    }
    return "doc";
  };

  const convertFileListToAttachedFiles = (incoming: FileList, prefix: string): AttachedFile[] => {
    return Array.from(incoming).map((file, index) => ({
      id: `${prefix}-${Date.now()}-${index}`,
      name: file.name,
      type: getAttachmentTypeFromName(file.name),
      url: URL.createObjectURL(file),
      size: file.size,
    }));
  };

  const createDefaultSurveyForm = (): InstallationSurveyFormState => ({
    surveyDate: "",
    hasPowerSupply: null,
    hasGrounding: null,
    hasBenchSpace: null,
    hasTemperatureControl: null,
    hasHumidityControl: null,
    hasNetwork: null,
    hasWaterLine: null,
    conclusion: "",
    approver: "",
    surveyor: "",
    relatedUsers: [],
    attachments: [],
    status: "Nháp",
    approvedAt: "",
  });

  const createDefaultAcceptanceItems = (): Record<AcceptanceItemKey, AcceptanceItemState> => ({
    approvalForm: { status: "missing", files: [], refCode: "" },
    handoverRecord: { status: "missing", files: [] },
    installationSurvey: { status: "missing", files: [] },
    userManual: { status: "missing", files: [] },
    co: { status: "missing", files: [] },
    cq: { status: "missing", files: [] },
    contract: { status: "missing", files: [] },
    installationReport: { status: "missing", files: [] },
    usageConfirmation: { status: "missing", files: [] },
  });

  const createDefaultNewAcceptanceRecord = (): NewAcceptanceRecord => ({
    approvalCode: "",
    items: createDefaultAcceptanceItems(),
    installationSurveyForm: createDefaultSurveyForm(),
  });

  const createReturnFormCode = () => {
    const year = new Date().getFullYear();
    const sequence = Object.values(returnAcceptanceRecords).filter((record) => record.acceptanceForm?.formCode?.startsWith(`PTN-${year}-`)).length + 1;
    return `PTN-${year}-${String(sequence).padStart(3, "0")}`;
  };

  const createDefaultReturnAcceptanceForm = (device: Device): ReturnAcceptanceFormState => ({
    formName: `Phiếu tiếp nhận thiết bị ${device.code}`,
    formCode: createReturnFormCode(),
    receiveCondition: "",
    note: "",
    handoverBy: "",
    receivedAt: new Date().toISOString().slice(0, 16),
    receiver: user?.fullName || "",
    attachments: [],
    completed: false,
    completedAt: "",
    createdBy: user?.fullName || "",
  });

  const createDefaultReturnAcceptanceRecord = (): ReturnAcceptanceRecord => ({
    handoverCode: "",
    handoverFiles: [],
    acceptanceForm: undefined,
  });

  const updateNewAcceptanceRecord = (deviceId: string, updater: (base: NewAcceptanceRecord) => NewAcceptanceRecord) => {
    setNewAcceptanceRecords((prev) => {
      const base = prev[deviceId] || createDefaultNewAcceptanceRecord();
      return {
        ...prev,
        [deviceId]: updater(base),
      };
    });
  };

  const updateReturnAcceptanceRecord = (deviceId: string, updater: (base: ReturnAcceptanceRecord) => ReturnAcceptanceRecord) => {
    setReturnAcceptanceRecords((prev) => {
      const base = prev[deviceId] || createDefaultReturnAcceptanceRecord();
      return {
        ...prev,
        [deviceId]: updater(base),
      };
    });
  };

  const getAcceptanceFieldText = (device: Device, key: AcceptanceTableColumn["key"]): string => {
    const primaryContact = device.contacts?.[0];
    switch (key) {
      case "code":
        return device.code || "";
      case "name":
        return device.name || "";
      case "model":
        return device.model || "";
      case "serial":
        return device.serial || "";
      case "location":
        return device.location || "";
      case "status":
        return device.status || "";
      case "manufacturer":
        return device.manufacturer || "";
      case "yearOfManufacture":
        return device.yearOfManufacture || "";
      case "countryOfOrigin":
        return device.countryOfOrigin || "";
      case "distributor":
        return device.distributor || "";
      case "contactPerson":
        return primaryContact?.fullName || "";
      case "phone":
        return primaryContact?.phone || "";
      case "email":
        return primaryContact?.email || "";
      case "usageStartDate":
        return formatDate(device.usageStartDate) || "";
      case "image":
        return device.imageUrl ? "Có ảnh" : "";
      default:
        return "";
    }
  };

  const newAcceptanceDevices = useMemo(() => devices.filter((device) => device.status === "Đăng ký mới"), [devices]);
  const returnAcceptanceDevices = useMemo(() => devices.filter((device) => device.status === "Tạm điều chuyển"), [devices]);

  const filteredNewAcceptanceDevices = useMemo(() => {
    return newAcceptanceDevices.filter((device) => {
      return acceptanceColumns.every((column) => {
        const value = (acceptanceFilters[column.key] || "").trim().toLowerCase();
        if (!value) return true;
        return getAcceptanceFieldText(device, column.key).toLowerCase().includes(value);
      });
    });
  }, [newAcceptanceDevices, acceptanceColumns, acceptanceFilters]);

  const resolvedNewAcceptanceDevice = useMemo(() => {
    const fromSelected = filteredNewAcceptanceDevices.find((item) => item.id === selectedNewAcceptanceDeviceId);
    if (fromSelected) return fromSelected;
    if (selectedDeviceForAction?.status === "Đăng ký mới") {
      const fromAction = filteredNewAcceptanceDevices.find((item) => item.id === selectedDeviceForAction.id);
      if (fromAction) return fromAction;
    }
    return filteredNewAcceptanceDevices[0] || null;
  }, [filteredNewAcceptanceDevices, selectedNewAcceptanceDeviceId, selectedDeviceForAction]);

  const resolvedReturnAcceptanceDevice = useMemo(() => {
    const fromSelected = returnAcceptanceDevices.find((item) => item.id === selectedReturnAcceptanceDeviceId);
    if (fromSelected) return fromSelected;
    if (selectedDeviceForAction?.status === "Tạm điều chuyển") {
      const fromAction = returnAcceptanceDevices.find((item) => item.id === selectedDeviceForAction.id);
      if (fromAction) return fromAction;
    }
    return returnAcceptanceDevices[0] || null;
  }, [returnAcceptanceDevices, selectedReturnAcceptanceDeviceId, selectedDeviceForAction]);

  const currentNewAcceptanceRecord = resolvedNewAcceptanceDevice
    ? newAcceptanceRecords[resolvedNewAcceptanceDevice.id] || createDefaultNewAcceptanceRecord()
    : createDefaultNewAcceptanceRecord();

  const currentReturnAcceptanceRecord = resolvedReturnAcceptanceDevice
    ? returnAcceptanceRecords[resolvedReturnAcceptanceDevice.id] || createDefaultReturnAcceptanceRecord()
    : createDefaultReturnAcceptanceRecord();

  const getStatusStyle = (status: AcceptanceStatus) => {
    if (status === "done") {
      return {
        card: "border-emerald-300 bg-emerald-50",
        iconWrap: "bg-emerald-100 text-emerald-600",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        label: "Hoàn thành",
      };
    }
    if (status === "pending") {
      return {
        card: "border-amber-300 bg-amber-50",
        iconWrap: "bg-amber-100 text-amber-600",
        text: "text-amber-700",
        dot: "bg-amber-500",
        label: "Chờ phê duyệt",
      };
    }
    return {
      card: "border-red-300 bg-red-50",
      iconWrap: "bg-red-100 text-red-600",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Thiếu file",
    };
  };

  const updateAcceptanceItemStatus = (deviceId: string, key: AcceptanceItemKey, status: AcceptanceStatus) => {
    updateNewAcceptanceRecord(deviceId, (base) => ({
      ...base,
      items: {
        ...base.items,
        [key]: {
          ...base.items[key],
          status,
        },
      },
    }));
  };

  const handleUploadNewAcceptanceFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!resolvedNewAcceptanceDevice || !activeNewAcceptanceUploadKey) return;
    const incomingFiles = event.target.files;
    if (!incomingFiles || incomingFiles.length === 0) return;
    const converted = convertFileListToAttachedFiles(incomingFiles, `new-${resolvedNewAcceptanceDevice.id}-${activeNewAcceptanceUploadKey}`);
    updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => {
      const nextFiles = [...base.items[activeNewAcceptanceUploadKey].files, ...converted];
      const nextStatus: AcceptanceStatus = activeNewAcceptanceUploadKey === "installationSurvey"
        ? base.items[activeNewAcceptanceUploadKey].status
        : "done";
      return {
        ...base,
        items: {
          ...base.items,
          [activeNewAcceptanceUploadKey]: {
            ...base.items[activeNewAcceptanceUploadKey],
            files: nextFiles,
            status: nextStatus,
          },
        },
      };
    });
    event.target.value = "";
    setActiveNewAcceptanceUploadKey(null);
  };

  const removeNewAcceptanceFile = (deviceId: string, key: AcceptanceItemKey, fileId: string) => {
    updateNewAcceptanceRecord(deviceId, (base) => {
      const nextFiles = base.items[key].files.filter((file) => file.id !== fileId);
      let nextStatus = base.items[key].status;
      if (key !== "installationSurvey" && key !== "approvalForm" && key !== "usageConfirmation") {
        nextStatus = nextFiles.length > 0 ? "done" : "missing";
      }
      return {
        ...base,
        items: {
          ...base.items,
          [key]: {
            ...base.items[key],
            files: nextFiles,
            status: nextStatus,
          },
        },
      };
    });
  };

  const openNewAcceptanceAttachments = (title: string, files: AttachedFile[]) => {
    openAttachmentViewer(title, files);
  };

  const handleUploadReturnHandoverFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!resolvedReturnAcceptanceDevice) return;
    const incomingFiles = event.target.files;
    if (!incomingFiles || incomingFiles.length === 0) return;
    const converted = convertFileListToAttachedFiles(incomingFiles, `return-handover-${resolvedReturnAcceptanceDevice.id}`);
    updateReturnAcceptanceRecord(resolvedReturnAcceptanceDevice.id, (base) => ({
      ...base,
      handoverFiles: [...base.handoverFiles, ...converted],
    }));
    event.target.value = "";
  };

  const handleUploadReturnAcceptanceFormFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingReturnForm) return;
    const incomingFiles = event.target.files;
    if (!incomingFiles || incomingFiles.length === 0) return;
    const converted = convertFileListToAttachedFiles(incomingFiles, `return-form-${editingReturnForm.formCode}`);
    setEditingReturnForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: [...prev.attachments, ...converted],
      };
    });
    event.target.value = "";
  };

  const removeReturnHandoverFile = (deviceId: string, fileId: string) => {
    updateReturnAcceptanceRecord(deviceId, (base) => ({
      ...base,
      handoverFiles: base.handoverFiles.filter((file) => file.id !== fileId),
    }));
  };

  const removeReturnAcceptanceFormFile = (fileId: string) => {
    setEditingReturnForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: prev.attachments.filter((file) => file.id !== fileId),
      };
    });
  };

  const isNewAcceptanceReadyToComplete = (record: NewAcceptanceRecord) => {
    return ACCEPTANCE_REQUIRED_KEYS.every((key) => record.items[key].status === "done");
  };

  const isReturnAcceptanceReadyToComplete = (record: ReturnAcceptanceRecord) => {
    const handoverCompleted = Boolean(record.handoverCode.trim()) || record.handoverFiles.length > 0;
    const acceptanceCompleted = Boolean(record.acceptanceForm?.completed);
    return handoverCompleted && acceptanceCompleted;
  };

  const submitSurveyDraft = (deviceId: string) => {
    updateNewAcceptanceRecord(deviceId, (base) => ({
      ...base,
      installationSurveyForm: {
        ...base.installationSurveyForm,
        status: "Nháp",
      },
      items: {
        ...base.items,
        installationSurvey: {
          ...base.items.installationSurvey,
          status: "pending",
        },
      },
    }));
    success("Đã lưu", "Đã lưu bản nháp phiếu khảo sát BM.05.QL.TC.018");
  };

  const submitSurveyForApproval = (deviceId: string) => {
    updateNewAcceptanceRecord(deviceId, (base) => ({
      ...base,
      installationSurveyForm: {
        ...base.installationSurveyForm,
        status: "Chờ duyệt",
      },
      items: {
        ...base.items,
        installationSurvey: {
          ...base.items.installationSurvey,
          status: "pending",
        },
      },
    }));
    success("Đã gửi", "Phiếu khảo sát đã gửi phê duyệt và tạo thông báo cho người phê duyệt");
  };

  const approveSurvey = (deviceId: string) => {
    const approvalTime = new Date().toLocaleString("vi-VN");
    updateNewAcceptanceRecord(deviceId, (base) => ({
      ...base,
      installationSurveyForm: {
        ...base.installationSurveyForm,
        status: "Đã duyệt",
        approvedAt: approvalTime,
      },
      items: {
        ...base.items,
        installationSurvey: {
          ...base.items.installationSurvey,
          status: "done",
        },
      },
    }));
    success("Phê duyệt thành công", `Phiếu khảo sát được duyệt lúc ${approvalTime}`);
  };

  const prepareReturnAcceptanceFormEditor = (device: Device, existing?: ReturnAcceptanceFormState) => {
    const canEdit = !existing || !existing.createdBy || existing.createdBy === (user?.fullName || "");
    if (!canEdit) {
      info("Chế độ xem", "Bạn chỉ có thể xem phiếu do người khác tạo");
    }
    const formData = existing ? { ...existing } : createDefaultReturnAcceptanceForm(device);
    setEditingReturnForm(formData);
    setReturnReceiverSearch(formData.receiver || "");
    setShowReturnFormModal(true);
    setShowReturnReceiverDropdown(false);
  };

  const closeReturnFormModal = () => {
    setShowReturnFormModal(false);
    setEditingReturnForm(null);
    setReturnReceiverSearch("");
    setShowReturnReceiverDropdown(false);
  };

  const filteredReceiverUsers = useMemo(() => {
    if (!returnReceiverSearch.trim()) return MOCK_USERS_LIST;
    return MOCK_USERS_LIST.filter((u) => u.fullName.toLowerCase().includes(returnReceiverSearch.toLowerCase()));
  }, [returnReceiverSearch]);

  const saveReturnAcceptanceForm = (deviceId: string, completeNow: boolean) => {
    if (!editingReturnForm) return;
    if (editingReturnForm.createdBy && editingReturnForm.createdBy !== (user?.fullName || "")) {
      error("Không có quyền", "Chỉ người tạo phiếu mới có quyền sửa phiếu tiếp nhận");
      return;
    }
    if (!editingReturnForm.receiveCondition.trim() || !editingReturnForm.handoverBy.trim() || !editingReturnForm.receiver.trim()) {
      error("Thiếu thông tin", "Vui lòng nhập tình trạng tiếp nhận, người bàn giao và người tiếp nhận");
      return;
    }

    const completedAt = completeNow ? new Date().toLocaleString("vi-VN") : editingReturnForm.completedAt;
    const payload: ReturnAcceptanceFormState = {
      ...editingReturnForm,
      completed: completeNow,
      completedAt,
      createdBy: editingReturnForm.createdBy || user?.fullName || "",
    };

    updateReturnAcceptanceRecord(deviceId, (base) => ({
      ...base,
      acceptanceForm: payload,
    }));

    closeReturnFormModal();
    success("Đã lưu", completeNow ? "Đã hoàn tất phiếu tiếp nhận và chèn chữ ký người tiếp nhận" : "Đã lưu phiếu tiếp nhận");
  };

  const exportAcceptanceTable = () => {
    const visibleColumns = acceptanceColumns.filter((column) => column.visible);
    const headers = visibleColumns.map((column) => column.label);
    const rows = filteredNewAcceptanceDevices.map((device) => visibleColumns.map((column) => getAcceptanceFieldText(device, column.key)));
    downloadCsvFile(
      `Danh_sach_tiep_nhan_moi_${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows,
      "Đã xuất danh sách thiết bị tiếp nhận mới theo cột đang hiển thị"
    );
  };

  const moveAcceptanceColumn = (index: number, direction: "up" | "down") => {
    setAcceptanceColumns((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const cloned = [...prev];
      const current = cloned[index];
      cloned[index] = cloned[target];
      cloned[target] = current;
      return cloned;
    });
  };

  const returnTransportRows = useMemo(() => {
    return Object.entries(returnAcceptanceRecords)
      .map(([deviceId, record]) => {
        const device = devices.find((item) => item.id === deviceId);
        if (!device || !record.acceptanceForm?.completed) return null;
        return {
          id: `${deviceId}-${record.acceptanceForm.formCode}`,
          transferCode: `VC-${record.acceptanceForm.formCode.replace("PTN", "BM07")}`,
          handoverCode: record.handoverCode || "—",
          acceptanceCode: record.acceptanceForm.formCode,
          deviceCode: device.code,
          deviceName: device.name,
          model: device.model,
          serial: device.serial,
          location: device.location,
          handoverBy: record.acceptanceForm.handoverBy,
          receiver: record.acceptanceForm.receiver,
          receivedAt: record.acceptanceForm.receivedAt,
          receiveCondition: record.acceptanceForm.receiveCondition,
        };
      })
      .filter(Boolean) as {
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
    }[];
  }, [returnAcceptanceRecords, devices]);

  const filteredReturnTransportRows = useMemo(() => {
    const fromDate = returnTransportFilterFrom ? new Date(returnTransportFilterFrom).getTime() : null;
    const toDate = returnTransportFilterTo ? new Date(returnTransportFilterTo).getTime() : null;

    return returnTransportRows.filter((row) => {
      if (!row.receivedAt) return false;
      const rowTime = new Date(row.receivedAt).getTime();
      if (fromDate && rowTime < fromDate) return false;
      if (toDate && rowTime > toDate + 24 * 60 * 60 * 1000 - 1) return false;
      return true;
    });
  }, [returnTransportRows, returnTransportFilterFrom, returnTransportFilterTo]);

  const downloadPlainDocument = (filename: string, content: string, successMessage: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    success("Tải thành công", successMessage);
  };

  const downloadReturnAcceptancePdf = (form: ReturnAcceptanceFormState, device: Device) => {
    const content = [
      "PHIẾU TIẾP NHẬN THIẾT BỊ TRỞ LẠI",
      `Mã phiếu: ${form.formCode}`,
      "---",
      `Thiết bị: ${device.name}`,
      `Mã thiết bị: ${device.code}`,
      `Model: ${device.model || ""}`,
      `Serial: ${device.serial || ""}`,
      `Vị trí: ${device.location || ""}`,
      "---",
      `Người bàn giao: ${form.handoverBy}`,
      `Người tiếp nhận: ${form.receiver}`,
      `Thời gian tiếp nhận: ${form.receivedAt}`,
      `Tình trạng: ${form.receiveCondition}`,
      `Ghi chú: ${form.note}`,
      `Trạng thái: ${form.completed ? "Đã hoàn tất" : "Nháp"}`,
      form.completedAt ? `Hoàn tất lúc: ${form.completedAt}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    downloadPlainDocument(`${form.formCode}.pdf`, content, `Đã tải phiếu ${form.formCode}`);
  };

  const exportReturnTransportRows = () => {
    const headers = ["Mã VC", "Mã bàn giao", "Mã tiếp nhận", "Mã TB", "Tên TB", "Người bàn giao", "Người tiếp nhận", "Thời gian tiếp nhận", "Tình trạng"];
    const rows = filteredReturnTransportRows.map((row) => [row.transferCode, row.handoverCode, row.acceptanceCode, row.deviceCode, row.deviceName, row.handoverBy, row.receiver, row.receivedAt, row.receiveCondition]);
    downloadCsvFile(`Danh_sach_BM07_${new Date().toISOString().split("T")[0]}.csv`, headers, rows, "Đã xuất danh sách phiếu vận chuyển BM.07");
  };

  const downloadApprovalForm = (device: Device, approvalCode: string) => {
    const content = [
      "PHIẾU PHÊ DUYỆT",
      `Mã phiếu: ${approvalCode}`,
      `Thiết bị: ${device.name}`,
      `Mã thiết bị: ${device.code}`,
      `Model: ${device.model}`,
      `Serial: ${device.serial}`,
    ].join("\n");
    downloadPlainDocument(`Phieu_phe_duyet_${approvalCode}.txt`, content, "Đã tải phiếu phê duyệt");
  };

  const downloadReturnAcceptanceForm = (device: Device, form: ReturnAcceptanceFormState) => {
    const content = [
      "PHIẾU TIẾP NHẬN THIẾT BỊ TRỞ LẠI",
      `Tên phiếu: ${form.formName}`,
      `Mã phiếu: ${form.formCode}`,
      `Thiết bị: ${device.name}`,
      `Mã thiết bị: ${device.code}`,
      `Model: ${device.model}`,
      `Serial: ${device.serial}`,
      `Vị trí: ${device.location}`,
      `Tình trạng tiếp nhận: ${form.receiveCondition}`,
      `Người bàn giao: ${form.handoverBy}`,
      `Người tiếp nhận: ${form.receiver}`,
      `Thời gian tiếp nhận: ${form.receivedAt}`,
      `Ghi chú: ${form.note}`,
      form.completedAt ? `Ký hoàn tất lúc: ${form.completedAt}` : "",
    ].filter(Boolean).join("\n");

    downloadPlainDocument(`Phieu_tiep_nhan_${form.formCode}.txt`, content, "Đã tải phiếu tiếp nhận");
  };
  
  // Handle action button clicks
  const handleActionClick = (device: Device, action: string) => {
    setSelectedDeviceForAction(device);
    switch (action) {
      case "accept":
        setAcceptanceMainTab(device.status === "Tạm điều chuyển" ? "return" : "new");
        setReturnAcceptanceTab("checklist");
        setSelectedNewAcceptanceDeviceId(device.status === "Đăng ký mới" ? device.id : null);
        setSelectedReturnAcceptanceDeviceId(device.status === "Tạm điều chuyển" ? device.id : null);
        setEditingReturnForm(null);
        setActiveModal("accept");
        break;
      case "info":
        // Open info submenu dropdown
        setShowInfoDropdown(showInfoDropdown === device.id ? null : device.id);
        break;
      case "info-history":
        setSelectedDevice(device);
        setInfoSubmenu("history");
        setShowInfoDropdown(null);
        break;
      case "info-change-manager":
        setSelectedDevice(device);
        setInfoSubmenu("change-manager");
        setShowInfoDropdown(null);
        break;
      case "info-change-contact":
        setSelectedDevice(device);
        setInfoSubmenu("change-contact");
        setShowInfoDropdown(null);
        break;
      case "info-management":
        // Open unified management modal with 4 tabs
        setSelectedDevice(device);
        setShowManagementModal(true);
        setShowInfoDropdown(null);
        break;
      case "incident":
        setActiveModal("incident");
        break;
      case "calibration":
        setActiveModal("calibration");
        break;
      case "maintenance":
        setActiveModal("maintenance");
        break;
      case "transfer":
        setTransferViewMode("list");
        setActiveModal("transfer");
        break;
      case "dispose":
        setLiquidationViewMode("list");
        setActiveModal("dispose");
        break;
      case "training":
        setTrainingViewMode("list");
        setActiveModal("training");
        break;
      default:
        break;
    }
  };

  // Status change functions
  const updateDeviceStatus = (deviceId: string, newStatus: DeviceStatus) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, status: newStatus } : d
    ));
    updateDevice(deviceId, { status: newStatus }).catch(console.error);
    success('Cập nhật trạng thái', `Thiết bị đã chuyển sang trạng thái ${newStatus}`);
  };

  // Complete acceptance - change status from "Đăng ký mới" to "Chờ vận hành"
  const completeAcceptance = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Chờ vận hành");
    setEditingReturnForm(null);
    setActiveModal(null);
  };

  // Complete return acceptance - change status from "Tạm điều chuyển" to "Đang vận hành"
  const completeReturnAcceptance = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    updateDeviceStatus(deviceId, "Đang vận hành");
    addHistory({
      userId: user?.id ?? "",
      userName: user?.fullName ?? "",
      action: "Tiếp nhận thiết bị",
      targetId: deviceId,
      targetType: "Thiết bị",
      details: `Tiếp nhận thiết bị ${device?.code ?? deviceId} - ${device?.name ?? ""} từ điều chuyển`,
    });
    setEditingReturnForm(null);
    setActiveModal(null);
  };

  // Handle incident report with pause
  const handleIncidentPause = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Tạm dừng");
  };

  // Handle transfer proposal approval
  const handleTransferApproval = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    updateDeviceStatus(deviceId, "Tạm điều chuyển");
    addHistory({
      userId: user?.id ?? "",
      userName: user?.fullName ?? "",
      action: "Phê duyệt điều chuyển",
      targetId: deviceId,
      targetType: "Điều chuyển",
      details: `Phê duyệt điều chuyển thiết bị ${device?.code ?? deviceId} - ${device?.name ?? ""}`,
    });
  };

  // Handle liquidation approval
  const handleLiquidationApproval = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    updateDeviceStatus(deviceId, "Ngừng sử dụng");
    addHistory({
      userId: user?.id ?? "",
      userName: user?.fullName ?? "",
      action: "Phê duyệt thanh lý",
      targetId: deviceId,
      targetType: "Thanh lý",
      details: `Phê duyệt thanh lý thiết bị ${device?.code ?? deviceId} - ${device?.name ?? ""}`,
    });
  };
  
  // Handle change manager
  const handleChangeManager = (deviceId: string) => {
    if (!selectedNewManager || !newManagerStartDate) {
      error("Lỗi", "Vui lòng chọn người quản lý và ngày bắt đầu");
      return;
    }
    
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const prevHistory = device.managerHistory || [];
    const updatedHistory = prevHistory.map(m =>
      m.isCurrent ? { ...m, isCurrent: false, endDate: newManagerStartDate } : m
    );
    updatedHistory.push({
      userId: selectedNewManager.id,
      fullName: selectedNewManager.fullName,
      startDate: newManagerStartDate,
      isCurrent: true,
    });

    setDevices(devices.map(d => d.id === deviceId ? { ...d, managerHistory: updatedHistory } : d));
    updateDevice(deviceId, { managerHistory: updatedHistory }).catch(console.error);
    
    success("Thành công", `Đã thay đổi người quản lý thiết bị`);
    setInfoSubmenu(null);
    setSelectedDevice(null);
    setSelectedNewManager(null);
    setNewManagerSearch("");
    setNewManagerStartDate("");
  };
  
  // Handle change contact info
  const handleChangeContact = (deviceId: string) => {
    if (!editingContact.fullName) {
      error("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }
    
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newContact: DeviceContact = {
      id: `c${uniqueId}`,
      fullName: editingContact.fullName || "",
      phone: editingContact.phone || "",
      email: editingContact.email || "",
      address: editingContact.address,
    };
    
    const updatedContacts = device.contacts?.length
      ? device.contacts.map(c => ({ ...c, ...newContact, id: c.id }))
      : [newContact];

    setDevices(devices.map(d => d.id === deviceId ? { ...d, contacts: updatedContacts } : d));
    updateDevice(deviceId, { contacts: updatedContacts }).catch(console.error);
    
    success("Thành công", "Đã cập nhật thông tin liên hệ");
    setInfoSubmenu(null);
    setSelectedDevice(null);
    setEditingContact({ fullName: "", phone: "", email: "", address: "" });
  };
  
  const handleAddDevice = () => {
    if (!form.code || !form.name || !form.manufacturer) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    // Check for duplicate serial
    if (devices.some((d) => d.serial === form.serial)) {
      error("Lỗi", "Số serial đã tồn tại trong hệ thống");
      return;
    }
    
    const newDeviceId = `${uniqueId}-${deviceCounter}`;
    const newDevice: Device = {
      id: newDeviceId,
      code: form.code!,
      name: form.name!,
      specialty: form.specialty || specialties[0],
      category: form.category || deviceCategories[0],
      deviceType: form.deviceType || deviceTypes[0],
      model: form.model || "",
      serial: form.serial || "",
      location: form.location || deviceLocations[0],
      manufacturer: form.manufacturer!,
      countryOfOrigin: form.countryOfOrigin || "",
      yearOfManufacture: form.yearOfManufacture || "",
      distributor: form.distributor || "",
      managerHistory: [
        {
          userId: user?.id || "1",
          fullName: user?.fullName || "Unknown",
          startDate: new Date().toISOString().split("T")[0],
          isCurrent: true,
        },
      ],
      users: [],
      usageStartDate: form.usageStartDate || "",
      usageTime: form.usageTime || "",
      installationLocation: form.installationLocation || "",
      accessories: form.accessories || [],
      contacts: form.contacts || [],
      status: "Đăng ký mới",
      conditionOnReceive: form.conditionOnReceive || "Máy mới",
      calibrationRequired: form.calibrationRequired || false,
      calibrationFrequency: form.calibrationFrequency,
      maintenanceRequired: form.maintenanceRequired || false,
      maintenanceFrequency: form.maintenanceFrequency,
      inspectionRequired: form.inspectionRequired || false,
      inspectionFrequency: form.inspectionFrequency,
      description: form.description,
      imageUrl: devicePhoto?.url,
    };
    
    setDevices((prev) => [newDevice, ...prev]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...deviceWithoutId } = newDevice;
    addDevice(deviceWithoutId).catch(console.error);
    setShowAddForm(false);
    resetForm();
    setDeviceCounter(deviceCounter + 1);
    success("Thành công", `Thiết bị ${newDevice.code} - ${newDevice.name} đã được đăng ký`);
  };
  
  const resetForm = () => {
    setForm({
      code: generateDeviceCode(devices),
      name: "",
      specialty: specialties[0],
      category: deviceCategories[0],
      deviceType: deviceTypes[0],
      model: "",
      serial: "",
      location: deviceLocations[0],
      manufacturer: "",
      countryOfOrigin: "",
      yearOfManufacture: "",
      distributor: "",
      usageStartDate: "",
      usageTime: "",
      installationLocation: "",
      accessories: [],
      contacts: [],
      status: "Đăng ký mới",
      conditionOnReceive: "Máy mới",
      calibrationRequired: false,
      calibrationFrequency: "",
      maintenanceRequired: false,
      maintenanceFrequency: "",
      inspectionRequired: false,
      inspectionFrequency: "",
    });
    setNewAccessory("");
    setNewAccessoryFile(null);
    setNewContact({ fullName: "", phone: "", email: "" });
    setDevicePhoto(null);
    setCountrySearch("");
    setManagerSearch("");
  };
  
  const handleAddAccessory = () => {
    if (!newAccessory.trim()) return;
    const accessory: DeviceAccessory = {
      id: `acc${uniqueId}`,
      name: newAccessory,
      fileUrl: newAccessoryFile?.url,
      fileName: newAccessoryFile?.name,
    };
    setForm((f) => ({
      ...f,
      accessories: [...(f.accessories || []), accessory],
    }));
    setNewAccessory("");
    setNewAccessoryFile(null);
  };
  
  const handleRemoveAccessory = (id: string) => {
    setForm((f) => ({
      ...f,
      accessories: (f.accessories || []).filter((a) => a.id !== id),
    }));
  };
  
  const handleAddContact = () => {
    if (!newContact.fullName) return;
    const contact: DeviceContact = {
      id: `c${uniqueId}`,
      fullName: newContact.fullName || "",
      phone: newContact.phone || "",
      email: newContact.email || "",
    };
    setForm((f) => ({
      ...f,
      contacts: [...(f.contacts || []), contact],
    }));
    setNewContact({ fullName: "", phone: "", email: "" });
  };
  
  const handleRemoveContact = (id: string) => {
    setForm((f) => ({
      ...f,
      contacts: (f.contacts || []).filter((c) => c.id !== id),
    }));
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDevicePhoto({
          name: file.name,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAccessoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAccessoryFile({
          name: file.name,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);
  
  const canManage = user?.role === "Admin" || user?.role === "Quản lý trang thiết bị" || user?.role === "Trưởng phòng xét nghiệm";
  
  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => String(currentYear - i));
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              <Cpu size={20} className="text-white" />
            </div>
            Hồ Sơ Thiết Bị
          </h1>
          <p className="text-slate-500 text-sm mt-1">{devices.length} thiết bị trong hệ thống</p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Plus size={18} />
            Đăng ký thiết bị
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã thiết bị, Serial, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.keys(statusConfig).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
            title="Dạng thumbnail"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
            title="Dạng bảng"
          >
            <List size={16} />
          </button>
        </div>
      </div>
      
      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDevices.map((device, idx) => {
            const sc = statusConfig[device.status];
            const colorClass = deviceColors[idx % deviceColors.length];
            const primaryContact = device.contacts?.[0];
            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer group relative"
              >
                {/* Card Header */}
                <div className={`h-32 bg-gradient-to-br ${colorClass} relative flex items-center justify-center`}>
                  {device.imageUrl ? (
                    <img src={device.imageUrl} alt={device.name} className="w-full h-full object-cover" />
                  ) : (
                    <Cpu size={48} className="text-white/30" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                      {device.code}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                      {sc.icon}
                      {device.status}
                    </span>
                  </div>
                  
                  {/* Hover overlay with action buttons */}
                  <div 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-wrap p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actionButtons.map((btn) => (
                      <div key={btn.key} className="relative">
                        {btn.key === "info" ? (
                          <button
                            onClick={() => handleActionClick(device, "info-management")}
                            className={`${btn.bg} ${btn.hover} text-white px-3 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all transform hover:scale-105 shadow-lg`}
                            title={btn.label}
                          >
                            <btn.icon size={16} />
                            <span className="whitespace-nowrap">{btn.label}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActionClick(device, btn.key)}
                            className={`${btn.bg} ${btn.hover} text-white px-3 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all transform hover:scale-105 shadow-lg`}
                            title={btn.label}
                          >
                            <btn.icon size={16} />
                            <span className="whitespace-nowrap">{btn.label}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{device.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{device.model} • {device.manufacturer}</p>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{device.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                      {formatDate(device.usageStartDate)}
                    </div>
                  </div>
                </div>
                
                {/* Hover tooltip with full device info */}
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0" style={{ minWidth: '280px' }}>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
                    {device.name}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã thiết bị:</span>
                      <span className="font-medium text-slate-800">{device.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model:</span>
                      <span className="font-medium text-slate-800">{device.model || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số serial:</span>
                      <span className="font-medium text-slate-800">{device.serial || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vị trí:</span>
                      <span className="font-medium text-slate-800">{device.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nhà sản xuất:</span>
                      <span className="font-medium text-slate-800">{device.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Năm sản xuất:</span>
                      <span className="font-medium text-slate-800">{device.yearOfManufacture || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Xuất xứ:</span>
                      <span className="font-medium text-slate-800">{device.countryOfOrigin || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nhà phân phối:</span>
                      <span className="font-medium text-slate-800">{device.distributor || '—'}</span>
                    </div>
                    {primaryContact && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Người liên hệ:</span>
                          <span className="font-medium text-slate-800">{primaryContact.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Số điện thoại:</span>
                          <span className="font-medium text-slate-800">{primaryContact.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="font-medium text-slate-800">{primaryContact.email || '—'}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bắt đầu sử dụng:</span>
                      <span className="font-medium text-slate-800">{formatDate(device.usageStartDate)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className={`font-semibold ${sc.color}`}>{device.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Table Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={15}>15 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={-1}>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} />
                Cấu hình cột
              </button>
              <button
                onClick={() => exportToExcel()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Download size={16} />
                Xuất Excel
              </button>
            </div>
          </div>
          
          {/* Column Configuration Panel */}
          {showColumnConfig && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3">Cấu hình hiển thị cột</h4>
              <div className="flex flex-wrap gap-3">
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={(e) => {
                        setColumns(columns.map(c => 
                          c.key === col.key ? { ...c, visible: e.target.checked } : c
                        ));
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map((col) => (
                      col.visible && (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          style={{ width: col.width }}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {col.key !== "actions" && (
                              <button
                                onClick={() => handleSort(col.key)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                {sortColumn === col.key ? (
                                  sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                ) : (
                                  <ChevronRight size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </th>
                      )
                    ))}
                  </tr>
                  {/* Filter Row */}
                  <tr className="bg-slate-100">
                    {columns.map((col) => (
                      col.visible && col.key !== "actions" && col.key !== "image" && col.key !== "status" && (
                        <th key={`filter-${col.key}`} className="px-2 py-2">
                          <input
                            type="text"
                            placeholder="Lọc..."
                            value={filters[col.key] || ""}
                            onChange={(e) => {
                              setFilters({ ...filters, [col.key]: e.target.value });
                              setCurrentPage(1);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-100"
                          />
                        </th>
                      )
                    ))}
                    {columns.filter(c => c.visible && (c.key === "actions" || c.key === "image" || c.key === "status")).map((col) => (
                      <th key={`filter-${col.key}`} className="px-2 py-2"></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDevices.length > 0 ? (
                    paginatedDevices.map((device) => (
                      <tr 
                        key={device.id} 
                        className="hover:bg-slate-50 cursor-pointer group"
                      >
                        {columns.map((col) => (
                          col.visible && (
                            <td 
                              key={col.key} 
                              className={`px-4 py-3 text-sm text-slate-600 ${col.key !== 'actions' ? 'cursor-pointer' : ''}`}
                              onClick={(e) => {
                                if (col.key !== 'actions') {
                                  setSelectedDevice(device);
                                }
                              }}
                            >
                              {getDeviceFieldValue(device, col.key)}
                            </td>
                          )
                        ))}
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(showActionMenu === device.id ? null : device.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                              title="Thao tác"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {/* Action Dropdown - fully visible */}
                            {showActionMenu === device.id && (
                              <div 
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 min-w-[200px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {actionButtons.map((btn) => (
                                  <div key={btn.key} className="relative">
                                    {btn.key === "info" ? (
                                      <button
                                        onClick={() => {
                                          handleActionClick(device, "info-management");
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm flex items-center justify-between text-purple-600 hover:bg-purple-50"
                                      >
                                        <span className="flex items-center gap-3">
                                          <Settings size={16} className="text-purple-600" />
                                          Thông tin quản lý
                                        </span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          handleActionClick(device, btn.key);
                                          setShowActionMenu(null);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 ${btn.color === 'emerald' ? 'text-emerald-600' : btn.color === 'blue' ? 'text-blue-600' : btn.color === 'red' ? 'text-red-600' : btn.color === 'purple' ? 'text-purple-600' : btn.color === 'orange' ? 'text-orange-600' : btn.color === 'cyan' ? 'text-cyan-600' : 'text-slate-600'}`}
                                      >
                                        <btn.icon size={16} />
                                        {btn.label}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.filter(c => c.visible).length + 1} className="px-4 py-8 text-center text-slate-500">
                        Không có thiết bị nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {viewMode === "list" && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-slate-500">
            Hiển thị {paginatedDevices.length}/{sortedDevices.length} thiết bị
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="rotate-180" size={16} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === page ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Acceptance Modal */}
      {activeModal === "accept" && selectedDeviceForAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-5 rounded-t-2xl text-white flex items-center justify-between" style={{boxShadow: '0 10px 15px -3px rgba(14,165,233,0.3)'}}>
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Microscope size={22} />
                  {selectedDeviceForAction.name}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  Mã thiết bị: {selectedDeviceForAction.code} | Serial: {selectedDeviceForAction.serial} | Hãng SX: {selectedDeviceForAction.manufacturer}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-lg text-center">
                  <div className="text-xs uppercase font-bold tracking-wider">{selectedDeviceForAction.status}</div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Tab Switcher */}
              <div className="flex gap-2.5 border-b-2 border-slate-200 mb-5">
                <button
                  onClick={() => setAcceptanceMainTab("new")}
                  className={`px-5 py-2.5 font-bold text-[15px] border-b-[3px] -mb-[2px] transition-colors flex items-center gap-2 ${acceptanceMainTab === "new" ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-blue-600"}`}
                >
                  <Package size={16} /> Tiếp nhận mới
                </button>
                <button
                  onClick={() => { setAcceptanceMainTab("return"); setReturnAcceptanceTab("checklist"); }}
                  className={`px-5 py-2.5 font-bold text-[15px] border-b-[3px] -mb-[2px] transition-colors flex items-center gap-2 ${acceptanceMainTab === "return" ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-blue-600"}`}
                >
                  <RotateCcw size={16} /> Tiếp nhận trở lại
                </button>
              </div>

              {/* Hidden file inputs */}
              <input ref={newAcceptanceAttachmentInputRef} type="file" multiple className="hidden" onChange={handleUploadNewAcceptanceFiles} />
              <input ref={returnHandoverAttachmentInputRef} type="file" multiple className="hidden" onChange={handleUploadReturnHandoverFiles} />
              <input ref={returnAcceptanceFormAttachmentInputRef} type="file" multiple className="hidden" onChange={handleUploadReturnAcceptanceFormFiles} />

              {/* ===== NEW ACCEPTANCE TAB ===== */}
              {acceptanceMainTab === "new" && (
                <div>
                  {resolvedNewAcceptanceDevice ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-slate-500 text-sm flex items-center gap-2">
                          <AlertCircle size={16} />
                          Chỉ dành cho thiết bị mới đăng ký vào Lab.
                        </div>
                        <button
                          onClick={() => completeAcceptance(resolvedNewAcceptanceDevice.id)}
                          disabled={!isNewAcceptanceReadyToComplete(currentNewAcceptanceRecord)}
                          className="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                          style={{boxShadow: '0 4px 10px rgba(16,185,129,0.3)'}}
                        >
                          <CheckCircle2 size={18} />
                          Hoàn tất tiếp nhận
                        </button>
                      </div>

                      {/* Checklist Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                        {([
                          { key: "approvalForm" as AcceptanceItemKey, label: "1. Phiếu phê duyệt PDX", icon: FileSignature, subDone: "Hoàn thành", subMissing: "Thiếu mã phiếu" },
                          { key: "handoverRecord" as AcceptanceItemKey, label: "2. Biên bản bàn giao", icon: Handshake, subDone: "Đã có tài liệu", subMissing: "Chưa có tài liệu" },
                          { key: "installationSurvey" as AcceptanceItemKey, label: "3. Khảo sát lắp đặt (BM.05)", icon: ClipboardList, subDone: "Đã duyệt", subMissing: "Chưa thực hiện" },
                          { key: "userManual" as AcceptanceItemKey, label: "4. Tài liệu sử dụng (HDSD)", icon: BookOpen, subDone: "Đã có tài liệu", subMissing: "Thiếu file" },
                          { key: "co" as AcceptanceItemKey, label: "5. Chứng nhận xuất xứ (CO)", icon: Award, subDone: "Đã có tài liệu", subMissing: "Thiếu file" },
                          { key: "cq" as AcceptanceItemKey, label: "6. Chứng nhận chất lượng (CQ)", icon: ShieldCheck, subDone: "Đã có tài liệu", subMissing: "Thiếu file" },
                          { key: "contract" as AcceptanceItemKey, label: "7. Hợp đồng", icon: FileText, subDone: "Đã có tài liệu", subMissing: "Thiếu file" },
                          { key: "installationReport" as AcceptanceItemKey, label: "8. Biên bản lắp đặt", icon: Wrench, subDone: "Đã có tài liệu", subMissing: "Thiếu file" },
                          { key: "usageConfirmation" as AcceptanceItemKey, label: "9. Xác nhận giá trị sử dụng", icon: FlaskConical, subDone: "Đã có tài liệu", subMissing: "Không bắt buộc" },
                        ]).map((item) => {
                          const itemState = currentNewAcceptanceRecord.items[item.key];
                          const IconComp = item.icon;
                          const isDone = itemState.status === "done";
                          const isPending = itemState.status === "pending";
                          const iconBg = isDone ? "bg-green-100 text-emerald-500" : isPending ? "bg-amber-100 text-amber-500" : "bg-red-100 text-red-500";
                          const subText = isDone ? item.subDone : isPending ? (item.key === "installationSurvey" ? "Chờ phê duyệt" : item.subMissing) : item.subMissing;

                          return (
                            <div
                              key={item.key}
                              className="flex justify-between items-center p-[18px_20px] rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300"
                              style={{boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${iconBg}`}>
                                  <IconComp size={18} />
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-800 text-sm">{item.label}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">{subText}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {/* approvalForm: input + download or View */}
                                {item.key === "approvalForm" && (
                                  isDone ? (
                                    <button
                                      onClick={() => downloadApprovalForm(resolvedNewAcceptanceDevice, itemState.refCode || currentNewAcceptanceRecord.approvalCode || "PDD-TAM")}
                                      className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                                    >
                                      <Eye size={14} /> View
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={itemState.refCode || ""}
                                        onChange={(event) => {
                                          const value = event.target.value;
                                          updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                                            ...base,
                                            approvalCode: value,
                                            items: {
                                              ...base.items,
                                              approvalForm: {
                                                ...base.items.approvalForm,
                                                refCode: value,
                                                status: value.trim() ? "done" : "missing",
                                              },
                                            },
                                          }));
                                        }}
                                        placeholder="Nhập mã phiếu"
                                        className="w-28 px-2.5 py-2 rounded-lg border border-slate-200 text-xs"
                                      />
                                      <button
                                        onClick={() => downloadApprovalForm(resolvedNewAcceptanceDevice, itemState.refCode || currentNewAcceptanceRecord.approvalCode || "PDD-TAM")}
                                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                                      >
                                        <Download size={14} /> Tải phiếu
                                      </button>
                                    </div>
                                  )
                                )}

                                {/* installationSurvey: "Lập phiếu" button */}
                                {item.key === "installationSurvey" && (
                                  isDone ? (
                                    <button
                                      onClick={() => setShowBm05SurveyModal(true)}
                                      className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                                    >
                                      <Eye size={14} /> View
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setShowBm05SurveyModal(true)}
                                      className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition flex items-center gap-1.5"
                                    >
                                      <Edit size={14} /> Lập phiếu
                                    </button>
                                  )
                                )}

                                {/* All other items: "Up File" button */}
                                {item.key !== "approvalForm" && item.key !== "installationSurvey" && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setActiveNewAcceptanceUploadKey(item.key);
                                        newAcceptanceAttachmentInputRef.current?.click();
                                      }}
                                      className="px-3 py-2 rounded-lg bg-sky-100 text-sky-700 text-sm font-bold hover:bg-sky-600 hover:text-white transition flex items-center gap-1.5"
                                    >
                                      <Upload size={14} /> Up File
                                    </button>
                                    {itemState.files.length > 0 && (
                                      <button
                                        onClick={() => openNewAcceptanceAttachments(`${item.label} - ${resolvedNewAcceptanceDevice.code}`, itemState.files)}
                                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                                      >
                                        <Eye size={14} /> ({itemState.files.length})
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Không có thiết bị trạng thái đăng ký mới để tiếp nhận.</div>
                  )}
                </div>
              )}


              {/* ===== RETURN ACCEPTANCE TAB ===== */}
              {acceptanceMainTab === "return" && (
                <ReturnAcceptanceSection
                  returnAcceptanceTab={returnAcceptanceTab}
                  onChangeTab={setReturnAcceptanceTab}
                  returnAcceptanceDevices={returnAcceptanceDevices}
                  resolvedDevice={resolvedReturnAcceptanceDevice}
                  currentRecord={currentReturnAcceptanceRecord}
                  onSelectDevice={(deviceId) => {
                    setSelectedReturnAcceptanceDeviceId(deviceId);
                    setEditingReturnForm(null);
                  }}
                  onUpdateHandoverCode={(value) => {
                    if (!resolvedReturnAcceptanceDevice) return;
                    updateReturnAcceptanceRecord(resolvedReturnAcceptanceDevice.id, (base) => ({ ...base, handoverCode: value }));
                  }}
                  onUploadHandoverFiles={() => returnHandoverAttachmentInputRef.current?.click()}
                  onOpenForm={prepareReturnAcceptanceFormEditor}
                  onDownloadFormPdf={downloadReturnAcceptancePdf}
                  onOpenAttachments={openAttachmentViewer}
                  onViewAttachment={handleViewAttachment}
                  onDownloadAttachment={handleDownloadAttachment}
                  onRemoveHandoverFile={(fileId) => {
                    if (!resolvedReturnAcceptanceDevice) return;
                    removeReturnHandoverFile(resolvedReturnAcceptanceDevice.id, fileId);
                  }}
                  onCompleteAcceptance={(deviceId) => completeReturnAcceptance(deviceId)}
                  canComplete={isReturnAcceptanceReadyToComplete(currentReturnAcceptanceRecord)}
                  filteredReturnTransportRows={filteredReturnTransportRows}
                  returnTransportFilterFrom={returnTransportFilterFrom}
                  returnTransportFilterTo={returnTransportFilterTo}
                  onChangeFilterFrom={setReturnTransportFilterFrom}
                  onChangeFilterTo={setReturnTransportFilterTo}
                  onExportTransport={exportReturnTransportRows}
                  formatDateTimeLabel={formatDateTimeLabel}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showReturnFormModal && resolvedReturnAcceptanceDevice && editingReturnForm && (
        <ReturnAcceptanceFormModal
          device={resolvedReturnAcceptanceDevice}
          form={editingReturnForm}
          onUpdate={(updater) => setEditingReturnForm((prev) => (prev ? updater(prev) : prev))}
          onClose={closeReturnFormModal}
          onSaveDraft={() => saveReturnAcceptanceForm(resolvedReturnAcceptanceDevice.id, false)}
          onComplete={() => saveReturnAcceptanceForm(resolvedReturnAcceptanceDevice.id, true)}
          onUploadAttachment={() => returnAcceptanceFormAttachmentInputRef.current?.click()}
          onViewAttachment={handleViewAttachment}
          onDownloadAttachment={handleDownloadAttachment}
          onRemoveAttachment={removeReturnAcceptanceFormFile}
          onDownloadPdf={() => downloadReturnAcceptancePdf(editingReturnForm, resolvedReturnAcceptanceDevice)}
          canEdit={!editingReturnForm.createdBy || editingReturnForm.createdBy === (user?.fullName || "")}
        />
      )}

      {/* BM.05 Installation Survey Modal */}
      {showBm05SurveyModal && resolvedNewAcceptanceDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowBm05SurveyModal(false)}>
          <div className="bg-slate-50 rounded-2xl max-w-[850px] w-full max-h-[92vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setShowBm05SurveyModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-200 rounded-lg transition z-10">
              <X size={20} className="text-slate-500" />
            </button>

            {/* Header */}
            <div className="text-center pt-6 pb-4 px-6 border-b-2 border-slate-200">
              <h2 className="text-xl font-extrabold text-blue-600 mb-1">PHIẾU KHẢO SÁT ĐIỀU KIỆN LẮP ĐẶT</h2>
              <div className="text-slate-500 font-bold text-sm">Mã tài liệu: BM.05.QL.TC.018</div>
            </div>

            <div className="p-6 space-y-4">
              {/* Device Info (read-only) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Tên thiết bị:</label>
                    <input type="text" value={resolvedNewAcceptanceDevice.name} readOnly className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 font-bold" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Model:</label>
                    <input type="text" value={resolvedNewAcceptanceDevice.model || "Đang cập nhật"} readOnly className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Hãng sản xuất:</label>
                    <input type="text" value={resolvedNewAcceptanceDevice.manufacturer || ""} readOnly className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Công ty cung ứng:</label>
                    <input type="text" value={resolvedNewAcceptanceDevice.distributor || ""} readOnly className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Ngày khảo sát (*):</label>
                    <input
                      type="date"
                      value={currentNewAcceptanceRecord.installationSurveyForm.surveyDate}
                      onChange={(event) => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                        ...base,
                        installationSurveyForm: { ...base.installationSurveyForm, surveyDate: event.target.value },
                      }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Survey Questions Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h4 className="font-bold text-slate-700 mb-3">I. Nội dung khảo sát</h4>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-left font-bold text-slate-600 border-b border-slate-200">Hạng mục</th>
                        <th className="px-4 py-3 text-center w-24 font-bold text-slate-600 border-b border-slate-200">Đạt</th>
                        <th className="px-4 py-3 text-center w-24 font-bold text-slate-600 border-b border-slate-200">Không</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        { key: "hasPowerSupply" as const, label: "1. Nguồn điện phù hợp" },
                        { key: "hasGrounding" as const, label: "2. Tiếp địa" },
                        { key: "hasBenchSpace" as const, label: "3. Không gian lắp đặt" },
                        { key: "hasTemperatureControl" as const, label: "4. Nhiệt độ phù hợp" },
                        { key: "hasHumidityControl" as const, label: "5. Độ ẩm phù hợp" },
                        { key: "hasNetwork" as const, label: "6. Hệ thống mạng (LIS/HIS)" },
                        { key: "hasWaterLine" as const, label: "7. Hệ thống nước sạch/nước thải" },
                      ]).map((question) => {
                        const value = currentNewAcceptanceRecord.installationSurveyForm[question.key] as boolean | null;
                        return (
                          <tr key={question.key} className="border-b border-slate-200 last:border-b-0">
                            <td className="px-4 py-3 text-slate-700">{question.label}</td>
                            <td className="text-center px-4 py-3">
                              <button
                                onClick={() => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                                  ...base,
                                  installationSurveyForm: { ...base.installationSurveyForm, [question.key]: true },
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${value === true ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600"}`}
                              >
                                Đạt
                              </button>
                            </td>
                            <td className="text-center px-4 py-3">
                              <button
                                onClick={() => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                                  ...base,
                                  installationSurveyForm: { ...base.installationSurveyForm, [question.key]: false },
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${value === false ? "bg-red-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600"}`}
                              >
                                Không
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Attachments */}
                <div className="mt-4">
                  <label className="text-xs text-slate-500 font-bold">Đính kèm biên bản/hình ảnh:</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => {
                        setActiveNewAcceptanceUploadKey("installationSurvey");
                        newAcceptanceAttachmentInputRef.current?.click();
                      }}
                      className="px-3 py-2 rounded-lg bg-sky-100 text-sky-700 text-sm font-bold hover:bg-sky-600 hover:text-white transition flex items-center gap-1.5"
                    >
                      <Upload size={14} /> Thêm file
                    </button>
                    {currentNewAcceptanceRecord.installationSurveyForm.attachments.length > 0 && (
                      <button
                        onClick={() => openNewAcceptanceAttachments(`BM.05 - ${resolvedNewAcceptanceDevice.code}`, currentNewAcceptanceRecord.installationSurveyForm.attachments)}
                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                      >
                        <Eye size={14} /> Xem ({currentNewAcceptanceRecord.installationSurveyForm.attachments.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Conclusion */}
                <div className="mt-4">
                  <label className="text-xs text-slate-500 font-bold">Kết luận:</label>
                  <textarea
                    value={currentNewAcceptanceRecord.installationSurveyForm.conclusion}
                    onChange={(event) => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                      ...base,
                      installationSurveyForm: { ...base.installationSurveyForm, conclusion: event.target.value },
                    }))}
                    placeholder="Nhập kết luận khảo sát..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm h-16 resize-none"
                  />
                </div>
              </div>

              {/* Surveyor & Approver */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h4 className="font-bold text-slate-700 mb-3">II. Phân công & Phê duyệt</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Người khảo sát (*):</label>
                    <input
                      value={currentNewAcceptanceRecord.installationSurveyForm.surveyor}
                      onChange={(event) => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                        ...base,
                        installationSurveyForm: { ...base.installationSurveyForm, surveyor: event.target.value },
                      }))}
                      placeholder="Nhập tên người khảo sát"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold">Người phê duyệt (*):</label>
                    <input
                      value={currentNewAcceptanceRecord.installationSurveyForm.approver}
                      onChange={(event) => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                        ...base,
                        installationSurveyForm: { ...base.installationSurveyForm, approver: event.target.value },
                      }))}
                      placeholder="Nhập người phê duyệt"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                {/* Related Users */}
                <div className="mt-3">
                  <label className="text-xs text-slate-500 font-bold">Người liên quan (Nhận thông báo):</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      value={surveyUserSearch}
                      onChange={(event) => setSurveyUserSearch(event.target.value)}
                      placeholder="Tìm người dùng..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  {surveyUserSearch.trim() && (
                    <div className="mt-1 max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
                      {acceptanceUsers.map((member) => {
                        const selected = currentNewAcceptanceRecord.installationSurveyForm.relatedUsers.includes(member.fullName);
                        return (
                          <button
                            key={member.id}
                            onClick={() => {
                              updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                                ...base,
                                installationSurveyForm: {
                                  ...base.installationSurveyForm,
                                  relatedUsers: selected
                                    ? base.installationSurveyForm.relatedUsers.filter((name) => name !== member.fullName)
                                    : [...base.installationSurveyForm.relatedUsers, member.fullName],
                                },
                              }));
                              setSurveyUserSearch("");
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs ${selected ? "bg-sky-100 text-sky-700 font-bold" : "hover:bg-slate-100 text-slate-600"}`}
                          >
                            {member.fullName} {selected ? "✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Selected User Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2 min-h-[42px] border border-dashed border-slate-300 rounded-lg p-2 bg-white">
                    {currentNewAcceptanceRecord.installationSurveyForm.relatedUsers.length === 0 ? (
                      <span className="text-xs text-slate-400">Chưa chọn người liên quan</span>
                    ) : (
                      currentNewAcceptanceRecord.installationSurveyForm.relatedUsers.map((name) => (
                        <span key={name} className="bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          {name}
                          <button
                            onClick={() => updateNewAcceptanceRecord(resolvedNewAcceptanceDevice.id, (base) => ({
                              ...base,
                              installationSurveyForm: {
                                ...base.installationSurveyForm,
                                relatedUsers: base.installationSurveyForm.relatedUsers.filter((n) => n !== name),
                              },
                            }))}
                            className="text-red-500 hover:scale-110 transition"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Status display */}
                <div className="mt-3 text-xs text-slate-500">
                  Trạng thái: <span className="font-bold">{currentNewAcceptanceRecord.installationSurveyForm.status}</span>
                  {currentNewAcceptanceRecord.installationSurveyForm.approvedAt ? ` • Duyệt lúc ${currentNewAcceptanceRecord.installationSurveyForm.approvedAt}` : ""}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => submitSurveyDraft(resolvedNewAcceptanceDevice.id)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition">
                  <Save size={14} /> Lưu nháp
                </button>
                <button onClick={() => { submitSurveyForApproval(resolvedNewAcceptanceDevice.id); setShowBm05SurveyModal(false); }} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center gap-2 transition" style={{boxShadow: '0 4px 10px rgba(59,130,246,0.3)'}}>
                  <Send size={14} /> Hoàn tất & Gửi phê duyệt
                </button>
                <button onClick={() => { approveSurvey(resolvedNewAcceptanceDevice.id); setShowBm05SurveyModal(false); }} className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 flex items-center gap-2 transition" style={{boxShadow: '0 4px 10px rgba(16,185,129,0.3)'}}>
                  <CheckCircle2 size={14} /> Phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && !infoSubmenu && activeModal !== "accept" && activeModal !== "accept-return" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDevice(null)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Hồ sơ thiết bị</h2>
                <p className="text-sm text-slate-500">{selectedDevice.name} - {selectedDevice.code}</p>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            {/* Sub-tabs */}
            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-1">
                <button
                  onClick={() => setDeviceDetailSubTab("info")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    deviceDetailSubTab === "info"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cpu size={16} />
                    Thông tin thiết bị
                  </div>
                </button>
                <button
                  onClick={() => setDeviceDetailSubTab("incidents")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    deviceDetailSubTab === "incidents"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Báo cáo sự cố
                    {incidents.filter(i => i.deviceId === selectedDevice.id).length > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {incidents.filter(i => i.deviceId === selectedDevice.id).length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setDeviceDetailSubTab("calibration")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    deviceDetailSubTab === "calibration"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings size={16} />
                    Hiệu chuẩn & Bảo dưỡng
                    {schedules.filter(s => s.deviceId === selectedDevice.id).length > 0 && (
                      <span className="bg-teal-100 text-teal-600 text-xs px-2 py-0.5 rounded-full">
                        {schedules.filter(s => s.deviceId === selectedDevice.id).length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {deviceDetailSubTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Image */}
                <div>
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                    {selectedDevice.imageUrl ? (
                      <img src={selectedDevice.imageUrl} alt={selectedDevice.name} className="w-full h-full object-cover" />
                    ) : (
                      <Cpu size={64} className="text-white/30" />
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${statusConfig[selectedDevice.status].bg} ${statusConfig[selectedDevice.status].color}`}>
                        {statusConfig[selectedDevice.status].icon}
                        {selectedDevice.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedDevice.name}</h3>
                    <p className="text-slate-500">{selectedDevice.model}</p>
                  </div>
                </div>
                
                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500">Mã thiết bị</label>
                      <p className="font-medium text-slate-800">{selectedDevice.code}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Số serial</label>
                      <p className="font-medium text-slate-800">{selectedDevice.serial}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Chuyên khoa</label>
                      <p className="font-medium text-slate-800">{selectedDevice.specialty}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Phân loại</label>
                      <p className="font-medium text-slate-800">{selectedDevice.category}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Loại thiết bị</label>
                      <p className="font-medium text-slate-800">{selectedDevice.deviceType}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Nhà sản xuất</label>
                      <p className="font-medium text-slate-800">{selectedDevice.manufacturer}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Xuất xứ</label>
                      <p className="font-medium text-slate-800">{selectedDevice.countryOfOrigin}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Năm sản xuất</label>
                      <p className="font-medium text-slate-800">{selectedDevice.yearOfManufacture}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Vị trí</label>
                      <p className="font-medium text-slate-800">{selectedDevice.location}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Nhà phân phối</label>
                      <p className="font-medium text-slate-800">{selectedDevice.distributor}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Tình trạng khi nhận</label>
                      <p className="font-medium text-slate-800">{selectedDevice.conditionOnReceive}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Thời gian sử dụng</label>
                      <p className="font-medium text-slate-800">{selectedDevice.usageTime || "—"}</p>
                    </div>
                  </div>
                  
                  {/* Manager History */}
                  {selectedDevice.managerHistory && selectedDevice.managerHistory.length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs text-slate-500 block mb-2">Lịch sử người phụ trách</label>
                      <div className="space-y-2">
                        {selectedDevice.managerHistory.map((manager, idx) => (
                          <div key={idx} className={`p-3 rounded-lg ${manager.isCurrent ? "bg-purple-50 border border-purple-200" : "bg-slate-50"}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{manager.fullName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${manager.isCurrent ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600"}`}>
                                {manager.isCurrent ? "Người phụ trách hiện tại" : "Ngừng phụ trách"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Từ: {formatDate(manager.startDate)}
                              {manager.endDate && ` - ${formatDate(manager.endDate)}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Contacts */}
                  {selectedDevice.contacts && selectedDevice.contacts.length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs text-slate-500 block mb-2">Người liên hệ</label>
                      <div className="space-y-2">
                        {selectedDevice.contacts.map((contact, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-800">{contact.fullName}</p>
                            <p className="text-xs text-slate-500">{contact.phone} • {contact.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Maintenance Info */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className={`p-3 rounded-lg ${selectedDevice.calibrationRequired ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Settings size={12} />
                        Hiệu chuẩn
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDevice.calibrationRequired ? selectedDevice.calibrationFrequency || "Có" : "Không"}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedDevice.maintenanceRequired ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Wrench size={12} />
                        Bảo trì
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDevice.maintenanceRequired ? selectedDevice.maintenanceFrequency || "Có" : "Không"}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedDevice.inspectionRequired ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <ClipboardCheck size={12} />
                        Kiểm tra
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDevice.inspectionRequired ? selectedDevice.inspectionFrequency || "Có" : "Không"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}
              
              {/* Incidents Sub-tab */}
              {deviceDetailSubTab === "incidents" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Danh sách báo cáo sự cố</h3>
                    <button
                      onClick={() => {
                        setSelectedDeviceForAction(selectedDevice);
                        setActiveModal("incident");
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <AlertTriangle size={16} />
                      Báo cáo sự cố
                    </button>
                  </div>
                  
                  {incidents.filter(i => i.deviceId === selectedDevice.id).length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <AlertTriangle size={48} className="mx-auto mb-4 text-slate-300" />
                      <p>Chưa có báo cáo sự cố nào cho thiết bị này</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.filter(i => i.deviceId === selectedDevice.id).map((incident) => (
                        <div key={incident.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-red-800">{incident.reportCode}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  incident.status === "Đã duyệt" || incident.status === "Hoàn thành" 
                                    ? "bg-green-100 text-green-700" 
                                    : incident.status === "Chờ duyệt"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {incident.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-1">{incident.description}</p>
                              <p className="text-xs text-slate-500">
                                Phát hiện: {incident.incidentDateTime} bởi {incident.discoveredBy}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-white rounded-lg" title="Xem chi tiết">
                                <Eye size={16} className="text-slate-600" />
                              </button>
                              <button className="p-2 hover:bg-white rounded-lg" title="Tải PDF">
                                <Download size={16} className="text-slate-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Calibration Sub-tab */}
              {deviceDetailSubTab === "calibration" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Lịch sử hiệu chuẩn & bảo dưỡng</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedDeviceForAction(selectedDevice);
                          setActiveModal("calibration");
                        }}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                      >
                        <Settings size={16} />
                        Yêu cầu hiệu chuẩn
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDeviceForAction(selectedDevice);
                          setActiveModal("maintenance");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Wrench size={16} />
                        Yêu cầu bảo dưỡng
                      </button>
                    </div>
                  </div>
                  
                  {schedules.filter(s => s.deviceId === selectedDevice.id).length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Settings size={48} className="mx-auto mb-4 text-slate-300" />
                      <p>Chưa có lịch sử hiệu chuẩn/bảo dưỡng cho thiết bị này</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {schedules.filter(s => s.deviceId === selectedDevice.id).map((schedule) => (
                        <div key={schedule.id} className={`p-4 rounded-xl border ${
                          schedule.type === "Hiệu chuẩn" 
                            ? "bg-teal-50 border-teal-100" 
                            : "bg-blue-50 border-blue-100"
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`font-semibold ${
                                  schedule.type === "Hiệu chuẩn" ? "text-teal-800" : "text-blue-800"
                                }`}>
                                  {schedule.type}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  schedule.status === "Đã hoàn thành" 
                                    ? "bg-green-100 text-green-700" 
                                    : schedule.status === "Quá hạn"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {schedule.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">
                                Ngày: {schedule.scheduledDate} | Người phụ trách: {schedule.assignedTo}
                              </p>
                              {schedule.notes && (
                                <p className="text-xs text-slate-500 mt-1">Ghi chú: {schedule.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-white rounded-lg" title="Xem chi tiết">
                                <Eye size={16} className="text-slate-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Device History Modal - BM.03.QL.TC.018 */}
      {infoSubmenu === "history" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Lý lịch thiết bị</h2>
                <p className="text-sm text-slate-500">BM.03.QL.TC.018</p>
              </div>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 text-lg">{selectedDevice.name}</h3>
                <p className="text-sm text-purple-600">{selectedDevice.code} - {selectedDevice.model} - Serial: {selectedDevice.serial}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">Thong tin co ban</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><label className="text-xs text-slate-500">Ten thiet bi</label><p className="font-medium">{selectedDevice.name}</p></div>
                  <div><label className="text-xs text-slate-500">Ma thiet bi</label><p className="font-medium">{selectedDevice.code}</p></div>
                  <div><label className="text-xs text-slate-500">Model</label><p className="font-medium">{selectedDevice.model || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Serial</label><p className="font-medium">{selectedDevice.serial || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Hang san xuat</label><p className="font-medium">{selectedDevice.manufacturer}</p></div>
                  <div><label className="text-xs text-slate-500">Xuat xu</label><p className="font-medium">{selectedDevice.countryOfOrigin || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Nha cung cap</label><p className="font-medium">{selectedDevice.distributor || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Thoi gian nhan</label><p className="font-medium">{formatDate(selectedDevice.usageStartDate)}</p></div>
                  <div><label className="text-xs text-slate-500">Vi tri lap dat</label><p className="font-medium">{selectedDevice.installationLocation || selectedDevice.location}</p></div>
                  <div><label className="text-xs text-slate-500">Tinh trang khi nhan</label><p className="font-medium">{selectedDevice.conditionOnReceive}</p></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">Nguoi phu trach</h4>
                <div className="space-y-3">
                  {selectedDevice.managerHistory?.map((mgr, idx) => (
                    <div key={idx} className={`p-4 rounded-xl ${mgr.isCurrent ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{mgr.fullName}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${mgr.isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200'}`}>
                          {mgr.isCurrent ? 'Hien tai' : `Ngung tu ${formatDate(mgr.endDate || '')}`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Bat dau: {formatDate(mgr.startDate)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Manager Modal */}
      {infoSubmenu === "change-manager" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Thay đổi người quản lý</h2>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800">{selectedDevice.name}</h3>
                <p className="text-sm text-purple-600">{selectedDevice.code}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Người quản lý hiện tại</label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  {selectedDevice.managerHistory?.find(m => m.isCurrent) ? (
                    <p className="font-medium text-emerald-800">{selectedDevice.managerHistory.find(m => m.isCurrent)?.fullName}</p>
                  ) : (
                    <p className="text-slate-500 italic">Chua co nguoi quan ly</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Người quản lý mới <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={newManagerSearch}
                    onChange={(e) => { setNewManagerSearch(e.target.value); setShowManagerSearchDropdown(true); }}
                    onFocus={() => setShowManagerSearchDropdown(true)}
                    placeholder="Tim kiem nguoi quan ly..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                  />
                  {showManagerSearchDropdown && filteredManagers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {filteredManagers.map((mgr) => (
                        <button
                          key={mgr.id}
                          onClick={() => { setSelectedNewManager(mgr); setNewManagerSearch(mgr.fullName); setShowManagerSearchDropdown(false); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
                        >
                          <User size={16} className="text-slate-400" />
                          {mgr.fullName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedNewManager && <p className="text-sm text-emerald-600 mt-2">Da chon: {selectedNewManager.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu quản lý <span className="text-red-500">*</span></label>
                <input type="date" value={newManagerStartDate} onChange={(e) => setNewManagerStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Hủy</button>
                <button onClick={() => handleChangeManager(selectedDevice.id)} disabled={!selectedNewManager || !newManagerStartDate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Label Modal with QR Code */}
      {infoSubmenu === "print-label" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">In nhan thiet bi</h2>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showQRCode} onChange={(e) => setShowQRCode(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-700">Hien QR Code</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showLabelInfo} onChange={(e) => setShowLabelInfo(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-700">Hien thong tin</span>
                </label>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6">
                <div className="flex gap-6 items-center justify-center">
                  {showLabelInfo && (
                    <div className="text-left space-y-2">
                      <p className="text-xs text-slate-500">Cong ty TNHH LABHOUSE VIET NAM</p>
                      <p className="font-bold text-slate-800">{selectedDevice.name}</p>
                      <p className="text-sm text-slate-600">Ma: {selectedDevice.code}</p>
                      <p className="text-sm text-slate-600">Ngay SD: {formatDate(selectedDevice.usageStartDate)}</p>
                      <p className="text-sm text-slate-600">Nguoi phu trach: {selectedDevice.managerHistory?.find(m => m.isCurrent)?.fullName || '-'}</p>
                    </div>
                  )}
                  {showQRCode && (
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300">
                        <QrCode size={48} className="text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">QR Code</p>
                    </div>
                  )}
                </div>
              </div>
              
              {showQRCode && (
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-700">Thong tin trong QR:</p>
                  <p>Cong ty TNHH LABHOUSE VIET NAM</p>
                  <p>Ten: {selectedDevice.name}</p>
                  <p>Ma: {selectedDevice.code}</p>
                  <p>Ngay: {formatDate(selectedDevice.usageStartDate)}</p>
                  <p>Nguoi phu trach: {selectedDevice.managerHistory?.find(m => m.isCurrent)?.fullName || '-'}</p>
                  <p>Dien thoai: {selectedDevice.contacts?.[0]?.phone || '-'}</p>
                  <p className="text-xs text-slate-500 mt-2">Quet QR de bao cao su cu</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Đóng</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download size={18} /> Tai PDF
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Printer size={18} /> In nhan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Contact Modal */}
      {infoSubmenu === "change-contact" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Thay đổi thông tin liên hệ</h2>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800">{selectedDevice.name}</h3>
                <p className="text-sm text-purple-600">{selectedDevice.code}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingContact.fullName || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={editingContact.phone || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ email</label>
                <input
                  type="email"
                  value={editingContact.email || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  placeholder="Nhập địa chỉ email"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ liên hệ</label>
                <textarea
                  value={editingContact.address || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                  placeholder="Nhập địa chỉ liên hệ"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Hủy</button>
                <button onClick={() => handleChangeContact(selectedDevice.id)} disabled={!editingContact.fullName} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeviceRegistrationModal
        show={showAddForm}
        onClose={() => setShowAddForm(false)}
        form={form}
        onFormChange={(next) => setForm(next)}
        yearOptions={yearOptions}
        filteredCountries={filteredCountries}
        showCountryDropdown={showCountryDropdown}
        onCountryDropdownToggle={setShowCountryDropdown}
        onCountrySearchChange={setCountrySearch}
        devicePhoto={devicePhoto}
        fileInputRef={fileInputRef}
        onPhotoUpload={handlePhotoUpload}
        newAccessory={newAccessory}
        onNewAccessoryChange={setNewAccessory}
        accessoryFileInputRef={accessoryFileInputRef}
        onAccessoryFileUpload={handleAccessoryFileUpload}
        onAddAccessory={handleAddAccessory}
        onRemoveAccessory={handleRemoveAccessory}
        newContact={newContact}
        onNewContactChange={(next) => setNewContact(next)}
        onAddContact={handleAddContact}
        onRemoveContact={handleRemoveContact}
        onSubmit={handleAddDevice}
      />

      {selectedDeviceForAction && (
        <IncidentReportModal
          show={activeModal === "incident"}
          device={selectedDeviceForAction}
          user={user}
          onClose={() => setActiveModal(null)}
          formatDateTimeLabel={formatDateTimeLabel}
          downloadCsvFile={downloadCsvFile}
          openPrintableWindow={openPrintableWindow}
          openAttachmentViewer={openAttachmentViewer}
          onViewAttachment={handleViewAttachment}
          onDownloadAttachment={handleDownloadAttachment}
          onUpdateDeviceStatus={updateDeviceStatus}
        />
      )}

      {selectedDeviceForAction && (
        <TransferModal
          show={activeModal === "transfer"}
          device={selectedDeviceForAction}
          user={user}
          viewMode={transferViewMode}
          filterStatus={transferFilterStatus}
          transferForm={transferForm}
          transferRecords={transferRecords}
          transferCounter={transferCounter}
          editingId={editingTransferId}
          onClose={() => setActiveModal(null)}
          onViewModeChange={setTransferViewMode}
          onFilterChange={setTransferFilterStatus}
          onFormChange={setTransferForm}
          onEditingChange={setEditingTransferId}
          onSelectRecord={setSelectedTransfer}
          onApproveRecord={(record) => {
            setTransferRecords(transferRecords.map((item) => (item.id === record.id ? { ...item, status: "Đã duyệt", updatedAt: new Date().toISOString() } : item)));
            handleTransferApproval(record.deviceId);
          }}
          onSaveTransfer={(status) => saveTransferProposal(status)}
          getWorkflowStatusClass={getWorkflowStatusClass}
          openPrintableWindow={openPrintableWindow}
          downloadCsvFile={downloadCsvFile}
        />
      )}

      {selectedDeviceForAction && (
        <LiquidationModal
          show={activeModal === "dispose"}
          device={selectedDeviceForAction}
          user={user}
          viewMode={liquidationViewMode}
          filterStatus={liquidationFilterStatus}
          liquidationForm={liquidationForm}
          liquidationRecords={liquidationRecords}
          liquidationCounter={liquidationCounter}
          editingId={editingLiquidationId}
          onClose={() => setActiveModal(null)}
          onViewModeChange={setLiquidationViewMode}
          onFilterChange={setLiquidationFilterStatus}
          onFormChange={setLiquidationForm}
          onEditingChange={setEditingLiquidationId}
          onSelectRecord={setSelectedLiquidation}
          onApproveRecord={(record) => {
            setLiquidationRecords(liquidationRecords.map((item) => (item.id === record.id ? { ...item, status: "Đã duyệt", updatedAt: new Date().toISOString() } : item)));
            handleLiquidationApproval(record.deviceId);
          }}
          onSave={(status) => saveLiquidationProposal(status)}
          getWorkflowStatusClass={getWorkflowStatusClass}
          openPrintableWindow={openPrintableWindow}
          downloadCsvFile={downloadCsvFile}
        />
      )}

      {selectedDeviceForAction && (
        <TrainingModal
          show={activeModal === "training"}
          device={selectedDeviceForAction}
          users={mockUserProfiles}
          trainingPlans={trainingPlans}
          trainingDocuments={trainingDocuments}
          trainingResults={trainingResults}
          planCounter={planCounter}
          editingPlanId={editingTrainingId}
          onClose={() => setActiveModal(null)}
          onPlansChange={setTrainingPlans}
          onDocumentsChange={setTrainingDocuments}
          onResultsChange={setTrainingResults}
          onPlanCounterChange={setPlanCounter}
          onEditingPlanChange={setEditingTrainingId}
          onDeviceUpdate={(deviceId, updates) => {
            setDevices(devices.map(d => d.id === deviceId ? { ...d, ...updates } : d));
          }}
          showToast={(type, title, message) => success(title, message)}
          onNotification={(type, title, message) => {
            // Handle notification - could add to a notifications array
            console.log(`Notification: ${type} - ${title}: ${message}`);
          }}
          currentUser={user}
          addHistory={addHistory}
        />
      )}

      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={() => setSelectedTransfer(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-2" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">Chi tiết phiếu điều chuyển</h3>
            <p className="text-sm text-slate-500">{selectedTransfer.transferCode}</p>
            <p className="text-sm">Thiết bị: {selectedTransfer.deviceCode} - {selectedTransfer.deviceName}</p>
            <p className="text-sm">Từ: {selectedTransfer.fromLocation}</p>
            <p className="text-sm">Đến: {selectedTransfer.toLocation}</p>
            <p className="text-sm">Lý do: {selectedTransfer.reason}</p>
            <p className="text-sm">Trạng thái: {selectedTransfer.status}</p>
          </div>
        </div>
      )}

      {selectedLiquidation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={() => setSelectedLiquidation(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-2" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">Chi tiết phiếu thanh lý</h3>
            <p className="text-sm text-slate-500">{selectedLiquidation.liquidationCode}</p>
            <p className="text-sm">Thiết bị: {selectedLiquidation.deviceCode} - {selectedLiquidation.deviceName}</p>
            <p className="text-sm">Lý do: {selectedLiquidation.reason}</p>
            <p className="text-sm">Phương thức: {selectedLiquidation.method}</p>
            <p className="text-sm">Giá trị ước tính: {selectedLiquidation.estimatedValue}</p>
            <p className="text-sm">Trạng thái: {selectedLiquidation.status}</p>
          </div>
        </div>
      )}

      {showAttachmentViewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4" onClick={() => setShowAttachmentViewer(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{attachmentViewerTitle || "Danh sách tệp đính kèm"}</h3>
                <p className="text-sm text-slate-500">Tổng số: {attachmentViewerFiles.length} tệp</p>
              </div>
              <button onClick={() => setShowAttachmentViewer(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {attachmentViewerFiles.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Chưa có tài liệu đính kèm</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {attachmentViewerFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.type.toUpperCase()} • {Math.max(1, Math.round(file.size / 1024))} KB</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleViewAttachment(file)}
                          className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(file)}
                          className="px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                        >
                          Tải xuống
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CalibrationModal
        show={activeModal === "calibration"}
        device={selectedDeviceForAction}
        onClose={() => setActiveModal(null)}
      />

      <MaintenanceModal
        show={activeModal === "maintenance"}
        device={selectedDeviceForAction}
        onClose={() => setActiveModal(null)}
      />

      <DeviceManagementModal
        device={selectedDevice || null}
        isOpen={showManagementModal}
        onClose={() => { setShowManagementModal(false); setSelectedDevice(null); }}
        currentUser={user as unknown as UserProfile | null}
        allUsers={mockUserProfiles}
        onUpdateDevice={(deviceId, updates) => {
          updateDevice(deviceId, updates).catch(console.error);
          setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, ...updates } : d));
        }}
      />
    </div>
  );
}


