/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react";
import WheelDateTimePicker from "@/components/WheelDateTimePicker";
import {
  Save,
  X,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  specialties,
  deviceCategories,
  deviceTypes,
  deviceLocations,
  Device,
  DeviceContact,
} from "@/lib/mockData";

interface DeviceRegistrationModalProps {
  show: boolean;
  onClose: () => void;
  form: Partial<Device>;
  onFormChange: (next: Partial<Device>) => void;
  yearOptions: string[];
  filteredCountries: string[];
  showCountryDropdown: boolean;
  onCountryDropdownToggle: (value: boolean) => void;
  onCountrySearchChange: (value: string) => void;
  devicePhoto: { name: string; url: string } | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newAccessory: string;
  onNewAccessoryChange: (value: string) => void;
  accessoryFileInputRef: React.RefObject<HTMLInputElement | null>;
  onAccessoryFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAccessory: () => void;
  onRemoveAccessory: (id: string) => void;
  newContact: Partial<DeviceContact>;
  onNewContactChange: (next: Partial<DeviceContact>) => void;
  onAddContact: () => void;
  onRemoveContact: (id: string) => void;
  onSubmit: () => void;
}

export function DeviceRegistrationModal({
  show,
  onClose,
  form,
  onFormChange,
  yearOptions,
  filteredCountries,
  showCountryDropdown,
  onCountryDropdownToggle,
  onCountrySearchChange,
  devicePhoto,
  fileInputRef,
  onPhotoUpload,
  newAccessory,
  onNewAccessoryChange,
  accessoryFileInputRef,
  onAccessoryFileUpload,
  onAddAccessory,
  onRemoveAccessory,
  newContact,
  onNewContactChange,
  onAddContact,
  onRemoveContact,
  onSubmit,
}: DeviceRegistrationModalProps) {
  const countryOptions = useMemo(() => filteredCountries, [filteredCountries]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Đăng ký thiết bị mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mã thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code || ""}
                onChange={(e) => onFormChange({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="TB-XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name || ""}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Nhập tên thiết bị"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chuyên khoa</label>
              <select
                value={form.specialty}
                onChange={(e) => onFormChange({ ...form, specialty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phân loại</label>
              <select
                value={form.category}
                onChange={(e) => onFormChange({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {deviceCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại thiết bị</label>
              <select
                value={form.deviceType}
                onChange={(e) => onFormChange({ ...form, deviceType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {deviceTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={form.model || ""}
                onChange={(e) => onFormChange({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Nhập model"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số serial <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.serial || ""}
                onChange={(e) => onFormChange({ ...form, serial: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Nhập số serial"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí</label>
              <select
                value={form.location}
                onChange={(e) => onFormChange({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {deviceLocations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Manufacturer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nhà sản xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.manufacturer || ""}
                onChange={(e) => onFormChange({ ...form, manufacturer: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Nhập tên nhà sản xuất"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Xuất xứ</label>
              <input
                type="text"
                value={form.countryOfOrigin || ""}
                onChange={(e) => {
                  onFormChange({ ...form, countryOfOrigin: e.target.value });
                  onCountrySearchChange(e.target.value);
                  onCountryDropdownToggle(true);
                }}
                onFocus={() => onCountryDropdownToggle(true)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Tìm kiếm xuất xứ"
              />
              {showCountryDropdown && countryOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {countryOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        onFormChange({ ...form, countryOfOrigin: c });
                        onCountryDropdownToggle(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Năm sản xuất</label>
              <select
                value={form.yearOfManufacture || ""}
                onChange={(e) => onFormChange({ ...form, yearOfManufacture: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">Chọn năm</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Distributor & Usage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nhà phân phối</label>
              <input
                type="text"
                value={form.distributor || ""}
                onChange={(e) => onFormChange({ ...form, distributor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Nhập tên nhà phân phối"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu sử dụng</label>
              <WheelDateTimePicker
                mode="date"
                value={form.usageStartDate || ""}
                onChange={(val) => onFormChange({ ...form, usageStartDate: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian sử dụng</label>
              <input
                type="text"
                value={form.usageTime || ""}
                onChange={(e) => onFormChange({ ...form, usageTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="VD: 08:00 - 17:00 (8 giờ)"
              />
            </div>
          </div>

          {/* Installation Location & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí lắp đặt</label>
              <select
                value={form.installationLocation || ""}
                onChange={(e) => onFormChange({ ...form, installationLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">Chọn vị trí lắp đặt</option>
                {deviceLocations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tình trạng khi nhận máy</label>
              <select
                value={form.conditionOnReceive}
                onChange={(e) => onFormChange({ ...form, conditionOnReceive: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="Máy mới">Máy mới</option>
                <option value="Đã qua sử dụng">Đã qua sử dụng</option>
                <option value="Tân trang lại">Tân trang lại</option>
              </select>
            </div>
          </div>

          {/* Device Photo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh chụp thiết bị</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                {devicePhoto ? (
                  <img src={devicePhoto.url} alt="Device preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-slate-400" />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                  Chọn ảnh
                </button>
                <p className="text-xs text-slate-500 mt-1">Chọn ảnh chính diện của thiết bị</p>
              </div>
            </div>
          </div>

          {/* Maintenance & Calibration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Calibration */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Hiệu chuẩn</span>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, calibrationRequired: !form.calibrationRequired, calibrationFrequency: form.calibrationRequired ? "" : form.calibrationFrequency })}
                  className={`p-1 rounded ${form.calibrationRequired ? "text-green-600" : "text-slate-400"}`}
                >
                  {form.calibrationRequired ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
              </div>
              {form.calibrationRequired && (
                <input
                  type="text"
                  value={form.calibrationFrequency || ""}
                  onChange={(e) => onFormChange({ ...form, calibrationFrequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="VD: 6 tháng, 1 năm"
                />
              )}
            </div>

            {/* Maintenance */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Bảo trì</span>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, maintenanceRequired: !form.maintenanceRequired, maintenanceFrequency: form.maintenanceRequired ? "" : form.maintenanceFrequency })}
                  className={`p-1 rounded ${form.maintenanceRequired ? "text-green-600" : "text-slate-400"}`}
                >
                  {form.maintenanceRequired ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
              </div>
              {form.maintenanceRequired && (
                <input
                  type="text"
                  value={form.maintenanceFrequency || ""}
                  onChange={(e) => onFormChange({ ...form, maintenanceFrequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="VD: 3 tháng, 6 tháng"
                />
              )}
            </div>

            {/* Inspection */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Kiểm tra</span>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, inspectionRequired: !form.inspectionRequired, inspectionFrequency: form.inspectionRequired ? "" : form.inspectionFrequency })}
                  className={`p-1 rounded ${form.inspectionRequired ? "text-green-600" : "text-slate-400"}`}
                >
                  {form.inspectionRequired ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
              </div>
              {form.inspectionRequired && (
                <input
                  type="text"
                  value={form.inspectionFrequency || ""}
                  onChange={(e) => onFormChange({ ...form, inspectionFrequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="VD: 1 năm"
                />
              )}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phụ kiện đính kèm</label>
            <div className="space-y-2 mb-3">
              {form.accessories?.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Paperclip size={16} className="text-slate-400" />
                    <span className="text-sm">{acc.name}</span>
                    {acc.fileName && <span className="text-xs text-slate-500">({acc.fileName})</span>}
                  </div>
                  <button type="button" onClick={() => onRemoveAccessory(acc.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAccessory}
                onChange={(e) => onNewAccessoryChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                placeholder="Nhập tên phụ kiện"
              />
              <input
                ref={accessoryFileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={onAccessoryFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => accessoryFileInputRef.current?.click()}
                className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                title="Đính kèm file"
              >
                <Paperclip size={18} />
              </button>
              <button type="button" onClick={onAddAccessory} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                Thêm
              </button>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Người liên hệ</label>
            <div className="space-y-2 mb-3">
              {form.contacts?.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{contact.fullName}</span>
                    <span className="text-xs text-slate-500 ml-2">{contact.phone} • {contact.email}</span>
                  </div>
                  <button type="button" onClick={() => onRemoveContact(contact.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                value={newContact.fullName || ""}
                onChange={(e) => onNewContactChange({ ...newContact, fullName: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                placeholder="Họ tên"
              />
              <input
                type="text"
                value={newContact.phone || ""}
                onChange={(e) => onNewContactChange({ ...newContact, phone: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                placeholder="Số điện thoại"
              />
              <input
                type="email"
                value={newContact.email || ""}
                onChange={(e) => onNewContactChange({ ...newContact, email: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                placeholder="Email"
              />
            </div>
            <button type="button" onClick={onAddContact} className="w-full px-4 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              + Thêm người liên hệ
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              Hủy
            </button>
            <button type="button" onClick={onSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Save size={18} />
              Lưu thiết bị
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceRegistrationModal;
