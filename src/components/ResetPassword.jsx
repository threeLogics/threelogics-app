import { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8 || newPassword !== confirmPassword) {
      toast.error("⚠️ La contraseña debe tener al menos 8 caracteres y coincidir.");
      return;
    }

    try {
      // Cambiar la contraseña en Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success("✅ Contraseña actualizada correctamente.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al actualizar la contraseña:", error);
      toast.error("Error al actualizar la contraseña.");
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-black">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="bg-gray-900 p-8 rounded-lg shadow-lg text-white w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-teal-400">Restablecer Contraseña</h2>

        <form onSubmit={handleResetPassword} className="grid space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
          </div>

          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg transition-all cursor-pointer hover:bg-teal-600"
          >
            Cambiar Contraseña
          </button>
        </form>
      </motion.div>
    </div>
  );
}
