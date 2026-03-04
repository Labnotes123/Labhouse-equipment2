import { NextRequest, NextResponse } from "next/server";
import { mockHistoryLogs, HistoryLog } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

// In-memory store for history
let historyStore: HistoryLog[] = [...mockHistoryLogs];

// Generate ID for new history logs
function generateId(): string {
  return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const offset = (page - 1) * limit;

    // Sort by timestamp descending
    const sorted = [...historyStore].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginated = sorted.slice(offset, offset + limit);
    return NextResponse.json(paginated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newLog: HistoryLog = {
      ...body,
      id: generateId(),
    };
    historyStore = [newLog, ...historyStore];
    return NextResponse.json(newLog, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
