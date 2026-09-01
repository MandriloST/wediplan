# STANJE.md — dnevnik rada i trenutno stanje projekta

> **Namjena:** model koji nastavlja rad čita OVO + `PLAN-ARHITEKTURA.md` + `API.md` prije koda.
> Ažurira se na kraju SVAKE radne sesije (kratko, činjenično). Novije sesije na vrhu.
> Uvijek provjeriti i stvarni `git log` — repo je izvor istine, ovo je sažetak.

## Trenutna faza: **0 — ZAVRŠENA** → sljedeće: Faza 1 (model + migracije + import)

## Stalna pravila predaje (vrijede svaku sesiju)
- Rad isključivo na `develop` (ili `claude/*` → develop). `main` se ne dira.
- Na kraju svake sesije predati: **(1)** upute za pokretanje i testiranje, **(2)** kod kao
  **ZIP s punom strukturom foldera** (copy-paste preko root projekta radi ispravno) i/ili
  **patch/bundle** + točne git naredbe za merge.
- Build mora proći prije predaje: `npm run build` (frontend), `dotnet build` (backend).
- Ažurirati ovaj dokument (i PLAN-ARHITEKTURA.md ako se arhitektura mijenja) u istom commitu.

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
