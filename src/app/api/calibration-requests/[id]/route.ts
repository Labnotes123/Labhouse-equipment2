import { NextRequest, NextResponse } from "next/server";
import { mockCalibrationRequests, CalibrationRequest } from "@/lib/mockData";

// In-memory store for calibration requests
let calibrationRequestsStore: CalibrationRequest[] = [...mockCalibrationRequests];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const request = calibrationRequestsStore.find((r) => r.id === id);
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(request);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = calibrationRequestsStore.findIndex((r) => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedRequest = {
      ...calibrationRequestsStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    calibrationRequestsStore[index] = updatedRequest;
    return NextResponse.json(updatedRequest);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = calibrationRequestsStore.findIndex((r) => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    calibrationRequestsStore = calibrationRequestsStore.filter((r) => r.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
