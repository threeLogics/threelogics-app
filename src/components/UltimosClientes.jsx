import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Importamos framer-motion
import { api } from "../services/api"; // Asegúrate de que tu API esté configurada correctamente

export default function UltimosClientes() {
  const [nuevosClientes, setNuevosClientes] = useState([]);
  const [clientesEliminados, setClientesEliminados] = useState([]);

  // Función para cargar los últimos clientes
  const fetchClientes = async () => {
    try {
      const response = await api.get("/usuarios/ultimos-clientes");
      console.log("📢 Nuevos Clientes:", response.data.nuevosClientes);
      console.log("❌ Clientes Eliminados:", response.data.clientesEliminados);
      setNuevosClientes(response.data.nuevosClientes);
      setClientesEliminados(response.data.clientesEliminados);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  useEffect(() => {
    fetchClientes(); // Cargar los datos al montar el componente

    // Configurar actualización automática cada 10 segundos
    const interval = setInterval(() => {
      fetchClientes();
    }, 10000);

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, []);

  // Variantes de animación
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-6 bg-black text-white rounded-lg shadow-lg">
      {/* Columna 1: Nuevos Clientes */}
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
                  📅 {new Date(cliente.createdAt).toLocaleDateString()}
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

      {/* Columna 2: Clientes Eliminados */}
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
                  ❌ {new Date(cliente.deletedAt).toLocaleDateString()}
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
