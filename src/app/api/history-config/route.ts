import { NextRequest, NextResponse } from "next/server";
import { getHistoryConfig, updateHistoryConfig } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getHistoryConfig());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateHistoryConfig(body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
