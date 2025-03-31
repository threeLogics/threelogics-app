import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import supabase from "../supabaseClient";
import DOMPurify from "dompurify";
import { motion } from "framer-motion"; 
export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

 
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input.trim());
  };

  
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!minLength) return "⚠️ La contraseña debe tener al menos 8 caracteres.";
    if (!hasUppercase) return "⚠️ Debe contener al menos una letra mayúscula.";
    if (!hasSpecialChar) return "⚠️ Debe contener al menos un carácter especial (@, $, !, %, *, ? o &).";

    return null; 
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    
    const sanitizedNewPassword = sanitizeInput(newPassword);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    
    const error = validatePassword(sanitizedNewPassword);
    if (error) {
      toast.error(error);
      return;
    }

    if (sanitizedNewPassword !== sanitizedConfirmPassword) {
      toast.error("⚠️ Las contraseñas no coinciden.");
      return;
    }

    try {
      
      const { error } = await supabase.auth.updateUser({
        password: sanitizedNewPassword,
      });

      if (error) throw error;

      toast.success("✅ Contraseña actualizada correctamente.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al actualizar la contraseña:", error);
      toast.error("❌ Error al actualizar la contraseña.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="bg-gray-900 p-8 rounded-lg shadow-lg text-white w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-teal-400">Restablecer Contraseña</h2>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Nueva contraseña */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-teal-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            className="w-full bg-teal-500 text-black py-3 rounded-lg font-semibold hover:bg-teal-400 transition"
          >
            Restablecer Contraseña
          </button>
        </form>
        </motion.div>
    </div>
  );
}
