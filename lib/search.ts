import { CATEGORIES, CATEGORY_BY_SLUG, REGIONS, VENDORS } from "./data";
import type { Paged, Vendor, VendorQuery } from "./types";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export function queryVendors(q: VendorQuery): Paged<Vendor> {
  let items = VENDORS.slice();

  if (q.region) items = items.filter((v) => v.region === q.region);
  if (q.category) items = items.filter((v) => v.category === q.category);
  if (q.q) {
    const needle = norm(q.q);
    items = items.filter((v) => {
      const cat = CATEGORY_BY_SLUG[v.category];
      const hay = norm(`${v.name} ${v.city} ${cat?.name ?? ""} ${v.styleTags.join(" ")}`);
      return hay.includes(needle);
    });
  }

  items.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(200, q.pageSize ?? 24);
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export interface Suggestion {
  type: "category" | "region" | "vendor" | "city";
  label: string;
  sub?: string;
  href: string;
}

/** Typeahead across vendor names, categories, cities (README: search typeahead). */
export function suggest(input: string, limit = 7): Suggestion[] {
  const needle = norm(input.trim());
  if (!needle) return [];
  const out: Suggestion[] = [];

  for (const c of CATEGORIES) {
    if (norm(c.name).includes(needle) || (c.short && norm(c.short).includes(needle)))
      out.push({ type: "category", label: c.name, sub: "kategorija", href: `/${c.slug}` });
  }
  for (const r of REGIONS) {
    if (norm(r.name).includes(needle))
      out.push({ type: "region", label: r.name, sub: "regija", href: `/${r.id}` });
  }
  const cities = new Set<string>();
  for (const v of VENDORS) {
    if (norm(v.city).includes(needle) && !cities.has(v.city)) {
      cities.add(v.city);
      out.push({ type: "city", label: v.city, sub: "grad", href: `/?q=${encodeURIComponent(v.city)}` });
    }
  }
  for (const v of VENDORS) {
    if (norm(v.name).includes(needle)) {
      const cat = CATEGORY_BY_SLUG[v.category];
      out.push({
        type: "vendor",
        label: v.name,
        sub: `${cat?.short ?? cat?.name ?? ""} · ${v.city}`,
        href: `/?q=${encodeURIComponent(v.name)}`,
      });
    }
  }
  return out.slice(0, limit);
}

export function regionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of REGIONS) counts[r.id] = 0;
  for (const v of VENDORS) counts[v.region] = (counts[v.region] ?? 0) + 1;
  return counts;
}
