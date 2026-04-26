namespace QuartetMaker.Api.Models;

public class QuartetMember
{
    public int QuartetId { get; set; }
    public Quartet Quartet { get; set; } = null!;
    public int SingerId { get; set; }
    public Singer Singer { get; set; } = null!;
    public bool IsOwner { get; set; }
    public DateTime JoinedAt { get; set; }
}
