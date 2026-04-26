namespace QuartetMaker.Api.Models;

public class Singer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GoogleId { get; set; }
    public string? Email { get; set; }
    public string? Nickname { get; set; }
    public Part? PreferredPart { get; set; }
    public ICollection<SingerSong> SingerSongs { get; set; } = [];
}
