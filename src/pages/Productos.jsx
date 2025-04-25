import { useEffect, useState, useContext, useMemo } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import MetaData from '../components/MetaData';

export default function Productos() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [stockBajo] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [pagina, setPagina] = useState(1);
  
  const [productoEditado, setProductoEditado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalCargaMasiva, setModalCargaMasiva] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productosPorPagina, setMovimientosPorPagina] = useState(10);


  const [archivo, setArchivo] = useState(null);
  const [procesados, setProcesados] = useState([]);
  const [errores, setErrores] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [productosRes, categoriasRes] = await Promise.allSettled([
          api.get("/productos"),
          api.get("/categorias"),
        ]);

        console.log("Productos respuesta:", productosRes);
        console.log("Categorías respuesta:", categoriasRes);

        if (productosRes.status === "fulfilled") {
          setProductos(productosRes.value.data);
        } else {
          console.error("Error en productos:", productosRes.reason);
        }

        if (categoriasRes.status === "fulfilled") {
          setCategorias(categoriasRes.value.data);
        } else {
          console.error("Error en categorías:", categoriasRes.reason);
        }
      } catch (error) {
        console.error("Error en fetchDatos:", error);
        toast.error("❌ Error al obtener los datos.");
      }finally {
        setLoading(false); 
      }
    };

    fetchDatos();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [filtroCategoria, precioMin, precioMax, busqueda]);


  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      return (
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        (!filtroCategoria || p.categoria_id == filtroCategoria) &&
        (!stockBajo || p.cantidad <= (p.stockMinimo || 5)) &&
        (!precioMin || p.precio >= Number(precioMin)) &&
        (!precioMax || p.precio <= Number(precioMax))
      );
    });
  }, [productos, busqueda, filtroCategoria, stockBajo, precioMin, precioMax]);

  const toggleSeleccion = (id) => {
    setProductosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };
  const confirmarEliminacionProductos = (productosSeleccionados, eliminarProductos) => {
    toast(
      ({ closeToast }) => (
        <div className="text-teal">
          <p className="mb-2">
            ⚠️ ¿Seguro que quieres eliminar {productosSeleccionados.length} productos?
          </p>
          <div className="flex justify-center gap-4">
            {/* Botón de Confirmar Eliminación */}
            <button
              className="bg-red-500 px-4 py-2 text-black rounded hover:bg-red-700 transition"
              onClick={() => {
                eliminarProductos();
                closeToast(); 
              }}
            >
              🗑 Sí, eliminar
            </button>
  
            {/* Botón de Cancelar */}
            <button
              className="bg-gray-500 px-4 py-2 rounded text-black hover:bg-gray-700 transition"
              onClick={closeToast}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false, 
      }
    );
  };
  

  const eliminarProductosSeleccionados = async () => {
    if (productosSeleccionados.length === 0) {
      toast.error("❌ Selecciona al menos un producto para eliminar.");
      return;
    }
  
    confirmarEliminacionProductos(productosSeleccionados, async () => {
      try {
        const eliminaciones = await Promise.allSettled(
          productosSeleccionados.map((id) => api.delete(`/productos/${id}`))
        );
  
        const eliminadosExitosamente = eliminaciones
          .filter((res) => res.status === "fulfilled")
          .map((_, index) => productosSeleccionados[index]);
  
        setProductos((prev) =>
          prev.filter((p) => !eliminadosExitosamente.includes(p.id))
        );
        setProductosSeleccionados([]);
        toast.success(`✅ ${eliminadosExitosamente.length} productos eliminados.`);
      } catch {
        toast.error("❌ Error al eliminar los productos.");
      }
    });
  };
  

  const indiceInicial = (pagina - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(
    indiceInicial,
    indiceInicial + productosPorPagina
  );
  useEffect(() => {
    const calcularMovimientosPorPantalla = () => {
      const alturaDisponible = window.innerHeight;
      const alturaCabecera = 390; 
      const alturaFila = 50; 
      const filasVisibles = Math.floor((alturaDisponible - alturaCabecera) / alturaFila);
      setMovimientosPorPagina(Math.max(filasVisibles, 5)); 
    };
  
    calcularMovimientosPorPantalla();
    window.addEventListener("resize", calcularMovimientosPorPantalla);
  
    return () => window.removeEventListener("resize", calcularMovimientosPorPantalla);
  }, []);
  
  const abrirModalEdicion = (producto) => {
    setProductoEditado(producto);
    setModalAbierto(true);
  };

  const handleChangeEdicion = (e) => {
    setProductoEditado({ ...productoEditado, [e.target.name]: e.target.value });
  };

  const handleModificarProducto = async (e) => {
    e.preventDefault();
  
    const { precio, cantidad } = productoEditado;
  
    if (precio < 0 || cantidad < 0) {
      toast.error("❌ El precio y la cantidad no pueden ser negativos.");
      return;
    }
  
    try {
      await api.put(`/productos/${productoEditado.id}`, productoEditado);
      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoEditado.id ? { ...p, ...productoEditado } : p
        )
      );
      setModalAbierto(false);
      toast.success(`✅ Producto "${productoEditado.nombre}" modificado.`);
    } catch {
      toast.error("❌ Error al modificar el producto.");
    }
  };
  

  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files[0];
    console.log("📂 Archivo seleccionado:", file);
    setArchivo(file);
  };

  const handleSubirArchivo = async () => {
    if (!archivo) {
      toast.error("⚠️ Selecciona un archivo CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      setSubiendo(true);
      const response = await api.post("/productos/cargar-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Respuesta de la API:", response.data);

      setProcesados(response.data.productosProcesados);
      setErrores(response.data.errores);
      toast.success("✅ Carga completada correctamente");

      setTimeout(async () => {
        const productosRes = await api.get("/productos");
        console.log("📦 Productos después de la carga:", productosRes.data);
        setProductos(productosRes.data);
      }, 1000); 
    } catch (error) {
      console.error("❌ Error al subir el archivo:", error);
      toast.error("❌ Error al subir el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 10, transition: { duration: 0.5 } },
  };
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-teal-400"
        >
          📦 Cargando Productos...
        </motion.div>
  
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 120,
          }}
        >
          <svg
            className="w-12 h-12 text-teal-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </motion.div>
  
        <p className="text-gray-400 text-sm">
          Preparando todos los productos, por favor espera...
        </p>
      </div>
    );
  
  return (
    <div className="w-full min-h-screen bg-black flex justify-center pt-12">
          <MetaData
        title="Productos | ThreeLogics"
        description="Administra y optimiza la gestión de productos dentro de tu almacén con ThreeLogics. Filtra, busca y organiza tus productos de manera eficiente."
        imageUrl="https://threelogicsapp.vercel.app/og-image.png"
        keywords="productos, gestión de almacenes, stock, logística, optimización de inventarios"
      />
      <div className="p-6 max-w-7xl w-full">
        {/* 📌 Header */}
        <motion.div
  variants={fadeIn}
  initial="hidden"
  animate="visible"
  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
>
  <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
    {usuario?.rol === "admin"
      ? "📦 Todos los Productos"
      : "📦 Mis Productos"}
  </h1>

  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
    <button
      onClick={() => setModalCargaMasiva(true)}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-md shadow-md transition cursor-pointer"
    >
      📤 Carga Masiva
    </button>
    <button
      onClick={() => navigate("/crear-producto")}
      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-md transition cursor-pointer"
    >
      ➕ Añadir Producto
    </button>
  </div>
</motion.div>

        {/* 🆕 MODAL DE CARGA MASIVA */}
        <AnimatePresence>
          {modalCargaMasiva && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900 p-6 rounded-lg shadow-lg w-96"
              >
                <h2 className="text-lg font-bold text-teal-400 mb-4">
                  📤 Carga Masiva de Productos
                </h2>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleArchivoSeleccionado}
                  className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded-md mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleSubirArchivo} 
                    disabled={subiendo}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
                  >
                    {subiendo ? "⏳ Subiendo..." : "📥 Subir CSV"}
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `${api.defaults.baseURL}/productos/descargar-plantilla`)
                    }
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
                  >
                    📄 Descargar Plantilla
                  </button>
                </div>

                {/* 🚀 Resultados de carga masiva */}
                {(procesados.length > 0 || errores.length > 0) && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
                    {procesados.length > 0 && (
                      <div className="bg-green-600 text-white p-3 rounded-md mb-2">
                        <h3 className="text-lg font-bold">
                          ✅ Productos cargados:
                        </h3>
                        <ul className="mt-2">
                          {procesados.map((producto, index) => (
                            <li key={index}>✔ {producto}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {errores.length > 0 && (
                      <div className="bg-red-500 text-white p-3 rounded-md">
                        <h3 className="text-lg font-bold">
                          ❌ Errores en la carga:
                        </h3>
                        <ul className="mt-2">
                          {errores.map((error, index) => (
                            <li key={index}>
                              ⚠️ {error.producto}: {error.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ❌ Botón de Cerrar */}
                <button
                  onClick={() => setModalCargaMasiva(false)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition cursor-pointer w-full"
                >
                  ❌ Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        

        {/* 🔍 Filtros (con fondo oscuro) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          />

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          >
            <option value="">📁 Todas las Categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="💲 Precio mínimo"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          />

          <input
            type="number"
            placeholder="💲 Precio máximo"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 w-full rounded-md focus:ring focus:ring-teal-400"
          />
        </div>
 


        {/* 📋 Tabla de productos con fondo oscuro */}
        <div className="overflow-x-auto rounded-lg shadow-md">
  {productosSeleccionados.length > 0 && (
    <button
      onClick={eliminarProductosSeleccionados}
      className="mb-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md shadow-md transition cursor-pointer"
    >
      🗑 Eliminar Seleccionados ({productosSeleccionados.length})
    </button>
  )}
  <table className="w-full border-collapse bg-gray-800 text-white rounded-lg">
    <thead className="bg-gray-900 text-white">
      <tr>
        <th className="border px-2 py-2 text-center w-8 !border-none bg-black"></th>
        <th className="border px-4 py-2">🛠</th>
        <th className="border px-4 py-2">ID</th>
        <th className="border px-4 py-2">Nombre</th>
        <th className="border px-4 py-2">Cantidad</th>
        <th className="border px-4 py-2">Precio U.</th>
        <th className="border px-4 py-2">💰 Total</th>
        {usuario?.rol === "admin" && <th className="border px-4 py-2">Creado por</th>}
        <th className="border px-4 py-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {productosPaginados.length > 0 ? (
        productosPaginados.map((producto) => (
          <tr key={producto.id} className="hover:bg-gray-700 transition">
            <td className="px-2 py-2 text-center !border-none bg-black">
              {producto.cantidad <= (producto.stockMinimo || 5) && (
                <span title="Stock bajo" className="animate-pulse text-yellow-400">⚠️</span>
              )}
            </td>
            <td className="border px-4 py-2 text-center">
              <input
                type="checkbox"
                checked={productosSeleccionados.includes(producto.id)}
                onChange={() => toggleSeleccion(producto.id)}
              />
            </td>
            <td className="border px-4 py-2">{producto.id}</td>
            <td className="border px-4 py-2 font-semibold">{producto.nombre}</td>
            <td className="border px-4 py-2">{producto.cantidad}</td>
            <td className="border px-4 py-2">${producto.precio}</td>
            <td className="border px-4 py-2 font-bold text-green-400">${producto.precio * producto.cantidad}</td>
            {usuario?.rol === "admin" && (
              <td className="border px-4 py-2">{producto.creador_nombre || "Desconocido"}</td>
            )}
            <td className="border px-4 py-2">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => abrirModalEdicion(producto)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded cursor-pointer"
                >
                  ✏️ Editar
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="8" className="border px-4 py-2 text-center text-gray-400">
            No hay productos registrados
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


       
  {/* 📄 Paginación Inteligente */}
<div className="flex justify-center mt-6 space-x-2">
  {pagina > 1 && (
    <button
      className="px-3 py-1 bg-gray-700 text-white rounded-md cursor-pointer"
      onClick={() => setPagina(pagina - 1)}
    >
      ←
    </button>
  )}

  {Array.from({
    length: totalPaginas,
  }).map((_, index) => {
    const currentPage = index + 1;
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPaginas;
    const isCurrent = currentPage === pagina;
    const isNearCurrent = Math.abs(pagina - currentPage) <= 1;

    if (
      isFirst ||
      isLast ||
      isCurrent ||
      isNearCurrent ||
      (pagina <= 3 && currentPage <= 5) ||
      (pagina >= totalPaginas - 2 && currentPage >= totalPaginas - 4)
    ) {
      return (
        <button
          key={index}
          className={`px-4 py-2 rounded-md transition cursor-pointer ${
            isCurrent ? "bg-teal-500 text-black" : "bg-gray-700 text-white"
          }`}
          onClick={() => setPagina(currentPage)}
        >
          {currentPage}
        </button>
      );
    }

    if (
      (currentPage === pagina - 2 && pagina > 4) ||
      (currentPage === pagina + 2 && pagina < totalPaginas - 3)
    ) {
      return (
        <span key={index} className="px-2 py-2 text-gray-400">
          ...
        </span>
      );
    }

    return null;
  })}

  {pagina < totalPaginas && (
    <button
      className="px-3 py-1 bg-gray-700 text-white rounded-md cursor-pointer"
      onClick={() => setPagina(pagina + 1)}
    >
      →
    </button>
  )}
</div>

      </div>
      {/* 🔧 Modal de Edición */}
      {modalAbierto && productoEditado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">✏️ Editar Producto</h2>
            <form onSubmit={handleModificarProducto} className="grid gap-3">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del producto"
                value={productoEditado.nombre}
                onChange={handleChangeEdicion}
                className="border p-2 w-full rounded-md"
                required
              />
              <input
                type="number"
                name="cantidad"
                placeholder="Cantidad"
                value={productoEditado.cantidad}
                onChange={handleChangeEdicion}
                 min="0"
                className="border p-2 w-full rounded-md"
                required
              />
              <input
                type="number"
                name="precio"
                placeholder="Precio"
                value={productoEditado.precio}
                onChange={handleChangeEdicion}
                 min="0"
                className="border p-2 w-full rounded-md"
                required
              />

              <select
                name="categoriaId"
                value={productoEditado.categoriaId || ""}
                onChange={handleChangeEdicion}
                className="border p-2 w-full rounded-md"
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
