using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Models;
using System.Text.Json;

namespace ProyectoFinalAPI.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IWebHostEnvironment env)
    {
        try
        {
            // Verificar conexión
            var canConnect = await context.Database.CanConnectAsync();
            Console.WriteLine($"¿Se puede conectar a la base de datos? {canConnect}");
            if (!canConnect)
            {
                Console.WriteLine("ERROR: No se pudo conectar a la base de datos.");
                return;
            }

            await context.Database.ExecuteSqlRawAsync("SELECT 1");
            Console.WriteLine("Conexión exitosa.");

            // *** IMPORTANTE: Evitar reinserción si ya existen productos ***
            if (await context.Productos.AnyAsync())
            {
                Console.WriteLine("Ya existen productos en la base de datos. Seeding omitido.");
                return;
            }

            var jsonPath = Path.Combine(env.ContentRootPath, "Data", "inventario.json");
            if (!File.Exists(jsonPath))
            {
                Console.WriteLine($"ERROR: No se encontró el archivo JSON en: {jsonPath}");
                return;
            }

            var jsonData = await File.ReadAllTextAsync(jsonPath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var items = JsonSerializer.Deserialize<List<ProductoJson>>(jsonData, options);
            if (items == null || items.Count == 0)
            {
                Console.WriteLine("ERROR: El JSON no contiene datos o es inválido.");
                return;
            }

            Console.WriteLine($"Seeding: {items.Count} productos encontrados.");
            Console.WriteLine($"Primer producto: {items[0].Nombre} - {items[0].Precio}");

            var categoriasDict = new Dictionary<string, Categoria>();
            var proveedoresDict = new Dictionary<string, Proveedor>();

            foreach (var item in items)
            {
                // --- Categoría ---
                if (!categoriasDict.TryGetValue(item.Categoria, out var categoria))
                {
                    categoria = await context.Categorias.FirstOrDefaultAsync(c => c.Nombre == item.Categoria);
                    if (categoria == null)
                    {
                        categoria = new Categoria { Nombre = item.Categoria };
                        context.Categorias.Add(categoria);
                        await context.SaveChangesAsync(); // Guardar para obtener ID
                        Console.WriteLine($"Categoría creada: {categoria.Nombre} (ID: {categoria.Id})");
                    }
                    categoriasDict[item.Categoria] = categoria;
                }

                // --- Proveedor ---
                if (!proveedoresDict.TryGetValue(item.Proveedor, out var proveedor))
                {
                    proveedor = await context.Proveedores.FirstOrDefaultAsync(p => p.Nombre == item.Proveedor);
                    if (proveedor == null)
                    {
                        proveedor = new Proveedor { Nombre = item.Proveedor, Contacto = "" };
                        context.Proveedores.Add(proveedor);
                        await context.SaveChangesAsync();
                        Console.WriteLine($"Proveedor creado: {proveedor.Nombre} (ID: {proveedor.Id})");
                    }
                    proveedoresDict[item.Proveedor] = proveedor;
                }

                // --- Producto ---
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

            Console.WriteLine("Guardando productos...");
            await context.SaveChangesAsync();
            Console.WriteLine($"Seeding completado. Total productos insertados: {items.Count}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR en DataSeeder: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Detalle: {ex.InnerException.Message}");
        }
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