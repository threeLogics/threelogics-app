import express from "express";
import { body, validationResult } from "express-validator";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware para validar errores de express-validator
const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

// ✅ Crear categoría con validación, usuarioId y evitar duplicados
router.post(
  "/",
  [
    verificarToken,
    body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
  ],
  validarCampos,
  async (req, res) => {
    try {
      console.log("✅ Datos recibidos en POST /categorias:", req.body);
      const { nombre } = req.body;
      const usuarioId = req.usuario.id;

      console.log("🔍 Verificando categoría existente en Supabase...");
      const { data: categoriaExistente, error: errorExistente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre", nombre)
        .eq("usuario_id", usuarioId)
        .single();

      if (categoriaExistente) {
        return res
          .status(400)
          .json({ error: "Esta categoría ya existe para este usuario." });
      }

      if (errorExistente && errorExistente.code !== "PGRST116") {
        console.error(
          "❌ Error al verificar categoría existente:",
          errorExistente
        );
        return res
          .status(500)
          .json({ error: "Error al verificar la categoría" });
      }

      console.log("🆕 Insertando nueva categoría en Supabase...");
      const { data: categoria, error: errorInsert } = await supabase
        .from("categorias")
        .insert([{ nombre, usuario_id: usuarioId }])
        .select()
        .single();

      if (errorInsert) {
        console.error("❌ Error al crear categoría:", errorInsert);
        return res.status(500).json({ error: "Error al crear la categoría" });
      }

      res.status(201).json({
        mensaje: `Categoría "${categoria.nombre}" creada con éxito.`,
        categoria,
      });
    } catch (error) {
      console.error("❌ Error interno al crear la categoría:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// ✅ Obtener todas las categorías sin duplicados
router.get("/", verificarToken, async (req, res) => {
  try {
    let categorias;

    if (req.usuario.rol === "admin") {
      // 🔹 Admin ve todas las categorías
      const { data, error } = await supabase.from("categorias").select("*");

      if (error) throw error;
      categorias = data;
    } else {
      // 🔹 Usuario solo ve sus propias categorías
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("usuario_id", req.usuario.id);

      if (error) throw error;
      categorias = data;
    }

    res.json(categorias);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Ruta para actualizar una categoría
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // 🔹 Verificar si la categoría existe en Supabase
    const { data: categoria, error: errorBuscar } = await supabase
      .from("categorias")
      .select("*")
      .eq("id", id)
      .single();

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (errorBuscar) {
      console.error("❌ Error al buscar la categoría:", errorBuscar);
      return res.status(500).json({ error: "Error al buscar la categoría" });
    }

    // 🔹 Actualizar la categoría en Supabase
    const { error: errorActualizar } = await supabase
      .from("categorias")
      .update({ nombre })
      .eq("id", id);

    if (errorActualizar) {
      console.error("❌ Error al actualizar categoría:", errorActualizar);
      return res
        .status(500)
        .json({ error: "Error al actualizar la categoría" });
    }

    res
      .status(200)
      .json({ mensaje: `Categoría "${nombre}" actualizada correctamente` });
  } catch (error) {
    console.error("❌ Error al actualizar la categoría:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// ✅ Eliminar múltiples categorías
router.delete("/", verificarToken, async (req, res) => {
  try {
    const { categoriaIds } = req.body; // 📥 Recibir los IDs en el body

    if (!categoriaIds || categoriaIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No se enviaron categorías para eliminar." });
    }

    // 🔍 Verificar si las categorías existen antes de eliminarlas
    const { data: categoriasExistentes, error: errorBuscar } = await supabase
      .from("categorias")
      .select("id")
      .in("id", categoriaIds);

    if (errorBuscar) throw errorBuscar;

    if (!categoriasExistentes || categoriasExistentes.length === 0) {
      return res
        .status(404)
        .json({ error: "Las categorías seleccionadas no existen." });
    }

    // 🚀 Eliminar las categorías seleccionadas
    const { error } = await supabase
      .from("categorias")
      .delete()
      .in("id", categoriaIds);

    if (error) throw error;

    res.status(200).json({
      mensaje: `✅ ${categoriaIds.length} categorías eliminadas correctamente.`,
    });
  } catch (error) {
    console.error("❌ Error al eliminar categorías:", error);
    res.status(500).json({ error: "Error al eliminar las categorías." });
  }
});

export default router;
