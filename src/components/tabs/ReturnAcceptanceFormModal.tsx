import { Device, AttachedFile } from "@/lib/mockData";
import WheelDateTimePicker from "@/components/WheelDateTimePicker";
import type { ReturnAcceptanceFormState } from "./DeviceProfileTab";
import { X, ClipboardCheck, Microscope, Upload, Eye, Download, Trash2, Save, CheckCircle2, FileText, User, MapPin, Tag, Hash, NotebookText } from "lucide-react";

interface ReturnAcceptanceFormModalProps {
  device: Device;
  form: ReturnAcceptanceFormState;
  onUpdate: (updater: (prev: ReturnAcceptanceFormState) => ReturnAcceptanceFormState) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onComplete: () => void;
  onUploadAttachment: () => void;
  onViewAttachment: (file: AttachedFile) => void;
  onDownloadAttachment: (file: AttachedFile) => void;
  onRemoveAttachment: (id: string) => void;
  onDownloadPdf: () => void;
  canEdit: boolean;
}

export function ReturnAcceptanceFormModal({
  device,
  form,
  onUpdate,
  onClose,
  onSaveDraft,
  onComplete,
  onUploadAttachment,
  onViewAttachment,
  onDownloadAttachment,
  onRemoveAttachment,
  onDownloadPdf,
  canEdit,
}: ReturnAcceptanceFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-full">
          <X size={18} />
        </button>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">PHIẾU TIẾP NHẬN TRỞ LẠI</div>
              <div className="text-lg font-extrabold text-slate-800">{form.formName}</div>
              <div className="text-sm text-slate-500">Mã phiếu: <span className="font-bold text-blue-600">{form.formCode}</span></div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={onDownloadPdf} className="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 flex items-center gap-2">
                <FileText size={14} /> Tải PDF
              </button>
              <button
                onClick={onUploadAttachment}
                disabled={!canEdit}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={14} /> Đính kèm
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-500 mb-1">THÔNG TIN THIẾT BỊ</div>
              <div className="flex items-start gap-2">
                <Microscope size={18} className="text-slate-500 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <div className="font-bold text-slate-800">{device.name}</div>
                  <div className="text-slate-500">Mã: {device.code}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Hash size={15} /> Serial: {device.serial || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Tag size={15} /> Model: {device.model || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={15} /> Vị trí: {device.location || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User size={15} /> Người tạo: {form.createdBy || "—"}
              </div>
              {form.completed && (
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Đã hoàn tất lúc {form.completedAt || "—"}
                </div>
              )}
              {!canEdit && (
                <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Chỉ người tạo phiếu mới được chỉnh sửa.
                </div>
              )}
            </div>

            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-bold">Người bàn giao</label>
                  <input
                    value={form.handoverBy}
                    onChange={(event) => onUpdate((prev) => ({ ...prev, handoverBy: event.target.value }))}
                    placeholder="Họ tên người bàn giao..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold">Người tiếp nhận</label>
                  <input
                    value={form.receiver}
                    onChange={(event) => onUpdate((prev) => ({ ...prev, receiver: event.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold">Đơn vị vận chuyển</label>
                  <input
                    value={form.transportPartner}
                    onChange={(event) => onUpdate((prev) => ({ ...prev, transportPartner: event.target.value }))}
                    placeholder="Công ty vận chuyển / NCC"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold">Liên hệ vận chuyển</label>
                  <input
                    value={form.transportContact}
                    onChange={(event) => onUpdate((prev) => ({ ...prev, transportContact: event.target.value }))}
                    placeholder="SĐT/Email liên hệ vận chuyển"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold">Thời gian tiếp nhận</label>
                  <WheelDateTimePicker
                    mode="datetime"
                    value={form.receivedAt}
                    onChange={(val) => onUpdate((prev) => ({ ...prev, receivedAt: val }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold">Tình trạng tiếp nhận</label>
                  <input
                    value={form.receiveCondition}
                    onChange={(event) => onUpdate((prev) => ({ ...prev, receiveCondition: event.target.value }))}
                    placeholder="Thiết bị hoạt động bình thường..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(event) => onUpdate((prev) => ({ ...prev, note: event.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm h-24 resize-none"
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500">Đính kèm</div>
                {form.attachments.length === 0 && <div className="text-xs text-slate-500">Chưa có file đính kèm.</div>}
                {form.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <NotebookText size={13} className="text-slate-400" />
                      <span className="truncate pr-2">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onViewAttachment(file)} className="p-1 rounded hover:bg-slate-200"><Eye size={13} /></button>
                      <button onClick={() => onDownloadAttachment(file)} className="p-1 rounded hover:bg-slate-200"><Download size={13} /></button>
                      {canEdit && (
                        <button onClick={() => onRemoveAttachment(file.id || "")} className="p-1 rounded hover:bg-slate-200 text-red-500"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button onClick={onClose} className="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">Đóng</button>
                <button onClick={onSaveDraft} className="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 flex items-center gap-2" disabled={!canEdit}>
                  <Save size={14} /> Lưu phiếu
                </button>
                <button onClick={onComplete} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canEdit}>
                  <CheckCircle2 size={14} /> Hoàn tất & ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnAcceptanceFormModal;
