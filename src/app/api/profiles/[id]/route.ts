import { NextRequest, NextResponse } from "next/server";
import { deleteProfile, findProfile, updateProfile } from "@/lib/admin-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = findProfile(id);
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorName = req.headers.get("x-actor-name") || "System";
    const updatedProfile = updateProfile(id, body, actorName);
    if (!updatedProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedProfile);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actorName = _req.headers.get("x-actor-name") || "System";
    const removed = deleteProfile(id, actorName);
    if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
