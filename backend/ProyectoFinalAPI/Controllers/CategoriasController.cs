using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Data;
using ProyectoFinalAPI.Dtos;
using ProyectoFinalAPI.Models;
using System.Threading.Tasks;

namespace ProyectoFinalAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriasController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var categorias = await _context.Categorias
            .Select(c => new CategoriaDto
            {
                Id = c.Id,
                Nombre = c.Nombre
            })
            .ToListAsync();

        return Ok(categorias);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
            return NotFound();

        return Ok(new CategoriaDto
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CategoriaDto dto)
    {
        var categoria = new Categoria
        {
            Nombre = dto.Nombre
        };

        _context.Categorias.Add(categoria);

        await _context.SaveChangesAsync();

        dto.Id = categoria.Id;

        return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoriaDto dto)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
            return NotFound();

        categoria.Nombre = dto.Nombre;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
            return NotFound();

        _context.Categorias.Remove(categoria);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}