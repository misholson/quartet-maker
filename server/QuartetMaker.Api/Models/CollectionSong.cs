namespace QuartetMaker.Api.Models;

public class CollectionSong
{
    public int CollectionId { get; set; }
    public Collection Collection { get; set; } = null!;
    public int SongId { get; set; }
    public Song Song { get; set; } = null!;
}
