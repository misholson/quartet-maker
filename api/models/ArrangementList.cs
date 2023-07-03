using System.Collections.Generic;

public class ArrangementList
{
    public int ID { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public ICollection<Arrangement> Arrangements { get; }
}