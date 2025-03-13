import { useEffect, useState, useContext, useRef } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

function Categorias() {
  const { usuario } = useContext(AuthContext);
  const [categorias, setCategorias] = useState([]);
  const [editarCategoria, setEditarCategoria] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [modoEliminar, setModoEliminar] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const notificacionMostrada = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/categorias", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCategorias(response.data);

        if (!notificacionMostrada.current) {
          toast.success("Categorías cargadas correctamente");
          notificacionMostrada.current = true;
        }
      } catch (error) {
        console.error("Error al obtener categorías:", error);
        if (!notificacionMostrada.current) {
          toast.error("No se pudieron cargar las categorías.");
          notificacionMostrada.current = true;
        }
      }
    };

    fetchCategorias();
  }, []);

  // ✅ Función para manejar la edición de la categoría
  const handleEditar = (categoria) => {
    setEditarCategoria(categoria);
    setNuevoNombre(categoria.nombre);
  };

  // ✅ Función para guardar la edición de la categoría
  const handleGuardarEdicion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/categorias/${editarCategoria.id}`,
        { nombre: nuevoNombre },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCategorias((prevCategorias) =>
          prevCategorias.map((cat) =>
            cat.id === editarCategoria.id
              ? { ...cat, nombre: nuevoNombre }
              : cat
          )
        );
        setEditarCategoria(null);
        setNuevoNombre("");
        toast.success("Categoría actualizada correctamente");
      } else {
        throw new Error("No se pudo actualizar la categoría");
      }
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      toast.error("No se pudo actualizar la categoría");
    }
  };

  // ✅ Función para manejar selección de categorías para eliminar
  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  // ✅ Función para eliminar las categorías seleccionadas
  const eliminarSeleccionadas = async () => {
    if (seleccionadas.length === 0) {
      toast.error("⚠️ No has seleccionado ninguna categoría.");
      return;
    }

    if (
      !window.confirm(
        `¿Seguro que quieres eliminar ${seleccionadas.length} categorías?`
      )
    )
      return;

    try {
      // ✅ Hacer una única petición DELETE enviando los IDs en el body
      await api.delete("/categorias", {
        data: { categoriaIds: seleccionadas }, // 👈 Enviar IDs en `data`
      });

      // ✅ Actualizar el estado eliminando las categorías borradas
      setCategorias((prev) =>
        prev.filter((cat) => !seleccionadas.includes(cat.id))
      );
      setSeleccionadas([]);
      setModoEliminar(false);
      toast.success(`✅ ${seleccionadas.length} categorías eliminadas.`);
    } catch (error) {
      console.error("❌ Error al eliminar categorías:", error);
      toast.error("❌ No se pudieron eliminar las categorías.");
    }
  };
  const fadeIn = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 10, transition: { duration: 0.5 } },
  };

  return (
    <div className="w-full min-h-screen bg-black flex justify-center pt-18">
      <div className="p-6 max-w-6xl w-full">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl font-bold text-teal-400">
            {usuario?.rol === "admin"
              ? "Todas las Categorías"
              : "Mis Categorías"}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/crear-categoria")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-md transition cursor-pointer"
            >
              ➕ Añadir Categoría
            </button>
            <button
              onClick={() => setModoEliminar(!modoEliminar)}
              className={`px-5 py-2 rounded-md shadow-md transition cursor-pointer ${
                modoEliminar
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-red-500 hover:bg-red-600"
              } text-white`}
            >
              {modoEliminar ? "❌ Cancelar" : "🗑 Eliminar Categorías"}
            </button>
          </div>
        </motion.div>

        {categorias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="bg-gray-900 p-5 rounded-lg shadow-md border border-gray-700 hover:shadow-lg transition transform hover:-translate-y-1 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  {modoEliminar && (
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(categoria.id)}
                      onChange={() => toggleSeleccion(categoria.id)}
                      className="w-5 h-5"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-white">
                    {categoria.nombre}
                  </h2>
                </div>

                {!modoEliminar && (
                  <button
                    onClick={() => handleEditar(categoria)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">
            No hay categorías registradas.
          </p>
        )}

        {/* 🗑 Botón de eliminación masiva */}
        {modoEliminar && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={eliminarSeleccionadas}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md"
            >
              🗑 Eliminar{" "}
              {seleccionadas.length > 0
                ? `${seleccionadas.length} categorías`
                : ""}
            </button>
          </div>
        )}

        {editarCategoria && (
          <div className="mt-6">
            <h2 className="text-2xl text-white">Editar Categoría</h2>
            <input
              type="text"
              className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
            <button
              onClick={handleGuardarEdicion}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md cursor-pointer"
            >
              Guardar Cambios
            </button>
            <button
              onClick={() => setEditarCategoria(null)}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorias;
