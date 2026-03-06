import { useEffect, useMemo, useState, useRef } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
  X,
  Download,
  File,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Device, MOCK_USERS_LIST, AttachedFile } from "@/lib/mockData";
import { SmartTable, Column } from "@/components/SmartTable";
import { previewTicketCode } from "@/lib/ticket-code";

interface CalibrationModalProps {
  show: boolean;
  device: Device | null;
  onClose: () => void;
}

type CalibrationRequestStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Hoàn thành";

type CalibrationRequest = {
  id: string;
  requestCode: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  quantity: number;
  expectedDate: string;
  content: string;
  notes: string;
  approver: string;
  relatedUsers: string[];
  status: CalibrationRequestStatus;
  requestedBy: string;
  attachments: AttachedFile[];
};

type CalibrationSchedule = {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  scheduledDate: string;
  content: string;
  status: string;
  notes: string;
};

type CalibrationResult = {
  id: string;
  resultCode: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  manufacturer: string;
  executionDate: string;
  content: string;
  unit: string;
  result: string;
  standard: string;
  conclusion: "Đạt" | "Không đạt" | "";
};

export default function CalibrationModal({ show, device, onClose }: CalibrationModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [calibrationModalTab, setCalibrationModalTab] = useState<"request" | "schedule" | "result">("request");
  const [calibrationRequestViewMode, setCalibrationRequestViewMode] = useState<"list" | "form">("list");

  const [calibrationForm, setCalibrationForm] = useState<CalibrationRequest>({
    id: "",
    requestCode: "",
    deviceId: "",
    deviceName: "",
    deviceCode: "",
    serialNumber: "",
    quantity: 1,
    expectedDate: "",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189, Sở ban ngành.",
    notes: "",
    approver: "",
    relatedUsers: [],
    status: "Nháp",
    requestedBy: "",
    attachments: [],
  });
  const [calibrationRequests, setCalibrationRequests] = useState<CalibrationRequest[]>([]);

  const deviceRequests = useMemo(
    () => (device ? calibrationRequests.filter((request) => request.deviceId === device.id) : []),
    [calibrationRequests, device]
  );

  const nextRequestCode = useMemo(
    () => previewTicketCode(device?.code || device?.id || "NO-CODE", "PHC", deviceRequests.map((request) => request.requestCode)),
    [device?.code, device?.id, deviceRequests]
  );

  // Search states
  const [approverSearch, setApproverSearch] = useState("");
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [relatedUserSearch, setRelatedUserSearch] = useState("");
  const [showRelatedUserDropdown, setShowRelatedUserDropdown] = useState(false);
  const approverDropdownRef = useRef<HTMLDivElement>(null);
  const relatedUserDropdownRef = useRef<HTMLDivElement>(null);

  // Filter approvers (only managers)
  const approvers = MOCK_USERS_LIST.filter((u) =>
    ["Quản lý trang thiết bị", "Trưởng phòng xét nghiệm", "Admin", "Giám đốc"].includes(u.role)
  );
  const filteredApprovers = approvers.filter((a) =>
    a.fullName.toLowerCase().includes(approverSearch.toLowerCase())
  );

  // Filter all users for related users
  const allUsers = MOCK_USERS_LIST;
  const filteredRelatedUsers = allUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(relatedUserSearch.toLowerCase()) &&
      !(calibrationForm.relatedUsers || []).includes(u.fullName)
  );

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    reminderDays: 3,
    content: "",
    relatedUsers: [] as string[],
  });
  const [calibrationSchedules, setCalibrationSchedules] = useState<CalibrationSchedule[]>([]);

  const [showResultForm, setShowResultForm] = useState(false);
  const [resultForm, setResultForm] = useState<CalibrationResult>({
    id: "",
    resultCode: "",
    deviceId: "",
    deviceName: "",
    deviceCode: "",
    serialNumber: "",
    manufacturer: "",
    executionDate: "",
    content: "",
    unit: "",
    result: "",
    standard: "",
    conclusion: "",
  });
    const [showIncidentBypass, setShowIncidentBypass] = useState(false);
const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!device || !show) return;

    // Fetch calibration data for this device
    const fetchCalibrationData = async () => {
      try {
        // Fetch requests
        const requestsRes = await fetch(`/api/calibration-requests?deviceId=${device.id}`);
        const requestsData = await requestsRes.json();
        if (requestsData && Array.isArray(requestsData)) {
          setCalibrationRequests(requestsData);
        }

        // Fetch schedules
        const schedulesRes = await fetch(`/api/schedules?deviceId=${device.id}&type=Hiệu chuẩn`);
        const schedulesData = await schedulesRes.json();
        if (schedulesData && Array.isArray(schedulesData)) {
          setCalibrationSchedules(schedulesData);
        }

        // Fetch results
        const resultsRes = await fetch(`/api/calibration-results?deviceId=${device.id}`);
        const resultsData = await resultsRes.json();
        if (resultsData && Array.isArray(resultsData)) {
          setCalibrationResults(resultsData);
        }
      } catch (err) {
        console.error("Failed to fetch calibration data:", err);
      }
    };

    fetchCalibrationData();

    setCalibrationModalTab("request");
    setCalibrationRequestViewMode("list");
    setShowScheduleForm(false); success("Đã lên lịch hiệu chuẩn thành công");
    setShowResultForm(false);
    setCalibrationForm((prev) => ({
      ...prev,
      id: `req-${Date.now()}`,
      requestCode: nextRequestCode,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      serialNumber: device.serial,
      quantity: 1,
      expectedDate: "",
      content: prev.content || "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189, Sở ban ngành.",
      notes: "",
      approver: "",
      relatedUsers: [],
      attachments: [],
      status: "Nháp",
      requestedBy: user?.fullName || "",
    }));
    setScheduleForm({ scheduledDate: "", scheduledTime: "", reminderDays: 3, content: "", relatedUsers: [] });
    setResultForm({
      id: `result-${Date.now()}`,
      resultCode: `KQHC-${String(Date.now()).slice(-6)}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      serialNumber: device.serial,
      manufacturer: device.manufacturer,
      executionDate: "",
      content: "",
      unit: "",
      result: "",
      standard: "",
      conclusion: "",
    });
    
    // Reset search states
    setApproverSearch("");
    setRelatedUserSearch("");
    setShowApproverDropdown(false);
    setShowRelatedUserDropdown(false);
  }, [device, show, nextRequestCode, user?.fullName]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (approverDropdownRef.current && !approverDropdownRef.current.contains(event.target as Node)) {
        setShowApproverDropdown(false);
      }
      if (relatedUserDropdownRef.current && !relatedUserDropdownRef.current.contains(event.target as Node)) {
        setShowRelatedUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Define columns for SmartTable

  const requestColumns: Column<CalibrationRequest>[] = [
    { key: "requestCode", label: "Mã yêu cầu", sortable: true, filterable: true, render: (item) => <span className="font-mono text-purple-600">{item.requestCode}</span> },
    { key: "deviceName", label: "Tên thiết bị", sortable: true, filterable: true },
    { key: "deviceCode", label: "Mã thiết bị", sortable: true, filterable: true },
    { key: "serialNumber", label: "Serial", sortable: true, filterable: true },
    { key: "content", label: "Nội dung", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "Hoàn thành"
              ? "bg-green-100 text-green-700"
              : item.status === "Chờ duyệt"
              ? "bg-yellow-100 text-yellow-700"
              : item.status === "Đã duyệt"
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Xem chi tiết">
            <Eye size={16} />
          </button>
          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xuất PDF">
            <FileText size={16} />
          </button>
          {item.status === "Chờ duyệt" && (
            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Phê duyệt">
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const scheduleColumns: Column<CalibrationSchedule>[] = [
    { key: "deviceCode", label: "Mã thiết bị", sortable: true, filterable: true },
    { key: "type", label: "Nội dung", sortable: true, filterable: true },
    { key: "scheduledDate", label: "Ngày dự kiến", sortable: true, filterable: true, dateFilter: true },
    { key: "assignedTo", label: "Người phụ trách", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "Đã hoàn thành"
              ? "bg-green-100 text-green-700"
              : item.status === "Quá hạn"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const resultColumns: Column<CalibrationResult>[] = [
    { key: "resultCode", label: "Mã kết quả", sortable: true, filterable: true, render: (item) => <span className="font-mono text-purple-600">{item.resultCode}</span> },
    { key: "deviceCode", label: "Mã thiết bị", sortable: true, filterable: true },
    { key: "executionUnit", label: "Đơn vị thực hiện", sortable: true, filterable: true },
    { key: "executionDate", label: "Ngày thực hiện", sortable: true, filterable: true, dateFilter: true },
    {
      key: "conclusion",
      label: "Kết quả",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.conclusion === "Đạt" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {item.conclusion}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (!show || !device) return null;

  const handleSubmitRequest = (status: CalibrationRequestStatus) => {
    if (!calibrationForm.expectedDate || !calibrationForm.approver) {
      error("Lỗi", "Vui lòng chọn ngày dự kiến và người phê duyệt");
      return;
    }

    const request: CalibrationRequest = {
      ...calibrationForm,
      id: `req-${Date.now()}`,
      requestCode: nextRequestCode,
      status,
      requestedBy: calibrationForm.requestedBy || user?.fullName || "",
    };

    setCalibrationRequests((prev) => [...prev, request]);
    setCalibrationRequestViewMode("list");
    success("Thành công", status === "Chờ duyệt" ? `Đã gửi yêu cầu hiệu chuẩn ${nextRequestCode}` : "Đã lưu bản nháp yêu cầu hiệu chuẩn");
  };

  const handleAddRelatedUser = (userName: string) => {
    const current = calibrationForm.relatedUsers || [];
    if (!current.includes(userName)) {
      setCalibrationForm({ ...calibrationForm, relatedUsers: [...current, userName] });
    }
    setRelatedUserSearch("");
    setShowRelatedUserDropdown(false);
  };

  const handleRemoveRelatedUser = (userName: string) => {
    const current = calibrationForm.relatedUsers || [];
    setCalibrationForm({ ...calibrationForm, relatedUsers: current.filter((name) => name !== userName) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachedFile[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? "image" : "doc",
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    setCalibrationForm({
      ...calibrationForm,
      attachments: [...(calibrationForm.attachments || []), ...newAttachments],
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    setCalibrationForm({
      ...calibrationForm,
      attachments: (calibrationForm.attachments || []).filter((a) => a.id !== attId),
    });
  };

  const handleAddSchedule = () => {
    if (!scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      error("Lỗi", "Vui lòng chọn ngày và giờ hiệu chuẩn");
      return;
    }

    const schedule: CalibrationSchedule = {
      id: `schedule-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      scheduledDate: `${scheduleForm.scheduledDate} ${scheduleForm.scheduledTime}`,
      content: scheduleForm.content || "Lên lịch hiệu chuẩn",
      status: "Chờ thực hiện",
      notes: `Nhắc trước ${scheduleForm.reminderDays} ngày`,
    };

    setCalibrationSchedules((prev) => [...prev, schedule]);
    setShowScheduleForm(false); success("Đã lên lịch hiệu chuẩn thành công");
    success("Thành công", "Đã thêm lịch hiệu chuẩn");
  };

  const handleAddResult = () => {
    if (!resultForm.executionDate || !resultForm.conclusion) {
      error("Lỗi", "Vui lòng nhập ngày thực hiện và kết luận");
      return;
    }

    const result: CalibrationResult = {
      ...resultForm,
      id: `result-${Date.now()}`,
    };

    setCalibrationResults((prev) => [...prev, result]);
    setShowResultForm(false);
    success("Thành công", "Đã lưu kết quả hiệu chuẩn");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-[98vw] xl:max-w-[1600px] w-full min-h-[90vh] max-h-[98vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hiệu chuẩn thiết bị</h2>
            <p className="text-sm text-slate-500">Quản lý yêu cầu, lịch và kết quả hiệu chuẩn</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setCalibrationModalTab("request")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                calibrationModalTab === "request" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Yêu cầu hiệu chuẩn
            </button>
            <button
              onClick={() => setCalibrationModalTab("schedule")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                calibrationModalTab === "schedule" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Lịch hiệu chuẩn
            </button>
            <button
              onClick={() => setCalibrationModalTab("result")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                calibrationModalTab === "result" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Kết quả hiệu chuẩn
            </button>
          </div>

          {/* Request Tab */}
          {calibrationModalTab === "request" && (
            <div className="space-y-4">
              {calibrationRequestViewMode === "list" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Danh sách yêu cầu hiệu chuẩn</h3>
                      <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                    </div>
                    <button
                      onClick={() => setCalibrationRequestViewMode("form")}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <Plus size={16} /> Tạo yêu cầu
                    </button>
                  </div>

                  <div className="mt-4">
                    <SmartTable
                      data={calibrationRequests.filter((r) => r.deviceId === device.id)}
                      columns={requestColumns}
                      keyField="id"
                      settingsKey={`device_${device.id}_cal_requests`}
                      defaultPageSize={5}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCalibrationRequestViewMode("list")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <h3 className="font-semibold text-purple-800 text-lg">{device.name}</h3>
                    <p className="text-sm text-purple-600">{device.code} - {device.model} - Serial: {device.serial}</p>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="text-purple-500">Bộ phận:</span> <span className="font-medium">{device.specialty}</span></div>
                      <div><span className="text-purple-500">Nhà sản xuất:</span> <span className="font-medium">{device.manufacturer}</span></div>
                      <div><span className="text-purple-500">Tần suất HC:</span> <span className="font-medium">{device.calibrationFrequency || "—"}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mã yêu cầu hiệu chuẩn</label>
                      <input
                        type="text"
                        value={nextRequestCode}
                        readOnly
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến hiệu chuẩn <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={calibrationForm.expectedDate}
                        onChange={(e) => setCalibrationForm({ ...calibrationForm, expectedDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người đề xuất</label>
                      <input
                        type="text"
                        value={calibrationForm.requestedBy || user?.fullName || ""}
                        onChange={(e) => setCalibrationForm({ ...calibrationForm, requestedBy: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={calibrationForm.quantity}
                        onChange={(e) => setCalibrationForm({ ...calibrationForm, quantity: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung đề xuất</label>
                    <textarea
                      value={calibrationForm.content}
                      onChange={(e) => setCalibrationForm({ ...calibrationForm, content: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                    <textarea
                      value={calibrationForm.notes}
                      onChange={(e) => setCalibrationForm({ ...calibrationForm, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                      placeholder="Ghi chú thêm..."
                    />
                  </div>

                  {/* Người phê duyệt - Search/Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt <span className="text-red-500">*</span></label>
                    <div className="relative" ref={approverDropdownRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={approverSearch}
                          onChange={(e) => {
                            setApproverSearch(e.target.value);
                            setShowApproverDropdown(true);
                            if (!e.target.value) {
                              setCalibrationForm({ ...calibrationForm, approver: "" });
                            }
                          }}
                          onFocus={() => setShowApproverDropdown(true)}
                          placeholder="Gõ để tìm kiếm..."
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                        />
                      </div>
                      
                      {showApproverDropdown && filteredApprovers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredApprovers.map((approver) => (
                            <button
                              key={approver.id}
                              type="button"
                              onClick={() => {
                                setCalibrationForm({ ...calibrationForm, approver: approver.fullName });
                                setApproverSearch(approver.fullName);
                                setShowApproverDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-purple-50 text-sm ${
                                calibrationForm.approver === approver.fullName ? "bg-purple-50 text-purple-700 font-medium" : "text-slate-700"
                              }`}
                            >
                              {approver.fullName}
                              <span className="text-xs text-slate-400 ml-2">- {approver.role}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {calibrationForm.approver && !showApproverDropdown && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {calibrationForm.approver}
                            <button
                              type="button"
                              onClick={() => {
                                setCalibrationForm({ ...calibrationForm, approver: "" });
                                setApproverSearch("");
                              }}
                              className="ml-1 hover:text-purple-900"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Người liên quan - Search/Autocomplete với nút + */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người liên quan</label>
                    <div className="relative" ref={relatedUserDropdownRef}>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            value={relatedUserSearch}
                            onChange={(e) => {
                              setRelatedUserSearch(e.target.value);
                              setShowRelatedUserDropdown(true);
                            }}
                            onFocus={() => setShowRelatedUserDropdown(true)}
                            placeholder="Gõ để tìm kiếm..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (relatedUserSearch.trim()) {
                              handleAddRelatedUser(relatedUserSearch.trim());
                            }
                          }}
                          disabled={!relatedUserSearch.trim()}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Plus size={16} /> Thêm
                        </button>
                      </div>
                      
                      {showRelatedUserDropdown && filteredRelatedUsers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredRelatedUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleAddRelatedUser(u.fullName)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-slate-700"
                            >
                              {u.fullName}
                              <span className="text-xs text-slate-400 ml-2">- {u.role}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected related users */}
                    {(calibrationForm.relatedUsers || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {calibrationForm.relatedUsers.map((userName) => (
                          <span
                            key={userName}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {userName}
                            <button
                              type="button"
                              onClick={() => handleRemoveRelatedUser(userName)}
                              className="ml-1 hover:text-blue-900"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* File attachments */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm tài liệu</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        id="calibration-attachments"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="calibration-attachments" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Click để tải lên hoặc kéo thả file</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, Word, Images (max 10MB)</p>
                      </label>
                    </div>
                    
                    {/* Attached files list */}
                    {(calibrationForm.attachments || []).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {calibrationForm.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-2">
                              <File size={16} className="text-slate-500" />
                              <span className="text-sm text-slate-700">{att.name}</span>
                              <span className="text-xs text-slate-400">({formatFileSize(att.size)})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => window.open(att.url, "_blank")}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Xem file"
                              >
                                <Eye size={14} />
                              </button>
                              <a
                                href={att.url}
                                download={att.name}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Tải xuống"
                              >
                                <Download size={14} />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id || "")}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa file"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                      Hủy
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitRequest("Nháp")}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Save size={18} /> Lưu bản nháp
                      </button>
                      <button
                        onClick={() => handleSubmitRequest("Chờ duyệt")}
                        disabled={!calibrationForm.expectedDate || !calibrationForm.approver}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send size={18} /> Hoàn tất & Gửi phê duyệt
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {calibrationModalTab === "schedule" && (
            <div className="space-y-4">
              {!showScheduleForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">Lịch hiệu chuẩn - BM.08.QL.TC.018</h3>
                      <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                    </div>
                    <button
                      onClick={() => setShowScheduleForm(true)}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <Plus size={16} /> Lên lịch
                    </button>
                  </div>

                  {calibrationSchedules.filter((s) => s.deviceId === device.id).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Chưa có lịch hiệu chuẩn nào</p>
                      <p className="text-sm text-slate-400 mt-1">Lịch hiệu chuẩn sẽ hiển thị sau khi yêu cầu được phê duyệt</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <SmartTable
                        data={calibrationSchedules.filter((s) => s.deviceId === device.id)}
                        columns={scheduleColumns}
                        keyField="id"
                        settingsKey={`device_${device.id}_cal_schedules`}
                        defaultPageSize={10}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowScheduleForm(false)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Tạo lịch hiệu chuẩn</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hiệu chuẩn thực tế</label>
                          <input type="date" value={scheduleForm.scheduledDate} onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian</label>
                          <input type="time" value={scheduleForm.scheduledTime} onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung hiệu chuẩn</label>
                        <textarea value={scheduleForm.content} onChange={(e) => setScheduleForm({...scheduleForm, content: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={3}></textarea>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Người liên quan</label>
                          <input type="text" placeholder="Thêm người liên quan..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nhắc hẹn trước (ngày)</label>
                          <select value={scheduleForm.reminderDays} onChange={(e) => setScheduleForm({...scheduleForm, reminderDays: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                            <option value={1}>1 ngày</option>
                            <option value={3}>3 ngày</option>
                            <option value={5}>5 ngày</option>
                            <option value={7}>7 ngày</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button onClick={() => setShowScheduleForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Hủy</button>
                        <button onClick={() => {
                          // TODO: push to list
                          setCalibrationSchedules([...calibrationSchedules, {
                            id: `sch-${Date.now()}`,
                            deviceId: device.id,
                            deviceName: device.name,
                            deviceCode: device.code,
                            content: scheduleForm.content || "Hiệu chuẩn định kỳ",
                            scheduledDate: scheduleForm.scheduledDate,
                            status: "Chờ thực hiện",
                            notes: ""
                          }]);
                          setShowScheduleForm(false); success("Đã lên lịch hiệu chuẩn thành công");
                          setScheduleForm({scheduledDate: "", scheduledTime: "", reminderDays: 3, content: "", relatedUsers: []});
                        }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
                          <Save size={16} /> Lưu lịch
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Result Tab */}
          {calibrationModalTab === "result" && (
            <div className="space-y-4">
              {!showResultForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">Kết quả hiệu chuẩn - BM.09.QL.TC.018</h3>
                      <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                    </div>
                    <button
                      onClick={() => setShowResultForm(true)}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <Plus size={16} /> Xem xét kết quả hiệu chuẩn
                    </button>
                  </div>

                  {calibrationResults.filter((r) => r.deviceId === device.id).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Chưa có kết quả hiệu chuẩn nào</p>
                      <p className="text-sm text-slate-400 mt-1">Kết quả hiệu chuẩn sẽ hiển thị sau khi thực hiện hiệu chuẩn</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <SmartTable
                        data={calibrationResults.filter((r) => r.deviceId === device.id)}
                        columns={resultColumns}
                        keyField="id"
                        settingsKey={`device_${device.id}_cal_results`}
                        defaultPageSize={10}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowResultForm(false)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Biểu mẫu BM.09.QL.TC.018</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><span className="text-purple-500">Tên thiết bị:</span> <span className="font-medium">{device.name}</span></div>
                          <div><span className="text-purple-500">Mã thiết bị:</span> <span className="font-medium">{device.code}</span></div>
                          <div><span className="text-purple-500">Model:</span> <span className="font-medium">{device.model}</span></div>
                          <div><span className="text-purple-500">Serial:</span> <span className="font-medium">{device.serial}</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thực hiện</label>
                          <input type="date" value={resultForm.executionDate} onChange={(e) => setResultForm({...resultForm, executionDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                          <input type="text" value={resultForm.content} onChange={(e) => setResultForm({...resultForm, content: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị thực hiện</label>
                          <input type="text" value={resultForm.unit} onChange={(e) => setResultForm({...resultForm, unit: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu chuẩn</label>
                          <input type="text" value={resultForm.standard} onChange={(e) => setResultForm({...resultForm, standard: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kết quả đo chi tiết</label>
                          <input type="text" value={resultForm.result} onChange={(e) => setResultForm({...resultForm, result: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="VD: Độ lệch 0.01%, Nằm trong giới hạn cho phép..." />
                        </div>
                        <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                          <label className="block text-lg font-semibold text-slate-800 mb-3">Kết luận</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={resultForm.conclusion === "Đạt"} onChange={() => setResultForm({...resultForm, conclusion: "Đạt"})} name="conclusion" className="w-5 h-5 text-green-600 focus:ring-green-500" />
                              <span className="font-medium text-green-700">Đạt</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={resultForm.conclusion === "Không đạt"} onChange={() => setResultForm({...resultForm, conclusion: "Không đạt"})} name="conclusion" className="w-5 h-5 text-red-600 focus:ring-red-500" />
                              <span className="font-medium text-red-700">Không đạt</span>
                            </label>
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Đính kèm Chứng nhận (Bản Scan)</label>
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm border border-slate-200">
                              <Upload size={16} /> Chọn File PDF
                            </button>
                            <span className="text-xs text-slate-500">Chưa có file nào được chọn</span>
                          </div>
                   {/* Quy tắc 3 nút Đính kèm */}
                          <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <File size={20} className="text-red-500" />
                               <div>
                                 <p className="text-sm font-medium text-slate-700">ChungNhanHieuChuan_2026.pdf</p>
                                 <p className="text-xs text-slate-500">2.4 MB</p>
                               </div>
                             </div>
                             <div className="flex gap-2">
                               <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Xem trực tiếp"><Eye size={18}/></button>
                               <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Tải xuống"><Download size={18}/></button>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button onClick={() => setShowResultForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Hủy</button>
                        <button onClick={() => {
                          
                          const newResult = {
                            id: `res-${Date.now()}`,
                            resultCode: `KQ-${Date.now().toString().slice(-4)}`,
                            deviceId: device.id,
                            deviceName: device.name,
                            deviceCode: device.code,
                            serialNumber: device.serial,
                            manufacturer: device.manufacturer,
                            executionDate: resultForm.executionDate || "2026-03-06",
                            content: resultForm.content || "Hiệu chuẩn",
                            unit: resultForm.unit || "Trung tâm",
                            result: resultForm.result || "Tốt",
                            standard: resultForm.standard || "ISO",
                            conclusion: resultForm.conclusion || "Đạt",
                          };
                          setCalibrationResults([...calibrationResults, newResult]);
                          setShowResultForm(false);
                          
                          if (newResult.conclusion === "Không đạt") {
                            setShowIncidentBypass(true);
                          } else {
                            success("Đã lưu kết quả hiệu chuẩn");
                          }
                          
                          setResultForm({
                            id: "", resultCode: "", deviceId: "", deviceName: "", deviceCode: "", serialNumber: "", manufacturer: "", executionDate: "", content: "", unit: "", result: "", standard: "", conclusion: ""
                          });

                        }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
                          <Save size={16} /> Hoàn tất
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

      {/* Bypass to Incident Report Modal */}
      {showIncidentBypass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowIncidentBypass(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-4xl text-red-600">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Quy trình bắt buộc</h3>
            <p className="text-slate-600 mb-6">Thiết bị <strong>{device.name}</strong> không đạt hiệu chuẩn. Thông số nằm ngoài giới hạn an toàn. Bạn cần phải tạm dừng sử dụng và báo cáo sự cố ngay lập tức!</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowIncidentBypass(false);
                  onClose();
                  // In a real app we'd trigger the MainApp to open incident modal
                  // For now, emit a custom event or show a toast
                  const event = new CustomEvent('openIncidentReport', { detail: { deviceId: device.id } });
                  window.dispatchEvent(event);
                }}
                className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95"
              >
                🚨 BÁO CÁO SỰ CỐ NGAY
              </button>
              <button onClick={() => setShowIncidentBypass(false)} className="py-2 px-4 text-slate-500 hover:text-slate-700 font-medium">
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>
    </div>
  );
}
