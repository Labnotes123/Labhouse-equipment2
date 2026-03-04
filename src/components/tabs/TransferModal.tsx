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
import type { TransferProposal, WorkflowStatus } from "./DeviceProfileTab";

interface TransferModalProps {
  show: boolean;
  device: Device;
  user: User | null;
  viewMode: "list" | "form";
  filterStatus: string;
  transferForm: Partial<TransferProposal>;
  transferRecords: TransferProposal[];
  transferCounter: number;
  editingId: string | null;
  onClose: () => void;
  onViewModeChange: (mode: "list" | "form") => void;
  onFilterChange: (status: string) => void;
  onFormChange: (form: Partial<TransferProposal>) => void;
  onEditingChange: (id: string | null) => void;
  onSelectRecord: (record: TransferProposal) => void;
  onApproveRecord: (record: TransferProposal) => void;
  onSaveTransfer: (status: WorkflowStatus) => void;
  getWorkflowStatusClass: (status: WorkflowStatus) => string;
  openPrintableWindow: (title: string, lines: string[]) => void;
  downloadCsvFile: (filename: string, headers: string[], rows: string[][], successMessage: string) => void;
}

export default function TransferModal({
  show,
  device,
  user,
  viewMode,
  filterStatus,
  transferForm,
  transferRecords,
  transferCounter,
  editingId,
  onClose,
  onViewModeChange,
  onFilterChange,
  onFormChange,
  onEditingChange,
  onSelectRecord,
  onApproveRecord,
  onSaveTransfer,
  getWorkflowStatusClass,
  openPrintableWindow,
  downloadCsvFile,
}: TransferModalProps) {
  if (!show) return null;

  const deviceTransfers = transferRecords.filter((record) => record.deviceId === device.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Điều chuyển thiết bị</h2>
            <p className="text-sm text-slate-500">Theo dõi phiếu điều chuyển và trạng thái phê duyệt</p>
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
                  <h3 className="font-semibold text-slate-800">Danh sách phiếu điều chuyển</h3>
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
                        fromLocation: device.location,
                        toLocation: "",
                        reason: "",
                        plannedTransferDate: "",
                        requestedBy: user?.fullName || "",
                        approver: "",
                        status: "Nháp",
                      });
                      onViewModeChange("form");
                    }}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2"
                  >
                    <Plus size={18} /> Tạo phiếu điều chuyển
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã phiếu</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Từ</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Đến</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày dự kiến</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deviceTransfers
                      .filter((record) => filterStatus === "all" || record.status === filterStatus)
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-cyan-700">{record.transferCode}</td>
                          <td className="px-4 py-3">{record.fromLocation}</td>
                          <td className="px-4 py-3">{record.toLocation}</td>
                          <td className="px-4 py-3">{record.plannedTransferDate || "—"}</td>
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
                                onClick={() => openPrintableWindow(`Phiếu điều chuyển ${record.transferCode}`, [
                                  `Thiết bị: ${record.deviceCode} - ${record.deviceName}`,
                                  `Từ: ${record.fromLocation}`,
                                  `Đến: ${record.toLocation}`,
                                  `Lý do: ${record.reason}`,
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
                                  `${record.transferCode}.csv`,
                                  ["Mã phiếu", "Thiết bị", "Từ", "Đến", "Ngày dự kiến", "Trạng thái"],
                                  [[record.transferCode, `${record.deviceCode} - ${record.deviceName}`, record.fromLocation, record.toLocation, record.plannedTransferDate, record.status]],
                                  `Đã xuất phiếu ${record.transferCode}`
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
                    {deviceTransfers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có phiếu điều chuyển</td>
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
                      ? transferRecords.find((record) => record.id === editingId)?.transferCode || ""
                      : `DC-${new Date().getFullYear()}-${String(transferCounter).padStart(3, "0")}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến điều chuyển</label>
                  <input
                    type="date"
                    value={transferForm.plannedTransferDate || ""}
                    onChange={(e) => onFormChange({ ...transferForm, plannedTransferDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Từ vị trí</label>
                  <input
                    type="text"
                    value={transferForm.fromLocation || device.location}
                    onChange={(e) => onFormChange({ ...transferForm, fromLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đến vị trí</label>
                  <input
                    type="text"
                    value={transferForm.toLocation || ""}
                    onChange={(e) => onFormChange({ ...transferForm, toLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lý do điều chuyển</label>
                <textarea
                  value={transferForm.reason || ""}
                  onChange={(e) => onFormChange({ ...transferForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người đề nghị</label>
                  <input
                    type="text"
                    value={transferForm.requestedBy || user?.fullName || ""}
                    onChange={(e) => onFormChange({ ...transferForm, requestedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt</label>
                  <input
                    type="text"
                    value={transferForm.approver || ""}
                    onChange={(e) => onFormChange({ ...transferForm, approver: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button onClick={() => onSaveTransfer("Nháp")} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Lưu nháp</button>
                <button onClick={() => onSaveTransfer("Chờ duyệt")} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">Gửi phê duyệt</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
