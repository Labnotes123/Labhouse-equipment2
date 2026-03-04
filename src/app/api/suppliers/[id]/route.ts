import { NextRequest, NextResponse } from "next/server";
import { mockSuppliers, Supplier } from "@/lib/mockData";

// In-memory store for suppliers
let suppliersStore: Supplier[] = [...mockSuppliers];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supplier = suppliersStore.find((s) => s.id === id);
    if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = suppliersStore.findIndex((s) => s.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedSupplier = {
      ...suppliersStore[index],
      ...body,
    };
    suppliersStore[index] = updatedSupplier;
    return NextResponse.json(updatedSupplier);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = suppliersStore.findIndex((s) => s.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    suppliersStore = suppliersStore.filter((s) => s.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
