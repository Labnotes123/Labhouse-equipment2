import type { Notification, NotificationType, NotificationPriority } from "./mockData";

/**
 * Service to create and manage notifications
 * In a real application, this would call an API endpoint
 */

interface CreateNotificationParams {
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  recipientId: string;
  recipientName: string;
  senderId?: string;
  senderName?: string;
  relatedType?: Notification["relatedType"];
  relatedId?: string;
  relatedCode?: string;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Create a notification - sends to API
 */
export async function createNotification(params: CreateNotificationParams): Promise<Notification | null> {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error("Failed to create notification:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  try {
    const url = new URL("/api/notifications", window.location.origin);
    url.searchParams.set("userId", userId);
    if (unreadOnly) {
      url.searchParams.set("unreadOnly", "true");
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Failed to fetch notifications:", await response.text());
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Mark notifications as read
 */
export async function markAsRead(notificationIds: string[]): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationIds }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markAllRead: true, userId }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const url = new URL("/api/notifications", window.location.origin);
    url.searchParams.set("id", notificationId);

    const response = await fetch(url.toString(), {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

// ============ Notification Templates ============

/**
 * Notify approver about a new approval request
 */
export async function notifyApprovalRequest({
  approverId,
  approverName,
  requestCode,
  requestType,
  requesterName,
  requesterId,
}: {
  approverId: string;
  approverName: string;
  requestCode: string;
  requestType: "proposal" | "incident" | "calibration";
  requesterName: string;
  requesterId: string;
}) {
  const typeLabels: Record<string, string> = {
    proposal: "Đề xuất mua thiết bị mới",
    incident: "Báo cáo sự cố",
    calibration: "Yêu cầu hiệu chuẩn",
  };

  return createNotification({
    type: "approval_request",
    priority: "high",
    title: "Yêu cầu duyệt mới",
    message: `${requesterName} đã gửi yêu cầu duyệt ${typeLabels[requestType]} ${requestCode}. Vui lòng xem xét và duyệt.`,
    recipientId: approverId,
    recipientName: approverName,
    senderId: requesterId,
    senderName: requesterName,
    relatedType: requestType,
    relatedCode: requestCode,
  });
}

/**
 * Notify requester about approval result
 */
export async function notifyApprovalResult({
  requesterId,
  requesterName,
  requestCode,
  requestType,
  approverName,
  approved,
  rejectionReason,
}: {
  requesterId: string;
  requesterName: string;
  requestCode: string;
  requestType: "proposal" | "incident" | "calibration";
  approverName: string;
  approved: boolean;
  rejectionReason?: string;
}) {
  const typeLabels: Record<string, string> = {
    proposal: "Đề xuất mua thiết bị mới",
    incident: "Báo cáo sự cố",
    calibration: "Yêu cầu hiệu chuẩn",
  };

  const status = approved ? "đã được duyệt" : "đã bị từ chối";
  const message = approved
    ? `${typeLabels[requestType]} ${requestCode} của bạn ${status} bởi ${approverName}.`
    : `${typeLabels[requestType]} ${requestCode} của bạn ${status} bởi ${approverName}. Lý do: ${rejectionReason}`;

  return createNotification({
    type: approved ? "approval_approved" : "approval_rejected",
    priority: approved ? "medium" : "high",
    title: approved ? "Đã duyệt" : "Từ chối",
    message,
    recipientId: requesterId,
    recipientName: requesterName,
    senderName: approverName,
    relatedType: requestType,
    relatedCode: requestCode,
  });
}

/**
 * Notify related users about training assignment
 */
export async function notifyTrainingAssignment({
  recipientId,
  recipientName,
  trainingCode,
  trainerName,
  deviceName,
}: {
  recipientId: string;
  recipientName: string;
  trainingCode: string;
  trainerName: string;
  deviceName: string;
}) {
  return createNotification({
    type: "training",
    priority: "medium",
    title: "Lịch đào tạo mới",
    message: `Bạn được chỉ định tham gia đào tạo thiết bị "${deviceName}" theo kế hoạch ${trainingCode} do ${trainerName} quản lý.`,
    recipientId,
    recipientName,
    senderName: trainerName,
    relatedType: "training",
    relatedCode: trainingCode,
  });
}

/**
 * Notify about calibration due
 */
export async function notifyCalibrationDue({
  recipientId,
  recipientName,
  deviceName,
  deviceCode,
  dueDate,
}: {
  recipientId: string;
  recipientName: string;
  deviceName: string;
  deviceCode: string;
  dueDate: string;
}) {
  return createNotification({
    type: "calibration",
    priority: "high",
    title: "Nhắc nhở hiệu chuẩn thiết bị",
    message: `Thiết bị ${deviceName} (${deviceCode}) sẽ đến hạn hiệu chuẩn vào ngày ${dueDate}. Vui lòng chuẩn bị kế hoạch hiệu chuẩn.`,
    recipientId,
    recipientName,
    relatedType: "device",
    relatedCode: deviceCode,
  });
}

/**
 * Notify about incident report
 */
export async function notifyIncidentReport({
  recipientId,
  recipientName,
  incidentCode,
  reporterName,
  deviceName,
}: {
  recipientId: string;
  recipientName: string;
  incidentCode: string;
  reporterName: string;
  deviceName: string;
}) {
  return createNotification({
    type: "incident",
    priority: "urgent",
    title: "Báo cáo sự cố mới",
    message: `${reporterName} đã báo cáo sự cố thiết bị "${deviceName}". Mã sự cố: ${incidentCode}. Vui lòng xem xét ngay.`,
    recipientId,
    recipientName,
    senderName: reporterName,
    relatedType: "incident",
    relatedCode: incidentCode,
  });
}
