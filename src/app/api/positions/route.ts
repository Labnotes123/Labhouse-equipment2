import { NextRequest, NextResponse } from "next/server";
import { mockPositions, Position } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for positions
let positionsStore: Position[] = [...mockPositions];

// Generate ID for new positions
function generateId(): string {
  return `position_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...positionsStore].sort((a, b) => {
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
    const body = await req.json() as {
      name: string;
      code?: string;
      description?: string;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên chức vụ là bắt buộc" }, { status: 400 });
    }

    const newPosition: Position = {
      id: generateId(),
      name: body.name,
      code: body.code || `CV-${Date.now()}`,
      description: body.description || "",
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    positionsStore = [newPosition, ...positionsStore];
    return NextResponse.json(newPosition, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
