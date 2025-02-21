import { useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Importar para notificaciones
import { motion } from "framer-motion";

export default function Pedidos() {
  const { usuario } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
const [fechaInicio, setFechaInicio] = useState("");
const [fechaFin, setFechaFin] = useState("");
const [busquedaProducto, setBusquedaProducto] = useState("");
const [precioMin, setPrecioMin] = useState("");
const [precioMax, setPrecioMax] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const response = await api.get("/pedidos");
      setPedidos(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
      setError("Error al cargar pedidos");
      setLoading(false);
    }
  };
  const pedidosFiltrados = pedidos.filter((p) => {
    const fechaPedido = new Date(p.fecha);
    return (
      (!filtroEstado || p.estado === filtroEstado) &&
      (!fechaInicio || fechaPedido >= new Date(fechaInicio)) &&
      (!fechaFin || fechaPedido <= new Date(fechaFin)) &&
      (!precioMin || p.total >= Number(precioMin)) &&
      (!precioMax || p.total <= Number(precioMax)) &&
      (!busquedaProducto ||
        p.DetallePedidos.some((detalle) =>
          detalle.Producto?.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
        )
      )
    );
  });
  

    // ✅ Función para actualizar el estado del pedido (Solo Admin)
    const actualizarEstado = async (pedidoId, nuevoEstado) => {
      try {
        await api.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });

        toast.success(`Estado actualizado a "${nuevoEstado}"`);

        // 🔄 ACTUALIZAR el estado del pedido en la lista sin recargar manualmente
        setPedidos((prevPedidos) =>
          prevPedidos.map((pedido) =>
            pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido
          )
        );
      } catch (error) {
        console.error("Error al actualizar el estado del pedido:", error);
        toast.error("Error al actualizar el estado del pedido");
      }
    };

  // ✅ Función para eliminar un pedido (Solo si está "pendiente")
  const eliminarPedido = async (pedidoId) => {
    try {
      await api.delete(`/pedidos/${pedidoId}`);
      toast.success("Pedido eliminado con éxito");
      cargarPedidos(); // Recargar lista después de eliminar
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      toast.error("No se pudo eliminar el pedido");
    }
  };

  const pagarPedido = async (pedidoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}/pagar`);
      toast.success("✅ Pedido pagado con éxito!");
      cargarPedidos(); // 🔄 Refrescar la lista de pedidos
    } catch (error) {
      console.error("❌ Error al pagar el pedido:", error);
      toast.error("❌ No se pudo pagar el pedido");
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
<div className="w-full min-h-screen bg-black flex justify-center pt-10">
  <div className="p-8 max-w-5xl w-full">
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="text-3xl font-bold text-teal-400 mb-6 text-center"
    >
      📦 Mis Pedidos
    </motion.h1>

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
        <option value="pagar">💳 Pagar</option>
        <option value="enviado">📦 Enviado</option>
        <option value="completado">✅ Completado</option>
      </select>

      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
      />
      <input
        type="date"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
      />

      <input
        type="text"
        placeholder="🔍 Buscar producto..."
        value={busquedaProducto}
        onChange={(e) => setBusquedaProducto(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
      />

      <input
        type="number"
        placeholder="💲 Precio mínimo"
        value={precioMin}
        onChange={(e) => setPrecioMin(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
      />

      <input
        type="number"
        placeholder="💲 Precio máximo"
        value={precioMax}
        onChange={(e) => setPrecioMax(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-3 rounded-md"
      />
    </div>

    {pedidosFiltrados.length === 0 ? (
      <p className="text-gray-400 text-center text-lg">
        No hay pedidos que coincidan con los filtros aplicados.
      </p>
    ) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {pedidosFiltrados.map((pedido) => (
      <motion.div
        key={pedido.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-5 border border-gray-700 bg-gray-900 rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-semibold text-teal-400">
          📦 Pedido #{pedido.id}
        </h2>
        <p className="text-gray-400">
          📅 {new Date(pedido.fecha).toLocaleDateString()}
        </p>
        <p className="font-bold text-lg text-green-400">
          💰 Total: ${pedido.total.toFixed(2)}
        </p>

        {/* Estado del pedido */}
        {usuario.rol === "usuario" ? (
          <div className="mt-3">
            <label className="font-semibold text-white">Estado: </label>
            <select
              className="ml-2 p-2 border border-gray-700 bg-gray-800 text-white rounded-lg cursor-pointer focus:ring-2 focus:ring-teal-400"
              value={pedido.estado}
              onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
              disabled={pedido.estado === "completado" || pedido.estado === "enviado"}
            >
              <option value="pendiente">🟡 Pendiente</option>
              <option value="pagar">💳 Pagar</option>
              <option value="enviado" disabled>📦 Enviado (Automático)</option>
              <option value="completado" disabled>✅ Completado (Automático)</option>
            </select>
          </div>
        ) : (
          <p className={`font-semibold ${pedido.estado === "pendiente"
            ? "text-yellow-500"
            : pedido.estado === "pagar"
            ? "text-blue-500"
            : pedido.estado === "enviado"
            ? "text-purple-500"
            : "text-green-500"}`}>
            Estado: {pedido.estado}
          </p>
        )}

                {/* 🔹 Si el estado es "Pagar", mostrar botón para ir a la pasarela de pago */}
                {pedido.estado === "pagar" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/pago/${pedido.id}`)}
                    className="mt-4 bg-green-500 text-black font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer
                               hover:shadow-[0px_0px_20px_rgba(45,212,191,0.8)] hover:bg-green-600"
                  >
                    💳 Ir a Pagar
                  </motion.button>
                )}


                {/* 🛒 Productos en el pedido */}
                <h3 className="mt-3 font-semibold text-white">🛍️ Productos:</h3>
                <ul className="list-disc pl-5 text-gray-400">
  {pedido.detallepedidos?.map((detalle) => (
    <li key={detalle.id}>
      {detalle.productos?.nombre} - {detalle.cantidad} unidades - 💲
      {detalle.subtotal.toFixed(2)}
    </li>
  ))}
</ul>


                {/* 🗑 Botón para eliminar pedido (Solo si está "pendiente") */}
                {pedido.estado === "pendiente" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => eliminarPedido(pedido.id)}
                    className="mt-4 bg-red-500 text-black font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer
                               hover:shadow-[0px_0px_20px_rgba(220,38,38,0.8)] hover:bg-red-600"
                  >
                    🗑 Eliminar Pedido
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
