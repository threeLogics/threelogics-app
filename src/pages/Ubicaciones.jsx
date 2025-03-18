import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { motion } from "framer-motion";

const Ubicaciones = () => {
  console.log("Renderizando Ubicaciones"); // Verifica si el componente está cargando
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const { data, error } = await supabase
          .from("ubicaciones")
          .select("*, productos!ubicaciones_producto_id_fkey(nombre, descripcion)");

        if (error) throw error;

        console.log("Datos obtenidos:", data);
        setUbicaciones(data || []);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUbicaciones();
  }, []);

  return (
    <div className="flex flex-col items-center pt-30 min-h-screen bg-black text-white p-6">
      {/* Animación del título */}
      <motion.h1
        className="text-4xl font-extrabold tracking-widest mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
      >
        Ubicaciones de Productos
      </motion.h1>

      {loading ? (
        <motion.p
          className="text-xl text-teal-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Cargando ubicaciones...
        </motion.p>
      ) : ubicaciones.length === 0 ? (
        <motion.p
          className="text-xl text-teal-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No hay ubicaciones disponibles.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {ubicaciones.map((ubicacion) => (
            <motion.div
              key={ubicacion.id}
              className="bg-gray-900 p-6 rounded-lg shadow-lg border border-teal-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-xl font-semibold text-teal-400">
                Producto: {ubicacion.productos ? ubicacion.productos.nombre : "Sin asignar"}
              </h2>
              <p className="text-gray-300">
                {ubicacion.productos ? ubicacion.productos.descripcion : "Descripción no disponible"}
              </p>
              <div className="mt-4 text-gray-400">
                <p>
                  <strong>Almacén:</strong> {ubicacion.almacen}
                </p>
                <p>
                  <strong>Estantería:</strong> {ubicacion.estanteria}
                </p>
                <p>
                  <strong>Posición:</strong> {ubicacion.posicion}
                </p>
                <p>
                  <strong>Altura:</strong> {ubicacion.altura}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ubicaciones;
