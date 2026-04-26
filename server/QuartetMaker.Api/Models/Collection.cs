namespace QuartetMaker.Api.Models;

public class Collection
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CreatedById { get; set; }
    public Singer CreatedBy { get; set; } = null!;
    public ICollection<CollectionSong> CollectionSongs { get; set; } = [];
}
