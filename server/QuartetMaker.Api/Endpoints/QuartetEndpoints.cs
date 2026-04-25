using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class QuartetEndpoints
{
    public static IEndpointRouteBuilder MapQuartetEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/quartet", async (
            [Microsoft.AspNetCore.Mvc.FromQuery] int[] singerIds,
            AppDbContext db) =>
        {
            if (singerIds.Length == 0)
                return Results.BadRequest("Provide at least one singerId.");

            var entries = await db.SingerSongs
                .Where(ss => singerIds.Contains(ss.SingerId))
                .Include(ss => ss.Song)
                .Include(ss => ss.Singer)
                .ToListAsync();

            var songs = entries
                .GroupBy(ss => ss.Song.Title)
                .Select(g =>
                {
                    var tenor    = g.Where(ss => ss.Part == Part.Tenor).Select(ss => ss.Singer.Name).ToList();
                    var lead     = g.Where(ss => ss.Part == Part.Lead).Select(ss => ss.Singer.Name).ToList();
                    var baritone = g.Where(ss => ss.Part == Part.Baritone).Select(ss => ss.Singer.Name).ToList();
                    var bass     = g.Where(ss => ss.Part == Part.Bass).Select(ss => ss.Singer.Name).ToList();
                    var complete = tenor.Count > 0 && lead.Count > 0 && baritone.Count > 0 && bass.Count > 0;
                    var song = g.First().Song;
                    return new QuartetSongDto(g.Key, song.Arranger, song.Voicing, new PartCoverageDto(tenor, lead, baritone, bass), complete);
                })
                .OrderByDescending(s => s.IsComplete)
                .ThenBy(s => s.Title)
                .ToList();

            return Results.Ok(songs);
        })
        .WithTags("Quartet")
        .WithName("GetQuartetSongs")
        .RequireAuthorization();

        return app;
    }
}
