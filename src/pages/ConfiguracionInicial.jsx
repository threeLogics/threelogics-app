import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { motion } from "framer-motion";
import MetaData from '../components/MetaData';

const ConfiguracionInicial = () => {
  const [almacen, setAlmacen] = useState("01");
  const [estanteria, setEstanteria] = useState("01");
  const [posicion, setPosicion] = useState("01");
  const [altura, setAltura] = useState("00");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("usuario_ubicaciones")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          navigate("/productos"); 
        }
      }
      setLoading(false);
    };

    checkUserConfig();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("usuario_ubicaciones")
        .insert([{ 
          user_id: user.id, 
          almacen, 
          estanteria, 
          posicion, 
          altura 
        }]);

      if (error) {
        console.error("Error al guardar ubicación:", error);
      } else {
        navigate("/productos"); 
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-teal-700 text-white">
        <motion.p
          className="text-xl text-teal-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Verificando configuración...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black to-teal-700 text-white p-6">
          <MetaData
        title="Configuración Inicial | ThreeLogics"
        description="Configura tu ubicación de almacenamiento en ThreeLogics para empezar a gestionar tus productos. Completa los datos de tu almacén, estantería y más."
        imageUrl="https://threelogicsapp.vercel.app/og-image.png"
        keywords="configuración inicial, ubicación de almacenamiento, almacén, estantería, software para pymes"
      />
      {/* Título animado */}
      <motion.h1
        className="text-3xl font-extrabold tracking-widest mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
      >
        Configuración Inicial
      </motion.h1>

      <motion.p
        className="text-teal-300 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Selecciona tu ubicación de almacenamiento
      </motion.p>

      {/* Formulario animado */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg shadow-lg border border-teal-400 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-300">Almacén (01-04)</label>
          <select 
            value={almacen} 
            onChange={(e) => setAlmacen(e.target.value)} 
            className="border p-2 rounded w-full bg-gray-800 text-white"
          >
            {[...Array(4)].map((_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-300">Estantería (01-20)</label>
          <select 
            value={estanteria} 
            onChange={(e) => setEstanteria(e.target.value)} 
            className="border p-2 rounded w-full bg-gray-800 text-white"
          >
            {[...Array(20)].map((_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-300">Posición</label>
          <input 
            type="number" 
            min="1" 
            value={posicion} 
            onChange={(e) => setPosicion(e.target.value)} 
            className="border p-2 rounded w-full bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-300">Altura (00-04)</label>
          <select 
            value={altura} 
            onChange={(e) => setAltura(e.target.value)} 
            className="border p-2 rounded w-full bg-gray-800 text-white"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={String(i).padStart(2, "0")}>
                {String(i).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* Botón animado */}
        <motion.button
          type="submit"
          className="w-full px-4 py-2 bg-teal-400 text-gray-900 text-lg font-semibold rounded-lg shadow-md hover:bg-teal-500 transition-transform transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
        >
          Guardar y Continuar
        </motion.button>
      </motion.form>
    </div>
  );
};

export default ConfiguracionInicial;
