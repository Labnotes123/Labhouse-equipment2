import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  Plus,
  Save,
  Send,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Device, MOCK_USERS_LIST } from "@/lib/mockData";

interface MaintenanceModalProps {
  show: boolean;
  device: Device | null;
  onClose: () => void;
}

type MaintenanceStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Hoàn thành";

type MaintenanceRequest = {
  id: string;
  requestCode: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  issueDescription: string;
  proposedAction: string;
  priority: "Thấp" | "Trung bình" | "Cao";
  expectedDate: string;
  approver: string;
  status: MaintenanceStatus;
  requestedBy: string;
};

type MaintenanceSchedule = {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  scheduledDate: string;
  scheduledTime: string;
  technician: string;
  content: string;
  status: string;
};

type MaintenanceResult = {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  executionDate: string;
  workDone: string;
  partsReplaced: string;
  notes: string;
  nextDueDate: string;
  conclusion: "Hoàn tất" | "Cần theo dõi" | "Chưa đạt" | "";
};

export default function MaintenanceModal({ show, device, onClose }: MaintenanceModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [tab, setTab] = useState<"request" | "schedule" | "result">("request");
  const [requestView, setRequestView] = useState<"list" | "form">("list");

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [results, setResults] = useState<MaintenanceResult[]>([]);

  const [requestCounter, setRequestCounter] = useState(1);

  const [requestForm, setRequestForm] = useState<MaintenanceRequest | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Omit<MaintenanceSchedule, "id" | "deviceId" | "deviceName" | "deviceCode" | "status"> & { status?: string }>({
    scheduledDate: "",
    scheduledTime: "",
    technician: "",
    content: "",
    status: "Chờ thực hiện",
  });
  const [resultForm, setResultForm] = useState<Omit<MaintenanceResult, "id" | "deviceId" | "deviceName" | "deviceCode">>({
    executionDate: "",
    workDone: "",
    partsReplaced: "",
    notes: "",
    nextDueDate: "",
    conclusion: "",
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!device) return;
    setRequestForm({
      id: "",
      requestCode: "",
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      serialNumber: device.serial,
      issueDescription: "Bảo dưỡng định kỳ theo kế hoạch.",
      proposedAction: "Kiểm tra, vệ sinh, hiệu chỉnh nếu cần.",
      priority: "Trung bình",
      expectedDate: "",
      approver: "",
      status: "Nháp",
      requestedBy: user?.fullName || "",
    });
    setRequestView("list");
    setTab("request");
  }, [device, user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const deviceRequests = useMemo(() => (device ? requests.filter((r) => r.deviceId === device.id) : []), [device, requests]);
  const deviceSchedules = useMemo(() => (device ? schedules.filter((s) => s.deviceId === device.id) : []), [device, schedules]);
  const deviceResults = useMemo(() => (device ? results.filter((r) => r.deviceId === device.id) : []), [device, results]);

  if (!show || !device || !requestForm) return null;

  const currentRequestCode = `BD-${new Date().getFullYear()}-${String(requestCounter).padStart(3, "0")}`;

  const approvers = MOCK_USERS_LIST.filter((u) => ["Quản lý trang thiết bị", "Trưởng phòng xét nghiệm", "Admin"].includes(u.role));

  const handleSaveRequest = (finalStatus: MaintenanceStatus) => {
    if (!requestForm.expectedDate || !requestForm.approver) {
      error("Lỗi", "Vui lòng chọn ngày dự kiến và người phê duyệt");
      return;
    }

    const newRequest: MaintenanceRequest = {
      ...requestForm,
      id: `maint-${Date.now()}`,
      requestCode: currentRequestCode,
      status: finalStatus,
    };

    setRequests((prev) => [newRequest, ...prev]);
    setRequestCounter((prev) => prev + 1);
    success("Thành công", finalStatus === "Nháp" ? "Đã lưu phiếu bảo dưỡng" : "Đã gửi phiếu bảo dưỡng phê duyệt");
    setRequestView("list");
  };

  const handleAddSchedule = () => {
    if (!scheduleForm.scheduledDate || !scheduleForm.technician) {
      error("Lỗi", "Chọn ngày và kỹ thuật viên");
      return;
    }
    const newSchedule: MaintenanceSchedule = {
      id: `m-schedule-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      scheduledDate: scheduleForm.scheduledDate,
      scheduledTime: scheduleForm.scheduledTime,
      technician: scheduleForm.technician,
      content: scheduleForm.content || "Bảo dưỡng định kỳ",
      status: scheduleForm.status || "Chờ thực hiện",
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    success("Thành công", "Đã thêm lịch bảo dưỡng");
    setScheduleForm({ scheduledDate: "", scheduledTime: "", technician: "", content: "", status: "Chờ thực hiện" });
  };

  const handleAddResult = () => {
    if (!resultForm.executionDate || !resultForm.conclusion) {
      error("Lỗi", "Nhập ngày thực hiện và kết luận");
      return;
    }
    const newResult: MaintenanceResult = {
      id: `m-result-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      executionDate: resultForm.executionDate,
      workDone: resultForm.workDone,
      partsReplaced: resultForm.partsReplaced,
      notes: resultForm.notes,
      nextDueDate: resultForm.nextDueDate,
      conclusion: resultForm.conclusion,
    };
    setResults((prev) => [newResult, ...prev]);
    success("Thành công", "Đã lưu kết quả bảo dưỡng");
    setResultForm({ executionDate: "", workDone: "", partsReplaced: "", notes: "", nextDueDate: "", conclusion: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Phiếu bảo dưỡng thiết bị</h2>
            <p className="text-sm text-slate-500">{device.name} • {device.code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("request")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                tab === "request" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardList className="w-4 h-4 inline-block mr-2" />
              Yêu cầu bảo dưỡng
            </button>
            <button
              onClick={() => setTab("schedule")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                tab === "schedule" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Calendar className="w-4 h-4 inline-block mr-2" />
              Lịch bảo dưỡng
            </button>
            <button
              onClick={() => setTab("result")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                tab === "result" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 inline-block mr-2" />
              Kết quả bảo dưỡng
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {tab === "request" && (
            requestView === "list" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Danh sách yêu cầu</h3>
                    <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                  </div>
                  <button
                    onClick={() => setRequestView("form")}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                  >
                    <Plus size={18} /> Tạo phiếu bảo dưỡng
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã phiếu</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Mô tả</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Ưu tiên</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày dự kiến</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deviceRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Chưa có phiếu bảo dưỡng</p>
                          </td>
                        </tr>
                      ) : (
                        deviceRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-orange-600">{req.requestCode}</td>
                            <td className="px-4 py-3">{req.issueDescription}</td>
                            <td className="px-4 py-3">{req.priority}</td>
                            <td className="px-4 py-3">{req.expectedDate}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                req.status === "Hoàn thành"
                                  ? "bg-green-100 text-green-700"
                                  : req.status === "Đã duyệt"
                                    ? "bg-blue-100 text-blue-700"
                                    : req.status === "Chờ duyệt"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-700"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setRequestView("list")}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                  <ChevronRight className="rotate-180" size={20} /> Quay lại danh sách
                </button>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <h3 className="font-semibold text-orange-800 text-lg">{device.name}</h3>
                  <p className="text-sm text-orange-600">{device.code} - Serial: {device.serial}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã phiếu</label>
                    <input
                      type="text"
                      value={currentRequestCode}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến</label>
                    <input
                      type="date"
                      value={requestForm.expectedDate}
                      onChange={(e) => setRequestForm({ ...requestForm, expectedDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ưu tiên</label>
                    <select
                      value={requestForm.priority}
                      onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as MaintenanceRequest["priority"] })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    >
                      <option value="Thấp">Thấp</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cao">Cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người đề xuất</label>
                    <input
                      type="text"
                      value={requestForm.requestedBy}
                      onChange={(e) => setRequestForm({ ...requestForm, requestedBy: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả tình trạng</label>
                  <textarea
                    value={requestForm.issueDescription}
                    onChange={(e) => setRequestForm({ ...requestForm, issueDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hành động đề xuất</label>
                  <textarea
                    value={requestForm.proposedAction}
                    onChange={(e) => setRequestForm({ ...requestForm, proposedAction: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Người phê duyệt</label>
                  <div className="flex flex-wrap gap-2">
                    {approvers.map((approver) => (
                      <button
                        key={approver.id}
                        type="button"
                        onClick={() => setRequestForm({ ...requestForm, approver: approver.fullName })}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          requestForm.approver === approver.fullName
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-orange-50"
                        }`}
                      >
                        {approver.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <button onClick={() => setRequestView("list")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                    Hủy
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveRequest("Nháp")}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Save size={18} /> Lưu nháp
                    </button>
                    <button
                      onClick={() => handleSaveRequest("Chờ duyệt")}
                      disabled={!requestForm.expectedDate || !requestForm.approver}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={18} /> Gửi phê duyệt
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {tab === "schedule" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Lịch bảo dưỡng</h3>
                <button
                  onClick={handleAddSchedule}
                  className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center gap-1"
                >
                  <Plus size={16} /> Thêm lịch
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày</label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giờ</label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kỹ thuật viên</label>
                  <input
                    type="text"
                    value={scheduleForm.technician}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, technician: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                  <input
                    type="text"
                    value={scheduleForm.content}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Bảo dưỡng định kỳ..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Kỹ thuật viên</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Nội dung</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deviceSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p>Chưa có lịch bảo dưỡng</p>
                        </td>
                      </tr>
                    ) : (
                      deviceSchedules.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{s.scheduledDate} {s.scheduledTime}</td>
                          <td className="px-4 py-3">{s.technician}</td>
                          <td className="px-4 py-3">{s.content}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{s.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "result" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Kết quả bảo dưỡng</h3>
                <button
                  onClick={handleAddResult}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-1"
                >
                  <Plus size={16} /> Lưu kết quả
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thực hiện</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Công việc đã thực hiện</label>
                <textarea
                  value={resultForm.workDone}
                  onChange={(e) => setResultForm({ ...resultForm, workDone: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                  placeholder="Vệ sinh, thay mỡ, kiểm tra hiệu suất..."
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  value={resultForm.notes}
                  onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kết luận</label>
                <div className="flex gap-3">
                  {["Hoàn tất", "Cần theo dõi", "Chưa đạt"].map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="maint-conclusion"
                        value={value}
                        checked={resultForm.conclusion === value}
                        onChange={() => setResultForm({ ...resultForm, conclusion: value as MaintenanceResult["conclusion"] })}
                        className="w-4 h-4 text-green-600"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Công việc</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Kết luận</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Lịch tiếp theo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deviceResults.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p>Chưa có kết quả bảo dưỡng</p>
                        </td>
                      </tr>
                    ) : (
                      deviceResults.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{r.executionDate}</td>
                          <td className="px-4 py-3">{r.workDone || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.conclusion === "Hoàn tất"
                                ? "bg-green-100 text-green-700"
                                : r.conclusion === "Cần theo dõi"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}>
                              {r.conclusion}
                            </span>
                          </td>
                          <td className="px-4 py-3">{r.nextDueDate || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
