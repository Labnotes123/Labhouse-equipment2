import { NextRequest, NextResponse } from "next/server";
import { createRoleTemplate, listRoleTemplates } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(listRoleTemplates());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorName = req.headers.get("x-actor-name") || "System";
    if (!body.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const created = createRoleTemplate(body, actorName);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
