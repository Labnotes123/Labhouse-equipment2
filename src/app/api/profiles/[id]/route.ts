import { NextRequest, NextResponse } from "next/server";
import { mockProfiles, Profile } from "@/lib/mockData";

// In-memory store for profiles
let profilesStore: Profile[] = [...mockProfiles];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = profilesStore.find((p) => p.id === id);
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
    const index = profilesStore.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedProfile = {
      ...profilesStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    profilesStore[index] = updatedProfile;
    return NextResponse.json(updatedProfile);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = profilesStore.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    profilesStore = profilesStore.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
