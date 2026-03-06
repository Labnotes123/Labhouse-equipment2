import { NextRequest, NextResponse } from "next/server";
import { createDevice, listDevices } from "@/lib/device-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const result = [...listDevices(status)].sort((a, b) => b.code.localeCompare(a.code));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newDevice = createDevice(body);
    return NextResponse.json(newDevice, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
