import { NextResponse } from "next/server";

export async function POST() {
  // Stateless API – client clears its own session state.
  // This endpoint exists so a server-side cookie/session can be cleared
  // in the future without changing the client contract.
  return NextResponse.json({ ok: true });
}
