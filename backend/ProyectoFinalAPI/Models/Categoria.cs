using System.ComponentModel.DataAnnotations;

namespace ProyectoFinalAPI.Models;

public class Categoria
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Nombre { get; set; }

    // Relación con Productos
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}