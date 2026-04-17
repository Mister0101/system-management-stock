using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ExpensesController(AppDbContext db) { _db = db; }

    // GET /api/expenses
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Expenses.ToListAsync());

    // POST /api/expenses
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Expense expense)
    {
        expense.Id = Guid.NewGuid().ToString();
        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
        return Ok(expense);
    }
}
