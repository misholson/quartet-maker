using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.Endpoints;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=quartet.db";
var isSqlite = connectionString.TrimStart().StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase);
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    if (isSqlite) opt.UseSqlite(connectionString);
    else opt.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());
});

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];
builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p =>
        p.WithOrigins(allowedOrigins)
         .AllowAnyHeader()
         .AllowAnyMethod()));

builder.Services.ConfigureHttpJsonOptions(opt =>
    opt.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret configuration is required");
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    // EnsureCreated won't update an existing schema, so schema changes are patched manually.
    if (isSqlite)
    {
        db.Database.ExecuteSqlRaw("DROP INDEX IF EXISTS \"IX_Songs_Title\"");
        db.Database.ExecuteSqlRaw(
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Songs_Title_Arranger_Voicing\" " +
            "ON \"Songs\" (\"Title\", \"Arranger\", \"Voicing\")");
        try { db.Database.ExecuteSqlRaw("ALTER TABLE \"Singers\" ADD COLUMN \"Role\" TEXT NOT NULL DEFAULT 'User'"); }
        catch { /* column already exists */ }
    }
    else
    {
        db.Database.ExecuteSqlRaw(
            "IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Songs_Title' AND object_id = OBJECT_ID('Songs')) " +
            "DROP INDEX IX_Songs_Title ON Songs");
        db.Database.ExecuteSqlRaw(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Songs_Title_Arranger_Voicing' AND object_id = OBJECT_ID('Songs')) " +
            "CREATE UNIQUE INDEX IX_Songs_Title_Arranger_Voicing ON Songs (Title, Arranger, Voicing)");
        db.Database.ExecuteSqlRaw(
            "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Singers' AND COLUMN_NAME = 'Role') " +
            "ALTER TABLE Singers ADD Role NVARCHAR(MAX) NOT NULL DEFAULT 'User'");
    }
    await Seeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints(builder.Configuration);
app.MapSingersEndpoints();
app.MapSongsEndpoints();
app.MapQuartetEndpoints();
app.MapCollectionsEndpoints();

app.Run();
