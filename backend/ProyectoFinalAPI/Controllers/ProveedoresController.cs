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
public class ProveedoresController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProveedoresController(ApplicationDbContext context) => _context = context;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var proveedores = await _context.Proveedores
            .Select(p => new ProveedorDto { Id = p.Id, Nombre = p.Nombre, Contacto = p.Contacto })
            .ToListAsync();
        return Ok(proveedores);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var proveedor = await _context.Proveedores.FindAsync(id);
        if (proveedor == null) return NotFound();
        return Ok(new ProveedorDto { Id = proveedor.Id, Nombre = proveedor.Nombre, Contacto = proveedor.Contacto });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] ProveedorDto dto)
    {
        var proveedor = new Proveedor { Nombre = dto.Nombre, Contacto = dto.Contacto };
        _context.Proveedores.Add(proveedor);
        await _context.SaveChangesAsync();
        dto.Id = proveedor.Id;
        return CreatedAtAction(nameof(GetById), new { id = proveedor.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ProveedorDto dto)
    {
        var proveedor = await _context.Proveedores.FindAsync(id);
        if (proveedor == null) return NotFound();
        proveedor.Nombre = dto.Nombre;
        proveedor.Contacto = dto.Contacto;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var proveedor = await _context.Proveedores.FindAsync(id);
        if (proveedor == null) return NotFound();
        _context.Proveedores.Remove(proveedor);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
