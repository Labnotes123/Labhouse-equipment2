import {
  X,
  Plus,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Download,
} from "lucide-react";
import type { Device } from "@/lib/mockData";
import type { TrainingProposal, WorkflowStatus } from "./DeviceProfileTab";

interface TrainingModalProps {
  show: boolean;
  device: Device;
  viewMode: "list" | "form";
  filterStatus: string;
  trainingForm: Partial<TrainingProposal>;
  trainingRecords: TrainingProposal[];
  trainingCounter: number;
  editingId: string | null;
  onClose: () => void;
  onViewModeChange: (mode: "list" | "form") => void;
  onFilterChange: (status: string) => void;
  onFormChange: (form: Partial<TrainingProposal>) => void;
  onEditingChange: (id: string | null) => void;
  onSelectRecord: (record: TrainingProposal) => void;
  onSave: (status: WorkflowStatus) => void;
  getWorkflowStatusClass: (status: WorkflowStatus) => string;
  openPrintableWindow: (title: string, lines: string[]) => void;
  downloadCsvFile: (filename: string, headers: string[], rows: string[][], successMessage: string) => void;
}

export default function TrainingModal({
  show,
  device,
  viewMode,
  filterStatus,
  trainingForm,
  trainingRecords,
  trainingCounter,
  editingId,
  onClose,
  onViewModeChange,
  onFilterChange,
  onFormChange,
  onEditingChange,
  onSelectRecord,
  onSave,
  getWorkflowStatusClass,
  openPrintableWindow,
  downloadCsvFile,
}: TrainingModalProps) {
  if (!show) return null;

  const deviceTraining = trainingRecords.filter((record) => record.deviceId === device.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Đào tạo vận hành thiết bị</h2>
            <p className="text-sm text-slate-500">Lập và theo dõi phiếu đào tạo người sử dụng</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {viewMode === "list" ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Danh sách phiếu đào tạo</h3>
                  <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Nháp">Nháp</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                  <button
                    onClick={() => {
                      onEditingChange(null);
                      onFormChange({
                        topic: "",
                        trainer: "",
                        traineeGroup: "",
                        plannedDate: "",
                        approver: "",
                        status: "Nháp",
                      });
                      onViewModeChange("form");
                    }}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                  >
                    <Plus size={18} /> Tạo phiếu đào tạo
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã phiếu</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Nội dung</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Giảng viên</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày dự kiến</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deviceTraining
                      .filter((record) => filterStatus === "all" || record.status === filterStatus)
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-indigo-700">{record.trainingCode}</td>
                          <td className="px-4 py-3">{record.topic}</td>
                          <td className="px-4 py-3">{record.trainer}</td>
                          <td className="px-4 py-3">{record.plannedDate || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowStatusClass(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  onEditingChange(record.id);
                                  onFormChange({ ...record });
                                  onViewModeChange("form");
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => onSelectRecord(record)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                title="Xem"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openPrintableWindow(`Phiếu đào tạo ${record.trainingCode}`, [
                                  `Thiết bị: ${record.deviceCode} - ${record.deviceName}`,
                                  `Nội dung: ${record.topic}`,
                                  `Giảng viên: ${record.trainer}`,
                                  `Nhóm học viên: ${record.traineeGroup}`,
                                  `Ngày dự kiến: ${record.plannedDate}`,
                                  `Người duyệt: ${record.approver}`,
                                  `Trạng thái: ${record.status}`,
                                ])}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Xuất PDF"
                              >
                                <FileText size={16} />
                              </button>
                              <button
                                onClick={() => downloadCsvFile(
                                  `${record.trainingCode}.csv`,
                                  ["Mã phiếu", "Thiết bị", "Nội dung", "Giảng viên", "Học viên", "Trạng thái"],
                                  [[record.trainingCode, `${record.deviceCode} - ${record.deviceName}`, record.topic, record.trainer, record.traineeGroup, record.status]],
                                  `Đã xuất phiếu ${record.trainingCode}`
                                )}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Xuất Excel"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {deviceTraining.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có phiếu đào tạo</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => onViewModeChange("list")} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                <ChevronRight className="rotate-180" size={20} /> Quay lại danh sách
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã phiếu</label>
                  <input
                    type="text"
                    readOnly
                    value={editingId
                      ? trainingRecords.find((record) => record.id === editingId)?.trainingCode || ""
                      : `DT-${new Date().getFullYear()}-${String(trainingCounter).padStart(3, "0")}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến đào tạo</label>
                  <input
                    type="date"
                    value={trainingForm.plannedDate || ""}
                    onChange={(e) => onFormChange({ ...trainingForm, plannedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung đào tạo</label>
                <textarea
                  value={trainingForm.topic || ""}
                  onChange={(e) => onFormChange({ ...trainingForm, topic: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giảng viên</label>
                  <input
                    type="text"
                    value={trainingForm.trainer || ""}
                    onChange={(e) => onFormChange({ ...trainingForm, trainer: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm học viên</label>
                  <input
                    type="text"
                    value={trainingForm.traineeGroup || ""}
                    onChange={(e) => onFormChange({ ...trainingForm, traineeGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt</label>
                <input
                  type="text"
                  value={trainingForm.approver || ""}
                  onChange={(e) => onFormChange({ ...trainingForm, approver: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button onClick={() => onSave("Nháp")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Lưu nháp</button>
                <button onClick={() => onSave("Chờ duyệt")} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Gửi phê duyệt</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
