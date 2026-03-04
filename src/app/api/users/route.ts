import { NextRequest, NextResponse } from "next/server";
import { mockUserProfiles, UserProfile } from "@/lib/mockData";

// In-memory store for users
let usersStore: UserProfile[] = [...mockUserProfiles];

// Generate ID for new users
function generateId(): string {
  return `u${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    return NextResponse.json(usersStore);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUser: UserProfile = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    usersStore = [newUser, ...usersStore];
    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
