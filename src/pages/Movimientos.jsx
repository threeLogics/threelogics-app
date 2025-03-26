import { useEffect, useState, useCallback, useMemo , useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import supabase from "../supabaseClient.js";
import { motion } from "framer-motion";
import { api } from "../services/api";

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("7");
  const [filtroTipo, setFiltroTipo] = useState("");
  const { usuario } = useContext(AuthContext);


  // ✅ Obtener movimientos desde Supabase
  const fetchMovimientos = useCallback(async () => {
    try {
      const res = await api.get("/movimientos"); // 👈 Llama a tu endpoint backend
      setMovimientos(res.data);
    } catch (error) {
      console.error("❌ Error al obtener movimientos:", error);
    }
  }, []);

  // ✅ Obtener categorías desde Supabase
  const fetchCategorias = useCallback(async () => {
    // Espera a que AuthContext cargue el usuario
    if (!usuario) return;
  
    try {
      let query = supabase.from("categorias").select("*");
  
      // Solo filtra por usuario si no es admin
      if (usuario.rol !== "admin") {
        query = query.eq("user_id", usuario.id);
      }
  
      const { data, error } = await query;
  
      if (error) {
        console.error("❌ Error al obtener categorías desde Supabase:", error);
      } else {
        setCategorias(data);
      }
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error);
    }
  }, [usuario]);
  
  useEffect(() => {
    if (usuario) {
      fetchMovimientos();
      fetchCategorias();
    }
  }, [fetchMovimientos, fetchCategorias, usuario]);
  

  // ✅ Filtrar movimientos según los filtros seleccionados
  const movimientosFiltrados = useMemo(() => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - parseInt(filtroFecha, 10));

    return movimientos.filter((mov) => {
      const fechaMovimiento = new Date(mov.fecha);
      return (
        (!filtroCategoria || mov.productos?.categoria_id === filtroCategoria) &&
        (!filtroTipo || mov.tipo === filtroTipo) && // 🔹 Filtrar por tipo de movimiento
        fechaMovimiento >= fechaLimite
      );
    });
  }, [movimientos, filtroCategoria, filtroFecha, filtroTipo]);

  return (
    <div className="w-full min-h-screen bg-black flex justify-center pt-12">
      <div className="p-6 max-w-7xl w-full">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 10, transition: { duration: 0.5 } }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl font-bold text-teal-400">
            📜 Historial de Movimientos
          </h1>
        </motion.div>

        {/* 📌 Filtros */}
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

          {/* 🔹 Nuevo filtro por tipo de movimiento */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md"
          >
            <option value="">🔄 Todos los Movimientos</option>
            <option value="entrada">📥 Entrada</option>
            <option value="salida">🚀 Salida</option>
          </select>
        </div>

          {/* Tabla */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border-collapse bg-gray-800 text-white rounded-lg">
            <thead className="bg-gray-900">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Producto</th>
                <th className="border px-4 py-2">Tipo</th>
                <th className="border px-4 py-2">Cantidad</th>
                <th className="border px-4 py-2">Fecha</th>
                {usuario?.rol === "admin" && (
                  <th className="border px-4 py-2">Realizado por</th>
                )}
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.length > 0 ? (
                movimientosFiltrados.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-700 transition">
                    <td className="border px-4 py-2">{mov.id}</td>
                    <td className="border px-4 py-2">
                      {mov.productos ? mov.productos.nombre : "N/A"}
                    </td>
                    <td
                      className={`border px-4 py-2 ${
                        mov.tipo === "entrada"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {mov.tipo === "entrada" ? "📥 Entrada" : "🚀 Salida"}
                    </td>
                    <td className="border px-4 py-2">{mov.cantidad}</td>
                    <td className="border px-4 py-2">
                      {new Date(mov.fecha).toLocaleString()}
                    </td>
                    {usuario?.rol === "admin" && (
                      <td className="border px-4 py-2">
                        {mov.nombreUsuario || "Desconocido"}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={usuario?.rol === "admin" ? 6 : 5}
                    className="border px-4 py-2 text-center text-gray-400"
                  >
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
