"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useData } from "@/contexts/DataContext";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
} from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function UserProfileModal({ onClose }: Props) {
  const { user, updateProfile, updatePassword } = useAuth();
  const { success, error } = useToast();
  const { addHistory } = useData();
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // Info form
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  // Password form
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveInfo = () => {
    if (!fullName.trim()) {
      error("Lỗi", "Họ và tên không được để trống");
      return;
    }
    updateProfile({ fullName, email, phone });
    success("Cập nhật thành công", "Thông tin cá nhân đã được cập nhật");
    addHistory({
      userId: user?.id ?? "",
      userName: user?.fullName ?? "",
      action: "Cập nhật thông tin hồ sơ",
      targetId: user?.id ?? "",
      targetType: "Người dùng",
      details: `Cập nhật thông tin cá nhân: ${fullName}`,
    });
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPass !== confirmPass) {
      error("Lỗi", "Mật khẩu mới không khớp");
      return;
    }
    if (newPass.length < 6) {
      error("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    const ok = await updatePassword(oldPass, newPass);
    if (ok) {
      success("Đổi mật khẩu thành công", "Mật khẩu của bạn đã được cập nhật");
      addHistory({
        userId: user?.id ?? "",
        userName: user?.fullName ?? "",
        action: "Đổi mật khẩu",
        targetId: user?.id ?? "",
        targetType: "Người dùng",
        details: `Thay đổi mật khẩu`,
      });
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } else {
      error("Lỗi", "Mật khẩu cũ không đúng");
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg fade-in overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{user?.fullName}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[user?.role ?? ""] ?? "bg-white/20 text-white"}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "info", label: "Thông tin cá nhân", icon: <User size={16} /> },
            { id: "password", label: "Đổi mật khẩu", icon: <Lock size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "info" | "password")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "info" ? (
            <div className="space-y-4">
              {/* Username (readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tên đăng nhập</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Shield size={16} className="text-slate-400" />
                  <span className="text-slate-600 text-sm font-medium">{user?.username}</span>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Không thể thay đổi</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveInfo}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                <Save size={16} />
                Lưu thay đổi
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Mật khẩu hiện tại", value: oldPass, setter: setOldPass, show: showOld, toggle: () => setShowOld(!showOld) },
                { label: "Mật khẩu mới", value: newPass, setter: setNewPass, show: showNew, toggle: () => setShowNew(!showNew) },
                { label: "Xác nhận mật khẩu mới", value: confirmPass, setter: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{field.label}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={field.show ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={field.toggle}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleChangePassword}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                <Lock size={16} />
                Đổi mật khẩu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
