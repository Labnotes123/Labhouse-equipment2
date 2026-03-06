import { NextRequest, NextResponse } from "next/server";
import { listScopePermissions, upsertScopePermission } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(listScopePermissions());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorName = req.headers.get("x-actor-name") || "System";
    if (!body.profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }
    const saved = upsertScopePermission(body, actorName);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
