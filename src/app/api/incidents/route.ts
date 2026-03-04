import { NextRequest, NextResponse } from "next/server";
import { mockIncidents, IncidentReport } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for incidents
let incidentsStore: IncidentReport[] = [...mockIncidents];

// Generate ID for new incidents
function generateId(): string {
  return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...incidentsStore].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
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
    const newIncident: IncidentReport = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    incidentsStore = [newIncident, ...incidentsStore];
    return NextResponse.json(newIncident, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
