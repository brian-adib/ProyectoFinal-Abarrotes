using System.ComponentModel.DataAnnotations;

namespace ProyectoFinalAPI.Models;

public class Usuario
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public required string Username { get; set; }

    [Required]
    public required string PasswordHash { get; set; }

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Vendedor"; // Admin, Vendedor, Almacenista

    // Relación con Ventas
    public ICollection<Venta> Ventas { get; set; } = new List<Venta>();
}