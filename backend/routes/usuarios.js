import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { verificarToken } from "../middleware/authMiddleware.js";
import Usuario from "../models/Usuario.js";
import { Op } from "sequelize"; // ✅ Agregar esta línea

const router = express.Router();

// 📌 Configuración de `multer` para manejar la subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Obtener perfil del usuario autenticado
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ["nombre", "email", "imagenPerfil", "deletedAt"],
      paranoid: false,
    });

    // ✅ En vez de un error 404, devolvemos usuario: null
    if (!usuario) {
      return res.json({ usuario: null }); // 👈 ¡Ya no envía error 404!
    }

    // 🔹 Si el usuario está dado de baja, también devolvemos usuario: null
    if (usuario.deletedAt) {
      return res.json({ usuario: null });
    }

    res.json({
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        imagenPerfil: usuario.imagenPerfil
          ? `data:image/png;base64,${usuario.imagenPerfil.toString("base64")}`
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ error: "❌ No se pudo obtener el perfil" });
  }
});

router.put(
  "/perfil",
  verificarToken,
  upload.single("imagenPerfil"),
  async (req, res) => {
    console.log("Archivo recibido:", req.file); // 🔍 Verifica si multer está recibiendo la imagen
    console.log("Datos recibidos:", req.body);

    try {
      const { nombre, email, nuevoPassword } = req.body;
      const imagenPerfil = req.file ? req.file.buffer : null; // Capturamos la imagen

      const usuario = await Usuario.findByPk(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // ✅ Verificar si `multer` realmente recibió el archivo
      console.log(
        "Imagen a guardar:",
        imagenPerfil ? "Sí, hay imagen" : "No, sin imagen"
      );

      // ✅ Actualizar los datos
      usuario.nombre = nombre;
      usuario.email = email;
      if (nuevoPassword) {
        usuario.password = await bcrypt.hash(nuevoPassword, 10);
        usuario.lastPasswordChange = new Date();
      }
      if (imagenPerfil) {
        usuario.imagenPerfil = imagenPerfil;
      }

      await usuario.save();

      res.json({
        mensaje: "✅ Perfil actualizado con éxito",
        usuario: {
          nombre: usuario.nombre,
          email: usuario.email,
          imagenPerfil: usuario.imagenPerfil
            ? usuario.imagenPerfil.toString("base64")
            : null,
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
    // Últimos 3 clientes creados
    const nuevosClientes = await Usuario.findAll({
      where: { rol: "usuario" },
      order: [["createdAt", "DESC"]],
      limit: 3,
      attributes: ["id", "nombre", "email", "createdAt"],
    });

    // Últimos 3 clientes eliminados (Soft Delete)
    const clientesEliminados = await Usuario.findAll({
      where: { deletedAt: { [Op.ne]: null } }, // 🔹 Filtrar solo los eliminados
      order: [["deletedAt", "DESC"]],
      limit: 3,
      attributes: ["id", "nombre", "email", "deletedAt"],
      paranoid: false, // 🔹 Para traer registros eliminados
    });

    res.json({ nuevosClientes, clientesEliminados });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});
// ✅ Dar de baja un usuario (Soft Delete)
router.delete("/perfil", verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    await usuario.destroy(); // Soft delete (marcar como eliminado)

    // ✅ Devolver una respuesta clara y evitar más búsquedas innecesarias
    return res.json({ mensaje: "✅ Cuenta dada de baja correctamente." });
  } catch (error) {
    console.error("❌ Error al dar de baja al usuario:", error);
    return res
      .status(500)
      .json({ error: "❌ No se pudo dar de baja la cuenta." });
  }
});

export default router;
