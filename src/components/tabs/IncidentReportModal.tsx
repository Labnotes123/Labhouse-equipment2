"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  Edit,
  Eye,
  FileText,
  Headphones,
  Mail,
  MessageSquare,
  Paperclip,
  PhoneCall,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { User } from "@/contexts/AuthContext";
import { previewTicketCode } from "@/lib/ticket-code";
import { SmartTable, Column } from "@/components/SmartTable";
import {
  AttachedFile,
  Device,
  DeviceStatus,
  IncidentReport,
  WorkOrder,
  mockIncidents,
  mockUserProfiles,
} from "@/lib/mockData";

type IncidentModalTab = "reports" | "work-orders";
type IncidentViewMode = "list" | "form";

type IncidentReportModalProps = {
  show: boolean;
  device: Device;
  user: User | null;
  onClose: () => void;
  formatDateTimeLabel: (value?: string) => string;
  downloadCsvFile: (filename: string, headers: string[], rows: string[][], successMessage: string) => void;
  openPrintableWindow: (title: string, lines: string[]) => void;
  openAttachmentViewer: (title: string, files: AttachedFile[]) => void;
  onViewAttachment: (file: AttachedFile) => void;
  onDownloadAttachment: (file: AttachedFile) => void;
  onUpdateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
};

const contactMethods = [
  { value: "zalo", label: "Zalo", icon: MessageSquare },
  { value: "điện thoại", label: "Điện thoại", icon: PhoneCall },
  { value: "email", label: "Email", icon: Mail },
  { value: "tin nhắn", label: "Tin nhắn", icon: PhoneCall },
  { value: "trao đổi trực tiếp", label: "Trao đổi trực tiếp", icon: Users },
];

const generateWorkOrderCode = (incidentCode: string, counter: number) => `${incidentCode}-WO-${String(counter).padStart(3, "0")}`;

function createDefaultIncidentForm(device: Device, user: User | null): Partial<IncidentReport> {
  return {
    deviceId: device.id,
    deviceName: device.name,
    deviceCode: device.code,
    specialty: device.specialty,
    incidentDateTime: "",
    discoveredBy: user?.fullName || "",
    discoveredByRole: user?.role || "",
    supplier: device.distributor || "",
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
    reportedBy: user?.fullName || "",
    deviceManager: device.managerHistory?.find((m) => m.isCurrent)?.fullName || "",
    relatedUsers: [],
    status: "Nháp",
    workOrders: [],
    conclusion: undefined,
    resolvedBy: undefined,
    resolvedByType: undefined,
    linkedWorkOrderCode: undefined,
    approvedBy: undefined,
    completionDateTime: undefined,
  };
}

function createDefaultWorkOrderForm(): Partial<WorkOrder> {
  return {
    contactPerson: "",
    contactMethod: "điện thoại",
    startDateTime: "",
    endDateTime: "",
    actionDescription: "",
    notes: "",
    attachments: [],
    status: "Mở",
    isCompleted: false,
    woConclusion: undefined,
  } as Partial<WorkOrder> & { woConclusion?: WorkOrder["conclusion"] };
}

export default function IncidentReportModal({
  show,
  device,
  user,
  onClose,
  formatDateTimeLabel,
  downloadCsvFile,
  openPrintableWindow,
  openAttachmentViewer,
  onViewAttachment,
  onDownloadAttachment,
  onUpdateDeviceStatus,
}: IncidentReportModalProps) {
  const { success, error } = useToast();
  const incidentAttachmentInputRef = useRef<HTMLInputElement>(null);
  const workOrderAttachmentInputRef = useRef<HTMLInputElement>(null);

  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(mockIncidents);
  const [workOrderCounter, setWorkOrderCounter] = useState(1);
  const [incidentModalTab, setIncidentModalTab] = useState<IncidentModalTab>("reports");
  const [incidentViewMode, setIncidentViewMode] = useState<IncidentViewMode>("list");
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);
  const [incidentForm, setIncidentForm] = useState<Partial<IncidentReport>>(createDefaultIncidentForm(device, user));
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [currentIncidentForWorkOrder, setCurrentIncidentForWorkOrder] = useState<IncidentReport | null>(null);
  const [workOrderForm, setWorkOrderForm] = useState<Partial<WorkOrder>>(createDefaultWorkOrderForm());
  const [showAddRelatedUser, setShowAddRelatedUser] = useState(false);
  const [newRelatedUser, setNewRelatedUser] = useState("");
  
  // User search states
  const [deviceManagerSearch, setDeviceManagerSearch] = useState("");
  const [approverSearch, setApproverSearch] = useState("");
  const [relatedUserSearch, setRelatedUserSearch] = useState("");
  const [showDeviceManagerDropdown, setShowDeviceManagerDropdown] = useState(false);
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [showRelatedUserDropdown, setShowRelatedUserDropdown] = useState(false);
  const [engineerSignature, setEngineerSignature] = useState<string>("");
  const [incidentAttachments, setIncidentAttachments] = useState<AttachedFile[]>([]);

  const deviceIncidents = useMemo(
    () => incidentReports.filter((incident) => incident.deviceId === device.id),
    [incidentReports, device.id]
  );

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    const allUsers = mockUserProfiles.filter(u => u.isActive).map(u => u.fullName);
    return allUsers;
  }, []);

  const filteredDeviceManagers = useMemo(() => {
    if (!deviceManagerSearch) return filteredUsers.slice(0, 5);
    return filteredUsers.filter(name => 
      name.toLowerCase().includes(deviceManagerSearch.toLowerCase())
    ).slice(0, 5);
  }, [deviceManagerSearch, filteredUsers]);

  const filteredApprovers = useMemo(() => {
    if (!approverSearch) return filteredUsers.slice(0, 5);
    return filteredUsers.filter(name => 
      name.toLowerCase().includes(approverSearch.toLowerCase())
    ).slice(0, 5);
  }, [approverSearch, filteredUsers]);

  const filteredRelatedUsers = useMemo(() => {
    if (!relatedUserSearch) return filteredUsers.slice(0, 5);
    return filteredUsers.filter(name => 
      name.toLowerCase().includes(relatedUserSearch.toLowerCase())
    ).slice(0, 5);
  }, [relatedUserSearch, filteredUsers]);

  const allDeviceWorkOrders = useMemo(() => {
    return deviceIncidents.flatMap((incident) => {
      return (incident.workOrders || []).map((wo) => ({ ...wo, incidentReportCode: incident.reportCode }));
    });
  }, [deviceIncidents]);

  const nextIncidentCode = useMemo(
    () => previewTicketCode(device.code || device.id, "PSC", deviceIncidents.map((incident) => incident.reportCode)),
    [device.code, device.id, deviceIncidents]
  );

  const resetIncidentForm = () => {
    setIncidentForm(createDefaultIncidentForm(device, user));
    setEditingIncidentId(null);
    setShowAddRelatedUser(false);
    setNewRelatedUser("");
    setIncidentAttachments([]);
  };

  // Calculate device stop duration
  const calculateStopDuration = (start: string, end: string): string => {
    if (!start || !end) return "";
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    if (diffMs <= 0) return "";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  };

  // Check if user can edit the incident
  const canEditIncident = (incident: IncidentReport): boolean => {
    if (incident.status === "Nháp") return true;
    if (incident.status === "Từ chối") return true;
    return false;
  };

  const handleSubmitIncident = (status: IncidentReport["status"]) => {
    if (!incidentForm.description || !incidentForm.immediateAction || !incidentForm.incidentDateTime) {
      error("Lỗi", "Vui lòng nhập thời gian xảy ra, mô tả và xử trí tức thời");
      return;
    }

    // Validation for report submission
    if (status === "Chờ duyệt") {
      if (!incidentForm.conclusion) {
        error("Lỗi", "Vui lòng chọn kết quả sau xử trí");
        return;
      }
      if (incidentForm.conclusion === "đã khắc phục") {
        if (!incidentForm.resolvedBy) {
          error("Lỗi", "Vui lòng chọn người khắc phục sự cố");
          return;
        }
        // Validate 3 evaluation questions when resolved
        if (incidentForm.affectsPatientResult && (!incidentForm.affectedPatientSid || !incidentForm.howAffected)) {
          error("Lỗi", "Vui lòng nhập SID bệnh nhân và mô tả ảnh hưởng");
          return;
        }
        if (incidentForm.requiresDeviceStop && (!incidentForm.stopFrom || !incidentForm.stopTo)) {
          error("Lỗi", "Vui lòng nhập thời gian bắt đầu và kết thúc dừng máy");
          return;
        }
        if (incidentForm.hasProposal && !incidentForm.proposal) {
          error("Lỗi", "Vui lòng nhập nội dung đề xuất");
          return;
        }
      }
      if (incidentForm.conclusion === "chưa khắc phục" && (!incidentForm.workOrders || incidentForm.workOrders.length === 0)) {
        error("Lỗi", "Vui lòng thêm công việc liên hệ nhà cung ứng trước khi gửi duyệt");
        return;
      }
      if (!incidentForm.approvedBy) {
        error("Lỗi", "Vui lòng chọn người phê duyệt");
        return;
      }
    }

    const baseIncident: IncidentReport = {
      id: editingIncidentId || `ir-${Date.now()}`,
      reportCode: editingIncidentId && incidentForm.reportCode ? incidentForm.reportCode : nextIncidentCode,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      specialty: device.specialty,
      incidentDateTime: incidentForm.incidentDateTime || "",
      discoveredBy: incidentForm.discoveredBy || user?.fullName || "",
      discoveredByRole: incidentForm.discoveredByRole || user?.role || "",
      supplier: incidentForm.supplier || device.distributor || "",
      description: incidentForm.description || "",
      immediateAction: incidentForm.immediateAction || "",
      supplierAction: incidentForm.supplierAction || "",
      affectsPatientResult: !!incidentForm.affectsPatientResult,
      affectedPatientSid: incidentForm.affectedPatientSid,
      howAffected: incidentForm.howAffected,
      requiresDeviceStop: !!incidentForm.requiresDeviceStop,
      stopFrom: incidentForm.stopFrom,
      stopTo: incidentForm.stopTo,
      hasProposal: !!incidentForm.hasProposal,
      proposal: incidentForm.proposal,
      reportedBy: incidentForm.reportedBy || user?.fullName || "",
      deviceManager: incidentForm.deviceManager || device.managerHistory?.find((m) => m.isCurrent)?.fullName || "",
      relatedUsers: incidentForm.relatedUsers || [],
      status,
      conclusion: incidentForm.conclusion,
      resolvedBy: incidentForm.resolvedBy,
      resolvedByType: incidentForm.resolvedByType,
      linkedWorkOrderCode: incidentForm.linkedWorkOrderCode,
      completionDateTime: incidentForm.completionDateTime,
      createdAt: incidentForm.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedBy: incidentForm.approvedBy,
      workOrders: incidentForm.workOrders || [],
    };

    setIncidentReports((prev) => {
      const exists = prev.some((incident) => incident.id === baseIncident.id);
      if (exists) {
        return prev.map((incident) => (incident.id === baseIncident.id ? baseIncident : incident));
      }
      return [baseIncident, ...prev];
    });

    if (status === "Chờ duyệt") {
      onUpdateDeviceStatus(device.id, "Tạm dừng");
    }

    success("Đã lưu", status === "Chờ duyệt" ? "Đã gửi báo cáo sự cố" : "Đã lưu nháp báo cáo");
    setIncidentViewMode("list");
    resetIncidentForm();
  };

  const handleEditIncident = (incident: IncidentReport) => {
    setIncidentForm({ ...incident });
    setEditingIncidentId(incident.id);
    setIncidentViewMode("form");
    setIncidentModalTab("reports");
  };

  const handleExportIncident = (incident: IncidentReport) => {
    downloadCsvFile(
      `${incident.reportCode}.csv`,
      ["Mã phiếu", "Thiết bị", "Người báo cáo", "Thời gian", "Trạng thái"],
      [[
        incident.reportCode,
        `${incident.deviceCode} - ${incident.deviceName}`,
        incident.reportedBy || "",
        formatDateTimeLabel(incident.incidentDateTime),
        incident.status,
      ]],
      `Đã xuất dữ liệu phiếu ${incident.reportCode}`
    );
  };

  const openPrintableIncident = (incident: IncidentReport) => {
    openPrintableWindow(`Phiếu sự cố ${incident.reportCode}`, [
      `Thiết bị: ${incident.deviceCode} - ${incident.deviceName}`,
      `Thời gian: ${formatDateTimeLabel(incident.incidentDateTime)}`,
      `Người báo cáo: ${incident.reportedBy || ""}`,
      `Mô tả: ${incident.description}`,
      `Xử trí tức thì: ${incident.immediateAction}`,
    ]);
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
        id: `wo-att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    setWorkOrderForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((item) => item.id !== attachmentId),
    }));
  };

  const handleUploadIncidentAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => ({
      id: `incident-att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : file.type.startsWith("image/") ? "image" : "doc",
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    setIncidentAttachments((prev) => [...prev, ...newFiles]);
    event.target.value = "";
    success("Thành công", `Đã thêm ${newFiles.length} tệp đính kèm`);
  };

  const handleRemoveIncidentAttachment = (attachmentId: string) => {
    setIncidentAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
  };

  const handleSaveWorkOrder = () => {
    const targetIncident = currentIncidentForWorkOrder || deviceIncidents[0] || null;
    if (!targetIncident) {
      error("Lỗi", "Cần có ít nhất một phiếu sự cố trước khi tạo công việc");
      return;
    }

    const newWorkOrder: WorkOrder = {
      id: editingWorkOrder?.id || `wo-${Date.now()}`,
      workOrderCode:
        editingWorkOrder?.workOrderCode ||
        generateWorkOrderCode(targetIncident.reportCode, workOrderCounter),
      incidentReportCode: targetIncident.reportCode,
      contactPerson: workOrderForm.contactPerson || "",
      contactMethod: (workOrderForm.contactMethod || "điện thoại") as WorkOrder["contactMethod"],
      startDateTime: workOrderForm.startDateTime || "",
      endDateTime: workOrderForm.endDateTime,
      actionDescription: workOrderForm.actionDescription || "",
      notes: workOrderForm.notes || "",
      attachments: workOrderForm.attachments || [],
      status: workOrderForm.status || "Mở",
      isCompleted: workOrderForm.isCompleted || false,
      conclusion: (workOrderForm as any).woConclusion,
      createdAt: editingWorkOrder?.createdAt || new Date().toISOString(),
      engineerName: workOrderForm.engineerName,
      signatureUrl: workOrderForm.signatureUrl,
    };

    setIncidentReports((prev) => {
      return prev.map((incident) => {
        if (incident.id !== targetIncident.id) return incident;
        const existingWorkOrders = incident.workOrders || [];
        const updatedWorkOrders = editingWorkOrder
          ? existingWorkOrders.map((wo) => (wo.id === editingWorkOrder.id ? newWorkOrder : wo))
          : [...existingWorkOrders, newWorkOrder];
        return { ...incident, workOrders: updatedWorkOrders, updatedAt: new Date().toISOString() };
      });
    });

    if (!editingWorkOrder) {
      setWorkOrderCounter((prev) => prev + 1);
    }

    setEditingWorkOrder(null);
    setCurrentIncidentForWorkOrder(null);
    setWorkOrderForm(createDefaultWorkOrderForm());
    setShowWorkOrderForm(false);
    success("Thành công", editingWorkOrder ? "Đã cập nhật công việc" : "Đã thêm công việc mới");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-[98vw] xl:max-w-[1900px] w-full max-h-[98vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Báo cáo sự cố thiết bị</h2>
            <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setIncidentModalTab("reports")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                incidentModalTab === "reports"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline-block mr-2" />
              Phiếu sự cố
            </button>
            <button
              onClick={() => setIncidentModalTab("work-orders")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                incidentModalTab === "work-orders"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Paperclip className="w-4 h-4 inline-block mr-2" />
              Công việc NCC
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {incidentModalTab === "reports" && (
            <div className="space-y-4">
              {incidentViewMode === "list" ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Danh sách phiếu sự cố</h3>
                      <p className="text-sm text-slate-500">{deviceIncidents.length} phiếu</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIncidentViewMode("form");
                          resetIncidentForm();
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                      >
                        <Plus size={18} /> Tạo phiếu
                      </button>
                    </div>
                  </div>

                  <SmartTable<IncidentReport>
                    data={deviceIncidents}
                    keyField="id"
                    defaultPageSize={10}
                    pageSizeOptions={[5, 10, 15, 20]}
                    settingsKey={`incident_reports_${device.id}`}
                    onExport={(data) => {
                      downloadCsvFile(
                        `PSC_${device.code}_${new Date().toISOString().split("T")[0]}.csv`,
                        ["Mã phiếu", "Thiết bị", "Người báo cáo", "Thời gian", "Trạng thái"],
                        data.map((incident) => [
                          incident.reportCode,
                          `${incident.deviceCode} - ${incident.deviceName}`,
                          incident.reportedBy || "",
                          formatDateTimeLabel(incident.incidentDateTime),
                          incident.status,
                        ]),
                        "Đã xuất danh sách phiếu sự cố"
                      );
                    }}
                    columns={[
                      { key: "reportCode", label: "Mã phiếu", sortable: true, filterable: true, render: (item) => <span className="font-mono text-red-600">{item.reportCode}</span> },
                      { key: "incidentDateTime", label: "Thời gian", sortable: true, dateFilter: true, render: (item) => <>{formatDateTimeLabel(item.incidentDateTime)}</> },
                      { key: "reportedBy", label: "Người báo cáo", sortable: true, filterable: true },
                      { key: "status", label: "Trạng thái", sortable: true, filterable: true, render: (item) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700"
                            : item.status === "Đã duyệt" ? "bg-blue-100 text-blue-700"
                            : item.status === "Hoàn thành" ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>{item.status}</span>
                      )},
                      { key: "actions", label: "Thao tác", render: (item) => (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEditIncident(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa"><Edit size={16} /></button>
                          <button onClick={() => handleExportIncident(item)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Xuất CSV"><Download size={16} /></button>
                          <button onClick={() => openPrintableIncident(item)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="In/PDF"><FileText size={16} /></button>
                          <button onClick={() => { setCurrentIncidentForWorkOrder(item); setIncidentModalTab("work-orders"); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Liên hệ NCC"><Headphones size={16} /></button>
                        </div>
                      )},
                    ]}
                  />
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{editingIncidentId ? "Cập nhật phiếu" : "Tạo phiếu sự cố"}</h3>
                    <button onClick={() => setIncidentViewMode("list")} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">
                      Đóng
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian phát hiện <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        value={incidentForm.incidentDateTime || ""}
                        onChange={(e) => setIncidentForm({ ...incidentForm, incidentDateTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung ứng</label>
                      <input
                        type="text"
                        value={incidentForm.supplier || ""}
                        onChange={(e) => setIncidentForm({ ...incidentForm, supplier: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        placeholder="Tên nhà cung ứng"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người báo cáo</label>
                      <input
                        type="text"
                        value={incidentForm.reportedBy || ""}
                        onChange={(e) => setIncidentForm({ ...incidentForm, reportedBy: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        placeholder="Họ tên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người quản lý thiết bị</label>
                      <input
                        type="text"
                        value={incidentForm.deviceManager || ""}
                        onChange={(e) => setIncidentForm({ ...incidentForm, deviceManager: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        placeholder="Họ tên"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả sự cố <span className="text-red-500">*</span></label>
                      <textarea
                        value={incidentForm.description || ""}
                        onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                        placeholder="Mô tả chi tiết sự cố"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Xử trí tức thời <span className="text-red-500">*</span></label>
                      <textarea
                        value={incidentForm.immediateAction || ""}
                        onChange={(e) => setIncidentForm({ ...incidentForm, immediateAction: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                        placeholder="Hành động đã thực hiện"
                      />
                    </div>
                  </div>

                  {/* Kết quả sau xử trí - chỉ hiển thị khi đã khắc phục */}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Kết quả sau xử trí</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Kết quả sau xử trí</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="conclusion"
                              checked={incidentForm.conclusion === "đã khắc phục"}
                              onChange={() => setIncidentForm({ ...incidentForm, conclusion: "đã khắc phục", resolvedByType: undefined })}
                              className="w-4 h-4"
                            />
                            Sự cố đã được khắc phục
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="conclusion"
                              checked={incidentForm.conclusion === "chưa khắc phục"}
                              onChange={() => setIncidentForm({ ...incidentForm, conclusion: "chưa khắc phục" })}
                              className="w-4 h-4"
                            />
                            Sự cố chưa được khắc phục
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* If resolved - show resolver fields */}
                    {incidentForm.conclusion === "đã khắc phục" && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Người khắc phục sự cố</label>
                            <div className="flex gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => setIncidentForm({ ...incidentForm, resolvedByType: "nhân viên lab", resolvedBy: undefined })}
                                className={`px-3 py-1.5 text-sm rounded-lg border ${
                                  incidentForm.resolvedByType === "nhân viên lab"
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Nhân viên Lab
                              </button>
                              <button
                                type="button"
                                onClick={() => setIncidentForm({ ...incidentForm, resolvedByType: "nhà sản xuất", resolvedBy: undefined })}
                                className={`px-3 py-1.5 text-sm rounded-lg border ${
                                  incidentForm.resolvedByType === "nhà sản xuất"
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Kỹ sư hãng
                              </button>
                            </div>
                            {incidentForm.resolvedByType && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={incidentForm.resolvedBy || ""}
                                  onChange={(e) => setIncidentForm({ ...incidentForm, resolvedBy: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                  placeholder={`Tìm ${incidentForm.resolvedByType === "nhân viên lab" ? "nhân viên" : "kỹ sư"}...`}
                                />
                                {/* Show resolved user info if selected */}
                                {incidentForm.resolvedBy && (
                                  <div className="p-2 bg-blue-50 rounded-lg text-sm">
                                    <p className="font-medium text-blue-800">{incidentForm.resolvedBy}</p>
                                    {incidentForm.resolvedByType === "nhân viên lab" && (
                                      <p className="text-blue-600 text-xs">Mã NV: NV001 | Chức vụ: Kỹ thuật viên | Khoa: Khoa xét nghiệm</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian hoàn thành</label>
                            <input
                              type="datetime-local"
                              value={incidentForm.completionDateTime || ""}
                              onChange={(e) => setIncidentForm({ ...incidentForm, completionDateTime: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            />
                          </div>
                        </div>

                        {/* 3 câu hỏi đánh giá ảnh hưởng sau khắc phục */}
                        <div className="mt-4 space-y-4">
                          {/* Câu 1: Ảnh hưởng kết quả bệnh nhân */}
                          <div className="border border-slate-200 rounded-lg p-4">
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 mb-3">
                              <span>1. Có ảnh hưởng tới kết quả bệnh nhân?</span>
                            </label>
                            <div className="flex gap-4 mb-3">
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name="affectsPatientResult"
                                  checked={incidentForm.affectsPatientResult === true}
                                  onChange={() => setIncidentForm({ ...incidentForm, affectsPatientResult: true })}
                                  className="w-4 h-4"
                                />
                                Có
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name="affectsPatientResult"
                                  checked={incidentForm.affectsPatientResult === false}
                                  onChange={() => setIncidentForm({ ...incidentForm, affectsPatientResult: false, affectedPatientSid: "", howAffected: "" })}
                                  className="w-4 h-4"
                                />
                                Không
                              </label>
                            </div>
                            {incidentForm.affectsPatientResult && (
                              <div className="pl-7 space-y-2">
                                <input
                                  type="text"
                                  value={incidentForm.affectedPatientSid || ""}
                                  onChange={(e) => setIncidentForm({ ...incidentForm, affectedPatientSid: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                  placeholder="SID bệnh nhân bị ảnh hưởng"
                                />
                                <textarea
                                  value={incidentForm.howAffected || ""}
                                  onChange={(e) => setIncidentForm({ ...incidentForm, howAffected: e.target.value })}
                                  rows={2}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                                  placeholder="Mô tả ảnh hưởng như thế nào"
                                />
                              </div>
                            )}
                          </div>

                          {/* Câu 2: Dừng máy */}
                          <div className="border border-slate-200 rounded-lg p-4">
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 mb-3">
                              <span>2. Có dừng máy hay không?</span>
                            </label>
                            <div className="flex gap-4 mb-3">
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name="requiresDeviceStop"
                                  checked={incidentForm.requiresDeviceStop === true}
                                  onChange={() => setIncidentForm({ ...incidentForm, requiresDeviceStop: true })}
                                  className="w-4 h-4"
                                />
                                Có
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name="requiresDeviceStop"
                                  checked={incidentForm.requiresDeviceStop === false}
                                  onChange={() => setIncidentForm({ ...incidentForm, requiresDeviceStop: false, stopFrom: "", stopTo: "" })}
                                  className="w-4 h-4"
                                />
                                Không
                              </label>
                            </div>
                            {incidentForm.requiresDeviceStop && (
                              <div className="pl-7 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-slate-500 mb-1">Thời gian bắt đầu</label>
                                    <input
                                      type="datetime-local"
                                      value={incidentForm.stopFrom || ""}
                                      onChange={(e) => setIncidentForm({ ...incidentForm, stopFrom: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-slate-500 mb-1">Thời gian kết thúc</label>
                                    <input
                                      type="datetime-local"
                                      value={incidentForm.stopTo || ""}
                                      onChange={(e) => setIncidentForm({ ...incidentForm, stopTo: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    />
                                  </div>
                                </div>
                                {incidentForm.stopFrom && incidentForm.stopTo && (
                                  <p className="text-sm text-blue-600 font-medium">
                                    Thời gian dừng máy: {calculateStopDuration(incidentForm.stopFrom, incidentForm.stopTo)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Câu 3: Đề xuất */}
                          <div className="border border-slate-200 rounded-lg p-4">
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 mb-3">
                              <span>3. Có đề xuất gì không?</span>
                            </label>
                            <div className="flex gap-4 mb-3">
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name="hasProposal"
                                  checked={incidentForm.hasProposal === true}
                                  onChange={() => setIncidentForm({ ...incidentForm, hasProposal: true })}
                                  className="w-4 h-4"
                                />
                                Có
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name="hasProposal"
                                  checked={incidentForm.hasProposal === false}
                                  onChange={() => setIncidentForm({ ...incidentForm, hasProposal: false, proposal: "" })}
                                  className="w-4 h-4"
                                />
                                Không
                              </label>
                            </div>
                            {incidentForm.hasProposal && (
                              <div className="pl-7">
                                <textarea
                                  value={incidentForm.proposal || ""}
                                  onChange={(e) => setIncidentForm({ ...incidentForm, proposal: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                                  placeholder="Nhập nội dung đề xuất"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If unresolved - show work order contact info */}
                    {incidentForm.conclusion === "chưa khắc phục" && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-amber-800 font-medium">Chưa khắc phục - Cần liên hệ nhà cung ứng</p>
                            <p className="text-xs text-amber-600 mt-1">
                              {deviceIncidents.find((i) => i.id === editingIncidentId)?.workOrders && deviceIncidents.find((i) => i.id === editingIncidentId)!.workOrders!.length > 0
                                ? `Đã liên hệ: ${deviceIncidents.find((i) => i.id === editingIncidentId)?.workOrders?.[0]?.contactPerson || "Chưa có thông tin"}`
                                : "Chưa liên hệ nhà cung ứng"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentIncidentForWorkOrder(deviceIncidents.find((i) => i.id === editingIncidentId) || null);
                              setIncidentModalTab("work-orders");
                            }}
                            className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                          >
                            <PhoneCall size={16} /> Liên hệ NCC
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Approver and related users */}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Thông tin phê duyệt</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người phụ trách thiết bị</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={incidentForm.deviceManager || ""}
                            onChange={(e) => {
                              setIncidentForm({ ...incidentForm, deviceManager: e.target.value });
                              setDeviceManagerSearch(e.target.value);
                              setShowDeviceManagerDropdown(true);
                            }}
                            onFocus={() => setShowDeviceManagerDropdown(true)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50"
                            placeholder="Tìm người phụ trách..."
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type="text"
                            value={incidentForm.approvedBy || ""}
                            onChange={(e) => {
                              setIncidentForm({ ...incidentForm, approvedBy: e.target.value });
                              setApproverSearch(e.target.value);
                              setShowApproverDropdown(true);
                            }}
                            onFocus={() => setShowApproverDropdown(true)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Tìm người phê duyệt..."
                          />
                          {showApproverDropdown && filteredApprovers.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredApprovers.map((name) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setIncidentForm({ ...incidentForm, approvedBy: name });
                                    setApproverSearch(name);
                                    setShowApproverDropdown(false);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                  {name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người liên quan</label>
                        <div className="space-y-2">
                          {incidentForm.relatedUsers && incidentForm.relatedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {incidentForm.relatedUsers.map((user, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                                >
                                  {user}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newUsers = [...(incidentForm.relatedUsers || [])];
                                      newUsers.splice(idx, 1);
                                      setIncidentForm({ ...incidentForm, relatedUsers: newUsers });
                                    }}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="relative">
                            <input
                              type="text"
                              value={relatedUserSearch}
                              onChange={(e) => {
                                setRelatedUserSearch(e.target.value);
                                setShowRelatedUserDropdown(true);
                              }}
                              onFocus={() => setShowRelatedUserDropdown(true)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                              placeholder="Tìm người liên quan..."
                            />
                            {showRelatedUserDropdown && filteredRelatedUsers.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredRelatedUsers
                                  .filter(name => !(incidentForm.relatedUsers || []).includes(name))
                                  .map((name) => (
                                  <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                      setIncidentForm({
                                        ...incidentForm,
                                        relatedUsers: [...(incidentForm.relatedUsers || []), name],
                                      });
                                      setRelatedUserSearch("");
                                      setShowRelatedUserDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                                  >
                                    {name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachment Upload Section */}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Đính kèm</h4>
                    <input
                      ref={incidentAttachmentInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleUploadIncidentAttachments}
                    />
                    <button
                      type="button"
                      onClick={() => incidentAttachmentInputRef.current?.click()}
                      className="px-4 py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-400 flex items-center gap-2"
                    >
                      <Upload size={18} />
                      Tải lên đính kèm
                    </button>

                    {incidentAttachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {incidentAttachments.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Paperclip size={18} className="text-slate-500" />
                              <span className="text-sm text-slate-700">{file.name}</span>
                              <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onViewAttachment(file)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Xem"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDownloadAttachment(file)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Tải xuống"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => file.id && handleRemoveIncidentAttachment(file.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end items-center pt-2 gap-2">
                    <button
                      onClick={onClose}
                      className="px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                      title="Đóng"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitIncident("Nháp")}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Save size={16} /> Lưu nháp
                      </button>
                      <button
                        onClick={() => handleSubmitIncident("Chờ duyệt")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                      >
                        <Send size={16} /> Gửi duyệt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {incidentModalTab === "work-orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Công việc nhà cung ứng</h3>
                  <p className="text-sm text-slate-500">Gắn với phiếu sự cố PSC</p>
                </div>
                <button
                  onClick={() => {
                    setEditingWorkOrder(null);
                    setCurrentIncidentForWorkOrder(currentIncidentForWorkOrder || deviceIncidents[0] || null);
                    setWorkOrderForm(createDefaultWorkOrderForm());
                    setEngineerSignature("");
                    setShowWorkOrderForm(true);
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                >
                  <Plus size={18} /> Thêm công việc
                </button>
              </div>

              <SmartTable<WorkOrder & { incidentReportCode: string }>
                data={allDeviceWorkOrders}
                keyField="id"
                defaultPageSize={10}
                pageSizeOptions={[5, 10, 15, 20]}
                settingsKey={`work_orders_${device.id}`}
                onExport={(data) => {
                  downloadCsvFile(
                    `WO_${device.code}_${new Date().toISOString().split("T")[0]}.csv`,
                    ["Mã công việc", "Mã phiếu sự cố", "Người liên hệ", "Bắt đầu", "Trạng thái"],
                    data.map((wo) => [
                      wo.workOrderCode,
                      wo.incidentReportCode,
                      wo.contactPerson || "",
                      wo.startDateTime || "—",
                      wo.status,
                    ]),
                    "Đã xuất danh sách công việc"
                  );
                }}
                columns={[
                  { key: "workOrderCode", label: "Mã công việc", sortable: true, filterable: true, render: (item) => <span className="font-mono text-amber-600">{item.workOrderCode}</span> },
                  { key: "incidentReportCode", label: "Mã phiếu sự cố", sortable: true, filterable: true },
                  { key: "contactPerson", label: "Người liên hệ", sortable: true, filterable: true },
                  { key: "startDateTime", label: "Bắt đầu", sortable: true, dateFilter: true, render: (item) => <>{item.startDateTime || "—"}</> },
                  { key: "status", label: "Trạng thái", sortable: true, filterable: true, render: (item) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Mở" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    }`}>{item.status}</span>
                  )},
                  { key: "actions", label: "Thao tác", render: (item) => (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          const ownerIncident = deviceIncidents.find((incident) => incident.reportCode === item.incidentReportCode) || null;
                          setCurrentIncidentForWorkOrder(ownerIncident);
                          setEditingWorkOrder(item as WorkOrder);
                          setWorkOrderForm({ ...item });
                          setEngineerSignature(item.signatureUrl || "");
                          setShowWorkOrderForm(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Cập nhật"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openAttachmentViewer(`Đính kèm của ${item.workOrderCode}`, item.attachments || [])}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Đính kèm"
                      >
                        <Paperclip size={16} />
                      </button>
                    </div>
                  )},
                ]}
              />

              {showWorkOrderForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={() => setShowWorkOrderForm(false)}>
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          {editingWorkOrder ? "Cập nhật công việc" : "Thêm công việc mới"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Mã công việc: {editingWorkOrder?.workOrderCode || generateWorkOrderCode(currentIncidentForWorkOrder?.reportCode || deviceIncidents[0]?.reportCode || "PSC", workOrderCounter)}
                        </p>
                      </div>
                      <button onClick={() => setShowWorkOrderForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Chọn phiếu sự cố</label>
                          <select
                            value={currentIncidentForWorkOrder?.id || ""}
                            onChange={(e) => {
                              const target = deviceIncidents.find((incident) => incident.id === e.target.value) || null;
                              setCurrentIncidentForWorkOrder(target);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          >
                            <option value="">Chọn phiếu</option>
                            {deviceIncidents.map((incident) => (
                              <option key={incident.id} value={incident.id}>{incident.reportCode} - {incident.description.slice(0, 30)}...</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Người liên hệ NCC</label>
                          <input
                            type="text"
                            value={workOrderForm.contactPerson || ""}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactPerson: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Tên người liên hệ"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức liên hệ</label>
                          <select
                            value={workOrderForm.contactMethod || "điện thoại"}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactMethod: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          >
                            {contactMethods.map((method) => (
                              <option key={method.value} value={method.value}>{method.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian bắt đầu</label>
                          <input
                            type="datetime-local"
                            value={workOrderForm.startDateTime || ""}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, startDateTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian kết thúc</label>
                          <input
                            type="datetime-local"
                            value={workOrderForm.endDateTime || ""}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, endDateTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                          <select
                            value={workOrderForm.status || "Mở"}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, status: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          >
                            <option value="Mở">Mở</option>
                            <option value="Đóng">Đóng</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả hành động</label>
                        <textarea
                          value={workOrderForm.actionDescription || ""}
                          onChange={(e) => setWorkOrderForm({ ...workOrderForm, actionDescription: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                          placeholder="Mô tả công việc đã thực hiện"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                        <textarea
                          value={workOrderForm.notes || ""}
                          onChange={(e) => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                          placeholder="Ghi chú thêm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm</label>
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
                                      onClick={() => onViewAttachment(attachment)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                      title="Xem"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDownloadAttachment(attachment)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                      title="Tải xuống"
                                    >
                                      <Download size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveWorkOrderAttachment(attachment.id || "")}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                      title="Xóa"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => workOrderAttachmentInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50"
                          >
                            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Click để tải lên tệp đính kèm</p>
                            <p className="text-xs text-slate-400 mt-1">Hình ảnh, phiếu sửa chữa, tài liệu PDF/Word/Excel</p>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={(workOrderForm as any).woConclusion === "hoàn thành"}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, woConclusion: e.target.checked ? "hoàn thành" : undefined } as any)}
                            className="w-4 h-4"
                          />
                          Kết luận: Hoàn thành
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={(workOrderForm as any).woConclusion === "xử trí 1 phần"}
                            onChange={(e) => setWorkOrderForm({ ...workOrderForm, woConclusion: e.target.checked ? "xử trí 1 phần" : undefined } as any)}
                            className="w-4 h-4"
                          />
                          Kết luận: Xử trí 1 phần
                        </label>
                      </div>

                      {/* Chữ ký kỹ sư */}
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="font-semibold text-slate-800 mb-3">Chữ ký kỹ sư</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tên kỹ sư</label>
                            <input
                              type="text"
                              value={workOrderForm.engineerName || ""}
                              onChange={(e) => setWorkOrderForm({ ...workOrderForm, engineerName: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                              placeholder="Nhập tên kỹ sư..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Chữ ký (ký trên màn hình cảm ứng)</label>
                            <div className="border border-slate-200 rounded-lg bg-white">
                              <canvas
                                ref={(el) => {
                                  if (el) {
                                    el.width = 300;
                                    el.height = 100;
                                    const ctx = el.getContext("2d");
                                    if (ctx) {
                                      ctx.strokeStyle = "#1e293b";
                                      ctx.lineWidth = 2;
                                      ctx.lineCap = "round";
                                      
                                      // Draw existing signature if available
                                      if (engineerSignature && engineerSignature.startsWith('data:')) {
                                        const img = new Image();
                                        img.onload = () => {
                                          ctx.drawImage(img, 0, 0);
                                        };
                                        img.src = engineerSignature;
                                      }
                                      
                                      let isDrawing = false;
                                      let lastX = 0;
                                      let lastY = 0;
                                      
                                      const startDrawing = (e: MouseEvent | TouchEvent) => {
                                        isDrawing = true;
                                        const rect = el.getBoundingClientRect();
                                        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
                                        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
                                        lastX = clientX - rect.left;
                                        lastY = clientY - rect.top;
                                      };
                                      
                                      const draw = (e: MouseEvent | TouchEvent) => {
                                        if (!isDrawing) return;
                                        e.preventDefault();
                                        const rect = el.getBoundingClientRect();
                                        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
                                        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
                                        const x = clientX - rect.left;
                                        const y = clientY - rect.top;
                                        ctx.beginPath();
                                        ctx.moveTo(lastX, lastY);
                                        ctx.lineTo(x, y);
                                        ctx.stroke();
                                        lastX = x;
                                        lastY = y;
                                      };
                                      
                                      const stopDrawing = () => {
                                        if (isDrawing) {
                                          isDrawing = false;
                                          const dataUrl = el.toDataURL();
                                          setEngineerSignature(dataUrl);
                                          setWorkOrderForm((prev: any) => ({ ...prev, signatureUrl: dataUrl }));
                                        }
                                      };
                                      
                                      el.onmousedown = startDrawing;
                                      el.onmousemove = draw;
                                      el.onmouseup = stopDrawing;
                                      el.onmouseleave = stopDrawing;
                                      el.ontouchstart = startDrawing;
                                      el.ontouchmove = draw;
                                      el.ontouchend = stopDrawing;
                                    }
                                  }
                                }}
                                className="w-full touch-none cursor-crosshair"
                                style={{ height: "100px" }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-slate-500">Ký hoặc vẽ chữ ký ở đây</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
                                  if (canvas) {
                                    const ctx = canvas.getContext("2d");
                                    if (ctx) {
                                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                                      setEngineerSignature("");
                                      setWorkOrderForm((prev: any) => ({ ...prev, signatureUrl: "" }));
                                    }
                                  }
                                }}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Xóa chữ ký
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setShowWorkOrderForm(false)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveWorkOrder}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                        >
                          <Check size={16} /> Lưu công việc
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
