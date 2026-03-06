import { NextRequest, NextResponse } from "next/server";
import { deleteBranch, findBranch, updateBranch } from "@/lib/admin-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const branch = findBranch(id);
    if (!branch) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(branch);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorName = req.headers.get("x-actor-name") || "System";
    const updatedBranch = updateBranch(id, body, actorName);
    if (!updatedBranch) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedBranch);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actorName = _req.headers.get("x-actor-name") || "System";
    const removed = deleteBranch(id, actorName);
    if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
