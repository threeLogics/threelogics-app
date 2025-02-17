import { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";


function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("7");
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    productoId: "",
    tipo: "entrada",
    cantidad: "",
  });


  const fetchMovimientos = async () => {
    try {
      const response = await api.get("/movimientos", {
        params: { categoriaId: filtroCategoria, dias: filtroFecha },
      });
      setMovimientos(response.data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    }
  };


  const fetchProductos = async () => {
    try {
      const response = await api.get("/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };


  const fetchCategorias = async () => {
    try {
      const response = await api.get("/categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };


  useEffect(() => {
    fetchMovimientos();
    fetchProductos();
    fetchCategorias();
  }, []);


  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "cantidad") {
      value = parseInt(value, 10) || "";
    }
    setNuevoMovimiento({ ...nuevoMovimiento, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/movimientos", nuevoMovimiento);
      setNuevoMovimiento({ productoId: "", tipo: "entrada", cantidad: "" });


      if (nuevoMovimiento.tipo === "entrada") {
        toast.success(`✅ Entrada de ${nuevoMovimiento.cantidad} unidades realizada correctamente`);
      } else {
        toast.success(`✅ Salida de ${nuevoMovimiento.cantidad} unidades realizada correctamente`);
      }


      await fetchMovimientos();
      await fetchProductos();
    } catch (error) {
      toast.error(error.response?.data?.error || "❌ Error al registrar el movimiento");
    }
  };


  const movimientosFiltrados = movimientos.filter((mov) => {
    const fechaMovimiento = new Date(mov.fecha);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - parseInt(filtroFecha));


    return (
      (!filtroCategoria || Number(mov.Producto?.categoriaId) === Number(filtroCategoria)) &&
      fechaMovimiento >= fechaLimite
    );
  });


  const descargarMovimientos = () => {
    window.location.href = `${api.defaults.baseURL}/movimientos/descargar`;
  };


  return (
    <div className="w-full min-h-screen bg-black flex justify-center pt-10">
      <div className="p-6 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-400">📜 Historial de Movimientos</h1>
        </div>


        {/* Formulario de Nuevo Movimiento */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-teal-400 mb-4">➕ Registrar Movimiento</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="productoId"
              value={nuevoMovimiento.productoId}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md"
              required
            >
              <option value="">📦 Seleccione un producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} (Stock: {producto.cantidad})
                </option>
              ))}
            </select>
            <select
              name="tipo"
              value={nuevoMovimiento.tipo}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md"
            >
              <option value="entrada">📥 Entrada</option>
              <option value="salida">📤 Salida</option>
            </select>
            <input
              type="number"
              name="cantidad"
              placeholder="🔢 Cantidad"
              value={nuevoMovimiento.cantidad}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition cursor-pointer"
            >
              ✅ Registrar
            </button>
            <button
            onClick={descargarMovimientos}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition cursor-pointer"
          >
            📥 Descargar CSV
          </button>
          </form>
        </div>


        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md"
          >
            <option value="">📁 Todas las Categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md"
          >
            <option value="7">📅 Últimos 7 días</option>
            <option value="30">📅 Últimos 30 días</option>
            <option value="90">📅 Últimos 3 meses</option>
            <option value="">📅 Todos</option>
          </select>
        </div>


        {/* Tabla de Movimientos */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border-collapse bg-gray-800 text-white rounded-lg">
            <thead className="bg-gray-900">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Producto</th>
                <th className="border px-4 py-2">Tipo</th>
                <th className="border px-4 py-2">Cantidad</th>
                <th className="border px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.length > 0 ? (
                movimientosFiltrados.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-700 transition">
                    <td className="border px-4 py-2">{mov.id}</td>
                    <td className="border px-4 py-2">{mov.Producto ? mov.Producto.nombre : "N/A"}</td>
                    <td className={`border px-4 py-2 ${mov.tipo === "entrada" ? "text-green-400" : "text-red-400"}`}>
                      {mov.tipo}
                    </td>
                    <td className="border px-4 py-2">{mov.cantidad}</td>
                    <td className="border px-4 py-2">{new Date(mov.fecha).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border px-4 py-2 text-center text-gray-400">
                    No hay movimientos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export default Movimientos;