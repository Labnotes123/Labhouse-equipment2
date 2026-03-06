import { NextRequest, NextResponse } from "next/server";
import { createIncident, listIncidents } from "@/lib/device-ops-store";
import type { IncidentReport } from "@/lib/mockData";

export const dynamic = "force-dynamic";

function validateIncident(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.deviceCode) return "deviceCode is required";
  if (!body?.deviceName) return "deviceName is required";
  if (!body?.description) return "description is required";
  if (!body?.immediateAction) return "immediateAction is required";
  if (!body?.reportCode && !body?.incidentDateTime) return "incidentDateTime is required";

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
  if (body?.attachments && !Array.isArray(body.attachments)) return "attachments must be an array";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);
    const offset = (page - 1) * pageSize;

    let result = [...listIncidents()];
    if (status) result = result.filter((i) => i.status === status);
    if (severity) result = result.filter((i) => i.severity === severity);

    result = result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const paged = result.slice(offset, offset + pageSize);
    return NextResponse.json(paged);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateIncident(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const newIncident = createIncident({
      ...body,
      status: body.status || "Chờ duyệt",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(newIncident, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
