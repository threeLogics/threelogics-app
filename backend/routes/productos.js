import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Crear un nuevo producto
router.post("/", verificarToken, async (req, res) => {
  try {
    let {
      nombre,
      descripcion,
      precio,
      cantidad,
      categoriaId,
      categoriaNombre,
    } = req.body;

    if (!nombre || !precio || cantidad === undefined) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    // 🚀 Si no se envía una categoría ID, se busca o crea con el nombre
    if (!categoriaId && categoriaNombre) {
      const { data: categoriaExistente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre", categoriaNombre)
        .single();

      if (categoriaExistente) {
        categoriaId = categoriaExistente.id;
      } else {
        const { data: nuevaCategoria } = await supabase
          .from("categorias")
          .insert([{ nombre: categoriaNombre, usuarioId: req.usuario.id }])
          .select()
          .single();

        categoriaId = nuevaCategoria.id;
      }
    }

    if (!categoriaId) {
      return res
        .status(400)
        .json({ error: "No se pudo determinar una categoría válida." });
    }

    // ✅ Crear el producto con la categoría asegurada
    const { data: producto, error } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          descripcion,
          precio,
          cantidad,
          categoriaId,
          usuarioId: req.usuario.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(producto);
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener productos (admin ve todos, cliente solo los suyos)
router.get("/", verificarToken, async (req, res) => {
  try {
    let productos;

    if (req.usuario.rol === "admin") {
      // ✅ Admin ve todos los productos
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre), usuarios(nombre)");

      if (error) throw error;
      productos = data;
    } else {
      // ✅ Cliente solo ve sus productos
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre)")
        .eq("usuarioId", req.usuario.id);

      if (error) throw error;
      productos = data;
    }

    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener un producto por ID
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const { data: producto } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("id", req.params.id)
      .single();

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Actualizar un producto (Solo el dueño o el admin pueden modificarlo)
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { data: producto } = await supabase
      .from("productos")
      .select("id, usuarioId")
      .eq("id", req.params.id)
      .single();

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Solo el dueño del producto o el admin pueden actualizarlo
    if (req.usuario.rol !== "admin" && producto.usuarioId !== req.usuario.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar este producto" });
    }

    const { nombre, descripcion, precio, cantidad, categoriaId } = req.body;

    const { error } = await supabase
      .from("productos")
      .update({ nombre, descripcion, precio, cantidad, categoriaId })
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Eliminar un producto
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { data: producto } = await supabase
      .from("productos")
      .select("id, usuarioId")
      .eq("id", req.params.id)
      .single();

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Solo el dueño del producto o el admin pueden eliminarlo
    if (req.usuario.rol !== "admin" && producto.usuarioId !== req.usuario.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar este producto" });
    }

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
