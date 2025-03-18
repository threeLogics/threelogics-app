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

// ✅ Crear categoría con validación y evitar duplicados
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
      const userId = req.usuario.id; // 🔹 Obtener el ID del usuario autenticado

      console.log("🔍 Verificando si la categoría ya existe...");
      const { data: categoriaExistente, error: errorExistente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre", nombre)
        .eq("user_id", userId) // 🔹 Evita duplicados por usuario
        .single();

      if (categoriaExistente) {
        return res.status(400).json({ error: "⚠️ La categoría ya existe." });
      }

      console.log("🆕 Insertando nueva categoría...");
      const { data: nuevaCategoria, error: errorInsert } = await supabase
        .from("categorias")
        .insert([{ nombre, user_id: userId }]) // 🔹 Guardar el `user_id`
        .select("id, nombre, user_id")
        .single();

      if (errorInsert) {
        console.error("❌ Error al crear categoría:", errorInsert);
        return res
          .status(500)
          .json({ error: "⚠️ Error al crear la categoría." });
      }

      res.status(201).json({
        mensaje: `✅ Categoría "${nombre}" creada con éxito.`,
        categoria: nuevaCategoria,
      });
    } catch (error) {
      console.error("❌ Error interno al crear la categoría:", error);
      res.status(500).json({ error: "⚠️ Error interno del servidor." });
    }
  }
);

// ✅ Obtener categorías según el rol del usuario, sin modificar la eliminación de duplicados
router.get("/", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    const userRole = req.usuario.rol; // 📌 Obtener el rol del usuario

    let query = supabase.from("categorias").select("id, nombre, user_id");

    if (userRole !== "admin") {
      query = query.eq("user_id", userId); // 🔹 Si NO es admin, solo ve sus propias categorías
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
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
