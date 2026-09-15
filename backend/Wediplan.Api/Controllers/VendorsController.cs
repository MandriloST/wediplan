using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wediplan.Api.Contracts;
using Wediplan.Api.Data;

namespace Wediplan.Api.Controllers;

/// <summary>
/// GET /api/vendors (lista, filtri) i GET /api/vendors/{slug} (profil). Ugovor: API.md.
/// Category-first (§L): frontend ne zove bez category, ali ugovor to dopušta (SEO).
/// Kontakti se NE vraćaju (§8-§9, odluka #13).
/// </summary>
[ApiController]
[Route("api/vendors")]
public class VendorsController : ControllerBase
{
    private const int DefaultPageSize = 24; // §L
    private const int MaxPageSize = 50;     // anti-scraping (§8)

    private readonly AppDbContext _db;
    public VendorsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<PagedResult<VendorDto>>> List(
        [FromQuery] string? q,
        [FromQuery] string? region,
        [FromQuery] string? category,
        [FromQuery] string? date,       // rezervirano (dostupnost) — ne filtrira u Fazi 1
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = _db.Vendors
            .AsNoTracking()
            .Where(v => v.IsPublished && !v.OptOut);

        // Regija: sjedište ILI pokriva cijelu HR ILI pokriva tu regiju (lib/search.ts)
        if (!string.IsNullOrWhiteSpace(region))
            query = query.Where(v =>
                v.RegionSlug == region ||
                v.CoverageAll ||
                v.CoverageRegions.Contains(region));

        // Kategorija: bilo koja od svih kategorija pružatelja (§4.3)
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(v => v.Categories.Any(c => c.CategorySlug == category));

        // Tekst: naziv/grad/kategorija (naziv iz šifrarnika)/stil — mirror lib/search.ts hay-a
        if (!string.IsNullOrWhiteSpace(q))
        {
            var like = $"%{q.Trim()}%";
            var matchedCats = Catalog.Categories
                .Where(c => Contains(c.Name, q) || (c.Short != null && Contains(c.Short, q)))
                .Select(c => c.Slug)
                .ToList();

            query = query.Where(v =>
                EF.Functions.ILike(v.Name, like) ||
                EF.Functions.ILike(v.City, like) ||
                matchedCats.Contains(v.CategorySlug) ||
                v.StyleTags.Any(t => EF.Functions.ILike(t, like)));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(v => v.Rating)
            .ThenByDescending(v => v.ReviewCount)
            .ThenBy(v => v.Id)                       // stabilan redoslijed za paginaciju
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(v => v.Categories)
            .Include(v => v.Photos)
            .ToListAsync(ct);

        return Ok(new PagedResult<VendorDto>(
            items.Select(VendorMapper.ToDto).ToList(), total, page, pageSize));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<VendorProfileDto>> Get(string slug, CancellationToken ct)
    {
        var v = await _db.Vendors
            .AsNoTracking()
            .Where(x => x.Slug == slug && x.IsPublished && !x.OptOut)
            .Include(x => x.Categories)
            .Include(x => x.Photos)
            .Include(x => x.ImportedReviews)
            .FirstOrDefaultAsync(ct);

        if (v == null) return NotFound();

        var reviews = v.ImportedReviews
            .OrderByDescending(r => r.Year)
            .Select(r => new ImportedReviewDto(r.Author, r.Rating, r.Text, r.Source, r.Year))
            .ToList();

        return Ok(new VendorProfileDto(
            Vendor: VendorMapper.ToDto(v),
            About: v.About ?? "",
            Services: v.Services,
            ImportedReviews: reviews));
    }

    // Diacritic-insensitivan substring (mirror norm() iz lib/search.ts) — za šifrarnik u memoriji.
    private static bool Contains(string haystack, string needle) =>
        Norm(haystack).Contains(Norm(needle));

    private static string Norm(string s)
    {
        s = s.ToLowerInvariant().Replace("đ", "d");
        var decomposed = s.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder();
        foreach (var ch in decomposed)
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch)
                != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        return sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
    }
}
