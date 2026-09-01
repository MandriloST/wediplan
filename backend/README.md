# wediplan backend — ASP.NET Core 8 Web API

Implementira ugovor iz `../API.md` (oblici odgovora identični Next.js mocku u `app/api/*`).
Arhitektura i faze: `../PLAN-ARHITEKTURA.md`. Stanje rada: `../STANJE.md`.

## Struktura
```
backend/
├─ Wediplan.sln
├─ docker-compose.yml        # api (:5080) + postgres 16 (:5433 na hostu)
└─ Wediplan.Api/
   ├─ Program.cs             # DI, JSON politika (camelCase, bez null polja), CORS
   ├─ Contracts/             # DTO-ovi — 1:1 zrcalo API.md / lib/types.ts
   ├─ Controllers/           # VendorsController, HealthController
   ├─ Data/AppDbContext.cs   # EF Core (entiteti dolaze u Fazi 1)
   └─ Dockerfile
```

## Pokretanje — Docker (preporučeno)
```bash
cd backend
docker compose up --build
```
- API: http://localhost:5080 · Postgres: `localhost:5433` (db/user/pass: `wediplan`)

## Pokretanje — bez Dockera
Treba .NET 8 SDK + Postgres (prilagodi `ConnectionStrings:Default` u `appsettings.json`;
API radi i bez baze — `/health` tada javlja `db: unavailable`).
```bash
cd backend/Wediplan.Api
dotnet run   # http://localhost:5080 (launchSettings)
```

## Provjera (Definition of done Faze 0)
```bash
curl http://localhost:5080/health
# → {"status":"ok","db":"ok","version":"1.0.0"}

curl "http://localhost:5080/api/vendors"
# → {"items":[],"total":0,"page":1,"pageSize":24}

curl "http://localhost:5080/api/vendors?page=2&pageSize=999"
# → {"items":[],"total":0,"page":2,"pageSize":50}   (pageSize clamp ≤ 50)
```

## Konvencije
- JSON: camelCase, null polja se izostavljaju (postavljeno globalno u `Program.cs`) —
  ne mijenjati, frontend ovisi o tome.
- `pageSize ≤ 50` — anti-scraping pravilo, ne dizati.
- Commit poruke hrvatski, `feat:`/`fix:` prefiks; rad na `develop`.
