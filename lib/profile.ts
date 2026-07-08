import { CATEGORY_BY_SLUG, REGION_BY_ID, VENDORS } from "./data";
import type { ImportedReview, Vendor, VendorProfileData } from "./types";
import profilesJson from "@/data/profiles.json";

/** Iz Excel predloška (scripts/import-vendors.mjs): slug → { about, services, reviews } */
const PROFILES = profilesJson as Record<
  string,
  { about?: string; services?: string[]; reviews?: ImportedReview[] }
>;

export const VENDOR_BY_SLUG = Object.fromEntries(VENDORS.map((v) => [v.slug, v])) as Record<
  string,
  Vendor
>;

/* ------------------------------------------------------------------ */
/* "Što pružatelj kaže o sebi" — do CMS-a: ručni unosi + default tekst */
/* ------------------------------------------------------------------ */

const ABOUT_OVERRIDES: Record<string, string> = {
  "foto-studio-anic":
    "Vjenčanja fotografiramo od 2014. — reportažno, bez namještanja, s naglaskom na svjetlo i emociju. Radimo u cijeloj Dalmaciji, a paket uvijek uključuje dvoje fotografa i online galeriju u roku od 30 dana.",
  "villa-dalmacija":
    "Terasa uz more za do 220 gostiju, vlastita kuhinja i parking. Cijena po osobi uključuje meni od 5 slijedova, piće prva 4 sata i osnovnu dekoraciju stolova.",
  "dvorac-bezanec":
    "Barokni dvorac iz 17. stoljeća s perivojem za ceremonije na otvorenom. Kapacitet 180 gostiju, smještaj za mladence i najužu obitelj uključen u paket.",
  "tamburasi-zlatne-zice":
    "Peteročlani tamburaški sastav — od tradicijskih slavonskih do modernih obrada. Sviramo do zadnjeg gosta, ozvučenje je naše.",
  "atelier-foto-zg":
    "Foto + video tim iz Zagreba. Snimamo diskretno, u filmskom stilu; highlight film od 5 minuta isporučujemo unutar 6 tjedana.",
};

const ABOUT_BY_GROUP: Record<string, string> = {
  sala: "Prostor za svadbene proslave s vlastitom kuhinjom i osobljem. Cijena po osobi ovisi o odabranom meniju i trajanju — točnu ponudu šaljemo na temelju broja gostiju i termina.",
  catering: "Catering za vjenčanja s posluživanjem na lokaciji po izboru. Meni slažemo zajedno s mladencima nakon degustacije.",
  foto: "Profesionalno bilježimo dan vjenčanja od priprema do zadnjeg plesa. Paketi se razlikuju po broju sati i isporučenim materijalima.",
  glazba: "Glazbeni program prilagođavamo željama mladenaca — od ceremonije do kasnih sati. Repertoar i ozvučenje dogovaramo unaprijed.",
  ostalo: "Usluga za vjenčanja s višegodišnjim iskustvom. Točnu ponudu rado šaljemo na temelju termina i želja.",
};

const SERVICES_BY_GROUP: Record<string, string[]> = {
  sala: ["Meni po osobi", "Osoblje i posluživanje", "Osnovna dekoracija", "Parking za goste"],
  catering: ["Degustacija menija", "Posluživanje na lokaciji", "Najam posuđa", "Slatki stol"],
  foto: ["Cjelodnevno praćenje", "Online galerija", "Ekspresna objava (48 h)", "Ispis / album po dogovoru"],
  glazba: ["Vlastito ozvučenje", "Repertoar po želji", "Glazba za ceremoniju", "Sviranje do kraja proslave"],
  ostalo: ["Termin po dogovoru", "Prilagodba željama", "Dolazak na lokaciju"],
};

/* ------------------------------------------------------- */
/* Prenesene recenzije (feature #4) — mock za nekoliko      */
/* pružatelja; ostali kreću bez njih (realan scenarij).     */
/* ------------------------------------------------------- */

const IMPORTED_REVIEWS: Record<string, ImportedReview[]> = {
  "foto-studio-anic": [
    { author: "Marija i Ivan", rating: 5, text: "Fotografije su prekrasne, a njih dvoje se cijeli dan gotovo nisu ni primijetili. Galerija stigla ranije od dogovorenog.", source: "Google recenzije", year: 2025 },
    { author: "Petra K.", rating: 5, text: "Profesionalni, brzi i topli ljudi. Preporuka svima u Dalmaciji.", source: "Google recenzije", year: 2024 },
  ],
  "villa-dalmacija": [
    { author: "Ana i Marko", rating: 5, text: "Terasa uz more je spektakularna, hrana odlična, osoblje na razini. Gosti još pričaju o zalasku sunca.", source: "Google recenzije", year: 2025 },
    { author: "L. Perić", rating: 4, text: "Sve pohvale za organizaciju, jedino je parking bio pretijesan za veći broj auta.", source: "Facebook", year: 2024 },
  ],
  "dvorac-bezanec": [
    { author: "Ivana i Tomislav", rating: 5, text: "Vjenčanje iz bajke — ceremonija u perivoju, večera u dvorani s freskama. Vrijedno svakog eura.", source: "Google recenzije", year: 2024 },
  ],
  "atelier-foto-zg": [
    { author: "Dora i Filip", rating: 5, text: "Highlight film nas je rasplakao. Diskretni na dan vjenčanja, a materijali vrhunski.", source: "Google recenzije", year: 2025 },
  ],
  "tamburasi-zlatne-zice": [
    { author: "Svatovi iz Đakova", rating: 5, text: "Digli su cijelu salu na noge i svirali dok je zadnji gost stajao. Majstori.", source: "Facebook", year: 2024 },
  ],
};

export function getProfile(slug: string): VendorProfileData | null {
  const vendor = VENDOR_BY_SLUG[slug];
  if (!vendor) return null;
  const group = CATEGORY_BY_SLUG[vendor.category]?.group ?? "ostalo";
  const p = PROFILES[slug];
  return {
    vendor,
    about: p?.about ?? ABOUT_OVERRIDES[slug] ?? ABOUT_BY_GROUP[group],
    services: p?.services?.length ? p.services : SERVICES_BY_GROUP[group],
    importedReviews: p?.reviews ?? IMPORTED_REVIEWS[slug] ?? [],
  };
}

export function similarVendors(vendor: Vendor, limit = 3): Vendor[] {
  const same = VENDORS.filter((v) => v.id !== vendor.id && v.category === vendor.category);
  same.sort((a, b) => {
    const ar = a.region === vendor.region ? 0 : 1;
    const br = b.region === vendor.region ? 0 : 1;
    return ar - br || b.rating - a.rating;
  });
  return same.slice(0, limit);
}

export function breadcrumb(vendor: Vendor) {
  const region = REGION_BY_ID[vendor.region];
  const cat = CATEGORY_BY_SLUG[vendor.category];
  return [
    { label: "Istraži", href: "/" },
    { label: region.name, href: `/${region.id}` },
    { label: cat.name, href: `/${region.id}/${cat.slug}` },
  ];
}
