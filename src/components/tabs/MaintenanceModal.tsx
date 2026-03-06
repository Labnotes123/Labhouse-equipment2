"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  Paperclip,
  Plus,
  Save,
  Send,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { previewTicketCode } from "@/lib/ticket-code";
import { SmartTable, Column } from "@/components/SmartTable";
import { Device, MOCK_USERS_LIST } from "@/lib/mockData";

interface MaintenanceModalProps {
  show: boolean;
  device: Device | null;
  onClose: () => void;
}

type MaintenanceStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Hoàn thành";

type Attachment = {
  id: string;
  name: string;
  url: string;
  type: "pdf" | "image" | "doc";
  size?: number;
};

type MaintenanceRequest = {
  id: string;
  requestCode: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  issueDescription: string;
  expectedDate: string;
  provider: string;
  attachments: Attachment[];
  approver: string;
  status: MaintenanceStatus;
  requestedBy: string;
};

type MaintenanceSchedule = {
  id: string;
  code: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  plannedDate: string;
  remindBefore: number;
  frequencyMonths: number;
  status: "Chờ thực hiện" | "Sắp tới" | "Hoàn thành";
};

type MaintenanceResult = {
  id: string;
  resultCode: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  executionDate: string;
  engineer: string;
  workDone: string;
  partsReplaced: string;
  conclusion: "Đạt" | "Không đạt";
  nextDueDate: string;
  attachments: Attachment[];
};

const getAttachmentType = (filename: string): Attachment["type"] => {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => lower.endsWith(ext))) return "image";
  return "doc";
};

const generateScheduleCode = (year: number, counter: number) => `LBD-${year}-${String(counter).padStart(3, "0")}`;
const generateResultCode = (year: number, counter: number) => `KQBD-${year}-${String(counter).padStart(3, "0")}`;

const createProjectedSchedules = (
  device: Device,
  startDate: string,
  frequencyMonths: number,
  remindBefore: number,
  existingCount: number,
): MaintenanceSchedule[] => {
  if (!startDate) return [];
  const schedules: MaintenanceSchedule[] = [];
  const base = new Date(startDate);
  const total = 10; // ~3 năm (10 mốc)
  for (let i = 0; i < total; i += 1) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i * frequencyMonths);
    schedules.push({
      id: `m-schedule-${Date.now()}-${i}`,
      code: generateScheduleCode(d.getFullYear(), existingCount + i + 1),
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      plannedDate: d.toISOString().slice(0, 10),
      remindBefore,
      frequencyMonths,
      status: "Sắp tới",
    });
  }
  return schedules;
};

export default function MaintenanceModal({ show, device, onClose }: MaintenanceModalProps) {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<"request" | "schedule" | "result">("request");
  const [requestView, setRequestView] = useState<"list" | "form">("list");

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [results, setResults] = useState<MaintenanceResult[]>([]);

  const [requestCounter, setRequestCounter] = useState(1);
  const [scheduleCounter, setScheduleCounter] = useState(1);
  const [resultCounter, setResultCounter] = useState(1);

  const [requestForm, setRequestForm] = useState<MaintenanceRequest | null>(null);
  const [requestAttachments, setRequestAttachments] = useState<Attachment[]>([]);

  const [scheduleConfig, setScheduleConfig] = useState<{ frequencyMonths: number; startDate: string; remindBefore: number }>({
    frequencyMonths: 6,
    startDate: "",
    remindBefore: 5,
  });

  const [resultForm, setResultForm] = useState<Omit<MaintenanceResult, "id" | "deviceId" | "deviceName" | "deviceCode" | "resultCode" | "attachments"> & { attachments: Attachment[] }>({
    executionDate: "",
    engineer: user?.fullName || "",
    workDone: "",
    partsReplaced: "",
    conclusion: "Đạt",
    nextDueDate: "",
    attachments: [],
  });

  useEffect(() => {
    if (!device) return;
    setRequestForm({
      id: "",
      requestCode: "",
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      serialNumber: device.serial,
      issueDescription: "Phát hiện bất thường, cần kiểm tra và báo giá.",
      expectedDate: "",
      provider: "Hãng/Đối tác dịch vụ",
      attachments: [],
      approver: "",
      status: "Nháp",
      requestedBy: user?.fullName || "",
    });
    setRequestAttachments([]);
    setRequestView("list");
    setActiveTab("request");
  }, [device, user]);

  const deviceRequests = useMemo(() => (device ? requests.filter((r) => r.deviceId === device.id) : []), [device, requests]);
  const deviceSchedules = useMemo(() => (device ? schedules.filter((s) => s.deviceId === device.id) : []), [device, schedules]);
  const deviceResults = useMemo(() => (device ? results.filter((r) => r.deviceId === device.id) : []), [device, results]);

  if (!show || !device || !requestForm) return null;

  const currentRequestCode = previewTicketCode(
    device?.code || device?.id || "NO-CODE",
    "PBD",
    deviceRequests.map((r) => r.requestCode)
  );

  const approvers = MOCK_USERS_LIST.filter((u) => ["Quản lý trang thiết bị", "Trưởng phòng xét nghiệm", "Admin", "Giám đốc"].includes(u.role));

  const handleUploadRequestAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const added: Attachment[] = Array.from(files).map((file, idx) => ({
      id: `req-attach-${Date.now()}-${idx}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: getAttachmentType(file.name),
      size: file.size,
    }));
    setRequestAttachments((prev) => [...prev, ...added]);
    event.target.value = "";
  };

  const handleUploadResultAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const added: Attachment[] = Array.from(files).map((file, idx) => ({
      id: `result-attach-${Date.now()}-${idx}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: getAttachmentType(file.name),
      size: file.size,
    }));
    setResultForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...added] }));
    event.target.value = "";
  };

  const handleSaveRequest = (finalStatus: MaintenanceStatus) => {
    if (!requestForm.expectedDate || !requestForm.approver) {
      error("Lỗi", "Vui lòng chọn ngày dự kiến và người phê duyệt");
      return;
    }
    if (requestAttachments.length === 0) {
      error("Thiếu đính kèm", "Vui lòng tải lên báo giá/bằng chứng bằng icon Kẹp ghim");
      return;
    }

    const newRequest: MaintenanceRequest = {
      ...requestForm,
      id: `maint-${Date.now()}`,
      requestCode: currentRequestCode,
      attachments: requestAttachments,
      status: finalStatus,
    };

    setRequests((prev) => [newRequest, ...prev]);
    setRequestCounter((prev) => prev + 1);
    setRequestView("list");
    success(
      "Thành công",
      finalStatus === "Nháp" ? "Đã lưu phiếu bảo dưỡng" : `Gửi yêu cầu bảo dưỡng ${newRequest.requestCode} thành công`,
    );
  };

  const handleGenerateSchedules = () => {
    if (!scheduleConfig.startDate) {
      error("Lỗi", "Chọn ngày bắt đầu chu kỳ");
      return;
    }
    if (!scheduleConfig.frequencyMonths) {
      error("Lỗi", "Chọn tần suất bảo dưỡng");
      return;
    }
    const projected = createProjectedSchedules(device, scheduleConfig.startDate, scheduleConfig.frequencyMonths, scheduleConfig.remindBefore, deviceSchedules.length + scheduleCounter - 1);
    setSchedules((prev) => [...projected, ...prev]);
    setScheduleCounter((prev) => prev + projected.length);
    success("Đã sinh lịch", "Đã tạo các mốc bảo dưỡng 3 năm tới");
  };

  const handleSaveResult = () => {
    if (!resultForm.executionDate || !resultForm.conclusion) {
      error("Lỗi", "Nhập ngày thực hiện và kết luận");
      return;
    }
    if (resultForm.attachments.length === 0) {
      error("Thiếu biên bản", "Vui lòng tải lên biên bản bảo dưỡng bằng icon Kẹp ghim");
      return;
    }

    const newResult: MaintenanceResult = {
      id: `m-result-${Date.now()}`,
      resultCode: generateResultCode(new Date().getFullYear(), resultCounter),
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      executionDate: resultForm.executionDate,
      engineer: resultForm.engineer,
      workDone: resultForm.workDone,
      partsReplaced: resultForm.partsReplaced,
      conclusion: resultForm.conclusion,
      nextDueDate: resultForm.nextDueDate,
      attachments: resultForm.attachments,
    };

    setResults((prev) => [newResult, ...prev]);
    setResultCounter((prev) => prev + 1);
    success("Đã lưu", "Đã ghi nhận kết quả bảo dưỡng");
    if (resultForm.conclusion === "Không đạt") {
      info("Cảnh báo", "Hãy lập báo cáo sự cố và tạm dừng thiết bị");
    }
    setResultForm({
      executionDate: "",
      engineer: user?.fullName || "",
      workDone: "",
      partsReplaced: "",
      conclusion: "Đạt",
      nextDueDate: "",
      attachments: [],
    });
  };

  const requestColumns: Column<MaintenanceRequest>[] = [
    { key: "requestCode", label: "Mã phiếu", sortable: true, filterable: true },
    { key: "issueDescription", label: "Lý do", sortable: true, filterable: true },
    { key: "expectedDate", label: "Ngày dự kiến", sortable: true, filterable: true, dateFilter: true },
    { key: "provider", label: "Đơn vị", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "Đã duyệt"
              ? "bg-blue-100 text-blue-700"
              : item.status === "Chờ duyệt"
                ? "bg-amber-100 text-amber-700"
                : item.status === "Hoàn thành"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "attachments",
      label: "Đính kèm",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Paperclip size={14} className="text-slate-500" />
          <span className="text-sm text-slate-600">{item.attachments.length} file</span>
        </div>
      ),
    },
  ];

  const scheduleColumns: Column<MaintenanceSchedule>[] = [
    { key: "code", label: "Mã lịch", sortable: true, filterable: true },
    { key: "plannedDate", label: "Ngày dự kiến", sortable: true, filterable: true, dateFilter: true },
    { key: "frequencyMonths", label: "Tần suất (tháng)", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
          {item.status}
        </span>
      ),
    },
  ];

  const resultColumns: Column<MaintenanceResult>[] = [
    { key: "resultCode", label: "Mã kết quả", sortable: true, filterable: true },
    { key: "executionDate", label: "Ngày thực hiện", sortable: true, filterable: true, dateFilter: true },
    { key: "engineer", label: "Kỹ sư", sortable: true, filterable: true },
    { key: "workDone", label: "Nội dung", sortable: true, filterable: true },
    {
      key: "conclusion",
      label: "Kết luận",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.conclusion === "Đạt" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {item.conclusion}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-[98vw] xl:max-w-[1900px] w-full min-h-[90vh] max-h-[98vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Wrench size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Bảo dưỡng thiết bị</h2>
              <p className="text-sm text-slate-500">{device.name} • {device.code} • Serial: {device.serial}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 bg-slate-50">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("request")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "request" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <ClipboardList size={16} /> Yêu cầu bảo dưỡng
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "schedule" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <Calendar size={16} /> Lịch bảo dưỡng
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "result" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <CheckCircle2 size={16} /> Kết quả bảo dưỡng
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(98vh-170px)] bg-slate-50">
          {/* Tab 1: Request */}
          {activeTab === "request" && (
            requestView === "list" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Yêu cầu bảo dưỡng (Đột xuất)</h3>
                    <p className="text-sm text-slate-500">Quản lý phiếu xin chi phí, báo giá từ hãng</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRequestView("form")}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={18} /> Tạo phiếu yêu cầu
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <SmartTable
                    data={deviceRequests}
                    columns={requestColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_maintenance_requests`}
                    defaultPageSize={10}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5 max-w-[1600px] mx-auto">
                <button
                  onClick={() => setRequestView("list")}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                  <ChevronRight className="rotate-180" size={20} /> Quay lại danh sách
                </button>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Phiếu yêu cầu bảo dưỡng</h3>
                    <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono rounded-md">
                      {currentRequestCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên thiết bị</label>
                      <input value={device.name} readOnly className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mã / Serial</label>
                      <input value={`${device.code} • ${device.serial}`} readOnly className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Lý do bảo dưỡng *</label>
                      <textarea
                        value={requestForm.issueDescription}
                        onChange={(e) => setRequestForm({ ...requestForm, issueDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                        placeholder="Máy kêu lạ, nghi lệch trục, cần hãng kiểm tra..."
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến *</label>
                        <input
                          type="datetime-local"
                          value={requestForm.expectedDate}
                          onChange={(e) => setRequestForm({ ...requestForm, expectedDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị thực hiện</label>
                        <input
                          type="text"
                          value={requestForm.provider}
                          onChange={(e) => setRequestForm({ ...requestForm, provider: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          placeholder="Tên hãng/đối tác dịch vụ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người đề xuất</label>
                      <input
                        type="text"
                        value={requestForm.requestedBy}
                        onChange={(e) => setRequestForm({ ...requestForm, requestedBy: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt *</label>
                      <select
                        value={requestForm.approver}
                        onChange={(e) => setRequestForm({ ...requestForm, approver: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      >
                        <option value="">-- Chọn người phê duyệt --</option>
                        {approvers.map((ap) => (
                          <option key={ap.id} value={ap.fullName}>{ap.fullName} - {ap.role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm báo giá / hình ảnh *</label>
                    <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Paperclip size={18} />
                        <span className="text-sm">Kéo thả hoặc bấm để tải lên</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Eye size={16} /> Xem • <Download size={16} /> Tải về
                      </div>
                      <label className="ml-auto px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer text-sm hover:bg-slate-100">
                        Chọn file
                        <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleUploadRequestAttachment} />
                      </label>
                    </div>
                    {requestAttachments.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {requestAttachments.map((file) => (
                          <div key={file.id} className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2">
                            <Paperclip size={14} className="text-slate-500" />
                            <span className="truncate flex-1" title={file.name}>{file.name}</span>
                            <button onClick={() => setRequestAttachments((prev) => prev.filter((f) => f.id !== file.id))} className="text-slate-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                    <button onClick={() => setRequestView("list")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                      Hủy
                    </button>
                    <button onClick={() => handleSaveRequest("Nháp")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Save size={16} /> Lưu nháp
                    </button>
                    <button
                      onClick={() => handleSaveRequest("Chờ duyệt")}
                      className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                    >
                      <Send size={16} /> Gửi phê duyệt
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Tab 2: Schedule */}
          {activeTab === "schedule" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Lịch bảo dưỡng định kỳ</h3>
                  <p className="text-sm text-slate-500">Cài đặt tần suất, nhắc trước và sinh lịch 3 năm</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => success("Xuất file", "Đang tải Excel theo cột hiển thị")}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} /> Xuất Excel
                  </button>
                  <button
                    onClick={handleGenerateSchedules}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                  >
                    <Plus size={18} /> Sinh lịch
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tần suất</label>
                  <select
                    value={scheduleConfig.frequencyMonths}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequencyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value={3}>3 tháng/lần</option>
                    <option value={6}>6 tháng/lần</option>
                    <option value={12}>12 tháng/lần</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={scheduleConfig.startDate}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhắc trước</label>
                  <select
                    value={scheduleConfig.remindBefore}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, remindBefore: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value={3}>3 ngày</option>
                    <option value={5}>5 ngày</option>
                    <option value={7}>7 ngày</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Hệ thống sẽ sinh 10 mốc (~3 năm)
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <SmartTable
                  data={deviceSchedules}
                  columns={scheduleColumns}
                  keyField="id"
                  settingsKey={`device_${device.id}_maintenance_schedules`}
                  defaultPageSize={10}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Result */}
          {activeTab === "result" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Ghi nhận kết quả bảo dưỡng</h3>
                  <p className="text-sm text-slate-500">Upload biên bản, đánh giá đạt/không đạt, nhắc sự cố</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveResult}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Save size={16} /> Lưu kết quả
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thực tế *</label>
                  <input
                    type="date"
                    value={resultForm.executionDate}
                    onChange={(e) => setResultForm({ ...resultForm, executionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bảo dưỡng kế tiếp</label>
                  <input
                    type="date"
                    value={resultForm.nextDueDate}
                    onChange={(e) => setResultForm({ ...resultForm, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên kỹ sư</label>
                  <input
                    type="text"
                    value={resultForm.engineer}
                    onChange={(e) => setResultForm({ ...resultForm, engineer: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Kỹ sư hãng / KTV"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Linh kiện thay thế</label>
                  <input
                    type="text"
                    value={resultForm.partsReplaced}
                    onChange={(e) => setResultForm({ ...resultForm, partsReplaced: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Ghi rõ linh kiện"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung công việc</label>
                  <textarea
                    value={resultForm.workDone}
                    onChange={(e) => setResultForm({ ...resultForm, workDone: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                    placeholder="Vệ sinh, hiệu chỉnh, thay dầu mỡ..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm biên bản bảo dưỡng *</label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Paperclip size={18} />
                      <span className="text-sm">Upload biên bản có chữ ký</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Eye size={16} /> Xem • <Download size={16} /> Tải về
                    </div>
                    <label className="ml-auto px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer text-sm hover:bg-slate-100">
                      Chọn file
                      <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleUploadResultAttachment} />
                    </label>
                  </div>
                  {resultForm.attachments.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {resultForm.attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <Paperclip size={14} className="text-slate-500" />
                          <span className="truncate flex-1" title={file.name}>{file.name}</span>
                          <button
                            onClick={() => setResultForm((prev) => ({ ...prev, attachments: prev.attachments.filter((f) => f.id !== file.id) }))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Đánh giá</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {["Đạt", "Không đạt"].map((value) => (
                      <label key={value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="maint-result"
                          value={value}
                          checked={resultForm.conclusion === value}
                          onChange={() => setResultForm({ ...resultForm, conclusion: value as MaintenanceResult["conclusion"] })}
                          className="w-4 h-4 text-emerald-600"
                        />
                        {value}
                      </label>
                    ))}
                    {resultForm.conclusion === "Không đạt" && (
                      <button
                        onClick={() => info("Mở báo cáo sự cố", "Hãy lập báo cáo sự cố và chuyển trạng thái thiết bị sang Tạm dừng")}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 animate-pulse"
                      >
                        + Lập Báo cáo sự cố
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <SmartTable
                  data={deviceResults}
                  columns={resultColumns}
                  keyField="id"
                  settingsKey={`device_${device.id}_maintenance_results`}
                  defaultPageSize={10}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
