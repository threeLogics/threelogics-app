import { useEffect, useState, useContext, useMemo } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Productos() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [stockBajo, setStockBajo] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [pagina, setPagina] = useState(1);
  const productosPorPagina = 8;
  const [productoEditado, setProductoEditado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [productosRes, categoriasRes] = await Promise.allSettled([
          api.get("/productos"),
          api.get("/categorias"),
        ]);

        if (productosRes.status === "fulfilled") setProductos(productosRes.value.data);
        if (categoriasRes.status === "fulfilled") setCategorias(categoriasRes.value.data);
      } catch (error) {
        toast.error("❌ Error al obtener los datos.");
      }
    };

    fetchDatos();
  }, []);

  // 🔍 Aplicar filtros con `useMemo` para optimización
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      return (
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        (!filtroCategoria || p.categoriaId == filtroCategoria) &&
        (!stockBajo || p.cantidad <= (p.stockMinimo || 5)) &&
        (!precioMin || p.precio >= Number(precioMin)) &&
        (!precioMax || p.precio <= Number(precioMax))
      );
    });
  }, [productos, busqueda, filtroCategoria, stockBajo, precioMin, precioMax]);

  const toggleSeleccion = (id) => {
    setProductosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const eliminarProductosSeleccionados = async () => {
    if (productosSeleccionados.length === 0) {
      toast.error("❌ Selecciona al menos un producto para eliminar.");
      return;
    }

    if (!window.confirm("¿Estás seguro de eliminar los productos seleccionados?")) return;

    try {
      const eliminaciones = await Promise.allSettled(
        productosSeleccionados.map((id) => api.delete(`/productos/${id}`))
      );

      const eliminadosExitosamente = eliminaciones
        .filter((res) => res.status === "fulfilled")
        .map((_, index) => productosSeleccionados[index]);

      setProductos((prev) => prev.filter((p) => !eliminadosExitosamente.includes(p.id)));
      setProductosSeleccionados([]);
      toast.success(`✅ ${eliminadosExitosamente.length} productos eliminados.`);
    } catch (error) {
      toast.error("❌ Error al eliminar los productos.");
    }
  };

  const indiceInicial = (pagina - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(
    indiceInicial,
    indiceInicial + productosPorPagina
  );

  const abrirModalEdicion = (producto) => {
    setProductoEditado(producto);
    setModalAbierto(true);
  };

  const handleChangeEdicion = (e) => {
    setProductoEditado({ ...productoEditado, [e.target.name]: e.target.value });
  };

  const handleModificarProducto = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/productos/${productoEditado.id}`, productoEditado);
      setProductos((prev) =>
        prev.map((p) => (p.id === productoEditado.id ? { ...p, ...productoEditado } : p))
      );
      setModalAbierto(false);
      toast.success(`✅ Producto "${productoEditado.nombre}" modificado.`);
    } catch (error) {
      toast.error("❌ Error al modificar el producto.");
    }
  };


  return (
    <div className="w-full min-h-screen bg-black flex justify-center pt-10">
      <div className="p-6 max-w-7xl w-full">
        {/* 📌 Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-400">
            {usuario?.rol === "admin"
              ? "📦 Todos los Productos"
              : "📦 Mis Productos"}
          </h1>
          <button
            onClick={() => navigate("/crear-producto")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-md transition cursor-pointer"
          >
            ➕ Añadir Producto
          </button>
        </div>

        {/* 🚨 Alerta de stock bajo */}
        {productos.some((p) => p.cantidad <= (p.stockMinimo || 5)) && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center font-medium">
            ⚠️ ¡Alerta! Algunos productos tienen stock bajo.
          </div>
        )}

        {/* 🔍 Filtros (con fondo oscuro) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          />

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          >
            <option value="">📁 Todas las Categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="💲 Precio mínimo"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          />

          <input
            type="number"
            placeholder="💲 Precio máximo"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          />
        </div>

      {/* 📋 Tabla de productos con fondo oscuro */}
<div className="overflow-x-auto rounded-lg shadow-md">
  {productosSeleccionados.length > 0 && (
    <button
      onClick={eliminarProductosSeleccionados}
      className="mb-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md shadow-md transition cursor-pointer"
    >
      🗑 Eliminar Seleccionados ({productosSeleccionados.length})
    </button>
  )}

<table className="w-full border-collapse bg-gray-800 text-white rounded-lg">
  <thead className="bg-gray-900 text-white">
    <tr>
      <th className="border px-4 py-2">🛠</th>
      <th className="border px-4 py-2">ID</th>
      <th className="border px-4 py-2">Nombre</th>
      <th className="border px-4 py-2">Cantidad</th>
      <th className="border px-4 py-2">Precio U.</th>
      <th className="border px-4 py-2">💰 Total</th>
      {usuario?.rol === "admin" && <th className="border px-4 py-2">Creado por</th>}
      <th className="border px-4 py-2">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {productosPaginados.length > 0 ? (
      productosPaginados.map((producto) => (
        <tr key={producto.id} className="hover:bg-gray-700 transition">
          <td className="border px-4 py-2 text-center">
            <input
              type="checkbox"
              checked={productosSeleccionados.includes(producto.id)}
              onChange={() => toggleSeleccion(producto.id)}
            />
          </td>
          <td className="border px-4 py-2">{producto.id}</td>
          <td className="border px-4 py-2 font-semibold">{producto.nombre}</td>
          <td className="border px-4 py-2">{producto.cantidad}</td>
          <td className="border px-4 py-2">${producto.precio}</td>
          <td className="border px-4 py-2 font-bold text-green-400">${producto.precio * producto.cantidad}</td>
          {usuario?.rol === "admin" && <td className="border px-4 py-2">{producto.Usuario?.nombre || "Desconocido"}</td>}
          <td className="border px-4 py-2 flex gap-2 justify-center">
            <button
              onClick={() => abrirModalEdicion(producto)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded cursor-pointer"
            >
              ✏️ Editar
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="8" className="border px-4 py-2 text-center text-gray-400">
          No hay productos registrados
        </td>
      </tr>
    )}
  </tbody>
</table>

</div>

        {/* 📄 Paginación */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({
            length: Math.ceil(productosFiltrados.length / productosPorPagina),
          }).map((_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-md ${
                pagina === index + 1
                  ? "bg-teal-500 text-black"
                  : "bg-gray-700 text-white"
              } transition`}
              onClick={() => setPagina(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      {/* 🔧 Modal de Edición */}
      {modalAbierto && productoEditado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">✏️ Editar Producto</h2>
            <form onSubmit={handleModificarProducto} className="grid gap-3">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del producto"
                value={productoEditado.nombre}
                onChange={handleChangeEdicion}
                className="border p-2 w-full rounded-md"
                required
              />
              <input
                type="number"
                name="cantidad"
                placeholder="Cantidad"
                value={productoEditado.cantidad}
                onChange={handleChangeEdicion}
                className="border p-2 w-full rounded-md"
                required
              />
              <input
                type="number"
                name="precio"
                placeholder="Precio"
                value={productoEditado.precio}
                onChange={handleChangeEdicion}
                className="border p-2 w-full rounded-md"
                required
              />
          
<select
  name="categoriaId"
  value={productoEditado.categoriaId || ""}
  onChange={handleChangeEdicion}
  className="border p-2 w-full rounded-md"
>
  <option value="" disabled>Selecciona una categoría</option>
  {categorias.map((categoria) => (
    <option key={categoria.id} value={categoria.id}>
      {categoria.nombre}
    </option>
  ))}
</select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
