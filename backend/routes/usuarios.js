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
      .select("nombre, email, imagenPerfil")
      .eq("id", req.usuario.id)
      .single();

    if (!usuario || error) {
      return res.json({ usuario: null });
    }

    res.json({
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        imagenPerfil: usuario.imagenPerfil
          ? `data:image/png;base64,${usuario.imagenPerfil}`
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
      const imagenPerfil = req.file ? req.file.buffer.toString("base64") : null;

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
        ...(imagenPerfil && { imagenPerfil }),
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
          imagenPerfil: imagenPerfil || null,
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
      .select("id, nombre, email, createdAt")
      .eq("rol", "usuario")
      .order("createdAt", { ascending: false })
      .limit(3);

    const { data: clientesEliminados } = await supabase
      .from("usuarios")
      .select("id, nombre, email, deletedAt")
      .not("deletedAt", "is", null)
      .order("deletedAt", { ascending: false })
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
    await supabase
      .from("usuarios")
      .update({ deletedAt: new Date() })
      .eq("id", req.usuario.id);
    return res.json({ mensaje: "✅ Cuenta dada de baja correctamente." });
  } catch (error) {
    console.error("❌ Error al dar de baja al usuario:", error);
    return res
      .status(500)
      .json({ error: "❌ No se pudo dar de baja la cuenta." });
  }
});

export default router;
