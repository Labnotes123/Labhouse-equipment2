import { NextRequest, NextResponse } from "next/server";
import { getSecurityPolicy, updateSecurityPolicy } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getSecurityPolicy());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const actorName = req.headers.get("x-actor-name") || "System";
    const updated = updateSecurityPolicy(body, actorName);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
