using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Data;
using ProyectoFinalAPI.Dtos;
using ProyectoFinalAPI.Models;    // <-- Agregar esta línea
using System;
using System.Threading.Tasks;

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
            .Select(v => new VentaDto
            {
                Id = v.Id,
                Fecha = v.Fecha,
                Total = v.Total,
                UsuarioId = v.UsuarioId,
                UsuarioNombre = v.Usuario != null ? v.Usuario.Username : string.Empty,
                Detalles = v.DetallesVenta.Select(d => new DetalleVentaDto
                {
                    Id = d.Id,
                    ProductoId = d.ProductoId,
                    ProductoNombre = d.Producto != null ? d.Producto.Nombre : string.Empty,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario
                }).ToList()
            })
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
            .Where(v => v.Id == id)
            .Select(v => new VentaDto
            {
                Id = v.Id,
                Fecha = v.Fecha,
                Total = v.Total,
                UsuarioId = v.UsuarioId,
                UsuarioNombre = v.Usuario != null ? v.Usuario.Username : string.Empty,
                Detalles = v.DetallesVenta.Select(d => new DetalleVentaDto
                {
                    Id = d.Id,
                    ProductoId = d.ProductoId,
                    ProductoNombre = d.Producto != null ? d.Producto.Nombre : string.Empty,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (venta == null) return NotFound();
        return Ok(venta);
    }

    // POST: api/ventas
    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> Create([FromBody] CrearVentaDto request)
    {
        var usuarioIdClaim = User.FindFirst("id") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
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
        await _context.SaveChangesAsync();

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

            producto.Stock -= item.Cantidad;
            total += item.Cantidad * producto.Precio;
        }

        venta.Total = total;
        await _context.SaveChangesAsync();

        // Devolver la venta creada usando DTO
        var ventaCreada = new VentaDto
        {
            Id = venta.Id,
            Fecha = venta.Fecha,
            Total = venta.Total,
            UsuarioId = venta.UsuarioId,
            UsuarioNombre = usuario.Username,
            Detalles = request.Detalles.Select(d => new DetalleVentaDto
            {
                ProductoId = d.ProductoId,
                Cantidad = d.Cantidad,
                PrecioUnitario = _context.Productos.Find(d.ProductoId)?.Precio ?? 0
            }).ToList()
        };
        return CreatedAtAction(nameof(GetById), new { id = venta.Id }, ventaCreada);
    }

    // DELETE: api/ventas/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var venta = await _context.Ventas
            .Include(v => v.DetallesVenta)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (venta == null) return NotFound();

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