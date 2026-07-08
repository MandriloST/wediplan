"use client";

import Link from "next/link";
import { CATEGORY_BY_SLUG } from "@/lib/data";
import { formatPrice, formatRating, euro } from "@/lib/format";
import { estimateCost, isOverBudget, vendorGroup } from "@/lib/budget";
import type { Vendor } from "@/lib/types";
import { useBudget, useCompare, useFavorites } from "@/stores";
import { GROUP_LABELS } from "@/lib/data";

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const { ids, toggle } = useCompare();
  const favorites = useFavorites();
  const plan = useBudget((s) => s.plan);
  const over = isOverBudget(vendor, plan);
  const cat = CATEGORY_BY_SLUG[vendor.category];
  const checked = ids.includes(vendor.id);
  const fav = favorites.ids.includes(vendor.id);

  return (
    <article className={`vcard${over ? " over" : ""}`}>
      <div className="ph thumb">foto</div>
      <div className="info">
        <div>
          <Link href={`/pruzatelj/${vendor.slug}`} className="name" style={{ color: "inherit" }}>
            {vendor.name}
          </Link>{" "}
          <span className="city">· {vendor.city}</span>
        </div>
        <div className="row2">
          <span className="price">{formatPrice(vendor.price)}</span>{" "}
          {vendor.reviewCount > 0 ? (
            <span className="rating">
              · <span className="star">★</span> {formatRating(vendor.rating)}
              <span className="city"> ({vendor.reviewCount})</span>
            </span>
          ) : (
            <span className="city">· novo na Wediplanu</span>
          )}
        </div>
        <div className="badges">
          {vendor.verified && <span className="badge verified">✓ provjereno</span>}
          {vendor.liveCalendar ? (
            <span className="badge live">✓ kalendar uživo</span>
          ) : (
            <span className="badge">na upit</span>
          )}
          {over && plan && (
            <span className="badge over-cap">
              izvan budžeta — {GROUP_LABELS[vendorGroup(vendor)]} ≤ {euro(plan.caps[vendorGroup(vendor)])}
            </span>
          )}
          {!over && cat?.short && <span className="badge">{cat.short}</span>}
        </div>
        <label className="compare-box">
          <input type="checkbox" checked={checked} onChange={() => toggle(vendor.id)} />
          usporedi
        </label>
      </div>
      <button
        className={`fav${fav ? " on" : ""}`}
        aria-label={fav ? "Ukloni iz favorita" : "Dodaj u favorite"}
        aria-pressed={fav}
        onClick={() => favorites.toggle(vendor.id)}
      >
        {fav ? "♥" : "♡"}
      </button>
    </article>
  );
}
