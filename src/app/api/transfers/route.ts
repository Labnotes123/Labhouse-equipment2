import { NextRequest, NextResponse } from "next/server";
import { createTransferProposal, listTransferProposals } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateTransfer(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.deviceCode) return "deviceCode is required";
  if (!body?.fromLocation) return "fromLocation is required";
  if (!body?.toLocation) return "toLocation is required";
  return null;
}

export async function GET() {
  try {
    const result = [...listTransferProposals()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateTransfer(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = createTransferProposal({ ...body, createdAt: new Date().toISOString() });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
