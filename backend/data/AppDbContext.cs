using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    // Each of these becomes a table in the database
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<Delivery> Deliveries { get; set; }
    public DbSet<Expense> Expenses { get; set; }
}