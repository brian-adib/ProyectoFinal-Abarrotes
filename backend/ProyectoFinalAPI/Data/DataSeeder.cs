using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Models;
using System.Text.Json;

namespace ProyectoFinalAPI.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IWebHostEnvironment env)
    {
        if (await context.Productos.AnyAsync()) return;

        var jsonPath = Path.Combine(env.ContentRootPath, "Data", "inventario.json");
        if (!File.Exists(jsonPath)) return;

        var jsonData = await File.ReadAllTextAsync(jsonPath);
        var items = JsonSerializer.Deserialize<List<ProductoJson>>(jsonData);
        if (items == null) return;

        // Obtener o crear categorías y proveedores únicos
        var categorias = items.Select(i => i.Categoria).Distinct()
            .Select(c => new Categoria { Nombre = c }).ToList();
        var proveedores = items.Select(i => i.Proveedor).Distinct()
            .Select(p => new Proveedor { Nombre = p, Contacto = "" }).ToList();

        await context.Categorias.AddRangeAsync(categorias);
        await context.Proveedores.AddRangeAsync(proveedores);
        await context.SaveChangesAsync();

        // Crear productos
        foreach (var item in items)
        {
            var categoria = await context.Categorias.FirstAsync(c => c.Nombre == item.Categoria);
            var proveedor = await context.Proveedores.FirstAsync(p => p.Nombre == item.Proveedor);
            var producto = new Producto
            {
                Nombre = item.Nombre,
                Precio = item.Precio,
                Stock = item.Stock,
                CategoriaId = categoria.Id,
                ProveedorId = proveedor.Id
            };
            context.Productos.Add(producto);
        }
        await context.SaveChangesAsync();
    }

    private class ProductoJson
{
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string Proveedor { get; set; } = string.Empty;
}
}
