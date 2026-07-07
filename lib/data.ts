import type { Category, Region, Vendor, BudgetDistribution, PriceModel, RegionId } from "./types";

/* ------------------------------------------------------------------ */
/* Regions (5 marketing regions — polygons in /public/data/*.geojson) */
/* ------------------------------------------------------------------ */

export const REGIONS: Region[] = [
  { id: "istra", name: "Istra", center: [13.9, 45.15], bounds: [[13.4, 44.75], [14.4, 45.55]] },
  { id: "kvarner", name: "Kvarner", center: [14.7, 44.9], bounds: [[13.9, 44.2], [15.9, 45.7]] },
  { id: "dalmacija", name: "Dalmacija", center: [16.4, 43.6], bounds: [[14.5, 42.35], [18.6, 44.6]] },
  { id: "zagreb", name: "Zagreb i okolica", center: [16.0, 45.8], bounds: [[14.8, 44.9], [17.4, 46.6]] },
  { id: "slavonija", name: "Slavonija", center: [18.0, 45.4], bounds: [[16.8, 44.8], [19.5, 46.0]] },
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<RegionId, Region>;

/* ------------------------------------------------------------- */
/* Categories — full owner list (29). Names are editable content */
/* and will live in the .NET backend / CMS; slugs are stable.     */
/* ------------------------------------------------------------- */

export const CATEGORIES: Category[] = [
  { slug: "restorani-i-sale", name: "Restorani i sale", short: "Dvorane", group: "sala" },
  { slug: "konobe-i-prostori", name: "Konobe i prostori za proslavu", short: "Konobe", group: "sala" },
  { slug: "najam-kuce", name: "Najam kuće za proslavu", short: "Kuće", group: "sala" },
  { slug: "najam-satora", name: "Najam šatora i opreme", short: "Šatori", group: "sala" },
  { slug: "catering", name: "Catering", group: "catering" },
  { slug: "torte-i-kolaci", name: "Torte i kolači", short: "Torte", group: "catering" },
  { slug: "foto-i-video", name: "Foto i Video", short: "Fotografi", group: "foto" },
  { slug: "foto-kabine", name: "Audio, foto kabine i selfie mirror", short: "Foto kabine", group: "foto" },
  { slug: "glazba-bendovi", name: "Glazba — bendovi", short: "Bendovi", group: "glazba" },
  { slug: "dj", name: "DJ", group: "glazba" },
  { slug: "glazba-za-crkvu", name: "Glazba za crkvu", short: "Crkvena glazba", group: "glazba" },
  { slug: "harmonikasi", name: "Harmonikaši", group: "glazba" },
  { slug: "cvijece-i-dekoracije", name: "Cvijeće, dekoracije i baloni", short: "Cvijeće", group: "ostalo" },
  { slug: "vjencanice", name: "Vjenčanice i dodaci", short: "Vjenčanice", group: "ostalo" },
  { slug: "muska-odijela", name: "Muška odijela i dodaci", short: "Odijela", group: "ostalo" },
  { slug: "nakit-i-prstenje", name: "Nakit i prstenje", short: "Nakit", group: "ostalo" },
  { slug: "frizerski-saloni", name: "Frizerski saloni", short: "Frizeri", group: "ostalo" },
  { slug: "sminka-nokti", name: "Šminka, nokti i trepavice", short: "Šminka", group: "ostalo" },
  { slug: "auto-za-mladence", name: "Auto za mladence (rent a car)", short: "Auto", group: "ostalo" },
  { slug: "najam-limuzina", name: "Najam auta, limuzina i oldtimera", short: "Oldtimeri", group: "ostalo" },
  { slug: "prijevoz-i-transferi", name: "Prijevoz i transferi", short: "Transferi", group: "ostalo" },
  { slug: "organizatori", name: "Organizatori vjenčanja", short: "Organizatori", group: "ostalo" },
  { slug: "pozivnice", name: "Pozivnice, zahvalnice i popis gostiju", short: "Pozivnice", group: "ostalo" },
  { slug: "rasvjeta-i-razglas", name: "Rasvjeta, razglas i efekti", short: "Rasvjeta", group: "ostalo" },
  { slug: "cuvanje-djece", name: "Čuvanje i animacija djece", short: "Animacija djece", group: "ostalo" },
  { slug: "skole-plesa", name: "Škole plesa", short: "Ples", group: "ostalo" },
  { slug: "bracna-putovanja", name: "Bračna putovanja", short: "Putovanja", group: "ostalo" },
  { slug: "dodaci-za-djevojacke", name: "Dodaci za djevojačke i momačke", short: "Djevojačke", group: "ostalo" },
  { slug: "reveri-i-dodaci", name: "Reveri, narukvice, podvezice i dodaci", short: "Reveri", group: "ostalo" },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

/** Chips shown in the explore sidebar (wireframe 2a) — the rest live under "Sve". */
export const FEATURED_CATEGORY_SLUGS = [
  "restorani-i-sale",
  "foto-i-video",
  "glazba-bendovi",
  "dj",
  "catering",
  "cvijece-i-dekoracije",
];

/* --------------------------------------------------------- */
/* Vendors — mock seed. Real data comes from vendor onboard. */
/* --------------------------------------------------------- */

const from = (n: number): PriceModel => ({ kind: "from", from: n });
const pp = (a: number, b: number): PriceModel => ({ kind: "perPerson", from: a, to: b });

let seq = 0;
function v(
  name: string,
  category: string,
  region: RegionId,
  city: string,
  lng: number,
  lat: number,
  price: PriceModel,
  rating: number,
  reviewCount: number,
  opts: Partial<Pick<Vendor, "verified" | "liveCalendar" | "styleTags">> = {}
): Vendor {
  seq += 1;
  return {
    id: `v${seq}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, ""),
    name,
    category,
    region,
    city,
    lng,
    lat,
    price,
    rating,
    reviewCount,
    verified: opts.verified ?? false,
    liveCalendar: opts.liveCalendar ?? false,
    styleTags: opts.styleTags ?? [],
  };
}

export const VENDORS: Vendor[] = [
  // ---- Dalmacija ----
  v("Foto studio Anić", "foto-i-video", "dalmacija", "Split", 16.4402, 43.5081, from(850), 4.8, 31, { verified: true, styleTags: ["boho", "film"] }),
  v("Lumen weddings", "foto-i-video", "dalmacija", "Šibenik", 15.8952, 43.7272, from(1100), 4.6, 12, { liveCalendar: true, styleTags: ["reportažni"] }),
  v("Studio Mare", "foto-i-video", "dalmacija", "Dubrovnik", 18.0944, 42.6507, from(2400), 4.9, 44, { verified: true, styleTags: ["editorial", "luksuzno"] }),
  v("Villa Dalmacija", "restorani-i-sale", "dalmacija", "Split", 16.4102, 43.5147, pp(65, 95), 4.8, 57, { verified: true, liveCalendar: true, styleTags: ["uz more", "terasa"] }),
  v("Dvorana Perla", "restorani-i-sale", "dalmacija", "Zadar", 15.2314, 44.1194, pp(55, 80), 4.7, 23, { verified: true, styleTags: ["moderna", "klimatizirano"] }),
  v("Konoba Stari mlin", "konobe-i-prostori", "dalmacija", "Trogir", 16.2515, 43.5165, pp(45, 60), 4.6, 18, { styleTags: ["rustikalno"] }),
  v("Band Adriatic", "glazba-bendovi", "dalmacija", "Split", 16.45, 43.51, from(1500), 4.7, 26, { verified: true, styleTags: ["pop", "dalmatinske"] }),
  v("DJ Val", "dj", "dalmacija", "Makarska", 17.0178, 43.2969, from(600), 4.5, 14, { liveCalendar: true }),
  v("Klapa Kamen", "glazba-za-crkvu", "dalmacija", "Omiš", 16.6889, 43.4447, from(350), 4.9, 21, { verified: true }),
  v("Catering Dalmata", "catering", "dalmacija", "Split", 16.43, 43.52, pp(38, 62), 4.6, 33, { verified: true }),
  v("Torte Lucija", "torte-i-kolaci", "dalmacija", "Zadar", 15.24, 44.11, from(180), 4.8, 40, { verified: true }),
  v("Cvjećarnica Oleander", "cvijece-i-dekoracije", "dalmacija", "Split", 16.44, 43.515, from(450), 4.7, 15),
  v("Oldtimer Adria", "najam-limuzina", "dalmacija", "Split", 16.42, 43.5, from(280), 4.6, 9, { styleTags: ["VW buba", "kabriolet"] }),
  v("Vila Lavanda", "najam-kuce", "dalmacija", "Hvar", 16.4429, 43.1729, from(3200), 4.9, 11, { verified: true, styleTags: ["s bazenom"] }),
  v("Šator centar Zadar", "najam-satora", "dalmacija", "Zadar", 15.22, 44.12, from(1400), 4.4, 6),
  v("Makeup by Petra", "sminka-nokti", "dalmacija", "Split", 16.441, 43.509, from(120), 4.9, 52, { liveCalendar: true }),
  v("Wedding planner Ana", "organizatori", "dalmacija", "Dubrovnik", 18.09, 42.65, from(1900), 4.8, 17, { verified: true }),
  v("Selfie mirror Dalmacija", "foto-kabine", "dalmacija", "Split", 16.435, 43.512, from(390), 4.7, 22),

  // ---- Istra ----
  v("Studio Rovinj", "foto-i-video", "istra", "Rovinj", 13.6393, 45.0812, from(1300), 4.8, 29, { verified: true, liveCalendar: true, styleTags: ["editorial"] }),
  v("Kaštel Momjan", "konobe-i-prostori", "istra", "Momjan", 13.5539, 45.4083, pp(70, 110), 4.9, 13, { verified: true, styleTags: ["kaštel", "vinograd"] }),
  v("Restoran Adriatica", "restorani-i-sale", "istra", "Pula", 13.8496, 44.8666, pp(50, 78), 4.6, 35, { liveCalendar: true }),
  v("Band Terra Magica", "glazba-bendovi", "istra", "Pazin", 13.9366, 45.2403, from(1200), 4.5, 10),
  v("Istria Catering", "catering", "istra", "Poreč", 13.5932, 45.2269, pp(42, 70), 4.7, 19, { verified: true }),
  v("Cvijeće Mia", "cvijece-i-dekoracije", "istra", "Pula", 13.85, 44.87, from(380), 4.6, 12),
  v("DJ Adrian", "dj", "istra", "Rovinj", 13.64, 45.08, from(550), 4.6, 16, { liveCalendar: true }),
  v("Vila Histria", "najam-kuce", "istra", "Bale", 13.7847, 45.0411, from(2800), 4.8, 8, { verified: true }),

  // ---- Kvarner ----
  v("Foto Kvarner", "foto-i-video", "kvarner", "Rijeka", 14.4422, 45.3271, from(900), 4.5, 20, { verified: true }),
  v("Villa Opatija", "restorani-i-sale", "kvarner", "Opatija", 14.3053, 45.3376, pp(60, 92), 4.8, 41, { verified: true, liveCalendar: true, styleTags: ["belle époque"] }),
  v("Konoba Punat", "konobe-i-prostori", "kvarner", "Krk", 14.6296, 45.0243, pp(40, 58), 4.6, 14),
  v("Band Bura", "glazba-bendovi", "kvarner", "Rijeka", 14.44, 45.33, from(1100), 4.4, 9),
  v("Torte Nona", "torte-i-kolaci", "kvarner", "Opatija", 14.31, 45.34, from(160), 4.7, 25, { verified: true }),
  v("DJ Val Kvarnera", "dj", "kvarner", "Crikvenica", 14.6922, 45.1747, from(500), 4.3, 7),
  v("Frizerski salon Ela", "frizerski-saloni", "kvarner", "Rijeka", 14.443, 45.328, from(90), 4.8, 30),

  // ---- Zagreb i okolica ----
  v("Atelier Foto ZG", "foto-i-video", "zagreb", "Zagreb", 15.9819, 45.815, from(950), 4.7, 48, { verified: true, liveCalendar: true, styleTags: ["reportažni", "film"] }),
  v("Studio Sjever", "foto-i-video", "zagreb", "Varaždin", 16.3378, 46.3057, from(700), 4.6, 15, { verified: true }),
  v("Dvorac Bežanec", "restorani-i-sale", "zagreb", "Pregrada", 15.7503, 46.1631, pp(75, 120), 4.9, 38, { verified: true, styleTags: ["dvorac"] }),
  v("Sala Panorama", "restorani-i-sale", "zagreb", "Zagreb", 15.97, 45.8, pp(48, 72), 4.5, 52, { liveCalendar: true }),
  v("Zagreb Events Catering", "catering", "zagreb", "Zagreb", 15.99, 45.81, pp(35, 65), 4.6, 27, { verified: true }),
  v("Band Sjeverni vjetar", "glazba-bendovi", "zagreb", "Zagreb", 15.98, 45.82, from(1300), 4.7, 34, { verified: true }),
  v("DJ Mint", "dj", "zagreb", "Zagreb", 15.985, 45.812, from(650), 4.8, 41, { liveCalendar: true }),
  v("Harmonika Štef", "harmonikasi", "zagreb", "Samobor", 15.7181, 45.8011, from(300), 4.9, 19, { verified: true }),
  v("Vjenčanice Iva", "vjencanice", "zagreb", "Zagreb", 15.976, 45.813, from(750), 4.8, 63, { verified: true }),
  v("Odijela Gospodin", "muska-odijela", "zagreb", "Zagreb", 15.978, 45.814, from(420), 4.7, 28),
  v("Zlatarna Aurum", "nakit-i-prstenje", "zagreb", "Zagreb", 15.977, 45.8135, from(350), 4.9, 71, { verified: true }),
  v("Pozivnice Papir & Tinta", "pozivnice", "zagreb", "Zagreb", 15.98, 45.816, from(2), 4.8, 36),
  v("Rasvjeta Lux", "rasvjeta-i-razglas", "zagreb", "Zagreb", 15.99, 45.8, from(480), 4.6, 13),
  v("Plesna škola Korak", "skole-plesa", "zagreb", "Zagreb", 15.975, 45.808, from(140), 4.9, 45, { verified: true }),
  v("Animacija Balonko", "cuvanje-djece", "zagreb", "Zagreb", 15.982, 45.81, from(220), 4.7, 18),
  v("Med & Lavanda putovanja", "bracna-putovanja", "zagreb", "Zagreb", 15.979, 45.815, from(1600), 4.8, 22, { verified: true }),

  // ---- Slavonija ----
  v("Foto Panonija", "foto-i-video", "slavonija", "Osijek", 18.6955, 45.5511, from(600), 4.6, 17, { verified: true }),
  v("Salaš Zlatno klasje", "restorani-i-sale", "slavonija", "Osijek", 18.68, 45.55, pp(35, 55), 4.7, 24, { verified: true, styleTags: ["salaš", "tradicionalno"] }),
  v("Sala Kristal", "restorani-i-sale", "slavonija", "Slavonski Brod", 18.0158, 45.16, pp(30, 48), 4.4, 16),
  v("Tamburaši Zlatne žice", "glazba-bendovi", "slavonija", "Đakovo", 18.4106, 45.3097, from(900), 4.9, 39, { verified: true, styleTags: ["tamburaši"] }),
  v("DJ Ravnica", "dj", "slavonija", "Vinkovci", 18.8047, 45.2881, from(400), 4.5, 8),
  v("Torte Slavonka", "torte-i-kolaci", "slavonija", "Osijek", 18.69, 45.552, from(120), 4.8, 29, { verified: true }),
  v("Fijaker Baranja", "najam-limuzina", "slavonija", "Osijek", 18.7, 45.55, from(200), 4.7, 6, { styleTags: ["fijaker"] }),
];

/* --------------------------------------------------- */
/* Budget distribution defaults (regional, from API).  */
/* --------------------------------------------------- */

export const BUDGET_DEFAULTS: BudgetDistribution[] = [
  { region: "hr", shares: { sala: 0.4, catering: 0.25, foto: 0.15, glazba: 0.1, ostalo: 0.1 } },
  { region: "dalmacija", shares: { sala: 0.42, catering: 0.24, foto: 0.15, glazba: 0.09, ostalo: 0.1 } },
  { region: "istra", shares: { sala: 0.43, catering: 0.24, foto: 0.14, glazba: 0.09, ostalo: 0.1 } },
  { region: "kvarner", shares: { sala: 0.41, catering: 0.25, foto: 0.14, glazba: 0.1, ostalo: 0.1 } },
  { region: "zagreb", shares: { sala: 0.38, catering: 0.26, foto: 0.16, glazba: 0.1, ostalo: 0.1 } },
  { region: "slavonija", shares: { sala: 0.35, catering: 0.27, foto: 0.14, glazba: 0.14, ostalo: 0.1 } },
];

export const GROUP_LABELS: Record<string, string> = {
  sala: "Sala",
  catering: "Catering",
  foto: "Foto",
  glazba: "Glazba",
  ostalo: "Ostalo",
};
