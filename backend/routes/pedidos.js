import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";
const router = express.Router();

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

router.put("/:id/estado", verificarToken, async (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  try {
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

    const estadosProcesanStock = ["procesado", "pagado", "recibido"];

    if (estadosProcesanStock.includes(estado)) {
      for (const detalle of pedido.detallepedidos) {
        const productoId = detalle.producto_id;
        const cantidadMovimiento = detalle.cantidad;
        const factor = pedido.tipo === "entrada" ? 2 : 0;
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

        const { error: errorUpdate } = await supabase
          .from("productos")
          .update({ cantidad: nuevoStock })
          .eq("id", productoId);

        if (errorUpdate) {
          console.error("❌ Error al actualizar stock:", errorUpdate);
          continue;
        }

        const { error: errorMovimiento } = await supabase
          .from("movimientos")
          .insert([
            {
              producto_id: productoId,
              tipo: pedido.tipo,
              cantidad: cantidadMovimiento,
              fecha: new Date(),
              user_id: pedido.user_id,
              pedido_id: pedido.id, 
            },
          ]);

        if (errorMovimiento) {
          console.error("❌ Error al registrar movimiento:", errorMovimiento);
        }
      }
    }

    await supabase.from("pedidos").update({ estado }).eq("id", id);

    res.json({ mensaje: `Pedido actualizado a ${estado}` });
  } catch (error) {
    console.error("❌ Error al actualizar estado del pedido:", error);
    res.status(500).json({ error: "Error al actualizar estado del pedido" });
  }
});

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

router.get("/resumen", verificarToken, async (req, res) => {
  try {
    const { rol, id: userId } = req.usuario;

    const filtroBase = rol !== "admin" ? { user_id: userId } : {};

    const { count: totalPedidos } = await supabase
      .from("pedidos")
      .select("*", { count: "exact", head: true })
      .match(filtroBase);

    const { data: pedidosSalida, error: errorSalida } = await supabase
      .from("pedidos")
      .select("total")
      .match({ ...filtroBase, tipo: "salida" });

    if (errorSalida) throw errorSalida;

    const totalVendido = pedidosSalida.reduce((sum, p) => sum + p.total, 0);

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
