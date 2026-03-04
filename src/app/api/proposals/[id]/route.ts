import { NextRequest, NextResponse } from "next/server";
import { mockProposals, NewDeviceProposal } from "@/lib/mockData";

// In-memory store for proposals
let proposalsStore: NewDeviceProposal[] = [...mockProposals];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const proposal = proposalsStore.find((p) => p.id === id);
    if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(proposal);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = proposalsStore.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedProposal = {
      ...proposalsStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    proposalsStore[index] = updatedProposal;
    return NextResponse.json(updatedProposal);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = proposalsStore.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    proposalsStore = proposalsStore.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
