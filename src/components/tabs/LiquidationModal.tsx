import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Edit,
  Eye,
  FileText,
  Download,
  Check,
  Paperclip,
  Trash2,
  Calendar,
  AlertTriangle,
  FileDown,
  Save
} from "lucide-react";
import type { Device } from "@/lib/mockData";
import type { User } from "@/contexts/AuthContext";
import type { LiquidationProposal, WorkflowStatus } from "./DeviceProfileTab";
import { SmartTable, Column } from "@/components/SmartTable";
import { useToast } from "@/contexts/ToastContext";
import { previewTicketCode } from "@/lib/ticket-code";

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
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<"proposal" | "official">("proposal");

  if (!show) return null;

  const deviceLiquidations = liquidationRecords.filter((record) => record.deviceId === device.id);
  const hasApprovedProposal = deviceLiquidations.some(r => r.status === "Đã duyệt" || r.status === "Hoàn thành");

  const fallbackLiquidationCode = `PTL-${new Date().getFullYear()}-${String(liquidationCounter).padStart(3, "0")}`;
  const nextLiquidationCode = previewTicketCode(
    device.code || device.id,
    "PTL",
    deviceLiquidations.map((record) => record.liquidationCode)
  ) || fallbackLiquidationCode;

  const proposalColumns: Column<LiquidationProposal>[] = [
    { key: "liquidationCode", label: "Mã phiếu", filterable: true, sortable: true },
    { key: "reason", label: "Lý do", filterable: true, sortable: true },
    { key: "method", label: "Phương án", filterable: true, sortable: true },
    { key: "plannedDate", label: "Ngày dự kiến", filterable: true, sortable: true },
    { 
      key: "status", 
      label: "Trạng thái", 
      filterable: true, 
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowStatusClass(item.status as WorkflowStatus)}`}>
          {item.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Thao tác",
      width: 200,
      render: (item) => (
        <div className="flex justify-center gap-2">
          {item.status === "Nháp" && (
            <button
              onClick={() => {
                onEditingChange(item.id);
                onFormChange({ ...item });
                onViewModeChange("form");
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Chỉnh sửa"
            >
              <Edit size={16} />
            </button>
          )}
          <button
            onClick={() => onSelectRecord(item)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          {item.status === "Chờ duyệt" && user?.role === "Giám đốc" && (
            <button
              onClick={() => {
                onApproveRecord(item);
                setTimeout(() => {
                  success("Đã phê duyệt thanh lý thiết bị. Trạng thái thiết bị đã chuyển sang Ngừng sử dụng.");
                }, 500);
              }}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              title="Phê duyệt"
            >
              <Check size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-[98vw] xl:max-w-[1600px] w-full min-h-[90vh] max-h-[98vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Thanh lý thiết bị: {device.name}</h2>
              <p className="text-sm text-slate-500">Mã: {device.code} | Serial: {device.serial}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-4">
          <button
            onClick={() => setActiveTab("proposal")}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "proposal"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            1. Đề xuất thanh lý (Xin phép)
          </button>
          <button
            onClick={() => setActiveTab("official")}
            disabled={!hasApprovedProposal}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "official"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            } ${!hasApprovedProposal ? "opacity-50 cursor-not-allowed" : ""}`}
            title={!hasApprovedProposal ? "Chỉ mở khi có thiết bị được duyệt thanh lý" : ""}
          >
            2. Hồ sơ thanh lý chính thức
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeTab === "proposal" && (
            viewMode === "list" ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500"/> Danh sách Đề xuất
                  </h3>
                  <button
                    onClick={() => {
                      onEditingChange(null);
                      onFormChange({
                        liquidationCode: nextLiquidationCode,
                        reason: "",
                        method: "Bán phế liệu",
                        estimatedValue: "",
                        plannedDate: "",
                        requestedBy: user?.fullName || "",
                        approver: "",
                        status: "Nháp",
                      });
                      onViewModeChange("form");
                    }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                  >
                    <Plus size={18} /> Tạo phiếu thanh lý
                  </button>
                </div>
                <div className="p-4">
                   <SmartTable
                      data={deviceLiquidations}
                      columns={proposalColumns}
                      keyField="id"
                      settingsKey={`device_${device.id}_liquidation_proposals`}
                      defaultPageSize={10}
                   />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">
                    {editingId ? "Cập nhật Phiếu thanh lý" : "Khởi tạo Phiếu đề xuất thanh lý"}
                  </h3>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-mono rounded-md shadow-sm">
                    {liquidationForm.liquidationCode || nextLiquidationCode}
                  </span>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Trích xuất lịch sử tự động */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between border-b pb-2">
                      <span>1. THÔNG TIN THIẾT BỊ (Tự động trích xuất)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1">Tên thiết bị</span>
                        <div className="font-medium text-slate-800">{device.name}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1">Mã thiết bị</span>
                        <div className="font-medium text-slate-800">{device.code}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1">Thời gian bắt đầu sử dụng</span>
                        <div className="font-medium text-slate-800">{device.usageStartDate || "N/A"}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1">Tình trạng hiện tại</span>
                        <div className="font-medium text-red-600">{device.status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Nhập liệu đánh giá */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between border-b pb-2">
                      <span>2. ĐÁNH GIÁ TÌNH TRẠNG & ĐỀ XUẤT</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Lý do thanh lý <span className="text-red-500">*</span></label>
                        <textarea
                          placeholder="VD: Hỏng mainboard, chi phí sửa bằng 80% mua mới..."
                          value={liquidationForm.reason || ""}
                          onChange={(e) => onFormChange({ reason: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow min-h-[80px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Đề xuất phương án <span className="text-red-500">*</span></label>
                          <select
                            value={liquidationForm.method || "Bán phế liệu"}
                            onChange={(e) => onFormChange({ method: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          >
                            <option value="Bán phế liệu">Bán phế liệu</option>
                            <option value="Tiêu hủy">Tiêu hủy</option>
                            <option value="Trả hãng">Trả hãng</option>
                            <option value="Chuyển giao">Chuyển giao</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị thu hồi dự kiến (nếu có)</label>
                          <input
                            type="text"
                            placeholder="VD: 5.000.000 VNĐ"
                            value={liquidationForm.estimatedValue || ""}
                            onChange={(e) => onFormChange({ estimatedValue: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Đính kèm */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-4 border-b pb-2">3. TÀI LIỆU CĂN CỨ KÈM THEO</h4>
                    <div className="border border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                      <Paperclip className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 mb-1">Kéo thả Biên bản đánh giá kỹ thuật của Hãng vào đây</p>
                      <p className="text-xs text-slate-500">Hỗ trợ PDF, JPG, PNG (Tối đa 5MB)</p>
                      <button className="mt-3 px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                        Chọn File tải lên
                      </button>
                    </div>
                  </div>
                  
                  {/* Phê duyệt */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <h4 className="text-sm font-semibold text-orange-800 mb-3">Luồng Phê duyệt</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-orange-800 mb-1">Người phê duyệt (Giám đốc)</label>
                        <select 
                          className="w-full px-3 py-2 border border-orange-200 bg-white rounded flex-1 focus:ring-orange-500"
                          value={liquidationForm.approver || ""}
                          onChange={(e) => onFormChange({ approver: e.target.value })}
                        >
                          <option value="">-- Chọn Giám đốc --</option>
                          <option value="Giám đốc A">Giám đốc A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-orange-800 mb-1">Người liên quan (Kế toán TS)</label>
                        <select className="w-full px-3 py-2 border border-orange-200 bg-white rounded flex-1 focus:ring-orange-500">
                          <option value="">-- Chọn Kế toán --</option>
                          <option value="Kế toán viên 1">Kế toán viên 1</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
                  <button
                    onClick={() => onViewModeChange("list")}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                        onSave("Nháp");
                        success("Đã lưu nháp phiếu thanh lý");
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium transition-colors"
                  >
                    Lưu nháp
                  </button>
                  <button
                    onClick={() => {
                        onSave("Chờ duyệt");
                        success(`Gửi đề xuất thanh lý ${liquidationForm.liquidationCode || 'thành công'}`);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm flex items-center gap-2"
                  >
                    <Check size={18} /> Gửi phê duyệt
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === "official" && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 shadow-sm flex items-start gap-4">
                 <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                    <Check size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-emerald-800 mb-1">Thiết bị đã được phê duyệt thanh lý</h3>
                    <p className="text-emerald-700 text-sm">Hãy hoàn tất hồ sơ pháp lý sau khi vật tư đã được di dời khỏi Lab.</p>
                 </div>
               </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-slate-800">Cập nhật Hồ sơ Thanh lý Cuối cùng</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Calendar size={16}/> Ngày thanh lý thực tế</label>
                              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị thu mua / Tiêu hủy</label>
                              <input type="text" placeholder="Tên công ty / Đơn vị tiếp nhận" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500" />
                           </div>
                           <div className="col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị thu hồi thực tế</label>
                              <input type="text" placeholder="VD: 5.500.000 VNĐ" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500" />
                           </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">CHỨNG TỪ BẮT BUỘC ĐÍNH KÈM (Lưu trữ vĩnh viễn)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                    <FileDown size={28} className="text-blue-500 mb-2"/>
                                    <span className="text-sm font-medium text-slate-700">Hợp đồng thanh lý</span>
                                    <span className="text-xs text-slate-500 mt-1">Bấm để tải lên PDF</span>
                                </div>
                                <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                    <FileDown size={28} className="text-purple-500 mb-2"/>
                                    <span className="text-sm font-medium text-slate-700">Hóa đơn tài chính</span>
                                    <span className="text-xs text-slate-500 mt-1">Bấm để tải lên PDF</span>
                                </div>
                                <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                    <FileDown size={28} className="text-emerald-500 mb-2"/>
                                    <span className="text-sm font-medium text-slate-700">Biên bản bàn giao</span>
                                    <span className="text-xs text-slate-500 mt-1">Bấm để tải lên PDF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                       <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm flex items-center gap-2">
                           <Save size={18} /> Chốt hồ sơ tài chính
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
