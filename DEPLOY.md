# Deploy na Vercel — vodič

## Prije prvog deploya (lokalna provjera, ~5 min)

```bash
npm run import:vendors -- putanja/do/tvog.xlsx   # ako mijenjaš podatke
npm run scaffold:images && npm run sync:images    # ako dodaješ slike
npm run build                                     # MORA proći bez grešaka
npm start                                         # http://localhost:3000 — klikni kroz stranicu
```

Provjeri prije pusha: `git status` ne smije pokazivati `.next/` datoteke, a slike i `data/*.json` moraju biti commitani (Vercel builda iz gita — što nije u gitu, ne postoji na produkciji).

## Prvi deploy (~10 min)

1. **vercel.com** → Sign up with GitHub (besplatan Hobby plan je dovoljan za start).
2. **Add New… → Project** → Import `MandriloST/wediplan`.
3. Vercel sam prepozna Next.js — **ništa ne mijenjaj** (build command, output, install su automatski). Env varijable za sada nisu potrebne.
4. **Deploy.** Prvi build traje ~2 min. Dobivaš URL oblika `wediplan-xxxx.vercel.app`.

## Workflow grana (preporuka)

- **Production branch: `main`** (Vercel default). Svaki push/merge u `main` = nova produkcija.
- Svaki push na **`develop`** automatski dobiva **Preview URL** — savršeno za pokazati promjenu prije nego ode uživo.
- Tok: radiš na `develop` → provjeriš preview → `git checkout main && git merge develop && git push` → produkcija.

## Nakon prvog deploya — checklista

- [ ] Karta se učitava i pinovi rade (klik na regiju, popup)
- [ ] Slike pružatelja vidljive (kartice + profili)
- [ ] `https://<url>/sitemap.xml` i `/robots.txt` rade
- [ ] Mobitel: donja navigacija, "Dodaj na početni zaslon" (PWA install)
- [ ] Usporedba i budžet rade (localStorage)
- [ ] U Vercel projekt → **Settings → Environment Variables** dodaj `NEXT_PUBLIC_SITE_URL` = tvoj konačni URL (ili kasnije domena) → Redeploy. (Do tada se koristi VERCEL_URL — radi, ali sitemap će pokazivati privremeni URL.)

## Vlastita domena (kad kupiš, npr. wediplan.hr)

Vercel projekt → Settings → Domains → Add → slijedi DNS upute (A/CNAME zapis kod registrara). SSL je automatski. Zatim ažuriraj `NEXT_PUBLIC_SITE_URL`.

## Potencijalni problemi i rješenja

| Problem | Uzrok | Rješenje |
|---|---|---|
| Slika radi lokalno (Windows), 404 na Vercelu | Linux je case-sensitive: folder `Villa-Lav` ≠ slug `villa-lav` | Imena foldera moraju biti točno slug; `npm run sync:images` prijavljuje krivo nazvane kao "siročad" — ne ignoriraj to upozorenje |
| Build padne: "lockfile out of sync" | `package.json` mijenjan bez `npm install` | Lokalno `npm install`, commitaj `package-lock.json` |
| Stara verzija stranice nakon deploya | Service worker cache kod korisnika | SW je network-first pa se rješava sam na sljedeći posjet; kod sebe: DevTools → Application → Service Workers → Update/Unregister. Ako mijenjaš `public/sw.js`, digni verziju (`wediplan-shell-v2`) |
| Karta spora ili tile-ovi ne rade | Javni OSM server je best-effort i nije za komercijalnu produkciju | Za demo OK. Za produkciju: MapTiler (free tier 100k tileova/mj) → env `NEXT_PUBLIC_TILE_URL=https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=KLJUČ` |
| Upozorenje o broju optimiziranih slika | Hobby plan: 1000 izvornih slika | Sada nebitno (~25 slika). Kod ~300 vendora: Vercel Pro ili Bunny Optimizer (vidi bilješke o skaliranju) |
| Font warning u build logu | Kozmetika (inline optimizacija fontova) | Ignorirati — na Vercelu obično nestane jer ima mrežu |
| Push na GitHub ne pokreće deploy | GitHub integracija | Vercel → Settings → Git → provjeri da je repo povezan |

## Što NE treba raditi

- Ne postavljaj `output: 'export'` — API rute i on-demand stranice trebaju server.
- Ne dodavaj `vercel.json` — defaulti su ispravni za ovaj projekt.
- Ne commitaj `.env` datoteke (za sada ih ni nemamo; tajne idu u Vercel env UI).
