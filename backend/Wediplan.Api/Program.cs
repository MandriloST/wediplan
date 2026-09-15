using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Wediplan.Api.Data;
using Wediplan.Api.Import;

var builder = WebApplication.CreateBuilder(args);

// JSON: camelCase + izostavljanje null polja (identično Next.js mocku; API.md ugovor).
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? Environment.GetEnvironmentVariable("WEDIPLAN_DB")
    ?? "Host=localhost;Port=5433;Database=wediplan;Username=wediplan;Password=wediplan";
builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));

const string CorsPolicy = "frontend";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
        ?? new[] { "http://localhost:3000" })
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// --- CLI način: `dotnet run -- --import <xlsx> [--dry-run] [--no-geocode]` ---
if (args.Contains("--import"))
{
    await RunImportAsync(app, args);
    return;
}

// --- CLI način: `dotnet run -- --rollup [YYYY-MM-DD]` (noćni cron/systemd timer) ---
if (args.Contains("--rollup"))
{
    var dayArg = args.SkipWhile(a => a != "--rollup").Skip(1).FirstOrDefault();
    var day = DateOnly.TryParse(dayArg, out var d) ? d
        : DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)); // default: jučer
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await Wediplan.Api.Import.Rollup.RunAsync(db, day, CancellationToken.None);
    return;
}

app.UseCors(CorsPolicy);
app.MapControllers();
app.Run();

static async Task RunImportAsync(WebApplication app, string[] args)
{
    var path = args.SkipWhile(a => a != "--import").Skip(1).FirstOrDefault();
    if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
    {
        Console.Error.WriteLine("Upotreba: dotnet run -- --import <putanja.xlsx> [--dry-run] [--no-geocode]");
        Environment.ExitCode = 1;
        return;
    }
    bool dryRun = args.Contains("--dry-run");
    bool noGeocode = args.Contains("--no-geocode");

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    Geocoder? geocoder = noGeocode || dryRun
        ? null
        : new Geocoder(Path.Combine(Directory.GetCurrentDirectory(), "geocode-cache.json"));

    var importer = new ExcelImporter(db, geocoder, dryRun);
    await importer.RunAsync(path, CancellationToken.None);
}
