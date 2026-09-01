using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Wediplan.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// --- JSON politika: identična Next.js mocku (API.md je ugovor) ---
// camelCase je ASP.NET default; null polja se IZOSTAVLJAJU (TS izostavlja undefined,
// npr. price.to kod kind="from", ratingSource, photos).
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// --- PostgreSQL + EF Core ---
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=wediplan;Username=wediplan;Password=wediplan";
builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));

// --- CORS: lokalni frontend (localhost:3000). U produkciji frontend ide kroz
// Next.js rewrites (isti origin), pa je CORS bitan samo za dev i eventualni preview.
const string CorsPolicy = "frontend";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(
        builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
        ?? new[] { "http://localhost:3000" })
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials())); // priprema za httpOnly cookie auth (faza 3)

var app = builder.Build();

app.UseCors(CorsPolicy);
app.MapControllers();

app.Run();
