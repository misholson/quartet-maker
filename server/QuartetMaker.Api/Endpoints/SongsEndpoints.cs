using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;

namespace QuartetMaker.Api.Endpoints;

public static class SongsEndpoints
{
    public static IEndpointRouteBuilder MapSongsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/songs", async (string? search, AppDbContext db) =>
        {
            var query = db.Songs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(s => s.Title.Contains(search));

            var songs = await query
                .OrderBy(s => s.Title)
                .Take(20)
                .Select(s => new SongSummaryDto(s.Id, s.Title, s.Arranger, s.Voicing))
                .ToListAsync();

            return Results.Ok(songs);
        })
        .WithTags("Songs")
        .WithName("GetSongs")
        .RequireAuthorization();

        return app;
    }
}
