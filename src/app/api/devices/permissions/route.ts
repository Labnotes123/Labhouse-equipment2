import { NextRequest, NextResponse } from "next/server";
import { addDevicePermissionLog, listDevicePermissionLogs, findDevice } from "@/lib/device-store";

export const dynamic = "force-dynamic";

function validate(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.userId) return "userId is required";
  if (!body?.userName) return "userName is required";
  if (!body?.action) return "action is required";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId") || undefined;
    const result = listDevicePermissionLogs(deviceId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = validate(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const device = findDevice(body.deviceId);
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    const log = addDevicePermissionLog({
      deviceId: device.id,
      deviceCode: device.code,
      userId: body.userId,
      userName: body.userName,
      action: body.action,
      performedAt: body.performedAt || new Date().toISOString(),
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
