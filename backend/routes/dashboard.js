import express from "express";
import Producto from "../models/Producto.js";
import Movimiento from "../models/Movimiento.js";
import { Op, fn, col } from "sequelize";
import sequelize from "../config/database.js";
import PDFDocument from "pdfkit";
import { verificarToken } from "../middleware/authMiddleware.js"; // Middleware de autenticación

const router = express.Router();

// 📌 Obtener estadísticas generales (Autenticado)
router.get("/estadisticas", verificarToken, async (req, res) => {
  try {
    console.log("🛠️ Usuario recibido:", req.usuario);
    const usuario = req.usuario || { nombre: "Usuario Desconocido" }; // Previene undefined

    let whereCondition = {}; // Condición base

    if (usuario.rol !== "admin") {
      // Si NO es admin, solo filtrar por usuario
      whereCondition = { usuarioId: usuario.id };
    }

    // 📦 Cantidad total de productos en stock (según usuario)
    const totalProductos = await Producto.count({ where: whereCondition });
    const totalStock = await Producto.sum("cantidad", {
      where: whereCondition,
    });

    // 📊 Cantidad de movimientos en los últimos 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const totalMovimientos = await Movimiento.count({
      where: { fecha: { [Op.gte]: fechaLimite }, ...whereCondition },
    });

    const movimientosEntrada = await Movimiento.count({
      where: {
        tipo: "entrada",
        fecha: { [Op.gte]: fechaLimite },
        ...whereCondition,
      },
    });

    const movimientosSalida = await Movimiento.count({
      where: {
        tipo: "salida",
        fecha: { [Op.gte]: fechaLimite },
        ...whereCondition,
      },
    });

    // 📊 Categoría más popular
    const categoriaMasPopularData = await Movimiento.findOne({
      attributes: ["productoId", [fn("COUNT", col("productoId")), "total"]],
      where: whereCondition,
      group: ["productoId"],
      order: [[fn("COUNT", col("productoId")), "DESC"]],
      include: { model: Producto, attributes: ["categoriaId"] },
    });

    const categoriaMasPopular =
      categoriaMasPopularData?.Producto?.categoriaId || "N/A";

    // 🔍 Productos más movidos
    const productosMasMovidos = await Movimiento.findAll({
      attributes: ["productoId", [fn("COUNT", col("productoId")), "total"]],
      where: whereCondition,
      group: ["productoId"],
      order: [[fn("COUNT", col("productoId")), "DESC"]],
      limit: 5,
      include: { model: Producto, attributes: ["nombre"] },
    });

    // ✅ Solo una respuesta JSON
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

/// 📌 Generar reporte en PDF de movimientos (Mejorado)
router.get("/reporte-pdf", verificarToken, async (req, res) => {
  try {
    const { usuario } = req;
    let whereCondition = {};

    if (usuario.rol !== "admin") {
      whereCondition = { usuarioId: usuario.id };
    }

    // Obtener movimientos según usuario/admin
    const movimientos = await Movimiento.findAll({
      where: whereCondition,
      include: { model: Producto, attributes: ["nombre"] },
      order: [["fecha", "DESC"]],
    });

    if (!movimientos.length) {
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

    // 📌 Fuente predeterminada
    doc.font("Helvetica");

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

    // 📌 Línea divisoria
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // 📦 Encabezado de Tabla
    doc
      .fontSize(14)
      .text("Detalles de Movimientos:", { underline: true })
      .moveDown();

    // 📌 Dibujar la tabla manualmente
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

    // 📌 Dibujar cada fila de la tabla
    let currentY = tableTop + rowHeight;
    movimientos.forEach((mov) => {
      doc.text(mov.id.toString(), startX, currentY);
      doc.text(mov.Producto?.nombre || "N/A", startX + columnSpacing, currentY);
      doc.text(
        mov.tipo === "entrada" ? " Entrada" : " Salida",
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

    // 🔚 Cerrar documento
    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar el PDF" });
  }
});

export default router;
