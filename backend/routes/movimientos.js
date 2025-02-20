import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import { Parser } from "json2csv";
import fs from "fs";

const router = express.Router();

// ✅ Registrar un nuevo movimiento (entrada/salida)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { tipo, cantidad, productoId } = req.body;

    // 🔹 Obtener el producto desde Supabase
    const { data: producto } = await supabase
      .from("productos")
      .select("id, cantidad, usuarioId")
      .eq("id", productoId)
      .single();

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

    // 🔹 Actualizar el stock del producto en Supabase
    await supabase
      .from("productos")
      .update({ cantidad: nuevoStock })
      .eq("id", productoId);

    // 🔹 Registrar el movimiento en Supabase
    const { data: movimiento, error: errorMovimiento } = await supabase
      .from("movimientos")
      .insert([{ tipo, cantidad, productoId, usuarioId: req.usuario.id }])
      .select()
      .single();

    if (errorMovimiento) {
      console.error("❌ Error al registrar movimiento:", errorMovimiento);
      return res
        .status(500)
        .json({ error: "Error al registrar el movimiento" });
    }

    res.status(201).json({
      mensaje: "Movimiento registrado y stock actualizado",
      movimiento,
      nuevoStock,
    });
  } catch (error) {
    console.error("❌ Error al registrar movimiento:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener todos los movimientos con filtros por categoría y fecha
router.get("/", verificarToken, async (req, res) => {
  try {
    const { categoriaId, dias } = req.query;
    let filtros = {};

    if (dias) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
      filtros.fecha = { gte: fechaLimite.toISOString() };
    }

    let movimientos;

    if (req.usuario.rol === "admin") {
      // 🔹 Obtener movimientos con información del producto
      const { data, error } = await supabase
        .from("movimientos")
        .select(
          "id, tipo, cantidad, fecha, productoId, productos (nombre, categoriaId)"
        )
        .match(filtros)
        .order("fecha", { ascending: false });

      if (error) throw error;
      movimientos = data;

      if (categoriaId) {
        movimientos = movimientos.filter(
          (mov) => mov.productos?.categoriaId == categoriaId
        );
      }
    } else {
      // 🔹 Obtener movimientos del usuario autenticado
      const { data, error } = await supabase
        .from("movimientos")
        .select(
          "id, tipo, cantidad, fecha, productoId, productos (nombre, categoriaId)"
        )
        .eq("usuarioId", req.usuario.id)
        .match(filtros)
        .order("fecha", { ascending: false });

      if (error) throw error;
      movimientos = data;

      if (categoriaId) {
        movimientos = movimientos.filter(
          (mov) => mov.productos?.categoriaId == categoriaId
        );
      }
    }

    res.json(movimientos);
  } catch (error) {
    console.error("❌ Error al obtener movimientos:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📥 Descargar movimientos en CSV
router.get("/descargar", async (req, res) => {
  try {
    const { data: movimientos, error } = await supabase
      .from("movimientos")
      .select("id, tipo, cantidad, fecha, productos (nombre)")
      .order("fecha", { ascending: false });

    if (error) throw error;

    const datos = movimientos.map((mov) => ({
      ID: mov.id,
      Producto: mov.productos ? mov.productos.nombre : "N/A",
      Tipo: mov.tipo,
      Cantidad: mov.cantidad,
      Fecha: new Date(mov.fecha).toISOString(),
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
    console.error("❌ Error al generar CSV:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
