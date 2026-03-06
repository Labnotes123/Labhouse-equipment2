import { NextRequest, NextResponse } from "next/server";
import { deleteCalibrationResult, findCalibrationResult, updateCalibrationResult } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

async function resolveId(params: Promise<{ id: string }>) {
  return (await params).id;
}

function validateCalibrationResult(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const result = findCalibrationResult(id);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const error = validateCalibrationResult(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const id = await resolveId(params);
    const updatedResult = updateCalibrationResult(id, body);
    if (!updatedResult) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedResult);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const deleted = deleteCalibrationResult(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
