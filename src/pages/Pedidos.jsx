import { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import TarjetaResumen from "../components/TarjetaResumen";
export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
const [pedidosPorPagina, setPedidosPorPagina] = useState(8); 




  // 📌 Filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [fechaInicio] = useState("");
  const [fechaFin] = useState("");
  const [busquedaProducto] = useState("");
  const [precioMin] = useState("");
  const [precioMax] = useState("");
  

  const navigate = useNavigate();

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const response = await api.get("/pedidos");
      setPedidos(response.data);
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      setError("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

 
  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    try {
      console.log(
        "📌 Enviando actualización de estado:",
        pedidoId,
        nuevoEstado
      );

      const response = await api.put(`/pedidos/${pedidoId}/estado`, {
        estado: nuevoEstado, 
      });

      console.log("✅ Respuesta del servidor:", response.data);

      toast.success(`Estado actualizado a "${nuevoEstado}"`);
      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido
        )
      );
    } catch (error) {
      console.error("❌ Error al actualizar el estado del pedido:", error);
      console.error("📌 Detalles del error:", error.response?.data || error);
      toast.error("❌ No se pudo actualizar el estado");
    }
  };

  
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const fechaPedido = new Date(p.fecha);
      return (
        (!filtroEstado || p.estado === filtroEstado) &&
        (!filtroTipo || p.tipo === filtroTipo) && 
        (!fechaInicio || fechaPedido >= new Date(fechaInicio)) &&
        (!fechaFin || fechaPedido <= new Date(fechaFin)) &&
        (!precioMin || p.total >= Number(precioMin)) &&
        (!precioMax || p.total <= Number(precioMax)) &&
        (!busquedaProducto ||
          p.detallepedidos.some((detalle) =>
            detalle.productos?.nombre
              .toLowerCase()
              .includes(busquedaProducto.toLowerCase())
          ))
      );
    });
  }, [
    pedidos,
    filtroEstado,
    filtroTipo,
    fechaInicio,
    fechaFin,
    precioMin,
    precioMax,
    busquedaProducto,
  ]);

  useEffect(() => {
    const calcularPedidosPorPantalla = () => {
      const alturaDisponible = window.innerHeight;
      const alturaCabecera = 290; 
      const alturaTarjeta = 180;  
      const filasVisibles = Math.floor((alturaDisponible - alturaCabecera) / alturaTarjeta);
      setPedidosPorPagina(Math.max(filasVisibles, 4)); 
    };
  
    calcularPedidosPorPantalla();
    window.addEventListener("resize", calcularPedidosPorPantalla);
  
    return () => window.removeEventListener("resize", calcularPedidosPorPantalla);
  }, []);
  
  const indiceInicial = (pagina - 1) * pedidosPorPagina;
const pedidosPaginados = pedidosFiltrados.slice(
  indiceInicial,
  indiceInicial + pedidosPorPagina
);

useEffect(() => {
  setPagina(1);
}, [filtroEstado, filtroTipo]);
const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-teal-400"
        >
          📑 Cargando Pedidos...
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 120,
          }}
        >
          <svg
            className="w-12 h-12 text-teal-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </motion.div>

        <p className="text-gray-400 text-sm">Preparando tus pedidos...</p>
      </div>
    );

  if (error)
    return <p className="text-red-500 text-center text-lg py-6">{error}</p>;

  return (
    <div className="w-full min-h-screen bg-black flex justify-center pt-10">
      <div className="p-8 max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-teal-400 mb-6 text-left">
          📑 Mis Pedidos
        </h1>
        <TarjetaResumen />

        {/* 📌 Botón para ir a la página de crear pedido */}
        <button
          onClick={() => navigate("/crear-pedido")}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
        >
          ➕ Crear Nuevo Pedido
        </button>

        {/* 📌 Filtros de búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
          >
            <option value="">📁 Todos los Estados</option>
            <option value="pendiente">🟡 Pendiente</option>
            <option value="recibido">📦 Recibido</option>
            <option value="pagado">💳 Pagado </option>
            <option value="cancelado">❌ Cancelado</option>
          </select>

          {/* 🔹 Nuevo filtro por tipo de pedido */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
          >
            <option value="">📦 Todos los Tipos</option>
            <option value="entrada">📥 Entrada</option>
            <option value="salida">🚀 Salida</option>
          </select>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="text-gray-400 text-center text-lg">
            No hay pedidos que coincidan con los filtros aplicados.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {pedidosPaginados.map((pedido) => {
 const esFinalizado = pedido.estado === "pagado" || pedido.estado === "recibido";
 const esCancelado = pedido.estado === "cancelado";
 const esPendiente = pedido.estado === "pendiente";
 const esPagado = pedido.estado === "pagado";
 const esRecibido = pedido.estado === "recibido";
 
 return (
   <motion.div
     key={pedido.id}
     className={`p-5 bg-gray-900 rounded-lg shadow-lg transition-all duration-300 border
       ${esCancelado ? "opacity-50 pointer-events-none border-gray-700" : ""}
       ${esPendiente ? "border-yellow-400 shadow-[0_0_10px_2px_#facc15] animate-[pulse_3.5s_ease-in-out_infinite]" : ""}
       ${esPagado ? "border-blue-500 shadow-[0_0_10px_2px_#4ade80]" : ""}
       ${esRecibido ? "border-green-500 shadow-[0_0_8px_2px_#60a5fa]" : ""}
       ${!esPendiente && !esPagado && !esRecibido && !esCancelado ? "border-gray-700" : ""}
     `}
   >
 

      <h2 className="text-xl font-semibold text-teal-400">
        📦 Pedido #{pedido.id}
      </h2>
      <p className="text-gray-400">
        📅 {new Date(pedido.fecha).toLocaleDateString()}
      </p>
      <p className="text-gray-400">
        📦 Tipo: {pedido.tipo === "entrada" ? "📥 Entrada" : "🚀 Salida"}
      </p>
      <p className="font-bold text-lg text-green-400">
        💰 Total: ${pedido.total.toFixed(2)}
      </p>

      {/* Lista de productos */}
      <div className="mt-4">
        <h3 className="text-white font-semibold mb-1">🧾 Productos:</h3>
        <ul className="list-disc list-inside text-gray-300 text-sm">
          {pedido.detallepedidos.map((detalle) => (
            <li key={detalle.id}>
              {detalle.productos?.nombre} × {detalle.cantidad}
            </li>
          ))}
        </ul>
      </div>

      {/* Estado del pedido */}
      <div className="mt-3">
        <label className="font-semibold text-white">Estado: </label>
        <select
          className="ml-2 p-2 border border-gray-700 bg-gray-800 text-white rounded-lg cursor-pointer focus:ring-2 focus:ring-teal-400 disabled:opacity-50"
          value={pedido.estado}
          onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
          disabled={esFinalizado || esCancelado}
        >
          {pedido.tipo === "entrada" ? (
            <>
              <option value="pendiente">🟡 Pendiente</option>
              <option value="recibido">📦 Recibido</option>
              <option value="cancelado">❌ Cancelado</option>
            </>
          ) : (
            <>
              <option value="pendiente">🟡 Pendiente</option>
              <option value="pagado">💳 Pagado (vendido)</option>
              <option value="cancelado">❌ Cancelado</option>
            </>
          )}
        </select>
      </div>
    </motion.div>
  );
})}

        </div>
        
        )}
   <div className="flex justify-center mt-6 space-x-2 flex-wrap">
  {/* ⬅ Botón anterior */}
  {pagina > 1 && (
    <button
      className="px-3 py-1 bg-gray-700 text-white rounded-md cursor-pointer"
      onClick={() => setPagina(pagina - 1)}
    >
      ←
    </button>
  )}
  {/* Botones dinámicos */}
  {Array.from({ length: totalPaginas }).map((_, index) => {
    const num = index + 1;
    const mostrar =
      num === 1 ||
      num === totalPaginas ||
      (num >= pagina - 1 && num <= pagina + 1);

    const mostrarPuntosInicio = index === 1 && pagina > 3;
    const mostrarPuntosFinal = index === totalPaginas - 2 && pagina < totalPaginas - 2;

    return mostrar ? (
      <button
        key={num}
        onClick={() => setPagina(num)}
        className={`px-3 py-2 rounded-md ${
          pagina === num ? "bg-teal-500 text-black" : "bg-gray-700 text-white"
        } transition cursor-pointer`}
      >
        {num}
      </button>
    ) : mostrarPuntosInicio || mostrarPuntosFinal ? (
      <span key={`dots-${num}`} className="px-2 text-white">
        ...
      </span>
    ) : null;
  })}

  {/* ➡ Botón siguiente */}
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
  );
}
