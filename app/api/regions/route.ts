import { NextResponse } from "next/server";
import { REGIONS } from "@/lib/data";
import { regionCounts } from "@/lib/search";

// GET /api/regions — regions with vendor counts (sidebar list, README)
export function GET() {
  const counts = regionCounts();
  return NextResponse.json(REGIONS.map((r) => ({ ...r, count: counts[r.id] ?? 0 })));
}
