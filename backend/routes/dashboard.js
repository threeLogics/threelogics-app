import express from "express";
import supabase from "../supabaseClient.js";
import PDFDocument from "pdfkit";
import { verificarToken } from "../middleware/authMiddleware.js"; 
import { Parser } from "json2csv";
const router = express.Router();


router.get("/estadisticas", verificarToken, async (req, res) => {
  try {
    console.log("🛠️ Usuario recibido:", req.usuario);
    const usuario = req.usuario || { nombre: "Usuario Desconocido" };

    let whereCondition = {};
    if (usuario.rol !== "admin") {
      whereCondition = { usuario_id: usuario.id };
    }

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

    const movimientosDataQuery = supabase
      .from("movimientos")
      .select("producto_id");

    if (usuario.rol !== "admin") {
      movimientosDataQuery.eq("user_id", usuario.id);
    }

    const { data: movimientosData, error: errorMovimientos } =
      await movimientosDataQuery;

    if (errorMovimientos) throw errorMovimientos;

    const productosCount = {};
    movimientosData.forEach((mov) => {
      if (mov.producto_id) {
        productosCount[mov.producto_id] =
          (productosCount[mov.producto_id] || 0) + 1;
      }
    });

    const productosOrdenados = Object.entries(productosCount)
      .sort((a, b) => b[1] - a[1])
      .map(([producto_id, total]) => ({ producto_id, total }));

    const productosMasMovidos =
      productosOrdenados.length > 0 ? productosOrdenados.slice(0, 5) : [];
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

    const productosPorCategoriaQuery = supabase
      .from("productos")
      .select("categoria_id, cantidad");

    if (usuario.rol !== "admin") {
      productosPorCategoriaQuery.eq("user_id", usuario.id);
    }

    const { data: productosPorCategoria, error: errorCategorias } =
      await productosPorCategoriaQuery;

    if (errorCategorias) throw errorCategorias;

    const categoriaCount = {};
    productosPorCategoria.forEach((prod) => {
      if (prod.categoria_id) {
        categoriaCount[prod.categoria_id] =
          (categoriaCount[prod.categoria_id] || 0) + (prod.cantidad || 0);
      }
    });

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

    const fechaInicioMesAnterior = new Date();
    fechaInicioMesAnterior.setMonth(fechaInicioMesAnterior.getMonth() - 1);
    fechaInicioMesAnterior.setDate(1);

    const fechaFinMesAnterior = new Date();
    fechaFinMesAnterior.setDate(0); 

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

    const conteoPorDia = {};
    pedidosPorDia.forEach(({ fecha }) => {
      const dia = new Date(fecha).toISOString().split("T")[0];
      conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
    });

    const volumenPedidosPorDia = Object.entries(conteoPorDia).map(
      ([fecha, total]) => ({ fecha, total })
    );
    const { data: movimientosUsuarios, error: errorMovUsuarios } =
      await supabase.from("movimientos").select("user_id");

    if (errorMovUsuarios) {
      console.error("❌ Error al obtener movimientos:", errorMovUsuarios);
      return res.status(500).json({ error: "Error al obtener movimientos" });
    }

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

    const usuarioConteo = {};
    movimientosUsuarios.forEach(({ user_id }) => {
      usuarioConteo[user_id] = (usuarioConteo[user_id] || 0) + 1;
    });

    const clienteMasActivoId = Object.entries(usuarioConteo).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    const clienteMasActivo = usuariosMap[clienteMasActivoId] || "Desconocido";

    const productosMasMovidosConCliente = await Promise.all(
      productosMasMovidosConNombre.map(async (prod) => {
        if (!prod?.producto_id) {
          return { ...prod, cliente: "Desconocido" };
        }

        const { data: movimiento, error } = await supabase
          .from("movimientos")
          .select("user_id")
          .eq("producto_id", prod.producto_id)
          .order("fecha", { ascending: false }) 
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
      productosMasMovidos: productosMasMovidosConCliente, 
      categoriaMasPopular,
      productosStock,
      distribucionCategorias: distribucionCategoriasConCliente, 
      movimientosEntradaMesAnterior,
      volumenPedidosPorDia,
      clienteMasActivo, 
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/demanda-productos", verificarToken, async (req, res) => {
  try {
    const usuario = req.usuario;

    const { data: detalles, error } = await supabase
      .from("detallepedidos")
      .select("cantidad, producto_id, pedido_id");

    if (error) throw error;

    const { data: pedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select("id, fecha, user_id");

    if (errorPedidos) throw errorPedidos;

    const detallesUsuario =
      usuario.rol === "admin"
        ? detalles
        : detalles.filter((detalle) => {
            const pedido = pedidos.find((p) => p.id === detalle.pedido_id);
            return pedido && pedido.user_id === usuario.id;
          });

    const productoIds = [
      ...new Set(detallesUsuario.map((d) => d.producto_id).filter(Boolean)),
    ];

    const { data: productos, error: errorProductos } = await supabase
      .from("productos")
      .select("id, nombre")
      .in("id", productoIds);

    if (errorProductos) throw errorProductos;

    const pedidosPorProducto = detallesUsuario
      .map((d) => {
        const producto = productos.find((p) => p.id === d.producto_id);
        return producto
          ? {
              nombre: producto.nombre,
              cantidad: d.cantidad,
            }
          : null; 
      })
      .filter(Boolean); 

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
    const whereCondition = esAdmin ? {} : { user_id: usuario.id };
    const nombreUsuario = usuario.nombre || usuario.email || "Usuario";

    const { data: movimientos, error: errorMov } = await supabase
      .from("movimientos")
      .select("id, tipo, cantidad, fecha, user_id, producto:productos(nombre)")
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (errorMov || !movimientos || movimientos.length === 0) {
      console.error("❌ No hay movimientos para generar el PDF");
      return res.status(404).json({ error: "No hay movimientos para generar el PDF" });
    }

    let movimientosConUsuario = movimientos;
    if (esAdmin) {
      const { data: usuarios, error: errorUsuarios } = await supabase.auth.admin.listUsers();
      if (errorUsuarios) {
        console.error("❌ Error al obtener usuarios:", errorUsuarios);
        return res.status(500).json({ error: "Error al obtener usuarios" });
      }

      const usuariosMap = {};
      usuarios.users.forEach((u) => {
        usuariosMap[u.id] = u.user_metadata?.nombre || u.email || "Desconocido";
      });

      movimientosConUsuario = movimientos.map((mov) => ({
        ...mov,
        nombreUsuario: usuariosMap[mov.user_id] || "Desconocido",
      }));
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Disposition", 'attachment; filename="reporte_movimientos.pdf"');
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de Movimientos", { align: "center" }).moveDown();
    doc.font("Helvetica").fontSize(12)
      .text(`Usuario: ${nombreUsuario}`)
      .text(`Fecha: ${new Date().toLocaleDateString()}`)
      .moveDown();

    const startX = 40;
    const rowHeight = 20;
    const columnWidths = [60, 100, 70, 70, 140];
    if (esAdmin) columnWidths.push(100); 
    let y = doc.y;

    const renderEncabezado = () => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("ID", startX, y, { width: columnWidths[0], align: "left" })
        .text("Producto", startX + columnWidths[0], y, { width: columnWidths[1], align: "left" })
        .text("Tipo", startX + columnWidths[0] + columnWidths[1], y, { width: columnWidths[2], align: "left" })
        .text("Cantidad", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y, { width: columnWidths[3], align: "left" })
        .text("Fecha", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, { width: columnWidths[4], align: "left" });

      if (esAdmin) {
        doc.text("Realizado por", startX + columnWidths.slice(0, 5).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[5],
          align: "left",
        });
      }

      y += rowHeight;
    };

    renderEncabezado();

    movimientosConUsuario.forEach((mov) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
        renderEncabezado();
      }

      const shortId = mov.id.slice(0, 8);
      const producto = mov.producto?.nombre || "N/A";
      const tipo = mov.tipo === "entrada" ? "Entrada" : "Salida";
      const fecha = new Date(mov.fecha).toLocaleString();
      const nombreUsuario = mov.nombreUsuario || "";

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(shortId, startX, y, { width: columnWidths[0], align: "left" })
        .text(producto, startX + columnWidths[0], y, { width: columnWidths[1], align: "left" })
        .text(tipo, startX + columnWidths[0] + columnWidths[1], y, { width: columnWidths[2], align: "left" })
        .text(mov.cantidad.toString(), startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y, {
          width: columnWidths[3],
          align: "left",
        })
        .text(fecha, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, {
          width: columnWidths[4],
          align: "left",
        });

      if (esAdmin) {
        doc.text(nombreUsuario, startX + columnWidths.slice(0, 5).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[5],
          align: "left",
        });
      }

      doc
        .moveTo(startX, y + rowHeight - 5)
        .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y + rowHeight - 5)
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .stroke();

      y += rowHeight;
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
    const whereCondition = esAdmin ? {} : { user_id: usuario.id };

    const { data: movimientos, error: errorMov } = await supabase
      .from("movimientos")
      .select("id, tipo, cantidad, fecha, user_id, producto:productos(nombre)")
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (errorMov || !movimientos || movimientos.length === 0) {
      console.error("❌ No hay movimientos para generar el CSV");
      return res
        .status(404)
        .json({ error: "No hay movimientos para generar el CSV" });
    }

    let usuariosMap = {};
    if (esAdmin) {
      const { data: usuarios, error: errorUsuarios } =
        await supabase.auth.admin.listUsers();

      if (errorUsuarios) {
        console.error("❌ Error al obtener usuarios:", errorUsuarios);
        return res.status(500).json({ error: "Error al obtener usuarios" });
      }

      usuarios.users.forEach((u) => {
        usuariosMap[u.id] = u.user_metadata?.nombre || u.email || "Desconocido";
      });
    }

    const datosPlano = movimientos.map((mov) => {
      const fila = {
        ID: mov.id.slice(0, 8),
        Producto: mov.producto?.nombre || "N/A",
        Tipo: mov.tipo === "entrada" ? "Entrada" : "Salida",
        Cantidad: mov.cantidad,
        Fecha: new Date(mov.fecha).toLocaleString(),
      };

      if (esAdmin) {
        fila["Realizado por"] = usuariosMap[mov.user_id] || "Desconocido";
      }

      return fila;
    });

    const parser = new Parser({ delimiter: ";" });
    const csv = parser.parse(datosPlano);

    res.setHeader("Content-Disposition", 'attachment; filename="reporte_movimientos.csv"');
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);

    console.log("✅ Reporte CSV generado correctamente");
  } catch (error) {
    console.error("❌ Error generando CSV:", error);
    res.status(500).json({ error: "Error al generar el CSV" });
  }
});



router.get("/reporte-productos", verificarToken, async (req, res) => {
  try {
    console.log("📥 Generando reporte de productos en PDF...");

    const { usuario } = req;
    const esAdmin = usuario.rol === "admin";

    const { data: productos, error } = await supabase.from("productos").select("*");
    if (error || !productos || productos.length === 0) {
      console.error("❌ No se pudieron obtener los productos:", error);
      return res.status(404).json({ error: "No se pudieron obtener los productos." });
    }

    const productosFiltrados = esAdmin
      ? productos
      : productos.filter((p) => p.user_id === usuario.id);

    let usuariosMap = {};
    if (esAdmin) {
      const { data: usuarios, error: errorUsuarios } = await supabase.auth.admin.listUsers();
      if (errorUsuarios) {
        console.error("❌ Error al obtener usuarios:", errorUsuarios);
        return res.status(500).json({ error: "Error al obtener usuarios" });
      }
      usuarios.users.forEach((u) => {
        usuariosMap[u.id] = u.user_metadata?.nombre || u.email || "Desconocido";
      });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Disposition", 'attachment; filename="reporte_productos.pdf"');
    res.setHeader("Content-Type", "application/pdf; charset=utf-8");
    doc.pipe(res);

    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de Productos", { align: "center" }).moveDown();
    doc.font("Helvetica").fontSize(12)
      .text(`Usuario: ${usuario.nombre || usuario.email}`)
      .text(`Fecha: ${new Date().toLocaleDateString()}`)
      .moveDown();

    const startX = 40;
    const rowHeight = 20;
    const columnWidths = [60, 130, 60, 80, 80];
    if (esAdmin) columnWidths.push(120); 
    let y = doc.y;

    const renderEncabezado = () => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("ID", startX, y, { width: columnWidths[0], align: "left" })
        .text("Nombre", startX + columnWidths[0], y, { width: columnWidths[1], align: "left" })
        .text("Cantidad", startX + columnWidths[0] + columnWidths[1], y, { width: columnWidths[2], align: "left" })
        .text("Precio U.", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y, { width: columnWidths[3], align: "left" })
        .text("Total", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, { width: columnWidths[4], align: "left" });

      if (esAdmin) {
        doc.text("Creado por", startX + columnWidths.slice(0, 5).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[5],
          align: "left",
        });
      }

      y += rowHeight;
    };

    renderEncabezado();

    doc.font("Helvetica").fontSize(10);
    productosFiltrados.forEach((p) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
        renderEncabezado();
      }

      const shortId = p.id.slice(0, 8);
      const nombre = (p.nombre || "-").slice(0, 30);
      const cantidad = p.cantidad?.toString() || "0";
      const precio = `${p.precio} €`;
      const total = `${(Number(p.precio) || 0) * (Number(p.cantidad) || 0)} €`;
      const creador = esAdmin ? usuariosMap[p.user_id]?.slice(0, 25) || "Desconocido" : "";

      doc
        .text(shortId, startX, y, { width: columnWidths[0], align: "left" })
        .text(nombre, startX + columnWidths[0], y, { width: columnWidths[1], align: "left" })
        .text(cantidad, startX + columnWidths[0] + columnWidths[1], y, { width: columnWidths[2], align: "left" })
        .text(precio, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y, { width: columnWidths[3], align: "left" })
        .text(total, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, { width: columnWidths[4], align: "left" });

      if (esAdmin) {
        doc.text(creador, startX + columnWidths.slice(0, 5).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[5],
          align: "left",
        });
      }

      doc
        .moveTo(startX, y + rowHeight - 5)
        .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y + rowHeight - 5)
        .strokeColor("#ccc")
        .lineWidth(0.5)
        .stroke();

      y += rowHeight;
    });

    doc.end();
    console.log("✅ PDF de productos generado correctamente");
  } catch (err) {
    console.error("❌ Error generando PDF de productos:", err);
    res.status(500).json({ error: "Error al generar el PDF de productos" });
  }
});





export default router;
