# API ugovor (za ASP.NET Core Web API)

Mock implementacija živi u `app/api/*` — .NET servis treba vratiti identične oblike.

## GET /api/vendors
Query: `q, region, category, date, page (1+), pageSize (≤50)`
```json
{ "items": [], "total": 53, "page": 1, "pageSize": 24 }
```
Vendor:
```json
{
  "id": "v1", "slug": "foto-studio-anic", "name": "Foto studio Anić",
  "category": "foto-i-video", "region": "dalmacija", "city": "Split",
  "lng": 16.44, "lat": 43.51,
  "price": { "kind": "from", "from": 850 },
  "rating": 4.8, "reviewCount": 31,
  "verified": true, "liveCalendar": false,
  "styleTags": ["boho", "film"], "photo": null
}
```
(`price` alternativa: `{ "kind": "perPerson", "from": 55, "to": 80 }`)

## GET /api/regions
```json
[{ "id": "dalmacija", "name": "Dalmacija", "center": [16.4, 43.6],
   "bounds": [[14.5, 42.35], [18.6, 44.6]], "count": 18 }]
```

## GET /api/suggest?q=
```json
[{ "type": "category", "label": "Foto i Video", "sub": "kategorija", "href": "/foto-i-video" }]
```
(`type`: category | region | city | vendor)

## GET /api/budget-defaults?region=
```json
{ "region": "dalmacija", "shares": { "sala": 0.42, "catering": 0.24, "foto": 0.15, "glazba": 0.09, "ostalo": 0.1 } }
```

## GET /api/vendors/{slug}
Profil pružatelja (implementirano, mock):
```json
{ "vendor": {}, "about": "…", "services": ["…"],
  "importedReviews": [{ "author": "Marija i Ivan", "rating": 5, "text": "…", "source": "Google recenzije", "year": 2025 }] }
```

## Kasnije (Coming soon)
- `GET /api/vendors/{id}/availability?month=YYYY-MM` → `{ "days": { "2026-09-05": "free|busy" } }` — do tada frontend koristi deterministički mock iz `lib/availability.ts` (ista logika na profilu i u usporedbi)
- `POST /api/plan` (sync plana uz auth), `POST /api/reviews` (registrirani korisnici)
