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
            .Select(p => new ProductoDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Precio = p.Precio,
                Stock = p.Stock,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                ProveedorId = p.ProveedorId,
                ProveedorNombre = p.Proveedor.Nombre
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
            .Select(p => new ProductoDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Precio = p.Precio,
                Stock = p.Stock,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                ProveedorId = p.ProveedorId,
                ProveedorNombre = p.Proveedor.Nombre
            })
            .FirstOrDefaultAsync();

        if (producto == null)
            return NotFound();

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
            .Select(p => new ProductoDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Precio = p.Precio,
                Stock = p.Stock,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre
            })
            .ToListAsync();

        return Ok(productos);
    }

    // POST: api/productos
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CrearProductoDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var categoria = await _context.Categorias.FindAsync(dto.CategoriaId);
        var proveedor = await _context.Proveedores.FindAsync(dto.ProveedorId);

        if (categoria == null)
            return BadRequest("Categoría no válida");

        if (proveedor == null)
            return BadRequest("Proveedor no válido");

        var producto = new Producto
        {
            Nombre = dto.Nombre,
            Precio = dto.Precio,
            Stock = dto.Stock,
            CategoriaId = dto.CategoriaId,
            ProveedorId = dto.ProveedorId
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        var result = new ProductoDto
        {
            Id = producto.Id,
            Nombre = producto.Nombre,
            Precio = producto.Precio,
            Stock = producto.Stock,
            CategoriaId = producto.CategoriaId,
            CategoriaNombre = categoria.Nombre,
            ProveedorId = producto.ProveedorId,
            ProveedorNombre = proveedor.Nombre
        };

        return CreatedAtAction(nameof(GetById), new { id = producto.Id }, result);
    }

    // PUT: api/productos/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CrearProductoDto dto)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto == null)
            return NotFound();

        producto.Nombre = dto.Nombre;
        producto.Precio = dto.Precio;
        producto.Stock = dto.Stock;
        producto.CategoriaId = dto.CategoriaId;
        producto.ProveedorId = dto.ProveedorId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH: api/productos/{id}/stock
    [HttpPatch("{id}/stock")]
    [Authorize(Roles = "Admin,Almacenista")]
    public async Task<IActionResult> AjustarStock(int id, [FromQuery] int cantidad)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto == null)
            return NotFound();

        producto.Stock += cantidad;

        if (producto.Stock < 0)
            producto.Stock = 0;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            producto.Id,
            producto.Nombre,
            producto.Stock
        });
    }

    // DELETE: api/productos/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto == null)
            return NotFound();

        _context.Productos.Remove(producto);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}