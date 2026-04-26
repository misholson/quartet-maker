using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class QuartetEndpoints
{
    public static IEndpointRouteBuilder MapQuartetEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/quartets", async (
            CreateQuartetRequest req,
            ClaimsPrincipal user,
            AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var singer = await db.Singers.FindAsync(singerId);
            if (singer is null) return Results.Unauthorized();

            var quartet = new Quartet
            {
                Name = req.Name,
                InviteCode = Guid.NewGuid().ToString("N")[..10],
                Members = [new QuartetMember { SingerId = singerId, IsOwner = true }],
            };
            db.Quartets.Add(quartet);
            await db.SaveChangesAsync();

            return Results.Created($"/api/quartets/{quartet.Id}", new QuartetDto(
                quartet.Id, quartet.Name, quartet.InviteCode,
                [new QuartetMemberDto(singerId, singer.Nickname ?? singer.Name, true)]));
        })
        .WithTags("Quartet").WithName("CreateQuartet").RequireAuthorization();

        app.MapGet("/api/quartets/my", async (ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartets = await db.Quartets
                .Where(q => q.Members.Any(qm => qm.SingerId == singerId))
                .Select(q => new QuartetSummaryDto(q.Id, q.Name, q.Members.Count))
                .ToListAsync();
            return Results.Ok(quartets);
        })
        .WithTags("Quartet").WithName("GetMyQuartets").RequireAuthorization();

        app.MapGet("/api/quartets/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartet = await db.Quartets
                .Include(q => q.Members).ThenInclude(qm => qm.Singer)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (quartet is null) return Results.NotFound();
            if (!quartet.Members.Any(qm => qm.SingerId == singerId)) return Results.Forbid();
            return Results.Ok(ToDto(quartet));
        })
        .WithTags("Quartet").WithName("GetQuartet").RequireAuthorization();

        app.MapPost("/api/quartets/join/{inviteCode}", async (
            string inviteCode,
            ClaimsPrincipal user,
            AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartet = await db.Quartets.FirstOrDefaultAsync(q => q.InviteCode == inviteCode);
            if (quartet is null) return Results.NotFound("Invalid invite code.");

            // INSERT OR IGNORE is atomic — safe against concurrent duplicate requests
            await db.Database.ExecuteSqlAsync(
                $"INSERT OR IGNORE INTO QuartetMembers (QuartetId, SingerId, IsOwner) VALUES ({quartet.Id}, {singerId}, 0)");

            var members = await db.QuartetMembers
                .Where(qm => qm.QuartetId == quartet.Id)
                .Join(db.Singers, qm => qm.SingerId, s => s.Id,
                      (qm, s) => new QuartetMemberDto(qm.SingerId, s.Nickname ?? s.Name, qm.IsOwner))
                .ToListAsync();

            return Results.Ok(new QuartetDto(quartet.Id, quartet.Name, quartet.InviteCode, members));
        })
        .WithTags("Quartet").WithName("JoinQuartet").RequireAuthorization();

        app.MapGet("/api/quartets/{id:int}/songs", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartet = await db.Quartets
                .Include(q => q.Members)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (quartet is null) return Results.NotFound();
            if (!quartet.Members.Any(qm => qm.SingerId == singerId)) return Results.Forbid();

            var singerIds = quartet.Members.Select(qm => qm.SingerId).ToArray();
            var entries = await db.SingerSongs
                .Where(ss => singerIds.Contains(ss.SingerId))
                .Include(ss => ss.Song)
                .Include(ss => ss.Singer)
                .ToListAsync();

            var singers = entries.Select(ss => ss.Singer).DistinctBy(s => s.Id).ToList();
            var rawNames = singers.ToDictionary(s => s.Id, s => s.Nickname ?? s.Name);
            var nameCounts = rawNames.Values.GroupBy(n => n).ToDictionary(g => g.Key, g => g.Count());
            var displayName = singers.ToDictionary(
                s => s.Id,
                s => nameCounts[rawNames[s.Id]] > 1
                    ? AppendLastName(rawNames[s.Id], s.Name)
                    : rawNames[s.Id]);

            var songs = entries
                .GroupBy(ss => ss.Song.Title)
                .Select(g =>
                {
                    var cov = new Dictionary<Part, List<int>>
                    {
                        [Part.Tenor]    = g.Where(ss => ss.Part == Part.Tenor).Select(ss => ss.SingerId).ToList(),
                        [Part.Lead]     = g.Where(ss => ss.Part == Part.Lead).Select(ss => ss.SingerId).ToList(),
                        [Part.Baritone] = g.Where(ss => ss.Part == Part.Baritone).Select(ss => ss.SingerId).ToList(),
                        [Part.Bass]     = g.Where(ss => ss.Part == Part.Bass).Select(ss => ss.SingerId).ToList(),
                    };
                    PropagateConstraints(cov);
                    var song = g.First().Song;
                    return new QuartetSongDto(
                        g.Key, song.Arranger, song.Voicing,
                        new PartCoverageDto(
                            cov[Part.Tenor].Select(id => displayName[id]),
                            cov[Part.Lead].Select(id => displayName[id]),
                            cov[Part.Baritone].Select(id => displayName[id]),
                            cov[Part.Bass].Select(id => displayName[id])),
                        cov.Values.All(s => s.Count > 0));
                })
                .OrderByDescending(s => s.IsComplete)
                .ThenBy(s => s.Title)
                .ToList();

            return Results.Ok(songs);
        })
        .WithTags("Quartet").WithName("GetQuartetSongCoverage").RequireAuthorization();

        return app;
    }

    private static int GetSingerId(ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static string AppendLastName(string display, string fullName)
    {
        var lastName = fullName.Trim().Split(' ')[^1];
        return display.EndsWith(lastName) ? display : $"{display} {lastName}";
    }

    private static void PropagateConstraints(Dictionary<Part, List<int>> cov)
    {
        var parts = new[] { Part.Tenor, Part.Lead, Part.Baritone, Part.Bass };
        bool changed = true;
        while (changed)
        {
            changed = false;
            foreach (var part in parts)
            {
                if (cov[part].Count != 1) continue;
                var locked = cov[part][0];
                foreach (var other in parts)
                {
                    if (other != part && cov[other].Remove(locked))
                        changed = true;
                }
            }
        }
    }

    private static QuartetDto ToDto(Quartet quartet) =>
        new(quartet.Id, quartet.Name, quartet.InviteCode,
            quartet.Members.Select(qm => new QuartetMemberDto(qm.SingerId, qm.Singer.Nickname ?? qm.Singer.Name, qm.IsOwner)));
}
