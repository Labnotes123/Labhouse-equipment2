import { NextRequest, NextResponse } from "next/server";
import { deleteIncident, findIncident, updateIncident } from "@/lib/device-ops-store";
import type { IncidentReport } from "@/lib/mockData";

export const dynamic = "force-dynamic";

function validateIncident(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.deviceCode) return "deviceCode is required";
  if (!body?.deviceName) return "deviceName is required";
  if (!body?.description) return "description is required";
  if (!body?.immediateAction) return "immediateAction is required";

  const allowedStatus: IncidentReport["status"][] = ["Nháp", "Chờ duyệt", "Đã duyệt", "Từ chối", "Hoàn thành", "Đang khắc phục"];
  if (body?.status && !allowedStatus.includes(body.status)) return "invalid status";

  const allowedSeverity = ["low", "medium", "high", "critical"];
  if (body?.severity && !allowedSeverity.includes(body.severity)) return "invalid severity";

  if (body?.affectsPatientResult) {
    if (!body.affectedPatientSid) return "affectedPatientSid is required when affectsPatientResult is true";
    if (!body.howAffected) return "howAffected is required when affectsPatientResult is true";
  }

  if (body?.requiresDeviceStop && !body.stopFrom) return "stopFrom is required when requiresDeviceStop is true";

  if (body?.workOrders && !Array.isArray(body.workOrders)) return "workOrders must be an array";
  return null;
}

async function createNotification(payload: {
  title: string;
  message: string;
  recipientId: string;
  recipientName: string;
  relatedId?: string;
  relatedCode?: string;
  type?: string;
}) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        type: (payload.type as any) || "incident",
        relatedType: "incident",
        relatedId: payload.relatedId,
        relatedCode: payload.relatedCode,
      }),
    });
  } catch (err) {
    console.error("Failed to send notification", err);
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const incident = findIncident(params.id);
    if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(incident);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const error = validateIncident(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const action: string | undefined = body.action;
    const now = new Date().toISOString();
    let updates: Partial<IncidentReport> = { ...body };

    if (action === "approve") {
      updates = {
        ...updates,
        status: "Đã duyệt",
        approvedBy: body.approvedBy || body.actorName || body.deviceManager,
        approvedDate: now,
        rejectedBy: undefined,
        rejectedReason: undefined,
      };
    }

    if (action === "reject") {
      if (!body.rejectedReason) return NextResponse.json({ error: "rejectedReason is required" }, { status: 400 });
      updates = {
        ...updates,
        status: "Từ chối",
        rejectedBy: body.rejectedBy || body.actorName || body.deviceManager,
        rejectedReason: body.rejectedReason,
      };
    }

    if (action === "assign") {
      if (!body.assigneeId || !body.assigneeName) return NextResponse.json({ error: "assigneeId and assigneeName are required" }, { status: 400 });
      updates = {
        ...updates,
        assigneeId: body.assigneeId,
        assigneeName: body.assigneeName,
        status: body.status || "Đang khắc phục",
      };
    }

    if (action === "close") {
      updates = {
        ...updates,
        status: "Hoàn thành",
        completionDateTime: body.completionDateTime || now,
        conclusion: body.conclusion || "đã khắc phục",
      };
    }

    const updatedIncident = updateIncident(params.id, updates);
    if (!updatedIncident) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "approve" && updatedIncident.reportedBy) {
      await createNotification({
        title: "Sự cố đã được duyệt",
        message: `Báo cáo sự cố ${updatedIncident.reportCode} đã được duyệt bởi ${updatedIncident.approvedBy || "hệ thống"}.`,
        recipientId: updatedIncident.reportedBy,
        recipientName: updatedIncident.reportedBy,
        relatedId: updatedIncident.id,
        relatedCode: updatedIncident.reportCode,
        type: "approval_approved",
      });
    }

    if (action === "assign" && updatedIncident.assigneeId && updatedIncident.assigneeName) {
      await createNotification({
        title: "Bạn được giao xử lý sự cố",
        message: `Bạn được giao xử lý sự cố ${updatedIncident.reportCode}.`,
        recipientId: updatedIncident.assigneeId,
        recipientName: updatedIncident.assigneeName,
        relatedId: updatedIncident.id,
        relatedCode: updatedIncident.reportCode,
        type: "incident",
      });
    }

    return NextResponse.json(updatedIncident);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = deleteIncident(params.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
