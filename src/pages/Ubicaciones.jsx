import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { motion } from "framer-motion";

const Ubicaciones = () => {
  console.log("Renderizando Ubicaciones"); // Verifica si el componente está cargando
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        // 🔹 Obtener el usuario autenticado
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Error al obtener el usuario:", userError);
          return;
        }

        // 🔹 Obtener el rol del usuario desde user_metadata
        const role = user.user_metadata?.rol || "cliente"; // Si no tiene rol, asumir "cliente"
        setUserRole(role);

        // 🔹 Obtener ubicaciones según el rol
        let query = supabase
          .from("ubicaciones")
          .select(
            `
            id, 
            almacen, 
            estanteria, 
            posicion, 
            altura, 
            productos!ubicaciones_producto_id_fkey(
              id, 
              nombre, 
              descripcion, 
              user_id
            )
          `
          );

        if (role !== "admin") {
          query = query.eq("productos.user_id", user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        // 🔹 Filtrar para no mostrar productos sin asignar
        const ubicacionesFiltradas = data.filter(
          (ubicacion) => ubicacion.productos && ubicacion.productos.nombre
        );

        console.log("Datos obtenidos:", ubicacionesFiltradas);
        setUbicaciones(ubicacionesFiltradas || []);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUbicaciones();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 10, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col items-start pt-20 min-h-screen bg-black text-white p-6">
      {/* Contenedor del título alineado a la izquierda y con mismo ancho que la cuadrícula */}
      <div className="w-full max-w-6xl mx-auto">
        <motion.h1
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-left mb-8 text-3xl font-bold text-teal-400"
        >
          📍 Ubicaciones y Proceso Logístico
        </motion.h1>
  
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg border border-teal-400">
          <h2 className="text-2xl font-bold text-teal-300 mb-4">🚚 Proceso de Entrada y Salida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white">📥 Recepción (Entrada)</h3>
              <ol className="mt-2 text-gray-300 list-decimal list-inside">
                <li>Recepción</li>
                <li>Ubicación</li>
              </ol>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">📤 Expedición (Salida)</h3>
              <ol className="mt-2 text-gray-300 list-decimal list-inside">
                <li>Ubicación</li>
                <li>Playa de expediciones</li>
                <li>Carga en camión</li>
              </ol>
            </div>
          </div>
        </div>
  
        {loading ? (
          <motion.p
            className="text-xl text-teal-300 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Cargando ubicaciones...
          </motion.p>
        ) : ubicaciones.length === 0 ? (
          <motion.p
            className="text-xl text-teal-300 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No hay ubicaciones disponibles.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
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
                  Producto: {ubicacion.productos.nombre}
                </h2>
                <p className="text-gray-300">
                  {ubicacion.productos.descripcion || "Descripción no disponible"}
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
    </div>
    );
}
  

export default Ubicaciones;
