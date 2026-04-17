public class InventoryItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string Unit { get; set; } = "";
    public string Location { get; set; } = "";      // ← was missing
    public string Supplier { get; set; } = "";      // ← was missing
    public string LastDelivery { get; set; } = "";  // ← was missing
    public double SellPrice { get; set; }
    public double CostPrice { get; set; }
    public int InStock { get; set; }
    public int ParLevel { get; set; }
    public int DailySold { get; set; }
}