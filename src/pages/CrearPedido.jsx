import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function CrearPedido() {
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await api.get("/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      toast.error("❌ Error al cargar productos.");
    }
  };

  // 📌 Manejar cambios en el input de cantidad
  const handleCantidadChange = (productoId, cantidad) => {
    if (cantidad < 1) cantidad = 1;
    setCantidades({ ...cantidades, [productoId]: cantidad });
  };

  // 📌 Agregar producto con cantidad personalizada
  const agregarProducto = (producto) => {
    const cantidadSeleccionada = cantidades[producto.id] || 1;
    const existe = pedido.find((p) => p.productoId === producto.id);

    if (existe) {
      setPedido(
        pedido.map((p) =>
          p.productoId === producto.id
            ? { ...p, cantidad: cantidadSeleccionada }
            : p
        )
      );
    } else {
      setPedido([
        ...pedido,
        { productoId: producto.id, cantidad: cantidadSeleccionada },
      ]);
    }

    toast.success(
      `🛒 ${producto.nombre} añadido con ${cantidadSeleccionada} unidades`
    );
  };

  const quitarProducto = (productoId) => {
    setPedido(pedido.filter((p) => p.productoId !== productoId));
  };

  // 📌 Nueva función para limpiar el carrito
  const limpiarCarrito = () => {
    if (pedido.length === 0) {
      toast.warning("⚠️ El carrito ya está vacío.");
      return;
    }

    if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      setPedido([]);
      toast.success("🗑 Carrito vaciado correctamente.");
    }
  };

  const calcularTotal = () => {
    return pedido.reduce((total, p) => {
      const producto = productos.find((prod) => prod.id === p.productoId);
      return total + (producto ? producto.precio * p.cantidad : 0);
    }, 0);
  };

  const realizarPedido = async () => {
    if (pedido.length === 0) {
      toast.warning("⚠️ Debes seleccionar al menos un producto.");
      return;
    }

    try {
      const response = await api.post("/pedidos", { productos: pedido });

      toast.success("✅ Pedido realizado con éxito.");
      setPedido([]);

      setTimeout(() => {
        navigate("/pedidos");
      }, 2000);
    } catch (error) {
      console.error("❌ Error al realizar pedido:", error);
      toast.error("❌ Error al realizar el pedido.");
    }
  };


return (
  <div className="w-full min-h-screen bg-black flex justify-center items-center pt-10">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="p-8 max-w-4xl w-full bg-gray-900 text-white rounded-lg shadow-2xl"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-3xl font-bold text-teal-400 mb-6 text-center"
      >
        📝 Crear Pedido
      </motion.h1>

      {/* Seleccionar Productos */}
      <h2 className="text-xl font-semibold mb-4">🛒 Seleccionar Productos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {productos.map((producto) => (
          <motion.div
            key={producto.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 border border-gray-700 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
          >
            <h3 className="font-semibold text-lg">{producto.nombre}</h3>
            <p className="text-gray-400">💰 ${producto.precio.toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              📦 Stock disponible: {producto.cantidad}
            </p>
            <input
              type="number"
              min="1"
              value={cantidades[producto.id] || 1}
              onChange={(e) =>
                handleCantidadChange(producto.id, parseInt(e.target.value))
              }
              className="border border-gray-700 bg-gray-900 text-white p-2 w-16 text-center mt-2 rounded-lg focus:ring-2 focus:ring-teal-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => agregarProducto(producto)}
              className="mt-2 bg-green-500 text-black font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer
                         hover:shadow-[0px_0px_20px_rgba(45,212,191,0.8)] hover:bg-green-600"
            >
              ➕ Agregar
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Tu Pedido */}
      <h2 className="text-xl font-semibold mt-6">🛍️ Tu Pedido</h2>
      {pedido.length === 0 ? (
        <p className="text-gray-400">No has agregado productos.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4 p-4 border border-gray-700 bg-gray-800 rounded-lg shadow-md"
        >
          <ul className="space-y-2">
            {pedido.map((p) => (
              <li key={p.productoId} className="flex justify-between items-center">
                <span className="text-gray-300">
                  {productos.find((prod) => prod.id === p.productoId)?.nombre} -{" "}
                  {p.cantidad} unidades
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => quitarProducto(p.productoId)}
                  className="text-red-500 hover:text-red-400 transition"
                >
                  ❌
                </motion.button>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-bold text-lg text-teal-400">
            Total: ${calcularTotal().toFixed(2)}
          </h3>

          {/* Botón para limpiar carrito */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={limpiarCarrito}
            className="mt-3 bg-red-500 text-black font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer
                       hover:shadow-[0px_0px_20px_rgba(220,38,38,0.8)] hover:bg-red-600"
          >
            🗑 Vaciar Carrito
          </motion.button>
        </motion.div>
      )}

      {/* Botón para realizar pedido */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={realizarPedido}
        className="mt-6 bg-blue-500 text-black font-semibold px-6 py-3 rounded-lg transition-all cursor-pointer
                   hover:shadow-[0px_0px_20px_rgba(59,130,246,0.8)] hover:bg-blue-600"
      >
        🛒 Realizar Pedido
      </motion.button>
    </motion.div>
  </div>
);

}

export default CrearPedido;
