import { useState } from "react";
import {
  X,
  Plus,
  ChevronRight,
  Edit,
  Eye,
  Download,
  Check,
  Paperclip,
  ArrowRightLeft,
} from "lucide-react";
import type { Device } from "@/lib/mockData";
import type { User } from "@/contexts/AuthContext";
import type { TransferProposal, WorkflowStatus } from "./DeviceProfileTab";
import { SmartTable, Column } from "@/components/SmartTable";

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
  const [activeTab, setActiveTab] = useState<"proposal" | "history">("proposal");
  if (!show) return null;

  const deviceTransfers = transferRecords.filter((record) => record.deviceId === device.id);

  const proposalColumns: Column<TransferProposal>[] = [
    { key: "transferCode", label: "Mã phiếu", sortable: true, filterable: true },
    { key: "fromLocation", label: "Từ", sortable: true, filterable: true },
    { key: "toLocation", label: "Đến", sortable: true, filterable: true },
    { key: "plannedTransferDate", label: "Ngày đi", sortable: true, filterable: true, dateFilter: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowStatusClass(item.status as WorkflowStatus)}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              onEditingChange(item.id);
              onFormChange({ ...item });
              onViewModeChange("form");
              setActiveTab("proposal");
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onSelectRecord(item)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
            title="Xem"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() =>
              downloadCsvFile(
                `${item.transferCode}.csv`,
                ["Mã phiếu", "Thiết bị", "Từ", "Đến", "Ngày đi", "Trạng thái"],
                [[item.transferCode, `${item.deviceCode} - ${item.deviceName}`, item.fromLocation, item.toLocation, item.plannedTransferDate, item.status]],
                `Đã xuất phiếu ${item.transferCode}`
              )
            }
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
            title="Xuất Excel"
          >
            <Download size={16} />
          </button>
          {item.status === "Chờ duyệt" && (
            <button
              onClick={() => onApproveRecord(item)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              title="Phê duyệt"
            >
              <Check size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const historyColumns: Column<TransferProposal>[] = [
    { key: "transferCode", label: "Mã phiếu", sortable: true, filterable: true },
    { key: "plannedTransferDate", label: "Ngày đi", sortable: true, filterable: true, dateFilter: true },
    { key: "returnDate", label: "Ngày về", sortable: true, filterable: true, dateFilter: true, render: (item) => (item as any).returnDate || "—" },
    { key: "toLocation", label: "Điểm đến", sortable: true, filterable: true },
    { key: "reason", label: "Lý do", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowStatusClass(item.status as WorkflowStatus)}`}>
          {item.status === "Hoàn thành" ? "Đã trả" : item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Biên bản",
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onSelectRecord(item)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
            title="Xem phiếu"
          >
            <Eye size={16} />
          </button>
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Tải biên bản bàn giao">
            <Download size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-[98vw] xl:max-w-[1900px] w-full min-h-[90vh] max-h-[98vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <ArrowRightLeft size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Điều chuyển thiết bị</h2>
              <p className="text-sm text-slate-500">Theo dõi phiếu điều chuyển và biên bản vận chuyển</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-4">
          <button
            onClick={() => setActiveTab("proposal")}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "proposal" ? "border-cyan-600 text-cyan-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            1. Đề xuất điều chuyển
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "history" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            2. Lịch sử điều chuyển
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(98vh-160px)] bg-slate-50">
          {activeTab === "proposal" && (
            <div className="space-y-4">
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
                          const year = new Date().getFullYear();
                          onFormChange({
                            transferCode: `PDC-${year}-${String(transferCounter).padStart(3, "0")}`,
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
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2 shadow-sm"
                      >
                        <Plus size={18} /> Tạo phiếu điều chuyển
                      </button>
                    </div>
                  </div>

                  <SmartTable
                    data={deviceTransfers.filter((record) => filterStatus === "all" || record.status === filterStatus)}
                    columns={proposalColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_transfer_proposals`}
                    defaultPageSize={10}
                  />
                </>
              ) : (
                <div className="space-y-6 max-w-[98vw] xl:max-w-[1600px] mx-auto">
                  <button onClick={() => onViewModeChange("list")} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                    <ChevronRight className="rotate-180" size={20} /> Quay lại danh sách
                  </button>

                  {/* Device info snapshot */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Tên thiết bị", device.name, "Mã thiết bị", device.code, "Serial", device.serial, "Vị trí hiện tại", device.location].map((val, idx) => (
                      idx % 2 === 0 ? null : (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                          <span className="text-xs text-slate-500 block mb-1">{["Tên thiết bị", "Mã thiết bị", "Serial", "Vị trí hiện tại"][Math.floor(idx/2)]}</span>
                          <div className="text-sm font-semibold text-slate-800">{val || "N/A"}</div>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Form */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800">Phiếu đề xuất điều chuyển</h3>
                      <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono rounded-md shadow-sm">
                        {transferForm.transferCode || `PDC-${new Date().getFullYear()}-${String(transferCounter).padStart(3, "0")}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí điều chuyển đến *</label>
                        <input
                          type="text"
                          placeholder="Chọn chi nhánh/khoa phòng hoặc nhập tên đơn vị"
                          value={transferForm.toLocation || ""}
                          onChange={(e) => onFormChange({ ...transferForm, toLocation: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người nhận / Phụ trách mới</label>
                        <input
                          type="text"
                          placeholder="Chọn nội bộ hoặc nhập tên"
                          value={(transferForm as any).recipient || ""}
                          onChange={(e) => onFormChange({ ...transferForm, recipient: e.target.value } as TransferProposal)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian đi *</label>
                        <input
                          type="datetime-local"
                          value={transferForm.plannedTransferDate || ""}
                          onChange={(e) => onFormChange({ ...transferForm, plannedTransferDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian dự kiến trả</label>
                        <input
                          type="datetime-local"
                          value={(transferForm as any).returnDate || ""}
                          onChange={(e) => onFormChange({ ...transferForm, returnDate: e.target.value } as TransferProposal)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Lý do điều chuyển *</label>
                      <textarea
                        value={transferForm.reason || ""}
                        onChange={(e) => onFormChange({ ...transferForm, reason: e.target.value })}
                        rows={3}
                        placeholder="Ví dụ: Mang đi triển lãm, gửi hãng bảo hành dài ngày..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Tài liệu đính kèm (Công văn xin mượn/bảo hành)</h4>
                      <div className="border border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 flex flex-col items-center gap-2 text-center">
                        <Paperclip className="h-7 w-7 text-slate-400" />
                        <p className="text-sm text-slate-700">Kéo thả file hoặc bấm để tải lên</p>
                        <p className="text-xs text-slate-500">PDF, JPG, PNG &lt; 10MB</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button className="px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100">Tải lên</button>
                          <button className="px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 flex items-center gap-1 text-purple-600">
                            <Eye size={16} /> Xem
                          </button>
                          <button className="px-3 py-2 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 flex items-center gap-1 text-emerald-600">
                            <Download size={16} /> Tải về
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người phê duyệt</label>
                        <input
                          type="text"
                          placeholder="Chọn Giám đốc / QLTB"
                          value={transferForm.approver || ""}
                          onChange={(e) => onFormChange({ ...transferForm, approver: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người liên quan</label>
                        <input
                          type="text"
                          placeholder="Kế toán, QC, ..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                      <button onClick={() => onViewModeChange("list")} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">Hủy</button>
                      <button onClick={() => onSaveTransfer("Nháp")} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Lưu nháp</button>
                      <button onClick={() => onSaveTransfer("Chờ duyệt")} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2">
                        <Check size={18} /> Gửi phê duyệt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Lịch sử điều chuyển & Biên bản</h3>
                <p className="text-sm text-slate-500">Lưu vết toàn bộ chuyến đi của thiết bị</p>
              </div>

              <SmartTable
                data={deviceTransfers}
                columns={historyColumns}
                keyField="id"
                settingsKey={`device_${device.id}_transfer_history`}
                defaultPageSize={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
