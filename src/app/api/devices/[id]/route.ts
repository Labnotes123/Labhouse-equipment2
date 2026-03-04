import { NextRequest, NextResponse } from "next/server";
import { mockDevices, Device } from "@/lib/mockData";

// In-memory store for devices
let devicesStore: Device[] = [...mockDevices];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const device = devicesStore.find((d) => d.id === id);
    if (!device) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(device);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = devicesStore.findIndex((d) => d.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const updatedDevice = {
      ...devicesStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    devicesStore[index] = updatedDevice;
    return NextResponse.json(updatedDevice);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = devicesStore.findIndex((d) => d.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    devicesStore = devicesStore.filter((d) => d.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
