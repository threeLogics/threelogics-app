import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

export default function UltimosClientes() {
  const [nuevosClientes, setNuevosClientes] = useState([]);
  const [clientesEliminados, setClientesEliminados] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios/ultimos-clientes");
  
      console.log("📢 Respuesta de la API:", response.data);
  
      const nuevos = Array.isArray(response.data.nuevosClientes) ? response.data.nuevosClientes : [];
      const eliminados = Array.isArray(response.data.clientesEliminados) ? response.data.clientesEliminados : [];
  
      setNuevosClientes(nuevos);
      setClientesEliminados(eliminados);
  
      
      if (nuevos.length > 0 || eliminados.length > 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
      setNuevosClientes([]);
      setClientesEliminados([]);
      
    }
  };
  

  useEffect(() => {
    fetchClientes();
    const interval = setInterval(fetchClientes, 3600000);
    return () => clearInterval(interval);
  }, []);

  
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex items-center gap-3 animate-pulse text-gray-300">
          <svg
            className="w-5 h-5 text-teal-400 animate-spin"
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
          <span>Cargando datos de clientes...</span>
        </div>
      </div>
    );
  }
  
  return (
<div className="w-full max-w-6xl mx-auto px-6 py-10 
     rounded-2xl shadow-xl border border-white/10 
     bg-white/5 backdrop-blur-md">

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Nuevos Clientes */}
        <div>
          <h3 className="text-xl font-bold mb-5 text-teal-400 border-b border-teal-500 pb-2">
            🟢 Nuevos Clientes :
          </h3>
          <AnimatePresence>
            {nuevosClientes.length > 0 ? (
              nuevosClientes.map((cliente) => (
                <motion.div
                  key={cliente.id}
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-4 mb-3 bg-gray-900 hover:bg-gray-800 transition-colors rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{cliente.nombre}</span>
                    <span className="text-sm text-gray-500">
                      📅 {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : "Sin fecha"}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                key="no-clientes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-gray-500 italic"
              >
                No hay nuevos clientes.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
  
        {/* Clientes Dados de Baja */}
        <div>
          <h3 className="text-xl font-bold mb-5 text-red-400 border-b border-red-500 pb-2">
            🔴 Clientes Dados de Baja :
          </h3>
          <AnimatePresence>
            {clientesEliminados.length > 0 ? (
              clientesEliminados.map((cliente) => (
                <motion.div
                  key={cliente.id}
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-4 mb-3 bg-gray-900 hover:bg-gray-800 transition-colors rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{cliente.nombre}</span>
                    <span className="text-sm text-gray-500">
                      ❌ {cliente.deleted_at ? new Date(cliente.deleted_at).toLocaleDateString() : "Sin fecha"}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                key="no-eliminados"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-gray-500 italic"
              >
                No hay clientes dados de baja.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
  
  
}
