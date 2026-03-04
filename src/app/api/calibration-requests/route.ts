import { NextRequest, NextResponse } from "next/server";
import { mockCalibrationRequests, CalibrationRequest } from "@/lib/mockData";

// In-memory store for calibration requests
let calibrationRequestsStore: CalibrationRequest[] = [...mockCalibrationRequests];

// Generate ID for new calibration requests
function generateId(): string {
  return `phc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const status = searchParams.get("status");

    let result = [...calibrationRequestsStore];
    if (deviceId) {
      result = result.filter((r) => r.deviceId === deviceId);
    }
    if (status) {
      result = result.filter((r) => r.status === status);
    }

    // Sort by created date descending
    result.sort((a, b) => {
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
    const newRequest: CalibrationRequest = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    calibrationRequestsStore = [newRequest, ...calibrationRequestsStore];
    return NextResponse.json(newRequest, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
