import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Obtener movimientos con nombre del usuario (solo si es admin)
router.get("/", verificarToken, async (req, res) => {
  try {
    // Obtener movimientos con productos relacionados
    const { data: movimientos, error } = await supabase
      .from("movimientos")
      .select(
        "id, tipo, cantidad, fecha, producto_id, user_id, productos (nombre, categoria_id)"
      );

    if (error) return res.status(500).json({ error });

    // ✅ USAR req.usuario.rol en vez de req.user.rol
    if (req.usuario.rol !== "admin") {
      const movimientosUsuario = movimientos.filter(
        (mov) => mov.user_id === req.usuario.id
      );
      return res.json(movimientosUsuario);
    }

    // Obtener todos los usuarios (solo admin puede llegar aquí)
    const { data: usuarios, error: errorUsuarios } =
      await supabase.auth.admin.listUsers();

    if (errorUsuarios) {
      console.error("❌ Error al obtener usuarios:", errorUsuarios);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }

    const usuariosMap = {};
    usuarios.users.forEach((u) => {
      usuariosMap[u.id] = u.user_metadata?.nombre || "Desconocido";
    });

    const movimientosConUsuario = movimientos.map((mov) => ({
      ...mov,
      nombreUsuario: usuariosMap[mov.user_id] || "Desconocido",
    }));

    res.json(movimientosConUsuario);
  } catch (error) {
    console.error("❌ Error en GET /movimientos:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
