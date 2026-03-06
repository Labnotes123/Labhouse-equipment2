"use client";

import { useState, useMemo, useEffect } from "react";
import WheelDateTimePicker from "@/components/WheelDateTimePicker";
import {
  History,
  Search,
  Filter,
  Cpu,
  Users,
  Settings,
  Package,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { MOCK_USERS_LIST, HistoryLog, formatDateTime, mockHistoryLogs } from "@/lib/mockData";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

type TimeRange = "today" | "yesterday" | "week" | "month" | "custom";

type ModuleType = "Thiết bị mới" | "Hồ sơ thiết bị" | "Quản trị" | "Quản lý chung";

const moduleConfig: Record<ModuleType, { icon: React.ReactNode; color: string; bg: string }> = {
  "Thiết bị mới": { icon: <Package size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  "Hồ sơ thiết bị": { icon: <Cpu size={14} />, color: "text-blue-600", bg: "bg-blue-50" },
  "Quản trị": { icon: <Settings size={14} />, color: "text-slate-600", bg: "bg-slate-100" },
  "Quản lý chung": { icon: <Users size={14} />, color: "text-purple-600", bg: "bg-purple-50" },
};

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  "Giám đốc": "bg-blue-100 text-blue-700",
  "Trưởng phòng xét nghiệm": "bg-indigo-100 text-indigo-700",
  "Trưởng nhóm": "bg-cyan-100 text-cyan-700",
  "Kỹ thuật viên": "bg-green-100 text-green-700",
  "Quản lý chất lượng": "bg-amber-100 text-amber-700",
  "Quản lý trang thiết bị": "bg-orange-100 text-orange-700",
};

// Helper function outside component
function getModuleType(targetType: string): ModuleType {
  switch (targetType) {
    case "Đề xuất":
      return "Thiết bị mới";
    case "Thiết bị":
    case "Sự cố":
    case "Lịch":
      return "Hồ sơ thiết bị";
    case "Hệ thống":
      return "Quản trị";
    default:
      return "Quản lý chung";
  }
}

function calculateDateRange(timeRange: TimeRange, dateFrom: string, dateTo: string): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  switch (timeRange) {
    case "today":
      return { from: today, to: now };
    case "yesterday":
      return { from: yesterday, to: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    case "week":
      return { from: weekAgo, to: now };
    case "month":
      return { from: monthAgo, to: now };
    case "custom":
      return { from: dateFrom ? new Date(dateFrom) : new Date(0), to: dateTo ? new Date(dateTo + "T23:59:59") : now };
    default:
      return { from: weekAgo, to: now };
  }
}

export default function HistoryTab() {
  const { user } = useAuth();
  const { history: contextHistory, devices: mockDevices } = useData();
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load history data - either from context or fallback to mock
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API
        const res = await fetch('/api/history?limit=500');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        } else {
          // Fallback to context data or mock
          setLogs(contextHistory.length > 0 ? contextHistory : mockHistoryLogs);
        }
      } catch (e) {
        console.log('Using fallback history data');
        // Fallback to context data or mock
        setLogs(contextHistory.length > 0 ? contextHistory : mockHistoryLogs);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [contextHistory]);
  
  // Filters
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  
  // Column filters
  const [contentFilter, setContentFilter] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleType | "">("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Check access - but don't return early, use conditional rendering instead
  const canAccess = user?.role === "Admin" || user?.role === "Giám đốc" || user?.role === "Trưởng phòng xét nghiệm";

  // Calculate date range
  const dateRange = useMemo(() => {
    return calculateDateRange(timeRange, dateFrom, dateTo);
  }, [timeRange, dateFrom, dateTo]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const { from, to } = dateRange;
    
    return logs.filter((log) => {
      // Time filter
      const logDate = new Date(log.timestamp);
      if (logDate < from || logDate > to) return false;

      // Device filter
      if (selectedDevices.length > 0 && log.targetType === "Thiết bị") {
        const device = mockDevices.find(d => d.id === log.targetId);
        if (!device || !selectedDevices.includes(device.code)) return false;
      }

      // User filter
      if (selectedUsers.length > 0 && !selectedUsers.includes(log.userName)) return false;

      // Module filter
      if (selectedModules.length > 0) {
        const moduleType = getModuleType(log.targetType);
        if (!selectedModules.includes(moduleType)) return false;
      }

      // Search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchSearch = 
          log.userName.toLowerCase().includes(search) ||
          log.action.toLowerCase().includes(search) ||
          log.description.toLowerCase().includes(search) ||
          log.actionCode.toLowerCase().includes(search) ||
          (log.targetName ?? "").toLowerCase().includes(search);
        if (!matchSearch) return false;
      }

      // Column filters
      if (contentFilter && !log.description.toLowerCase().includes(contentFilter.toLowerCase())) return false;
      if (userNameFilter && !log.userName.toLowerCase().includes(userNameFilter.toLowerCase())) return false;
      if (moduleFilter) {
        const moduleType = getModuleType(log.targetType);
        if (moduleType !== moduleFilter) return false;
      }

      return true;
    }).sort((a, b) => b.actionNumber - a.actionNumber);
  }, [logs, dateRange, selectedDevices, selectedUsers, selectedModules, searchTerm, contentFilter, userNameFilter, moduleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Device options
  const deviceOptions = mockDevices.map(d => ({ value: d.code, label: `${d.name} (${d.code})` }));

  // User options
  const userOptions = MOCK_USERS_LIST.map(u => ({ value: u.fullName, label: u.fullName }));

  // Module options
  const moduleOptions: ModuleType[] = ["Thiết bị mới", "Hồ sơ thiết bị", "Quản trị", "Quản lý chung"];

  // Clear all filters
  const clearFilters = () => {
    setTimeRange("week");
    setDateFrom("");
    setDateTo("");
    setSelectedDevices([]);
    setSelectedUsers([]);
    setSelectedModules([]);
    setSearchTerm("");
    setContentFilter("");
    setUserNameFilter("");
    setModuleFilter("");
    setCurrentPage(1);
  };

  // Render access denied
  if (!canAccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-400 text-sm">Bạn không có quyền xem lịch sử hành động</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}>
              <History size={20} className="text-white" />
            </div>
            Lịch Sử Hành Động
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tất cả hoạt động trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            {filteredLogs.length} / {logs.length} bản ghi
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
        {/* Search & Quick Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo người dùng, hành động, mã..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => { setTimeRange(e.target.value as TimeRange); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-slate-500"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Từ hôm qua</option>
            <option value="week">1 tuần</option>
            <option value="month">1 tháng</option>
            <option value="custom">Tùy chọn</option>
          </select>

          {timeRange === "custom" && (
            <>
              <WheelDateTimePicker
                mode="date"
                value={dateFrom}
                onChange={(val) => { setDateFrom(val); setCurrentPage(1); }}
                placeholder="Từ ngày"
              />
              <WheelDateTimePicker
                mode="date"
                value={dateTo}
                onChange={(val) => { setDateTo(val); setCurrentPage(1); }}
                placeholder="Đến ngày"
              />
            </>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showFilters ? "text-white shadow-sm" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
            style={showFilters ? { background: "linear-gradient(135deg, #64748b, #475569)" } : {}}
          >
            <Filter size={16} />
            Bộ lọc
          </button>

          {(selectedDevices.length > 0 || selectedUsers.length > 0 || selectedModules.length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50"
            >
              <X size={16} />
              Xóa lọc
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 fade-in">
            {/* Device Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Thiết bị</label>
              <div className="relative">
                <select
                  multiple
                  value={selectedDevices}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, opt => opt.value);
                    setSelectedDevices(values);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 h-24"
                >
                  {deviceOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều</p>
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Người dùng</label>
              <div className="relative">
                <select
                  multiple
                  value={selectedUsers}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, opt => opt.value);
                    setSelectedUsers(values);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 h-24"
                >
                  {userOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều</p>
              </div>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Module</label>
              <div className="relative">
                <select
                  multiple
                  value={selectedModules}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, opt => opt.value as ModuleType);
                    setSelectedModules(values);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 h-24"
                >
                  {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedDevices.length > 0 || selectedUsers.length > 0 || selectedModules.length > 0) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Đang lọc:</span>
            {selectedDevices.map(d => (
              <span key={d} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                {d}
                <button onClick={() => { setSelectedDevices(prev => prev.filter(x => x !== d)); setCurrentPage(1); }} className="hover:text-blue-800">
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedUsers.map(u => (
              <span key={u} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                {u}
                <button onClick={() => { setSelectedUsers(prev => prev.filter(x => x !== u)); setCurrentPage(1); }} className="hover:text-purple-800">
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedModules.map(m => (
              <span key={m} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                {m}
                <button onClick={() => { setSelectedModules(prev => prev.filter(x => x !== m)); setCurrentPage(1); }} className="hover:text-green-800">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase w-16">ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase w-40">
                  <div className="flex flex-col gap-1">
                    <span>Thời gian</span>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                  <div className="flex flex-col gap-1">
                    <span>Người dùng</span>
                    <input
                      type="text"
                      placeholder="Lọc..."
                      value={userNameFilter}
                      onChange={(e) => { setUserNameFilter(e.target.value); setCurrentPage(1); }}
                      className="text-xs px-1 py-0.5 border border-slate-200 rounded"
                    />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                  <div className="flex flex-col gap-1">
                    <span>Module</span>
                    <select
                      value={moduleFilter}
                      onChange={(e) => { setModuleFilter(e.target.value as ModuleType | ""); setCurrentPage(1); }}
                      className="text-xs px-1 py-0.5 border border-slate-200 rounded"
                    >
                      <option value="">Tất cả</option>
                      {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                  <div className="flex flex-col gap-1">
                    <span>Nội dung</span>
                    <input
                      type="text"
                      placeholder="Lọc..."
                      value={contentFilter}
                      onChange={(e) => { setContentFilter(e.target.value); setCurrentPage(1); }}
                      className="text-xs px-1 py-0.5 border border-slate-200 rounded"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <History size={32} className="mx-auto mb-2 text-slate-200" />
                    <p>Không tìm thấy bản ghi nào</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const moduleType = getModuleType(log.targetType);
                  const mc = moduleConfig[moduleType];
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">#{log.actionNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock size={12} className="text-slate-400" />
                          {formatDateTime(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-700 text-sm">{log.userName}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block w-fit ${roleColors[log.userRole] || "bg-slate-100 text-slate-600"}`}>
                            {log.userRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${mc.bg} ${mc.color}`}>
                          {mc.icon}
                          {moduleType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">{log.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{log.description}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} của {filteredLogs.length} bản ghi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                        currentPage === pageNum 
                          ? "bg-slate-600 text-white" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 flex items-center gap-1"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
