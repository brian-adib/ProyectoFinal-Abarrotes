using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoFinalAPI.Models;

public class Venta
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Fecha { get; set; } = DateTime.Now;

    [Required]
    public decimal Total { get; set; }

    public int UsuarioId { get; set; }

    [ForeignKey(nameof(UsuarioId))]
    public Usuario Usuario { get; set; } = null!;

    // Detalles de la venta
    public ICollection<DetalleVenta> DetallesVenta { get; set; } = new List<DetalleVenta>();
}