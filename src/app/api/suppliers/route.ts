import { NextRequest, NextResponse } from "next/server";
import { mockSuppliers, Supplier } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for suppliers
let suppliersStore: Supplier[] = [...mockSuppliers];

// Generate ID for new suppliers
function generateId(): string {
  return `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...suppliersStore].sort((a, b) => {
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

    const newSupplier: Supplier = {
      id: generateId(),
      name: body.name,
      code: body.code || `NCC-${Date.now()}`,
      address: body.address || "",
      phone: body.phone || "",
      email: body.email || "",
      contactPerson: body.contactPerson || "",
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    suppliersStore = [newSupplier, ...suppliersStore];
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
