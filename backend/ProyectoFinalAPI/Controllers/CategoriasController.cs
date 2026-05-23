using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Data;
using ProyectoFinalAPI.Models;

namespace ProyectoFinalAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Requiere autenticación para cualquier acción
public class CategoriasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/categorias
    [HttpGet]
    [AllowAnonymous] // Opcional: cualquiera puede ver las categorías (sin token)
    public async Task<IActionResult> GetAll()
    {
        var categorias = await _context.Categorias.ToListAsync();
        return Ok(categorias);
    }

    // GET: api/categorias/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound(new { mensaje = "Categoría no encontrada" });
        return Ok(categoria);
    }

    // POST: api/categorias
    [HttpPost]
    [Authorize(Roles = "Admin")] // Solo Admin puede crear
    public async Task<IActionResult> Create([FromBody] Categoria categoria)
    {
        if (string.IsNullOrWhiteSpace(categoria.Nombre))
            return BadRequest(new { mensaje = "El nombre es obligatorio" });

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, categoria);
    }

    // PUT: api/categorias/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Categoria categoria)
    {
        if (id != categoria.Id)
            return BadRequest(new { mensaje = "El ID de la ruta no coincide con el objeto" });

        _context.Entry(categoria).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Categorias.AnyAsync(c => c.Id == id))
                return NotFound(new { mensaje = "Categoría no encontrada" });
            throw;
        }
        return NoContent();
    }

    // DELETE: api/categorias/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound(new { mensaje = "Categoría no encontrada" });

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}