using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Data;
using ProyectoFinalAPI.Models;
using System.Security.Claims;  

namespace ProyectoFinalAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class VentasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VentasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/ventas
    [HttpGet]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> GetAll()
    {
        var ventas = await _context.Ventas
            .Include(v => v.Usuario)
            .Include(v => v.DetallesVenta)
            .ThenInclude(d => d.Producto)
            .ToListAsync();
        return Ok(ventas);
    }

    // GET: api/ventas/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> GetById(int id)
    {
        var venta = await _context.Ventas
            .Include(v => v.Usuario)
            .Include(v => v.DetallesVenta)
            .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (venta == null) return NotFound();
        return Ok(venta);
    }

    // POST: api/ventas
    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> Create([FromBody] VentaRequest request)
    {
        // Obtener el usuario autenticado desde el token
        var usuarioIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (usuarioIdClaim == null) return Unauthorized();

        var usuarioId = int.Parse(usuarioIdClaim.Value);
        var usuario = await _context.Usuarios.FindAsync(usuarioId);
        if (usuario == null) return Unauthorized();

        var venta = new Venta
        {
            Fecha = DateTime.Now,
            UsuarioId = usuarioId,
            Total = 0
        };

        _context.Ventas.Add(venta);
        await _context.SaveChangesAsync(); // Guardar para obtener Id de venta

        decimal total = 0;
        foreach (var item in request.Detalles)
        {
            var producto = await _context.Productos.FindAsync(item.ProductoId);
            if (producto == null)
                return BadRequest($"Producto {item.ProductoId} no existe");
            if (producto.Stock < item.Cantidad)
                return BadRequest($"Stock insuficiente para {producto.Nombre}");

            var detalle = new DetalleVenta
            {
                VentaId = venta.Id,
                ProductoId = item.ProductoId,
                Cantidad = item.Cantidad,
                PrecioUnitario = producto.Precio
            };
            _context.DetallesVenta.Add(detalle);

            // Actualizar stock (módulo inventario integrado)
            producto.Stock -= item.Cantidad;
            total += item.Cantidad * producto.Precio;
        }

        venta.Total = total;
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = venta.Id }, venta);
    }

    // DELETE: api/ventas/{id} (Cancelar venta, reversión de stock)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var venta = await _context.Ventas
            .Include(v => v.DetallesVenta)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (venta == null) return NotFound();

        // Devolver stock de cada producto
        foreach (var detalle in venta.DetallesVenta)
        {
            var producto = await _context.Productos.FindAsync(detalle.ProductoId);
            if (producto != null)
                producto.Stock += detalle.Cantidad;
        }

        _context.Ventas.Remove(venta);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

// DTO auxiliar para recibir los detalles de la venta
public class VentaRequest
{
    public List<DetalleVentaRequest> Detalles { get; set; } = new();
}

public class DetalleVentaRequest
{
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
}
