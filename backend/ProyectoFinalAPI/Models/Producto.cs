using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoFinalAPI.Models;

public class Producto
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Nombre { get; set; }

    [Required]
    public decimal Precio { get; set; }

    [Required]
    public int Stock { get; set; }

    // Llaves foráneas
    public int CategoriaId { get; set; }
    public int ProveedorId { get; set; }

    // Navegación
    [ForeignKey(nameof(CategoriaId))]
    public Categoria Categoria { get; set; } = null!;

    [ForeignKey(nameof(ProveedorId))]
    public Proveedor Proveedor { get; set; } = null!;

    // Relación con DetalleVenta
    public ICollection<DetalleVenta> DetallesVenta { get; set; } = new List<DetalleVenta>();
}