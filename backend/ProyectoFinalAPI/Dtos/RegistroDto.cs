using System.ComponentModel.DataAnnotations;

namespace ProyectoFinalAPI.Dtos;

public class RegistroDto
{
    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;
    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = "Vendedor"; // Admin, Vendedor, Almacenista
}
