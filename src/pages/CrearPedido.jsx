import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import MetaData from '../components/MetaData';

function CrearPedido() {
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [tipoPedido, setTipoPedido] = useState("");
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

  const handleCantidadChange = (productoId, cantidad) => {
    if (cantidad < 1) cantidad = 1;
    setCantidades({ ...cantidades, [productoId]: cantidad });
  };

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

  const limpiarCarrito = () => {
    if (pedido.length === 0) {
      toast.warning("⚠️ El carrito ya está vacío.");
      return;
    }
  
    confirmarVaciadoCarrito(() => setPedido([]));
  };
  

    const confirmarVaciadoCarrito = (vaciarCarrito) => {
      toast(
        ({ closeToast }) => (
          <div className="text-teal">
            <p className="mb-2 text-teal">⚠️ ¿Seguro que quieres vaciar el carrito?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-500 px-4 py-2 text-black rounded hover:bg-red-700 transition"
                onClick={() => {
                  vaciarCarrito();
                  closeToast();
                  toast.success("🗑 Carrito vaciado correctamente.");
                }}
              >
                🗑 Sí, vaciar
              </button>
              <button
                className="bg-gray-500 px-4 py-2 text-black rounded hover:bg-gray-700 transition"
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
      await api.post("/pedidos", {
        productos: pedido,
        tipo: tipoPedido,
      });

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
          <MetaData
        title="Crear Pedido | ThreeLogics"
        description="Crea un nuevo pedido con los productos disponibles en ThreeLogics. Organiza tus movimientos de entrada y salida de inventario fácilmente."
        imageUrl="https://threelogicsapp.vercel.app/og-image.png"
        keywords="crear pedido, gestión de pedidos, entrada, salida, inventarios, logística, software para pymes"
      />
      
      <motion.div className="p-8 max-w-4xl w-full bg-gray-900 text-white rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center">
          📝 Crear Pedido
        </h1>

        {/* 🔹 Selector de Tipo de Pedido */}
        <label className="block text-white mb-2">Tipo de Pedido:</label>

<select
  value={tipoPedido}
  onChange={(e) => setTipoPedido(e.target.value)}
  className={`border text-white p-2 rounded-lg w-full mb-4 cursor-pointer
    ${tipoPedido === "salida" ? "bg-red-600 border-red-400" : ""}
    ${tipoPedido === "entrada" ? "bg-green-600 border-green-400" : ""}
    ${tipoPedido === "" ? "bg-gray-900 border-yellow-400 text-yellow-400" : ""}
  `}
>
<option value=""  className="hidden">
    🛒 Selecciona el tipo de pedido
  </option>
  <option
    value="salida"
    className="bg-gray-900 text-white"
  >
    🚚 Pedido de Salida
  </option>
  <option
    value="entrada"
    className="bg-gray-900 text-white"
  >
    📦 Pedido de Entrada
  </option>
</select>


        {/* 🔹 Lista de Productos Disponibles */}
        <h2 className="text-xl font-semibold mb-4">🛒 Seleccionar Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {productos.map((producto) => (
            <motion.div
              key={producto.id}
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
                onClick={() => agregarProducto(producto)}
                className="mt-2 bg-green-500 text-black font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer hover:bg-green-600"
              >
                ➕ Agregar
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* 🔹 Carrito del Pedido */}
        <h2 className="text-xl font-semibold mt-6">🛍️ Tu Pedido</h2>
        {pedido.length === 0 ? (
          <p className="text-gray-400">No has agregado productos.</p>
        ) : (
          <motion.div className="mt-4 p-4 border border-gray-700 bg-gray-800 rounded-lg shadow-md">
            <ul className="space-y-2">
              {pedido.map((p) => (
                <li
                  key={p.productoId}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-300">
                    {productos.find((prod) => prod.id === p.productoId)?.nombre}{" "}
                    - {p.cantidad} unidades
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

            {/* 🔹 Botón para limpiar carrito */}
            <motion.button
  onClick={limpiarCarrito}
  className="px-5 py-2 rounded-md shadow-md transition cursor-pointer bg-red-500 hover:bg-red-600 text-white"
>
  🗑 Vaciar Carrito
</motion.button>

          </motion.div>
        )}

        {/* 🔹 Botón para realizar pedido */}
        <motion.button
  onClick={realizarPedido}
  disabled={tipoPedido === ""}
  className={`mt-6 font-semibold px-6 py-3 rounded-lg transition-colors duration-300
    ${tipoPedido === "" 
      ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
      : "bg-blue-500 text-black hover:bg-blue-600 cursor-pointer"
    }`}
>
  🛒 Realizar Pedido
</motion.button>

      </motion.div>
    </div>
  );
}

export default CrearPedido;
