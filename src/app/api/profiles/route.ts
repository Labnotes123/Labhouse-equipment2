import { NextRequest, NextResponse } from "next/server";
import { mockProfiles, Profile, Permission } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for profiles
let profilesStore: Profile[] = [...mockProfiles];

// Generate ID for new profiles
function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...profilesStore].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string;
      code?: string;
      description?: string;
      permissions?: Permission[];
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên profile là bắt buộc" }, { status: 400 });
    }

    const newProfile: Profile = {
      id: generateId(),
      name: body.name,
      code: body.code || `PF-${Date.now()}`,
      description: body.description || "",
      permissions: body.permissions || [],
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    profilesStore = [newProfile, ...profilesStore];
    return NextResponse.json(newProfile, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
