import { NextRequest, NextResponse } from "next/server";
import { createBranch, listBranches } from "@/lib/admin-store";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...listBranches()].sort((a, b) => {
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

    const newBranch = createBranch({
      name: body.name,
      code: body.code,
      isActive: body.isActive,
    });
    return NextResponse.json(newBranch, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
