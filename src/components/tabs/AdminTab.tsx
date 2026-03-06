"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings,
  Users,
  Building2,
  UserCheck,
  Briefcase,
  Globe,
  Truck,
  History,
  Shield,
  ChevronRight,
  ChevronDown,
  Save,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Search,
  Filter,
  Download,
  Columns3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight as ChevronRight2,
  RefreshCw,
  Database,
  Upload,
  RotateCcw,
  MapPin,
  Pen,
  Image,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WheelDateTimePicker from "@/components/WheelDateTimePicker";
import { useToast } from "@/contexts/ToastContext";
import { useData } from "@/contexts/DataContext";
import {
  mockDevices,
  mockHistoryConfig,
  Profile,
  Permission,
  PermissionCategory,
  UserProfile,
  Branch,
  Department,
  Position,
  Supplier,
  InstallationLocation,
  DetailedPermission,
  DEFAULT_DETAILED_PERMISSIONS,
  PermissionModule,
  DeviceProfileSubModule
} from "@/lib/mockData";
import { 
  createBackup, 
  downloadBackup, 
  validateBackupFile, 
  formatFileSize, 
  saveBackupConfig, 
  loadBackupConfig, 
  saveBackupHistory, 
  loadBackupHistory,
  type BackupMetadata,
  type BackupData 
} from "@/lib/backup-utils";

type AdminSection = 
  | "users" 
  | "profiles" 
  | "branches"
  | "departments" 
  | "positions" 
  | "install_locations"
  | "countries"
  | "suppliers"
  | "history_config"
  | "backup";

type UserColumn = "username" | "fullName" | "employeeId" | "phone" | "email" | "position" | "department" | "branch" | "profile" | "status";

const sections: { id: AdminSection; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "users", label: "Cấu hình người dùng", icon: <Users size={20} />, color: "from-purple-500 to-violet-600" },
  { id: "profiles", label: "Cấu hình Profile", icon: <UserCheck size={20} />, color: "from-blue-500 to-indigo-600" },
  { id: "branches", label: "Chi nhánh", icon: <Globe size={20} />, color: "from-green-500 to-emerald-600" },
  { id: "departments", label: "Khoa phòng", icon: <Building2 size={20} />, color: "from-orange-500 to-amber-600" },
  { id: "positions", label: "Chức vụ", icon: <Briefcase size={20} />, color: "from-cyan-500 to-blue-600" },
  { id: "install_locations", label: "Vị trí lắp đặt", icon: <MapPin size={20} />, color: "from-teal-500 to-emerald-600" },
  { id: "countries", label: "Nước sản xuất", icon: <Globe size={20} />, color: "from-green-500 to-emerald-600" },
  { id: "suppliers", label: "Nhà cung cấp", icon: <Truck size={20} />, color: "from-pink-500 to-rose-600" },
  { id: "history_config", label: "Cấu hình lịch sử", icon: <History size={20} />, color: "from-slate-500 to-zinc-600" },
  { id: "backup", label: "Sao lưu & Khôi phục", icon: <Database size={20} />, color: "from-emerald-500 to-teal-600" },
];

const permissionCategories: { id: PermissionCategory; label: string }[] = [
  { id: "quan_ly_chung", label: "Quản lý chung" },
  { id: "thiet_bi_moi", label: "Thiết bị mới" },
  { id: "ho_so_thiet_bi", label: "Hồ sơ thiết bị" },
  { id: "quan_tri", label: "Quản trị" },
  { id: "lich_su", label: "Lịch sử" },
];

export default function AdminTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection>("users");

  // User management state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userFilters, setUserFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Set<UserColumn>>(
    new Set(["username", "fullName", "employeeId", "phone", "email", "position", "department", "branch", "profile", "status"])
  );
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"upload" | "draw">("upload");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize backup data from localStorage
  useEffect(() => {
    const config = loadBackupConfig();
    if (config) {
      setAutoBackupEnabled(config.autoBackupEnabled || false);
      setAutoBackupFrequency(config.autoBackupFrequency || 'daily');
      setAutoBackupTime(config.autoBackupTime || '02:00');
      setMaxBackupsToKeep(config.maxBackupsToKeep || 10);
    }
    const history = loadBackupHistory();
    setBackupHistory(history);
  }, []);

  // Backup section state
  const [backupHistory, setBackupHistory] = useState<{id: string; createdAt: string; createdBy: string; size: number; recordCount: number}[]>([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [autoBackupTime, setAutoBackupTime] = useState("02:00");
  const [maxBackupsToKeep, setMaxBackupsToKeep] = useState(10);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreConfirmChecked, setRestoreConfirmChecked] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 20;

  // Profile management state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSearchTerm, setProfileSearchTerm] = useState("");
  const [profilePage, setProfilePage] = useState(1);
  const profilesPerPage = 20;

  // Permission Matrix - Expanded sections state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["dashboard", "new_device", "device_profile"]));
  const [expandedSubModules, setExpandedSubModules] = useState<Set<string>>(new Set());

  // Helper functions for accordion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleSubModule = (subModuleId: string) => {
    setExpandedSubModules(prev => {
      const next = new Set(prev);
      if (next.has(subModuleId)) {
        next.delete(subModuleId);
      } else {
        next.add(subModuleId);
      }
      return next;
    });
  };

  // Toggle permission in detailed permissions
  const toggleDetailedPermission = (permId: string) => {
    if (!editingProfile) return;
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    const newPermissions = currentPerms.map(p => 
      p.id === permId ? { ...p, enabled: !p.enabled } : p
    );
    setEditingProfile({ ...editingProfile, detailedPermissions: newPermissions });
  };

  // Toggle all permissions in a module (Master Toggle)
  const toggleModuleAll = (moduleId: string, enabled: boolean) => {
    if (!editingProfile) return;
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    const newPermissions = currentPerms.map(p => 
      p.module === moduleId ? { ...p, enabled } : p
    );
    setEditingProfile({ ...editingProfile, detailedPermissions: newPermissions });
  };

  // Toggle all permissions in a sub-module
  const toggleSubModuleAll = (subModuleId: string, enabled: boolean) => {
    if (!editingProfile) return;
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    const newPermissions = currentPerms.map(p => 
      p.subModule === subModuleId ? { ...p, enabled } : p
    );
    setEditingProfile({ ...editingProfile, detailedPermissions: newPermissions });
  };

  // Check if all permissions in a module are enabled
  const isModuleAllEnabled = (moduleId: string): boolean => {
    if (!editingProfile) return false;
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    const modulePerms = currentPerms.filter(p => p.module === moduleId);
    return modulePerms.length > 0 && modulePerms.every(p => p.enabled);
  };

  // Check if some (but not all) permissions in a module are enabled
  const isModulePartial = (moduleId: string): boolean => {
    if (!editingProfile) return false;
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    const modulePerms = currentPerms.filter(p => p.module === moduleId);
    const enabledCount = modulePerms.filter(p => p.enabled).length;
    return enabledCount > 0 && enabledCount < modulePerms.length;
  };

  // Check if all permissions in a sub-module are enabled
  const isSubModuleAllEnabled = (subModuleId: string): boolean => {
    if (!editingProfile) return false;
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    const subModulePerms = currentPerms.filter(p => p.subModule === subModuleId);
    return subModulePerms.length > 0 && subModulePerms.every(p => p.enabled);
  };

  // Get detailed permissions based on module, type, and optional subModule
  const getDetailedPermissions = (
    module: PermissionModule,
    type?: "function" | "file",
    subModule?: DeviceProfileSubModule
  ): DetailedPermission[] => {
    if (!editingProfile) return [];
    const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
    let perms = currentPerms.filter(p => p.module === module);
    if (type) {
      perms = perms.filter(p => p.type === type);
    }
    if (subModule) {
      perms = perms.filter(p => p.subModule === subModule);
    }
    return perms;
  };

  // Sub-Module Accordion Component
  const SubModuleAccordion = ({
    title,
    subModuleId,
    permissions,
    color
  }: {
    title: string;
    subModuleId: string;
    permissions: DetailedPermission[];
    color: string;
  }) => {
    const [expanded, setExpanded] = useState(false);
    const isAllEnabled = permissions.length > 0 && permissions.every(p => p.enabled);
    
    const colorClasses: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600' },
      red: { bg: 'bg-red-500', text: 'text-red-600' },
      violet: { bg: 'bg-violet-500', text: 'text-violet-600' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-600' },
      teal: { bg: 'bg-teal-500', text: 'text-teal-600' },
      slate: { bg: 'bg-slate-500', text: 'text-slate-600' },
    };
    const colors = colorClasses[color] || colorClasses.blue;

    const functionPerms = permissions.filter(p => p.type === 'function');
    const filePerms = permissions.filter(p => p.type === 'file');

    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded ${colors.bg} flex items-center justify-center`}>
              <CheckSquare size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                const newState = !permissions.every(p => p.enabled);
                if (editingProfile) {
                  const currentPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
                  const newPermissions = currentPerms.map(p => 
                    p.subModule === subModuleId ? { ...p, enabled: newState } : p
                  );
                  setEditingProfile({ ...editingProfile, detailedPermissions: newPermissions });
                }
              }}
              className={`relative w-8 h-4.5 rounded-full transition-colors ${isAllEnabled ? colors.bg : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${isAllEnabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </button>
            {expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          </div>
        </button>
        {expanded && (
          <div className="px-3 pb-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {functionPerms.length > 0 && (
                <div className="space-y-1">
                  <h6 className={`text-[10px] font-bold uppercase ${colors.text} flex items-center gap-1`}>
                    <CheckSquare size={10} /> Chức năng
                  </h6>
                  {functionPerms.map(perm => (
                    <label key={perm.id} className="flex items-start gap-1.5 cursor-pointer p-1 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={perm.enabled}
                        onChange={() => toggleDetailedPermission(perm.id)}
                        className="mt-0.5 w-3.5 h-3.5 rounded"
                      />
                      <span className="text-[10px] text-slate-600">{perm.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {filePerms.length > 0 && (
                <div className="space-y-1">
                  <h6 className="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1">
                    <Upload size={10} /> File
                  </h6>
                  {filePerms.map(perm => (
                    <label key={perm.id} className="flex items-start gap-1.5 cursor-pointer p-1 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={perm.enabled}
                        onChange={() => toggleDetailedPermission(perm.id)}
                        className="mt-0.5 w-3.5 h-3.5 rounded text-purple-600"
                      />
                      <span className="text-[10px] text-slate-600">{perm.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Branch/Department state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "" });
  
  // Position state
  const [positions, setPositions] = useState<Position[]>([]);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [newPosition, setNewPosition] = useState({ name: "", description: "", departmentId: "" });

  // Installation Location state
  const [installLocations, setInstallLocations] = useState<InstallationLocation[]>([]);
  const [editingInstallLocation, setEditingInstallLocation] = useState<InstallationLocation | null>(null);
  const [showInstallLocationModal, setShowInstallLocationModal] = useState(false);

  // Country state
  const [countryList, setCountryList] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [editingCountry, setEditingCountry] = useState<{ index: number; value: string } | null>(null);

  // Supplier state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: "", code: "", address: "", phone: "", email: "", contactPerson: "" });
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierPage, setSupplierPage] = useState(1);
  const suppliersPerPage = 20;

  // History config state
  const [historyConfig, setHistoryConfig] = useState(mockHistoryConfig);

  // Get addHistory from DataContext (before canAccess check)
  const { addHistory } = useData();

  const canAccess = user?.role === "Admin" || user?.role === "Giám đốc";

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json() as UserProfile[];
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json() as Profile[];
        setProfiles(data);
      }
    } catch (e) {
      console.error("Failed to fetch profiles", e);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const data = await res.json() as Branch[];
        setBranches(data);
      }
    } catch (e) {
      console.error("Failed to fetch branches", e);
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data = await res.json() as Position[];
        setPositions(data);
      }
    } catch (e) {
      console.error("Failed to fetch positions", e);
    }
  }, []);

  const fetchInstallLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/installation-locations");
      if (res.ok) {
        const data = await res.json() as InstallationLocation[];
        setInstallLocations(data);
      }
    } catch (e) {
      console.error("Failed to fetch installation locations", e);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const data = await res.json() as Supplier[];
        setSuppliers(data);
      }
    } catch (e) {
      console.error("Failed to fetch suppliers", e);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json() as Department[];
        setDepartments(data);
      }
    } catch (e) {
      console.error("Failed to fetch departments", e);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch("/api/countries");
      if (res.ok) {
        const data = await res.json() as string[];
        setCountryList(data);
      }
    } catch (e) {
      console.error("Failed to fetch countries", e);
    }
  }, []);

  const fetchHistoryConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/history-config");
      if (res.ok) {
        const data = await res.json();
        setHistoryConfig(data);
      }
    } catch (e) {
      console.error("Failed to fetch history config", e);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchProfiles();
    fetchBranches();
    fetchPositions();
    fetchInstallLocations();
    fetchSuppliers();
    fetchDepartments();
    fetchCountries();
    fetchHistoryConfig();
  }, [fetchUsers, fetchProfiles, fetchBranches, fetchPositions, fetchInstallLocations, fetchSuppliers, fetchDepartments, fetchCountries, fetchHistoryConfig]);

  if (!canAccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-400 text-sm">Bạn không có quyền truy cập vào trang quản trị</p>
        </div>
      </div>
    );
  }

  // ============ USER MANAGEMENT ============
  const filteredUsers = users.filter(u => {
    const matchSearch = 
      u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchFilters = Object.entries(userFilters).every(([key, value]) => {
      if (!value) return true;
      if (key === "position") return u.position.includes(value);
      if (key === "department") return u.department.includes(value);
      if (key === "branch") return u.branch.includes(value);
      if (key === "status") return value === "active" ? u.isActive : !u.isActive;
      return true;
    });

    return matchSearch && matchFilters;
  });

  const paginatedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleExportUsers = () => {
    // Simple CSV export
    const headers = ["Tên đăng nhập", "Họ và tên", "Mã NV", "SĐT", "Email", "Chức vụ", "Khoa phòng", "Chi nhánh", "Trạng thái"];
    const rows = filteredUsers.map(u => [
      u.username,
      u.fullName,
      u.employeeId,
      u.phone,
      u.email,
      u.position,
      u.department,
      u.branch,
      u.isActive ? "Hoạt động" : "Không hoạt động"
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "danh_sach_nhan_vien.csv";
    link.click();
    success("Xuất file", "Đã xuất danh sách nhân viên");
  };

  const toggleColumn = (col: UserColumn) => {
    const newSet = new Set(visibleColumns);
    if (newSet.has(col)) {
      newSet.delete(col);
    } else {
      newSet.add(col);
    }
    setVisibleColumns(newSet);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      if (editingUser.id) {
        // Update existing user
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        });
        if (!res.ok) {
          const err = await res.json() as { error?: string };
          error("Lỗi", err.error ?? "Không thể cập nhật người dùng");
          return;
        }
        const updated = await res.json() as UserProfile;
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        
        // Add history log
        addHistory({
          actionCode: `ACT-${String(Date.now()).slice(-6)}`,
          actionNumber: Date.now(),
          userId: user?.id || "",
          userName: user?.fullName || "",
          userRole: user?.role || "",
          action: "Cập nhật",
          description: `Cập nhật thông tin người dùng ${updated.fullName}`,
          targetType: "Người dùng",
          targetId: updated.id,
          targetName: updated.fullName,
          timestamp: new Date().toISOString(),
        }).catch(console.error);
        
        success("Đã cập nhật", "Thông tin người dùng đã được cập nhật");
      } else {
        // Create new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        });
        if (!res.ok) {
          const err = await res.json() as { error?: string };
          error("Lỗi", err.error ?? "Không thể thêm người dùng");
          return;
        }
        const created = await res.json() as UserProfile;
        setUsers(prev => [created, ...prev]);
        
        // Add history log
        addHistory({
          actionCode: `ACT-${String(Date.now()).slice(-6)}`,
          actionNumber: Date.now(),
          userId: user?.id || "",
          userName: user?.fullName || "",
          userRole: user?.role || "",
          action: "Tạo mới",
          description: `Tạo mới người dùng ${created.fullName}`,
          targetType: "Người dùng",
          targetId: created.id,
          targetName: created.fullName,
          timestamp: new Date().toISOString(),
        }).catch(console.error);
        
        success("Đã thêm", "Người dùng mới đã được thêm");
      }
    } catch (e) {
      error("Lỗi", String(e));
      return;
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        error("Lỗi", err.error ?? "Không thể xóa người dùng");
        return;
      }
      const userToDelete = users.find(u => u.id === userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      // Add history log
      if (userToDelete) {
        addHistory({
          actionCode: `ACT-${String(Date.now()).slice(-6)}`,
          actionNumber: Date.now(),
          userId: user?.id || "",
          userName: user?.fullName || "",
          userRole: user?.role || "",
          action: "Xóa",
          description: `Xóa người dùng ${userToDelete.fullName}`,
          targetType: "Người dùng",
          targetId: userId,
          targetName: userToDelete.fullName,
          timestamp: new Date().toISOString(),
        }).catch(console.error);
      }
      
      success("Đã xóa", "Người dùng đã được xóa");
    } catch (e) {
      error("Lỗi", String(e));
    }
  };

  // ============ PROFILE MANAGEMENT ============
  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(profileSearchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(profileSearchTerm.toLowerCase())
  );

  const paginatedProfiles = filteredProfiles.slice((profilePage - 1) * profilesPerPage, profilePage * profilesPerPage);
  const totalProfilePages = Math.ceil(filteredProfiles.length / profilesPerPage);

  const handleSaveProfile = async () => {
    if (editingProfile) {
      try {
        // Initialize detailed permissions if not present
        const detailedPerms = editingProfile.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: p.enabled }));
        
        if (editingProfile.id) {
          // Update existing profile
          const res = await fetch(`/api/profiles/${editingProfile.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingProfile.name,
              description: editingProfile.description,
              permissions: editingProfile.permissions,
              detailedPermissions: detailedPerms,
              isActive: editingProfile.isActive,
            }),
          });
          if (!res.ok) throw new Error("Failed to update profile");
          const updated = await res.json();
          setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...updated, code: p.code, createdAt: p.createdAt, updatedAt: new Date().toISOString() } : p));
          success("Đã cập nhật", "Profile đã được cập nhật");
          // Log to history
          addHistory({
            actionCode: `ACT-${String(Date.now()).slice(-6)}`,
            actionNumber: Date.now(),
            userId: user?.id || "",
            userName: user?.fullName || "",
            userRole: user?.role || "",
            action: "Cập nhật profile",
            description: `Cập nhật profile ${editingProfile.name} (${editingProfile.code})`,
            targetType: "Profile",
            targetId: editingProfile.id,
            targetName: `${editingProfile.name} (${editingProfile.code})`,
            timestamp: new Date().toISOString(),
          }).catch(console.error);
        } else {
          // Create new profile
          const res = await fetch("/api/profiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: editingProfile.code,
              name: editingProfile.name,
              description: editingProfile.description,
              permissions: editingProfile.permissions,
              detailedPermissions: detailedPerms,
              isActive: editingProfile.isActive ?? true,
            }),
          });
          if (!res.ok) throw new Error("Failed to create profile");
          const created = await res.json();
          setProfiles(prev => [...prev, { ...created, createdAt: new Date().toISOString() }]);
          success("Đã tạo", "Profile mới đã được tạo");
          // Log to history
          addHistory({
            actionCode: `ACT-${String(Date.now()).slice(-6)}`,
            actionNumber: Date.now(),
            userId: user?.id || "",
            userName: user?.fullName || "",
            userRole: user?.role || "",
            action: "Tạo profile",
            description: `Tạo mới profile ${editingProfile.name} (${editingProfile.code})`,
            targetType: "Profile",
            targetId: created.id,
            targetName: `${editingProfile.name} (${editingProfile.code})`,
            timestamp: new Date().toISOString(),
          }).catch(console.error);
        }
      } catch (err) {
        console.error("Profile save error:", err);
        error("Lỗi", "Không thể lưu profile vào cơ sở dữ liệu");
      }
    }
    setShowProfileModal(false);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      if (!res.ok) {
        error("Lỗi", "Không thể xóa profile");
        return;
      }
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      success("Đã xóa", "Profile đã được xóa");
    } catch (err) {
      console.error("Profile delete error", err);
      error("Lỗi", "Không thể xóa profile");
    }
  };

  const togglePermission = (profile: Profile, permId: string) => {
    if (!editingProfile) return;
    const newPermissions = editingProfile.permissions.map(p => 
      p.id === permId ? { ...p, enabled: !p.enabled } : p
    );
    setEditingProfile({ ...editingProfile, permissions: newPermissions });
  };

  // ============ BRANCH/DEPARTMENT MANAGEMENT ============
  const handleSaveBranch = async () => {
    if (editingBranch) {
      try {
        if (editingBranch.id) {
          // Update existing branch
          const res = await fetch(`/api/branches/${editingBranch.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingBranch.name,
              isActive: editingBranch.isActive,
            }),
          });
          if (!res.ok) throw new Error("Failed to update branch");
          const updated = await res.json();
          setBranches(prev => prev.map(b => b.id === editingBranch.id ? { ...updated, createdAt: b.createdAt } : b));
          success("Đã cập nhật", "Chi nhánh đã được cập nhật");
        } else {
          // Create new branch
          const res = await fetch("/api/branches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingBranch.name,
              isActive: editingBranch.isActive ?? true,
            }),
          });
          if (!res.ok) throw new Error("Failed to create branch");
          const created = await res.json();
          setBranches(prev => [...prev, { ...created, createdAt: new Date().toISOString() }]);
          success("Đã thêm", "Chi nhánh mới đã được thêm");
        }
      } catch (err) {
        console.error("Branch save error:", err);
        error("Lỗi", "Không thể lưu chi nhánh vào cơ sở dữ liệu");
      }
    }
    setShowBranchModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const res = await fetch(`/api/branches/${branchId}`, { method: "DELETE" });
      if (!res.ok) {
        error("Lỗi", "Không thể xóa chi nhánh");
        return;
      }
      setBranches(prev => prev.filter(b => b.id !== branchId));
      success("Đã xóa", "Chi nhánh đã được xóa");
    } catch (err) {
      console.error("Branch delete error", err);
      error("Lỗi", "Không thể xóa chi nhánh");
    }
  };

  const handleSaveDepartment = async () => {
    if (editingDepartment) {
      try {
        if (editingDepartment.id) {
          const res = await fetch(`/api/departments/${editingDepartment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingDepartment),
          });
          if (!res.ok) throw new Error("Failed to update department");
          const updated = await res.json();
          setDepartments(prev => prev.map(d => d.id === editingDepartment.id ? updated : d));
          success("Đã cập nhật", "Khoa phòng đã được cập nhật");
        } else {
          const res = await fetch("/api/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingDepartment),
          });
          if (!res.ok) throw new Error("Failed to create department");
          const created = await res.json();
          setDepartments(prev => [...prev, created]);
          success("Đã thêm", "Khoa phòng mới đã được thêm");
        }
      } catch (err) {
        console.error("Department save error:", err);
        error("Lỗi", "Không thể lưu khoa phòng");
      }
    }
    setShowDepartmentModal(false);
    setEditingDepartment(null);
  };

  const handleDeleteDepartment = (deptId: string) => {
    fetch(`/api/departments/${deptId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("delete_failed");
        setDepartments(prev => prev.filter(d => d.id !== deptId));
        success("Đã xóa", "Khoa phòng đã được xóa");
      })
      .catch((err) => {
        console.error("Department delete error", err);
        error("Lỗi", "Không thể xóa khoa phòng");
      });
  };

  // ============ POSITION MANAGEMENT ============
  const handleSavePosition = async () => {
    if (editingPosition) {
      try {
        if (editingPosition.id) {
          // Update existing position
          const res = await fetch(`/api/positions/${editingPosition.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingPosition.name,
              description: editingPosition.description,
              isActive: editingPosition.isActive,
            }),
          });
          if (!res.ok) throw new Error("Failed to update position");
          const updated = await res.json();
          setPositions(prev => prev.map(p => p.id === editingPosition.id ? { ...updated, createdAt: p.createdAt } : p));
          success("Đã cập nhật", "Chức vụ đã được cập nhật");
        } else {
          // Create new position - code will be auto-generated
          const res = await fetch("/api/positions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingPosition.name,
              description: editingPosition.description || "",
              isActive: editingPosition.isActive ?? true,
            }),
          });
          if (!res.ok) throw new Error("Failed to create position");
          const created = await res.json();
          setPositions(prev => [...prev, { ...created, createdAt: new Date().toISOString() }]);
          success("Đã thêm", "Chức vụ mới đã được thêm");
        }
      } catch (err) {
        console.error("Position save error:", err);
        error("Lỗi", "Không thể lưu chức vụ vào cơ sở dữ liệu");
      }
    }
    setShowPositionModal(false);
    setEditingPosition(null);
  };

  const handleDeletePosition = async (positionId: string) => {
    try {
      const res = await fetch(`/api/positions/${positionId}`, { method: "DELETE" });
      if (!res.ok) {
        error("Lỗi", "Không thể xóa chức vụ");
        return;
      }
      setPositions(prev => prev.filter(p => p.id !== positionId));
      success("Đã xóa", "Chức vụ đã được xóa");
    } catch (err) {
      console.error("Position delete error", err);
      error("Lỗi", "Không thể xóa chức vụ");
    }
  };

  // ============ INSTALLATION LOCATION MANAGEMENT ============
  const handleSaveInstallLocation = async () => {
    if (editingInstallLocation) {
      try {
        if (editingInstallLocation.id) {
          const res = await fetch(`/api/installation-locations/${editingInstallLocation.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingInstallLocation.name,
              departmentId: editingInstallLocation.departmentId,
              departmentName: editingInstallLocation.departmentName,
              branchId: editingInstallLocation.branchId,
              branchName: editingInstallLocation.branchName,
              isActive: editingInstallLocation.isActive,
            }),
          });
          if (!res.ok) throw new Error("Failed to update");
          const updated = await res.json();
          setInstallLocations(prev => prev.map(l => l.id === editingInstallLocation.id ? { ...updated, createdAt: l.createdAt } : l));
          success("Đã cập nhật", "Vị trí lắp đặt đã được cập nhật");
        } else {
          const res = await fetch("/api/installation-locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingInstallLocation.name,
              departmentId: editingInstallLocation.departmentId,
              departmentName: editingInstallLocation.departmentName,
              branchId: editingInstallLocation.branchId,
              branchName: editingInstallLocation.branchName,
              isActive: editingInstallLocation.isActive ?? true,
            }),
          });
          if (!res.ok) throw new Error("Failed to create");
          const created = await res.json();
          setInstallLocations(prev => [...prev, { ...created, createdAt: new Date().toISOString() }]);
          success("Đã thêm", "Vị trí lắp đặt mới đã được thêm");
        }
      } catch (err) {
        console.error("InstallLocation save error:", err);
        error("Lỗi", "Không thể lưu vị trí lắp đặt");
      }
    }
    setShowInstallLocationModal(false);
    setEditingInstallLocation(null);
  };

  const handleDeleteInstallLocation = async (locationId: string) => {
    try {
      const res = await fetch(`/api/installation-locations/${locationId}`, { method: "DELETE" });
      if (!res.ok) {
        error("Lỗi", "Không thể xóa vị trí lắp đặt");
        return;
      }
      setInstallLocations(prev => prev.filter(l => l.id !== locationId));
      success("Đã xóa", "Vị trí lắp đặt đã được xóa");
    } catch (err) {
      console.error("InstallLocation delete error", err);
      error("Lỗi", "Không thể xóa vị trí lắp đặt");
    }
  };

  // ============ COUNTRY MANAGEMENT ============
  const handleAddCountry = () => {
    if (!newCountry.trim()) return;
    fetch("/api/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCountry.trim() }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("add_failed");
        const data = await res.json();
        setCountryList(data);
        success("Đã thêm", `Nước sản xuất "${newCountry}" đã được thêm`);
        setNewCountry("");
      })
      .catch((err) => {
        console.error("Country add error", err);
        error("Lỗi", "Không thể thêm nước sản xuất");
      });
  };

  const handleDeleteCountry = (index: number) => {
    const target = countryList[index];
    if (!target) return;
    fetch("/api/countries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: target }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("delete_failed");
        const data = await res.json();
        setCountryList(data);
        success("Đã xóa", "Nước sản xuất đã được xóa");
      })
      .catch((err) => {
        console.error("Country delete error", err);
        error("Lỗi", "Không thể xóa nước sản xuất");
      });
  };

  // ============ SUPPLIER MANAGEMENT ============
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  const paginatedSuppliers = filteredSuppliers.slice((supplierPage - 1) * suppliersPerPage, supplierPage * suppliersPerPage);
  const totalSupplierPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);

  const handleSaveSupplier = async () => {
    if (editingSupplier) {
      try {
        if (editingSupplier.id) {
          // Update existing supplier
          const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingSupplier.name,
              address: editingSupplier.address,
              phone: editingSupplier.phone,
              email: editingSupplier.email,
              contactPerson: editingSupplier.contactPerson,
              isActive: editingSupplier.isActive,
            }),
          });
          if (!res.ok) throw new Error("Failed to update supplier");
          const updated = await res.json();
          setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...updated, createdAt: s.createdAt } : s));
          success("Đã cập nhật", "Nhà cung cấp đã được cập nhật");
        } else {
          // Create new supplier - code will be auto-generated
          const res = await fetch("/api/suppliers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingSupplier.name,
              address: editingSupplier.address || "",
              phone: editingSupplier.phone || "",
              email: editingSupplier.email || "",
              contactPerson: editingSupplier.contactPerson || "",
              isActive: editingSupplier.isActive ?? true,
            }),
          });
          if (!res.ok) throw new Error("Failed to create supplier");
          const created = await res.json();
          setSuppliers(prev => [...prev, { ...created, createdAt: new Date().toISOString() }]);
          success("Đã thêm", "Nhà cung cấp mới đã được thêm");
        }
      } catch (err) {
        console.error("Supplier save error:", err);
        error("Lỗi", "Không thể lưu nhà cung cấp vào cơ sở dữ liệu");
      }
    }
    setShowSupplierModal(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}`, { method: "DELETE" });
      if (!res.ok) {
        error("Lỗi", "Không thể xóa nhà cung cấp");
        return;
      }
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      success("Đã xóa", "Nhà cung cấp đã được xóa");
    } catch (err) {
      console.error("Supplier delete error", err);
      error("Lỗi", "Không thể xóa nhà cung cấp");
    }
  };

  // ============ HISTORY CONFIG ============
  const handleSaveHistoryConfig = async () => {
    try {
      const res = await fetch("/api/history-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historyConfig),
      });
      if (!res.ok) throw new Error("Failed to save history config");
      const data = await res.json();
      setHistoryConfig(data);
      success("Đã lưu", "Cấu hình lịch sử đã được lưu");
    } catch (err) {
      console.error("History config save error", err);
      error("Lỗi", "Không thể lưu cấu hình lịch sử");
    }
  };

  // ============ RENDER SECTIONS ============
  const renderUsersSection = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={userSearchTerm}
            onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        
        <select
          value={userFilters.position || ""}
          onChange={(e) => { setUserFilters({ ...userFilters, position: e.target.value }); setUserPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-purple-500"
        >
          <option value="">Tất cả chức vụ</option>
          {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <select
          value={userFilters.department || ""}
          onChange={(e) => { setUserFilters({ ...userFilters, department: e.target.value }); setUserPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-purple-500"
        >
          <option value="">Tất cả khoa phòng</option>
          {[...new Set(users.map(u => u.department))].map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <button
          onClick={handleExportUsers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <Download size={16} />
          Xuất file
        </button>

        <button
          onClick={() => setShowColumnConfig(!showColumnConfig)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            showColumnConfig ? "text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
          }`}
          style={showColumnConfig ? { background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" } : {}}
        >
          <Columns3 size={16} />
          Cấu hình cột
        </button>

        <button
          onClick={() => { setEditingUser({ id: "", username: "", password: "", fullName: "", employeeId: "", phone: "", email: "", position: "", department: "", branch: "", signature: "", autoAttachSignature: false, managedDevices: [], profileIds: [], isActive: true, createdAt: "" }); setShowUserModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <Plus size={16} />
          Thêm người dùng
        </button>
      </div>

      {/* Column Configuration */}
      {showColumnConfig && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 fade-in">
          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Columns3 size={16} className="text-purple-600" />
            Cấu hình hiển thị cột
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["username", "fullName", "employeeId", "phone", "email", "position", "department", "branch", "profile", "status"] as UserColumn[]).map(col => (
              <label key={col} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(col)}
                  onChange={() => toggleColumn(col)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span className="text-sm text-slate-600">
                  {col === "username" && "Tên đăng nhập"}
                  {col === "fullName" && "Họ và tên"}
                  {col === "employeeId" && "Mã NV"}
                  {col === "phone" && "SĐT"}
                  {col === "email" && "Email"}
                  {col === "position" && "Chức vụ"}
                  {col === "department" && "Khoa phòng"}
                  {col === "branch" && "Chi nhánh"}
                  {col === "profile" && "Profile"}
                  {col === "status" && "Trạng thái"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl">
        <select
          value={userFilters.status || ""}
          onChange={(e) => { setUserFilters({ ...userFilters, status: e.target.value }); setUserPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          Hiển thị {paginatedUsers.length} / {filteredUsers.length} người dùng
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {usersLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <RefreshCw size={20} className="animate-spin mr-2" />
            <span className="text-sm">Đang tải danh sách người dùng...</span>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {visibleColumns.has("username") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên đăng nhập</th>}
                {visibleColumns.has("fullName") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Họ và tên</th>}
                {visibleColumns.has("employeeId") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã NV</th>}
                {visibleColumns.has("phone") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">SĐT</th>}
                {visibleColumns.has("email") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>}
                {visibleColumns.has("position") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Chức vụ</th>}
                {visibleColumns.has("department") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Khoa phòng</th>}
                {visibleColumns.has("branch") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Chi nhánh</th>}
                {visibleColumns.has("profile") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Profile</th>}
                {visibleColumns.has("status") && <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>}
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  {visibleColumns.has("username") && (
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{u.username}</span>
                    </td>
                  )}
                  {visibleColumns.has("fullName") && (
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700 text-sm">{u.fullName}</p>
                    </td>
                  )}
                  {visibleColumns.has("employeeId") && (
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{u.employeeId}</span>
                    </td>
                  )}
                  {visibleColumns.has("phone") && (
                    <td className="px-4 py-3 text-sm text-slate-600">{u.phone}</td>
                  )}
                  {visibleColumns.has("email") && (
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                  )}
                  {visibleColumns.has("position") && (
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{u.position}</span>
                    </td>
                  )}
                  {visibleColumns.has("department") && (
                    <td className="px-4 py-3 text-sm text-slate-600">{u.department}</td>
                  )}
                  {visibleColumns.has("branch") && (
                    <td className="px-4 py-3 text-sm text-slate-600">{u.branch}</td>
                  )}
                  {visibleColumns.has("profile") && (
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        {profiles.find(p => p.id === u.profileIds[0])?.name || "Chưa gán"}
                      </span>
                    </td>
                  )}
                  {visibleColumns.has("status") && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {u.isActive ? <Check size={12} /> : <X size={12} />}
                        {u.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingUser({ ...u, password: "" }); setShowUserModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}


        {/* Pagination */}
        {totalUserPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Trang {userPage} / {totalUserPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                disabled={userPage === 1}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                disabled={userPage === totalUserPages}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
              >
                <ChevronRight2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            {/* Header with gradient */}
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingUser.id ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowUserModal(false); setEditingUser(null); }} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Mật khẩu {editingUser.id ? "(để trống nếu không đổi)" : "*"}</label>
                  <input
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Mã nhân viên *</label>
                  <input
                    type="text"
                    value={editingUser.employeeId}
                    onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Chức vụ *</label>
                  <select
                    value={editingUser.position}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  >
                    <option value="">Chọn chức vụ</option>
                    {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Khoa phòng *</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => {
                      const selectedDept = departments.find(d => d.name === e.target.value);
                      const parentBranch = selectedDept ? branches.find(b => b.id === selectedDept.branchId) : null;
                      setEditingUser({
                        ...editingUser,
                        department: e.target.value,
                        ...(parentBranch ? { branch: parentBranch.name } : {}),
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                  >
                    <option value="">Chọn khoa phòng</option>
                    {departments
                      .filter(d => d.isActive && (!editingUser.branch || branches.find(b => b.name === editingUser.branch)?.id === d.branchId))
                      .map(d => <option key={d.id} value={d.name}>{d.code} - {d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Chi nhánh *</label>
                <select
                  value={editingUser.branch}
                  onChange={(e) => {
                    const selectedBranch = branches.find(b => b.name === e.target.value);
                    const currentDept = departments.find(d => d.name === editingUser.department);
                    const deptBelongsToBranch = currentDept && selectedBranch && currentDept.branchId === selectedBranch.id;
                    setEditingUser({
                      ...editingUser,
                      branch: e.target.value,
                      ...(!deptBelongsToBranch ? { department: "" } : {}),
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                >
                  <option value="">Chọn chi nhánh</option>
                  {branches.filter(b => b.isActive).map(b => <option key={b.id} value={b.name}>{b.code} - {b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Profile *</label>
                <select
                  value={editingUser.profileIds[0] || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, profileIds: [e.target.value] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500"
                >
                  <option value="">Chọn profile</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Thiết bị quản lý</label>
                <select
                  multiple
                  value={editingUser.managedDevices}
                  onChange={(e) => setEditingUser({ ...editingUser, managedDevices: Array.from(e.target.selectedOptions, opt => opt.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 h-32"
                >
                  {mockDevices.map(d => <option key={d.id} value={d.code}>{d.name} ({d.code})</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều</p>
              </div>
              {/* Digital Signature Section */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Pen size={16} className="text-violet-500" />
                    Thiết lập Chữ ký điện tử
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Tự động đính kèm chữ ký</span>
                    <button
                      type="button"
                      disabled={!editingUser.signature}
                      onClick={() => setEditingUser({ ...editingUser, autoAttachSignature: !editingUser.autoAttachSignature })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editingUser.autoAttachSignature && editingUser.signature
                          ? "bg-violet-500"
                          : "bg-slate-300"
                      } ${!editingUser.signature ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          editingUser.autoAttachSignature && editingUser.signature ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Mode tabs */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSignatureMode("upload")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      signatureMode === "upload"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <Image size={14} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("draw")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      signatureMode === "draw"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <Pen size={14} />
                    Vẽ chữ ký
                  </button>
                </div>

                {/* Upload mode */}
                {signatureMode === "upload" && (
                  <div>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors">
                      <Upload size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-500">Chọn file ảnh chữ ký (PNG, JPG)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            error("Lỗi", "File ảnh không được vượt quá 2MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            setEditingUser({ ...editingUser, signature: base64, autoAttachSignature: true });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Draw mode */}
                {signatureMode === "draw" && (
                  <div className="space-y-2">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={180}
                        className="w-full cursor-crosshair"
                        style={{ touchAction: "none" }}
                        onMouseDown={(e) => {
                          setIsDrawing(true);
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          const rect = canvas.getBoundingClientRect();
                          const scaleX = canvas.width / rect.width;
                          const scaleY = canvas.height / rect.height;
                          ctx.beginPath();
                          ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                        }}
                        onMouseMove={(e) => {
                          if (!isDrawing) return;
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          const rect = canvas.getBoundingClientRect();
                          const scaleX = canvas.width / rect.width;
                          const scaleY = canvas.height / rect.height;
                          ctx.strokeStyle = "#1e293b";
                          ctx.lineWidth = 2;
                          ctx.lineCap = "round";
                          ctx.lineJoin = "round";
                          ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                          ctx.stroke();
                        }}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          setIsDrawing(true);
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          const rect = canvas.getBoundingClientRect();
                          const touch = e.touches[0];
                          const scaleX = canvas.width / rect.width;
                          const scaleY = canvas.height / rect.height;
                          ctx.beginPath();
                          ctx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault();
                          if (!isDrawing) return;
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          const rect = canvas.getBoundingClientRect();
                          const touch = e.touches[0];
                          const scaleX = canvas.width / rect.width;
                          const scaleY = canvas.height / rect.height;
                          ctx.strokeStyle = "#1e293b";
                          ctx.lineWidth = 2;
                          ctx.lineCap = "round";
                          ctx.lineJoin = "round";
                          ctx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
                          ctx.stroke();
                        }}
                        onTouchEnd={() => setIsDrawing(false)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <RotateCcw size={13} />
                        Xóa / Vẽ lại
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const base64 = canvas.toDataURL("image/png");
                          setEditingUser({ ...editingUser, signature: base64, autoAttachSignature: true });
                          success("Đã lưu", "Chữ ký vẽ đã được lưu");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                      >
                        <Save size={13} />
                        Lưu chữ ký vẽ
                      </button>
                    </div>
                  </div>
                )}

                {/* Signature Preview */}
                {editingUser.signature && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Xem trước chữ ký</span>
                      <button
                        type="button"
                        onClick={() => setEditingUser({ ...editingUser, signature: "", autoAttachSignature: false })}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Xóa chữ ký
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-center">
                      <img
                        src={editingUser.signature}
                        alt="Chữ ký"
                        className="max-h-24 max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span className="text-sm text-slate-600">Hoạt động</span>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveUser}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfilesSection = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm profile..."
            value={profileSearchTerm}
            onChange={(e) => { setProfileSearchTerm(e.target.value); setProfilePage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <button
          onClick={() => { 
            const maxCode = profiles.reduce((max, p) => {
              const num = parseInt(p.code?.replace(/\D/g, '') || '0');
              return num > max ? num : max;
            }, 0);
            const newCode = String(maxCode + 1).padStart(3, '0');
            const newProfile: Profile = {
              id: "",
              code: newCode,
              name: "",
              description: "",
              permissions: permissionCategories.flatMap(cat => [
                { id: `${cat.id}-1`, category: cat.id, name: cat.id === "quan_ly_chung" ? "Xem thông báo yêu cầu thiết bị mới" : cat.id === "thiet_bi_moi" ? "Cho phép vào mục thiết bị mới" : cat.id === "ho_so_thiet_bi" ? "Cho phép vào mục hồ sơ thiết bị" : cat.id === "quan_tri" ? "Cho phép vào phần quản trị" : "Cho phép vào phần xem lịch sử", enabled: false }
              ]),
              detailedPermissions: DEFAULT_DETAILED_PERMISSIONS.map(p => ({ ...p, enabled: false })),
              createdAt: ""
            };
            setEditingProfile(newProfile); 
            setShowProfileModal(true); 
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
        >
          <Plus size={16} />
          Tạo Profile mới
        </button>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã Profile</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên Profile</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mô tả</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Số quyền</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedProfiles.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{p.code || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700 text-sm">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.description}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      {p.permissions.filter(perm => perm.enabled).length} / {p.permissions.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { 
                          const profileToEdit = { 
                            ...p, 
                            detailedPermissions: p.detailedPermissions || DEFAULT_DETAILED_PERMISSIONS.map(d => ({ ...d, enabled: d.enabled })) 
                          };
                          setEditingProfile(profileToEdit); 
                          setShowProfileModal(true); 
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalProfilePages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Trang {profilePage} / {totalProfilePages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setProfilePage(p => Math.max(1, p - 1))} disabled={profilePage === 1} className="p-2 rounded-lg bg-slate-100 disabled:opacity-50">ChevronLeft</button>
              <button onClick={() => setProfilePage(p => Math.min(totalProfilePages, p + 1))} disabled={profilePage === totalProfilePages} className="p-2 rounded-lg bg-slate-100 disabled:opacity-50">ChevronRight2</button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && editingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-[95vw] xl:max-w-[1600px] max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            {/* Header with gradient */}
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserCheck size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingProfile.id ? "Chỉnh sửa Profile" : "Tạo Profile mới"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowProfileModal(false); setEditingProfile(null); }} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {editingProfile.id && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">ID Profile</label>
                    <input
                      type="text"
                      value={editingProfile.id}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Tên Profile *</label>
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
                    placeholder="Nhập tên profile"
                  />
                </div>
                <div className={editingProfile.id ? '' : 'md:col-span-2'}>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Mô tả</label>
                  <input
                    type="text"
                    value={editingProfile.description}
                    onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
                    placeholder="Mô tả profile"
                  />
                </div>
              </div>

              {/* Detailed Permission Matrix */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-3">Ma trận phân quyền</label>
                <div className="space-y-3">
                  {/* MODULE 1: QUẢN LÝ CHUNG */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => toggleModule('dashboard')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                          <Settings size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-sm">1. QUẢN LÝ CHUNG (Dashboard)</h4>
                          <p className="text-xs text-slate-500">Theo dõi cảnh báo và phê duyệt tổng hợp</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Master Toggle Switch */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModuleAll('dashboard', !isModuleAllEnabled('dashboard')); }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isModuleAllEnabled('dashboard') ? 'bg-blue-500' : isModulePartial('dashboard') ? 'bg-amber-400' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isModuleAllEnabled('dashboard') ? 'translate-x-5' : isModulePartial('dashboard') ? 'translate-x-2.5' : 'translate-x-0.5'}`} />
                        </button>
                        {expandedModules.has('dashboard') ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>
                    </button>
                    {expandedModules.has('dashboard') && (
                      <div className="p-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Function Permissions */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                              <CheckSquare size={12} /> Quyền Chức năng
                            </h5>
                            {getDetailedPermissions('dashboard', 'function').map(perm => (
                              <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={perm.enabled}
                                  onChange={() => toggleDetailedPermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-blue-600"
                                />
                                <div className="text-xs">
                                  <span className="text-slate-700 font-medium">{perm.name}</span>
                                  {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                          {/* File Permissions */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center gap-1">
                              <Upload size={12} /> Quyền File Đính kèm
                            </h5>
                            {getDetailedPermissions('dashboard', 'file').map(perm => (
                              <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={perm.enabled}
                                  onChange={() => toggleDetailedPermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-purple-600"
                                />
                                <div className="text-xs">
                                  <span className="text-slate-700 font-medium">{perm.name}</span>
                                  {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 2: THIẾT BỊ MỚI */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => toggleModule('new_device')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                          <Plus size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-sm">2. THIẾT BỊ MỚI (Đề xuất)</h4>
                          <p className="text-xs text-slate-500">Xin cấp ngân sách mua sắm máy mới</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModuleAll('new_device', !isModuleAllEnabled('new_device')); }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isModuleAllEnabled('new_device') ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isModuleAllEnabled('new_device') ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        {expandedModules.has('new_device') ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>
                    </button>
                    {expandedModules.has('new_device') && (
                      <div className="p-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1">
                              <CheckSquare size={12} /> Quyền Chức năng
                            </h5>
                            {getDetailedPermissions('new_device', 'function').map(perm => (
                              <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={perm.enabled}
                                  onChange={() => toggleDetailedPermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-green-600"
                                />
                                <div className="text-xs">
                                  <span className="text-slate-700 font-medium">{perm.name}</span>
                                  {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center gap-1">
                              <Upload size={12} /> Quyền File Đính kèm
                            </h5>
                            {getDetailedPermissions('new_device', 'file').map(perm => (
                              <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={perm.enabled}
                                  onChange={() => toggleDetailedPermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-purple-600"
                                />
                                <div className="text-xs">
                                  <span className="text-slate-700 font-medium">{perm.name}</span>
                                  {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 3: HỒ SƠ THIẾT BỊ */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => toggleModule('device_profile')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                          <Shield size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-sm">3. HỒ SƠ THIẾT BỊ</h4>
                          <p className="text-xs text-slate-500">Kho dữ liệu cốt lõi - Vòng đời máy móc</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModuleAll('device_profile', !isModuleAllEnabled('device_profile')); }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isModuleAllEnabled('device_profile') ? 'bg-orange-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isModuleAllEnabled('device_profile') ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        {expandedModules.has('device_profile') ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>
                    </button>
                    {expandedModules.has('device_profile') && (
                      <div className="border-t border-slate-100 space-y-2 p-3 bg-slate-50/50">
                        {/* 3.1 Căn bản */}
                        <SubModuleAccordion
                          title="3.1. Căn bản (Kho thiết bị)"
                          subModuleId="device_basic"
                          permissions={getDetailedPermissions('device_profile', undefined, 'device_basic')}
                          color="blue"
                        />
                        {/* 3.2 Tiếp nhận */}
                        <SubModuleAccordion
                          title="3.2. Tiếp nhận (Reception)"
                          subModuleId="reception"
                          permissions={getDetailedPermissions('device_profile', undefined, 'reception')}
                          color="cyan"
                        />
                        {/* 3.3 Báo cáo sự cố */}
                        <SubModuleAccordion
                          title="3.3. Báo cáo Sự cố (Incidents)"
                          subModuleId="incident"
                          permissions={getDetailedPermissions('device_profile', undefined, 'incident')}
                          color="red"
                        />
                        {/* 3.4 Hiệu chuẩn & Bảo dưỡng */}
                        <SubModuleAccordion
                          title="3.4. Hiệu chuẩn & Bảo dưỡng"
                          subModuleId="calibration"
                          permissions={getDetailedPermissions('device_profile', undefined, 'calibration')}
                          color="violet"
                        />
                        {/* 3.5 Điều chuyển & Thanh lý */}
                        <SubModuleAccordion
                          title="3.5. Điều chuyển & Thanh lý"
                          subModuleId="transfer"
                          permissions={getDetailedPermissions('device_profile', undefined, 'transfer')}
                          color="pink"
                        />
                        {/* 3.6 Đào tạo */}
                        <SubModuleAccordion
                          title="3.6. Đào tạo (Training)"
                          subModuleId="training"
                          permissions={getDetailedPermissions('device_profile', undefined, 'training')}
                          color="teal"
                        />
                        {/* 3.7 Thông tin Quản lý */}
                        <SubModuleAccordion
                          title="3.7. Thông tin Quản lý"
                          subModuleId="info_management"
                          permissions={getDetailedPermissions('device_profile', undefined, 'info_management')}
                          color="slate"
                        />
                      </div>
                    )}
                  </div>

                  {/* MODULE 4: QUẢN TRỊ */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => toggleModule('admin')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                          <Settings size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-sm">4. QUẢN TRỊ (Admin)</h4>
                          <p className="text-xs text-slate-500">Khu vực &quot;buồng lái&quot; - Cấu hình hệ thống</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModuleAll('admin', !isModuleAllEnabled('admin')); }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isModuleAllEnabled('admin') ? 'bg-purple-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isModuleAllEnabled('admin') ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        {expandedModules.has('admin') ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>
                    </button>
                    {expandedModules.has('admin') && (
                      <div className="p-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center gap-1">
                              <CheckSquare size={12} /> Quyền Chức năng
                            </h5>
                            {getDetailedPermissions('admin', 'function').map(perm => (
                              <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={perm.enabled}
                                  onChange={() => toggleDetailedPermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-purple-600"
                                />
                                <div className="text-xs">
                                  <span className="text-slate-700 font-medium">{perm.name}</span>
                                  {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-rose-600 uppercase mb-2 flex items-center gap-1">
                              <Upload size={12} /> Quyền File Đính kèm
                            </h5>
                            {getDetailedPermissions('admin', 'file').map(perm => (
                              <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={perm.enabled}
                                  onChange={() => toggleDetailedPermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-rose-600"
                                />
                                <div className="text-xs">
                                  <span className="text-slate-700 font-medium">{perm.name}</span>
                                  {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 5: LỊCH SỬ */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => toggleModule('history')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-slate-50 to-zinc-50 hover:from-slate-100 hover:to-zinc-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-500 flex items-center justify-center">
                          <History size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-sm">5. LỊCH SỬ (Audit Trail)</h4>
                          <p className="text-xs text-slate-500">Giám sát hành vi - Phục vụ thanh tra ISO</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModuleAll('history', !isModuleAllEnabled('history')); }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isModuleAllEnabled('history') ? 'bg-slate-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isModuleAllEnabled('history') ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        {expandedModules.has('history') ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>
                    </button>
                    {expandedModules.has('history') && (
                      <div className="p-4 border-t border-slate-100">
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                            <CheckSquare size={12} /> Quyền Chức năng
                          </h5>
                          {getDetailedPermissions('history', 'function').map(perm => (
                            <label key={perm.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                              <input
                                type="checkbox"
                                checked={perm.enabled}
                                onChange={() => toggleDetailedPermission(perm.id)}
                                className="mt-0.5 w-4 h-4 rounded text-slate-600"
                              />
                              <div className="text-xs">
                                <span className="text-slate-700 font-medium">{perm.name}</span>
                                {perm.description && <p className="text-slate-400 text-[10px]">{perm.description}</p>}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => { setShowProfileModal(false); setEditingProfile(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                <Save size={18} />
                Lưu Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBranchesSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Globe size={18} className="text-green-600" />
            Danh sách Chi nhánh
          </h3>
          <button
            onClick={() => { 
              const maxCode = branches.reduce((max, b) => {
                const num = parseInt(b.code?.replace(/\D/g, '') || '0');
                return num > max ? num : max;
              }, 0);
              const newCode = String(maxCode + 1).padStart(3, '0');
              setEditingBranch({ id: "", name: "", code: newCode, isActive: true }); 
              setShowBranchModal(true); 
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            <Plus size={16} />
            Thêm Chi nhánh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-green-700 uppercase">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-green-700 uppercase">Tên Chi nhánh</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-green-700 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-green-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {branches.map(branch => (
                <tr key={branch.id} className="hover:bg-green-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">{branch.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{branch.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {branch.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingBranch(branch); setShowBranchModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Modal */}
      {showBranchModal && editingBranch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Globe size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingBranch.id ? "Chỉnh sửa Chi nhánh" : "Thêm Chi nhánh mới"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowBranchModal(false); setEditingBranch(null); }} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tên Chi nhánh *</label>
                <input
                  type="text"
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-green-500"
                  placeholder="Nhập tên chi nhánh"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Mã Chi nhánh</label>
                <input
                  type="text"
                  value={editingBranch.code}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="branchActive"
                  checked={editingBranch.isActive}
                  onChange={(e) => setEditingBranch({ ...editingBranch, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <label htmlFor="branchActive" className="text-sm text-slate-600">Hoạt động</label>
              </div>
            </div>
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => { setShowBranchModal(false); setEditingBranch(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveBranch}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDepartmentsSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={18} className="text-orange-600" />
            Danh sách Khoa phòng
          </h3>
          <button
            onClick={() => { 
              const maxCode = departments.reduce((max, d) => {
                const num = parseInt(d.code?.replace(/\D/g, '') || '0');
                return num > max ? num : max;
              }, 0);
              const newCode = String(maxCode + 1).padStart(3, '0');
              setEditingDepartment({ id: "", name: "", code: newCode, branchId: "", isActive: true }); 
              setShowDepartmentModal(true); 
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Plus size={16} />
            Thêm Khoa phòng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-orange-700 uppercase">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-orange-700 uppercase">Tên Khoa phòng</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-orange-700 uppercase">Thuộc Chi nhánh</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-orange-700 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-orange-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {departments.map(dept => (
                <tr key={dept.id} className="hover:bg-orange-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg">{dept.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{dept.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {dept.branchName || <span className="text-slate-400 italic">Chưa chọn</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {dept.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingDepartment(dept); setShowDepartmentModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && editingDepartment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-orange-500 to-amber-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingDepartment.id ? "Chỉnh sửa Khoa phòng" : "Thêm Khoa phòng mới"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowDepartmentModal(false); setEditingDepartment(null); }} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tên Khoa phòng *</label>
                <input
                  type="text"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500"
                  placeholder="Nhập tên khoa phòng"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Mã Khoa phòng</label>
                <input
                  type="text"
                  value={editingDepartment.code}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Thuộc Chi nhánh *</label>
                <select
                  value={editingDepartment.branchId}
                  onChange={(e) => {
                    const selectedBranch = branches.find(b => b.id === e.target.value);
                    setEditingDepartment({ 
                      ...editingDepartment, 
                      branchId: e.target.value,
                      branchName: selectedBranch?.name || ''
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500"
                >
                  <option value="">-- Chọn Chi nhánh --</option>
                  {branches.filter(b => b.isActive).map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deptActive"
                  checked={editingDepartment.isActive}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label htmlFor="deptActive" className="text-sm text-slate-600">Hoạt động</label>
              </div>
            </div>
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => { setShowDepartmentModal(false); setEditingDepartment(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveDepartment}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPositionsSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={18} className="text-cyan-600" />
            Danh sách Chức vụ
          </h3>
          <button
            onClick={() => { 
              const maxCode = positions.reduce((max, p) => {
                const num = parseInt(p.code?.replace(/\D/g, '') || '0');
                return num > max ? num : max;
              }, 0);
              const newCode = String(maxCode + 1).padStart(3, '0');
              setEditingPosition({ id: "", name: "", code: newCode, description: "", departmentId: "", isActive: true }); 
              setShowPositionModal(true); 
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
          >
            <Plus size={16} />
            Thêm Chức vụ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên Chức vụ</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Khoa phòng</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Chi nhánh</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {positions.map(pos => (
                <tr key={pos.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg">{pos.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{pos.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{pos.departmentName || <span className="text-slate-400 italic">Chưa chọn</span>}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{pos.branchName || <span className="text-slate-400 italic">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${pos.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {pos.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingPosition(pos); setShowPositionModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePosition(pos.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Modal */}
      {showPositionModal && editingPosition && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            {/* Header with gradient */}
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-cyan-500 to-blue-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Briefcase size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingPosition.id ? "Chỉnh sửa Chức vụ" : "Thêm Chức vụ mới"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowPositionModal(false); setEditingPosition(null); }} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
              {editingPosition.id && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">ID Chức vụ</label>
                  <input
                    type="text"
                    value={editingPosition.id}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tên Chức vụ *</label>
                <input
                  type="text"
                  value={editingPosition.name}
                  onChange={(e) => setEditingPosition({ ...editingPosition, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Mã Chức vụ</label>
                <input
                  type="text"
                  value={editingPosition.code}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Thuộc Khoa phòng *</label>
                <select
                  value={editingPosition.departmentId || ""}
                  onChange={(e) => {
                    const selectedDept = departments.find(d => d.id === e.target.value);
                    setEditingPosition({ 
                      ...editingPosition, 
                      departmentId: e.target.value,
                      departmentName: selectedDept?.name || '',
                      branchId: selectedDept?.branchId || '',
                      branchName: selectedDept?.branchName || ''
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500"
                >
                  <option value="">-- Chọn Khoa phòng --</option>
                  {departments.filter(d => d.isActive).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.code} - {dept.name} ({dept.branchName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Chi nhánh</label>
                <input
                  type="text"
                  value={editingPosition.branchName || editingPosition.branchId ? (departments.find(d => d.id === editingPosition.departmentId)?.branchName || '') : ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                  placeholder="Tự động điền khi chọn khoa phòng"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Mô tả</label>
                <textarea
                  value={editingPosition.description || ""}
                  onChange={(e) => setEditingPosition({ ...editingPosition, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 h-20 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingPosition.isActive}
                  onChange={(e) => setEditingPosition({ ...editingPosition, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600"
                />
                <span className="text-sm text-slate-600">Hoạt động</span>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => { setShowPositionModal(false); setEditingPosition(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSavePosition}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
              >
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInstallLocationsSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={18} className="text-teal-600" />
            Danh sách Vị trí lắp đặt
          </h3>
          <button
            onClick={() => {
              const maxCode = installLocations.reduce((max, l) => {
                const num = parseInt(l.code?.replace(/\D/g, '') || '0');
                return num > max ? num : max;
              }, 0);
              const newCode = String(maxCode + 1).padStart(3, '0');
              setEditingInstallLocation({ id: "", name: "", code: newCode, departmentId: "", isActive: true });
              setShowInstallLocationModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
            style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
          >
            <Plus size={16} />
            Thêm Vị trí
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên Vị trí</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Khoa phòng</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Chi nhánh</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {installLocations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{loc.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{loc.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{loc.departmentName || <span className="text-slate-400 italic">Chưa chọn</span>}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{loc.branchName || <span className="text-slate-400 italic">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${loc.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {loc.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingInstallLocation(loc); setShowInstallLocationModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteInstallLocation(loc.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Install Location Modal */}
      {showInstallLocationModal && editingInstallLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-teal-500 to-emerald-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <MapPin size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingInstallLocation.id ? "Chỉnh sửa Vị trí" : "Thêm Vị trí mới"}
                  </h3>
                </div>
                <button
                  onClick={() => { setShowInstallLocationModal(false); setEditingInstallLocation(null); }}
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
              {editingInstallLocation.id && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">ID Vị trí</label>
                  <input type="text" value={editingInstallLocation.id} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tên Vị trí *</label>
                <input
                  type="text"
                  value={editingInstallLocation.name}
                  onChange={(e) => setEditingInstallLocation({ ...editingInstallLocation, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Mã Vị trí</label>
                <input type="text" value={editingInstallLocation.code} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Thuộc Khoa phòng *</label>
                <select
                  value={editingInstallLocation.departmentId || ""}
                  onChange={(e) => {
                    const selectedDept = departments.find(d => d.id === e.target.value);
                    setEditingInstallLocation({
                      ...editingInstallLocation,
                      departmentId: e.target.value,
                      departmentName: selectedDept?.name || '',
                      branchId: selectedDept?.branchId || '',
                      branchName: selectedDept?.branchName || ''
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500"
                >
                  <option value="">-- Chọn Khoa phòng --</option>
                  {departments.filter(d => d.isActive).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.code} - {dept.name} ({dept.branchName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Chi nhánh</label>
                <input
                  type="text"
                  value={editingInstallLocation.branchName || (editingInstallLocation.departmentId ? (departments.find(d => d.id === editingInstallLocation.departmentId)?.branchName || '') : '')}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                  placeholder="Tự động điền khi chọn khoa phòng"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingInstallLocation.isActive}
                  onChange={(e) => setEditingInstallLocation({ ...editingInstallLocation, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <span className="text-sm text-slate-600">Hoạt động</span>
              </div>
            </div>
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => { setShowInstallLocationModal(false); setEditingInstallLocation(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveInstallLocation}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCountriesSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Globe size={18} className="text-green-600" />
          Danh sách Nước sản xuất
        </h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="Nhập tên nước sản xuất mới..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
            onKeyDown={(e) => { if (e.key === "Enter") handleAddCountry(); }}
          />
          <button
            onClick={handleAddCountry}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Plus size={16} />
            Thêm
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {countryList.map((country, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 group">
              <span className="text-sm font-medium text-slate-700">{country}</span>
              <button
                onClick={() => handleDeleteCountry(idx)}
                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSuppliersSection = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà cung cấp..."
            value={supplierSearchTerm}
            onChange={(e) => { setSupplierSearchTerm(e.target.value); setSupplierPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
          />
        </div>

        <button
          onClick={() => { setEditingSupplier({ id: "", name: "", code: "", address: "", phone: "", email: "", contactPerson: "", isActive: true }); setShowSupplierModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
          style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
        >
          <Plus size={16} />
          Thêm Nhà cung cấp
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên NCC</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Địa chỉ</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">SĐT</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Người liên hệ</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSuppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-lg">{s.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.address || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.email || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.contactPerson || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {s.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingSupplier(s); setShowSupplierModal(true); }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(s.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalSupplierPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Trang {supplierPage} / {totalSupplierPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setSupplierPage(p => Math.max(1, p - 1))} disabled={supplierPage === 1} className="p-2 rounded-lg bg-slate-100 disabled:opacity-50">ChevronLeft</button>
              <button onClick={() => setSupplierPage(p => Math.min(totalSupplierPages, p + 1))} disabled={supplierPage === totalSupplierPages} className="p-2 rounded-lg bg-slate-100 disabled:opacity-50">ChevronRight2</button>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Modal */}
      {showSupplierModal && editingSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            {/* Header with gradient */}
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-pink-500 to-rose-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Truck size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    {editingSupplier.id ? "Chỉnh sửa Nhà cung cấp" : "Thêm Nhà cung cấp mới"}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowSupplierModal(false); setEditingSupplier(null); }} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
              {editingSupplier.id && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">ID Nhà cung cấp</label>
                  <input
                    type="text"
                    value={editingSupplier.id}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tên NCC *</label>
                <input
                  type="text"
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Mã NCC</label>
                <input
                  type="text"
                  value={editingSupplier.code}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500"
                  placeholder="Mã sẽ được tự sinh khi lưu"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Địa chỉ</label>
                <textarea
                  value={editingSupplier.address || ""}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">SĐT</label>
                  <input
                    type="text"
                    value={editingSupplier.phone || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Người liên hệ</label>
                <input
                  type="text"
                  value={editingSupplier.contactPerson || ""}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={editingSupplier.isActive}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-pink-600"
                />
                <span className="text-sm text-slate-600 font-medium">Hoạt động</span>
              </div>
            </div>
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => { setShowSupplierModal(false); setEditingSupplier(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
              >
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Backup Section
  const renderBackupSection = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { devices, schedules, incidents, proposals, calibrationRequests, calibrationResults } = useData();
    
    // Get additional data from localStorage
    const getStoredData = () => {
      return { users, branches, positions, suppliers };
    };

    // Handle create backup
    const handleCreateBackup = async () => {
      if (!user || !['Admin', 'Giám đốc'].includes(user.role)) {
        error('Lỗi', 'Bạn không có quyền tạo bản sao lưu');
        return;
      }
      
      setBackupLoading(true);
      try {
        const { users, branches, positions, suppliers } = getStoredData();
        const data = {
          devices: devices || [],
          schedules: schedules || [],
          incidents: incidents || [],
          proposals: proposals || [],
          calibrationRequests: calibrationRequests || [],
          calibrationResults: calibrationResults || [],
          users: users,
          branches: branches,
          positions: positions,
          suppliers: suppliers,
        };

        const { blob, data: backupData } = await createBackup(data, user.fullName);
        downloadBackup(blob);

        // Save to history
        const newBackup: BackupMetadata = {
          id: `backup-${Date.now()}`,
          createdAt: backupData.createdAt,
          createdBy: backupData.createdBy,
          size: blob.size,
          recordCount: backupData.totalRecords,
        };
        const updatedHistory = [newBackup, ...backupHistory].slice(0, maxBackupsToKeep);
        setBackupHistory(updatedHistory);
        saveBackupHistory(updatedHistory);

        success('Thành công', 'Đã tạo bản sao lưu và tải về máy');
      } catch (err) {
        console.error('Backup failed:', err);
        error('Lỗi', 'Không thể tạo bản sao lưu');
      } finally {
        setBackupLoading(false);
      }
    };

    // Handle file restore
    const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const result = await validateBackupFile(file);
      if (!result.valid) {
        error('Lỗi', result.error || 'File sao lưu không hợp lệ');
        return;
      }
      setPendingRestoreData(result.data);
      setShowRestoreConfirm(true);
      event.target.value = '';
    };

    // Confirm restore
    const confirmRestore = () => {
      if (!pendingRestoreData) return;

      try {
        localStorage.setItem('labhouse_restore_data', JSON.stringify(pendingRestoreData));
        success('Thành công', 'Dữ liệu đã được khôi phục. Trang sẽ được tải lại.');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err) {
        error('Lỗi', 'Không thể khôi phục dữ liệu');
      }
      setShowRestoreConfirm(false);
      setPendingRestoreData(null);
      setRestoreConfirmChecked(false);
    };

    // Delete backup from history
    const handleDeleteBackup = (id: string) => {
      const updated = backupHistory.filter(b => b.id !== id);
      setBackupHistory(updated);
      localStorage.setItem('backup_history', JSON.stringify(updated));
      success('Thành công', 'Đã xóa bản sao lưu');
    };

    // Save auto backup config
    const handleSaveConfig = () => {
      const config = {
        autoBackupEnabled,
        autoBackupFrequency,
        autoBackupTime,
        maxBackupsToKeep,
      };
      localStorage.setItem('backup_config', JSON.stringify(config));
      success('Thành công', 'Đã lưu cấu hình sao lưu tự động');
    };

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const lastBackup = backupHistory[0];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Database size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sao lưu & Khôi phục dữ liệu</h2>
            <p className="text-sm text-slate-500">Quản lý dữ liệu và sao lưu hệ thống</p>
          </div>
        </div>

        {/* Backup and Restore Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Save size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800">Sao lưu dữ liệu</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              Tạo bản sao lưu toàn bộ dữ liệu hiện tại và tải về máy
            </p>

            {lastBackup && (
              <div className="text-sm text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
                <p>Bản sao lưu gần nhất:</p>
                <p className="font-medium">{new Date(lastBackup.createdAt).toLocaleString('vi-VN')}</p>
                <p className="text-xs">{lastBackup.recordCount.toLocaleString()} bản ghi • {formatSize(lastBackup.size)}</p>
              </div>
            )}

            <button
              onClick={handleCreateBackup}
              disabled={backupLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {backupLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Database size={18} />
              )}
              {backupLoading ? 'Đang tạo...' : 'Tạo bản sao lưu ngay'}
            </button>
          </div>

          {/* Restore Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <RotateCcw size={20} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-800">Khôi phục dữ liệu</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              Khôi phục dữ liệu từ file sao lưu (.json)
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center mb-4">
              <Upload size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 mb-3">Kéo thả file hoặc nhấp để chọn</p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
                id="restore-file"
              />
              <label
                htmlFor="restore-file"
                className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-amber-100"
              >
                Chọn file .json
              </label>
            </div>

            <p className="text-xs text-red-500">
              ⚠️ Lưu ý: Hành động này sẽ thay thế toàn bộ dữ liệu hiện tại
            </p>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-slate-600" />
              Lịch sử sao lưu
            </h3>
          </div>

          {backupHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Database size={40} className="mx-auto mb-3 text-slate-300" />
              <p>Chưa có bản sao lưu nào</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Người tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kích thước</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Số bản ghi</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backupHistory.map((backup, index) => (
                  <tr key={backup.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {new Date(backup.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{backup.createdBy}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatSize(backup.size)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{backup.recordCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Tải về"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Auto Backup Config */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Settings size={18} className="text-slate-600" />
            Cấu hình sao lưu tự động
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <h4 className="font-semibold text-slate-700">Bật sao lưu tự động</h4>
                <p className="text-sm text-slate-500 mt-1">Hệ thống sẽ tự động tạo bản sao lưu theo lịch cấu hình</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackupEnabled}
                  onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {autoBackupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tần suất</label>
                  <select
                    value={autoBackupFrequency}
                    onChange={(e) => setAutoBackupFrequency(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Thời điểm</label>
                  <select
                    value={autoBackupTime}
                    onChange={(e) => setAutoBackupTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số bản giữ lại</label>
                  <select
                    value={maxBackupsToKeep}
                    onChange={(e) => setMaxBackupsToKeep(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                  >
                    {[5, 10, 15, 20, 30].map(n => (
                      <option key={n} value={n}>{n} bản</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveConfig}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 flex items-center gap-2"
            >
              <Save size={18} />
              Lưu cấu hình
            </button>
          </div>
        </div>

        {/* Restore Confirmation Modal */}
        {showRestoreConfirm && pendingRestoreData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <RotateCcw size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Cảnh báo khôi phục dữ liệu</h3>
                  <p className="text-sm text-slate-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">⚠️ CẢNH BÁO!</p>
                <p className="text-sm text-red-700">
                  Hành động này sẽ <strong>THAY THẾ</strong> toàn bộ dữ liệu hiện tại bằng dữ liệu từ file sao lưu.
                </p>
                <div className="mt-3 text-sm text-red-600">
                  <p>File: {pendingRestoreData.createdAt ? `labhouse_backup_${new Date(pendingRestoreData.createdAt).toISOString().split('T')[0]}.json` : 'unknown'}</p>
                  <p>Ngày backup: {pendingRestoreData.createdAt ? new Date(pendingRestoreData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  <p>Số bản ghi: {pendingRestoreData.totalRecords?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreConfirmChecked}
                  onChange={(e) => setRestoreConfirmChecked(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-slate-700">
                  Tôi hiểu rủi ro và muốn tiếp tục khôi phục dữ liệu
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRestoreConfirm(false); setPendingRestoreData(null); setRestoreConfirmChecked(false); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmRestore}
                  disabled={!restoreConfirmChecked}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Khôi phục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);
  const [deleteFromDate, setDeleteFromDate] = useState("");
  const [deleteToDate, setDeleteToDate] = useState("");

  const handleDeleteHistoryNow = () => {
    // Show modal to select date range
    setDeleteFromDate("");
    setDeleteToDate("");
    setShowDeleteHistoryModal(true);
  };

  const confirmDeleteHistory = () => {
    if (!deleteFromDate || !deleteToDate) {
      error("Lỗi", "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
      return;
    }
    
    const fromDate = new Date(deleteFromDate);
    const toDate = new Date(deleteToDate);
    toDate.setHours(23, 59, 59, 999); // End of day
    
    const allData = localStorage.getItem('labhouse_data');
    if (allData) {
      try {
        const parsed = JSON.parse(allData);
        const originalCount = parsed.history?.length || 0;
        
        if (parsed.history && Array.isArray(parsed.history)) {
          const filteredHistory = parsed.history.filter((log: any) => {
            const logDate = new Date(log.timestamp);
            return logDate < fromDate || logDate > toDate;
          });
          parsed.history = filteredHistory;
          localStorage.setItem('labhouse_data', JSON.stringify(parsed));
          success('Thành công', `Đã xóa ${originalCount - filteredHistory.length} bản ghi lịch sử trong khoảng thời gian đã chọn`);
        }
      } catch (err) {
        error('Lỗi', 'Không thể xóa lịch sử');
      }
    } else {
      success('Thông báo', 'Chưa có dữ liệu lịch sử để xóa');
    }
    setShowDeleteHistoryModal(false);
  };

  const renderHistoryConfigSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
          <History size={18} className="text-slate-600" />
          Cấu hình Lịch sử Hành động
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
            <div>
              <h4 className="font-semibold text-slate-700">Tự động xóa lịch sử</h4>
              <p className="text-sm text-slate-500 mt-1">Cho phép hệ thống tự động xóa các bản ghi lịch sử cũ để tiết kiệm dung lượng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={historyConfig.autoDeleteEnabled}
                onChange={(e) => setHistoryConfig({ ...historyConfig, autoDeleteEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-slate-600"></div>
            </label>
          </div>

          {historyConfig.autoDeleteEnabled && (
            <div className="fade-in">
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Xóa lịch sử sau bao nhiêu ngày?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={historyConfig.deleteAfterDays}
                  onChange={(e) => setHistoryConfig({ ...historyConfig, deleteAfterDays: parseInt(e.target.value) || 365 })}
                  className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-500"
                />
                <span className="text-sm text-slate-600">ngày</span>
                <span className="text-xs text-slate-400">
                  (Tối thiểu 30 ngày, tối đa 10 năm)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Các bản ghi lịch sử cũ hơn {historyConfig.deleteAfterDays} ngày sẽ được tự động xóa
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-700">Lần xóa tự động gần nhất</h4>
                <p className="text-sm text-slate-500 mt-1">
                  {historyConfig.lastAutoDelete || "Chưa từng xóa tự động"}
                </p>
              </div>
              <button
                onClick={handleDeleteHistoryNow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
                style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}
              >
                <RefreshCw size={16} />
                Xóa ngay
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSaveHistoryConfig}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm"
            style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}
          >
            <Save size={16} />
            Lưu cấu hình
          </button>
        </div>
      </div>

      {/* Delete History Modal */}
      {showDeleteHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl transform transition-all my-auto flex flex-col">
            <div className="relative px-6 py-5 rounded-t-3xl bg-gradient-to-r from-slate-500 to-slate-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <RefreshCw size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white">
                    Xóa lịch sử thủ công
                  </h3>
                </div>
                <button 
                  onClick={() => setShowDeleteHistoryModal(false)} 
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Chọn khoảng thời gian lịch sử cần xóa. Các bản ghi trong khoảng thời gian này sẽ bị xóa vĩnh viễn.
              </p>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Từ ngày *</label>
                <WheelDateTimePicker
                  mode="date"
                  value={deleteFromDate}
                  onChange={(val) => setDeleteFromDate(val)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Đến ngày *</label>
                <WheelDateTimePicker
                  mode="date"
                  value={deleteToDate}
                  onChange={(val) => setDeleteToDate(val)}
                />
              </div>
            </div>
            <div className="px-6 py-5 bg-slate-50 rounded-b-3xl flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowDeleteHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteHistory}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg"
                style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}
              >
                <Trash2 size={18} />
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return renderUsersSection();
      case "profiles":
        return renderProfilesSection();
      case "branches":
        return renderBranchesSection();
      case "departments":
        return renderDepartmentsSection();
      case "positions":
        return renderPositionsSection();
      case "install_locations":
        return renderInstallLocationsSection();
      case "countries":
        return renderCountriesSection();
      case "suppliers":
        return renderSuppliersSection();
      case "history_config":
        return renderHistoryConfigSection();
      case "backup":
        return renderBackupSection();
      default:
        return (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <Settings size={48} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium">Chọn một mục cấu hình từ danh sách bên trái</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}>
            <Settings size={20} className="text-white" />
          </div>
          Quản Trị Hệ Thống
        </h1>
        <p className="text-slate-500 text-sm mt-1">Cấu hình và quản lý hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                activeSection === section.id
                  ? "bg-white shadow-md border border-slate-200"
                  : "hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${section.color} flex-shrink-0`}>
                <span className="text-white">{section.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${activeSection === section.id ? "text-slate-800" : "text-slate-600"}`}>
                  {section.label}
                </p>
              </div>
              <ChevronRight size={14} className={`flex-shrink-0 transition-colors ${activeSection === section.id ? "text-blue-500" : "text-slate-300"}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection ? (
            <div className="fade-in">
              <div className="flex items-center gap-3 mb-4">
                {sections.find((s) => s.id === activeSection) && (
                  <>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${sections.find((s) => s.id === activeSection)!.color}`}>
                      <span className="text-white">{sections.find((s) => s.id === activeSection)!.icon}</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">{sections.find((s) => s.id === activeSection)!.label}</h2>
                    </div>
                  </>
                )}
              </div>
              {renderSection()}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Settings size={40} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Chọn mục cấu hình</h3>
              <p className="text-slate-400 text-sm">Chọn một mục từ danh sách bên trái để bắt đầu cấu hình</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
