import { useState, useContext, useRef } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import SplitText from "../components/SplitText";
import { Eye, EyeOff } from "lucide-react"; // Iconos de ojo

export default function Login() {
  const [email, setEmail] = useState("");
  const passwordRef = useRef(null);
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false); // Estado para recuperación de contraseña
  const [recoveryEmail, setRecoveryEmail] = useState(""); // Correo para recuperar contraseña

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input.trim());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const sanitizedEmail = sanitizeInput(email.trim());
    const sanitizedPassword = sanitizeInput(passwordRef.current.value.trim());
  
    try {
      const response = await api.post("/auth/login", {
        email: sanitizedEmail,
        password: sanitizedPassword,
      });
  
      login(response.data);
      toast.success("Inicio de sesión exitoso.");
      navigate("/productos");
  
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error en el servidor.";
      const tipoError = error.response?.data?.tipoError; // Capturamos el tipo de error enviado desde el backend
  
      if (tipoError === "cuenta_eliminada") {
        toast.error("Esta cuenta ha sido dada de baja. Contacta con soporte si deseas recuperarla.");
      } else if (tipoError === "correo_no_verificado") {
        toast.error("Debes verificar tu correo antes de iniciar sesión.");
      } else {
        toast.error("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleRecoverPassword = async () => {
    if (!recoveryEmail.trim()) {
      toast.error("Por favor, ingresa tu correo electrónico.");
      return;
    }

    try {
      await api.post("/auth/recover-password", { email: recoveryEmail });
      toast.success("✅ Se ha enviado una nueva contraseña a tu correo.");
      setRecovering(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "❌ Error al recuperar la contraseña.");
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-black">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-lg text-white rounded-lg shadow-2xl max-w-md w-full p-8"
      >
        <div className="text-center mb-6">
          <SplitText
            text="Inicio Sesión"
            className="text-3xl font-bold text-teal-400"
            delay={100}
            animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
            animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
            easing="easeOutCubic"
            threshold={0.2}
            rootMargin="-50px"
          />
        </div>

        {!recovering ? (
          <form onSubmit={handleLogin} className="grid space-y-4">
            <motion.input
              type="text"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
              required
            />
            <motion.div className="relative">
              <motion.input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                ref={passwordRef}
                className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg w-full pr-10 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg transition-all cursor-pointer"
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>

            <button
  onClick={() => {
    if (!email.trim()) {
      toast.error("⚠️ Por favor, ingresa tu correo antes de recuperar tu contraseña.");
      return;
    }
    setRecoveryEmail(email);
    setRecovering(true);
  }}
  className="text-sm text-teal-400 hover:text-teal-300 transition text-center cursor-pointer"
>
  ¿Olvidaste tu contraseña?
</button>
          </form>
        ) : (
          <div className="grid space-y-4">
            <h2 className="text-xl text-center text-teal-400 font-semibold">
              Recuperar Contraseña
            </h2>
            <input
              type="text"
              placeholder="Correo electrónico"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
            <button
              onClick={handleRecoverPassword}
              className="px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg transition-all cursor-pointer"
            >
              Enviar Nueva Contraseña
            </button>
            <button
              onClick={() => setRecovering(false)}
              className="text-sm text-gray-400 hover:text-gray-200 transition text-center cursor-pointer"
            >
              Volver al login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
