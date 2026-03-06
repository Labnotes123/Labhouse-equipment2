import { NextRequest, NextResponse } from "next/server";
import { deleteSchedule, findSchedule, updateSchedule } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

async function resolveId(params: Promise<{ id: string }>) {
  return (await params).id;
}

function validateSchedule(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.scheduledDate) return "scheduledDate is required";
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const schedule = findSchedule(id);
    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(schedule);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const error = validateSchedule(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const id = await resolveId(params);
    const updatedSchedule = updateSchedule(id, body);
    if (!updatedSchedule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedSchedule);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const deleted = deleteSchedule(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
