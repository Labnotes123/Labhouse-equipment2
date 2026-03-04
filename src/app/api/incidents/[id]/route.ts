import { NextRequest, NextResponse } from "next/server";
import { mockIncidents, IncidentReport } from "@/lib/mockData";

// In-memory store for incidents
let incidentsStore: IncidentReport[] = [...mockIncidents];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const incident = incidentsStore.find((i) => i.id === id);
    if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(incident);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = incidentsStore.findIndex((i) => i.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedIncident = {
      ...incidentsStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    incidentsStore[index] = updatedIncident;
    return NextResponse.json(updatedIncident);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = incidentsStore.findIndex((i) => i.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    incidentsStore = incidentsStore.filter((i) => i.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
