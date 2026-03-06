import { ListChecks, Table, Truck, Search, Upload, ClipboardCheck, Eye, Download, Edit, CheckCircle2, Trash2 } from "lucide-react";
import WheelDateTimePicker from "@/components/WheelDateTimePicker";
import { Device, AttachedFile } from "@/lib/mockData";
import type { ReturnAcceptanceRecord, ReturnAcceptanceFormState, ReturnAcceptanceTab, ReturnTransportRow } from "./DeviceProfileTab";

interface Props {
  returnAcceptanceTab: ReturnAcceptanceTab;
  onChangeTab: (tab: ReturnAcceptanceTab) => void;
  returnAcceptanceDevices: Device[];
  resolvedDevice: Device | null;
  currentRecord: ReturnAcceptanceRecord;
  onSelectDevice: (deviceId: string | null) => void;
  onUpdateHandoverCode: (value: string) => void;
  onUploadHandoverFiles: () => void;
  onOpenForm: (device: Device, existing?: ReturnAcceptanceFormState) => void;
  onDownloadFormPdf: (form: ReturnAcceptanceFormState, device: Device) => void;
  onOpenAttachments: (title: string, files: AttachedFile[]) => void;
  onViewAttachment: (file: AttachedFile) => void;
  onDownloadAttachment: (file: AttachedFile) => void;
  onRemoveHandoverFile: (fileId: string) => void;
  onCompleteAcceptance: (deviceId: string) => void;
  canComplete: boolean;
  filteredReturnTransportRows: ReturnTransportRow[];
  returnTransportFilterFrom: string;
  returnTransportFilterTo: string;
  onChangeFilterFrom: (value: string) => void;
  onChangeFilterTo: (value: string) => void;
  onExportTransport: () => void;
  formatDateTimeLabel: (value: string) => string;
}

export function ReturnAcceptanceSection({
  returnAcceptanceTab,
  onChangeTab,
  returnAcceptanceDevices,
  resolvedDevice,
  currentRecord,
  onSelectDevice,
  onUpdateHandoverCode,
  onUploadHandoverFiles,
  onOpenForm,
  onDownloadFormPdf,
  onOpenAttachments,
  onViewAttachment,
  onDownloadAttachment,
  onRemoveHandoverFile,
  onCompleteAcceptance,
  canComplete,
  filteredReturnTransportRows,
  returnTransportFilterFrom,
  returnTransportFilterTo,
  onChangeFilterFrom,
  onChangeFilterTo,
  onExportTransport,
  formatDateTimeLabel,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label className="text-xs text-slate-500 font-bold">Thiết bị cần tiếp nhận trở lại</label>
            <select
              value={resolvedDevice?.id || ""}
              onChange={(event) => onSelectDevice(event.target.value || null)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="">-- Chọn thiết bị --</option>
              {returnAcceptanceDevices.map((device) => (
                <option key={device.id} value={device.id}>{device.code} - {device.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inner Tabs - Pill Style */}
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => onChangeTab("checklist")}
            className={`px-5 py-2 font-bold text-sm rounded-lg transition ${returnAcceptanceTab === "checklist" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-blue-600"}`}
          >
            <ListChecks size={15} className="inline mr-1.5 -mt-0.5" />
            Checklist Tài liệu
          </button>
          <button
            onClick={() => onChangeTab("transport")}
            className={`px-5 py-2 font-bold text-sm rounded-lg transition ${returnAcceptanceTab === "transport" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-blue-600"}`}
          >
            <Table size={15} className="inline mr-1.5 -mt-0.5" />
            Sổ Ghi nhận VC (BM.07)
          </button>
        </div>

        {resolvedDevice ? (
          <>
            {returnAcceptanceTab === "checklist" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Return Item 1: Phiếu bàn giao */}
                <div className="flex justify-between items-center p-[18px_20px] rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300" style={{boxShadow: "0 2px 4px rgba(0,0,0,0.02)"}}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${(currentRecord.handoverCode.trim() || currentRecord.handoverFiles.length > 0) ? "bg-amber-100 text-amber-500" : "bg-red-100 text-red-500"}`}>
                      <Truck size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-sm">1. Phiếu bàn giao thiết bị</div>
                      <div className="text-xs text-slate-500 mt-0.5">{(currentRecord.handoverCode.trim() || currentRecord.handoverFiles.length > 0) ? "Đã có dữ liệu" : "Từ bên sửa chữa/cho mượn"}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1.5">
                      <Search size={12} className="text-slate-400" />
                      <input
                        value={currentRecord.handoverCode}
                        onChange={(event) => onUpdateHandoverCode(event.target.value)}
                        placeholder="Tìm ID phiếu..."
                        className="border-none outline-none w-24 text-xs bg-transparent"
                      />
                    </div>
                    <button
                      onClick={onUploadHandoverFiles}
                      className="px-3 py-2 rounded-lg bg-sky-100 text-sky-700 text-sm font-bold hover:bg-sky-600 hover:text-white transition flex items-center gap-1.5"
                    >
                      <Upload size={14} /> Đính kèm
                    </button>
                  </div>
                </div>

                {/* Return Item 2: Phiếu tiếp nhận */}
                <div className="flex justify-between items-center p-[18px_20px] rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300" style={{boxShadow: "0 2px 4px rgba(0,0,0,0.02)"}}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${currentRecord.acceptanceForm?.completed ? "bg-green-100 text-emerald-500" : "bg-red-100 text-red-500"}`}>
                      <ClipboardCheck size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-sm">2. Phiếu tiếp nhận</div>
                      <div className="text-xs text-slate-500 mt-0.5">{currentRecord.acceptanceForm?.completed ? "Đã hoàn tất" : "Lập phiếu PTN trên hệ thống"}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentRecord.acceptanceForm ? (
                      <>
                        <button
                          onClick={() => onOpenForm(resolvedDevice, currentRecord.acceptanceForm)}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                        >
                          <Edit size={14} /> Sửa
                        </button>
                        <button
                          onClick={() => onDownloadFormPdf(currentRecord.acceptanceForm!, resolvedDevice)}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                        >
                          <Download size={14} /> Tải PDF
                        </button>
                        <button
                          onClick={() => onOpenAttachments(`Đính kèm ${currentRecord.acceptanceForm?.formCode || ""}`, currentRecord.acceptanceForm?.attachments || [])}
                          disabled={(currentRecord.acceptanceForm?.attachments || []).length === 0}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-blue-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Eye size={14} /> Xem
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onOpenForm(resolvedDevice)}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
                      >
                        <Edit size={14} /> Tạo phiếu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Return Handover Files Display */}
            {returnAcceptanceTab === "checklist" && currentRecord.handoverFiles.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-3 space-y-1.5 mt-3">
                <p className="text-xs font-bold text-slate-500 mb-1">File phiếu bàn giao:</p>
                {currentRecord.handoverFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                    <span className="truncate pr-2">{file.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onViewAttachment(file)} className="p-1 rounded hover:bg-slate-200"><Eye size={13} /></button>
                      <button onClick={() => onDownloadAttachment(file)} className="p-1 rounded hover:bg-slate-200"><Download size={13} /></button>
                      <button onClick={() => onRemoveHandoverFile(file.id || "")} className="p-1 rounded hover:bg-slate-200 text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Complete Return Acceptance Button */}
            {returnAcceptanceTab === "checklist" && (
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => resolvedDevice && onCompleteAcceptance(resolvedDevice.id)}
                  disabled={!resolvedDevice || !canComplete}
                  className="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                  style={{boxShadow: "0 4px 10px rgba(16,185,129,0.3)"}}
                >
                  <CheckCircle2 size={18} />
                  Hoàn tất tiếp nhận trở lại
                </button>
              </div>
            )}

            {returnAcceptanceTab === "transport" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Từ ngày</label>
                    <WheelDateTimePicker
                      mode="date"
                      value={returnTransportFilterFrom}
                      onChange={(val) => onChangeFilterFrom(val)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Đến ngày</label>
                    <WheelDateTimePicker
                      mode="date"
                      value={returnTransportFilterTo}
                      onChange={(val) => onChangeFilterTo(val)}
                    />
                  </div>
                  <button
                    onClick={onExportTransport}
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Download size={14} />
                    Xuất Excel
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                        <th className="px-3 py-2 font-medium">Mã VC</th>
                        <th className="px-3 py-2 font-medium">Mã bàn giao</th>
                        <th className="px-3 py-2 font-medium">Mã tiếp nhận</th>
                        <th className="px-3 py-2 font-medium">Mã TB</th>
                        <th className="px-3 py-2 font-medium">Tên thiết bị</th>
                        <th className="px-3 py-2 font-medium">Người bàn giao</th>
                        <th className="px-3 py-2 font-medium">Người tiếp nhận</th>
                        <th className="px-3 py-2 font-medium">Thời gian</th>
                        <th className="px-3 py-2 font-medium">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReturnTransportRows.length > 0 ? (
                        filteredReturnTransportRows.map((row) => (
                          <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-700">{row.transferCode}</td>
                            <td className="px-3 py-2 text-slate-700">{row.handoverCode}</td>
                            <td className="px-3 py-2 text-slate-700">{row.acceptanceCode}</td>
                            <td className="px-3 py-2 text-slate-700">{row.deviceCode}</td>
                            <td className="px-3 py-2 text-slate-700">{row.deviceName}</td>
                            <td className="px-3 py-2 text-slate-700">{row.handoverBy || "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{row.receiver || "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{formatDateTimeLabel(row.receivedAt)}</td>
                            <td className="px-3 py-2 text-slate-700">{row.receiveCondition || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-3 py-6 text-center text-slate-500">Không có dữ liệu phiếu vận chuyển theo bộ lọc hiện tại.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Không có thiết bị trạng thái tạm điều chuyển để tiếp nhận trở lại.</div>
        )}
      </div>
    </div>
  );
}

export default ReturnAcceptanceSection;
