"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Printer,
  Download,
  Upload,
  Eye,
  FileText,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Check,
  Settings,
  QrCode,
  BookOpen,
  Contact,
  Users,
  GripVertical,
  FileSpreadsheet,
} from "lucide-react";
import QRCode from "qrcode";
import {
  Device,
  DeviceContact,
  DeviceManagerHistory,
  UserProfile,
  AttachedFile,
  formatDate,
} from "@/lib/mockData";

interface DeviceManagementModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

type TabType = "profile" | "manager" | "contact" | "print";

export default function DeviceManagementModal({
  device,
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateDevice,
}: DeviceManagementModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [showQRCode, setShowQRCode] = useState(true);
  const [showLabelInfo, setShowLabelInfo] = useState(true);
  const [labelQuantity, setLabelQuantity] = useState(1);

  // Manager tab state
  const [newManagerSearch, setNewManagerSearch] = useState("");
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState<UserProfile | null>(null);
  const [newManagerStartDate, setNewManagerStartDate] = useState("");
  const [managerAttachments, setManagerAttachments] = useState<AttachedFile[]>([]);

  // Contact tab state
  const [newContact, setNewContact] = useState<Partial<DeviceContact>>({});
  const [contactAttachments, setContactAttachments] = useState<AttachedFile[]>([]);

  // Column visibility for tables
  const [managerColumns, setManagerColumns] = useState({
    employeeId: true,
    fullName: true,
    branchDepartment: true,
    position: true,
    phone: true,
    email: true,
    startDate: true,
    endDate: true,
    status: true,
  });

  const [contactColumns, setContactColumns] = useState({
    fullName: true,
    phone: true,
    email: true,
    company: true,
    status: true,
  });

  // Assert device is not null for the rest of the component
  const d = device!;

  // Generate QR code
  useEffect(() => {
    if (isOpen && activeTab === "print") {
      const qrData = JSON.stringify({
        company: "Công ty TNHH LABHOUSE VIỆT NAM",
        deviceName: d.name,
        deviceCode: d.code,
        serial: d.serial,
        usageStartDate: d.usageStartDate,
        manager: d.managerHistory?.find((m) => m.isCurrent)?.fullName || "-",
        phone: d.contacts?.[0]?.phone || "-",
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/incident-report?device=${d.code}`,
      });

      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [isOpen, activeTab, device]);

  // Filter users for manager search
  const filteredUsers = useMemo(() => {
    if (!newManagerSearch.trim()) return allUsers.slice(0, 10);
    const search = newManagerSearch.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        u.employeeId.toLowerCase().includes(search)
    );
  }, [allUsers, newManagerSearch]);

  // Check if current user can edit
  const canEdit = currentUser?.profileIds?.some((pid) => {
    const profile = allUsers.find((u) => u.id === currentUser.id)?.profileIds;
    return profile?.includes("admin") || profile?.includes("manager");
  }) || currentUser?.position?.toLowerCase().includes("giám đốc") || currentUser?.position?.toLowerCase().includes("quản lý");

  // Handle change manager
  const handleChangeManager = () => {
    if (!selectedNewManager || !newManagerStartDate) return;

    const currentManager = d.managerHistory?.find((m) => m.isCurrent);
    const updatedHistory: DeviceManagerHistory[] = [
      ...(d.managerHistory || []).map((m) => ({
        ...m,
        isCurrent: false,
        endDate: m.isCurrent ? newManagerStartDate : m.endDate,
      })),
      {
        userId: selectedNewManager.id,
        fullName: selectedNewManager.fullName,
        startDate: newManagerStartDate,
        isCurrent: true,
      },
    ];

    onUpdateDevice(d.id, { managerHistory: updatedHistory });
    setNewManagerSearch("");
    setSelectedNewManager(null);
    setNewManagerStartDate("");
    setManagerAttachments([]);
  };

  // Handle add contact
  const handleAddContact = () => {
    if (!newContact.fullName) return;

    const newContactObj: DeviceContact = {
      id: `contact_${Date.now()}`,
      fullName: newContact.fullName || "",
      phone: newContact.phone || "",
      email: newContact.email || "",
      address: newContact.address,
    };

    onUpdateDevice(d.id, {
      contacts: [...(d.contacts || []), newContactObj],
    });
    setNewContact({});
    setContactAttachments([]);
  };

  // Handle file upload for attachments
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "manager" | "contact"
  ) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: AttachedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type.includes("pdf") ? "pdf" : file.type.includes("image") ? "image" : "doc",
          url: reader.result as string,
          size: file.size,
        };
        if (type === "manager") {
          setManagerAttachments((prev) => [...prev, newFile]);
        } else {
          setContactAttachments((prev) => [...prev, newFile]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle download label as PDF (simplified)
  const handleDownloadPDF = () => {
    // For now, show alert - in production would generate actual PDF
    alert(`Tải ${labelQuantity} tem nhãn thiết bị ${d.code}`);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Xem lý lịch", icon: <BookOpen size={18} /> },
    { id: "manager", label: "Người quản lý", icon: <Users size={18} /> },
    { id: "contact", label: "Người liên hệ", icon: <Contact size={18} /> },
    { id: "print", label: "In nhãn", icon: <QrCode size={18} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Thông tin quản lý thiết bị</h2>
            <p className="text-sm text-slate-500">{d.name} - {d.code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Xem lý lịch thiết bị */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FileText size={18} />
                  Xuất Lý lịch (PDF)
                </button>
              </div>

              {/* Thông tin định danh */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-200">
                  Thông tin định danh
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Tên thiết bị</label>
                    <p className="font-medium text-slate-800">{d.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Mã thiết bị</label>
                    <p className="font-medium text-slate-800">{d.code}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Mã hiệu (Model)</label>
                    <p className="font-medium text-slate-800">{d.model || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Số Serial</label>
                    <p className="font-medium text-slate-800">{d.serial || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Hãng sản xuất</label>
                    <p className="font-medium text-slate-800">{d.manufacturer}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Nước sản xuất</label>
                    <p className="font-medium text-slate-800">{d.countryOfOrigin || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin thương mại */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-200">
                  Thông tin thương mại
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Nhà cung cấp</label>
                    <p className="font-medium text-slate-800">{d.distributor || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Người liên hệ</label>
                    <p className="font-medium text-slate-800">{d.contacts?.[0]?.fullName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Số điện thoại</label>
                    <p className="font-medium text-slate-800">{d.contacts?.[0]?.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Email</label>
                    <p className="font-medium text-slate-800">{d.contacts?.[0]?.email || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin sử dụng */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-200">
                  Thông tin sử dụng
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Thời gian nhận</label>
                    <p className="font-medium text-slate-800">{formatDate(d.usageStartDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Vị trí lắp đặt</label>
                    <p className="font-medium text-slate-800">{d.installationLocation || d.location}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Tình trạng khi nhận</label>
                    <p className="font-medium text-slate-800">{d.conditionOnReceive}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      d.status === "Đang vận hành" ? "bg-green-100 text-green-700" :
                      d.status === "Chờ vận hành" ? "bg-yellow-100 text-yellow-700" :
                      d.status === "Tạm dừng" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin cấu hình ISO */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-200">
                  Thông tin cấu hình ISO
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Hiệu chuẩn</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-3 h-3 rounded-full ${d.calibrationRequired ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span className="text-sm">{d.calibrationRequired ? "Có" : "Không"}</span>
                      {d.calibrationRequired && (
                        <span className="text-xs text-slate-500">- {d.calibrationFrequency}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Bảo trì</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-3 h-3 rounded-full ${d.maintenanceRequired ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span className="text-sm">{d.maintenanceRequired ? "Có" : "Không"}</span>
                      {d.maintenanceRequired && (
                        <span className="text-xs text-slate-500">- {d.maintenanceFrequency}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Kiểm tra</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-3 h-3 rounded-full ${d.inspectionRequired ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span className="text-sm">{d.inspectionRequired ? "Có" : "Không"}</span>
                      {d.inspectionRequired && (
                        <span className="text-xs text-slate-500">- {d.inspectionFrequency}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Lần hiệu chuẩn cuối</label>
                    <p className="font-medium text-slate-800">{d.lastCalibration ? formatDate(d.lastCalibration) : "-"}</p>
                  </div>
                </div>
              </div>

              {/* Người phụ trách */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-200">
                  Người phụ trách
                </h3>
                <div className="space-y-3">
                  {d.managerHistory?.map((mgr, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl ${mgr.isCurrent ? "bg-emerald-50 border-2 border-emerald-200" : "bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${mgr.isCurrent ? "text-emerald-800" : "text-slate-600"}`}>
                            {mgr.fullName}
                          </p>
                          <p className="text-sm text-slate-500">
                            Bắt đầu: {formatDate(mgr.startDate)}
                            {mgr.endDate && ` - Kết thúc: ${formatDate(mgr.endDate)}`}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          mgr.isCurrent ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}>
                          {mgr.isCurrent ? "Quản lý hiện tại" : "Đã ngưng"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Thay đổi người quản lý */}
          {activeTab === "manager" && (
            <div className="flex gap-6">
              {/* Left: Form */}
              <div className="w-1/3 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 mb-2">{d.name}</h3>
                  <p className="text-sm text-slate-500">{d.code}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Người quản lý hiện tại
                  </label>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    {d.managerHistory?.find((m) => m.isCurrent) ? (
                      <p className="font-medium text-emerald-800">
                        {d.managerHistory.find((m) => m.isCurrent)?.fullName}
                      </p>
                    ) : (
                      <p className="text-slate-500 italic">Chưa có người quản lý</p>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Người quản lý mới <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top/2 -translate-1-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={newManagerSearch}
                          onChange={(e) => {
                            setNewManagerSearch(e.target.value);
                            setShowManagerDropdown(true);
                          }}
                          onFocus={() => setShowManagerDropdown(true)}
                          placeholder="Tìm kiếm người quản lý..."
                          className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                        />
                        {showManagerDropdown && filteredUsers.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                            {filteredUsers.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setSelectedNewManager(user);
                                  setNewManagerSearch(user.fullName);
                                  setShowManagerDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
                              >
                                <User size={16} className="text-slate-400" />
                                {user.fullName} ({user.employeeId})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedNewManager && (
                        <p className="text-sm text-emerald-600 mt-2">✓ Đã chọn: {selectedNewManager.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ngày bắt đầu quản lý <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newManagerStartDate}
                        onChange={(e) => setNewManagerStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Đính kèm văn bản
                      </label>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Upload size={16} className="text-slate-500" />
                          <span className="text-sm">Thêm file</span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "manager")}
                            className="hidden"
                          />
                        </label>
                        {managerAttachments.map((file) => (
                          <div key={file.id} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button
                              onClick={() => setManagerAttachments((prev) => prev.filter((f) => f.id !== file.id))}
                              className="text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleChangeManager}
                      disabled={!selectedNewManager || !newManagerStartDate}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Lưu thay đổi
                    </button>
                  </>
                )}
              </div>

              {/* Right: History Table */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Lịch sử thay đổi người quản lý</h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg" title="Cấu hình cột">
                      <GripVertical size={18} className="text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-sm">
                      <FileSpreadsheet size={18} className="text-green-600" />
                      Xuất Excel
                    </button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {managerColumns.employeeId && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Mã NV</th>}
                        {managerColumns.fullName && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ và tên</th>}
                        {managerColumns.branchDepartment && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Chi nhánh & Bộ phận</th>}
                        {managerColumns.position && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Chức vụ</th>}
                        {managerColumns.phone && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">SĐT</th>}
                        {managerColumns.email && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Email</th>}
                        {managerColumns.startDate && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ngày bắt đầu</th>}
                        {managerColumns.endDate && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ngày kết thúc</th>}
                        {managerColumns.status && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Trạng thái</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {d.managerHistory?.map((mgr, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          {managerColumns.employeeId && <td className="px-4 py-3 text-sm">{mgr.userId}</td>}
                          {managerColumns.fullName && <td className="px-4 py-3 text-sm font-medium">{mgr.fullName}</td>}
                          {managerColumns.branchDepartment && <td className="px-4 py-3 text-sm">-</td>}
                          {managerColumns.position && <td className="px-4 py-3 text-sm">-</td>}
                          {managerColumns.phone && <td className="px-4 py-3 text-sm">-</td>}
                          {managerColumns.email && <td className="px-4 py-3 text-sm">-</td>}
                          {managerColumns.startDate && <td className="px-4 py-3 text-sm">{formatDate(mgr.startDate)}</td>}
                          {managerColumns.endDate && <td className="px-4 py-3 text-sm">{mgr.endDate ? formatDate(mgr.endDate) : "-"}</td>}
                          {managerColumns.status && (
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                mgr.isCurrent ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                              }`}>
                                {mgr.isCurrent ? "Quản lý hiện tại" : "Thôi quản lý"}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Thay đổi người liên hệ */}
          {activeTab === "contact" && (
            <div className="flex gap-6">
              {/* Left: Form */}
              <div className="w-1/3 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 mb-2">{d.name}</h3>
                  <p className="text-sm text-slate-500">{d.code}</p>
                </div>

                {canEdit && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
 tên <span className="text-red-500">*</span>
                        Họ và                      </label>
                      <input
                        type="text"
                        value={newContact.fullName || ""}
                        onChange={(e) => setNewContact({ ...newContact, fullName: e.target.value })}
                        placeholder="Nhập họ và tên"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={newContact.phone || ""}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Địa chỉ email
                      </label>
                      <input
                        type="email"
                        value={newContact.email || ""}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        placeholder="Nhập địa chỉ email"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Đính kèm văn bản
                      </label>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Upload size={16} className="text-slate-500" />
                          <span className="text-sm">Thêm file</span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "contact")}
                            className="hidden"
                          />
                        </label>
                        {contactAttachments.map((file) => (
                          <div key={file.id} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button
                              onClick={() => setContactAttachments((prev) => prev.filter((f) => f.id !== file.id))}
                              className="text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleAddContact}
                      disabled={!newContact.fullName}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Thêm liên hệ
                    </button>
                  </>
                )}
              </div>

              {/* Right: Contacts Table */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Danh sách người liên hệ</h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg" title="Cấu hình cột">
                      <GripVertical size={18} className="text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-sm">
                      <FileSpreadsheet size={18} className="text-green-600" />
                      Xuất Excel
                    </button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {contactColumns.fullName && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>}
                        {contactColumns.phone && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">SĐT</th>}
                        {contactColumns.email && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Email</th>}
                        {contactColumns.company && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Công ty</th>}
                        {contactColumns.status && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Trạng thái</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {d.contacts?.map((contact, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          {contactColumns.fullName && <td className="px-4 py-3 text-sm font-medium">{contact.fullName}</td>}
                          {contactColumns.phone && <td className="px-4 py-3 text-sm">{contact.phone || "-"}</td>}
                          {contactColumns.email && <td className="px-4 py-3 text-sm">{contact.email || "-"}</td>}
                          {contactColumns.company && <td className="px-4 py-3 text-sm">{d.distributor || "-"}</td>}
                          {contactColumns.status && (
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Liên hệ hiện tại
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: In nhãn thiết bị */}
          {activeTab === "print" && (
            <div className="flex gap-8">
              {/* Left: Preview */}
              <div className="w-1/2">
                <h3 className="font-semibold text-slate-800 mb-4">Bản xem trước</h3>
                <div className="border-2 border-slate-300 rounded-xl p-8 bg-white">
                  <div className="flex gap-6 items-center justify-center">
                    {showLabelInfo && (
                      <div className="text-left space-y-2">
                        <p className="text-xs text-slate-500 font-medium">CÔNG TY TNHH LABHOUSE VIỆT NAM</p>
                        <p className="font-bold text-slate-800 text-lg">{d.name}</p>
                        <p className="text-sm text-slate-600">Mã: {d.code}</p>
                        <p className="text-sm text-slate-600">Serial: {d.serial}</p>
                        <p className="text-sm text-slate-600">Ngày SD: {formatDate(d.usageStartDate)}</p>
                        <p className="text-sm text-slate-600">
                          Người phụ trách: {d.managerHistory?.find((m) => m.isCurrent)?.fullName || "-"}
                        </p>
                      </div>
                    )}
                    {showQRCode && qrCodeDataUrl && (
                      <div className="flex flex-col items-center">
                        <img src={qrCodeDataUrl} alt="QR Code" className="w-40 h-40" />
                        <p className="text-xs text-slate-500 mt-2">QR Code</p>
                      </div>
                    )}
                  </div>
                </div>

                {showQRCode && (
                  <div className="mt-4 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
                    <p className="font-medium text-slate-700">Thông tin trong QR:</p>
                    <p>Công ty TNHH LABHOUSE VIỆT NAM</p>
                    <p>Tên: {d.name}</p>
                    <p>Mã: {d.code}</p>
                    <p>Ngày: {formatDate(d.usageStartDate)}</p>
                    <p>Người phụ trách: {d.managerHistory?.find((m) => m.isCurrent)?.fullName || "-"}</p>
                    <p>Điện thoại: {d.contacts?.[0]?.phone || "-"}</p>
                    <p className="text-xs text-slate-500 mt-2">Quét QR để báo cáo sự cố</p>
                  </div>
                )}
              </div>

              {/* Right: Controls */}
              <div className="w-1/2 space-y-6">
                <h3 className="font-semibold text-slate-800 mb-4">Điều khiển</h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showQRCode}
                      onChange={(e) => setShowQRCode(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Hiển thị QR Code</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLabelInfo}
                      onChange={(e) => setShowLabelInfo(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Hiển thị thông tin</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số lượng tem cần in
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={labelQuantity}
                    onChange={(e) => setLabelQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Tải PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    In trực tiếp
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
