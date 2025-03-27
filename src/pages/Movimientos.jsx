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
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  
  const [movimientosPorPagina, setMovimientosPorPagina] = useState(10);

  

  // ✅ Obtener movimientos desde Supabase
  const fetchMovimientos = useCallback(async () => {
    try {
      const res = await api.get("/movimientos"); // 👈 Llama a tu endpoint backend
      setMovimientos(res.data);
    } catch (error) {
      console.error("❌ Error al obtener movimientos:", error);
    }finally {
      setLoading(false); // 👈 Esto garantiza que el loading se desactive siempre
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

  const indiceInicial = (pagina - 1) * movimientosPorPagina;
  const movimientosPaginados = movimientosFiltrados.slice(
    indiceInicial,
    indiceInicial + movimientosPorPagina
  );
  
useEffect(() => {
  setPagina(1);
}, [filtroCategoria, filtroFecha, filtroTipo]);
useEffect(() => {
  const calcularMovimientosPorPantalla = () => {
    const alturaDisponible = window.innerHeight;
    const alturaCabecera = 230; // Ajusta según tu UI (filtros, títulos...)
    const alturaFila = 50; // Aproximado, puedes ajustar si usas Tailwind
    const filasVisibles = Math.floor((alturaDisponible - alturaCabecera) / alturaFila);
    setMovimientosPorPagina(Math.max(filasVisibles, 5)); // mínimo de 5 filas
  };

  calcularMovimientosPorPantalla();
  window.addEventListener("resize", calcularMovimientosPorPantalla);

  return () => window.removeEventListener("resize", calcularMovimientosPorPantalla);
}, []);

const totalPaginas = Math.ceil(movimientosFiltrados.length / movimientosPorPagina);


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl"
        >
          🔄 Cargando movimientos...
        </motion.div>
      </div>
    ); 

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
                movimientosPaginados.map((mov) => (

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
{/* 📄 Paginación */}
<div className="flex justify-center mt-6 space-x-2">
  {pagina > 1 && (
    <button
      className="px-3 py-1 bg-gray-700 text-white rounded-md cursor-pointer"
      onClick={() => setPagina(pagina - 1)}
    >
      ←
    </button>
  )}

  {Array.from({
    length: totalPaginas,
  }).map((_, index) => {
    const currentPage = index + 1;
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPaginas;
    const isCurrent = currentPage === pagina;
    const isNearCurrent = Math.abs(pagina - currentPage) <= 1;

    if (
      isFirst ||
      isLast ||
      isCurrent ||
      isNearCurrent ||
      (pagina <= 3 && currentPage <= 5) ||
      (pagina >= totalPaginas - 2 && currentPage >= totalPaginas - 4)
    ) {
      return (
        <button
          key={index}
          className={`px-4 py-2 rounded-md transition cursor-pointer ${
            isCurrent ? "bg-teal-500 text-black" : "bg-gray-700 text-white"
          }`}
          onClick={() => setPagina(currentPage)}
        >
          {currentPage}
        </button>
      );
    }

    if (
      (currentPage === pagina - 2 && pagina > 4) ||
      (currentPage === pagina + 2 && pagina < totalPaginas - 3)
    ) {
      return (
        <span key={index} className="px-2 py-2 text-gray-400">
          ...
        </span>
      );
    }

    return null;
  })}

  {pagina < totalPaginas && (
    <button
      className="px-3 py-1 bg-gray-700 text-white rounded-md cursor-pointer"
      onClick={() => setPagina(pagina + 1)}
    >
      →
    </button>
  )}
</div>

        </div>
      </div>
    </div>
  );
}

export default Movimientos;
