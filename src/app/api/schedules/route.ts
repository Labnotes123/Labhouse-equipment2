import { NextRequest, NextResponse } from "next/server";
import { createSchedule, listSchedules } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateSchedule(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.scheduledDate) return "scheduledDate is required";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const deviceId = searchParams.get("deviceId") || undefined;

    const result = [...listSchedules({ type, deviceId })].sort((a, b) => {
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
    const error = validateSchedule(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const newSchedule = createSchedule(body);
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
