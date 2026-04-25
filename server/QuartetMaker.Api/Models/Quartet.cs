namespace QuartetMaker.Api.Models;

public class Quartet
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public ICollection<QuartetMember> Members { get; set; } = [];
}
