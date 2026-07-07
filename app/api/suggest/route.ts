import { NextRequest, NextResponse } from "next/server";
import { suggest } from "@/lib/search";

// GET /api/suggest?q= — typeahead across vendors, categories, cities
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json(suggest(q));
}
