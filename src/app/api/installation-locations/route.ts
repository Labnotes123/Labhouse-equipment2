import { NextRequest, NextResponse } from "next/server";
import { createInstallationLocation, listInstallationLocations } from "@/lib/admin-store";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = [...listInstallationLocations()].sort((a, b) => {
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
      departmentId?: string;
      departmentName?: string;
      branchId?: string;
      branchName?: string;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên vị trí lắp đặt là bắt buộc" }, { status: 400 });
    }

    const created = createInstallationLocation(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
