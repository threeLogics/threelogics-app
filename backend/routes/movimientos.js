import express from "express";
import Movimiento from "../models/Movimiento.js";
import Producto from "../models/Producto.js";
import Categoria from "../models/Categoria.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import { Op } from "sequelize"; // 🔹 Para filtrar por fecha
import { Parser } from "json2csv";
import fs from "fs";

const router = express.Router();

// Registrar un nuevo movimiento (entrada/salida)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { tipo, cantidad, productoId } = req.body;
    const producto = await Producto.findByPk(productoId);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (req.usuario.rol !== "admin" && producto.usuarioId !== req.usuario.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar este producto" });
    }

    if (cantidad <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    let nuevoStock;
    if (tipo === "entrada") {
      nuevoStock = producto.cantidad + cantidad;
    } else if (tipo === "salida") {
      if (producto.cantidad < cantidad) {
        return res.status(400).json({ error: "Stock insuficiente" });
      }
      nuevoStock = producto.cantidad - cantidad;
    } else {
      return res.status(400).json({ error: "Tipo de movimiento no válido" });
    }

    await producto.update({ cantidad: nuevoStock });

    const movimiento = await Movimiento.create({
      tipo,
      cantidad,
      productoId,
      usuarioId: req.usuario.id,
    });

    res.status(201).json({
      mensaje: "Movimiento registrado y stock actualizado",
      movimiento,
      nuevoStock,
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Obtener todos los movimientos con filtros por categoría y fecha
router.get("/", verificarToken, async (req, res) => {
  try {
    const { categoriaId, dias } = req.query; // 🔹 Se reciben los filtros desde el frontend

    let filtros = {};

    // 🔹 Filtrar por fecha (últimos N días)
    if (dias) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
      filtros.fecha = { [Op.gte]: fechaLimite };
    }

    let movimientos;

    if (req.usuario.rol === "admin") {
      // 🔹 Incluir producto y categoría
      movimientos = await Movimiento.findAll({
        where: filtros,
        include: {
          model: Producto,
          attributes: ["nombre", "categoriaId"],
          include: {
            model: Categoria,
            attributes: ["id", "nombre"],
          },
        },
        order: [["fecha", "DESC"]],
      });

      // 🔹 Filtrar por categoría si se seleccionó una
      if (categoriaId) {
        movimientos = movimientos.filter(
          (mov) => mov.Producto?.Categoria?.id == categoriaId
        );
      }
    } else {
      // 🔹 Cliente solo ve movimientos de sus productos
      movimientos = await Movimiento.findAll({
        where: filtros,
        include: {
          model: Producto,
          attributes: ["nombre", "categoriaId"],
          include: {
            model: Categoria,
            attributes: ["id", "nombre"],
          },
          where: { usuarioId: req.usuario.id },
        },
        order: [["fecha", "DESC"]],
      });

      if (categoriaId) {
        movimientos = movimientos.filter(
          (mov) => mov.Producto?.Categoria?.id == categoriaId
        );
      }
    }

    res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    res.status(500).json({ error: error.message });
  }
});
// 📥 Descargar movimientos en CSV
router.get("/descargar", async (req, res) => {
  try {
    const movimientos = await Movimiento.findAll({
      include: { model: Producto, attributes: ["nombre"] },
      order: [["fecha", "DESC"]],
    });

    const datos = movimientos.map((mov) => ({
      ID: mov.id,
      Producto: mov.Producto ? mov.Producto.nombre : "N/A",
      Tipo: mov.tipo,
      Cantidad: mov.cantidad,
      Fecha: mov.fecha.toISOString(),
    }));

    const json2csv = new Parser();
    const csv = json2csv.parse(datos);

    // 📂 Guardar el archivo temporalmente
    const filePath = "./movimientos.csv";
    fs.writeFileSync(filePath, csv);

    // 📤 Enviar el archivo al usuario
    res.download(filePath, "movimientos.csv", () => {
      fs.unlinkSync(filePath); // Eliminar el archivo después de descargarlo
    });
  } catch (error) {
    console.error("Error al generar CSV:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
