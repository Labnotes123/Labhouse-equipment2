import { NextRequest, NextResponse } from "next/server";
import { createTrainingResult, deleteTrainingResult, listTrainingResults } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateResult(body: any) {
  if (!body?.planId) return "planId is required";
  if (!Array.isArray(body?.attendees)) return "attendees is required";
  return null;
}

export async function GET() {
  try {
    return NextResponse.json(listTrainingResults());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateResult(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = createTrainingResult(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const deleted = deleteTrainingResult(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
