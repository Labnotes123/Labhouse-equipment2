import { NextRequest, NextResponse } from "next/server";
import { deleteLiquidationProposal, findLiquidationProposal, updateLiquidationProposal } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

async function resolveId(params: Promise<{ id: string }>) {
  return (await params).id;
}

function validateLiquidation(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.deviceCode) return "deviceCode is required";
  if (!body?.method) return "method is required";
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const proposal = findLiquidationProposal(id);
    if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(proposal);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const error = validateLiquidation(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const id = await resolveId(params);
    const updated = updateLiquidationProposal(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const deleted = deleteLiquidationProposal(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
