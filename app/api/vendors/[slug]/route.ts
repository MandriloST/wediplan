import { NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";

// GET /api/vendors/{slug} — profil pružatelja (zrcalo budućeg .NET endpointa)
export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const data = getProfile(params.slug);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data);
}
