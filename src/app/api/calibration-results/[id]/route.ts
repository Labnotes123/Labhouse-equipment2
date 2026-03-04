import { NextRequest, NextResponse } from "next/server";
import { mockCalibrationResults, CalibrationResult } from "@/lib/mockData";

// In-memory store for calibration results
let calibrationResultsStore: CalibrationResult[] = [...mockCalibrationResults];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = calibrationResultsStore.find((r) => r.id === id);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = calibrationResultsStore.findIndex((r) => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedResult = {
      ...calibrationResultsStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    calibrationResultsStore[index] = updatedResult;
    return NextResponse.json(updatedResult);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = calibrationResultsStore.findIndex((r) => r.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    calibrationResultsStore = calibrationResultsStore.filter((r) => r.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
