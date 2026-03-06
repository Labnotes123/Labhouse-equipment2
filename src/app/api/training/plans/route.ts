import { NextRequest, NextResponse } from "next/server";
import { createTrainingPlan, listTrainingPlans } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validatePlan(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.title) return "title is required";
  return null;
}

export async function GET() {
  try {
    const result = [...listTrainingPlans()].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validatePlan(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = createTrainingPlan({ ...body, createdAt: new Date().toISOString() });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
