import { VENDORS } from "./data";
import type { Vendor } from "./types";

/**
 * Sve kategorije pružatelja (§4.3). Izvor istine za listinge, filtre, brojače i usporedbu.
 * Fallback na primarnu ako `categories` nije postavljen (unatrag kompatibilno).
 * NAPOMENA: sliku, breadcrumb, budžetsku grupu i "Slične" i dalje određuje `vendor.category`
 * (primarna) — ne koristiti ovu funkciju za to.
 */
export function vendorCategories(v: Vendor): string[] {
  return v.categories && v.categories.length ? v.categories : [v.category];
}

/** Dodatne (ne-primarne) kategorije — za diskretan prikaz "· također: …" na profilu. */
export function extraCategories(v: Vendor): string[] {
  return vendorCategories(v).filter((c) => c !== v.category);
}

/** Pojavljuje li se pružatelj u danoj kategoriji (bilo primarnoj ili dodatnoj). */
export function hasCategory(v: Vendor, slug: string): boolean {
  return vendorCategories(v).includes(slug);
}

/**
 * Brojači kategorija preko SVIH kategorija (§4.3): zbroj > broj pružatelja je očekivan.
 * Prima opcionalni skup pružatelja (npr. filtriran po regiji); default je cijeli katalog.
 */
export function categoryCounts(vendors: Vendor[] = VENDORS): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of vendors)
    for (const c of vendorCategories(v)) counts[c] = (counts[c] ?? 0) + 1;
  return counts;
}

/* ----------------------- Usporedba: kompatibilnost (§4.3) ----------------------- */

/**
 * Kategorije zajedničke SVIM trenutno odabranim pružateljima (presjek).
 * Prazan skup ⇒ ništa nije odabrano. Dok je presjek neprazan, svi u usporedbi
 * dijele ≥ 1 kategoriju pa su atributi usporedivi.
 */
export function compareCommonCategories(ids: string[]): Set<string> {
  let common: string[] | null = null;
  for (const id of ids) {
    const v = VENDORS.find((x) => x.id === id);
    if (!v) continue;
    const cats = vendorCategories(v);
    common = common === null ? cats : common.filter((c) => cats.includes(c));
  }
  return new Set(common ?? []);
}

/**
 * Smije li se pružatelj dodati u usporedbu? Prazna lista ⇒ da; već odabran ⇒ da
 * (dopusti odznačavanje); inače mora dijeliti ≥ 1 kategoriju sa zajedničkim skupom.
 */
export function canAddToCompare(candidate: Vendor, ids: string[]): boolean {
  if (ids.length === 0 || ids.includes(candidate.id)) return true;
  const common = compareCommonCategories(ids);
  return vendorCategories(candidate).some((c) => common.has(c));
}

/** Jedinstvena poruka za onemogućeni checkbox usporedbe. */
export const COMPARE_INCOMPATIBLE_HINT =
  "Za usporedbu odaberite pružatelje iste kategorije";
