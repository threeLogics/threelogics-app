import express from "express";
import supabase from "../supabaseClient.js"; // Asegúrate de importar tu cliente de Supabase
import { verificarToken } from "../middleware/authMiddleware.js"; // Middleware para autenticar

const router = express.Router();

// ✅ Obtener todas las preguntas con los nombres de usuario
router.get("/questions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, text, created_at, usuario_id, usuarios (nombre)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las preguntas" });
  }
});

// ✅ Insertar una nueva pregunta (solo usuarios autenticados)
router.post("/questions", verificarToken, async (req, res) => {
  try {
    const { text } = req.body;
    const usuario_id = req.usuario.id; // El usuario autenticado

    const { data, error } = await supabase
      .from("questions")
      .insert([{ text, usuario_id, created_at: new Date() }]);

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al insertar la pregunta" });
  }
});

// ✅ Obtener respuestas de una pregunta con nombres de usuario
router.get("/answers/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;

    const { data, error } = await supabase
      .from("answers")
      .select("id, text, created_at, usuario_id, usuarios (nombre)")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener respuestas" });
  }
});

// ✅ Insertar una respuesta (solo usuarios autenticados)
router.post("/answers", verificarToken, async (req, res) => {
  try {
    const { text, question_id } = req.body;
    const usuario_id = req.usuario.id;

    const { data, error } = await supabase
      .from("answers")
      .insert([{ text, question_id, usuario_id, created_at: new Date() }]);

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al insertar la respuesta" });
  }
});

export default router;
