import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";
const router = express.Router();

// 📌 Crear un pedido (entrada o salida)
router.post("/", verificarToken, async (req, res) => {
  const { productos, tipo } = req.body;
  const userId = req.usuario.id;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: "El pedido no tiene productos" });
  }

  if (!["entrada", "salida"].includes(tipo)) {
    return res.status(400).json({ error: "Tipo de pedido no válido" });
  }

  try {
    let total = 0;

    // 🛒 Insertar el nuevo pedido
    const { data: nuevoPedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert([
        {
          user_id: userId,
          total: 0,
          estado: "pendiente",
          tipo,
          fecha: new Date(),
        },
      ])
      .select()
      .single();

    if (errorPedido) throw errorPedido;

    const detalles = [];

    for (const item of productos) {
      const { data: producto, error: errorProducto } = await supabase
        .from("productos")
        .select("id, precio, cantidad")
        .eq("id", item.productoId)
        .single();

      if (errorProducto || !producto) {
        throw new Error(`Producto ${item.productoId} no encontrado`);
      }

      // 🚫 Validar que hay stock suficiente para pedidos de salida
      if (tipo === "salida" && item.cantidad > producto.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto ${item.productoId}. Stock actual: ${producto.cantidad}, solicitado: ${item.cantidad}`,
        });
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

    // ✅ Actualizar el total del pedido
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

// 📌 Actualizar estado del pedido y stock
// 📌 Actualizar estado del pedido y stock
router.put("/:id/estado", verificarToken, async (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  try {
    // 📦 Obtener el pedido con sus detalles
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select(
        "id, estado, tipo, user_id, detallepedidos ( id, cantidad, producto_id )"
      )
      .eq("id", id)
      .single();

    if (pedidoError || !pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // ✅ Estados válidos
    const estadosPermitidos = [
      "pendiente",
      "procesado",
      "cancelado",
      "pagado",
      "recibido",
    ];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no permitido" });
    }

    // 🔄 Estados que procesan el stock
    const estadosProcesanStock = ["procesado", "pagado", "recibido"];

    if (estadosProcesanStock.includes(estado)) {
      for (const detalle of pedido.detallepedidos) {
        const productoId = detalle.producto_id;
        const cantidadMovimiento = detalle.cantidad;
        const factor = pedido.tipo === "entrada" ? 2 : 0;
        // 🔍 Buscar producto actual
        const { data: productoActual, error: errorProducto } = await supabase
          .from("productos")
          .select("cantidad")
          .eq("id", productoId)
          .single();

        if (errorProducto || !productoActual) {
          console.error(`❌ Producto ID ${productoId} no encontrado.`);
          continue;
        }

        const nuevoStock =
          productoActual.cantidad + cantidadMovimiento * factor;

        // 📦 Actualizar stock
        const { error: errorUpdate } = await supabase
          .from("productos")
          .update({ cantidad: nuevoStock })
          .eq("id", productoId);

        if (errorUpdate) {
          console.error("❌ Error al actualizar stock:", errorUpdate);
          continue;
        }

        // 📝 Registrar movimiento
        const { error: errorMovimiento } = await supabase
          .from("movimientos")
          .insert([
            {
              producto_id: productoId,
              tipo: pedido.tipo,
              cantidad: cantidadMovimiento,
              fecha: new Date(),
              user_id: pedido.user_id,
              pedido_id: pedido.id, // ✅ esto es lo que te faltaba
            },
          ]);

        if (errorMovimiento) {
          console.error("❌ Error al registrar movimiento:", errorMovimiento);
        }
      }
    }

    // 🟢 Actualizar el estado del pedido
    await supabase.from("pedidos").update({ estado }).eq("id", id);

    res.json({ mensaje: `Pedido actualizado a ${estado}` });
  } catch (error) {
    console.error("❌ Error al actualizar estado del pedido:", error);
    res.status(500).json({ error: "Error al actualizar estado del pedido" });
  }
});

// 📌 Obtener todos los pedidos
router.get("/", verificarToken, async (req, res) => {
  try {
    let query = supabase
      .from("pedidos")
      .select(
        "id, fecha, total, estado, tipo, user_id, detallepedidos ( id, cantidad, precio_unitario, subtotal, productos (id, nombre, precio) )"
      )
      .order("fecha", { ascending: false });

    if (req.usuario.rol !== "admin") {
      query = query.eq("user_id", req.usuario.id);
    }

    const { data: pedidos, error } = await query;

    if (error) throw error;

    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error obteniendo pedidos:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
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

// 📌 Resumen de Totales: pedidos, $ vendidos, productos movidos
router.get("/resumen", verificarToken, async (req, res) => {
  try {
    const { rol, id: userId } = req.usuario;

    const filtroBase = rol !== "admin" ? { user_id: userId } : {};

    // 🔹 Total pedidos (todos)
    const { count: totalPedidos } = await supabase
      .from("pedidos")
      .select("*", { count: "exact", head: true })
      .match(filtroBase);

    // 🔹 Total vendido ($) = solo pedidos de tipo "salida"
    const { data: pedidosSalida, error: errorSalida } = await supabase
      .from("pedidos")
      .select("total")
      .match({ ...filtroBase, tipo: "salida" });

    if (errorSalida) throw errorSalida;

    const totalVendido = pedidosSalida.reduce((sum, p) => sum + p.total, 0);

    // 🔹 Total productos movidos (precio total de productos de entrada)
    const { data: detallesEntrada, error: errorDetalles } = await supabase
      .from("pedidos")
      .select("id, detallepedidos(subtotal)")
      .match({ ...filtroBase, tipo: "entrada" });

    if (errorDetalles) throw errorDetalles;

    const totalProductosMovidos = detallesEntrada
      .flatMap((p) => p.detallepedidos)
      .reduce((sum, d) => sum + d.subtotal, 0);

    res.json({ totalPedidos, totalVendido, totalProductosMovidos });
  } catch (error) {
    console.error("❌ Error en resumen:", error);
    res.status(500).json({ error: "Error al obtener el resumen" });
  }
});

export default router;
