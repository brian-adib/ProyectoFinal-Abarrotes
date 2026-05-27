namespace ProyectoFinalAPI.Dtos;

public class ProductoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public int CategoriaId { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public int ProveedorId { get; set; }
    public string ProveedorNombre { get; set; } = string.Empty;
}