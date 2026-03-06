import { NextRequest, NextResponse } from "next/server";
import { createLiquidationProposal, listLiquidationProposals } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateLiquidation(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.deviceCode) return "deviceCode is required";
  if (!body?.method) return "method is required";
  return null;
}

export async function GET() {
  try {
    const result = [...listLiquidationProposals()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateLiquidation(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = createLiquidationProposal({ ...body, createdAt: new Date().toISOString() });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
