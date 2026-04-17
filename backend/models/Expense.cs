
public class Expense
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public double Amount { get; set; }
    public string DueLabel { get; set; } = "";
    public bool Recurring { get; set; } = false;
    
}
 