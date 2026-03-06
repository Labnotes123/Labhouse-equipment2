import { NextRequest, NextResponse } from "next/server";
import { createDepartment, listDepartments } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = [...listDepartments()].sort((a, b) => {
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
      branchId?: string;
      branchName?: string;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên khoa phòng là bắt buộc" }, { status: 400 });
    }

    const department = createDepartment({
      name: body.name,
      code: body.code,
      branchId: body.branchId,
      branchName: body.branchName,
      isActive: body.isActive,
    });
    return NextResponse.json(department, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
