import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📌 Configuración de `multer` para manejar la subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Obtener perfil del usuario autenticado
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("nombre, email, imagen_perfil")
      .eq("id", req.usuario.id)
      .single();

    if (!usuario || error) {
      return res.json({ usuario: null });
    }

    res.json({
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        imagenPerfil: usuario.imagen_perfil
          ? `data:image/png;base64,${usuario.imagen_perfil}`
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ error: "❌ No se pudo obtener el perfil" });
  }
});

// 📌 Actualizar perfil del usuario
router.put(
  "/perfil",
  verificarToken,
  upload.single("imagenPerfil"),
  async (req, res) => {
    try {
      const { nombre, email, nuevoPassword } = req.body;
      const imagen_perfil = req.file
        ? req.file.buffer.toString("base64")
        : null;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("id", req.usuario.id)
        .single();

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const updateData = {
        nombre,
        email,
        ...(nuevoPassword && {
          password: await bcrypt.hash(nuevoPassword, 10),
        }),
        ...(imagen_perfil && { imagen_perfil }),
      };

      await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", req.usuario.id);

      res.json({
        mensaje: "✅ Perfil actualizado con éxito",
        usuario: {
          nombre,
          email,
          imagenPerfil: imagen_perfil || null,
        },
      });
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      res.status(500).json({ error: "❌ No se pudo actualizar el perfil" });
    }
  }
);

// 📌 Obtener últimos 3 clientes nuevos y últimos 3 dados de baja
router.get("/ultimos-clientes", async (req, res) => {
  try {
    const { data: nuevosClientes } = await supabase
      .from("usuarios")
      .select("id, nombre, email, created_at")
      .eq("rol", "usuario")
      .is("deleted_at", null) // Solo clientes activos
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: clientesEliminados } = await supabase
      .from("usuarios")
      .select("id, nombre, email, deleted_at")
      .not("deleted_at", "is", null) // Solo clientes con fecha de eliminación
      .order("deleted_at", { ascending: false })
      .limit(3);

    res.json({ nuevosClientes, clientesEliminados });
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: "❌ Error al obtener clientes" });
  }
});

// 📌 Dar de baja un usuario (Soft Delete)
router.delete("/perfil", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;

    // 🔥 Marcar usuario como eliminado en vez de borrarlo
    const { error } = await supabase
      .from("usuarios")
      .update({ deleted_at: new Date().toISOString() }) // Guardar fecha de eliminación
      .eq("id", userId);

    if (error) {
      console.error("❌ Error al eliminar usuario:", error);
      return res.status(500).json({ error: "No se pudo eliminar la cuenta" });
    }

    res.status(200).json({ mensaje: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al dar de baja:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
