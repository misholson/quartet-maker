using System.Collections.Generic;

public class User
{
    public int ID { get; set; }

    public String? Name { get; set; }

    public String? Email { get; set; }

    public Part? PreferredPart { get; set; }

    public ICollection<KnownArrangement>? Arrangements { get; }
}