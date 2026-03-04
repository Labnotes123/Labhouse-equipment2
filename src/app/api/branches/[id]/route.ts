import { NextRequest, NextResponse } from "next/server";
import { mockBranches, Branch } from "@/lib/mockData";

// In-memory store for branches
let branchesStore: Branch[] = [...mockBranches];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const branch = branchesStore.find((b) => b.id === id);
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
    const index = branchesStore.findIndex((b) => b.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedBranch = {
      ...branchesStore[index],
      ...body,
    };
    branchesStore[index] = updatedBranch;
    return NextResponse.json(updatedBranch);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = branchesStore.findIndex((b) => b.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    branchesStore = branchesStore.filter((b) => b.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
