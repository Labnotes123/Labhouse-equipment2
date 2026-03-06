"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Activity,
  Package,
  AlertCircle,
  CalendarCheck,
  Settings,
  Download,
  Eye,
  Check,
  X,
  FileText,
  ArrowRightLeft,
  Wrench,
  ClipboardList,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { formatDate, mockTransferProposals, mockLiquidationProposals, TrainingPlan } from "@/lib/mockData";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

// Types for the unified approval system
interface UnifiedApprovalItem {
  id: string;
  code: string;
  name: string;
  type: "TB_Mới" | "Sự_cố" | "Hiệu_chuẩn" | "Bảo_dưỡng" | "Điều_chuyển" | "Thanh_lý" | "Đào_tạo";
  requester: string;
  requestDate: string;
  status: "Chờ_phê_duyệt";
  data: Record<string, unknown>;
}

export default function DashboardTab({ onNavigateNewDevicePending }: { onNavigateNewDevicePending?: () => void }) {
  const { info, success, error: showError } = useToast();
  const { user } = useAuth();
  const { 
    proposals: mockProposals, 
    incidents: mockIncidents, 
    schedules: mockSchedules, 
    devices: mockDevices,
    trainingPlans,
    updateProposal,
    updateIncident,
    updateSchedule,
    updateTrainingPlan,
    addHistory,
  } = useData();
  
  const [activeFilter, setActiveFilter] = useState<"all" | "TB_Mới" | "Sự_cố" | "Hiệu_chuẩn" | "Điều_chuyển" | "Thanh_lý" | "Đào_tạo">("all");
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    code: true,
    name: true,
    type: true,
    requester: true,
    requestDate: true,
    status: true,
    actions: true,
  });

  // Get pending items from different sources
  const pendingProposals = mockProposals.filter((p) => p.status === "Chờ duyệt");
  const pendingIncidents = mockIncidents.filter((i) => i.status === "Chờ duyệt");
  const pendingCalibration = mockSchedules.filter((s) => s.type === "Hiệu chuẩn" && s.status === "Chờ thực hiện");
  const pendingMaintenance = mockSchedules.filter((s) => s.type === "Bảo dưỡng" && s.status === "Chờ thực hiện");
  
  // Get pending training plans
  const pendingTraining = trainingPlans.filter((p) => p.status === "Chờ duyệt");

  // Build unified approval list
  const unifiedApprovals: UnifiedApprovalItem[] = useMemo(() => {
    const items: UnifiedApprovalItem[] = [];
    
    // Add pending proposals (Thiết bị mới)
    pendingProposals.forEach((p) => {
      items.push({
        id: p.id,
        code: p.proposalCode,
        name: p.deviceRequirements?.[0]?.deviceName || "Thiết bị mới",
        type: "TB_Mới",
        requester: p.proposedBy,
        requestDate: p.createdDate,
        status: "Chờ_phê_duyệt",
        data: p as unknown as Record<string, unknown>,
      });
    });
    
    // Add pending incidents (Sự cố)
    pendingIncidents.forEach((i) => {
      items.push({
        id: i.id,
        code: i.reportCode,
        name: i.deviceName,
        type: "Sự_cố",
        requester: i.reportedBy,
        requestDate: i.createdAt || "",
        status: "Chờ_phê_duyệt",
        data: i as unknown as Record<string, unknown>,
      });
    });
    
    // Add pending calibrations (Hiệu chuẩn)
    pendingCalibration.forEach((s) => {
      items.push({
        id: s.id,
        code: `HC-${s.id.slice(-6)}`,
        name: s.deviceName,
        type: "Hiệu_chuẩn",
        requester: s.assignedTo,
        requestDate: s.scheduledDate,
        status: "Chờ_phê_duyệt",
        data: s as unknown as Record<string, unknown>,
      });
    });
    
    // Add pending maintenance (Bảo dưỡng)
    pendingMaintenance.forEach((s) => {
      items.push({
        id: s.id,
        code: `BD-${s.id.slice(-6)}`,
        name: s.deviceName,
        type: "Bảo_dưỡng",
        requester: s.assignedTo,
        requestDate: s.scheduledDate,
        status: "Chờ_phê_duyệt",
        data: s as unknown as Record<string, unknown>,
      });
    });
    
    // Add transfer proposals (using transferCode and requestedBy)
    mockTransferProposals.forEach((t) => {
      if (t.status === "Chờ duyệt") {
        items.push({
          id: t.id,
          code: t.transferCode,
          name: t.deviceName,
          type: "Điều_chuyển",
          requester: t.requestedBy,
          requestDate: t.createdAt,
          status: "Chờ_phê_duyệt",
          data: t as unknown as Record<string, unknown>,
        });
      }
    });
    
    // Add liquidation proposals
    mockLiquidationProposals.forEach((l) => {
      if (l.status === "Chờ duyệt") {
        items.push({
          id: l.id,
          code: l.liquidationCode,
          name: l.deviceName,
          type: "Thanh_lý",
          requester: l.requestedBy,
          requestDate: l.createdAt,
          status: "Chờ_phê_duyệt",
          data: l as unknown as Record<string, unknown>,
        });
      }
    });
    
    // Add pending training plans
    pendingTraining.forEach((t) => {
      items.push({
        id: t.id,
        code: t.planCode,
        name: t.topic,
        type: "Đào_tạo",
        requester: t.createdBy,
        requestDate: t.createdAt,
        status: "Chờ_phê_duyệt",
        data: t as unknown as Record<string, unknown>,
      });
    });
    
    return items;
  }, [pendingProposals, pendingIncidents, pendingCalibration, pendingMaintenance, pendingTraining]);

  // Filter approvals
  const filteredApprovals = useMemo(() => {
    let items = [...unifiedApprovals];
    
    if (activeFilter !== "all") {
      items = items.filter((item) => item.type === activeFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter((item) => 
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.requester.toLowerCase().includes(term)
      );
    }
    
    return items;
  }, [unifiedApprovals, activeFilter, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredApprovals.length / pageSize));
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [activeFilter, searchTerm, pageSize]);

  // Stats for cards
  const stats = [
    {
      label: "Thiết bị mới chờ duyệt",
      value: pendingProposals.length,
      icon: <Package size={22} />,
      color: "from-blue-500 to-blue-600",
      filter: "TB_Mới" as const,
    },
    {
      label: "Báo cáo sự cố chờ xử lý",
      value: pendingIncidents.length,
      icon: <AlertTriangle size={22} />,
      color: "from-red-500 to-red-600",
      filter: "Sự_cố" as const,
    },
    {
      label: "Hiệu chuẩn/Bảo dưỡng chờ duyệt",
      value: pendingCalibration.length + pendingMaintenance.length,
      icon: <CalendarCheck size={22} />,
      color: "from-amber-500 to-orange-500",
      filter: "Hiệu_chuẩn" as const,
    },
    {
      label: "Điều chuyển/Thanh lý chờ duyệt",
      value: mockTransferProposals.filter(t => t.status === "Chờ duyệt").length + 
             mockLiquidationProposals.filter(l => l.status === "Chờ duyệt").length,
      icon: <ArrowRightLeft size={22} />,
      color: "from-emerald-500 to-green-500",
      filter: "Điều_chuyển" as const,
    },
    {
      label: "Đào tạo chờ duyệt",
      value: pendingTraining.length,
      icon: <GraduationCap size={22} />,
      color: "from-violet-500 to-purple-600",
      filter: "Đào_tạo" as const,
    },
  ];

  // Type badge config
  const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
    "TB_Mới": { bg: "bg-blue-100", text: "text-blue-700", label: "TB Mới" },
    "Sự_cố": { bg: "bg-red-100", text: "text-red-700", label: "Sự cố" },
    "Hiệu_chuẩn": { bg: "bg-purple-100", text: "text-purple-700", label: "Hiệu chuẩn" },
    "Bảo_dưỡng": { bg: "bg-cyan-100", text: "text-cyan-700", label: "Bảo dưỡng" },
    "Điều_chuyển": { bg: "bg-amber-100", text: "text-amber-700", label: "Điều chuyển" },
    "Thanh_lý": { bg: "bg-slate-100", text: "text-slate-700", label: "Thanh lý" },
    "Đào_tạo": { bg: "bg-violet-100", text: "text-violet-700", label: "Đào tạo" },
  };

  // Tab config for monitoring section
  const tabConfig = [
    { label: "Lịch Hiệu chuẩn sắp tới", icon: <Activity size={16} /> },
    { label: "Lịch Bảo dưỡng định kỳ", icon: <Wrench size={16} /> },
    { label: "Danh sách Báo cáo sự cố", icon: <AlertTriangle size={16} /> },
    { label: "Danh sách Công việc Kỹ sư", icon: <ClipboardList size={16} /> },
    { label: "Lịch Đào tạo sắp tới", icon: <GraduationCap size={16} /> },
  ];

  // Handlers
  const handleApprove = async (item: UnifiedApprovalItem) => {
    try {
      if (item.type === "TB_Mới") {
        await updateProposal(item.id, { 
          status: "Đã duyệt", 
          approvedDate: new Date().toISOString() 
        });
      } else if (item.type === "Sự_cố") {
        await updateIncident(item.id, { 
          status: "Đã duyệt", 
          approvedDate: new Date().toISOString() 
        });
      } else if (item.type === "Hiệu_chuẩn" || item.type === "Bảo_dưỡng") {
        await updateSchedule(item.id, { 
          status: "Đã hoàn thành" 
        });
      } else if (item.type === "Đào_tạo") {
        await updateTrainingPlan(item.id, { 
          status: "Đã duyệt",
          updatedAt: new Date().toISOString()
        });
      }
      // Add history log
      const actionMap: Record<string, string> = {
        "TB_Mới": "Phê duyệt đề xuất thiết bị mới",
        "Sự_cố": "Phê duyệt báo cáo sự cố",
        "Hiệu_chuẩn": "Phê duyệt yêu cầu hiệu chuẩn",
        "Bảo_dưỡng": "Phê duyệt yêu cầu bảo dưỡng",
        "Đào_tạo": "Phê duyệt kế hoạch đào tạo",
      };
      await addHistory({
        actionCode: `ACT-${String(Date.now()).slice(-6)}`,
        actionNumber: Date.now(),
        userId: user?.id || "",
        userName: user?.fullName || "",
        userRole: user?.role || "",
        action: actionMap[item.type] || "Phê duyệt",
        description: `${actionMap[item.type] || "Phê duyệt"} ${item.code}`,
        targetType: item.type === "TB_Mới" ? "Đề xuất" : item.type === "Sự_cố" ? "Sự cố" : item.type === "Đào_tạo" ? "Đào tạo" : "Lịch",
        targetId: item.id,
        targetName: item.code,
        timestamp: new Date().toISOString(),
      });
      success("Phê duyệt thành công");
    } catch (err) {
      showError("Lỗi khi phê duyệt");
    }
  };

  const handleReject = async (item: UnifiedApprovalItem) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;
    
    try {
      if (item.type === "TB_Mới") {
        await updateProposal(item.id, { 
          status: "Từ chối", 
          rejectedDate: new Date().toISOString(),
          rejectionReason: reason,
        });
      } else if (item.type === "Sự_cố") {
        await updateIncident(item.id, { 
          status: "Từ chối", 
          rejectedReason: reason,
        });
      }
      // Add history log
      const rejectActionMap: Record<string, string> = {
        "TB_Mới": "Từ chối đề xuất thiết bị mới",
        "Sự_cố": "Từ chối báo cáo sự cố",
      };
      await addHistory({
        actionCode: `ACT-${String(Date.now()).slice(-6)}`,
        actionNumber: Date.now(),
        userId: user?.id || "",
        userName: user?.fullName || "",
        userRole: user?.role || "",
        action: rejectActionMap[item.type] || "Từ chối",
        description: `${rejectActionMap[item.type] || "Từ chối"} ${item.code}. Lý do: ${reason}`,
        targetType: item.type === "TB_Mới" ? "Đề xuất" : "Sự cố",
        targetId: item.id,
        targetName: item.code,
        timestamp: new Date().toISOString(),
      });
      success("Đã từ chối");
    } catch (err) {
      showError("Lỗi khi từ chối");
    }
  };

  const handleViewDetails = (item: UnifiedApprovalItem) => {
    info("Xem chi tiết", `${item.code} - ${item.name}`);
  };

  // Export to Excel
  const handleExport = async () => {
    if (filteredApprovals.length === 0) {
      showError("Khong co du lieu de xuat Excel");
      return;
    }
    try {
      // Prepare data for export
      const headers = ["Mã phiếu", "Loại", "Tên thiết bị", "Người yêu cầu", "Ngày yêu cầu", "Trạng thái"];
      const rows = filteredApprovals.map((item) => [
        item.code,
        item.type === "TB_Mới" ? "Thiết bị mới" :
        item.type === "Sự_cố" ? "Báo cáo sự cố" :
        item.type === "Hiệu_chuẩn" ? "Hiệu chuẩn" :
        item.type === "Bảo_dưỡng" ? "Bảo dưỡng" :
        item.type === "Đào_tạo" ? "Đào tạo" :
        item.type === "Điều_chuyển" ? "Điều chuyển" :
        item.type === "Thanh_lý" ? "Thanh lý" : item.type,
        item.name,
        item.requester,
        item.requestDate ? new Date(item.requestDate).toLocaleDateString("vi-VN") : "",
        item.status === "Chờ_phê_duyệt" ? "Chờ phê duyệt" : item.status,
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      // Add BOM for UTF-8
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Danh_sach_phe_duyet_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      success("Xuất Excel thành công", `Đã xuất ${filteredApprovals.length} phiếu`);
    } catch (err) {
      console.error("[Export Excel] Error:", err);
      showError("Lỗi xuất Excel");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <Activity size={20} className="text-white" />
            </div>
            Quản Lý Chung
          </h1>
          <p className="text-slate-500 text-sm mt-1">Trung tâm chỉ huy - Giám sát và phê duyệt toàn hệ thống</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Cập nhật lần cuối</p>
          <p className="text-sm font-semibold text-slate-600">{new Date().toLocaleString("vi-VN")}</p>
        </div>
      </div>

      {/* PHẦN 1: KHU VỰC CẢNH BÁO & PHÊ DUYỆT TỔNG HỢP */}
      
      {/* 1.1. Alert Widget Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={() => setActiveFilter(stat.filter)}
            className={`relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border transition-all hover:-translate-y-1 hover:shadow-md ${
              activeFilter === stat.filter 
                ? "border-blue-300 ring-2 ring-blue-100" 
                : "border-slate-100"
            }`}
          >
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 bg-gradient-to-br ${stat.color}`} />
            <div className="relative">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-md`}>
                <span className="text-white">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 1.2. Unified Approval Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Bell size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Danh sách Phê duyệt Tập trung</h3>
                <p className="text-xs text-slate-400">{filteredApprovals.length} phiếu chờ xử lý</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Show All Button */}
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Hiển thị toàn bộ
              </button>
              
              {/* Config Button */}
              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Cấu hình cột"
              >
                <Settings size={18} className="text-slate-600" />
              </button>
              
              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
              >
                <Download size={16} />
                Xuất Excel
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã phiếu, tên thiết bị, người đề xuất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Config Panel */}
          {showConfigPanel && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-3">Cấu hình hiển thị cột</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 capitalize">
                      {key === "code" ? "Mã phiếu" :
                       key === "name" ? "Tên/Nội dung" :
                       key === "type" ? "Loại phê duyệt" :
                       key === "requester" ? "Người đề xuất" :
                       key === "requestDate" ? "Thời gian gửi" :
                       key === "status" ? "Trạng thái" :
                       key === "actions" ? "Hành động" : key}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {visibleColumns.code && <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Mã phiếu</th>}
                {visibleColumns.name && <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Tên / Nội dung yêu cầu</th>}
                {visibleColumns.type && <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Loại phê duyệt</th>}
                {visibleColumns.requester && <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Người đề xuất</th>}
                {visibleColumns.requestDate && <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Thời gian gửi</th>}
                {visibleColumns.status && <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Trạng thái</th>}
                {visibleColumns.actions && <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Hành động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedApprovals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Check size={40} className="mx-auto mb-3 text-emerald-300" />
                    <p className="text-slate-500 font-medium">Không có phiếu nào chờ phê duyệt</p>
                  </td>
                </tr>
              ) : (
                paginatedApprovals.map((item) => {
                  const type = typeConfig[item.type];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {visibleColumns.code && (
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-700 text-sm">{item.code}</span>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-700 text-sm">{item.name}</p>
                        </td>
                      )}
                      {visibleColumns.type && (
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${type.bg} ${type.text}`}>
                            {type.label}
                          </span>
                        </td>
                      )}
                      {visibleColumns.requester && (
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">{item.requester}</span>
                        </td>
                      )}
                      {visibleColumns.requestDate && (
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-500">{formatDate(item.requestDate)}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            Chờ phê duyệt
                          </span>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                              title="Xem phiếu"
                            >
                              <Eye size={16} className="text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleApprove(item)}
                              className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
                              title="Phê duyệt"
                            >
                              <Check size={16} className="text-emerald-600" />
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                              title="Từ chối"
                            >
                              <X size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <span className="text-sm text-slate-500">dòng/trang</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-slate-600 rotate-180" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-slate-800 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* PHẦN 2: KHU VỰC GIÁM SÁT TIẾN ĐỘ */}
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100">
          <div className="flex">
            {tabConfig.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i as 0 | 1 | 2 | 3 | 4)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === i
                    ? "text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === i && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {/* Tab 0: Lịch Hiệu chuẩn sắp tới */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Thiết bị chuẩn bị đến hạn hiệu chuẩn (nhắc trước 3-7 ngày)</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                    <Settings size={16} className="text-slate-600" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                    <Download size={14} />
                    Xuất Excel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã máy</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên máy</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Vị trí</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ngày dự kiến</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Đơn vị làm</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockSchedules.filter(s => s.type === "Hiệu chuẩn").slice(0, 5).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.deviceCode}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{s.deviceName}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{s.assignedTo}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(s.scheduledDate)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">---</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            s.status === "Quá hạn" ? "bg-red-100 text-red-700" :
                            s.status === "Đã hoàn thành" ? "bg-emerald-100 text-emerald-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {s.status === "Quá hạn" ? "Đã trễ" : s.status === "Chờ thực hiện" ? "Sắp đến hạn" : s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200" title="Xem lịch">
                              <Eye size={14} className="text-slate-600" />
                            </button>
                            <button className="p-1.5 rounded bg-blue-100 hover:bg-blue-200" title="Cập nhật kết quả">
                              <FileText size={14} className="text-blue-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 1: Lịch Bảo dưỡng định kỳ */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Cảnh báo các thiết bị đến kỳ bảo trì</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                    <Settings size={16} className="text-slate-600" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                    <Download size={14} />
                    Xuất Excel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã máy</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên máy</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Chu kỳ</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ngày làm gần nhất</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ngày dự kiến tiếp theo</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockSchedules.filter(s => s.type === "Bảo dưỡng").slice(0, 5).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.deviceCode}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{s.deviceName}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">6 tháng</td>
                        <td className="px-4 py-3 text-sm text-slate-500">---</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(s.scheduledDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            s.status === "Quá hạn" ? "bg-red-100 text-red-700" :
                            s.status === "Đã hoàn thành" ? "bg-emerald-100 text-emerald-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200" title="Xem lịch">
                              <Eye size={14} className="text-slate-600" />
                            </button>
                            <button className="p-1.5 rounded bg-cyan-100 hover:bg-cyan-200" title="Ghi nhận bảo dưỡng">
                              <Wrench size={14} className="text-cyan-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
              </div>
          )}

          {/* Tab 2: Danh sách Báo cáo sự cố */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Tổng hợp các máy đang bị lỗi (Tạm dừng hoạt động)</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                    <Settings size={16} className="text-slate-600" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                    <Download size={14} />
                    Xuất Excel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã phiếu (PSC)</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên thiết bị</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Người báo lỗi</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thời gian phát hiện</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mức độ</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockIncidents.slice(0, 5).map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{inc.reportCode}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{inc.deviceName}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{inc.discoveredBy}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{inc.incidentDateTime}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            inc.requiresDeviceStop ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {inc.requiresDeviceStop ? "Dừng" : "Không dừng"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            inc.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-700" :
                            inc.status === "Đang khắc phục" ? "bg-blue-100 text-blue-700" :
                            inc.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {inc.status === "Chờ duyệt" ? "Chờ duyệt" : 
                             inc.status === "Đang khắc phục" ? "Đang xử lý" : 
                             inc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200" title="Xem chi tiết">
                              <Eye size={14} className="text-slate-600" />
                            </button>
                            <button className="p-1.5 rounded bg-blue-100 hover:bg-blue-200" title="Sửa">
                              <FileText size={14} className="text-blue-600" />
                            </button>
                            <button className="p-1.5 rounded bg-emerald-100 hover:bg-emerald-200" title="Đóng sự cố">
                              <Check size={14} className="text-emerald-600" />
                            </button>
                            <button className="p-1.5 rounded bg-red-100 hover:bg-red-200" title="Xuất PDF">
                              <ArrowUpRight size={14} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Danh sách Công việc Kỹ sư */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Đo lường năng suất, tiến độ sửa chữa của kỹ sư</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                    <Settings size={16} className="text-slate-600" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                    <Download size={14} />
                    Xuất Excel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã công việc</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thuộc máy</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên kỹ sư</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thời gian bắt đầu</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mô tả</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tình trạng</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockIncidents.filter(i => i.workOrders && i.workOrders.length > 0).length > 0 ? (
                      mockIncidents.filter(i => i.workOrders && i.workOrders.length > 0).flatMap(inc => 
                        (inc.workOrders || []).map((wo: { id?: string; engineer?: string; startTime?: string; description?: string; status?: string }, idx: number) => (
                          <tr key={`${inc.id}-${idx}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">{inc.reportCode}-WO{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{inc.deviceName}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{wo.engineer || "Kỹ sư Lab"}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{wo.startTime || inc.incidentDateTime}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{wo.description || inc.description}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                wo.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-700" :
                                wo.status === "Đang xử lý" ? "bg-blue-100 text-blue-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {wo.status === "Hoàn thành" ? "Xong" : 
                                 wo.status === "Đang xử lý" ? "Đang xử lý" : "Xử trí 1 phần"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200" title="Xem chi tiết">
                                  <Eye size={14} className="text-slate-600" />
                                </button>
                                <button className="p-1.5 rounded bg-blue-100 hover:bg-blue-200" title="Cập nhật tiến độ">
                                  <FileText size={14} className="text-blue-600" />
                                </button>
                                <button className="p-1.5 rounded bg-purple-100 hover:bg-purple-200" title="Xem Biên bản">
                                  <ClipboardList size={14} className="text-purple-600" />
                                </button>
                                <button className="p-1.5 rounded bg-red-100 hover:bg-red-200" title="Xuất PDF">
                                  <ArrowUpRight size={14} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                          Chưa có công việc kỹ sư nào. Các công việc sẽ xuất hiện khi có sự cố được tạo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Lịch Đào tạo sắp tới */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Kế hoạch đào tạo thiết bị sắp diễn ra</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                    <Settings size={16} className="text-slate-600" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                    <Download size={14} />
                    Xuất Excel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã kế hoạch</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Thiết bị</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Chủ đề</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ngày đào tạo</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Giảng viên</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Địa điểm</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {trainingPlans.filter(p => p.status === "Đã duyệt" || p.status === "Chờ duyệt").length > 0 ? (
                      trainingPlans
                        .filter(p => p.status === "Đã duyệt" || p.status === "Chờ duyệt")
                        .slice(0, 10)
                        .map((plan) => (
                          <tr key={plan.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">{plan.planCode}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{plan.deviceName}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{plan.topic}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{formatDate(plan.trainingDate)}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{plan.instructorName}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{plan.location}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                plan.status === "Đã duyệt" ? "bg-emerald-100 text-emerald-700" :
                                plan.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" :
                                plan.status === "Hoàn thành" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {plan.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200" title="Xem chi tiết">
                                  <Eye size={14} className="text-slate-600" />
                                </button>
                                <button className="p-1.5 rounded bg-blue-100 hover:bg-blue-200" title="Danh sách học viên">
                                  <ClipboardList size={14} className="text-blue-600" />
                                </button>
                                {plan.status === "Đã duyệt" && (
                                  <button className="p-1.5 rounded bg-purple-100 hover:bg-purple-200" title="Ghi nhận kết quả">
                                    <FileText size={14} className="text-purple-600" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">
                          Chưa có kế hoạch đào tạo nào. Các kế hoạch sẽ xuất hiện khi được tạo từ hồ sơ thiết bị.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
