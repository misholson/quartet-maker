using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.DTOs;

public record SingerSummaryDto(int Id, string Name, int SongCount);

public record RepertoireEntryDto(int SongId, string SongTitle, Part Part, string? Arranger, Voicing? Voicing);

public record SingerDto(int Id, string Name, Part? PreferredPart, IEnumerable<RepertoireEntryDto> Repertoire);
public record SetPreferredPartRequest(Part? Part);

public record AddSongRequest(string SongTitle, Part Part, string? Arranger, Voicing? Voicing);

public record PartCoverageDto(
    IEnumerable<string> Tenor,
    IEnumerable<string> Lead,
    IEnumerable<string> Baritone,
    IEnumerable<string> Bass);

public record QuartetSongDto(string Title, string? Arranger, Voicing? Voicing, PartCoverageDto Coverage, bool IsComplete);

public record SongSummaryDto(int Id, string Title, string? Arranger, Voicing? Voicing);

public record CreateQuartetRequest(string Name);
public record QuartetMemberDto(int SingerId, string Name, bool IsOwner);
public record QuartetDto(int Id, string Name, string InviteCode, IEnumerable<QuartetMemberDto> Members);
public record QuartetSummaryDto(int Id, string Name, int MemberCount);

public record GoogleLoginRequest(string IdToken);

public record LoginResponse(string Token, int SingerId, string Name);
