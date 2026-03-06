import { NextRequest, NextResponse } from "next/server";
import { deleteSupplier, findSupplier, updateSupplier } from "@/lib/admin-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supplier = findSupplier(id);
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
    const actorName = req.headers.get("x-actor-name") || "System";
    const updatedSupplier = updateSupplier(id, body, actorName);
    if (!updatedSupplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedSupplier);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actorName = _req.headers.get("x-actor-name") || "System";
    const removed = deleteSupplier(id, actorName);
    if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
