"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import WheelDateTimePicker from "@/components/WheelDateTimePicker";
import {
  AlertTriangle,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Paperclip,
  FileText,
  X,
  Save,
  Send,
  Contact,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  Users,
  Briefcase,
  Printer,
  Trash2,
  Check,
  Square,
  User,
  PhoneCall,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
} from "lucide-react";
import {
  IncidentReport,
  WorkOrder,
  Device,
  MOCK_USERS_LIST,
  AttachedFile,
} from "@/lib/mockData";
import { SmartTable, Column } from "@/components/SmartTable";
import { previewTicketCode } from "@/lib/ticket-code";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

// Generate incident report code: [device]-PSC-year-seq
function generateIncidentCode(deviceCode: string, existingCodes: string[]): string {
  return previewTicketCode(deviceCode || "NO-CODE", "PSC", existingCodes);
}

// Generate work order code: [incident]-WO-XXX
function generateWorkOrderCode(incidentCode: string, counter: number): string {
  return `${incidentCode}-WO-${String(counter).padStart(3, "0")}`;
}

const contactMethods = [
  { value: "zalo", label: "Zalo", icon: MessageSquare },
  { value: "điện thoại", label: "Điện thoại", icon: PhoneCall },
  { value: "email", label: "Email", icon: Mail },
  { value: "tin nhắn", label: "Tin nhắn", icon: Phone },
  { value: "trao đổi trực tiếp", label: "Trao đổi trực tiếp", icon: Users },
];

// Staff list for lab employees
const LAB_STAFF = MOCK_USERS_LIST.filter(u => 
  ["Kỹ thuật viên", "Quản lý trang thiết bị", "Trưởng phòng"].includes(u.role)
);

export default function IncidentReportTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const workOrderAttachmentInputRef = useRef<HTMLInputElement>(null);

  // State
  const { incidents: contextIncidents, devices: contextDevices, addIncident, updateIncident, addHistory } = useData();
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => { setIncidentReports(contextIncidents); }, [contextIncidents]);
  useEffect(() => { setDevices(contextDevices); }, [contextDevices]);
  const [showForm, setShowForm] = useState(false);
  const [showSupplierContact, setShowSupplierContact] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [activeTab, setActiveTab] = useState<"reports" | "work-orders">("reports");
  const [incidentCounter, setIncidentCounter] = useState(2);
  const [workOrderCounters, setWorkOrderCounters] = useState<Record<string, number>>({});

  // Form state
  const [form, setForm] = useState<Partial<IncidentReport>>({
    deviceId: "",
    deviceName: "",
    deviceCode: "",
    specialty: "",
    severity: "medium",
    incidentDateTime: "",
    discoveredBy: "",
    discoveredByRole: "",
    supplier: "",
    description: "",
    immediateAction: "",
    supplierAction: "",
    affectsPatientResult: false,
    affectedPatientSid: "",
    howAffected: "",
    requiresDeviceStop: false,
    stopFrom: "",
    stopTo: "",
    hasProposal: false,
    proposal: "",
    reportedBy: "",
    deviceManager: "",
    relatedUsers: [],
    status: "Nháp",
    workOrders: [],
    conclusion: undefined,
    resolvedBy: undefined,
    resolvedByType: undefined,
    linkedWorkOrderCode: undefined,
  });

  // Work order form state
  const [workOrderForm, setWorkOrderForm] = useState<Partial<WorkOrder>>({
    contactPerson: "",
    contactMethod: "điện thoại",
    startDateTime: "",
    endDateTime: "",
    actionDescription: "",
    notes: "",
    attachments: [],
    status: "Mở",
    isCompleted: false,
  });
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);
  const [attachmentViewerTitle, setAttachmentViewerTitle] = useState("");
  const [attachmentViewerFiles, setAttachmentViewerFiles] = useState<AttachedFile[]>([]);

  const withRequiredIncidentFields = (base: IncidentReport, patch: Partial<IncidentReport>): Partial<IncidentReport> => ({
    deviceId: patch.deviceId ?? base.deviceId,
    deviceCode: patch.deviceCode ?? base.deviceCode,
    deviceName: patch.deviceName ?? base.deviceName,
    description: patch.description ?? base.description,
    immediateAction: patch.immediateAction ?? base.immediateAction,
    incidentDateTime: patch.incidentDateTime ?? base.incidentDateTime,
    specialty: patch.specialty ?? base.specialty,
    supplier: patch.supplier ?? base.supplier,
    discoveredBy: patch.discoveredBy ?? base.discoveredBy,
    discoveredByRole: patch.discoveredByRole ?? base.discoveredByRole,
    reportedBy: patch.reportedBy ?? base.reportedBy,
    deviceManager: patch.deviceManager ?? base.deviceManager,
    affectsPatientResult: patch.affectsPatientResult ?? base.affectsPatientResult,
    requiresDeviceStop: patch.requiresDeviceStop ?? base.requiresDeviceStop,
    stopFrom: patch.stopFrom ?? base.stopFrom,
    stopTo: patch.stopTo ?? base.stopTo,
    hasProposal: patch.hasProposal ?? base.hasProposal,
    proposal: patch.proposal ?? base.proposal,
    relatedUsers: patch.relatedUsers ?? base.relatedUsers,
    severity: patch.severity ?? base.severity,
    status: patch.status ?? base.status,
    workOrders: patch.workOrders ?? base.workOrders,
  });

  // All work orders from all incidents
  const allWorkOrders = useMemo(() => {
    const orders: (WorkOrder & { incidentReportCode: string })[] = [];
    incidentReports.forEach((incident) => {
      incident.workOrders?.forEach((wo) => {
        orders.push({ ...wo, incidentReportCode: incident.reportCode });
      });
    });
    return orders;
  }, [incidentReports]);

  type WorkOrderRow = WorkOrder & { incidentReportCode: string };

  const exportIncidents = (data: IncidentReport[]) => {
    const headers = ["Mã phiếu", "Thiết bị", "Người báo cáo", "Thời gian phát hiện", "Thời gian kết thúc", "Trạng thái"];
    const rows = data.map((incident) => [
      incident.reportCode,
      `${incident.deviceCode || ""} ${incident.deviceName || ""}`.trim(),
      incident.reportedBy || incident.discoveredBy || "",
      incident.incidentDateTime || "",
      incident.completionDateTime || "—",
      incident.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_su_co_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    success("Thành công", "Đã xuất danh sách sự cố");
  };

  const exportWorkOrders = (data: WorkOrderRow[]) => {
    const headers = ["Mã công việc", "Mã báo cáo", "Người thực hiện", "Thời gian bắt đầu", "Thời gian kết thúc", "Trạng thái"];
    const rows = data.map((wo) => [
      wo.workOrderCode,
      wo.incidentReportCode,
      wo.contactPerson,
      wo.startDateTime,
      wo.endDateTime || "—",
      wo.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Cong_viec_su_co_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    success("Thành công", "Đã xuất danh sách công việc NCC");
  };

  const incidentColumns: Column<IncidentReport>[] = [
    {
      key: "reportCode",
      label: "Mã phiếu",
      minWidth: 160,
      filterable: true,
      render: (incident) => (
        <div className="space-y-1">
          <div className="font-semibold text-red-600">{incident.reportCode}</div>
          <div className="text-xs text-slate-500">{incident.deviceCode}</div>
        </div>
      ),
    },
    {
      key: "deviceName",
      label: "Thiết bị",
      minWidth: 200,
      filterable: true,
      render: (incident) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-800">{incident.deviceName}</div>
          <div className="text-xs text-slate-500">{incident.specialty}</div>
        </div>
      ),
    },
    {
      key: "reportedBy",
      label: "Người báo cáo",
      minWidth: 180,
      filterable: true,
      render: (incident) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-800">{incident.reportedBy || incident.discoveredBy}</div>
          <div className="text-xs text-slate-500">{incident.discoveredByRole}</div>
        </div>
      ),
    },
    { key: "incidentDateTime", label: "Thời gian phát hiện", minWidth: 160, filterable: true, dateFilter: true },
    { key: "completionDateTime", label: "Thời gian kết thúc", minWidth: 160, filterable: true, dateFilter: true },
    {
      key: "status",
      label: "Trạng thái",
      minWidth: 140,
      filterable: true,
      render: (incident) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
          {incident.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      minWidth: 220,
      render: (incident) => (
        <div className="flex items-center gap-1">
          {(incident.status === "Đang khắc phục" || incident.status === "Nháp") && (
            <button
              onClick={() => handleOpenSupplierContact(incident)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Liên hệ nhà cung cấp"
            >
              <Contact size={16} />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedIncident(incident);
              setShowSupplierContact(true);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
            title="Xem/Cập nhật công việc NCC"
          >
            <Briefcase size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedIncident(incident);
              setShowEditForm(true);
            }}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Xem chi tiết">
            <Eye size={16} />
          </button>
          <button
            onClick={() => {
              const files = incident.workOrders?.flatMap((wo) => wo.attachments || []) || [];
              openAttachmentViewer(`Đính kèm của ${incident.reportCode}`, files);
            }}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
            title="Đính kèm"
          >
            <Paperclip size={16} />
          </button>
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Xuất PDF">
            <Printer size={16} />
          </button>
          {incident.status === "Nháp" && incident.conclusion === "đã khắc phục" && (
            <button
              onClick={() => handleFinalSubmit(incident)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Gửi báo cáo sự cố"
            >
              <Send size={16} />
            </button>
          )}
          {incident.status === "Chờ duyệt" && (
            <button
              onClick={() => handleApprove(incident)}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
              title="Phê duyệt"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const workOrderColumns: Column<WorkOrderRow>[] = [
    {
      key: "workOrderCode",
      label: "Mã công việc",
      minWidth: 160,
      filterable: true,
      render: (wo) => <span className="font-semibold text-blue-600">{wo.workOrderCode}</span>,
    },
    { key: "incidentReportCode", label: "Mã báo cáo", minWidth: 140, filterable: true },
    {
      key: "contactPerson",
      label: "Người thực hiện",
      minWidth: 160,
      filterable: true,
      render: (wo) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-800">{wo.contactPerson}</div>
          <div className="text-xs text-slate-500">{wo.contactMethod}</div>
        </div>
      ),
    },
    { key: "startDateTime", label: "Thời gian bắt đầu", minWidth: 160, filterable: true, dateFilter: true },
    { key: "endDateTime", label: "Thời gian kết thúc", minWidth: 160, filterable: true, dateFilter: true },
    {
      key: "status",
      label: "Trạng thái",
      minWidth: 140,
      filterable: true,
      render: (wo) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkOrderStatusColor(wo.status)}`}>
          {wo.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      minWidth: 180,
      render: (wo) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Xem chi tiết">
            <Eye size={16} />
          </button>
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Xuất PDF">
            <Printer size={16} />
          </button>
          <button
            onClick={() => openAttachmentViewer(`Đính kèm của ${wo.workOrderCode}`, wo.attachments || [])}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
            title="Đính kèm"
          >
            <Paperclip size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Handle device selection
  const handleDeviceSelect = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();

      const currentUser = MOCK_USERS_LIST.find((u) => u.id === user?.id);

      setForm({
        ...form,
        deviceId: device.id,
        deviceName: device.name,
        deviceCode: device.code,
        specialty: device.specialty,
        supplier: device.distributor,
        incidentDateTime: `${hours}:${minutes} ${day}/${month}/${year}`,
        discoveredBy: currentUser?.fullName || "",
        discoveredByRole: currentUser?.role || "",
        reportedBy: currentUser?.fullName || "",
        deviceManager: device.managerHistory?.find((m) => m.isCurrent)?.fullName || "",
      });
    }
  };

  // Handle create new incident (draft)
  const handleCreateIncident = () => {
    if (!form.deviceId || !form.description || !form.immediateAction) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const currentCodes = incidentReports.map((r) => r.reportCode);
    const newCounter = incidentCounter + 1;
    const newIncident: IncidentReport = {
      id: `i${Date.now()}`,
      reportCode: generateIncidentCode(form.deviceCode || form.deviceId || "", currentCodes),
      deviceId: form.deviceId || "",
      deviceName: form.deviceName || "",
      deviceCode: form.deviceCode || "",
      specialty: form.specialty || "",
      severity: (form.severity as any) || "medium",
      incidentDateTime: form.incidentDateTime || "",
      discoveredBy: form.discoveredBy || "",
      discoveredByRole: form.discoveredByRole || "",
      supplier: form.supplier || "",
      description: form.description || "",
      immediateAction: form.immediateAction || "",
      supplierAction: "",
      affectsPatientResult: form.affectsPatientResult || false,
      affectedPatientSid: form.affectedPatientSid,
      howAffected: form.howAffected,
      requiresDeviceStop: form.requiresDeviceStop || false,
      stopFrom: form.stopFrom,
      stopTo: form.stopTo,
      hasProposal: form.hasProposal || false,
      proposal: form.proposal,
      reportedBy: form.reportedBy || "",
      deviceManager: form.deviceManager || "",
      relatedUsers: form.relatedUsers || [],
      status: "Nháp",
      createdAt: new Date().toISOString(),
      workOrders: [],
    };

    setIncidentReports([newIncident, ...incidentReports]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _incCreateId, ...incidentCreateData } = newIncident;
    addIncident(incidentCreateData).catch(console.error);
    setIncidentCounter(newCounter);
    setWorkOrderCounters({ ...workOrderCounters, [newIncident.reportCode]: 0 });
    
    setForm({
      deviceId: "",
      deviceName: "",
      deviceCode: "",
      specialty: "",
      incidentDateTime: "",
      discoveredBy: "",
      discoveredByRole: "",
      supplier: "",
      description: "",
      immediateAction: "",
      supplierAction: "",
      affectsPatientResult: false,
      affectedPatientSid: "",
      howAffected: "",
      requiresDeviceStop: false,
      stopFrom: "",
      stopTo: "",
      hasProposal: false,
      proposal: "",
      reportedBy: "",
      deviceManager: "",
      relatedUsers: [],
      status: "Nháp",
      workOrders: [],
      conclusion: undefined,
      resolvedBy: undefined,
      resolvedByType: undefined,
      linkedWorkOrderCode: undefined,
    });
    
    success("Thành công", "Đã tạo phiếu báo cáo sự cố");
  };

  // Handle save as draft with "Đang khắc phục" status
  const handleSaveAsInProgress = () => {
    if (!form.deviceId || !form.description || !form.immediateAction) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const currentCodes = incidentReports.map((r) => r.reportCode);
    const newCounter = incidentCounter + 1;
    const newIncident: IncidentReport = {
      id: `i${Date.now()}`,
      reportCode: generateIncidentCode(form.deviceCode || form.deviceId || "", currentCodes),
      deviceId: form.deviceId || "",
      deviceName: form.deviceName || "",
      deviceCode: form.deviceCode || "",
      specialty: form.specialty || "",
      severity: (form.severity as any) || "medium",
      incidentDateTime: form.incidentDateTime || "",
      discoveredBy: form.discoveredBy || "",
      discoveredByRole: form.discoveredByRole || "",
      supplier: form.supplier || "",
      description: form.description || "",
      immediateAction: form.immediateAction || "",
      supplierAction: "",
      affectsPatientResult: form.affectsPatientResult || false,
      affectedPatientSid: form.affectedPatientSid,
      howAffected: form.howAffected,
      requiresDeviceStop: form.requiresDeviceStop || false,
      stopFrom: form.stopFrom,
      stopTo: form.stopTo,
      hasProposal: form.hasProposal || false,
      proposal: form.proposal,
      reportedBy: form.reportedBy || "",
      deviceManager: form.deviceManager || "",
      relatedUsers: form.relatedUsers || [],
      status: "Đang khắc phục",
      conclusion: "chưa khắc phục",
      createdAt: new Date().toISOString(),
      workOrders: [],
    };

    setIncidentReports([newIncident, ...incidentReports]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _incInProgId, ...incidentInProgData } = newIncident;
    addIncident(incidentInProgData).catch(console.error);
    setIncidentCounter(newCounter);
    setWorkOrderCounters({ ...workOrderCounters, [newIncident.reportCode]: 0 });
    setShowForm(false);
    setForm({
      deviceId: "",
      deviceName: "",
      deviceCode: "",
      specialty: "",
      incidentDateTime: "",
      discoveredBy: "",
      discoveredByRole: "",
      supplier: "",
      description: "",
      immediateAction: "",
      supplierAction: "",
      affectsPatientResult: false,
      affectedPatientSid: "",
      howAffected: "",
      requiresDeviceStop: false,
      stopFrom: "",
      stopTo: "",
      hasProposal: false,
      proposal: "",
      reportedBy: "",
      deviceManager: "",
      relatedUsers: [],
      status: "Nháp",
      workOrders: [],
      conclusion: undefined,
      resolvedBy: undefined,
      resolvedByType: undefined,
      linkedWorkOrderCode: undefined,
    });
    
    success("Thành công", "Đã lưu phiếu báo cáo sự cố với trạng thái Đang khắc phục");
  };

  // Handle final submission (complete incident)
  const handleFinalSubmit = (incident: IncidentReport) => {
    // Validate required fields
    if (!incident.reportedBy || !incident.deviceManager) {
      error("Lỗi", "Vui lòng chọn người báo cáo và quản lý trang thiết bị");
      return;
    }

    if (incident.affectsPatientResult && (!incident.affectedPatientSid || !incident.howAffected)) {
      error("Lỗi", "Vui lòng nhập SID bệnh nhân và mô tả ảnh hưởng");
      return;
    }

    if (incident.requiresDeviceStop && (!incident.stopFrom || !incident.stopTo)) {
      error("Lỗi", "Vui lòng nhập thời gian dừng hoạt động");
      return;
    }

    const finalSubmitUpdates = { status: "Chờ duyệt" as const, updatedAt: new Date().toISOString() };
    setIncidentReports(
      incidentReports.map((i) =>
        i.id === incident.id ? { ...i, ...finalSubmitUpdates } : i
      )
    );
    const payload = withRequiredIncidentFields(incident, finalSubmitUpdates);
    updateIncident(incident.id, payload).catch(console.error);
    
    // Real notification: manager + reporter (if found)
    [incident.deviceManager, incident.reportedBy]
      .filter(Boolean)
      .forEach((recipientName) => {
        const recipient = MOCK_USERS_LIST.find((u) => u.fullName === recipientName);
        if (!recipient) return;
        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "approval_request",
            priority: "high",
            title: "Phiếu sự cố cần duyệt",
            message: `${incident.reportCode} cần phê duyệt`,
            recipientId: recipient.id,
            recipientName: recipient.fullName,
            recipientEmail: recipient.email,
            senderId: user?.id,
            senderName: user?.fullName,
            relatedType: "incident",
            relatedCode: incident.reportCode,
            relatedId: incident.id,
          }),
        }).catch(console.error);
      });
    success("Thành công", "Đã gửi phiếu báo cáo sự cố để phê duyệt");
  };

  // Handle approve
  const handleApprove = (incident: IncidentReport) => {
    const approveUpdates = {
      status: "Hoàn thành" as const,
      approvedBy: user?.fullName || "",
      approvedDate: new Date().toLocaleString("vi-VN"),
      updatedAt: new Date().toISOString(),
    };
    setIncidentReports(
      incidentReports.map((i) => i.id === incident.id ? { ...i, ...approveUpdates } : i)
    );
    const payload = withRequiredIncidentFields(incident, approveUpdates);
    updateIncident(incident.id, payload).catch(console.error);
    
    // Add history log
    addHistory({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: user?.id || "",
      userName: user?.fullName || "",
      userRole: user?.role || "",
      action: "Phê duyệt",
      description: `Phê duyệt phiếu báo cáo sự cố ${incident.reportCode}`,
      targetType: "Sự cố",
      targetId: incident.id,
      targetName: incident.reportCode,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    
    success("Thành công", "Đã phê duyệt phiếu báo cáo sự cố");
  };

  // Handle add work order
  const handleAddWorkOrder = () => {
    if (!selectedIncident || !workOrderForm.contactPerson || !workOrderForm.startDateTime) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const currentWO = workOrderCounters[selectedIncident.reportCode] || 0;
    const newCounter = currentWO + 1;
    
    const newWorkOrder: WorkOrder = {
      id: `wo${Date.now()}`,
      workOrderCode: generateWorkOrderCode(selectedIncident.reportCode, newCounter),
      incidentReportCode: selectedIncident.reportCode,
      contactPerson: workOrderForm.contactPerson || "",
      contactMethod: workOrderForm.contactMethod as any || "điện thoại",
      startDateTime: workOrderForm.startDateTime || "",
      endDateTime: workOrderForm.endDateTime,
      actionDescription: workOrderForm.actionDescription || "",
      notes: workOrderForm.notes || "",
      attachments: workOrderForm.attachments || [],
      status: "Mở",
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updatedWorkOrders = [...(selectedIncident.workOrders || []), newWorkOrder];
    setIncidentReports(
      incidentReports.map((i) =>
        i.id === selectedIncident.id
          ? { ...i, workOrders: updatedWorkOrders }
          : i
      )
    );
    const payload = withRequiredIncidentFields(selectedIncident, { workOrders: updatedWorkOrders });
    updateIncident(selectedIncident.id, payload).catch(console.error);

    setWorkOrderCounters({ ...workOrderCounters, [selectedIncident.reportCode]: newCounter });
    setWorkOrderForm({
      contactPerson: "",
      contactMethod: "điện thoại",
      startDateTime: "",
      endDateTime: "",
      actionDescription: "",
      notes: "",
      attachments: [],
      status: "Mở",
      isCompleted: false,
    });
    success("Thành công", "Đã thêm công việc mới");
  };

  // Handle engineer signature on work order
  const handleEngineerSign = (workOrderId: string) => {
    if (!selectedIncident || !workOrderForm.engineerName || !workOrderForm.conclusion) {
      error("Lỗi", "Vui lòng nhập tên người sửa chữa và kết luận");
      return;
    }

    const updatedWorkOrders = selectedIncident.workOrders?.map((wo) => {
      if (wo.id === workOrderId) {
        return {
          ...wo,
          engineerName: workOrderForm.engineerName,
          conclusion: workOrderForm.conclusion as "hoàn thành" | "xử trí 1 phần",
          isCompleted: true,
          status: workOrderForm.conclusion === "hoàn thành" ? "Đóng" as const : "Mở" as const,
          endDateTime: workOrderForm.endDateTime || wo.startDateTime,
        };
      }
      return wo;
    });

    setIncidentReports(
      incidentReports.map((i) =>
        i.id === selectedIncident.id
          ? { ...i, workOrders: updatedWorkOrders || [] }
          : i
      )
    );
    const payload = withRequiredIncidentFields(selectedIncident, { workOrders: updatedWorkOrders || [] });
    updateIncident(selectedIncident.id, payload).catch(console.error);

    // Update selected incident to reflect changes
    const updated = incidentReports.find(i => i.id === selectedIncident.id);
    if (updated) {
      setSelectedIncident({ ...updated, workOrders: updatedWorkOrders || [] });
    }

    setWorkOrderForm({
      ...workOrderForm,
      engineerName: "",
      conclusion: undefined,
    });
    success("Thành công", "Đã lưu xác nhận của kỹ sư");
  };

  // Handle complete repair (hoàn thành sửa chữa)
  const handleCompleteRepair = (incident: IncidentReport) => {
    // Generate supplier action summary from work orders
    const supplierActions = incident.workOrders
      ?.filter(wo => wo.status === "Đóng")
      .map((wo) => {
        return `${wo.startDateTime}${wo.endDateTime ? ` - ${wo.endDateTime}` : ''}, ${wo.engineerName || wo.contactPerson} - ${wo.actionDescription}. ${wo.conclusion === "hoàn thành" ? "Hoàn thành." : "Xử trí 1 phần."}`;
      })
      .join(" ");

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const completeRepairUpdates = {
      supplierAction: supplierActions || "",
      status: "Nháp" as const,
      conclusion: "đã khắc phục" as const,
      completionDateTime: `${hours}:${minutes} ${day}/${month}/${year}`,
      updatedAt: new Date().toISOString(),
    };
    setIncidentReports(
      incidentReports.map((i) => i.id === incident.id ? { ...i, ...completeRepairUpdates } : i)
    );
    const payload = withRequiredIncidentFields(incident, completeRepairUpdates);
    updateIncident(incident.id, payload).catch(console.error);
    
    // Add history log
    addHistory({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: user?.id || "",
      userName: user?.fullName || "",
      userRole: user?.role || "",
      action: "Hoàn thành sửa chữa",
      description: `Hoàn tất sửa chữa cho phiếu báo cáo sự cố ${incident.reportCode}`,
      targetType: "Sự cố",
      targetId: incident.id,
      targetName: incident.reportCode,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    
    setShowSupplierContact(false);
    success("Thành công", "Đã hoàn tất sửa chữa. Vui lòng hoàn tất phiếu báo cáo sự cố.");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nháp":
        return "bg-slate-100 text-slate-700";
      case "Chờ duyệt":
        return "bg-amber-100 text-amber-700";
      case "Đã duyệt":
        return "bg-blue-100 text-blue-700";
      case "Hoàn thành":
        return "bg-emerald-100 text-emerald-700";
      case "Từ chối":
        return "bg-red-100 text-red-700";
      case "Đang khắc phục":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Get work order status color
  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case "Mở":
        return "bg-amber-100 text-amber-700";
      case "Đóng":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Open edit form
  const handleEditIncident = (incident: IncidentReport) => {
    setForm(incident);
    setShowEditForm(true);
  };

  // Open supplier contact for an incident
  const handleOpenSupplierContact = (incident: IncidentReport) => {
    setSelectedIncident(incident);
    setWorkOrderCounters({ ...workOrderCounters, [incident.reportCode]: incident.workOrders?.length || 0 });
    setShowSupplierContact(true);
  };

  // Update form state when editing
  const handleUpdateIncident = () => {
    if (!selectedIncident) return;
    const updateData = withRequiredIncidentFields(selectedIncident, { ...form, updatedAt: new Date().toISOString() });
    setIncidentReports(
      incidentReports.map((i) =>
        i.id === selectedIncident.id ? { ...i, ...updateData } : i
      )
    );
    updateIncident(selectedIncident.id, updateData).catch(console.error);
    
    // Add history log
    addHistory({
      actionCode: `ACT-${String(Date.now()).slice(-6)}`,
      actionNumber: Date.now(),
      userId: user?.id || "",
      userName: user?.fullName || "",
      userRole: user?.role || "",
      action: "Cập nhật",
      description: `Cập nhật phiếu báo cáo sự cố ${selectedIncident.reportCode}`,
      targetType: "Sự cố",
      targetId: selectedIncident.id,
      targetName: selectedIncident.reportCode,
      timestamp: new Date().toISOString(),
    }).catch(console.error);
    
    setShowEditForm(false);
    success("Thành công", "Đã cập nhật phiếu báo cáo sự cố");
  };

  const openAttachmentViewer = (title: string, files: AttachedFile[]) => {
    setAttachmentViewerTitle(title);
    setAttachmentViewerFiles(files);
    setShowAttachmentViewer(true);
  };

  const handleViewAttachment = (file: AttachedFile) => {
    if (!file.url) {
      error("Lỗi", "Không tìm thấy tệp để xem");
      return;
    }
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadAttachment = (file: AttachedFile) => {
    if (!file.url) {
      error("Lỗi", "Tệp đính kèm không hợp lệ");
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

  const handleUploadWorkOrderAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = event.target.files;
    if (!incomingFiles || incomingFiles.length === 0) return;

    const convertedFiles: AttachedFile[] = Array.from(incomingFiles).map((file) => {
      const lowerFileName = file.name.toLowerCase();
      const attachmentType: AttachedFile["type"] = lowerFileName.endsWith(".pdf")
        ? "pdf"
        : file.type.startsWith("image/")
          ? "image"
          : "doc";

      return {
        id: `ir-att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: attachmentType,
        url: URL.createObjectURL(file),
        size: file.size,
      };
    });

    setWorkOrderForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...convertedFiles],
    }));

    event.target.value = "";
    success("Thành công", `Đã thêm ${convertedFiles.length} tệp đính kèm`);
  };

  const handleRemoveWorkOrderAttachment = (attachmentId: string) => {
    const attachment = (workOrderForm.attachments || []).find((item) => item.id === attachmentId);
    if (attachment?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url);
    }

    setWorkOrderForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((item) => item.id !== attachmentId),
    }));
  };

  // Auto-generate supplier action from linked work orders
  const generateSupplierAction = (incident: IncidentReport) => {
    if (!incident.workOrders || incident.workOrders.length === 0) return "";
    
    return incident.workOrders
      .filter(wo => wo.status === "Đóng")
      .map((wo) => {
        return `Từ ${wo.startDateTime}${wo.endDateTime ? ` đến ${wo.endDateTime}` : ''}, Kỹ sư ${wo.engineerName || wo.contactPerson} - ${wo.actionDescription}. Kết luận: ${wo.conclusion === "hoàn thành" ? "Hoàn thành" : "Xử trí 1 phần"}.`;
      })
      .join("\n");
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 w-full max-w-none mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Báo cáo sự cố</h2>
            <p className="text-sm text-slate-500">BM.11.QL.TC.018 - Phiếu báo cáo sự cố thiết bị</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo báo cáo sự cố
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Báo cáo sự cố
        </button>
        <button
          onClick={() => setActiveTab("work-orders")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "work-orders"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4 inline-block mr-2" />
          Theo dõi công việc NCC
        </button>
      </div>

      <div className="w-full max-w-none mx-auto space-y-6">
        {activeTab === "reports" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5 min-h-[900px] w-full overflow-hidden">
            <SmartTable
              data={incidentReports}
              columns={incidentColumns}
              keyField="id"
              pageSizeOptions={[5, 10, 15, 20]}
              defaultPageSize={10}
              settingsKey="incident-reports"
              onExport={exportIncidents}
              showSettings
            />
          </div>
        )}

        {activeTab === "work-orders" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5 min-h-[900px] w-full overflow-hidden">
            <SmartTable
              data={allWorkOrders}
              columns={workOrderColumns}
              keyField="id"
              pageSizeOptions={[5, 10, 15, 20]}
              defaultPageSize={10}
              settingsKey="incident-work-orders"
              onExport={exportWorkOrders}
              showSettings
            />
          </div>
        )}
      </div>

      {/* Create Incident Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Tạo phiếu báo cáo sự cố</h3>
                <p className="text-sm text-slate-500">BM.11.QL.TC.018</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Device Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chọn thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.deviceId}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn thiết bị --</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.code} - {device.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã thiết bị</label>
                  <input
                    type="text"
                    value={form.deviceCode}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên thiết bị</label>
                  <input
                    type="text"
                    value={form.deviceName}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bộ phận xét nghiệm</label>
                  <input
                    type="text"
                    value={form.specialty}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày giờ phát hiện sự cố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.incidentDateTime}
                    onChange={(e) => setForm({ ...form, incidentDateTime: e.target.value })}
                    placeholder="hh:mm dd/mm/yyyy"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung ứng</label>
                  <input
                    type="text"
                    value={form.supplier}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người phát hiện sự cố
                  </label>
                  <input
                    type="text"
                    value={form.discoveredBy}
                    onChange={(e) => setForm({ ...form, discoveredBy: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={form.discoveredByRole}
                    onChange={(e) => setForm({ ...form, discoveredByRole: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={form.severity || "medium"}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentReport["severity"] })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="critical">Nghiêm trọng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả chi tiết sự cố <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="Mô tả chi tiết sự cố..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hành động xử trí tức thời <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.immediateAction}
                  onChange={(e) => setForm({ ...form, immediateAction: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="Hành động xử trí tức thời..."
                />
              </div>

              {/* Conclusion Section */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Kết luận</label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="conclusion"
                      checked={form.conclusion === "đã khắc phục"}
                      onChange={() => setForm({ ...form, conclusion: "đã khắc phục" })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-slate-700">Sự cố đã được khắc phục</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="conclusion"
                      checked={form.conclusion === "chưa khắc phục" || !form.conclusion}
                      onChange={() => setForm({ ...form, conclusion: "chưa khắc phục" })}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm text-slate-700">Sự cố chưa được khắc phục</span>
                  </label>
                </div>

                {/* Resolution Options */}
                {form.conclusion === "đã khắc phục" && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-2">Người khắc phục</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="resolvedByType"
                            checked={form.resolvedByType === "nhân viên lab"}
                            onChange={() => setForm({ ...form, resolvedByType: "nhân viên lab", linkedWorkOrderCode: undefined })}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-slate-700">Nhân viên trong lab</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="resolvedByType"
                            checked={form.resolvedByType === "nhà sản xuất"}
                            onChange={() => setForm({ ...form, resolvedByType: "nhà sản xuất" })}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-slate-700">Nhà sản xuất/NCC</span>
                        </label>
                      </div>
                    </div>

                    {form.resolvedByType === "nhân viên lab" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Chọn người khắc phục (dùng Ctrl/Cmd để chọn nhiều)</label>
                        <div className="flex flex-wrap gap-2">
                          {LAB_STAFF.map(staff => (
                            <button
                              key={staff.id}
                              type="button"
                              onClick={() => {
                                const current = form.resolvedBy || "";
                                const newList = current.includes(staff.fullName)
                                  ? current.replace(staff.fullName, "").trim()
                                  : current ? `${current}, ${staff.fullName}` : staff.fullName;
                                setForm({ ...form, resolvedBy: newList });
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                (form.resolvedBy || "").includes(staff.fullName)
                                  ? "bg-green-500 text-white"
                                  : "bg-white border border-slate-300 text-slate-700 hover:bg-green-50"
                              }`}
                            >
                              {staff.fullName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {form.resolvedByType === "nhà sản xuất" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mã công việc NCC</label>
                        <select
                          value={form.linkedWorkOrderCode || ""}
                          onChange={(e) => setForm({ ...form, linkedWorkOrderCode: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                          <option value="">Chọn mã công việc</option>
                          {incidentReports
                            .filter(i => i.deviceId === form.deviceId && i.workOrders && i.workOrders.length > 0)
                            .flatMap(i => i.workOrders || [])
                            .filter(wo => wo.status === "Đóng")
                            .map(wo => (
                              <option key={wo.id} value={wo.workOrderCode}>{wo.workOrderCode}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Completion DateTime for resolved incidents */}
              {form.conclusion === "đã khắc phục" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian hoàn thành</label>
                  <WheelDateTimePicker
                    mode="datetime"
                    value={form.completionDateTime || ''}
                    onChange={(val) => setForm({ ...form, completionDateTime: val })}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <div className="flex gap-2">
                  {form.conclusion === "chưa khắc phục" && (
                    <button
                      onClick={() => {
                        if (!form.deviceId || !form.description || !form.immediateAction) {
                          error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
                          return;
                        }
                        
                        const currentCodes = incidentReports.map((r) => r.reportCode);
                        const newCounter = incidentCounter + 1;
                        const newIncident: IncidentReport = {
                          id: `i${Date.now()}`,
                          reportCode: generateIncidentCode(form.deviceCode || form.deviceId || "", currentCodes),
                          deviceId: form.deviceId || "",
                          deviceName: form.deviceName || "",
                          deviceCode: form.deviceCode || "",
                          specialty: form.specialty || "",
                          incidentDateTime: form.incidentDateTime || "",
                          discoveredBy: form.discoveredBy || "",
                          discoveredByRole: form.discoveredByRole || "",
                          supplier: form.supplier || "",
                          description: form.description || "",
                          immediateAction: form.immediateAction || "",
                          supplierAction: "",
                          affectsPatientResult: false,
                          affectedPatientSid: "",
                          howAffected: "",
                          requiresDeviceStop: false,
                          stopFrom: "",
                          stopTo: "",
                          hasProposal: false,
                          proposal: "",
                          reportedBy: user?.fullName || "",
                          deviceManager: form.deviceManager || "",
                          relatedUsers: form.relatedUsers || [],
                          status: "Đang khắc phục",
                          conclusion: "chưa khắc phục",
                          createdAt: new Date().toISOString(),
                          workOrders: [],
                        };

                        setIncidentReports([newIncident, ...incidentReports]);
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id: _inProgId, ...inProgData } = newIncident;
                        addIncident(inProgData).catch(console.error);
                        setIncidentCounter(newCounter);
                        setWorkOrderCounters({ ...workOrderCounters, [newIncident.reportCode]: 0 });
                        setForm({
                          deviceId: "", deviceName: "", deviceCode: "", specialty: "",
                          incidentDateTime: "", discoveredBy: "", discoveredByRole: "", supplier: "",
                          description: "", immediateAction: "", supplierAction: "", affectsPatientResult: false,
                          affectedPatientSid: "", howAffected: "", requiresDeviceStop: false,
                          stopFrom: "", stopTo: "", hasProposal: false, proposal: "",
                          reportedBy: "", deviceManager: "", relatedUsers: [], status: "Nháp", workOrders: [],
                        });
                        success("Thành công", "Đã lưu báo cáo sự cố với trạng thái Đang khắc phục");
                        setShowForm(false);
                      }}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                    >
                      <Save size={18} /> Lưu & Đóng
                    </button>
                  )}
                  {form.conclusion === "đã khắc phục" && (
                    <button
                      onClick={() => {
                        if (!form.deviceId || !form.description || !form.immediateAction) {
                          error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
                          return;
                        }

                        const currentCodes = incidentReports.map((r) => r.reportCode);
                        const newCounter = incidentCounter + 1;
                        const newIncident: IncidentReport = {
                          id: `i${Date.now()}`,
                          reportCode: generateIncidentCode(form.deviceCode || form.deviceId || "", currentCodes),
                          deviceId: form.deviceId || "",
                          deviceName: form.deviceName || "",
                          deviceCode: form.deviceCode || "",
                          specialty: form.specialty || "",
                          incidentDateTime: form.incidentDateTime || "",
                          discoveredBy: form.discoveredBy || "",
                          discoveredByRole: form.discoveredByRole || "",
                          supplier: form.supplier || "",
                          description: form.description || "",
                          immediateAction: form.immediateAction || "",
                          supplierAction: form.supplierAction || "",
                          affectsPatientResult: false,
                          affectedPatientSid: "",
                          howAffected: "",
                          requiresDeviceStop: false,
                          stopFrom: "",
                          stopTo: "",
                          hasProposal: false,
                          proposal: "",
                          reportedBy: user?.fullName || "",
                          deviceManager: form.deviceManager || "",
                          relatedUsers: form.relatedUsers || [],
                          status: "Hoàn thành",
                          conclusion: "đã khắc phục",
                          resolvedBy: form.resolvedBy || "",
                          resolvedByType: form.resolvedByType as "nhân viên lab" | "nhà sản xuất" | undefined,
                          linkedWorkOrderCode: form.linkedWorkOrderCode,
                          completionDateTime: form.completionDateTime,
                          createdAt: new Date().toISOString(),
                          workOrders: [],
                        };

                        setIncidentReports([newIncident, ...incidentReports]);
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id: _doneId, ...doneData } = newIncident;
                        addIncident(doneData).catch(console.error);
                        setIncidentCounter(newCounter);
                        setForm({
                          deviceId: "", deviceName: "", deviceCode: "", specialty: "",
                          incidentDateTime: "", discoveredBy: "", discoveredByRole: "", supplier: "",
                          description: "", immediateAction: "", supplierAction: "", affectsPatientResult: false,
                          affectedPatientSid: "", howAffected: "", requiresDeviceStop: false,
                          stopFrom: "", stopTo: "", hasProposal: false, proposal: "",
                          reportedBy: "", deviceManager: "", relatedUsers: [], status: "Nháp", workOrders: [],
                        });
                        success("Thành công", "Đã hoàn thành báo cáo sự cố");
                        setShowForm(false);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Incident Form Modal */}
      {showEditForm && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Chỉnh sửa phiếu báo cáo sự cố</h3>
                <p className="text-sm text-slate-500">{selectedIncident.reportCode}</p>
              </div>
              <button onClick={() => setShowEditForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Device Info (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã thiết bị</label>
                  <input
                    type="text"
                    value={selectedIncident.deviceCode}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên thiết bị</label>
                  <input
                    type="text"
                    value={selectedIncident.deviceName}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bộ phận xét nghiệm</label>
                  <input
                    type="text"
                    value={selectedIncident.specialty}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung ứng</label>
                  <input
                    type="text"
                    value={selectedIncident.supplier}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              {/* Kết luận Section - Only show when not in progress */}
              {selectedIncident.status !== "Đang khắc phục" && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-medium text-slate-800 mb-4">Kết luận</h4>
                  <div className="space-y-4">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="conclusion"
                          checked={form.conclusion === "đã khắc phục" || selectedIncident.conclusion === "đã khắc phục"}
                          onChange={() => setForm({ ...form, conclusion: "đã khắc phục" })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Sự cố đã được khắc phục</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="conclusion"
                          checked={form.conclusion === "chưa khắc phục" || selectedIncident.conclusion === "chưa khắc phục"}
                          onChange={() => setForm({ ...form, conclusion: "chưa khắc phục" })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Sự cố chưa được khắc phục</span>
                      </label>
                    </div>

                    {(form.conclusion === "đã khắc phục" || selectedIncident.conclusion === "đã khắc phục") && (
                      <div className="ml-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Người khắc phục <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="resolvedByType"
                                checked={form.resolvedByType === "nhân viên lab" || selectedIncident.resolvedByType === "nhân viên lab"}
                                onChange={() => setForm({ ...form, resolvedByType: "nhân viên lab", resolvedBy: "" })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-slate-700">Nhân viên trong lab</span>
                            </label>
                            {form.resolvedByType === "nhân viên lab" || selectedIncident.resolvedByType === "nhân viên lab" ? (
                              <div className="ml-6">
                                <select
                                  value={form.resolvedBy?.split(",") || []}
                                  onChange={(e) => setForm({ ...form, resolvedBy: Array.from(e.target.selectedOptions).map(o => o.value).join(",") })}
                                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                  {LAB_STAFF.map((staff) => (
                                    <option key={staff.id} value={staff.fullName}>
                                      {staff.fullName} - {staff.role}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều người</p>
                              </div>
                            ) : null}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="resolvedByType"
                                checked={form.resolvedByType === "nhà sản xuất" || selectedIncident.resolvedByType === "nhà sản xuất"}
                                onChange={() => setForm({ ...form, resolvedByType: "nhà sản xuất", resolvedBy: "" })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-slate-700">Nhà sản xuất/Nhà cung cấp</span>
                            </label>
                            {form.resolvedByType === "nhà sản xuất" || selectedIncident.resolvedByType === "nhà sản xuất" ? (
                              <div className="ml-6">
                                <select
                                  value={form.linkedWorkOrderCode || selectedIncident.linkedWorkOrderCode || ""}
                                  onChange={(e) => setForm({ ...form, linkedWorkOrderCode: e.target.value })}
                                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                  <option value="">-- Chọn phiếu công việc NCC --</option>
                                  {selectedIncident.workOrders?.filter(wo => wo.status === "Đóng").map((wo) => (
                                    <option key={wo.id} value={wo.workOrderCode}>
                                      {wo.workOrderCode} - {wo.contactPerson}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Auto-generated supplier action */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Hành động khắc phục của nhà cung ứng/nhà sản xuất
                          </label>
                          <textarea
                            value={form.supplierAction || generateSupplierAction(selectedIncident) || selectedIncident.supplierAction}
                            onChange={(e) => setForm({ ...form, supplierAction: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                            placeholder="Tự động điền từ phiếu công việc NCC..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Required fields before submitting */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h4 className="font-medium text-slate-800">Thông tin bắt buộc trước khi gửi</h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="affectsPatient"
                      checked={form.affectsPatientResult ?? selectedIncident.affectsPatientResult}
                      onChange={(e) => setForm({ ...form, affectsPatientResult: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="affectsPatient" className="text-sm text-slate-700">
                      Có ảnh hưởng tới kết quả bệnh nhân không?
                    </label>
                  </div>
                  {(form.affectsPatientResult ?? selectedIncident.affectsPatientResult) && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="text"
                        value={form.affectedPatientSid ?? selectedIncident.affectedPatientSid}
                        onChange={(e) => setForm({ ...form, affectedPatientSid: e.target.value })}
                        placeholder="SID bệnh nhân"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={form.howAffected ?? selectedIncident.howAffected}
                        onChange={(e) => setForm({ ...form, howAffected: e.target.value })}
                        placeholder="Bị ảnh hưởng như thế nào?"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requiresStop"
                      checked={form.requiresDeviceStop ?? selectedIncident.requiresDeviceStop}
                      onChange={(e) => setForm({ ...form, requiresDeviceStop: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="requiresStop" className="text-sm text-slate-700">
                      Có phải dừng hoạt động của máy không?
                    </label>
                  </div>
                  {(form.requiresDeviceStop ?? selectedIncident.requiresDeviceStop) && (
                    <div className="ml-7 grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={form.stopFrom ?? selectedIncident.stopFrom}
                        onChange={(e) => setForm({ ...form, stopFrom: e.target.value })}
                        placeholder="Từ (hh:mm dd/mm/yyyy)"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={form.stopTo ?? selectedIncident.stopTo}
                        onChange={(e) => setForm({ ...form, stopTo: e.target.value })}
                        placeholder="Đến (hh:mm dd/mm/yyyy)"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasProposal"
                      checked={form.hasProposal ?? selectedIncident.hasProposal}
                      onChange={(e) => setForm({ ...form, hasProposal: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="hasProposal" className="text-sm text-slate-700">
                      Có đề xuất gì thêm không?
                    </label>
                  </div>
                  {(form.hasProposal ?? selectedIncident.hasProposal) && (
                    <div className="ml-7">
                      <input
                        type="text"
                        value={form.proposal ?? selectedIncident.proposal}
                        onChange={(e) => setForm({ ...form, proposal: e.target.value })}
                        placeholder="Đề xuất của bạn..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Related Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người báo cáo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.reportedBy ?? selectedIncident.reportedBy}
                    onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn người báo cáo --</option>
                    {MOCK_USERS_LIST.map((u) => (
                      <option key={u.id} value={u.fullName}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quản lý trang thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.deviceManager ?? selectedIncident.deviceManager}
                    onChange={(e) => setForm({ ...form, deviceManager: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn quản lý --</option>
                    {MOCK_USERS_LIST.map((u) => (
                      <option key={u.id} value={u.fullName}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleUpdateIncident}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Lưu thay đổi
                </button>
                {selectedIncident.conclusion === "đã khắc phục" && selectedIncident.status === "Nháp" && (
                  <button
                    onClick={() => {
                      handleUpdateIncident();
                      setTimeout(() => handleFinalSubmit({ ...selectedIncident, ...form }), 100);
                    }}
                    disabled={!form.reportedBy || !form.deviceManager}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                    Gửi báo cáo sự cố
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Contact Modal */}
      {showSupplierContact && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Phiếu liên hệ nhà cung ứng</h3>
                <p className="text-sm text-slate-500">Mã báo cáo sự cố: {selectedIncident.reportCode}</p>
                <p className="text-sm text-slate-500">Thiết bị: {selectedIncident.deviceName} ({selectedIncident.deviceCode})</p>
              </div>
              <button
                onClick={() => {
                  setShowSupplierContact(false);
                  setSelectedIncident(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung ứng</label>
                  <input
                    type="text"
                    value={selectedIncident.supplier}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người liên hệ</label>
                  <input
                    type="text"
                    value={workOrderForm.contactPerson}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactPerson: e.target.value })}
                    placeholder="Tên người liên hệ"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức liên hệ</label>
                  <select
                    value={workOrderForm.contactMethod}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactMethod: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {contactMethods.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Display (not editable) */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Trạng thái:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkOrderStatusColor(selectedIncident.workOrders?.some(wo => wo.status === "Mở") ? "Mở" : "Đóng")}`}>
                  {selectedIncident.workOrders?.some(wo => wo.status === "Mở") ? "Mở" : "Đóng"}
                </span>
              </div>

              {/* Work Orders Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã công việc</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Người liên hệ</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình thức</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian bắt đầu</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian kết thúc</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mô tả hành động</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ghi chú</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kết luận</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedIncident.workOrders?.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{wo.workOrderCode}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.contactPerson}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.contactMethod}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.startDateTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.endDateTime || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{wo.actionDescription}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{wo.notes || "—"}</td>
                        <td className="px-4 py-3 text-sm">
                          {wo.conclusion === "hoàn thành" && (
                            <span className="text-emerald-600">Hoàn thành</span>
                          )}
                          {wo.conclusion === "xử trí 1 phần" && (
                            <span className="text-amber-600">Xử trí 1 phần</span>
                          )}
                          {!wo.conclusion && <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {wo.isCompleted ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={14} /> Đã ký
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setWorkOrderForm({
                                  ...workOrderForm,
                                  contactPerson: wo.contactPerson,
                                  contactMethod: wo.contactMethod,
                                  startDateTime: wo.startDateTime,
                                });
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Chỉnh sửa"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!selectedIncident.workOrders || selectedIncident.workOrders.length === 0) && (
                  <div className="text-center py-8 text-slate-500">Chưa có công việc nào</div>
                )}
              </div>

              {/* Add Work Order Form */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Plus size={18} />
                  Thêm công việc mới
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người liên hệ NCC</label>
                    <input
                      type="text"
                      value={workOrderForm.contactPerson}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactPerson: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="Tên người liên hệ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức liên hệ</label>
                    <select
                      value={workOrderForm.contactMethod}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactMethod: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    >
                      {contactMethods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={workOrderForm.startDateTime}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, startDateTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="hh:mm dd/mm/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian kết thúc</label>
                    <input
                      type="text"
                      value={workOrderForm.endDateTime}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, endDateTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="hh:mm dd/mm/yyyy"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả hành động</label>
                  <textarea
                    value={workOrderForm.actionDescription}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, actionDescription: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    placeholder="Mô tả công việc đã thực hiện..."
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                  <textarea
                    value={workOrderForm.notes}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ghi chú thêm..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm tài liệu</label>
                  <input
                    ref={workOrderAttachmentInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleUploadWorkOrderAttachments}
                  />
                  <div className="space-y-2">
                    {(workOrderForm.attachments || []).length > 0 && (
                      <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {(workOrderForm.attachments || []).map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="text-slate-700 truncate pr-3">{attachment.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleViewAttachment(attachment)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Xem"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadAttachment(attachment)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Tải"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveWorkOrderAttachment(attachment.id || "")}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => workOrderAttachmentInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-200 rounded-lg p-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      Chọn file đính kèm
                    </button>
                  </div>
                </div>

                {/* Engineer Signature Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <FileCheck size={18} />
                    Ký xác nhận hoàn tất (Dành cho kỹ sư NCC)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên người sửa chữa</label>
                      <input
                        type="text"
                        value={workOrderForm.engineerName || ""}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, engineerName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                        placeholder="Họ tên kỹ sư"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kết luận</label>
                      <select
                        value={workOrderForm.conclusion || ""}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, conclusion: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      >
                        <option value="">-- Chọn kết luận --</option>
                        <option value="hoàn thành">Hoàn thành</option>
                        <option value="xử trí 1 phần">Xử trí 1 phần</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (!workOrderForm.engineerName || !workOrderForm.conclusion) {
                          error("Lỗi", "Vui lòng nhập tên người sửa chữa và kết luận");
                          return;
                        }
                        
                        // Find the work order to sign (the last one added)
                        const lastWorkOrder = selectedIncident.workOrders?.[selectedIncident.workOrders.length - 1];
                        if (lastWorkOrder) {
                          handleEngineerSign(lastWorkOrder.id);
                        }
                      }}
                      disabled={!workOrderForm.engineerName || !workOrderForm.conclusion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Lưu và ký
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleAddWorkOrder}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Thêm công việc
                  </button>
                  {selectedIncident.workOrders && selectedIncident.workOrders.length > 0 && selectedIncident.workOrders.every(wo => wo.status === "Đóng") && (
                    <button
                      onClick={() => handleCompleteRepair(selectedIncident)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Hoàn thành sửa chữa
                    </button>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowSupplierContact(false);
                    setSelectedIncident(null);
                  }}
                  className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttachmentViewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowAttachmentViewer(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{attachmentViewerTitle || "Tài liệu đính kèm"}</h3>
                <p className="text-sm text-slate-500">{attachmentViewerFiles.length} tệp</p>
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
    </div>
  );
}
