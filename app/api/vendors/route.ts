import { NextRequest, NextResponse } from "next/server";
import { queryVendors } from "@/lib/search";
import type { RegionId } from "@/lib/types";

// Contract mirror of: GET /api/vendors (ASP.NET Core) — see API.md
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = queryVendors({
    q: sp.get("q") ?? undefined,
    region: (sp.get("region") as RegionId) ?? undefined,
    category: sp.get("category") ?? undefined,
    date: sp.get("date") ?? undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
  });
  return NextResponse.json(result);
}
