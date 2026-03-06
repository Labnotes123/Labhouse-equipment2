import { NextRequest, NextResponse } from "next/server";
import { deleteAcceptanceRecord, findAcceptanceRecord, updateAcceptanceRecord } from "@/lib/device-ops-store";
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const record = findAcceptanceRecord(params.id);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const error = validateAcceptance(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const updated = updateAcceptanceRecord(params.id, { ...body });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = deleteAcceptanceRecord(params.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
