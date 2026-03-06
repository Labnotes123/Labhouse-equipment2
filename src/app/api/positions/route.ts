import { NextRequest, NextResponse } from "next/server";
import { createPosition, listPositions } from "@/lib/admin-store";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...listPositions()].sort((a, b) => {
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
      departmentId?: string;
      departmentName?: string;
      branchId?: string;
      branchName?: string;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên chức vụ là bắt buộc" }, { status: 400 });
    }

    const newPosition = createPosition({
      name: body.name,
      code: body.code,
      description: body.description,
      departmentId: body.departmentId,
      departmentName: body.departmentName,
      branchId: body.branchId,
      branchName: body.branchName,
      isActive: body.isActive,
    });
    return NextResponse.json(newPosition, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
