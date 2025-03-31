import { useState, useContext, useEffect } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

function CrearProducto() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria_id: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [creandoCategoria, setCreandoCategoria] = useState(false);

  useEffect(() => {
    api.get("/categorias")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setCategorias(response.data);
        } else {
          console.warn("⚠️ Respuesta inesperada al obtener categorías:", response.data);
        }
      })
      .catch((error) => console.error("❌ Error al obtener categorías:", error));
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "categoria_id") {
      if (value === "crear") {
        setCreandoCategoria(true);
        setProducto((prev) => ({ ...prev, categoria_id: "" }));
      } else {
        setCreandoCategoria(false);
        setProducto((prev) => ({ ...prev, categoria_id: value })); 
      }
    } else {
      setProducto((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!producto.nombre || !producto.precio || !producto.cantidad || (!producto.categoria_id && !creandoCategoria)) {
      toast.error("❌ Todos los campos son obligatorios.");
      return;
    }
  
    let categoriaIdFinal = producto.categoria_id;
  
    try {
      if (creandoCategoria && nuevaCategoria.trim()) {
        const normalizarTexto = (texto) =>
          texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      
        const nombreNormalizado = normalizarTexto(nuevaCategoria);
      
        const existeCategoria = categorias.find(
          (c) => normalizarTexto(c.nombre) === nombreNormalizado
        );
      
        if (existeCategoria) {
          categoriaIdFinal = existeCategoria.id;
          toast.info(`ℹ️ La categoría "${nuevaCategoria}" ya existe y será usada.`);
        } else {
          // 🧠 Si no existe, se intenta crear
          const responseCategoria = await api.post(
            "/categorias",
            { nombre: nuevaCategoria },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
      
          if (!responseCategoria.data || !responseCategoria.data.categoria) {
            throw new Error("No se pudo crear la categoría.");
          }
      
          categoriaIdFinal = responseCategoria.data.categoria.id;
          toast.success(`✅ Categoría "${nuevaCategoria}" creada con éxito!`);
          setCategorias((prev) => [...prev, responseCategoria.data.categoria]);
          setNuevaCategoria("");
          setCreandoCategoria(false);
        }
      }
      
  
      if (!categoriaIdFinal) {
        toast.error("❌ No se pudo obtener la categoría.");
        return;
      }
  
      console.log("📌 Enviando producto con datos:", {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        cantidad: Number(producto.cantidad),
        categoria_id: categoriaIdFinal,
        user_id: usuario?.id || null,
      });
  
      const responseProducto = await api.post("/productos", {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        cantidad: Number(producto.cantidad),
        categoria_id: categoriaIdFinal,
        user_id: usuario?.id || null,
      });
      
      console.log("✅ Respuesta completa del servidor:", responseProducto);
      console.log("✅ Datos del servidor:", responseProducto.data);
      
      if (!responseProducto.data || typeof responseProducto.data !== "object") {
        console.error("❌ Respuesta inesperada del servidor:", responseProducto);
        throw new Error("Error en la respuesta del servidor.");
      }
      
      if (!responseProducto.data.producto) {
        console.error("🚨 Falta la clave 'producto' en la respuesta:", responseProducto.data);
        throw new Error("No se pudo crear el producto.");
      }
      
  
      toast.success(`✅ Producto "${responseProducto.data.producto.nombre}" añadido con éxito!`);
  
      navigate("/productos");
  
    } catch (error) {
      console.error("❌ Error al añadir producto:", error);
      toast.error(error.response?.data?.error || "Error al añadir producto.");
    }
  };
  
  
  
  

  return (
    <div className="w-full min-h-screen bg-black flex justify-center items-center pt-10">
      <div className="p-8 max-w-5xl w-full bg-gray-900 text-white rounded-lg shadow-2xl flex gap-10">
        {/* Formulario para añadir productos */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-1/2"
        >
          <h1 className="text-3xl font-bold text-teal-400 mb-6">➕ Añadir Producto</h1>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="📌 Nombre del producto"
              value={producto.nombre}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
              required
            />
            <input
              type="text"
              name="descripcion"
              placeholder="📝 Descripción"
              value={producto.descripcion}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
            <input
              type="number"
              name="precio"
              placeholder="💲 Precio"
              value={producto.precio}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
              required
            />
            <input
              type="number"
              name="cantidad"
              placeholder="📦 Cantidad"
              value={producto.cantidad}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
              required
            />
  
            {/* Selección de Categoría */}
            <select
              name="categoria_id"
              value={producto.categoria_id}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none cursor-pointer"
              required={!creandoCategoria}
            >
              <option value="">📁 Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
              <option value="crear">➕ Crear nueva categoría</option>
            </select>
  
            {/* Input para nueva categoría */}
            {creandoCategoria && (
              <input
                type="text"
                placeholder="🆕 Nombre de la nueva categoría"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                required
              />
            )}
  
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              type="submit"
              className="relative px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg transition-all cursor-pointer
                         hover:scale-105 hover:shadow-[0px_0px_20px_rgba(45,212,191,0.8)] hover:bg-teal-600"
            >
              ✅ Añadir Producto
            </motion.button>
          </form>
        </motion.div>
  
        {/* Tabla de Categorías */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-1/2"
        >
          <h1 className="text-3xl font-bold text-teal-400 mb-6">📂 Categorías Disponibles</h1>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full border-collapse bg-gray-800 text-white rounded-lg">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="border border-gray-700 px-4 py-2">ID</th>
                  <th className="border border-gray-700 px-4 py-2">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length > 0 ? (
                  categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-700 transition">
                      <td className="border border-gray-700 px-4 py-2">{categoria.id}</td>
                      <td className="border border-gray-700 px-4 py-2">{categoria.nombre}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="border border-gray-700 px-4 py-2 text-center text-gray-400">
                      No hay categorías disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
  
}
// 🔹 Estilos para inputs y botones
const inputStyle = "border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none";
const btnSubmit = "relative px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg transition-all cursor-pointer hover:scale-105 hover:shadow-[0px_0px_20px_rgba(45,212,191,0.8)] hover:bg-teal-600";


export default CrearProducto;
