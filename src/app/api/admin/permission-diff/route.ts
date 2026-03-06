import { NextRequest, NextResponse } from "next/server";
import { compareProfilePermissions } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leftProfileId = searchParams.get("leftProfileId") || "";
    const rightProfileId = searchParams.get("rightProfileId") || "";
    if (!leftProfileId || !rightProfileId) {
      return NextResponse.json({ error: "leftProfileId and rightProfileId are required" }, { status: 400 });
    }
    return NextResponse.json(compareProfilePermissions(leftProfileId, rightProfileId));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
