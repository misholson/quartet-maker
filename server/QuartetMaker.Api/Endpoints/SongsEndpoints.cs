using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class SongsEndpoints
{
    public static IEndpointRouteBuilder MapSongsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/songs", async (string? search, AppDbContext db) =>
        {
            var query = db.Songs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(s => s.Title.ToLower().Contains(search.ToLower()));

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

        app.MapPost("/api/songs", async (CreateSongRequest req, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Title))
                return Results.BadRequest("Title is required.");

            var title = req.Title.Trim();
            var arranger = string.IsNullOrWhiteSpace(req.Arranger) ? null : req.Arranger.Trim();

            var existing = await db.Songs.FirstOrDefaultAsync(s =>
                s.Title == title &&
                s.Arranger == arranger &&
                s.Voicing == req.Voicing);

            if (existing is not null)
                return Results.Ok(new SongSummaryDto(existing.Id, existing.Title, existing.Arranger, existing.Voicing));

            var song = new Song { Title = title, Arranger = arranger, Voicing = req.Voicing };
            db.Songs.Add(song);
            await db.SaveChangesAsync();

            return Results.Created($"/api/songs/{song.Id}", new SongSummaryDto(song.Id, song.Title, song.Arranger, song.Voicing));
        })
        .WithTags("Songs")
        .WithName("CreateSong")
        .RequireAuthorization();

        app.MapPost("/api/songs/import", async (ImportSongsRequest req, AppDbContext db) =>
        {
            int added = 0, skipped = 0;

            foreach (var item in req.Songs)
            {
                if (string.IsNullOrWhiteSpace(item.Title)) continue;

                var title = item.Title.Trim();
                var arranger = string.IsNullOrWhiteSpace(item.Arranger) ? null : item.Arranger.Trim();

                try
                {
                    db.Songs.Add(new Song { Title = title, Arranger = arranger, Voicing = item.Voicing });
                    await db.SaveChangesAsync();
                    added++;
                }
                catch (DbUpdateException)
                {
                    db.ChangeTracker.Clear();
                    skipped++;
                }
            }

            return Results.Ok(new ImportResultDto(added, skipped));
        })
        .WithTags("Songs")
        .WithName("ImportSongs")
        .RequireAuthorization();

        return app;
    }
}
