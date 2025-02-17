import express from "express";
import { body, validationResult } from "express-validator";
import Categoria from "../models/Categoria.js";
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

// Crear categoría con validación, usuarioId y evitar duplicados
router.post(
  "/",
  [
    verificarToken, // Asegurar que el usuario está autenticado
    body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
  ],
  validarCampos,
  async (req, res) => {
    try {
      const { nombre } = req.body;
      const usuarioId = req.usuario.id;

      // Verificar si la categoría ya existe para este usuario
      const categoriaExistente = await Categoria.findOne({
        where: { nombre, usuarioId },
      });

      if (categoriaExistente) {
        return res.status(400).json({
          error: "Esta categoría ya existe para este usuario.",
        });
      }

      // Crear la nueva categoría
      const categoria = await Categoria.create({ nombre, usuarioId });

      res.status(201).json({
        mensaje: `Categoría "${categoria.nombre}" creada con éxito.`,
        categoria,
      });
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// Obtener todas las categorías sin duplicados
router.get("/", verificarToken, async (req, res) => {
  try {
    let categorias;

    if (req.usuario.rol === "admin") {
      // Admin ve todas las categorías
      categorias = await Categoria.findAll();
    } else {
      // Cliente solo ve sus propias categorías
      categorias = await Categoria.findAll({
        where: { usuarioId: req.usuario.id },
      });
    }

    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar una categoría
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Buscar la categoría en la base de datos
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Actualizar el nombre de la categoría
    categoria.nombre = nombre;
    await categoria.save(); // Guardamos los cambios en la base de datos

    res.status(200).json({
      mensaje: `Categoría "${categoria.nombre}" actualizada correctamente`,
      categoria,
    });
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
