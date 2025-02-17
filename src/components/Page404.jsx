import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Page404 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-black to-teal-700 text-white text-center overflow-hidden">
      
      {/* Animación de caída del 404 */}
      <motion.h1
        className="text-9xl font-extrabold tracking-widest"
        initial={{ y: -300, opacity: 0 }} // Empieza arriba con opacidad 0
        animate={{ y: 0, opacity: 1 }} // Llega a su posición normal
        transition={{ type: "spring", stiffness: 100, damping: 10 }} // Rebote suave
      >
        404
      </motion.h1>

      {/* Contenedor del texto + botón con animación conjunta */}
      <motion.div
        className="flex flex-col items-center mt-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-2xl">¡Oops! La página que buscas no existe.</p>

        {/* Animación del botón con efecto flotante */}
        <motion.div
          className="mt-12" // Más margen arriba
          initial={{ y: 10 }}
          animate={{ y: [-3, 0, -3] }} // Movimiento sutil arriba y abajo
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Link
            to="/"
            className="px-8 py-4 bg-teal-400 text-gray-900 text-lg font-semibold rounded-lg shadow-md hover:bg-teal-500 transition-transform transform hover:scale-105"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page404;
