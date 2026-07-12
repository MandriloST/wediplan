"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { VENDORS } from "@/lib/data";
import { useCompare, useFavorites } from "@/stores";

/** Sticky pill — appears only after the first vendor is checked (README). */
export default function CompareTray() {
  const { ids, dismissed, dismissTray } = useCompare();
  const pathname = usePathname();

  // localStorage može sadržavati ID-jeve iz starijih verzija kataloga — očisti ih
  useEffect(() => {
    const valid = new Set(VENDORS.map((v) => v.id));
    useCompare.getState().prune(valid);
    useFavorites.getState().prune(valid);
  }, []);
  if (ids.length === 0 || dismissed || pathname === "/usporedba") return null;

  const initials = (id: string) => {
    const v = VENDORS.find((x) => x.id === id);
    return v ? v.name.slice(0, 2).toUpperCase() : "?";
  };

  return (
    <div className="tray" role="status" aria-label="Odabrano za usporedbu">
      <div className="thumbs">
        {ids.map((id) => (
          <span key={id} className="t" title={VENDORS.find((v) => v.id === id)?.name}>
            {initials(id)}
          </span>
        ))}
      </div>
      <span className="count">
        {ids.length} {ids.length === 1 ? "odabran" : "odabrana"}
      </span>
      <Link href="/usporedba" className="btn btn-primary btn-sm">
        Usporedi ⇄
      </Link>
      <button className="close" aria-label="Sakrij" onClick={dismissTray}>
        ×
      </button>
    </div>
  );
}
