import { NextRequest, NextResponse } from "next/server";
import { mockDevices, Device } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for devices
let devicesStore: Device[] = [...mockDevices];

// Generate ID for new devices
function generateId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let result = [...devicesStore];
    if (status) {
      result = result.filter((d) => d.status === status);
    }

    // Sort by code descending (most recent first)
    result.sort((a, b) => b.code.localeCompare(a.code));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newDevice: Device = {
      ...body,
      id: generateId(),
    } as Device;
    devicesStore = [newDevice, ...devicesStore];
    return NextResponse.json(newDevice, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
