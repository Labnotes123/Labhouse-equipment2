"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Cpu,
  Settings,
  History,
  LogOut,
  ChevronDown,
  AlertTriangle,
  FlaskConical,
  Bell,
  Menu,
  X,
  User,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import UserProfileModal from "@/components/UserProfileModal";
import DashboardTab from "@/components/tabs/DashboardTab";
import NewDeviceTab from "@/components/tabs/NewDeviceTab";
import DeviceProfileTab from "@/components/tabs/DeviceProfileTab";
import AdminTab from "@/components/tabs/AdminTab";
import HistoryTab from "@/components/tabs/HistoryTab";
import { useData } from "@/contexts/DataContext";

type TabId = "dashboard" | "new-device" | "device-profile" | "admin" | "history";
type NewDeviceFilter = "all" | "pending";

const tabs: {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  desc: string;
}[] = [
  {
    id: "dashboard",
    label: "Quản lý chung",
    icon: <LayoutDashboard size={20} />,
    gradient: "from-blue-500 to-indigo-600",
    desc: "Tổng quan & cảnh báo",
  },
  {
    id: "new-device",
    label: "Thiết bị mới",
    icon: <Package size={20} />,
    gradient: "from-cyan-500 to-blue-600",
    desc: "Đề xuất thiết bị",
  },
  {
    id: "device-profile",
    label: "Hồ sơ thiết bị",
    icon: <Cpu size={20} />,
    gradient: "from-purple-500 to-violet-600",
    desc: "Quản lý thiết bị",
  },
  // Incident and Calibration are now inside Device Profile
  {
    id: "admin",
    label: "Quản trị",
    icon: <Settings size={20} />,
    gradient: "from-amber-500 to-orange-600",
    desc: "Cấu hình hệ thống",
  },
  {
    id: "history",
    label: "Lịch sử",
    icon: <History size={20} />,
    gradient: "from-slate-500 to-slate-700",
    desc: "Nhật ký hành động",
  },
];

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  "Giám đốc": "bg-blue-100 text-blue-700 border-blue-200",
  "Trưởng phòng xét nghiệm": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Trưởng nhóm": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Kỹ thuật viên": "bg-green-100 text-green-700 border-green-200",
  "Quản lý chất lượng": "bg-amber-100 text-amber-700 border-amber-200",
  "Quản lý trang thiết bị": "bg-orange-100 text-orange-700 border-orange-200",
};

export default function MainApp() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const { proposals } = useData();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [newDeviceFilter, setNewDeviceFilter] = useState<NewDeviceFilter>("all");
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pendingCount =
    proposals.filter((p) => p.status === "Chờ duyệt").length;

  const handleLogout = () => {
    logout();
    success("Đã đăng xuất", "Hẹn gặp lại bạn!");
  };

  const navigateToNewDevicePending = () => {
    setNewDeviceFilter("pending");
    setActiveTab("new-device");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab onNavigateNewDevicePending={navigateToNewDevicePending} />;
      case "new-device": return <NewDeviceTab filterPending={newDeviceFilter === "pending"} onNavigate={(tab) => { setNewDeviceFilter("all"); setActiveTab(tab as TabId); }} />;
      case "device-profile": return <DeviceProfileTab />;
      case "admin": return <AdminTab />;
      case "history": return <HistoryTab />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
        style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <FlaskConical size={22} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">LabHouse</p>
                <p className="text-blue-400 text-xs truncate">Quản lý thiết bị</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount = tab.id === "dashboard" ? pendingCount : 0;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== "new-device") setNewDeviceFilter("all"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                  isActive
                    ? "bg-white/10 shadow-lg"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-400" />
                )}

                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? `bg-gradient-to-br ${tab.gradient}` : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}>
                    {tab.icon}
                  </span>
                </div>

                {/* Label */}
                {sidebarOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                      {tab.label}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{tab.desc}</p>
                  </div>
                )}

                {/* Badge */}
                {badgeCount > 0 && sidebarOpen && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center pulse-dot">
                    {badgeCount}
                  </span>
                )}
                {badgeCount > 0 && !sidebarOpen && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info at bottom */}
        {sidebarOpen && (
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
                <p className="text-slate-400 text-xs truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4 shadow-sm flex-shrink-0">
          {/* Left: Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              {sidebarOpen ? <X size={18} className="text-slate-600" /> : <Menu size={18} className="text-slate-600" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${tabs.find((t) => t.id === activeTab)?.gradient}`}>
                <span className="text-white scale-75">{tabs.find((t) => t.id === activeTab)?.icon}</span>
              </div>
              <span className="text-sm font-bold text-slate-700">{tabs.find((t) => t.id === activeTab)?.label}</span>
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <Bell size={18} className="text-slate-600" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-700 leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-slate-400">{user?.role}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 fade-in">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user?.fullName}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${roleColors[user?.role ?? ""] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="text-slate-400">@</span>
                        {user?.email}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="text-slate-400">📱</span>
                        {user?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => { setShowProfile(true); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Thông tin cá nhân</p>
                        <p className="text-xs text-slate-400">Cập nhật hồ sơ & mật khẩu</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab("admin"); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Shield size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Quản trị hệ thống</p>
                        <p className="text-xs text-slate-400">Cấu hình & phân quyền</p>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                          <LogOut size={16} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-600">Đăng xuất</p>
                          <p className="text-xs text-slate-400">Thoát khỏi hệ thống</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto">
          {renderTab()}
        </main>
      </div>

      {/* User Profile Modal */}
      {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}

      {/* Overlay for user menu */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </div>
  );
}
