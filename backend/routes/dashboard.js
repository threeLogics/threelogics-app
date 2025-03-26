import express from "express";
import supabase from "../supabaseClient.js";
import PDFDocument from "pdfkit";
import { verificarToken } from "../middleware/authMiddleware.js"; // Middleware de autenticación
import { Parser } from "json2csv";
const router = express.Router();


// 📌 Obtener estadísticas generales (Autenticado)
router.get("/estadisticas", verificarToken, async (req, res) => {
  try {
    console.log("🛠️ Usuario recibido:", req.usuario);
    const usuario = req.usuario || { nombre: "Usuario Desconocido" };

    let whereCondition = {};
    if (usuario.rol !== "admin") {
      whereCondition = { usuario_id: usuario.id };
    }

    // 📦 Cantidad total de productos en stock (según usuario)
    const productosQuery = supabase
      .from("productos")
      .select("*", { count: "exact" });

    if (usuario.rol !== "admin") {
      productosQuery.eq("user_id", usuario.id);
    }

    const { count: totalProductos } = await productosQuery;

    const stockQuery = supabase.from("productos").select("cantidad");

    if (usuario.rol !== "admin") {
      stockQuery.eq("user_id", usuario.id);
    }

    const { data: stockData, error: errorStock } = await stockQuery;

    if (errorStock || !stockData) {
      console.error("❌ Error obteniendo stock:", errorStock);
      return res.status(500).json({ error: "Error al obtener stock." });
    }

    const totalStock = stockData.reduce(
      (acc, prod) => acc + (prod.cantidad || 0),
      0
    );

    // 📊 Cantidad de movimientos en los últimos 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const totalMovimientosQuery = supabase
      .from("movimientos")
      .select("*", { count: "exact" })
      .gte("fecha", fechaLimite.toISOString());

    if (usuario.rol !== "admin") {
      totalMovimientosQuery.eq("user_id", usuario.id);
    }

    const { count: totalMovimientos } = await totalMovimientosQuery;
    const movimientosEntradaQuery = supabase
      .from("movimientos")
      .select("*", { count: "exact" })
      .eq("tipo", "entrada")
      .gte("fecha", fechaLimite.toISOString());

    if (usuario.rol !== "admin") {
      movimientosEntradaQuery.eq("user_id", usuario.id);
    }

    const { count: movimientosEntrada } = await movimientosEntradaQuery;

    const movimientosSalidaQuery = supabase
      .from("movimientos")
      .select("*", { count: "exact" })
      .eq("tipo", "salida")
      .gte("fecha", fechaLimite.toISOString());

    if (usuario.rol !== "admin") {
      movimientosSalidaQuery.eq("user_id", usuario.id);
    }

    const { count: movimientosSalida } = await movimientosSalidaQuery;

    // 🔹 Obtener todos los movimientos para agrupar manualmente
    const movimientosDataQuery = supabase
      .from("movimientos")
      .select("producto_id");

    if (usuario.rol !== "admin") {
      movimientosDataQuery.eq("user_id", usuario.id);
    }

    const { data: movimientosData, error: errorMovimientos } =
      await movimientosDataQuery;

    if (errorMovimientos) throw errorMovimientos;

    // 🔥 Agrupar productos más movidos manualmente en el backend
    const productosCount = {};
    movimientosData.forEach((mov) => {
      if (mov.producto_id) {
        productosCount[mov.producto_id] =
          (productosCount[mov.producto_id] || 0) + 1;
      }
    });

    // 🏆 Obtener el producto más movido y los top 5 productos
    const productosOrdenados = Object.entries(productosCount)
      .sort((a, b) => b[1] - a[1])
      .map(([producto_id, total]) => ({ producto_id, total }));

    const productosMasMovidos =
      productosOrdenados.length > 0 ? productosOrdenados.slice(0, 5) : [];
    // Obtener nombres de los productos más movidos
    const topIds = productosMasMovidos.map((p) => p.producto_id);
    const { data: productosData, error: errorProductos } = await supabase
      .from("productos")
      .select("id, nombre")
      .in("id", topIds);

    if (errorProductos) {
      console.error(
        "❌ Error al obtener nombres de productos:",
        errorProductos
      );
    }
    const productosMasMovidosConNombre = productosMasMovidos.map((prod) => {
      const producto = productosData?.find((p) => p.id === prod.producto_id);
      return {
        nombre: producto?.nombre || "Desconocido",
        total: prod.total,
      };
    });
    // Obtener stock total por producto
    const productosStockQuery = supabase
      .from("productos")
      .select("nombre, cantidad");

    if (usuario.rol !== "admin") {
      productosStockQuery.eq("user_id", usuario.id);
    }

    const { data: productosStock, error: errorProductosStock } =
      await productosStockQuery;

    if (errorProductosStock) {
      console.error(
        "❌ Error al obtener stock por producto:",
        errorProductosStock
      );
    }

    // 🔹 Obtener distribución por categoría
    const productosPorCategoriaQuery = supabase
      .from("productos")
      .select("categoria_id, cantidad");

    if (usuario.rol !== "admin") {
      productosPorCategoriaQuery.eq("user_id", usuario.id);
    }

    const { data: productosPorCategoria, error: errorCategorias } =
      await productosPorCategoriaQuery;

    if (errorCategorias) throw errorCategorias;

    // Contar stock por categoría
    const categoriaCount = {};
    productosPorCategoria.forEach((prod) => {
      if (prod.categoria_id) {
        categoriaCount[prod.categoria_id] =
          (categoriaCount[prod.categoria_id] || 0) + (prod.cantidad || 0);
      }
    });

    // Obtener nombres reales
    const { data: categoriasData } = await supabase
      .from("categorias")
      .select("id, nombre");

    const distribucionCategorias = Object.entries(categoriaCount).map(
      ([id, total]) => {
        const nombre =
          categoriasData.find((c) => c.id === id)?.nombre || "Desconocido";
        return { nombre, total };
      }
    );

    const categoriaMasPopular =
      productosOrdenados.length > 0 ? productosOrdenados[0].producto_id : "N/A";

    // 🔁 Entradas del mes anterior
    const fechaInicioMesAnterior = new Date();
    fechaInicioMesAnterior.setMonth(fechaInicioMesAnterior.getMonth() - 1);
    fechaInicioMesAnterior.setDate(1);

    const fechaFinMesAnterior = new Date();
    fechaFinMesAnterior.setDate(0); // Último día del mes anterior

    const movimientosEntradaMesAnteriorQuery = supabase
      .from("movimientos")
      .select("*", { count: "exact" })
      .eq("tipo", "entrada")
      .gte("fecha", fechaInicioMesAnterior.toISOString())
      .lte("fecha", fechaFinMesAnterior.toISOString());

    if (usuario.rol !== "admin") {
      movimientosEntradaMesAnteriorQuery.eq("user_id", usuario.id);
    }

    const { count: movimientosEntradaMesAnterior } =
      await movimientosEntradaMesAnteriorQuery;

    // 📦 Obtener volumen de pedidos por día (últimos 30 días)
    const pedidosPorDiaQuery = supabase
      .from("pedidos")
      .select("fecha")
      .gte("fecha", fechaLimite.toISOString());

    if (usuario.rol !== "admin") {
      pedidosPorDiaQuery.eq("user_id", usuario.id);
    }

    const { data: pedidosPorDia, error: errorPedidosPorDia } =
      await pedidosPorDiaQuery;

    if (errorPedidosPorDia) throw errorPedidosPorDia;

    // Agrupar por día (YYYY-MM-DD)
    const conteoPorDia = {};
    pedidosPorDia.forEach(({ fecha }) => {
      const dia = new Date(fecha).toISOString().split("T")[0];
      conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
    });

    const volumenPedidosPorDia = Object.entries(conteoPorDia).map(
      ([fecha, total]) => ({ fecha, total })
    );
    // 1. Obtener todos los movimientos (solo user_id)
    const { data: movimientosUsuarios, error: errorMovUsuarios } =
      await supabase.from("movimientos").select("user_id");

    if (errorMovUsuarios) {
      console.error("❌ Error al obtener movimientos:", errorMovUsuarios);
      return res.status(500).json({ error: "Error al obtener movimientos" });
    }

    // 2. Obtener todos los usuarios (como en el endpoint de movimientos)
    const { data: usuarios, error: errorUsuarios } =
      await supabase.auth.admin.listUsers();

    if (errorUsuarios) {
      console.error("❌ Error al obtener usuarios:", errorUsuarios);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }

    const usuariosMap = {};
    usuarios.users.forEach((u) => {
      usuariosMap[u.id] = u.user_metadata?.nombre || "Desconocido";
    });

    // 3. Calcular el cliente más activo
    const usuarioConteo = {};
    movimientosUsuarios.forEach(({ user_id }) => {
      usuarioConteo[user_id] = (usuarioConteo[user_id] || 0) + 1;
    });

    const clienteMasActivoId = Object.entries(usuarioConteo).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    const clienteMasActivo = usuariosMap[clienteMasActivoId] || "Desconocido";

    // 4. Incluir nombres de clientes en los productos más movidos
    const productosMasMovidosConCliente = await Promise.all(
      productosMasMovidosConNombre.map(async (prod) => {
        if (!prod?.producto_id) {
          return { ...prod, cliente: "Desconocido" };
        }

        const { data: movimiento, error } = await supabase
          .from("movimientos")
          .select("user_id")
          .eq("producto_id", prod.producto_id)
          .order("fecha", { ascending: false }) // último movimiento primero
          .limit(1)
          .single();

        const userId = movimiento?.user_id;
        const nombreCliente = usuariosMap[userId] || "Desconocido";

        return {
          ...prod,
          cliente: nombreCliente,
        };
      })
    );

    // 5. Incluir nombres de clientes en la distribución del stock por categoría
    const distribucionCategoriasConCliente = await Promise.all(
      distribucionCategorias.map(async (cat) => {
        const categoriaId = categoriasData.find(
          (c) => c.nombre === cat.nombre
        )?.id;

        if (!categoriaId) {
          return { ...cat, cliente: "Desconocido" };
        }

        const { data: producto, error } = await supabase
          .from("productos")
          .select("user_id")
          .eq("categoria_id", categoriaId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const userId = producto?.user_id;
        const nombreCliente = usuariosMap[userId] || "Desconocido";

        return {
          ...cat,
          cliente: nombreCliente,
        };
      })
    );

    return res.json({
      totalProductos,
      totalStock,
      totalMovimientos,
      movimientosEntrada,
      movimientosSalida,
      productosMasMovidos: productosMasMovidosConCliente, // modificado
      categoriaMasPopular,
      productosStock,
      distribucionCategorias: distribucionCategoriasConCliente, // modificado
      movimientosEntradaMesAnterior,
      volumenPedidosPorDia,
      clienteMasActivo, // nuevo campo
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 📈 Obtener datos de demanda para predicción
router.get("/demanda-productos", verificarToken, async (req, res) => {
  try {
    const usuario = req.usuario;

    // 1. Traemos los detalles de los pedidos (producto + cantidad + pedido_id)
    const { data: detalles, error } = await supabase
      .from("detallepedidos")
      .select("cantidad, producto_id, pedido_id");

    if (error) throw error;

    // 2. Traemos los pedidos para filtrar por usuario y saber fechas
    const { data: pedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select("id, fecha, user_id");

    if (errorPedidos) throw errorPedidos;

    // 3. Filtramos los detalles que pertenecen al usuario actual
    const detallesUsuario =
      usuario.rol === "admin"
        ? detalles
        : detalles.filter((detalle) => {
            const pedido = pedidos.find((p) => p.id === detalle.pedido_id);
            return pedido && pedido.user_id === usuario.id;
          });

    // 4. Obtenemos los IDs de los productos involucrados
    const productoIds = [
      ...new Set(detallesUsuario.map((d) => d.producto_id).filter(Boolean)),
    ];

    // 5. Traemos los nombres de los productos
    const { data: productos, error: errorProductos } = await supabase
      .from("productos")
      .select("id, nombre")
      .in("id", productoIds);

    if (errorProductos) throw errorProductos;

    // 6. Formateamos: { nombre, cantidad }
    const pedidosPorProducto = detallesUsuario
      .map((d) => {
        const producto = productos.find((p) => p.id === d.producto_id);
        return producto
          ? {
              nombre: producto.nombre,
              cantidad: d.cantidad,
            }
          : null; // ignorar si no se encontró
      })
      .filter(Boolean); // elimina los null

    return res.json({ pedidosPorProducto });
  } catch (error) {
    console.error("❌ Error generando predicción:", error);
    return res.status(500).json({ error: "Error generando predicción" });
  }
});

router.get("/reporte-pdf", verificarToken, async (req, res) => {
  try {
    console.log("📥 Generando reporte en PDF...");

    const { usuario } = req;
    const esAdmin = usuario.rol === "admin";

    // 1. Filtro por usuario si no es admin
    const whereCondition = esAdmin ? {} : { user_id: usuario.id };

    // 2. Obtener nombre (si tienes campo personalizado)
    const nombreUsuario = usuario.nombre || usuario.email || "Usuario";

    // 3. Obtener movimientos
    const { data: movimientos, error: errorMov } = await supabase
      .from("movimientos")
      .select("id, tipo, cantidad, fecha, producto:productos(nombre)")
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (errorMov || !movimientos || movimientos.length === 0) {
      console.error("❌ No hay movimientos para generar el PDF");
      return res
        .status(404)
        .json({ error: "No hay movimientos para generar el PDF" });
    }

    // 4. Crear documento PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_movimientos.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // ✅ Título principal
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(" Reporte de Movimientos", { align: "center" })
      .moveDown();

    // ✅ Datos del usuario
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Usuario: ${nombreUsuario}`)
      .text(`Fecha: ${new Date().toLocaleDateString()}`)
      .moveDown();

    // ✅ Encabezados de tabla
    const startX = 40;
    const spacing = 100;
    let y = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("ID", startX, y)
      .text("Producto", startX + spacing, y)
      .text("Tipo", startX + spacing * 2, y)
      .text("Cantidad", startX + spacing * 3, y)
      .text("Fecha", startX + spacing * 4, y);

    y += 20;

    // ✅ Filas de datos
    doc.font("Helvetica").fontSize(10);
    movimientos.forEach((mov) => {
      const shortId = mov.id.slice(0, 8); // ← Acortar UUID
      const producto = mov.producto?.nombre || "N/A";
      const tipo = mov.tipo === "entrada" ? "Entrada" : "Salida";
      const fecha = new Date(mov.fecha).toLocaleString();

      doc
        .text(shortId, startX, y)
        .text(producto, startX + spacing, y)
        .text(tipo, startX + spacing * 2, y)
        .text(mov.cantidad.toString(), startX + spacing * 3, y)
        .text(fecha, startX + spacing * 4, y);

      y += 20;
    });

    doc.end();
    console.log("✅ Reporte PDF generado correctamente");
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar el PDF" });
  }
});



router.get("/reporte-csv", verificarToken, async (req, res) => {
  try {
    console.log("📥 Generando reporte en CSV...");

    const { usuario } = req;
    const esAdmin = usuario.rol === "admin";

    // Filtro por usuario si no es admin
    const whereCondition = esAdmin ? {} : { user_id: usuario.id };

    // Obtener nombre del usuario (opcional)
    const nombreUsuario = usuario.nombre || usuario.email || "Usuario";

    // Obtener movimientos
    const { data: movimientos, error: errorMov } = await supabase
      .from("movimientos")
      .select("id, tipo, cantidad, fecha, producto:productos(nombre)")
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (errorMov || !movimientos || movimientos.length === 0) {
      console.error("❌ No hay movimientos para generar el CSV");
      return res
        .status(404)
        .json({ error: "No hay movimientos para generar el CSV" });
    }

    // Transformar datos a formato plano para CSV
    const datosPlano = movimientos.map((mov) => ({
      ID: mov.id.slice(0, 8),
      Producto: mov.producto?.nombre || "N/A",
      Tipo: mov.tipo === "entrada" ? "Entrada" : "Salida",
      Cantidad: mov.cantidad,
      Fecha: new Date(mov.fecha).toLocaleString(),
    }));

    // Generar CSV con json2csv
    const parser = new Parser({ delimiter: ";" }); // Puedes usar "," si prefieres
    const csv = parser.parse(datosPlano);

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_movimientos.csv"'
    );
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);

    console.log("✅ Reporte CSV generado correctamente");
  } catch (error) {
    console.error("❌ Error generando CSV:", error);
    res.status(500).json({ error: "Error al generar el CSV" });
  }
});


export default router;
