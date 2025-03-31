import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensaje = location.state?.mensaje || "Procesando tu solicitud...";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gray-900 p-8 rounded-lg shadow-lg text-center"
      >
        <motion.div
          className="relative w-16 h-16 flex items-center justify-center mb-6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <div className="absolute w-full h-full border-4 border-teal-500 border-solid rounded-full opacity-30"></div>
          <div className="absolute w-full h-full border-t-4 border-teal-400 border-solid rounded-full"></div>
        </motion.div>

        <motion.h2 className="text-xl font-semibold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          {mensaje}
        </motion.h2>
        <motion.p className="text-gray-400 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
          Por favor, espera...
        </motion.p>
      </motion.div>
    </div>
  );
}
