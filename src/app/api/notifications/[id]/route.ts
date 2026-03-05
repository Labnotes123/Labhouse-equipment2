import { NextResponse } from "next/server";
import type { Notification } from "@/lib/mockData";

// In-memory storage for notifications (shared with parent route)
let notifications: Notification[] = [];

// GET /api/notifications/[id] - Get a specific notification
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notification = notifications.find((n) => n.id === id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/[id] - Update a notification (mark as read)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead } = body;

    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (isRead !== undefined) {
      notifications[index] = {
        ...notifications[index],
        isRead,
        readAt: isRead ? new Date().toISOString() : undefined,
      };
    }

    return NextResponse.json(notifications[index]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = notifications.findIndex((n) => n.id === id);

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
