export type RegionId = "istra" | "kvarner" | "dalmacija" | "zagreb" | "slavonija";

/** Budget groups drive the calculator distribution and per-category caps. */
export type BudgetGroup = "sala" | "catering" | "foto" | "glazba" | "ostalo";

export interface Region {
  id: RegionId;
  name: string;
  /** [lng, lat] map focus point */
  center: [number, number];
  /** [[west, south], [east, north]] for map fitBounds */
  bounds: [[number, number], [number, number]];
}

export interface Category {
  slug: string;
  name: string;
  short?: string; // label for chips when the full name is long
  group: BudgetGroup;
}

export type PriceModel =
  | { kind: "from"; from: number } // "od 850 €"
  | { kind: "perPerson"; from: number; to: number }; // "55–80 €/os."

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  category: string; // Category.slug
  region: RegionId;
  city: string;
  lng: number;
  lat: number;
  price: PriceModel;
  rating: number;
  reviewCount: number;
  /** izvor prenesene ocjene (npr. "Google recenzije") — obavezno uz prenesenu ocjenu */
  ratingSource?: string;
  /** platform verification — "✓ provjereno" */
  verified: boolean;
  /** vendor keeps a live availability calendar — "✓ kalendar uživo" */
  liveCalendar: boolean;
  styleTags: string[];
  photo?: string;
}

export interface RegionWithCount extends Region {
  count: number;
}

export interface BudgetDistribution {
  region: RegionId | "hr";
  /** shares per group, sums to 1 */
  shares: Record<BudgetGroup, number>;
}

export interface BudgetPlan {
  guests: number;
  region: RegionId;
  total: number;
  /** derived caps in €, per budget group */
  caps: Record<BudgetGroup, number>;
}

export interface VendorQuery {
  q?: string;
  region?: RegionId;
  category?: string;
  date?: string; // ISO yyyy-mm-dd, optional
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Feature #4 — dvojaka recenzija. Prenesene recenzije skuplja Wediplan od
 *  pružatelja prije lansiranja (screenshotovi/izvori), uz vidljivu oznaku izvora. */
export interface ImportedReview {
  author: string;
  rating: number;
  text: string;
  source: string; // npr. "Google recenzije"
  year: number;
}

export interface VendorProfileData {
  vendor: Vendor;
  about: string;
  services: string[];
  importedReviews: ImportedReview[];
}
