public class Delivery
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Supplier { get; set; } = "";
    public string Eta { get; set; } = "";
    public string ItemId { get; set; } = "";
    public string ItemName { get; set; } = "";
    public int Quantity { get; set; }
    public double UnitCost { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Scheduled;
}
 