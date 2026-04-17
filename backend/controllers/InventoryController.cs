using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _db;
    public InventoryController(AppDbContext db) { _db = db; }

    // GET /api/inventory  ← replaces loadState() in storage.ts
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.InventoryItems.ToListAsync();
        return Ok(items);
    }

    // PUT /api/inventory/{id}/sale
    [HttpPut("{id}/sale")]
    public async Task<IActionResult> RecordSale(string id, [FromBody] int quantity)
    {
        var item = await _db.InventoryItems.FindAsync(id);
        if (item == null) return NotFound();

        item.InStock = Math.Max(0, item.InStock - quantity);
        item.DailySold += quantity;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    // PUT /api/inventory/{id}/restock
    [HttpPut("{id}/restock")]
    public async Task<IActionResult> Restock(string id, [FromBody] int quantity)
    {
        var item = await _db.InventoryItems.FindAsync(id);
        if (item == null) return NotFound();

        item.InStock += quantity;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    // PUT /api/inventory/{id}/stock
    [HttpPut("{id}/stock")]
    public async Task<IActionResult> SetStock(string id, [FromBody] int value)
    {
        var item = await _db.InventoryItems.FindAsync(id);
        if (item == null) return NotFound();

        item.InStock = Math.Max(0, value);
        await _db.SaveChangesAsync();
        return Ok(item);
    }
}