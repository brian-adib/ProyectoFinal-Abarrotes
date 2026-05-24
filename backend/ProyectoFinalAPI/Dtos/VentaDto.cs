using System;
using System.Collections.Generic;

namespace ProyectoFinalAPI.Dtos;

public class VentaDto
{
	public int Id { get; set; }
	public DateTime Fecha { get; set; }
	public decimal Total { get; set; }
	public int UsuarioId { get; set; }
	public string UsuarioNombre { get; set; } = string.Empty;

	public List<DetalleVentaDto> Detalles { get; set; } = new();
}