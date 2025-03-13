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
    const userId = req.usuario.id;

    // 📌 Obtener datos del usuario desde Supabase Auth
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !data?.user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = data.user;

    res.json({
      usuario: {
        id: user.id,
        nombre: user.user_metadata?.nombre || "Sin nombre",
        email: user.email,
        imagen_perfil: user.user_metadata?.imagenPerfil || null, // La imagen se almacena en `user_metadata`
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ error: "No se pudo obtener el perfil" });
  }
});

// 📌 Actualizar perfil del usuario
router.put(
  "/perfil",
  verificarToken,
  upload.single("imagenPerfil"),
  async (req, res) => {
    try {
      const userId = req.usuario.id;
      const { nombre, email, nuevoPassword } = req.body;
      let imagenPerfil = null;

      if (req.file) {
        imagenPerfil = `data:image/png;base64,${req.file.buffer.toString(
          "base64"
        )}`;
      }

      // 📌 Obtener usuario desde Supabase Auth
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        email,
        password: nuevoPassword
          ? await bcrypt.hash(nuevoPassword, 10)
          : undefined,
        user_metadata: {
          nombre,
          ...(imagenPerfil && { imagenPerfil }),
        },
      });

      if (error) {
        console.error("❌ Error en la actualización:", error);
        return res
          .status(500)
          .json({ error: "No se pudo actualizar el perfil" });
      }

      res.json({
        mensaje: "✅ Perfil actualizado con éxito",
        usuario: {
          id: data.user.id,
          nombre: data.user.user_metadata?.nombre || "Sin nombre",
          email: data.user.email,
          imagen_perfil: data.user.user_metadata?.imagenPerfil || null,
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
    const { data: nuevosClientes, error: errorNuevos } =
      await supabase.auth.admin.listUsers();

    if (errorNuevos) {
      throw errorNuevos;
    }

    const clientesFiltrados = nuevosClientes.users
      .filter((user) => user.user_metadata?.rol === "usuario")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .map((user) => ({
        id: user.id,
        nombre: user.user_metadata?.nombre || "Sin nombre",
        email: user.email,
        created_at: user.created_at,
      }));

    res.json({ nuevosClientes: clientesFiltrados });
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: "❌ Error al obtener clientes" });
  }
});

// 📌 Dar de baja un usuario (Soft Delete)
router.delete("/perfil", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;

    // 🔥 Desactivar el usuario en Supabase Auth en lugar de eliminarlo
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        deleted_at: new Date().toISOString(),
      },
    });

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
