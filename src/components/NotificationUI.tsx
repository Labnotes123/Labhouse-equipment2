"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, X, FileText, AlertTriangle, Clock, Trash2, ExternalLink } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/contexts/ToastContext";

const priorityColors: Record<string, string> = {
  low: "bg-slate-100",
  medium: "bg-blue-100",
  high: "bg-orange-100",
  urgent: "bg-red-100",
};

const priorityTextColors: Record<string, string> = {
  low: "text-slate-600",
  medium: "text-blue-700",
  high: "text-orange-700",
  urgent: "text-red-700",
};

const typeIcons: Record<string, React.ReactNode> = {
  approval_request: <FileText size={16} />,
  approval_approved: <Check size={16} />,
  approval_rejected: <X size={16} />,
  training: <Clock size={16} />,
  calibration: <Clock size={16} />,
  incident: <AlertTriangle size={16} />,
  maintenance: <AlertTriangle size={16} />,
  system: <Bell size={16} />,
};

const typeLabels: Record<string, string> = {
  approval_request: "Yêu cầu duyệt",
  approval_approved: "Đã duyệt",
  approval_rejected: "Từ chối",
  training: "Đào tạo",
  calibration: "Hiệu chuẩn",
  incident: "Sự cố",
  maintenance: "Bảo trì",
  system: "Hệ thống",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationUI() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const { success, error: showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle clicking on a notification
  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead([notificationId]);
    }
    // Could navigate to the related item here
    setIsOpen(false);
  };

  // Handle marking all as read
  const handleMarkAllRead = async () => {
    await markAllAsRead();
    success("Đã đánh dấu tất cả là đã đọc");
  };

  // Handle deleting a notification
  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  // Get recent notifications (max 10)
  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
      >
        <Bell size={18} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05))" }}>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              <span className="font-bold text-slate-800">Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                  className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      priorityColors[notification.priority] || "bg-slate-100"
                    }`}>
                      <span className={priorityTextColors[notification.priority] || "text-slate-600"}>
                        {typeIcons[notification.type] || <Bell size={16} />}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${
                          !notification.isRead ? "text-slate-800" : "text-slate-600"
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            priorityColors[notification.priority] || "bg-slate-100"
                          } ${priorityTextColors[notification.priority] || "text-slate-600"}`}>
                            {typeLabels[notification.type] || notification.type}
                          </span>
                          {notification.relatedCode && (
                            <span className="text-xs text-slate-400">
                              {notification.relatedCode}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to full notification page
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả thông báo ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
