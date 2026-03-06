import { NextRequest, NextResponse } from "next/server";
import { createCalibrationResult, listCalibrationResults } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateCalibrationResult(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId") || undefined;
    const requestId = searchParams.get("requestId") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = [...listCalibrationResults({ deviceId, requestId, status })].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateCalibrationResult(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const newResult = createCalibrationResult({ ...body, createdAt: new Date().toISOString() });
    return NextResponse.json(newResult, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
