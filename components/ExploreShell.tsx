"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "./SearchBar";
import VendorCard from "./VendorCard";
import { CATEGORY_BY_SLUG, FEATURED_CATEGORY_SLUGS, REGIONS } from "@/lib/data";
import type { Paged, RegionId, RegionWithCount, Vendor } from "@/lib/types";
import { useBudget } from "@/stores";

const CroatiaMap = dynamic(() => import("./CroatiaMap"), {
  ssr: false,
  loading: () => <div className="skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />,
});

export interface ExploreFilters {
  region?: RegionId;
  category?: string;
  q?: string;
}

function pathFor(f: ExploreFilters): string {
  const segs = [f.region, f.category].filter(Boolean);
  const path = "/" + segs.join("/");
  return f.q ? `${path}?q=${encodeURIComponent(f.q)}` : path;
}

export default function ExploreShell({ filters }: { filters: ExploreFilters }) {
  const router = useRouter();
  const openDrawer = useBudget((s) => s.openDrawer);

  const { data: regions } = useQuery<RegionWithCount[]>({
    queryKey: ["regions"],
    queryFn: () => fetch("/api/regions").then((r) => r.json()),
  });

  const vendorParams = new URLSearchParams({ pageSize: "50" });
  if (filters.region) vendorParams.set("region", filters.region);
  if (filters.category) vendorParams.set("category", filters.category);
  if (filters.q) vendorParams.set("q", filters.q);

  const { data: result, isLoading } = useQuery<Paged<Vendor>>({
    queryKey: ["vendors", vendorParams.toString()],
    queryFn: () => fetch(`/api/vendors?${vendorParams}`).then((r) => r.json()),
  });

  const go = (next: ExploreFilters) => router.push(pathFor(next));
  const cat = filters.category ? CATEGORY_BY_SLUG[filters.category] : undefined;
  const regionName = filters.region ? REGIONS.find((r) => r.id === filters.region)?.name : undefined;

  const title =
    [cat?.name ?? (filters.q ? `„${filters.q}”` : "Svi pružatelji"), regionName]
      .filter(Boolean)
      .join(" · ");

  return (
    <main>
      <div className="container">
        <section className="hero">
          <h1>
            Pronađite <em>sve</em> za vjenčanje u Hrvatskoj
          </h1>
          <SearchBar initialQ={filters.q} initialRegion={filters.region} />
        </section>

        <section className="explore">
          <aside className="sidebar">
            <p className="lead">…ili odaberite regiju:</p>
            {(regions ?? REGIONS.map((r) => ({ ...r, count: 0 }))).map((r) => (
              <button
                key={r.id}
                className={`region-item${filters.region === r.id ? " active" : ""}`}
                onClick={() =>
                  go({ ...filters, region: filters.region === r.id ? undefined : r.id })
                }
              >
                <span>{r.name}</span>
                <span className="count">{r.count || ""}</span>
              </button>
            ))}
            <div className="chips">
              {FEATURED_CATEGORY_SLUGS.map((slug) => {
                const c = CATEGORY_BY_SLUG[slug];
                const active = filters.category === slug;
                return (
                  <button
                    key={slug}
                    className={`chip${active ? " active" : ""}`}
                    onClick={() => go({ ...filters, category: active ? undefined : slug })}
                  >
                    {c.short ?? c.name}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="map-wrap">
            <CroatiaMap
              vendors={result?.items ?? []}
              selectedRegion={filters.region}
              onRegionClick={(id) => go({ ...filters, region: id })}
            />
            <span className="map-hint">upišite u tražilicu ili kliknite na kartu — isti rezultati</span>
            <button className="btn map-fab" onClick={openDrawer}>
              🧮 Budžet
            </button>
          </div>
        </section>

        <section aria-live="polite">
          <div className="results-head">
            <h2>{title}</h2>
            <span className="meta">
              {result ? `${result.total} rezultata · cijena uvijek vidljiva` : ""}
            </span>
          </div>
          <div className="results-grid">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}
            {!isLoading && result?.items.map((v) => <VendorCard key={v.id} vendor={v} />)}
            {!isLoading && result?.items.length === 0 && (
              <div className="empty">
                <h3>Nema pružatelja za ovaj odabir</h3>
                <p>Pokušajte proširiti regiju ili ukloniti filtar.</p>
                <div className="actions">
                  {filters.region && (
                    <button className="btn btn-sm" onClick={() => go({ ...filters, region: undefined })}>
                      Cijela Hrvatska
                    </button>
                  )}
                  {filters.category && (
                    <button className="btn btn-sm" onClick={() => go({ ...filters, category: undefined })}>
                      Sve kategorije
                    </button>
                  )}
                  {filters.q && (
                    <Link className="btn btn-sm" href="/">
                      Očisti pretragu
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
