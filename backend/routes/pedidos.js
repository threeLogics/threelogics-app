import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📌 Crear un pedido
router.post("/", verificarToken, async (req, res) => {
  const { productos } = req.body;
  const usuario_id = req.usuario.id;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: "El pedido no tiene productos" });
  }

  try {
    let total = 0;

    // 🔹 Crear el pedido en Supabase
    const { data: nuevoPedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert([
        { usuario_id, total: 0, estado: "pendiente", fecha: new Date() },
      ])
      .select()
      .single();

    if (errorPedido) throw errorPedido;

    // 🔹 Insertar los detalles del pedido
    const detalles = [];

    for (const item of productos) {
      const { data: producto, error: errorProducto } = await supabase
        .from("productos")
        .select("id, precio")
        .eq("id", item.productoId)
        .single();

      if (errorProducto || !producto) {
        throw new Error(`Producto ${item.productoId} no encontrado`);
      }

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;

      detalles.push({
        pedido_id: nuevoPedido.id,
        producto_id: item.productoId,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        subtotal,
      });
    }

    if (detalles.length > 0) {
      await supabase.from("detallepedidos").insert(detalles);
    }

    // 🔹 Actualizar el total en el pedido
    await supabase.from("pedidos").update({ total }).eq("id", nuevoPedido.id);

    res.status(201).json({
      mensaje: "Pedido creado con éxito",
      pedido: { ...nuevoPedido, total, productos },
    });
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
});

// 📌 Obtener pedidos del usuario autenticado
router.get("/", verificarToken, async (req, res) => {
  try {
    let whereCondition = {};

    if (req.usuario.rol !== "admin") {
      whereCondition.usuario_id = req.usuario.id;
    }

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select(
        `
        id, fecha, total, estado, usuario_id,
        detallepedidos (
          id, cantidad, precio_unitario, subtotal,
          productos (id, nombre, precio)
        )
      `
      )
      .match(whereCondition)
      .order("fecha", { ascending: false });

    if (error) throw error;

    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error obteniendo pedidos:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
});

// 📌 Cambiar estado de un pedido
router.put("/:id/estado", verificarToken, async (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  try {
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("*, detallepedidos(*, productos(id, nombre, cantidad))")
      .eq("id", id)
      .single();

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const estadosPermitidos = ["pendiente", "pagar", "enviado", "completado"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no permitido" });
    }

    if (estado === "enviado" && pedido.estado !== "pagar") {
      return res
        .status(400)
        .json({ error: "El pedido debe pagarse antes de ser enviado" });
    }

    if (estado === "completado") {
      for (const detalle of pedido.detallepedidos) {
        await supabase
          .from("productos")
          .update({
            cantidad: detalle.productos.cantidad + detalle.cantidad,
          })
          .eq("id", detalle.producto_id);

        await supabase.from("movimientos").insert([
          {
            producto_id: detalle.producto_id,
            tipo: "entrada",
            cantidad: detalle.cantidad,
            usuario_id: req.usuario.id,
            fecha: new Date(),
          },
        ]);
      }
    }

    await supabase.from("pedidos").update({ estado }).eq("id", id);
    res.json({ mensaje: `Pedido actualizado a ${estado}`, pedido });
  } catch (error) {
    console.error("❌ Error al actualizar estado del pedido:", error);
    res.status(500).json({ error: "Error al actualizar estado del pedido" });
  }
});

// 📌 Obtener un pedido por ID
// 📌 Obtener un pedido por ID
router.get("/:id", verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🔍 Buscando pedido con ID: ${id}`);

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .select(
        `
        id, fecha, total, estado, usuario_id, 
        detallepedidos (
          id, cantidad, precio_unitario, subtotal,
          productos (id, nombre, precio)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !pedido) {
      console.error("❌ Pedido no encontrado en la base de datos.");
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    res.json(pedido);
  } catch (error) {
    console.error("❌ Error al obtener el pedido:", error);
    res.status(500).json({ error: "Error al obtener el pedido." });
  }
});

// 📌 Eliminar un pedido (Solo si está pendiente)
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("estado")
      .eq("id", req.params.id)
      .single();

    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    if (pedido.estado !== "pendiente") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar un pedido procesado" });
    }

    await supabase.from("pedidos").delete().eq("id", req.params.id);
    res.json({ mensaje: "Pedido eliminado" });
  } catch (error) {
    console.error("❌ Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
});

// 📌 Actualizar pedidos a "completado" automáticamente después de 2 minutos
setInterval(async () => {
  try {
    const fechaLimite = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // Restar 2 minutos

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select(
        "id, usuario_id, created_at, detallepedidos(*, productos(id, cantidad))"
      )
      .eq("estado", "enviado")
      .lt("created_at", fechaLimite);

    if (error) throw error;
    if (!pedidos || pedidos.length === 0) return;

    for (const pedido of pedidos) {
      await supabase
        .from("pedidos")
        .update({ estado: "completado" })
        .eq("id", pedido.id);

      for (const detalle of pedido.detallepedidos) {
        await supabase
          .from("productos")
          .update({
            cantidad: detalle.productos.cantidad + detalle.cantidad,
          })
          .eq("id", detalle.producto_id);

        await supabase.from("movimientos").insert([
          {
            producto_id: detalle.producto_id,
            tipo: "entrada",
            cantidad: detalle.cantidad,
            usuario_id: pedido.usuario_id,
            fecha: new Date(),
          },
        ]);
      }
    }

    console.log(
      "✅ Pedidos enviados ahora están completados y el stock ha sido actualizado."
    );
  } catch (error) {
    console.error("❌ Error actualizando pedidos completados:", error);
  }
}, 60000);

export default router;
