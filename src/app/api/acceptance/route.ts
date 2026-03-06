import { NextRequest, NextResponse } from "next/server";
import { createAcceptanceRecord, listAcceptanceRecords } from "@/lib/device-ops-store";
import type { AcceptanceRecord } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateAcceptance(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.deviceCode) return "deviceCode is required";
  if (!body?.recordType) return "recordType is required";

  const allowedTypes: AcceptanceRecord["recordType"][] = ["handover", "return", "transport"];
  if (body?.recordType && !allowedTypes.includes(body.recordType)) return "invalid recordType";

  if (body?.recordType === "return" && !body.returnReason) return "returnReason is required for return record";
  if (body?.recordType === "transport" && !body.transportPartner) return "transportPartner is required for transport record";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recordType = searchParams.get("recordType") as AcceptanceRecord["recordType"] | null;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);
    const offset = (page - 1) * pageSize;

    let result = [...listAcceptanceRecords()];
    if (recordType) result = result.filter((r) => r.recordType === recordType);
    if (status) result = result.filter((r) => r.status === status);

    result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const paged = result.slice(offset, offset + pageSize);
    return NextResponse.json(paged);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateAcceptance(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = createAcceptanceRecord({
      ...body,
      status: body.status || "pending",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
