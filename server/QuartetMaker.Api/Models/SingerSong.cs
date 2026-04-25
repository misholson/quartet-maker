namespace QuartetMaker.Api.Models;

public class SingerSong
{
    public int SingerId { get; set; }
    public Singer Singer { get; set; } = null!;
    public int SongId { get; set; }
    public Song Song { get; set; } = null!;
    public Part Part { get; set; }
}
