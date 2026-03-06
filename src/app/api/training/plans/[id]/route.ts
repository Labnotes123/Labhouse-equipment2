import { NextRequest, NextResponse } from "next/server";
import { deleteTrainingPlan, findTrainingPlan, updateTrainingPlanStore } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

async function resolveId(params: Promise<{ id: string }>) {
  return (await params).id;
}

function validatePlan(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.title) return "title is required";
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const plan = findTrainingPlan(id);
    if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(plan);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const error = validatePlan(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const id = await resolveId(params);
    const updated = updateTrainingPlanStore(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await resolveId(params);
    const deleted = deleteTrainingPlan(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
