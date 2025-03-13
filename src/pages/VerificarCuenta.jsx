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
      // 🔹 Convertir el hash en parámetros de URL
      const urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setMensaje("⚠️ Error: No se encontró un token de verificación.");
        toast.error("❌ Token inválido.");
        setEsError(true);
        return;
      }

      // ✅ Guardar el token en Supabase
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

      toast.success("✅ Cuenta verificada con éxito.");
      setMensaje("✅ Cuenta verificada con éxito.");
      setEsError(false);

      // 🔄 Redirigir al login después de 3 segundos
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
        <motion.h2 className={`text-xl font-semibold ${esError ? "text-red-400" : "text-white"}`}>
          {mensaje}
        </motion.h2>
        <motion.p className="text-gray-400 mt-2">
          {esError ? "Inténtalo de nuevo o contacta soporte." : "Por favor, espera..."}
        </motion.p>
      </motion.div>
    </div>
  );
}
