import { useState, useContext } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify"; 
import { motion } from "framer-motion";

function CrearCategoria() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [categoria, setCategoria] = useState({ nombre: "" });

  const handleChange = (e) => {
    setCategoria({ ...categoria, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!categoria.nombre.trim()) {
      toast.error("❌ El nombre de la categoría no puede estar vacío.");
      return;
    }
  
    if (!usuario || !usuario.id) {
      toast.error("❌ Debes estar autenticado para crear una categoría.");
      return;
    }
  
    try {
      const normalizarTexto = (texto) =>
        texto
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") 
          .toLowerCase()
          .trim();
  
      const { data: categorias } = await api.get("/categorias", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      const nombreNormalizado = normalizarTexto(categoria.nombre);
  
      const existeCategoria = categorias.some(
        (cat) => normalizarTexto(cat.nombre) === nombreNormalizado
      );
  
      if (existeCategoria) {
        toast.error("⚠️ Ya tienes una categoría con ese nombre.");
        return;
      }
  
      // ✅ Crear si no existe
      const response = await api.post("/categorias", {
        nombre: categoria.nombre,
        user_id: usuario.id,
      });
  
      if (response.status === 201) {
        toast.success("✅ Categoría añadida con éxito!");
        navigate("/categorias");
      } else {
        toast.error("❌ No se pudo añadir la categoría.");
      }
    } catch (error) {
      console.error("Error al añadir categoría:", error);
      const mensajeError = error.response?.data?.error || "Error al añadir categoría";
      toast.error(`❌ ${mensajeError}`);
    }
  };
  

  return (
    <div className="w-full min-h-screen bg-black flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="p-8 max-w-md w-full bg-gray-900 text-white rounded-lg shadow-2xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-3xl font-bold text-teal-400 mb-6 text-center"
        >
          ➕ Añadir Categoría
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            type="text"
            name="nombre"
            placeholder="📁 Nombre de la categoría"
            value={categoria.nombre}
            onChange={handleChange}
            className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            required
          />

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            type="submit"
            className="relative px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg transition-all cursor-pointer
                       hover:scale-105 hover:shadow-[0px_0px_20px_rgba(45,212,191,0.8)] hover:bg-teal-600"
          >
            ✅ Añadir Categoría
          </motion.button>
        </form>
      </motion.div>

      {/* Botón de regreso */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        onClick={() => navigate("/categorias")}
        className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all cursor-pointer"
      >
        ⬅️ Volver
      </motion.button>
    </div>
  );
}

export default CrearCategoria;
