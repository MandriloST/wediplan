import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ExploreShell, { type ExploreFilters } from "@/components/ExploreShell";
import { CATEGORY_BY_SLUG, REGION_BY_ID, REGIONS } from "@/lib/data";
import type { RegionId } from "@/lib/types";

interface Props {
  params: { filters?: string[] };
  searchParams: { q?: string };
}

function parse(params: Props["params"], searchParams: Props["searchParams"]): ExploreFilters | null {
  const segs = params.filters ?? [];
  const f: ExploreFilters = { q: searchParams.q };
  if (segs.length > 2) return null;

  if (segs[0]) {
    if (segs[0] in REGION_BY_ID) f.region = segs[0] as RegionId;
    else if (CATEGORY_BY_SLUG[segs[0]]) f.category = segs[0];
    else return null;
  }
  if (segs[1]) {
    if (!f.region || !CATEGORY_BY_SLUG[segs[1]]) return null;
    f.category = segs[1];
  }
  return f;
}

export function generateMetadata({ params, searchParams }: Props): Metadata {
  const f = parse(params, searchParams);
  if (!f) return {};
  const parts = [
    f.category ? CATEGORY_BY_SLUG[f.category].name : undefined,
    f.region ? REGIONS.find((r) => r.id === f.region)?.name : undefined,
  ].filter(Boolean);
  const title = parts.length ? `${parts.join(" · ")} — Wediplan` : undefined;
  return title ? { title } : {};
}

export default function ExplorePage({ params, searchParams }: Props) {
  const filters = parse(params, searchParams);
  if (!filters) notFound();
  return <ExploreShell filters={filters} />;
}
