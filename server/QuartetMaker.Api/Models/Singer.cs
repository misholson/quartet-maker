namespace QuartetMaker.Api.Models;

public class Singer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<SingerSong> SingerSongs { get; set; } = [];
}
