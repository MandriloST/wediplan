"use client";

import Link from "next/link";
import { GROUP_LABELS, REGIONS, VENDORS } from "@/lib/data";
import { euro } from "@/lib/format";
import VendorCard from "./VendorCard";
import { useBudget, useFavorites } from "@/stores";

export default function ProfileShell() {
  const favorites = useFavorites((s) => s.ids);
  const plan = useBudget((s) => s.plan);
  const favVendors = VENDORS.filter((v) => favorites.includes(v.id));

  return (
    <main className="container page">
      <h1>♡ Profil</h1>
      <p className="sub">
        Favoriti i plan spremaju se na ovom uređaju (offline). Registracijom (e-mail ili Google) sinkroniziraju se
        s računom — uskoro.
      </p>
      <p>
        <button className="btn btn-sm" disabled title="Uskoro">
          Prijava e-mailom
        </button>{" "}
        <button className="btn btn-sm" disabled title="Uskoro">
          Prijava Googleom
        </button>
      </p>

      {plan && (
        <>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 550, fontSize: 20 }}>Vaš plan</h2>
          <p>
            {REGIONS.find((r) => r.id === plan.region)?.name} · {plan.guests} gostiju ·{" "}
            <span className="price">{euro(plan.total)}</span>
            {"  "}
            {Object.entries(plan.caps).map(([g, cap]) => (
              <span key={g} className="badge" style={{ marginLeft: 6 }}>
                {GROUP_LABELS[g]} ≤ {euro(cap)}
              </span>
            ))}
          </p>
        </>
      )}

      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 550, fontSize: 20 }}>Favoriti</h2>
      {favVendors.length === 0 ? (
        <div className="empty">
          <h3>Još nema favorita</h3>
          <p>Dodirnite ♡ na kartici pružatelja da ga spremite.</p>
          <div className="actions">
            <Link href="/" className="btn btn-primary btn-sm">
              Istraži pružatelje
            </Link>
          </div>
        </div>
      ) : (
        <div className="results-grid">
          {favVendors.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </main>
  );
}
