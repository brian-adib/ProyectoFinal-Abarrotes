using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Data;
using ProyectoFinalAPI.Models;   // ← ERROR #1 corregido

namespace ProyectoFinalAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/productos
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var productos = await _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Proveedor)
            .Select(p => new 
            {
                p.Id,
                p.Nombre,
                p.Precio,
                p.Stock,
                p.CategoriaId,
                p.ProveedorId,
                Categoria = new { p.Categoria.Id, p.Categoria.Nombre },
                Proveedor = new { p.Proveedor.Id, p.Proveedor.Nombre, p.Proveedor.Contacto }
            })
            .ToListAsync();
        return Ok(productos);
    }

    // GET: api/productos/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var producto = await _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Proveedor)
            .Where(p => p.Id == id)
            .Select(p => new 
            {
                p.Id,
                p.Nombre,
                p.Precio,
                p.Stock,
                p.CategoriaId,
                p.ProveedorId,
                Categoria = new { p.Categoria.Id, p.Categoria.Nombre },
                Proveedor = new { p.Proveedor.Id, p.Proveedor.Nombre, p.Proveedor.Contacto }
            })
            .FirstOrDefaultAsync();
        
        if (producto == null) return NotFound();
        return Ok(producto);
    }

    // GET: api/productos/stockbajo?minimo=5
    [HttpGet("stockbajo")]
    [Authorize(Roles = "Admin,Almacenista")]
    public async Task<IActionResult> GetStockBajo([FromQuery] int minimo = 5)
    {
        var productos = await _context.Productos
            .Where(p => p.Stock < minimo)
            .Include(p => p.Categoria)
            .Select(p => new 
            {
                p.Id,
                p.Nombre,
                p.Precio,
                p.Stock,
                p.CategoriaId,
                Categoria = new { p.Categoria.Id, p.Categoria.Nombre }
            })
            .ToListAsync();
        return Ok(productos);
    }

    // POST: api/productos
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Producto producto)
    {
        if (string.IsNullOrWhiteSpace(producto.Nombre))
            return BadRequest("El nombre es obligatorio");
        if (producto.Precio <= 0)
            return BadRequest("El precio debe ser mayor a 0");
        if (producto.Stock < 0)
            return BadRequest("El stock no puede ser negativo");

        var categoria = await _context.Categorias.FindAsync(producto.CategoriaId);
        var proveedor = await _context.Proveedores.FindAsync(producto.ProveedorId);
        if (categoria == null) return BadRequest("Categoría no válida");
        if (proveedor == null) return BadRequest("Proveedor no válido");

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();
        
        var nuevoProducto = new
        {
            producto.Id,
            producto.Nombre,
            producto.Precio,
            producto.Stock,
            producto.CategoriaId,
            producto.ProveedorId,
            Categoria = new { categoria.Id, categoria.Nombre },
            Proveedor = new { proveedor.Id, proveedor.Nombre }
        };
        return CreatedAtAction(nameof(GetById), new { id = producto.Id }, nuevoProducto);
    }

    // PUT: api/productos/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Producto producto)
    {
        if (id != producto.Id) return BadRequest();

        // ERROR #2 corregido: verificar existencia antes de actualizar
        var productoExistente = await _context.Productos.FindAsync(id);
        if (productoExistente == null) return NotFound();

        _context.Entry(producto).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PATCH: api/productos/{id}/stock?cantidad=10
    [HttpPatch("{id}/stock")]
    [Authorize(Roles = "Admin,Almacenista")]
    public async Task<IActionResult> AjustarStock(int id, [FromQuery] int cantidad)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null) return NotFound();

        producto.Stock += cantidad;
        if (producto.Stock < 0) producto.Stock = 0;

        await _context.SaveChangesAsync();
        return Ok(new { producto.Id, producto.Nombre, producto.Stock });
    }

    // DELETE: api/productos/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null) return NotFound();

        _context.Productos.Remove(producto);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}