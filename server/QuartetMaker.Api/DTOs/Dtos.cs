using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.DTOs;

public record SingerSummaryDto(int Id, string Name, int SongCount);

public record RepertoireEntryDto(int SongId, string SongTitle, Part Part, string? Arranger, Voicing? Voicing);

public record SingerDto(int Id, string Name, IEnumerable<RepertoireEntryDto> Repertoire);

public record AddSongRequest(string SongTitle, Part Part, string? Arranger, Voicing? Voicing);

public record PartCoverageDto(
    IEnumerable<string> Tenor,
    IEnumerable<string> Lead,
    IEnumerable<string> Baritone,
    IEnumerable<string> Bass);

public record QuartetSongDto(string Title, string? Arranger, Voicing? Voicing, PartCoverageDto Coverage, bool IsComplete);

public record SongSummaryDto(int Id, string Title, string? Arranger, Voicing? Voicing);

public record GoogleLoginRequest(string IdToken);

public record LoginResponse(string Token, int SingerId, string Name);
