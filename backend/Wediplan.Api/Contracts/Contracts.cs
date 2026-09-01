using System.Text.Json.Serialization;

namespace Wediplan.Api.Contracts;

// ============================================================================
// Ugovor s frontendom — 1:1 zrcalo API.md i frontend lib/types.ts.
// Serializacija: camelCase + izostavljanje null polja (postavljeno u Program.cs).
// NE mijenjati oblike bez sinkrone izmjene u API.md.
// ============================================================================

/// <summary>Paged&lt;T&gt; iz lib/types.ts — oblik odgovora GET /api/vendors.</summary>
public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>
/// PriceModel iz lib/types.ts. Diskriminator "kind": from | perPerson | onRequest.
/// Kod kind="from": samo From. Kod "perPerson": From + To. Kod "onRequest": bez brojki
/// (null polja se izostavljaju iz JSON-a).
/// </summary>
public record PriceDto(
    string Kind,
    int? From = null,
    int? To = null)
{
    public static PriceDto FromPrice(int from) => new("from", from);
    public static PriceDto PerPerson(int from, int to) => new("perPerson", from, to);
    public static PriceDto OnRequest() => new("onRequest");
}

/// <summary>Vendor iz lib/types.ts (lista/karta).</summary>
public record VendorDto(
    string Id,
    string Slug,
    string Name,
    string Category,       // Category.slug (šifrarnik u frontend lib/data.ts)
    string Region,         // RegionId: istra|kvarner|dalmacija|zagreb|slavonija
    string City,
    double Lng,
    double Lat,
    PriceDto Price,
    double Rating,
    int ReviewCount,
    bool Verified,
    bool LiveCalendar,
    IReadOnlyList<string> StyleTags,
    string? RatingSource = null,   // izvor prenesene ocjene (npr. "Google recenzije")
    IReadOnlyList<string>? Photos = null);

/// <summary>RegionWithCount iz lib/types.ts — GET /api/regions.</summary>
public record RegionDto(
    string Id,
    string Name,
    double[] Center,       // [lng, lat]
    double[][] Bounds,     // [[west, south], [east, north]]
    int Count);

/// <summary>Suggestion iz lib/search.ts — GET /api/suggest. type: category|region|city|vendor.</summary>
public record SuggestItemDto(
    string Type,
    string Label,
    string Href,
    string? Sub = null);

/// <summary>GET /api/budget-defaults — regionalna raspodjela budžeta.</summary>
public record BudgetDefaultsDto(
    string Region,                          // RegionId ili "hr"
    IReadOnlyDictionary<string, double> Shares); // sala/catering/foto/glazba/ostalo, suma = 1

/// <summary>GET /api/vendors/{slug} — profil pružatelja.</summary>
public record VendorProfileDto(
    VendorDto Vendor,
    string About,
    IReadOnlyList<string> Services,
    IReadOnlyList<ImportedReviewDto> ImportedReviews);

/// <summary>Prenesena recenzija ("što oni kažu") — imported_reviews.</summary>
public record ImportedReviewDto(
    string Author,
    int Rating,
    string Text,
    string Source,
    int Year);
