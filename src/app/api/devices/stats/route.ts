import { NextResponse } from "next/server";
import { listDevices } from "@/lib/device-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const devices = listDevices();
    const statusCounts = devices.reduce<Record<string, number>>((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total: devices.length,
      byStatus: statusCounts,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
