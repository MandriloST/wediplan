"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Paged, Vendor } from "@/lib/types";
import { useBudget } from "@/stores";

const CroatiaMap = dynamic(() => import("./CroatiaMap"), { ssr: false });

export default function MapPageShell() {
  const router = useRouter();
  const openDrawer = useBudget((s) => s.openDrawer);
  const { data } = useQuery<Paged<Vendor>>({
    queryKey: ["vendors", "all"],
    queryFn: () => fetch("/api/vendors?pageSize=200").then((r) => r.json()),
  });

  return (
    <main
      className="map-wrap"
      style={{
        position: "fixed",
        inset: "62px 0 calc(var(--tab-h) + env(safe-area-inset-bottom)) 0",
        borderRadius: 0,
        border: 0,
        minHeight: 0,
      }}
    >
      <CroatiaMap
        vendors={data?.items ?? []}
        onRegionClick={(id) => router.push(`/${id}`)}
      />
      <button className="btn map-fab" onClick={openDrawer}>
        🧮 Budžet
      </button>
    </main>
  );
}
