import { NextRequest, NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/admin-store";

export async function GET() {
  try {
    return NextResponse.json(listUsers());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorName = req.headers.get("x-actor-name") || "System";
    const newUser = createUser(body, actorName);
    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
