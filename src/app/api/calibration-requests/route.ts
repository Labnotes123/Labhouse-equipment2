import { NextRequest, NextResponse } from "next/server";
import { createCalibrationRequest, listCalibrationRequests } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateCalibrationRequest(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = [...listCalibrationRequests({ deviceId, status })].sort((a, b) => {
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
    const error = validateCalibrationRequest(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const newRequest = createCalibrationRequest({ ...body, createdAt: new Date().toISOString() });
    return NextResponse.json(newRequest, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
