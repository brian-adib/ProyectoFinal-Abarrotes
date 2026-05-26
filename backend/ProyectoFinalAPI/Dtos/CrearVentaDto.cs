using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProyectoFinalAPI.Dtos;

public class CrearVentaDto
{
    [Required]
    public List<CrearDetalleVentaDto> Detalles { get; set; } = new();
}

public class CrearDetalleVentaDto
{
    [Required]
    public int ProductoId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }
}