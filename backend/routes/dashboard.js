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
      whereCondition = { usuarioId: usuario.id };
    }

    // 📦 Cantidad total de productos en stock (según usuario)
    const { count: totalProductos } = await supabase
      .from("productos")
      .select("id", { count: "exact" })
      .match(whereCondition);

    const { data: stockData } = await supabase
      .from("productos")
      .select("cantidad")
      .match(whereCondition);

    const totalStock = stockData
      ? stockData.reduce((acc, prod) => acc + prod.cantidad, 0)
      : 0;

    // 📊 Cantidad de movimientos en los últimos 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const { count: totalMovimientos } = await supabase
      .from("movimientos")
      .select("id", { count: "exact" })
      .gte("fecha", fechaLimite.toISOString())
      .match(whereCondition);

    const { count: movimientosEntrada } = await supabase
      .from("movimientos")
      .select("id", { count: "exact" })
      .eq("tipo", "entrada")
      .gte("fecha", fechaLimite.toISOString())
      .match(whereCondition);

    const { count: movimientosSalida } = await supabase
      .from("movimientos")
      .select("id", { count: "exact" })
      .eq("tipo", "salida")
      .gte("fecha", fechaLimite.toISOString())
      .match(whereCondition);

    // 📊 Categoría más popular (producto con más movimientos)
    const { data: categoriaMasPopularData } = await supabase
      .from("movimientos")
      .select("productoId", { count: "exact" })
      .match(whereCondition)
      .order("count", { ascending: false })
      .limit(1);

    const categoriaMasPopular =
      categoriaMasPopularData?.length > 0
        ? categoriaMasPopularData[0].productoId
        : "N/A";

    // 🔍 Productos más movidos (top 5)
    const { data: productosMasMovidos } = await supabase
      .from("movimientos")
      .select("productoId, count:productoId")
      .match(whereCondition)
      .order("count", { ascending: false })
      .limit(5);

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
    console.error("Error obteniendo estadísticas:", error);
    return res.status(500).json({ error: error.message });
  }
});

/// 📌 Generar reporte en PDF de movimientos
router.get("/reporte-pdf", verificarToken, async (req, res) => {
  try {
    const { usuario } = req;
    let whereCondition = {};

    if (usuario.rol !== "admin") {
      whereCondition = { usuarioId: usuario.id };
    }

    // Obtener movimientos según usuario/admin
    const { data: movimientos } = await supabase
      .from("movimientos")
      .select("id, productoId, tipo, cantidad, fecha")
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (!movimientos || movimientos.length === 0) {
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
      .text("Reporte de Movimientos", { align: "center", underline: true })
      .moveDown();

    // 🏷️ Datos del Usuario
    doc
      .fontSize(12)
      .text(`Usuario: ${usuario.nombre || "Desconocido"}`, { align: "left" })
      .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "left" })
      .moveDown();

    // 📦 Encabezado de Tabla
    doc
      .fontSize(14)
      .text("Detalles de Movimientos:", { underline: true })
      .moveDown();
    doc.fontSize(10);

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
        mov.productoId ? mov.productoId.toString() : "N/A",
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
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar el PDF" });
  }
});

export default router;
