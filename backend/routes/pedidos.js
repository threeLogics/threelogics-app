import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import Pedido from "../models/Pedido.js";
import DetallePedido from "../models/DetallePedido.js";
import Producto from "../models/Producto.js";
import Movimiento from "../models/Movimiento.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

const router = express.Router();

// 📌 Crear un pedido
router.post("/", verificarToken, async (req, res) => {
  const { productos } = req.body;
  const usuarioId = req.usuario.id;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: "El pedido no tiene productos" });
  }

  try {
    let total = 0;

    const pedido = await sequelize.transaction(async (t) => {
      const nuevoPedido = await Pedido.create(
        { usuarioId, total: 0, estado: "pendiente" },
        { transaction: t }
      );

      for (const item of productos) {
        const producto = await Producto.findByPk(item.productoId);
        if (!producto) {
          throw new Error(`Producto ${item.productoId} no encontrado`);
        }

        const subtotal = producto.precio * item.cantidad;
        total += subtotal;

        await DetallePedido.create(
          {
            pedidoId: nuevoPedido.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: producto.precio,
            subtotal,
          },
          { transaction: t }
        );
      }

      await nuevoPedido.update({ total }, { transaction: t });

      return nuevoPedido;
    });

    res.status(201).json({ mensaje: "Pedido creado con éxito", pedido });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
});

// 📌 Obtener pedidos del usuario autenticado
router.get("/", verificarToken, async (req, res) => {
  try {
    let whereCondition = {};

    if (req.usuario.rol !== "admin") {
      whereCondition.usuarioId = req.usuario.id;
    }

    const pedidos = await Pedido.findAll({
      where: whereCondition,
      include: [
        {
          model: DetallePedido,
          include: { model: Producto, attributes: ["nombre", "precio"] },
        },
      ],
      order: [["fecha", "DESC"]],
    });

    res.json(pedidos);
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
});

// 📌 Cambiar estado de un pedido
// 📌 Cambiar estado de un pedido (Evitar que pase a "enviado" hasta el pago)
router.put("/:id/estado", verificarToken, async (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: DetallePedido,
          include: {
            model: Producto,
            attributes: ["id", "nombre", "cantidad"],
          },
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const estadosPermitidos = ["pendiente", "pagar", "enviado", "completado"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no permitido" });
    }

    // Evitar que pase a "enviado" sin haber pagado
    if (estado === "enviado" && pedido.estado !== "pagar") {
      return res
        .status(400)
        .json({ error: "El pedido debe pagarse antes de ser enviado" });
    }

    // Si el estado cambia a "completado", actualizar stock y registrar movimientos
    if (estado === "completado") {
      for (const detalle of pedido.DetallePedidos) {
        const producto = await Producto.findByPk(detalle.productoId);
        if (!producto) continue;

        producto.cantidad += detalle.cantidad;
        await producto.save();

        await Movimiento.create({
          productoId: producto.id,
          tipo: "entrada",
          cantidad: detalle.cantidad,
          usuarioId: req.usuario.id,
          fecha: new Date(),
        });
      }
    }

    await pedido.update({ estado });
    res.json({ mensaje: `Pedido actualizado a ${estado}`, pedido });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    res.status(500).json({ error: "Error al actualizar estado del pedido" });
  }
});
// 📌 Obtener un pedido por ID
router.get("/:id", verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: DetallePedido,
          include: { model: Producto, attributes: ["nombre", "precio"] },
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    console.error("❌ Error al obtener el pedido:", error);
    res.status(500).json({ error: "Error al obtener el pedido" });
  }
});

// 📌 Eliminar un pedido (Solo si está pendiente)
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    if (pedido.estado !== "pendiente") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar un pedido procesado" });
    }

    await pedido.destroy();
    res.json({ mensaje: "Pedido eliminado" });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
});

// 📌 Actualizar pedidos a "completado" automáticamente después de 2 minutes
setInterval(async () => {
  try {
    const pedidos = await Pedido.findAll({
      where: {
        estado: "enviado",
        fecha: { [Op.lt]: new Date(Date.now() - 120) },
      },
      include: [
        {
          model: DetallePedido,
          include: {
            model: Producto,
            attributes: ["id", "nombre", "cantidad"],
          },
        },
      ],
    });

    for (const pedido of pedidos) {
      pedido.estado = "completado";
      await pedido.save();

      // 📌 Al completar el pedido, actualizar el stock y registrar movimientos
      for (const detalle of pedido.DetallePedidos) {
        const producto = await Producto.findByPk(detalle.productoId);

        if (!producto) continue;

        // 🔄 Sumar cantidad al stock
        producto.cantidad += detalle.cantidad;
        await producto.save();

        // 🔄 Registrar movimiento de entrada
        await Movimiento.create({
          productoId: producto.id,
          tipo: "entrada",
          cantidad: detalle.cantidad,
          usuarioId: pedido.usuarioId,
          fecha: new Date(),
        });
      }
    }

    console.log(
      "✅ Pedidos enviados ahora están completados y el stock ha sido actualizado."
    );
  } catch (error) {
    console.error("❌ Error actualizando pedidos completados:", error);
  }
}, 60000); // Se ejecuta cada 60 segundos

export default router;
