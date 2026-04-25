namespace QuartetMaker.Api.Models;

public class Song
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Arranger { get; set; }
    public Voicing? Voicing { get; set; }
    public ICollection<SingerSong> SingerSongs { get; set; } = [];
}
