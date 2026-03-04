import { NextRequest, NextResponse } from "next/server";
import { mockCalibrationResults, CalibrationResult } from "@/lib/mockData";

// In-memory store for calibration results
let calibrationResultsStore: CalibrationResult[] = [...mockCalibrationResults];

// Generate ID for new calibration results
function generateId(): string {
  return `ketqua_hc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const requestId = searchParams.get("requestId");
    const status = searchParams.get("status");

    let result = [...calibrationResultsStore];
    if (deviceId) {
      result = result.filter((r) => r.deviceId === deviceId);
    }
    if (requestId) {
      result = result.filter((r) => r.requestId === requestId);
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
    const newResult: CalibrationResult = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    calibrationResultsStore = [newResult, ...calibrationResultsStore];
    return NextResponse.json(newResult, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
