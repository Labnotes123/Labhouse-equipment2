import { NextRequest, NextResponse } from "next/server";
import { createProposal, listProposals } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = [...listProposals()].sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return dateB - dateA;
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProposal = createProposal({ ...body, createdDate: new Date().toISOString() });
    return NextResponse.json(newProposal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
