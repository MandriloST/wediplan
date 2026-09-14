# STANJE.md — dnevnik rada i trenutno stanje projekta

> **Namjena:** model koji nastavlja rad čita OVO + `PLAN-ARHITEKTURA.md` + `API.md` prije koda.
> Ažurira se na kraju SVAKE radne sesije (kratko, činjenično). Novije sesije na vrhu.
> Uvijek provjeriti i stvarni `git log` — repo je izvor istine, ovo je sažetak.

## Trenutna faza: **Zadatak A — ZAVRŠEN** → sljedeće: Faza 1 (Zadatak B: backend + import 3178 pružatelja)

## Stalna pravila predaje (vrijede svaku sesiju)
- Rad isključivo na `develop` (ili `claude/*` → develop). `main` se ne dira.
- Na kraju svake sesije predati: **(1)** upute za pokretanje i testiranje, **(2)** kod kao
  **ZIP s punom strukturom foldera** (copy-paste preko root projekta radi ispravno) i/ili
  **patch/bundle** + točne git naredbe za merge.
- Build mora proći prije predaje: `npm run build` (frontend), `dotnet build` (backend).
- Ažurirati ovaj dokument (i PLAN-ARHITEKTURA.md ako se arhitektura mijenja) u istom commitu.

---

## Sesija 2026-09-14 — Zadatak A: M2M kategorije u UI-ju (frontend-only) ✅

**Implementirano (frontend, bez backenda):**
- `lib/categories.ts` (NOVO) — jedno mjesto istine za §4.3: `vendorCategories`,
  `extraCategories`, `hasCategory`, `categoryCounts` (broji po SVIM kategorijama),
  `compareCommonCategories` + `canAddToCompare` (usporediva samo ako dijele ≥1 kategoriju),
  `COMPARE_INCOMPATIBLE_HINT`.
- `lib/search.ts` — filter kategorije sada `hasCategory(v, cat)` (hvata primarnu I dodatne).
- `components/VendorCard.tsx` + `components/VendorProfile.tsx` — checkbox "usporedi"
  onemogućen (disabled + tooltip) kad pružatelj ne dijeli kategoriju s već odabranima.
- `components/VendorProfile.tsx` — uz primarnu diskretno "· također: <dodatne>".
- `app/globals.css` — stil `.compare-box.disabled` (opacity + not-allowed).
- Budžet, slika, breadcrumb, "Slične" NISU dirani — koriste primarnu (`vendor.category`),
  što je ispravno po §4.3.

**Verificirano:** `npm run build` prolazi; algoritam (filtriranje/brojači/blokada usporedbe)
testiran na sintetičkim višekategorijskim vendorima — svih 12 provjera prolazi.
Napomena: `data/vendors.json` u repou (37 mock vendora) NEMA višekategorijskih, pa efekt
nije vidljiv dok se ne uveze pravi Excel (v. dolje). Brojači kategorija: helper spreman,
ali chipovi u `ExploreShell` trenutno NE prikazuju brojeve (nije mijenjano — nema regresije).

**Uploadani Excel (`vendors-live.xlsx`, 3178 pružatelja) — provjeren, NIJE commitan:**
187 pružatelja ima `dodatne_kategorije`; 2298 telefon, 1751 email (GDPR — v. Zadatak B).
Odluka gdje ide (regeneracija JSON-a sada vs. .NET import u Fazi 1) čeka vlasnika (v. dolje).

## ODLUKE KOJE ČEKAM OD VLASNIKA (prije/na početku Faze 1 = Zadatak B)
1. **Kamo s novim Excelom (3178) i kada frontend prikazuje pravih 3178?**
   (a) odmah pokrenuti postojeći Node import → `data/vendors.json` (frontend odmah pun,
   ali bez geokodiranja gradova); (b) čekati .NET import u Fazi 1 (čišće, geokodiranje
   uključeno, ali frontend do Faze 2 ostaje na 37 mock vendora). **Preporuka: (b).**
2. **Import alat** (plan §4/§11 #4): .NET konzolna komanda (preporuka) vs. zadržati Node.
3. **Hosting/baza/email/slike** (plan §11 #1,#2,#3,#5) — potvrditi preporuke da Faza 1
   krene bez zastoja (za Fazu 1 nužni su samo #2 baza=Postgres+pg_trgm, ostalo može kasnije).
4. **GDPR kontakti pri importu:** telefon/email fizičkih osoba (obrti) — po §8/§9 NE
   prikazivati u listi i ne objavljivati mobitele bez claima. Potvrditi: uvoziti ih u
   bazu ali NE serIjalizirati u javni `/api/vendors` (učitavaju se na klik, faza kasnije)?
   **Preporuka: da — uvezi, ne izlaži javno.**



**Odlučeno i zapisano u PLAN-ARHITEKTURA.md:** §4.1 sjedište/pokrivanje, §4.2 oznake,
§4.3 više kategorija (M2M + primarna, limit 3), §M monetizacija (freemium granica,
Founding partner, karta trajno organska), §A analitika (first-party, agregatno, bez PII).

**Implementirano (frontend/Excel pipeline, commitovi `b0aa3d5`…`HEAD`):** coverage +
locationPrecision; IG/FB ikone; sustav oznaka v1 (`lib/badges.ts`, `/oznake`); status
"Skriveno"; `dodatne_kategorije` u templateu/importu (`categories` u JSON-u — UI ga još
NE čita, v. Zadatak A).

## ZADACI ZA SLJEDEĆU KODNU SESIJU (redoslijedom; A je frontend-only, B+C je Faza 1)

**Zadatak A — kategorije M2M u UI-ju (frontend, bez backenda).** Pravila su u §4.3 —
pročitati prije koda. (1) `lib/search.ts`: filter kategorije matcha `v.categories ??
[v.category]`. (2) Brojači kategorija (gdje god se računaju — provjeriti `lib/data.ts` i
komponente filtera) broje po svim kategorijama. (3) Usporedba: `stores` compare —
onemogućiti dodavanje pružatelja koji ne dijeli ≥ 1 kategoriju s već dodanima (disabled
+ tooltip "Za usporedbu odaberite pružatelje iste kategorije"). (4) Profil: uz primarnu
prikazati i dodatne kategorije (diskretno, npr. "· također: Video"). (5) Budžet i slika
NE diraju — koriste primarnu (`category`), već ispravno. DoD: build prolazi; vendor s 2
kategorije vidljiv u obje liste, brojači točni, usporedba blokira nekompatibilne.

**Zadatak B — Faza 1 backend (po §7 Faza 1, sad uključuje):** entiteti §3 + §4.3
(`vendor_categories`) + §A (`events`, `daily_stats`) + prazan `sponsorships`; EF
migracije; .NET import komanda koja replicira SVA pravila Node importa
(`scripts/import-vendors.mjs` je referentna implementacija: pokrivanje, precision,
venue-pravilo, Skriveno, social normalizacija, dodatne kategorije) + Nominatim
geokodiranje za `precision=city` (cache, 1 req/s); `POST /api/events` (batch ≤ 20,
whitelist iz §A, rate limit, 204, bez IP-a u bazi); noćni rollup u `daily_stats`.
DoD iz §7 Faza 1.

**Zadatak C — analytics klijent (uz Fazu 2 spajanje):** `lib/analytics.ts` po §A
(track + auto page_view + sendBeacon batch + DNT/GPC opt-out, fail-silent); ugraditi
evente iz kataloga §A u postojeće komponente (pretraga, karta, profil, usporedba,
budžet, favoriti, outbound klikovi na IG/FB/web ikone). DoD: eventi vidljivi u bazi
lokalno; nijedan event ne blokira ni ne ruši UI; DNT preskače slanje.

**Napomena za model koji nastavlja:** ne mijenjati slugove u `lib/data.ts`; UI copy
hr-HR; cjenovna transparentnost se ne krši (§10 plana); prije koda pročitati §4.3, §A,
§M i `git log`.

---

## Sesija 2026-09-01 — Faza 0: kostur backenda ✅

**Dodano:**
- `backend/` monorepo folder: `Wediplan.sln`, `Wediplan.Api/` (ASP.NET Core 8 Web API)
- `GET /api/vendors` — prazan odgovor u točnom obliku ugovora (`{items,total,page,pageSize}`),
  `pageSize` clampan na ≤ 50 (anti-scraping pravilo iz plana §8)
- `GET /health` — status API-ja + provjera konekcije na Postgres (za compose healthcheck/monitoring)
- `Contracts/Contracts.cs` — svi DTO-ovi ugovora (Vendor, Price, Region, Suggest, BudgetDefaults,
  VendorProfile, ImportedReview) spremni za Fazu 1; JSON: camelCase + izostavljanje null polja
  (identično Next.js mocku)
- `Data/AppDbContext.cs` — prazan EF Core kontekst (entiteti dolaze u Fazi 1)
- EF Core + Npgsql 8.0.11 u csproj; CORS za `http://localhost:3000` s credentials (priprema za fazu 3)
- `backend/docker-compose.yml` (api :5080 + postgres:16 na **:5433** da ne kolidira s lokalnim
  Postgresom), `Dockerfile` (multi-stage), `.dockerignore`
- U repo dodani `PLAN-ARHITEKTURA.md` i ovaj `STANJE.md`; `.gitignore` proširen za .NET

**Verificirano u sandboxu:** build prolazi; `/api/vendors` i `/health` smoke-testirani i
vraćaju ispravan JSON. ⚠️ Sandbox nema pristup nuget.org pa je build verificiran s lokalno
stubanom EF površinom — **vlasnik treba potvrditi `dotnet build` s pravim paketima** (očekuje
se prolaz, korišten je standardni EF boilerplate). Docker compose nije pokretan u sandboxu.

**Odluke:** primijenjene preporuke iz PLAN-ARHITEKTURA.md §11 (Postgres+pg_trgm, Docker…).
Port mape: API 5080, Postgres u composeu 5433→5432.

**Sljedeći koraci (Faza 1):**
1. Entiteti iz plana §3 + EF migracije
2. Import komanda za Excel (2500 pružatelja) — idempotentna, čišćenje iz §4
3. `/api/vendors` s pravim filtrima + `pg_trgm` typeahead za `/api/suggest`
4. `/api/regions`, `/api/budget-defaults`, `/api/vendors/{slug}` nad bazom
   (šifrarnici regija/kategorija ostaju u kodu, zrcalo `lib/data.ts`)

**Za Fazu 1 vlasnik treba pripremiti:** Excel s 2500 pružatelja (format
`data/vendors-template.xlsx`) — dodati u repo ili dostaviti u chat.
