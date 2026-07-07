"use client";

import Link from "next/link";
import { CATEGORY_BY_SLUG, VENDORS } from "@/lib/data";
import { formatPrice, formatRating } from "@/lib/format";
import { useCompare, useWeddingDate } from "@/stores";

/** Mock availability until the live calendar (Coming soon) ships:
 *  deterministic per vendor+date so the UI is stable. */
function availability(vendorId: string, liveCalendar: boolean, date: string | null) {
  if (!liveCalendar) return { label: "na upit — kontaktirajte pružatelja", free: false };
  if (!date) return { label: "✓ kalendar uživo — odaberite datum", free: false };
  let h = 0;
  for (const ch of vendorId + date) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h % 3 === 0
    ? { label: "zauzet na taj datum", free: false }
    : { label: "✓ slobodan", free: true };
}

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { date, setDate } = useWeddingDate();
  const vendors = ids.map((id) => VENDORS.find((v) => v.id === id)).filter(Boolean) as typeof VENDORS;

  return (
    <main className="container page">
      <h1>Usporedba ⇄</h1>

      {vendors.length < 2 ? (
        <div className="empty">
          <h3>{vendors.length === 0 ? "Još ništa za usporedbu" : "Dodajte barem još jednog"}</h3>
          <p>Označite „usporedi” na 2–4 pružatelja i vratite se ovdje.</p>
          <div className="actions">
            <Link href="/" className="btn btn-primary btn-sm">
              Istraži pružatelje
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="sub">
            Datum vjenčanja:{" "}
            <input
              type="date"
              value={date ?? ""}
              onChange={(e) => setDate(e.target.value || null)}
              aria-label="Datum vjenčanja"
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                padding: "6px 10px",
                minHeight: 40,
              }}
            />
          </p>
          <div className="compare-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only" />
                  </th>
                  {vendors.map((v) => (
                    <th key={v.id} scope="col" className="col-head">
                      <div className="ph">foto</div>
                      {v.name}
                      <div style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}>
                        {v.city}
                      </div>
                      <button className="remove" onClick={() => remove(v.id)}>
                        ukloni ×
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="price-row">
                  <td>Cijena</td>
                  {vendors.map((v) => (
                    <td key={v.id}>
                      <span className="price">{formatPrice(v.price)}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Recenzije</td>
                  {vendors.map((v) => (
                    <td key={v.id}>
                      ★ {formatRating(v.rating)} · {v.reviewCount}
                      {v.verified && (
                        <div>
                          <span className="badge verified">✓ provjereno</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>{date ? new Date(date).toLocaleDateString("hr-HR") : "Dostupnost"}</td>
                  {vendors.map((v) => {
                    const a = availability(v.id, v.liveCalendar, date);
                    return (
                      <td key={v.id} className={a.free ? "free" : ""}>
                        {a.label}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Stil</td>
                  {vendors.map((v) => (
                    <td key={v.id}>
                      {v.styleTags.length ? v.styleTags.join(" · ") : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Kategorija</td>
                  {vendors.map((v) => (
                    <td key={v.id}>{CATEGORY_BY_SLUG[v.category]?.name}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 14 }}>
            <button className="btn btn-ghost btn-sm" onClick={clear}>
              Isprazni usporedbu
            </button>
          </p>
        </>
      )}
    </main>
  );
}
