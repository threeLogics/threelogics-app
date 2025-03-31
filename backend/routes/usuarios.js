import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const AVATARS = {
  default:
    "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/avatars/avatar.png",
  avatar4:
    "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/avatars/avatar4.png",
  avatar5:
    "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/avatars/avatar5.png",
};
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !data?.user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = data.user;
    const avatarUrl = user.user_metadata?.imagenPerfil || AVATARS.default; // Si no tiene avatar, usa el default

    res.json({
      usuario: {
        id: user.id,
        nombre: user.user_metadata?.nombre || "Sin nombre",
        email: user.email,
        imagen_perfil: avatarUrl, // ✅ Siempre devolver una URL válida
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ error: "No se pudo obtener el perfil" });
  }
});

router.put("/perfil", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { nombre, email, nuevoPassword, imagenPerfil } = req.body;

    const imagenPerfilUrl = Object.values(AVATARS).includes(imagenPerfil)
      ? imagenPerfil
      : AVATARS.default;

    const updateData = {
      email,
      password: nuevoPassword
        ? await bcrypt.hash(nuevoPassword, 10)
        : undefined,
      user_metadata: { nombre, imagenPerfil: imagenPerfilUrl },
    };

    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (error) {
      console.error("❌ Error en la actualización:", error);
      return res.status(500).json({ error: "No se pudo actualizar el perfil" });
    }

    res.json({
      mensaje: "✅ Perfil actualizado con éxito",
      usuario: {
        id: data.user.id,
        nombre: data.user.user_metadata?.nombre || "Sin nombre",
        email: data.user.email,
        imagen_perfil: data.user.user_metadata?.imagenPerfil || AVATARS.default,
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: "❌ No se pudo actualizar el perfil" });
  }
});

router.get("/ultimos-clientes", async (req, res) => {
  try {
    const { data: usuarios, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const clientes = usuarios.users.filter(
      (user) => user.user_metadata?.rol === "usuario"
    );

    const nuevosClientes = clientes
      .filter((user) => !user.user_metadata?.deleted_at) 
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3) 
      .map((user) => ({
        id: user.id,
        nombre: user.user_metadata?.nombre || "Sin nombre",
        email: user.email,
        created_at: user.created_at,
      }));

    const clientesEliminados = clientes
      .filter((user) => user.user_metadata?.deleted_at) 
      .sort(
        (a, b) =>
          new Date(b.user_metadata.deleted_at) -
          new Date(a.user_metadata.deleted_at)
      ) 
      .slice(0, 3) 
      .map((user) => ({
        id: user.id,
        nombre: user.user_metadata?.nombre || "Sin nombre",
        email: user.email,
        deleted_at: user.user_metadata.deleted_at,
      }));

    
    res.json({ nuevosClientes, clientesEliminados });
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: "❌ Error al obtener clientes" });
  }
});


router.delete("/perfil", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;

   
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
