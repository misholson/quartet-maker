using System.Collections.Generic;

public class ArrangementList
{
    public int ID { get; set; }

    public String? Name { get; set; }

    public String? Description { get; set; }

    public ICollection<Arrangement>? Arrangements { get; }
}