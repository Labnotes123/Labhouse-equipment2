import { NextRequest, NextResponse } from "next/server";
import { mockProposals, NewDeviceProposal } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for proposals
let proposalsStore: NewDeviceProposal[] = [...mockProposals];

// Generate ID for new proposals
function generateId(): string {
  return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...proposalsStore].sort((a, b) => {
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
    const newProposal: NewDeviceProposal = {
      ...body,
      id: generateId(),
      createdDate: new Date().toISOString(),
    };
    proposalsStore = [newProposal, ...proposalsStore];
    return NextResponse.json(newProposal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
