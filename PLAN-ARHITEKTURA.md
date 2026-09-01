# wediplan — Plan, arhitektura i upute za nastavak rada

> **Namjena dokumenta:** Ovo je glavni radni dokument za buduće razgovore u ovom projektu.
> Model (Sonnet/Opus) koji nastavlja rad treba ga pročitati PRIJE pisanja koda, zajedno s
> `README.md` i `API.md` u repou. Odluke označene **[ZA ODOBRENJE]** vlasnik mora potvrditi
> prije implementacije — ako u razgovoru nije rečeno drugačije, koristi se preporučena opcija.

---

## 1. Snimka postojećeg stanja (rujan 2026.)

**Repo:** `https://github.com/MandriloST/wediplan.git` — radi se ISKLJUČIVO na grani `develop`.
`main` je produkcija; vlasnik sam merga develop → main preko GitHub PR-a. Model nikad ne dira `main`.

**Što postoji i radi (frontend, Next.js 14 App Router):**
- Istraži/landing: search s typeaheadom, lista regija s brojačima, MapLibre karta Hrvatske
  sa stvarnim GeoJSON granicama 5 regija, cijene na pinovima, klasteri, popup kartice
- URL-driven filtri (`/dalmacija/foto-i-video` — shareable/SEO), sitemap, robots
- Usporedba 2–4 pružatelja, budžet kalkulator (drawer/tab), "Vaš plan" s capovima
- Profil pružatelja (`/pruzatelj/[slug]`) s uvezenim recenzijama i mock kalendarom dostupnosti
- Mobilna PWA: 5 tabova, manifest, service worker, offline plan/favoriti (localStorage)
- 29 kategorija (slugovi stabilni u `lib/data.ts`), cjenovni modeli: `from`, `perPerson`, `na upit`
- Excel → JSON import pipeline (`scripts/import-vendors.mjs`, `data/vendors-live.xlsx`)
- Deploy: Vercel (main = produkcija, develop = preview)

**Što NE postoji:** backend (.NET), baza podataka, auth, provider claim, prave recenzije
korisnika, admin sučelje, pohrana slika izvan gita. API rute u `app/api/*` su mock koji
čita JSON — `API.md` je ugovor koji .NET servis treba implementirati identično.

**Novi resurs:** vlasnik je prikupio **2500+ pružatelja** (≈100 po kategoriji) — trenutno
izvan repoa (Excel). To je okidač za prelazak s JSON-a na pravu bazu.

---

## 2. Ciljana arhitektura

```
[Korisnik] → Cloudflare (DNS, WAF, bot zaštita, cache)
              ├── wediplan.hr        → Vercel (Next.js frontend, PWA)
              └── api.wediplan.hr    → .NET 8 API (ASP.NET Core) u Dockeru
                                        ├── PostgreSQL 16 (podaci)
                                        └── Object storage (slike pružatelja)
```

- Frontend ostaje na Vercelu (već postavljeno, radi dobro, preview po grani).
- Backend je **ASP.NET Core 8 Web API** (vlasnikov teren) koji implementira postojeći
  `API.md` ugovor 1:1, plus nove endpointe (auth, claim, recenzije — v. §5–6).
- Frontend se na .NET prebacuje **jednim `rewrites` unosom** u `next.config.mjs`
  (`/api/* → https://api.wediplan.hr/*`) — komponente se ne diraju. Tako je i zamišljeno.

### 2.1 [ZA ODOBRENJE] Hosting backenda
| Opcija | Trošak | Napomena |
|---|---|---|
| **A (preporuka): Hetzner VPS** (CX22, ~5 €/mj) + Docker Compose (API + Postgres + Caddy) | ~5–10 €/mj | Najjeftinije, EU lokacija (GDPR-friendly), potpuna kontrola; zahtijeva osnovni ops (backup skripta, docker compose pull za deploy) |
| B: Azure App Service B1 + Azure Database for PostgreSQL | ~30–60 €/mj | Managed, prirodno za .NET, ali 5–10× skuplje; ima smisla tek kad promet naraste |
| C: Fly.io / Railway | ~10–20 €/mj | Sredina; manje standardno za .NET |

Preporuka: **A** za lansiranje. Backup baze: noćni `pg_dump` na object storage. Migracija
na Azure kasnije je trivijalna jer je sve u Dockeru.

### 2.2 [ZA ODOBRENJE] Baza i pretraga
- **PostgreSQL 16 + EF Core.** Za 2500–10.000 pružatelja **NE treba** Typesense/Meilisearch:
  Postgres `pg_trgm` (typeahead, tolerancija tipfelera) + generirani `tsvector` stupac
  (full-text) pokrivaju sve postojeće search zahtjeve uz jednostavniju infrastrukturu.
  Dedicated search engine dodati tek ako typeahead postane spor (>50k zapisa) — odluka se
  tada ne tiče frontenda jer je `/api/suggest` ugovor stabilan.

### 2.3 [ZA ODOBRENJE] Slike
- Slike pružatelja SELE SE IZ GITA u object storage: **Cloudflare R2** (preporuka —
  nema egress naplate, S3-kompatibilan, ~0 €/mj na ovom volumenu) ili Azure Blob.
- Upload/resize radi backend (varijante: thumb 400px, card 800px, full 1600px, WebP).
- Frontend koristi postojeći `lib/images.ts` — samo se izvor mijenja s `/public` na CDN URL.
- Default slike po kategoriji (29 kom) ostaju u repou.
- Vodeni žig (suptilan, kut slike) dodaje se pri generiranju varijanti — dio anti-scraping
  strategije (v. §8), ali NE na slikama koje pružatelj označi kao vlastiti portfolio s
  vlastitim žigom.

---

## 3. Model podataka (PostgreSQL, EF Core entiteti)

Minimalan skup za faze 1–4. Imena tablica engleski, sadržaj hrvatski.

```
vendors            id (uuid), slug (unique), name, category_slug, region_slug, city,
                   lat, lng, price_kind (from|per_person|on_request), price_from, price_to,
                   style_tags text[], about, services text[], website, phone, email,
                   verified bool, live_calendar bool, claim_status (unclaimed|pending|claimed),
                   owner_user_id (nullable FK), is_published bool, opt_out bool,
                   search tsvector (generated), created_at, updated_at
vendor_photos      id, vendor_id, storage_key, sort_order, is_cover
imported_reviews   id, vendor_id, author, rating, text, source, year   -- "što oni kažu"
user_reviews       id, vendor_id, user_id, rating, text, status (pending|published|rejected),
                   created_at                                          -- "što korisnici kažu"
users              id, email (unique), name, google_sub (nullable), password_hash (nullable),
                   role (couple|provider|admin), created_at
magic_links        id, user_id, token_hash, expires_at, used_at
claims             id, vendor_id, user_id, message, evidence (npr. email s domene weba),
                   status (pending|approved|rejected), decided_by, decided_at
favorites          user_id, vendor_id  (PK par)
budget_plans       id, user_id, guests, region_slug, total, caps jsonb, updated_at
profile_views      vendor_id, day (date), views int  -- agregirano po danu, ne po requestu
```

Napomene:
- `claim_status` + `owner_user_id` na vendoru je izvor istine tko smije uređivati.
- `opt_out` podržava GDPR zahtjev "ovo nije moj profil / uklonite me" (v. §9).
- `profile_views` je namjerno dnevni agregat (privacy + jeftino), dovoljan za
  "profil pregledan 340× ovaj mjesec" vrijednost pružateljima.
- Kategorije i regije ostaju sifrarnici u kodu (kao danas u `lib/data.ts`), NE tablice —
  mijenjaju se rijetko, a slugovi su ugovor s URL-ovima/SEO-om.

---

## 4. Import 2500 pružatelja

- Postojeći Excel format (`data/vendors-template.xlsx`) je polazna točka; import skripta
  se prepisuje da piše u Postgres (`scripts` → .NET konzolna komanda `dotnet run --import`
  ili zadržati Node skriptu koja gađa API — **[ZA ODOBRENJE]**, preporuka: .NET komanda,
  jedan jezik za sav backend posao).
- Import mora biti **idempotentan** (ključ: slug): ponovno pokretanje ažurira, ne duplicira.
- Obavezni koraci čišćenja pri importu: dedup po (name+city), normalizacija regija/kategorija
  na postojeće slugove, validacija cijena (from ≤ to; "na upit" ⇒ bez brojki), geokodiranje
  zapisa bez lat/lng (Nominatim uz rate limit, cache rezultata).
- Svi importirani pružatelji kreću kao `claim_status = unclaimed`, `verified = false`.
  `verified = true` ostaje rezerviran za platformom provjerene pružatelje (postojeći badge).

---

## 5. Auth (korisnici i pružatelji)

- **ASP.NET Core Identity** kao temelj; tri načina prijave:
  1. **Google OAuth** (najmanji friction),
  2. **Passwordless magic link** (unos emaila → link vrijedi 15 min, `magic_links` tablica),
  3. Email + lozinka (klasika, za one koji to žele).
- **Sesije: httpOnly cookie** na domeni `.wediplan.hr` (frontend `wediplan.hr` i API
  `api.wediplan.hr` dijele cookie; `SameSite=Lax`, `Secure`). NE JWT u localStorage.
  Lokalni razvoj: oba na `localhost` (različiti portovi) — cookie radi.
- **Role:** `couple` (default), `provider`, `admin`. Jedan korisnik može imati i couple
  i provider kontekst, ali podatkovni modeli su odvojeni (favoriti/plan vs. vendor edit).
- Nakon prijave: `favorites` i `budget_plans` migriraju se iz localStorage u bazu
  (merge, ne pregazi) — postojeći Zustand storeovi dobivaju sync sloj.
- Email slanje (magic link, obavijesti): **[ZA ODOBRENJE]** Resend ili Brevo
  (oba imaju besplatan tier dovoljan za start; preporuka Resend zbog jednostavnosti).

---

## 6. Provider claim flow (specifikacija)

1. Pružatelj se registrira/prijavi (bilo koja metoda iz §5), na svom profilu ili stranici
   "Za partnere" klikne **"Ovo je moj profil — preuzmi ga"**.
2. Forma: poruka + opcionalno dokaz (npr. email na domeni web stranice iz profila —
   ako se domena poklapa, claim se označava `evidence = domain_match` i može se brže odobriti).
3. Claim ide u `pending`; pružatelj ODMAH dobiva pristup uređivanju **u draftu**
   (promjene se ne objavljuju javno dok admin ne odobri claim). Načelo: trenutna
   vrijednost za partnera > savršena verifikacija.
4. Admin (vlasnik) u minimalnom admin sučelju odobrava/odbija; kod odobrenja se draft
   objavljuje, `claim_status = claimed`, `owner_user_id` postavljen.
5. Nakon claima pružatelj može: uređivati cijenu/opis/usluge/fotografije, vidjeti
   dnevne preglede profila i broj dodavanja u usporedbe. (Puni CRM i live kalendar
   ostaju "Coming soon" — postojeća badge/fallback logika se ne mijenja.)

**Admin sučelje (minimalno, faza 4):** lista pending claimova, lista pending user
recenzija (moderacija prije objave), gumb za opt-out/unpublish pružatelja. Može biti
zaseban `/admin` dio Next.js aplikacije zaštićen `admin` rolom — ne treba poseban alat.

---

## 7. Faze rada (svaka faza ≈ jedna radna sesija s modelom)

> Za svaku fazu: raditi na `develop` (ili kratkoživućoj `claude/*` grani mergeanoj u
> develop), commit poruke na hrvatskom s `feat:`/`fix:` prefiksom, build mora proći
> (`npm run build` za frontend, `dotnet build` za backend) prije predaje.

**Faza 0 — kostur backenda.** Novi folder `backend/` u repou (monorepo): ASP.NET Core 8
Web API projekt, EF Core + Npgsql, Docker Compose (api + postgres) za lokalni razvoj,
health endpoint, CI-friendly struktura. Definition of done: `docker compose up` digne
API koji vraća prazan `/api/vendors` odgovor u ispravnom obliku iz `API.md`.

**Faza 1 — model + migracije + import.** Entiteti iz §3, EF migracije, import komanda
za Excel s 2500 pružatelja (idempotentna, s čišćenjem iz §4). DoD: baza puna,
`/api/vendors` s filtrima (q, region, category, page) vraća stvarne podatke identično
mock obliku; `pg_trgm` typeahead za `/api/suggest`.

**Faza 2 — spajanje frontenda.** `rewrites` na .NET API, gašenje mock ruta (ostaju u
repou kao referenca dok sve ne prođe), regresijska provjera: karta, filtri, usporedba,
budžet, profili, sitemap. DoD: frontend na Vercel previewu radi nad pravim API-jem.

**Faza 3 — auth.** §5 u cijelosti + migracija localStorage → account. DoD: prijava
sva tri načina radi, favoriti/plan sinkronizirani, odjava/istek sesije uredni.

**Faza 4 — claim + admin + recenzije korisnika.** §6, `POST /api/reviews`
(auth required, ide u moderaciju), minimalni admin. DoD: cijeli put od registracije
pružatelja do odobrenog claima i objavljene korisničke recenzije prolazi ručni test.

**Faza 5 — slike + produkcijsko očvršćivanje.** R2 storage + upload u provider
dashboardu + varijante/WebP + žig; rate limiting middleware; Cloudflare ispred svega;
backup baze; monitoring (uptime + error log). DoD: checklista u §8 zadovoljena.

**Faza 6 — lansiranje.** Domena, `NEXT_PUBLIC_SITE_URL`, pravne stranice (§9),
Google Search Console, finalna regresija, merge u `main`.

Redoslijed 0→2 je fiksan; 3 i 4 mogu zamijeniti mjesta ako vlasnik želi ranije claim.

---

## 8. Sigurnost i anti-scraping (sažetak — puni dokument: `zastita-od-scrapinga.md`)

Ugrađeno u arhitekturu od početka:
- Cloudflare ispred frontenda i API-ja (bot fight mode, rate limiting, JS challenge)
- `Microsoft.AspNetCore.RateLimiting`: stroži limit na `/api/vendors` (liste) nego na
  pojedinačne profile; limit po IP-u
- Paginacija uvijek (pageSize ≤ 50, već u ugovoru); NIKAD endpoint "svi pružatelji"
- Kontakt podaci pružatelja (telefon, email) učitavaju se zasebnim pozivom na klik,
  ne u list responseu
- Žig na slikama (v. §2.3); ToS klauzula protiv automatskog prikupljanja
- NE raditi sada: enterprise anti-bot alati, agresivna headless detekcija,
  bilo što što šteti SEO-u ili pristupačnosti

---

## 9. GDPR i pravni minimum (prije lansiranja — faza 6)

- **Opt-out mehanizam:** na svakom unclaimed profilu link "Ovo je moj obrt/firma i ne
  želim biti na stranici" → forma → `opt_out = true`, profil se skida iz javnog prikaza.
  Ovo je ključno jer je 2500 profila prikupljeno bez prijave samih pružatelja.
- Prikazivati samo podatke koje su pružatelji sami javno objavili (web, javni imenici).
  Osobne mobitele fizičkih osoba (obrtnika) ne objavljivati bez claima.
- Stranice: Pravila privatnosti, Uvjeti korištenja (s anti-scraping klauzulom),
  Impressum, cookie notice (minimalan — bez marketinških kolačića na startu).
- Recenzije korisnika: moderacija prije objave (već u §6), mogućnost brisanja na zahtjev.

---

## 10. Upute modelu koji nastavlja rad (pročitati prije koda)

1. **Grane:** sav rad na `develop` ili `claude/*` → develop. `main` se NE dira.
   Ako push iz sandboxa nije moguć, predati git bundle + točne upute za merge
   (ustaljeni workflow ovog projekta).
2. **Izvori istine:** `API.md` (oblici odgovora — .NET ih mora vraćati identično),
   `lib/data.ts` (slugovi kategorija/regija — ne mijenjati bez izričitog zahtjeva),
   ovaj dokument (arhitektura i faze).
3. **Ne redizajnirati postojeći UI** bez zahtjeva — vizualni smjer je odobren.
   UI copy je hrvatski (hr-HR); i18n (engleski) je planiran kasnije, ne sada.
4. **Cjenovna transparentnost je core diferencijator:** cijena uvijek vidljiva, bold,
   accent boja; "na upit" vizualno prigušen; pružatelji izvan budžeta posivljeni,
   nikad skriveni. Ta pravila se ne krše ni u jednoj novoj komponenti.
5. Prije predaje: frontend `npm run build` bez grešaka; backend `dotnet build` +
   migracije primjenjive na praznu bazu; kratki opis promjena i ručnih koraka za vlasnika.
6. Na početku sesije provjeriti stvarno stanje repoa (`git log`, struktura) — ne
   oslanjati se samo na ovaj dokument, moglo se promijeniti.
7. Vlasnik je programer (.NET) — objašnjenja mogu biti tehnička, ali koraci za
   pokretanje/merge uvijek eksplicitni i copy-paste spremni.

---

## 11. Odluke koje čekaju odobrenje vlasnika (sažetak)

| # | Odluka | Preporuka |
|---|---|---|
| 1 | Hosting backenda (§2.1) | Hetzner VPS + Docker |
| 2 | Pretraga (§2.2) | Postgres pg_trgm + FTS, bez Typesensea |
| 3 | Pohrana slika (§2.3) | Cloudflare R2 + WebP varijante + žig |
| 4 | Import alat (§4) | .NET konzolna komanda umjesto Node skripte |
| 5 | Email servis (§5) | Resend |
| 6 | Redoslijed faza 3↔4 (§7) | Auth prije claima |

Odobrenjem (ili izmjenom) ovih 6 stavki plan postaje izvršiv — sljedeći razgovor može
početi rečenicom: "Kreni s fazom 0 prema PLAN-ARHITEKTURA.md".
