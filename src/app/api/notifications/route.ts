import { NextResponse } from "next/server";
import type { Notification } from "@/lib/mockData";
import { sendApprovalRequestEmail, sendApprovalResultEmail, isEmailConfigured } from "@/lib/email-service";
import { MOCK_USERS_LIST } from "@/lib/mockData";

// In-memory storage for notifications (in a real app, this would be a database)
let notifications: Notification[] = [];

// GET /api/notifications - Get all notifications for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let filtered = notifications.filter((n) => n.recipientId === userId);

    if (unreadOnly) {
      filtered = filtered.filter((n) => !n.isRead);
    }

    // Sort by createdAt descending (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      priority,
      title,
      message,
      recipientId,
      recipientName,
      senderId,
      senderName,
      relatedType,
      relatedId,
      relatedCode,
      actionUrl,
      actionLabel,
    } = body;

    // Validate required fields
    if (!type || !title || !message || !recipientId || !recipientName) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message, recipientId, recipientName" },
        { status: 400 }
      );
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || "system",
      priority: priority || "medium",
      title,
      message,
      recipientId,
      recipientName,
      senderId,
      senderName,
      relatedType,
      relatedId,
      relatedCode,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl,
      actionLabel,
    };

    notifications.push(notification);

    // Send email notification if email service is configured
    if (isEmailConfigured()) {
      try {
        // Try to get email from body first, then fallback to MOCK_USERS_LIST
        const recipientEmail = body.recipientEmail || body.email;
        
        if (recipientEmail) {
          switch (type) {
            case "approval_request":
              await sendApprovalRequestEmail({
                to: recipientEmail,
                recipientName: recipientName,
                requestCode: relatedCode || "",
                requestType: relatedType || "proposal",
                requesterName: senderName || "",
              });
              break;
            case "approval_approved":
            case "approval_rejected":
              await sendApprovalResultEmail({
                to: recipientEmail,
                recipientName: recipientName,
                requestCode: relatedCode || "",
                requestType: relatedType || "proposal",
                approverName: senderName || "",
                approved: type === "approval_approved",
              });
              break;
          }
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue - notification was created successfully even if email failed
      }
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notificationIds, markAllRead, userId } = body;

    if (markAllRead && userId) {
      // Mark all as read for a user
      notifications = notifications.map((n) => {
        if (n.recipientId === userId && !n.isRead) {
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      notificationIds.forEach((id: string) => {
        const index = notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          notifications[index] = {
            ...notifications[index],
            isRead: true,
            readAt: new Date().toISOString(),
          };
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "notification id is required" },
        { status: 400 }
      );
    }

    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    notifications.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
