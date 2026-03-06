import { NextRequest, NextResponse } from "next/server";
import { createSupplier, listSuppliers } from "@/lib/admin-store";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...listSuppliers()].sort((a, b) => {
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
      address?: string;
      phone?: string;
      email?: string;
      contactPerson?: string;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên nhà cung cấp là bắt buộc" }, { status: 400 });
    }

    const actorName = req.headers.get("x-actor-name") || "System";
    const newSupplier = createSupplier({
      name: body.name,
      code: body.code,
      address: body.address,
      phone: body.phone,
      email: body.email,
      contactPerson: body.contactPerson,
      isActive: body.isActive,
    }, actorName);
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
