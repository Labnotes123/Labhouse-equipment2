"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  FlaskConical,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  Activity,
  Microscope,
} from "lucide-react";

export default function LoginPage() {
  const { login, labName, logoUrl } = useAuth();
  const { success, error } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleUsernameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      error("Lỗi đăng nhập", "Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        success("Đăng nhập thành công", "Chào mừng bạn đến với hệ thống quản lý thiết bị!");
      } else {
        error("Đăng nhập thất bại", "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5" style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <FlaskConical size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Hệ Thống Quản Lý<br />Trang Thiết Bị
          </h1>
          <p className="text-blue-300 text-lg mb-12">Tiêu chuẩn ISO 15189:2022</p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
            {[
              { icon: <Shield size={20} />, title: "Bảo mật cao", desc: "Phân quyền theo vai trò" },
              { icon: <Activity size={20} />, title: "Theo dõi thực time", desc: "Lịch sử hành động đầy đủ" },
              { icon: <Microscope size={20} />, title: "Quản lý toàn diện", desc: "Hồ sơ, hiệu chuẩn, bảo dưỡng" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.3)" }}>
                  <span className="text-blue-300">{f.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>
            {/* Logo & Title */}
            <div className="text-center mb-8">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                  <FlaskConical size={32} className="text-white" />
                </div>
              )}
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                PHẦN MỀM QUẢN LÝ THIẾT BỊ
              </h2>
              <p className="text-sm font-semibold mt-1" style={{ color: "#2563eb" }}>
                {labName}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                <Shield size={12} />
                ISO 15189:2022
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleUsernameKeyDown}
                    placeholder="Nhập tên đăng nhập"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-medium transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handlePasswordKeyDown}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-medium transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Đăng nhập
                  </>
                )}
              </button>
            </div>

            {/* Demo accounts hint */}
            <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(37,99,235,0.06)" }}>
              <p className="text-xs font-semibold text-blue-700 mb-2">Tài khoản demo:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                <span>admin / admin123</span>
                <span>giamdoc / gd123</span>
                <span>ktv / ktv123</span>
                <span>qltb / qltb123</span>
              </div>
            </div>
          </div>

          <p className="text-center text-blue-300 text-xs mt-6">
            © 2024 LabHouse Medical Laboratory. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
