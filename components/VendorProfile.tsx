"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORY_BY_SLUG, GROUP_LABELS, REGION_BY_ID } from "@/lib/data";
import { breadcrumb, similarVendors } from "@/lib/profile";
import { euro, formatPrice, formatRating, isOnRequest } from "@/lib/format";
import { estimateCost, isOverBudget, vendorGroup } from "@/lib/budget";
import type { VendorProfileData } from "@/lib/types";
import { useBudget, useCompare, useFavorites } from "@/stores";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { vendorImages } from "@/lib/images";
import VendorCard from "./VendorCard";

export default function VendorProfile({ data }: { data: VendorProfileData }) {
  const { vendor, about, services, importedReviews } = data;
  const { ids, toggle } = useCompare();
  const favorites = useFavorites();
  const plan = useBudget((s) => s.plan);

  const cat = CATEGORY_BY_SLUG[vendor.category];
  const region = REGION_BY_ID[vendor.region];
  const over = isOverBudget(vendor, plan);
  const fav = favorites.ids.includes(vendor.id);
  const similar = similarVendors(vendor);
  const images = vendorImages(vendor);

  return (
    <main className="container page profile">
      <nav className="crumbs" aria-label="Navigacijska putanja">
        {breadcrumb(vendor).map((c) => (
          <span key={c.href}>
            <Link href={c.href}>{c.label}</Link> ›{" "}
          </span>
        ))}
        <span aria-current="page">{vendor.name}</span>
      </nav>

      <div className={`gallery g${images.length}`} aria-label="Fotografije">
        {images.map((im, i) => (
          <div key={im.src} className={`gimg${i === 0 ? " main" : ""}`}>
            <Image
              src={im.src}
              alt={im.isDefault ? `${vendor.name} — ilustracija` : vendor.name}
              fill
              priority={i === 0}
              sizes="(max-width: 900px) 100vw, 60vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <div className="profile-main">
          <header className="profile-head">
            <div>
              <h1>{vendor.name}</h1>
              <p className="sub" style={{ margin: "2px 0 0" }}>
                {cat.name} · {vendor.city}, {region.name}
              </p>
              <div className="badges" style={{ marginTop: 8 }}>
                {vendor.verified && <span className="badge verified">✓ provjereno</span>}
                {vendor.liveCalendar ? (
                  <span className="badge live">✓ kalendar uživo</span>
                ) : (
                  <span className="badge">na upit</span>
                )}
                {vendor.styleTags.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="head-price">
              <div className={isOnRequest(vendor.price) ? "price-upit big" : "price big"}>{formatPrice(vendor.price)}</div>
              {vendor.reviewCount > 0 ? (
                <div className="rating">
                  <span className="star">★</span> {formatRating(vendor.rating)}{" "}
                  <span className="muted">
                    ({vendor.reviewCount}){vendor.ratingSource ? ` · ${vendor.ratingSource}` : ""}
                  </span>
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 13.5 }}>novo na Wediplanu</div>
              )}
            </div>
          </header>

          {plan && !isOnRequest(vendor.price) && (
            <p className={`fit ${over ? "bad" : "good"}`}>
              {over ? (
                <>
                  Izvan vašeg plana — {GROUP_LABELS[vendorGroup(vendor)]} ≤ {euro(plan.caps[vendorGroup(vendor)])}, a
                  procjena za {plan.guests} gostiju je {euro(estimateCost(vendor, plan.guests))}.
                </>
              ) : (
                <>
                  ✓ Stane u vaš plan ({GROUP_LABELS[vendorGroup(vendor)]} ≤ {euro(plan.caps[vendorGroup(vendor)])} za{" "}
                  {plan.guests} gostiju).
                </>
              )}
            </p>
          )}

          <div className="profile-actions">
            <label className="compare-box big">
              <input type="checkbox" checked={ids.includes(vendor.id)} onChange={() => toggle(vendor.id)} />
              Dodaj u usporedbu
            </label>
            <button
              className={`btn btn-sm${fav ? " fav-on" : ""}`}
              aria-pressed={fav}
              onClick={() => favorites.toggle(vendor.id)}
            >
              {fav ? "♥ Spremljeno" : "♡ Spremi"}
            </button>
            <button className="btn btn-sm" disabled title="Uskoro">
              ✉ Kontakt (uskoro)
            </button>
          </div>

          <section>
            <h2>Što pružatelj kaže o sebi</h2>
            <p>{about}</p>
            <ul className="services">
              {services.map((s) => (
                <li key={s}>✓ {s}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Recenzije</h2>
            <p className="rev-note">
              Dvije vrste recenzija: <strong>prenesene</strong> (prikupio i provjerio Wediplan iz vanjskih izvora
              prije lansiranja) i <strong>Wediplan recenzije</strong> stvarnih korisnika platforme.
            </p>

            {importedReviews.length > 0 ? (
              <div className="reviews">
                {importedReviews.map((r, i) => (
                  <article key={i} className="review">
                    <div className="rev-head">
                      <strong>{r.author}</strong>
                      <span className="star">{"★".repeat(Math.round(r.rating))}</span>
                    </div>
                    <p>{r.text}</p>
                    <p className="rev-src">prenesena recenzija · {r.source}, {r.year}.</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">Ovaj pružatelj još nema prenesenih recenzija.</p>
            )}

            <div className="empty" style={{ marginTop: 14 }}>
              <h3>Wediplan recenzije kreću s prvim korisnicima</h3>
              <p>Recenziju mogu ostaviti registrirani korisnici nakon lansiranja.</p>
              <div className="actions">
                <button className="btn btn-sm" disabled title="Uskoro">
                  Napiši recenziju (prijava uskoro)
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside className="profile-aside">
          <AvailabilityCalendar vendor={vendor} />
          {similar.length > 0 && (
            <div className="similar">
              <h3>Slično u kategoriji {cat.short ?? cat.name}</h3>
              {similar.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
