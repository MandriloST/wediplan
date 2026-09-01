using Microsoft.AspNetCore.Mvc;
using Wediplan.Api.Contracts;

namespace Wediplan.Api.Controllers;

/// <summary>
/// GET /api/vendors — ugovor iz API.md.
/// Faza 0: vraća prazan rezultat u ISPRAVNOM obliku (DoD kostura).
/// Faza 1: filtriranje (q, region, category, date) nad Postgresom + pg_trgm.
/// </summary>
[ApiController]
[Route("api/vendors")]
public class VendorsController : ControllerBase
{
    // Ugovor: pageSize ≤ 50 (anti-scraping, plan §8); mock default je 24.
    private const int DefaultPageSize = 24;
    private const int MaxPageSize = 50;

    [HttpGet]
    public ActionResult<PagedResult<VendorDto>> List(
        [FromQuery] string? q,
        [FromQuery] string? region,
        [FromQuery] string? category,
        [FromQuery] string? date,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        // Faza 0: baza je prazna — prazan popis, ispravan oblik.
        return Ok(new PagedResult<VendorDto>(
            Items: Array.Empty<VendorDto>(),
            Total: 0,
            Page: page,
            PageSize: pageSize));
    }
}
