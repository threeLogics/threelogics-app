    import { useEffect, useState } from "react";
    import supabase from "../supabaseClient";
    import { motion } from "framer-motion";
    import { useSearchParams } from "react-router-dom";

    const Ubicaciones = () => {
      const [ubicaciones, setUbicaciones] = useState([]);
      const [loading, setLoading] = useState(true);
      const [userRole, setUserRole] = useState(null);
      const [searchParams, setSearchParams] = useSearchParams();
      const pedidoId = searchParams.get("pedidoId"); // obtiene pedidoId desde URL
      const [modalOpen, setModalOpen] = useState(false);
      const [ubicacionesModal, setUbicacionesModal] = useState([]);
      const [searchTerm, setSearchTerm] = useState("");
      const [orden, setOrden] = useState("nombre-asc");
      const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState("");





      useEffect(() => {
        const fetchCategorias = async (userId, role) => {
          try {
            let query = supabase.from("categorias").select("*");
      
            if (role !== "admin") {
              query = query.eq("user_id", userId);
            }
      
            const { data, error } = await query;
            if (error) throw error;
      
            setCategorias(data);
          } catch (err) {
            console.error("Error al obtener categorías:", err);
          }
        };
      
        const fetchUbicaciones = async () => {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
              console.error("Error al obtener el usuario:", userError);
              return;
            }

            const role = user.user_metadata?.rol || "cliente";
            setUserRole(role);
            await fetchCategorias(user.id, role);
            let query = supabase
              .from("ubicaciones")
              .select(`
                id, almacen, estanteria, posicion, altura, 
                productos!ubicaciones_producto_id_fkey(
                id, nombre, descripcion, user_id, cantidad, stock_minimo, categoria_id
                )
              `);

            if (role !== "admin") {
              query = query.eq("productos.user_id", user.id);
            }

            const { data, error } = await query;
            if (error) throw error;

            const ubicacionesFiltradas = data.filter(
              (ubicacion) => ubicacion.productos && ubicacion.productos.nombre
            );

            setUbicaciones(ubicacionesFiltradas || []);

            

            if (pedidoId) {
              // Aquí obtienes la ubicación específica relacionada con pedidoId
              const { data: pedidoData, error: pedidoError } = await supabase
                .from("detallepedidos")
                .select(`producto_id`)
                .eq("pedido_id", pedidoId);

              if (pedidoError) throw pedidoError;

              const productosPedido = pedidoData.map((detalle) => detalle.producto_id);

              const ubicacionesDelPedido = ubicacionesFiltradas.filter((ubicacion) =>
                productosPedido.includes(ubicacion.productos.id)
              );

              setUbicacionesModal(ubicacionesDelPedido);
              setModalOpen(true);
            }

          } catch (error) {
            console.error("Error al obtener ubicaciones:", error);
          } finally {
            setLoading(false);
          }
        };
        
        

        fetchUbicaciones();
      }, [pedidoId]);

      const fadeIn = {
        hidden: { opacity: 0, y: 0 },
        visible: { opacity: 1, y: 10, transition: { duration: 0.5 } },
      };
      const ubicacionesFiltradas = ubicaciones
      .filter((u) =>
        `${u.productos?.nombre || ""} ${u.almacen} ${u.estanteria} ${u.posicion}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .filter((u) => !filtroCategoria || u.productos?.categoria_id === filtroCategoria)
      .sort((a, b) => {
        if (orden === "nombre-asc") {
          return a.productos?.nombre?.localeCompare(b.productos?.nombre);
        } else if (orden === "nombre-desc") {
          return b.productos?.nombre?.localeCompare(a.productos?.nombre);
        }
        return 0;
      });


    
      

      
      return (
        <div className="flex flex-col items-start pt-20 min-h-screen bg-black text-white p-6">
          <div className="w-full max-w-6xl mx-auto">
            <motion.h1 variants={fadeIn} initial="hidden" animate="visible" className="text-left mb-8 text-3xl font-bold text-teal-400">
              📍 Ubicaciones y Proceso Logístico
            </motion.h1>

            <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg border border-teal-400">
              <h2 className="text-2xl font-bold text-teal-300 mb-4">🚚 Proceso de Entrada y Salida</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">📥 Recepción (Entrada)</h3>
                  <ol className="mt-2 text-gray-300 list-decimal list-inside">
                    <li>Recepción</li>
                    <li>Ubicación</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">📤 Expedición (Salida)</h3>
                  <ol className="mt-2 text-gray-300 list-decimal list-inside">
                    <li>Ubicación</li>
                    <li>Playa de expediciones</li>
                    <li>Carga en camión</li>
                  </ol>
                </div>
              </div>
            </div>
            



            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="🔍 Buscar por producto ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 w-full md:max-w-sm rounded bg-gray-700 text-white placeholder-gray-400"
      />

      <select
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        className="p-2 w-full md:max-w-xs rounded bg-gray-700 text-white"
      >
        <option value="nombre-asc">🔤 Nombre A-Z</option>
        <option value="nombre-desc">🔠 Nombre Z-A</option>
      </select>

      <select
        value={filtroCategoria}
        onChange={(e) => setFiltroCategoria(e.target.value)}
        className="p-2 w-full md:max-w-xs rounded bg-gray-700 text-white"
      >
        <option value="">📁 Todas las Categorías</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>
    </div>


          
            
            {loading ? (
              <p className="text-center">Cargando ubicaciones...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
      {ubicacionesFiltradas.map((u) => {
        // ✅ Lógica del stock
        const cantidad = u.productos.cantidad;
        const minimo = u.productos.stock_minimo;
        const stockBajo = cantidad < minimo;

        return (
          <motion.div
            key={u.id}
            className={`bg-gray-900 p-6 rounded-lg shadow-lg border ${
              stockBajo ? "border-red-500" : "border-teal-400"
            }`}
          >
            <h2 className="text-teal-400">Producto: {u.productos.nombre}</h2>
            <p>{u.productos.descripcion || "Sin descripción"}</p>

            {/* ⚠️ Indicador de stock bajo */}
            {stockBajo && (
              <p className="text-red-400 font-semibold mt-2">⚠️ Stock bajo</p>
            )}

            <div className="mt-4 text-gray-400">
              <p>Almacén: {u.almacen}</p>
              <p>Estantería: {u.estanteria}</p>
              <p>Posición: {u.posicion}</p>
              <p>Altura: {u.altura}</p>
            </div>
          </motion.div>
        );
      })}
    </div>

            )}

            {modalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-4xl mx-auto relative">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setSearchParams({});
                    }}
                    className="absolute top-2 right-2 text-red-500 text-xl cursor-pointer"
                  >
                    ✖️
                  </button>
                  <h2 className="text-2xl text-teal-400 mb-4">📌 Ubicaciones del Pedido</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ubicacionesModal.map((u) => (
                      <div key={u.id} className="bg-gray-900 p-4 rounded shadow border border-teal-300">
                        <h3 className="text-teal-300">Producto: {u.productos.nombre}</h3>
                        <p>{u.productos.descripcion || "Sin descripción"}</p>
                        <div className="mt-2 text-gray-400">
                          <p>Almacén: {u.almacen}</p>
                          <p>Estantería: {u.estanteria}</p>
                          <p>Posición: {u.posicion}</p>
                          <p>Altura: {u.altura}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
      

    export default Ubicaciones;
