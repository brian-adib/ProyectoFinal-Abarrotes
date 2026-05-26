using System.ComponentModel.DataAnnotations;

namespace ProyectoFinalAPI.Models;

public class Proveedor
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Nombre { get; set; }

    [MaxLength(100)]
    public string Contacto { get; set; } = string.Empty;

    // Relación con Productos
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}