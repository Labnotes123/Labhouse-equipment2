import { NextRequest, NextResponse } from "next/server";
import { deleteCalibrationRequest, findCalibrationRequest, updateCalibrationRequest } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

async function resolveId(params: Promise<{ id: string }>) {
  return (await params).id;
}

function validateCalibrationRequest(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const request = findCalibrationRequest(id);
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(request);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const error = validateCalibrationRequest(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const id = await resolveId(params);
    const updatedRequest = updateCalibrationRequest(id, body);
    if (!updatedRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedRequest);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const deleted = deleteCalibrationRequest(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
