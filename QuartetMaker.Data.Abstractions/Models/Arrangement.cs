using System.Collections.Generic;

public class Arrangement
{
    public int ID { get; set; }

    public int BHSCatalogID { get; set; }

    public Song? Song { get; set; }

    public Arranger? Arranger { get; set; }

    public ICollection<ArrangementList>? MemberOfLists { get; }
}