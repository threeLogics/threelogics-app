import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

export default function UltimosClientes() {
  const [nuevosClientes, setNuevosClientes] = useState([]);
  const [clientesEliminados, setClientesEliminados] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Estado de carga

  // 📌 Función para cargar los últimos clientes
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios/ultimos-clientes");

      console.log("📢 Respuesta de la API:", response.data);

      // ✅ Verificar si la respuesta contiene los datos esperados
      setNuevosClientes(Array.isArray(response.data.nuevosClientes) ? response.data.nuevosClientes : []);
      setClientesEliminados(Array.isArray(response.data.clientesEliminados) ? response.data.clientesEliminados : []);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
      setNuevosClientes([]);
      setClientesEliminados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();

    const interval = setInterval(fetchClientes, 10000);
    return () => clearInterval(interval);
  }, []);

  // 📌 Variantes de animación
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  if (loading) {
    return <p className="text-white">Cargando clientes...</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6 bg-black text-white rounded-lg shadow-lg">
      {/* 📢 Nuevos Clientes */}
      <div>
        <h2 className="text-xl font-bold mb-3 text-teal-400">📢 Nuevos Clientes</h2>
        <AnimatePresence>
          {nuevosClientes.length > 0 ? (
            nuevosClientes.map((cliente) => (
              <motion.div
                key={cliente.id}
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-3 bg-gray-800 rounded-lg mb-2"
              >
                <p className="font-semibold">{cliente.nombre}</p>
                <p className="text-sm text-gray-400">{cliente.email}</p>
                <p className="text-xs text-gray-500">
                  📅 {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : "Fecha no disponible"}
                </p>
              </motion.div>
            ))
          ) : (
            <motion.p
              key="no-clientes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gray-500"
            >
              No hay nuevos clientes.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 🚫 Clientes Eliminados */}
      <div>
        <h2 className="text-xl font-bold mb-3 text-red-400">🚫 Clientes Dados de Baja</h2>
        <AnimatePresence>
          {clientesEliminados.length > 0 ? (
            clientesEliminados.map((cliente) => (
              <motion.div
                key={cliente.id}
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-3 bg-gray-800 rounded-lg mb-2"
              >
                <p className="font-semibold">{cliente.nombre}</p>
                <p className="text-sm text-gray-400">{cliente.email}</p>
                <p className="text-xs text-gray-500">
                  ❌ {cliente.deleted_at ? new Date(cliente.deleted_at).toLocaleDateString() : "Fecha no disponible"}
                </p>
              </motion.div>
            ))
          ) : (
            <motion.p
              key="no-eliminados"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gray-500"
            >
              No hay clientes dados de baja.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
