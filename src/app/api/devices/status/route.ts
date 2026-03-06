import { NextRequest, NextResponse } from "next/server";
import { findDevice, updateDevice, addDeviceStatusHistory, listDeviceStatusHistory } from "@/lib/device-store";
import type { Device } from "@/lib/mockData";

export const dynamic = "force-dynamic";

const allowedStatus: Device["status"][] = [
  "Đăng ký mới",
  "Chờ vận hành",
  "Đang vận hành",
  "Tạm dừng",
  "Tạm điều chuyển",
  "Ngừng sử dụng",
];

function validate(body: any) {
  if (!body?.deviceId) return "deviceId is required";
  if (!body?.toStatus) return "toStatus is required";
  if (!allowedStatus.includes(body.toStatus)) return "invalid toStatus";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId") || undefined;
    const result = listDeviceStatusHistory(deviceId);
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
    if (!device) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = updateDevice(device.id, { status: body.toStatus });
    if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

    const entry = addDeviceStatusHistory({
      deviceId: device.id,
      deviceCode: device.code,
      fromStatus: device.status,
      toStatus: body.toStatus,
      reason: body.reason,
      actor: body.actor,
      changedAt: new Date().toISOString(),
    });

    return NextResponse.json({ device: updated, history: entry });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
