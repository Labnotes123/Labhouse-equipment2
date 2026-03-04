import {
  X,
  Plus,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Download,
  Check,
} from "lucide-react";
import type { Device } from "@/lib/mockData";
import type { User } from "@/contexts/AuthContext";
import type { LiquidationProposal, WorkflowStatus } from "./DeviceProfileTab";

interface LiquidationModalProps {
  show: boolean;
  device: Device;
  user: User | null;
  viewMode: "list" | "form";
  filterStatus: string;
  liquidationForm: Partial<LiquidationProposal>;
  liquidationRecords: LiquidationProposal[];
  liquidationCounter: number;
  editingId: string | null;
  onClose: () => void;
  onViewModeChange: (mode: "list" | "form") => void;
  onFilterChange: (status: string) => void;
  onFormChange: (form: Partial<LiquidationProposal>) => void;
  onEditingChange: (id: string | null) => void;
  onSelectRecord: (record: LiquidationProposal) => void;
  onApproveRecord: (record: LiquidationProposal) => void;
  onSave: (status: WorkflowStatus) => void;
  getWorkflowStatusClass: (status: WorkflowStatus) => string;
  openPrintableWindow: (title: string, lines: string[]) => void;
  downloadCsvFile: (filename: string, headers: string[], rows: string[][], successMessage: string) => void;
}

export default function LiquidationModal({
  show,
  device,
  user,
  viewMode,
  filterStatus,
  liquidationForm,
  liquidationRecords,
  liquidationCounter,
  editingId,
  onClose,
  onViewModeChange,
  onFilterChange,
  onFormChange,
  onEditingChange,
  onSelectRecord,
  onApproveRecord,
  onSave,
  getWorkflowStatusClass,
  openPrintableWindow,
  downloadCsvFile,
}: LiquidationModalProps) {
  if (!show) return null;

  const deviceLiquidations = liquidationRecords.filter((record) => record.deviceId === device.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Thanh lý thiết bị</h2>
            <p className="text-sm text-slate-500">Quản lý phiếu thanh lý và phê duyệt</p>
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
                  <h3 className="font-semibold text-slate-800">Danh sách phiếu thanh lý</h3>
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
                        reason: "",
                        method: "",
                        estimatedValue: "",
                        plannedDate: "",
                        requestedBy: user?.fullName || "",
                        approver: "",
                        status: "Nháp",
                      });
                      onViewModeChange("form");
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Plus size={18} /> Tạo phiếu thanh lý
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã phiếu</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Lý do</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Phương thức</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày dự kiến</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deviceLiquidations
                      .filter((record) => filterStatus === "all" || record.status === filterStatus)
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-slate-700">{record.liquidationCode}</td>
                          <td className="px-4 py-3">{record.reason}</td>
                          <td className="px-4 py-3">{record.method}</td>
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
                                onClick={() => openPrintableWindow(`Phiếu thanh lý ${record.liquidationCode}`, [
                                  `Thiết bị: ${record.deviceCode} - ${record.deviceName}`,
                                  `Lý do: ${record.reason}`,
                                  `Phương thức: ${record.method}`,
                                  `Giá trị ước tính: ${record.estimatedValue}`,
                                  `Người đề nghị: ${record.requestedBy}`,
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
                                  `${record.liquidationCode}.csv`,
                                  ["Mã phiếu", "Thiết bị", "Lý do", "Phương thức", "Giá trị", "Trạng thái"],
                                  [[record.liquidationCode, `${record.deviceCode} - ${record.deviceName}`, record.reason, record.method, record.estimatedValue, record.status]],
                                  `Đã xuất phiếu ${record.liquidationCode}`
                                )}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Xuất Excel"
                              >
                                <Download size={16} />
                              </button>
                              {record.status === "Chờ duyệt" && (
                                <button
                                  onClick={() => onApproveRecord(record)}
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
                    {deviceLiquidations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có phiếu thanh lý</td>
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
                      ? liquidationRecords.find((record) => record.id === editingId)?.liquidationCode || ""
                      : `TL-${new Date().getFullYear()}-${String(liquidationCounter).padStart(3, "0")}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến thanh lý</label>
                  <input
                    type="date"
                    value={liquidationForm.plannedDate || ""}
                    onChange={(e) => onFormChange({ ...liquidationForm, plannedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lý do thanh lý</label>
                <textarea
                  value={liquidationForm.reason || ""}
                  onChange={(e) => onFormChange({ ...liquidationForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức thanh lý</label>
                  <input
                    type="text"
                    value={liquidationForm.method || ""}
                    onChange={(e) => onFormChange({ ...liquidationForm, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị ước tính (VND)</label>
                  <input
                    type="number"
                    value={liquidationForm.estimatedValue || ""}
                    onChange={(e) => onFormChange({ ...liquidationForm, estimatedValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người đề nghị</label>
                  <input
                    type="text"
                    value={liquidationForm.requestedBy || user?.fullName || ""}
                    onChange={(e) => onFormChange({ ...liquidationForm, requestedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt</label>
                  <input
                    type="text"
                    value={liquidationForm.approver || ""}
                    onChange={(e) => onFormChange({ ...liquidationForm, approver: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button onClick={() => onSave("Nháp")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Lưu nháp</button>
                <button onClick={() => onSave("Chờ duyệt")} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">Gửi phê duyệt</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
