import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";

export default function VerificarCuenta() {
  const { token } = useParams(); // ✅ Obtiene el token de la URL
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("Verificando cuenta...");

  useEffect(() => {
    async function verificar() {
      console.log("🔍 Token capturado desde la URL:", token); // ✅ Verifica que el token se obtiene

      if (!token) {
        setMensaje("Error: Token no encontrado en la URL.");
        return;
      }

      try {
        await api.get(`/auth/verificar/${token}`);
        toast.success("Cuenta verificada con éxito. Ahora puedes iniciar sesión.");
        navigate("/login");
      } catch (error) {
        setMensaje("Error al verificar la cuenta.");
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
