import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";

export default function VerificarCuenta() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("Verificando cuenta...");

  useEffect(() => {
    async function verificar() {
      console.log("🔍 Token capturado desde la URL:", token);

      if (!token) {
        setMensaje("⚠️ Error: Token no encontrado en la URL.");
        return;
      }

      try {
        const response = await api.get(`/auth/verificar/${token}`);
        toast.success(
          response.data.mensaje || "✅ Cuenta verificada con éxito."
        );
        setMensaje("✅ Verificación completada. Redirigiendo...");

        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error("❌ Error en la verificación:", error);

        if (error.response?.status === 404) {
          setMensaje("❌ Token inválido o expirado.");
          toast.error("❌ Token inválido o expirado.");
        } else {
          setMensaje("❌ Error en el servidor al verificar la cuenta.");
          toast.error("❌ Error en el servidor.");
        }
      }
    }
    verificar();
  }, [token, navigate]);

  return (
    <div className="h-screen flex justify-center items-center">
      <h2 className="text-2xl text-white">{mensaje}</h2>
    </div>
  );
}
