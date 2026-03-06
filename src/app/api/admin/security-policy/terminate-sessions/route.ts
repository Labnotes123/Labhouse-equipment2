import { NextRequest, NextResponse } from "next/server";
import { terminateAllSessions } from "@/lib/admin-store";

export async function POST(req: NextRequest) {
  try {
    const actorName = req.headers.get("x-actor-name") || "System";
    return NextResponse.json(terminateAllSessions(actorName));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
