using System.Collections.Generic;

public class User
{
    public int ID { get; set; }

    public string Name { get; set; }

    public string Email { get; set; }

    public Part? PreferredPart { get; set; }

    public ICollection<KnownArrangement> Arrangements { get; }
}