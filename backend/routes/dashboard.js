import express from "express";
import supabase from "../supabaseClient.js";
import PDFDocument from "pdfkit";
import { verificarToken } from "../middleware/authMiddleware.js"; // Middleware de autenticación

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
    const { count: totalProductos } = await supabase
      .from("productos")
      .select("*", { count: "exact" }) // 🔹 Corregido: Se usa `*` en vez de `"id"`
      .eq("user_id", usuario.id); // 🔹 Se usa `eq` en lugar de `match`

    const { data: stockData, error: errorStock } = await supabase
      .from("productos")
      .select("cantidad")
      .eq("user_id", usuario.id);

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

    const { count: totalMovimientos } = await supabase
      .from("movimientos")
      .select("*", { count: "exact" }) // 🔹 `*` en vez de `"id"`
      .eq("user_id", usuario.id)
      .gte("fecha", fechaLimite.toISOString());

    const { count: movimientosEntrada } = await supabase
      .from("movimientos")
      .select("*", { count: "exact" }) // 🔹 Se usa `*` en vez de `"id"`
      .eq("tipo", "entrada")
      .eq("user_id", usuario.id) // ✅ Filtramos por usuario directamente
      .gte("fecha", fechaLimite.toISOString());

    const { count: movimientosSalida } = await supabase
      .from("movimientos")
      .select("*", { count: "exact" })
      .eq("tipo", "salida")
      .eq("user_id", usuario.id) // ✅ Filtramos por usuario directamente
      .gte("fecha", fechaLimite.toISOString());

    // 🔹 Obtener todos los movimientos para agrupar manualmente
    const { data: movimientosData, error: errorMovimientos } = await supabase
      .from("movimientos")
      .select("producto_id")
      .eq("user_id", usuario.id); // ✅ Filtramos solo por usuario sin `match()`

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
    const categoriaMasPopular =
      productosOrdenados.length > 0 ? productosOrdenados[0].producto_id : "N/A";

    return res.json({
      totalProductos,
      totalStock,
      totalMovimientos,
      movimientosEntrada,
      movimientosSalida,
      productosMasMovidos,
      categoriaMasPopular,
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return res.status(500).json({ error: error.message });
  }
});

/// 📌 Generar reporte en PDF de movimientos
/// 📌 Generar reporte en PDF de movimientos
router.get("/reporte-pdf", verificarToken, async (req, res) => {
  try {
    console.log("📥 Generando reporte en PDF...");

    const { usuario } = req;
    let whereCondition = {};

    if (usuario.rol !== "admin") {
      whereCondition = { usuario_id: usuario.id };
    }

    // Obtener movimientos según usuario/admin
    const { data: movimientos, error } = await supabase
      .from("movimientos")
      .select("id, producto_id, tipo, cantidad, fecha")
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (error || !movimientos || movimientos.length === 0) {
      console.error("❌ No hay movimientos para generar el PDF");
      return res
        .status(404)
        .json({ error: "No hay movimientos para generar el PDF" });
    }

    // 📌 Crear el documento PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_movimientos.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // 📌 Encabezado con Título
    doc
      .fontSize(20)
      .text("📊 Reporte de Movimientos", { align: "center", underline: true })
      .moveDown();

    // 🏷️ Datos del Usuario
    doc
      .fontSize(12)
      .text(`Usuario: ${usuario.nombre || "Desconocido"}`, { align: "left" })
      .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "left" })
      .moveDown();

    // 📦 Encabezado de Tabla
    doc
      .fontSize(10)
      .text("Detalles de Movimientos:", { underline: true })
      .moveDown();

    const tableTop = doc.y;
    const columnSpacing = 100;
    const rowHeight = 20;
    const startX = 40;

    // 📌 Dibujar encabezados
    doc.text("ID", startX, tableTop);
    doc.text("Producto", startX + columnSpacing, tableTop);
    doc.text("Tipo", startX + columnSpacing * 2, tableTop);
    doc.text("Cantidad", startX + columnSpacing * 3, tableTop);
    doc.text("Fecha", startX + columnSpacing * 4, tableTop);
    doc.moveDown();

    let currentY = tableTop + rowHeight;
    movimientos.forEach((mov) => {
      doc.text(mov.id.toString(), startX, currentY);
      doc.text(
        mov.producto_id ? mov.producto_id.toString() : "N/A",
        startX + columnSpacing,
        currentY
      );
      doc.text(
        mov.tipo === "entrada" ? "Entrada" : "Salida",
        startX + columnSpacing * 2,
        currentY
      );
      doc.text(mov.cantidad.toString(), startX + columnSpacing * 3, currentY);
      doc.text(
        new Date(mov.fecha).toLocaleString(),
        startX + columnSpacing * 4,
        currentY
      );
      currentY += rowHeight;
    });

    doc.end();
    console.log("✅ Reporte PDF generado correctamente");
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar el PDF" });
  }
});

export default router;
