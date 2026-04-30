using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=stock.db";
var frontendOrigin = builder.Configuration["FrontendOrigin"];
var allowedOrigins = new[]
{
    "http://localhost:5173",
    "http://localhost:5213",
    frontendOrigin
}
.Where(origin => !string.IsNullOrWhiteSpace(origin))
.Select(origin => origin!)
.Distinct()
.ToArray();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// ── Seed database on first run ────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.Migrate();

    if (!db.InventoryItems.Any())
    {
        db.InventoryItems.AddRange(
            new InventoryItem { Id = "house-burger", Name = "House Burger", Category = "Food & Dishes", Unit = "plates", Location = "Kitchen Pass", Supplier = "Farmhouse Foods", SellPrice = 14, CostPrice = 4.8, InStock = 36, ParLevel = 48, DailySold = 26, LastDelivery = "Today, 06:45" },
            new InventoryItem { Id = "loaded-fries", Name = "Loaded Fries", Category = "Food & Dishes", Unit = "plates", Location = "Kitchen Pass", Supplier = "Farmhouse Foods", SellPrice = 9.5, CostPrice = 2.9, InStock = 42, ParLevel = 40, DailySold = 19, LastDelivery = "Today, 06:45" },
            new InventoryItem { Id = "caesar-salad", Name = "Caesar Salad", Category = "Food & Dishes", Unit = "bowls", Location = "Prep Station", Supplier = "Greens Market", SellPrice = 11, CostPrice = 3.4, InStock = 18, ParLevel = 24, DailySold = 12, LastDelivery = "Today, 05:50" },
            new InventoryItem { Id = "chicken-wings", Name = "Crispy Chicken Wings", Category = "Food & Dishes", Unit = "portions", Location = "Kitchen Pass", Supplier = "Farmhouse Foods", SellPrice = 12, CostPrice = 3.8, InStock = 28, ParLevel = 40, DailySold = 22, LastDelivery = "Today, 06:45" },
            new InventoryItem { Id = "nachos", Name = "Bar Nachos", Category = "Food & Dishes", Unit = "portions", Location = "Kitchen Pass", Supplier = "Farmhouse Foods", SellPrice = 8.5, CostPrice = 2.2, InStock = 55, ParLevel = 40, DailySold = 14, LastDelivery = "Yesterday, 07:00" },
            new InventoryItem { Id = "house-vodka", Name = "House Vodka", Category = "Spirits", Unit = "shots", Location = "Back Bar", Supplier = "Prime Spirits Ltd.", SellPrice = 6.5, CostPrice = 1.8, InStock = 140, ParLevel = 120, DailySold = 42, LastDelivery = "Yesterday, 13:25" },
            new InventoryItem { Id = "london-gin", Name = "London Dry Gin", Category = "Spirits", Unit = "shots", Location = "Back Bar", Supplier = "Prime Spirits Ltd.", SellPrice = 7, CostPrice = 2.1, InStock = 76, ParLevel = 90, DailySold = 28, LastDelivery = "Yesterday, 13:25" },
            new InventoryItem { Id = "aged-whiskey", Name = "Aged Whiskey", Category = "Spirits", Unit = "pours", Location = "Reserve Shelf", Supplier = "Royal Cask Supply", SellPrice = 12, CostPrice = 3.6, InStock = 52, ParLevel = 60, DailySold = 15, LastDelivery = "2 days ago" },
            new InventoryItem { Id = "dark-rum", Name = "Dark Rum", Category = "Spirits", Unit = "shots", Location = "Back Bar", Supplier = "Prime Spirits Ltd.", SellPrice = 6.5, CostPrice = 1.7, InStock = 95, ParLevel = 80, DailySold = 18, LastDelivery = "2 days ago" },
            new InventoryItem { Id = "silver-tequila", Name = "Silver Tequila", Category = "Spirits", Unit = "shots", Location = "Back Bar", Supplier = "Prime Spirits Ltd.", SellPrice = 7, CostPrice = 2.0, InStock = 60, ParLevel = 80, DailySold = 24, LastDelivery = "Yesterday, 13:25" },
            new InventoryItem { Id = "house-red", Name = "House Red Wine", Category = "Wines", Unit = "glasses", Location = "Wine Rack", Supplier = "Vino Select", SellPrice = 8, CostPrice = 2.2, InStock = 88, ParLevel = 96, DailySold = 34, LastDelivery = "Yesterday, 10:00" },
            new InventoryItem { Id = "house-white", Name = "House White Wine", Category = "Wines", Unit = "glasses", Location = "Wine Rack", Supplier = "Vino Select", SellPrice = 8, CostPrice = 2.0, InStock = 72, ParLevel = 96, DailySold = 30, LastDelivery = "Yesterday, 10:00" },
            new InventoryItem { Id = "prosecco", Name = "Prosecco", Category = "Wines", Unit = "glasses", Location = "Wine Rack", Supplier = "Vino Select", SellPrice = 10, CostPrice = 3.0, InStock = 48, ParLevel = 60, DailySold = 20, LastDelivery = "2 days ago" },
            new InventoryItem { Id = "rose-wine", Name = "Rosé Wine", Category = "Wines", Unit = "glasses", Location = "Wine Rack", Supplier = "Vino Select", SellPrice = 9, CostPrice = 2.5, InStock = 40, ParLevel = 48, DailySold = 16, LastDelivery = "2 days ago" },
            new InventoryItem { Id = "lager-draft", Name = "Draft Lager (Pint)", Category = "Beers & Ciders", Unit = "pints", Location = "Tap Room", Supplier = "Harbor Beverage Co.", SellPrice = 5.5, CostPrice = 1.2, InStock = 220, ParLevel = 240, DailySold = 120, LastDelivery = "Today, 08:30" },
            new InventoryItem { Id = "craft-ipa", Name = "Craft IPA Bottle", Category = "Beers & Ciders", Unit = "bottles", Location = "Cold Room A", Supplier = "Hop & Barrel Co.", SellPrice = 6, CostPrice = 1.9, InStock = 84, ParLevel = 96, DailySold = 38, LastDelivery = "Today, 08:30" },
            new InventoryItem { Id = "bottled-cider", Name = "Sparkling Cider", Category = "Beers & Ciders", Unit = "bottles", Location = "Cold Room A", Supplier = "Harbor Beverage Co.", SellPrice = 5, CostPrice = 1.4, InStock = 60, ParLevel = 72, DailySold = 22, LastDelivery = "Today, 08:30" },
            new InventoryItem { Id = "alcohol-free-beer", Name = "Alcohol-Free Beer", Category = "Beers & Ciders", Unit = "bottles", Location = "Cold Room B", Supplier = "Harbor Beverage Co.", SellPrice = 4.5, CostPrice = 1.1, InStock = 36, ParLevel = 48, DailySold = 10, LastDelivery = "Yesterday, 16:10" },
            new InventoryItem { Id = "cola", Name = "Cola (330ml)", Category = "Soft Drinks", Unit = "cans", Location = "Cold Room B", Supplier = "Metro Refreshments", SellPrice = 3, CostPrice = 0.6, InStock = 144, ParLevel = 120, DailySold = 55, LastDelivery = "Yesterday, 16:10" },
            new InventoryItem { Id = "orange-juice", Name = "Fresh Orange Juice", Category = "Soft Drinks", Unit = "glasses", Location = "Cold Room B", Supplier = "Greens Market", SellPrice = 4, CostPrice = 1.2, InStock = 40, ParLevel = 48, DailySold = 22, LastDelivery = "Today, 05:50" },
            new InventoryItem { Id = "sparkling-water", Name = "Sparkling Water", Category = "Soft Drinks", Unit = "bottles", Location = "Cold Room B", Supplier = "Metro Refreshments", SellPrice = 3, CostPrice = 0.5, InStock = 96, ParLevel = 80, DailySold = 30, LastDelivery = "Yesterday, 16:10" },
            new InventoryItem { Id = "tonic-water", Name = "Tonic Water", Category = "Cocktail Mixers", Unit = "cans", Location = "Mixer Station", Supplier = "Metro Refreshments", SellPrice = 2.5, CostPrice = 0.6, InStock = 84, ParLevel = 90, DailySold = 38, LastDelivery = "Yesterday, 16:10" },
            new InventoryItem { Id = "simple-syrup", Name = "Simple Syrup", Category = "Cocktail Mixers", Unit = "bottles (1L)", Location = "Mixer Station", Supplier = "Bartender Supply Co.", SellPrice = 0, CostPrice = 3.2, InStock = 8, ParLevel = 12, DailySold = 0, LastDelivery = "3 days ago" },
            new InventoryItem { Id = "grenadine", Name = "Grenadine Syrup", Category = "Cocktail Mixers", Unit = "bottles", Location = "Mixer Station", Supplier = "Bartender Supply Co.", SellPrice = 0, CostPrice = 4.5, InStock = 6, ParLevel = 8, DailySold = 0, LastDelivery = "4 days ago" },
            new InventoryItem { Id = "espresso", Name = "Espresso Shot", Category = "Hot Beverages", Unit = "cups", Location = "Coffee Station", Supplier = "Café Origin Roasters", SellPrice = 3, CostPrice = 0.45, InStock = 200, ParLevel = 150, DailySold = 65, LastDelivery = "2 days ago" },
            new InventoryItem { Id = "flat-white", Name = "Flat White", Category = "Hot Beverages", Unit = "cups", Location = "Coffee Station", Supplier = "Café Origin Roasters", SellPrice = 4.5, CostPrice = 0.85, InStock = 150, ParLevel = 100, DailySold = 40, LastDelivery = "2 days ago" },
            new InventoryItem { Id = "earl-grey", Name = "Earl Grey Tea", Category = "Hot Beverages", Unit = "cups", Location = "Coffee Station", Supplier = "Tea Traders Ltd.", SellPrice = 3.5, CostPrice = 0.3, InStock = 80, ParLevel = 60, DailySold = 18, LastDelivery = "4 days ago" },
            new InventoryItem { Id = "full-fat-milk", Name = "Full Fat Milk (2L)", Category = "Dairy & Fresh", Unit = "cartons", Location = "Cold Store", Supplier = "Greens Market", SellPrice = 0, CostPrice = 1.8, InStock = 12, ParLevel = 18, DailySold = 0, LastDelivery = "Today, 05:50" },
            new InventoryItem { Id = "double-cream", Name = "Double Cream (500ml)", Category = "Dairy & Fresh", Unit = "cartons", Location = "Cold Store", Supplier = "Greens Market", SellPrice = 0, CostPrice = 2.4, InStock = 6, ParLevel = 10, DailySold = 0, LastDelivery = "Today, 05:50" },
            new InventoryItem { Id = "plant-milk", Name = "Oat Milk (1L)", Category = "Dairy & Fresh", Unit = "cartons", Location = "Cold Store", Supplier = "Greens Market", SellPrice = 0, CostPrice = 2.1, InStock = 8, ParLevel = 12, DailySold = 0, LastDelivery = "Today, 05:50" },
            new InventoryItem { Id = "burger-buns", Name = "Brioche Buns (pack)", Category = "Dry Goods", Unit = "packs", Location = "Dry Store", Supplier = "Farmhouse Foods", SellPrice = 0, CostPrice = 3.5, InStock = 22, ParLevel = 30, DailySold = 0, LastDelivery = "Today, 06:45" },
            new InventoryItem { Id = "table-salt", Name = "Sea Salt (1kg)", Category = "Dry Goods", Unit = "bags", Location = "Dry Store", Supplier = "Premier Wholesale", SellPrice = 0, CostPrice = 1.2, InStock = 5, ParLevel = 8, DailySold = 0, LastDelivery = "5 days ago" },
            new InventoryItem { Id = "cooking-oil", Name = "Vegetable Oil (5L)", Category = "Dry Goods", Unit = "bottles", Location = "Dry Store", Supplier = "Premier Wholesale", SellPrice = 0, CostPrice = 7.5, InStock = 4, ParLevel = 6, DailySold = 0, LastDelivery = "3 days ago" },
            new InventoryItem { Id = "glass-cleaner", Name = "Bar Glass Sanitizer (5L)", Category = "Cleaning & Hygiene", Unit = "containers", Location = "Service Area", Supplier = "CleanPro Supplies", SellPrice = 0, CostPrice = 12, InStock = 3, ParLevel = 5, DailySold = 0, LastDelivery = "6 days ago" },
            new InventoryItem { Id = "floor-cleaner", Name = "Floor Disinfectant (5L)", Category = "Cleaning & Hygiene", Unit = "containers", Location = "Storage Room", Supplier = "CleanPro Supplies", SellPrice = 0, CostPrice = 9.5, InStock = 2, ParLevel = 4, DailySold = 0, LastDelivery = "6 days ago" },
            new InventoryItem { Id = "hand-sanitizer", Name = "Hand Sanitizer (1L)", Category = "Cleaning & Hygiene", Unit = "bottles", Location = "Service Area", Supplier = "CleanPro Supplies", SellPrice = 0, CostPrice = 5.5, InStock = 6, ParLevel = 8, DailySold = 0, LastDelivery = "3 days ago" },
            new InventoryItem { Id = "takeaway-boxes", Name = "Takeaway Boxes (x50)", Category = "Packaging", Unit = "packs", Location = "Storage Room", Supplier = "PackRight Ltd.", SellPrice = 0, CostPrice = 8, InStock = 10, ParLevel = 15, DailySold = 0, LastDelivery = "4 days ago" },
            new InventoryItem { Id = "paper-cups", Name = "Hot Paper Cups (x100)", Category = "Packaging", Unit = "packs", Location = "Coffee Station", Supplier = "PackRight Ltd.", SellPrice = 0, CostPrice = 6.5, InStock = 7, ParLevel = 10, DailySold = 0, LastDelivery = "4 days ago" },
            new InventoryItem { Id = "paper-straws", Name = "Paper Straws (x200)", Category = "Packaging", Unit = "packs", Location = "Bar Counter", Supplier = "PackRight Ltd.", SellPrice = 0, CostPrice = 4, InStock = 5, ParLevel = 8, DailySold = 0, LastDelivery = "5 days ago" }
        );
        db.SaveChanges();
    }

    if (!db.Deliveries.Any())
    {
        db.Deliveries.AddRange(
            new Delivery { Id = "delivery-1", Supplier = "Harbor Beverage Co.", Eta = "Today, 18:00", ItemId = "lager-draft", ItemName = "Draft Lager (Pint)", Quantity = 240, UnitCost = 1.05, Status = DeliveryStatus.EnRoute },
            new Delivery { Id = "delivery-2", Supplier = "Greens Market", Eta = "Tomorrow, 08:00", ItemId = "caesar-salad", ItemName = "Caesar Salad", Quantity = 32, UnitCost = 3.1, Status = DeliveryStatus.Scheduled },
            new Delivery { Id = "delivery-3", Supplier = "Prime Spirits Ltd.", Eta = "Tomorrow, 15:30", ItemId = "london-gin", ItemName = "London Dry Gin", Quantity = 48, UnitCost = 1.95, Status = DeliveryStatus.Scheduled },
            new Delivery { Id = "delivery-4", Supplier = "CleanPro Supplies", Eta = "Tomorrow, 10:00", ItemId = "glass-cleaner", ItemName = "Bar Glass Sanitizer (5L)", Quantity = 6, UnitCost = 11.5, Status = DeliveryStatus.Scheduled }
        );
        db.SaveChanges();
    }

    if (!db.Expenses.Any())
    {
        db.Expenses.AddRange(
            new Expense { Id = "expense-1", Name = "Daily rent allocation", Category = "Rent", Amount = 180, DueLabel = "Today", Recurring = true },
            new Expense { Id = "expense-2", Name = "Utilities and cooling", Category = "Utilities", Amount = 64, DueLabel = "Today", Recurring = true },
            new Expense { Id = "expense-3", Name = "Cleaning supplies restock", Category = "Supplies", Amount = 28, DueLabel = "Today", Recurring = false },
            new Expense { Id = "expense-4", Name = "Live music license", Category = "Marketing", Amount = 55, DueLabel = "This week", Recurring = false },
            new Expense { Id = "expense-5", Name = "Staff wages (part-time)", Category = "Payroll", Amount = 320, DueLabel = "This week", Recurring = true },
            new Expense { Id = "expense-6", Name = "Refrigeration service", Category = "Maintenance", Amount = 95, DueLabel = "This week", Recurring = false }
        );
        db.SaveChanges();
    }
}

app.UseCors();
app.MapControllers();
app.Run();