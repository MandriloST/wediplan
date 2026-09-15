using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wediplan.Api.Contracts;
using Wediplan.Api.Data;

namespace Wediplan.Api.Controllers;

/// <summary>GET /api/regions — regije s brojačima (po sjedištu; mirror lib/search.ts regionCounts).</summary>
[ApiController]
[Route("api/regions")]
public class RegionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public RegionsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegionDto>>> Get(CancellationToken ct)
    {
        var counts = await _db.Vendors
            .Where(v => v.IsPublished && !v.OptOut)
            .GroupBy(v => v.RegionSlug)
            .Select(g => new { Region = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Region, x => x.Count, ct);

        var result = Catalog.Regions.Select(r => new RegionDto(
            r.Id, r.Name, r.Center, r.Bounds, counts.GetValueOrDefault(r.Id, 0)));
        return Ok(result);
    }
}

/// <summary>
/// GET /api/categories?region= — kategorije s brojačima po SVIM kategorijama (§4.3, §L).
/// Zbroj brojača > broj pružatelja je očekivan.
/// </summary>
[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> Get(
        [FromQuery] string? region, CancellationToken ct)
    {
        var q = _db.VendorCategories
            .Where(vc => vc.Vendor.IsPublished && !vc.Vendor.OptOut);

        if (!string.IsNullOrWhiteSpace(region))
            q = q.Where(vc =>
                vc.Vendor.RegionSlug == region ||
                vc.Vendor.CoverageAll ||
                vc.Vendor.CoverageRegions.Contains(region));

        var counts = await q
            .GroupBy(vc => vc.CategorySlug)
            .Select(g => new { Slug = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Slug, x => x.Count, ct);

        var result = Catalog.Categories.Select(c => new CategoryDto(
            c.Slug, c.Name, c.Group, counts.GetValueOrDefault(c.Slug, 0), c.Short));
        return Ok(result);
    }
}

/// <summary>GET /api/budget-defaults?region= — regionalna raspodjela (lib/budget.ts).</summary>
[ApiController]
[Route("api/budget-defaults")]
public class BudgetDefaultsController : ControllerBase
{
    [HttpGet]
    public ActionResult<BudgetDefaultsDto> Get([FromQuery] string? region)
        => Ok(new BudgetDefaultsDto(region ?? "hr", Catalog.SharesFor(region)));
}

/// <summary>
/// GET /api/suggest?q= — typeahead. Kategorije/regije iz šifrarnika (statično),
/// gradovi/pružatelji iz baze preko pg_trgm ILIKE. Mirror lib/search.ts suggest().
/// </summary>
[ApiController]
[Route("api/suggest")]
public class SuggestController : ControllerBase
{
    private readonly AppDbContext _db;
    public SuggestController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SuggestItemDto>>> Get(
        [FromQuery] string q, CancellationToken ct)
    {
        var input = (q ?? "").Trim();
        if (input.Length == 0) return Ok(Array.Empty<SuggestItemDto>());

        var like = $"%{input}%";
        var outp = new List<SuggestItemDto>();

        foreach (var c in Catalog.Categories)
            if (NormContains(c.Name, input) || (c.Short != null && NormContains(c.Short, input)))
                outp.Add(new SuggestItemDto("category", c.Name, $"/{c.Slug}", "kategorija"));

        foreach (var r in Catalog.Regions)
            if (NormContains(r.Name, input))
                outp.Add(new SuggestItemDto("region", r.Name, $"/{r.Id}", "regija"));

        var cities = await _db.Vendors
            .Where(v => v.IsPublished && !v.OptOut && v.City != "" && EF.Functions.ILike(v.City, like))
            .Select(v => v.City).Distinct().Take(5).ToListAsync(ct);
        foreach (var city in cities)
            outp.Add(new SuggestItemDto("city", city, $"/?q={Uri.EscapeDataString(city)}", "grad"));

        var vendors = await _db.Vendors
            .Where(v => v.IsPublished && !v.OptOut && EF.Functions.ILike(v.Name, like))
            .OrderByDescending(v => v.Rating)
            .Select(v => new { v.Name, v.City, v.CategorySlug })
            .Take(7).ToListAsync(ct);
        foreach (var v in vendors)
        {
            var cat = Catalog.CategoryBySlug.GetValueOrDefault(v.CategorySlug);
            var sub = $"{cat?.Short ?? cat?.Name ?? ""} · {v.City}";
            outp.Add(new SuggestItemDto("vendor", v.Name, $"/?q={Uri.EscapeDataString(v.Name)}", sub));
        }

        return Ok(outp.Take(7));
    }

    private static bool NormContains(string h, string n) => Norm(h).Contains(Norm(n));
    private static string Norm(string s)
    {
        s = s.ToLowerInvariant().Replace("đ", "d");
        var d = s.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder();
        foreach (var ch in d)
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch)
                != System.Globalization.UnicodeCategory.NonSpacingMark) sb.Append(ch);
        return sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
    }
}
