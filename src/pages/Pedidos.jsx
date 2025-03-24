import { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // ✅ Modificar el estado del pedido desde el frontend
  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    try {
      console.log(
        "📌 Enviando actualización de estado:",
        pedidoId,
        nuevoEstado
      );

      const response = await api.put(`/pedidos/${pedidoId}/estado`, {
        estado: nuevoEstado, // Asegurar que 'estado' se envía correctamente
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

  // ✅ Filtrado optimizado con `useMemo`
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const fechaPedido = new Date(p.fecha);
      return (
        (!filtroEstado || p.estado === filtroEstado) &&
        (!filtroTipo || p.tipo === filtroTipo) && // 🔹 Filtrar por tipo
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

  // ✅ Pantalla de carga con animación
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl"
        >
          🔄 Cargando pedidos...
        </motion.div>
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
            <option value="pagado">💳 Pagado</option>
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
          {pedidosFiltrados.map((pedido) => {
            const esFinalizado = pedido.estado === "pagado" || pedido.estado === "recibido";
            const esCancelado = pedido.estado === "cancelado";
        
            return (
              <motion.div
                key={pedido.id}
                className={`p-5 border border-gray-700 bg-gray-900 rounded-lg shadow-lg transition-all duration-300 ${
                  esCancelado ? "opacity-50 pointer-events-none" : ""
                }`}
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
                        <option value="pagado">💳 Pagado</option>
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
      </div>
    </div>
  );
}
