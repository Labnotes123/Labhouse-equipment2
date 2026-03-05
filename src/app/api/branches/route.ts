import { NextRequest, NextResponse } from "next/server";
import { mockBranches, Branch } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for branches
let branchesStore: Branch[] = [...mockBranches];

// Generate ID for new branches
function generateId(): string {
  return `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...branchesStore].sort((a, b) => {
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
      departments?: string[];
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên chi nhánh là bắt buộc" }, { status: 400 });
    }

    const newBranch: Branch = {
      id: generateId(),
      name: body.name,
      code: body.code || `CN-${Date.now()}`,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    branchesStore = [newBranch, ...branchesStore];
    return NextResponse.json(newBranch, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
