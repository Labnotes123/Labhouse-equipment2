import { NextRequest, NextResponse } from "next/server";
import { mockSchedules, CalibrationSchedule } from "@/lib/mockData";

// In-memory store for schedules
let schedulesStore: CalibrationSchedule[] = [...mockSchedules];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const schedule = schedulesStore.find((s) => s.id === id);
    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(schedule);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = schedulesStore.findIndex((s) => s.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedSchedule = {
      ...schedulesStore[index],
      ...body,
    };
    schedulesStore[index] = updatedSchedule;
    return NextResponse.json(updatedSchedule);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = schedulesStore.findIndex((s) => s.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    schedulesStore = schedulesStore.filter((s) => s.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
