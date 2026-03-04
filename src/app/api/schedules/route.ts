import { NextRequest, NextResponse } from "next/server";
import { mockSchedules, CalibrationSchedule } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for schedules
let schedulesStore: CalibrationSchedule[] = [...mockSchedules];

// Generate ID for new schedules
function generateId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const deviceId = searchParams.get("deviceId");

    let result = [...schedulesStore];
    if (type) {
      result = result.filter((s) => s.type === type);
    }
    if (deviceId) {
      result = result.filter((s) => s.deviceId === deviceId);
    }

    // Sort by scheduled date ascending
    result.sort((a, b) => {
      const dateA = new Date(a.scheduledDate || 0).getTime();
      const dateB = new Date(b.scheduledDate || 0).getTime();
      return dateA - dateB;
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newSchedule: CalibrationSchedule = {
      ...body,
      id: generateId(),
    };
    schedulesStore = [...schedulesStore, newSchedule];
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
