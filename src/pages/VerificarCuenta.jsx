import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function VerificarCuenta() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("Verificando cuenta...");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    async function verificar() {
      const urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setMensaje("⚠️ Error: No se encontró un token de verificación.");
        toast.error("❌ Token inválido.");
        setEsError(true);
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        setMensaje("❌ Error al verificar la cuenta.");
        toast.error("❌ Error al verificar la cuenta.");
        setEsError(true);
        return;
      }

      
      setEsError(false);

      setTimeout(() => navigate("/login"), 3000);
    }

    verificar();
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

        <motion.h2
          className={`text-xl font-semibold ${esError ? "text-red-400" : "text-white"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {mensaje}
        </motion.h2>

        <motion.p
          className="text-gray-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {esError ? "Inténtalo de nuevo o contacta soporte." : "Por favor, espera..."}
        </motion.p>
      </motion.div>
    </div>
  );
}
