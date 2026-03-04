import { NextRequest, NextResponse } from "next/server";
import { mockUserProfiles, UserProfile } from "@/lib/mockData";

// In-memory store for users
let usersStore: UserProfile[] = [...mockUserProfiles];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = usersStore.find((u) => u.id === id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedUser = {
      ...usersStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    usersStore[index] = updatedUser;
    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    usersStore = usersStore.filter((u) => u.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
