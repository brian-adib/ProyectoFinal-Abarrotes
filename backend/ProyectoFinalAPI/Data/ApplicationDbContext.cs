using Microsoft.EntityFrameworkCore;
using ProyectoFinalAPI.Models;

namespace ProyectoFinalAPI.Data;

public class ApplicationDbContext : DbContext
{
	public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
		: base(options)
	{
	}

	public DbSet<Categoria> Categorias { get; set; }
	public DbSet<Proveedor> Proveedores { get; set; }
	public DbSet<Producto> Productos { get; set; }
	public DbSet<Usuario> Usuarios { get; set; }
	public DbSet<Venta> Ventas { get; set; }
	public DbSet<DetalleVenta> DetallesVenta { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<Producto>()
			.Property(p => p.Precio)
			.HasPrecision(18, 2);

		modelBuilder.Entity<Venta>()
			.Property(v => v.Total)
			.HasPrecision(18, 2);

		modelBuilder.Entity<DetalleVenta>()
			.Property(d => d.PrecioUnitario)
			.HasPrecision(18, 2);
	}
}