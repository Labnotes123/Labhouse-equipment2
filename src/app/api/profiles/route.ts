import { NextRequest, NextResponse } from "next/server";
import { createProfile, listProfiles } from "@/lib/admin-store";
import type { Permission } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...listProfiles()].sort((a, b) => {
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
      detailedPermissions?: any;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên profile là bắt buộc" }, { status: 400 });
    }

    const actorName = req.headers.get("x-actor-name") || "System";
    const newProfile = createProfile({
      name: body.name,
      code: body.code,
      description: body.description,
      permissions: body.permissions,
      detailedPermissions: body.detailedPermissions,
      isActive: body.isActive,
    }, actorName);
    return NextResponse.json(newProfile, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
