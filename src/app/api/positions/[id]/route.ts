import { NextRequest, NextResponse } from "next/server";
import { mockPositions, Position } from "@/lib/mockData";

// In-memory store for positions
let positionsStore: Position[] = [...mockPositions];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const position = positionsStore.find((p) => p.id === id);
    if (!position) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(position);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = positionsStore.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedPosition = {
      ...positionsStore[index],
      ...body,
    };
    positionsStore[index] = updatedPosition;
    return NextResponse.json(updatedPosition);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = positionsStore.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    positionsStore = positionsStore.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
