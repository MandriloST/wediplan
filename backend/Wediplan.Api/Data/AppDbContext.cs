using Microsoft.EntityFrameworkCore;

namespace Wediplan.Api.Data;

/// <summary>
/// EF Core kontekst. Faza 0: prazan (samo konekcija za health check).
/// Faza 1 dodaje entitete iz PLAN-ARHITEKTURA.md §3 (vendors, vendor_photos,
/// imported_reviews, ...) + migracije.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}
