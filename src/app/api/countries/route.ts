import { NextRequest, NextResponse } from "next/server";
import { addCountry, deleteCountry, listCountries } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(listCountries());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string };
    if (!body.name) return NextResponse.json({ error: "Tên quốc gia là bắt buộc" }, { status: 400 });
    const data = addCountry(body.name);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { name?: string };
    if (!body.name) return NextResponse.json({ error: "Thiếu tên quốc gia" }, { status: 400 });
    const data = deleteCountry(body.name);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
