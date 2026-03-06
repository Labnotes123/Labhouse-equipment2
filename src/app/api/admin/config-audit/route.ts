import { NextRequest, NextResponse } from "next/server";
import { listConfigAuditLogs } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "100");
    const targetType = searchParams.get("targetType") || "";
    let rows = listConfigAuditLogs(limit);
    if (targetType) {
      rows = rows.filter((row) => row.targetType === targetType);
    }
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
