import { NextRequest, NextResponse } from "next/server";
import { createTrainingDocument, deleteTrainingDocument, listTrainingDocuments } from "@/lib/device-ops-store";

export const dynamic = "force-dynamic";

function validateDocument(body: any) {
  if (!body?.documentName) return "documentName is required";
  if (!body?.documentType) return "documentType is required";
  if (!body?.file?.url) return "file.url is required";
  return null;
}

export async function GET() {
  try {
    return NextResponse.json(listTrainingDocuments());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validateDocument(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = createTrainingDocument(body);
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
    const deleted = deleteTrainingDocument(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
