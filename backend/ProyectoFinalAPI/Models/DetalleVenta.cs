using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoFinalAPI.Models;

public class DetalleVenta
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int VentaId { get; set; }

    [Required]
    public int ProductoId { get; set; }

    [Required]
    public int Cantidad { get; set; }

    [Required]
    public decimal PrecioUnitario { get; set; }

    // Propiedad calculada (no se guarda en BD)
    public decimal Subtotal => Cantidad * PrecioUnitario;

    // Relaciones
    [ForeignKey(nameof(VentaId))]
    public Venta Venta { get; set; } = null!;

    [ForeignKey(nameof(ProductoId))]
    public Producto Producto { get; set; } = null!;
}