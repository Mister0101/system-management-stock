using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class DeliveriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public DeliveriesController(AppDbContext db) { _db = db; }

    // GET /api/deliveries
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Deliveries.ToListAsync());

    // POST /api/deliveries
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Delivery delivery)
    {
        delivery.Id = Guid.NewGuid().ToString();
        delivery.Status = DeliveryStatus.Scheduled;
        _db.Deliveries.Add(delivery);
        await _db.SaveChangesAsync();
        return Ok(delivery);
    }

    // PUT /api/deliveries/{id}/receive
    [HttpPut("{id}/receive")]
    public async Task<IActionResult> Receive(string id)
    {
        var delivery = await _db.Deliveries.FindAsync(id);
        if (delivery == null) return NotFound();
        if (delivery.Status == DeliveryStatus.Received) return Ok(delivery);

        delivery.Status = DeliveryStatus.Received;

        var item = await _db.InventoryItems.FindAsync(delivery.ItemId);
        if (item != null)
        {
            item.InStock += delivery.Quantity;
            item.LastDelivery = "Just now";
        }

        await _db.SaveChangesAsync();
        return Ok(new { delivery, item });
    }
}
