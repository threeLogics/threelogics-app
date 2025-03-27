import express from "express";
import supabase from "../supabaseClient.js"; // Importa Supabase correctamente
import { verificarToken } from "../middleware/authMiddleware.js"; // Middleware para autenticar

const router = express.Router();

// ✅ Obtener todas las preguntas con nombres de usuario desde auth.users
router.get("/questions", async (req, res) => {
  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, text, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Obtener los usuarios desde Supabase Auth
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    // Mapear IDs de usuario a nombres
    const userMap = users.users.reduce((acc, user) => {
      acc[user.id] = user.user_metadata?.nombre || "Anónimo";
      return acc;
    }, {});

    // Agregar el nombre de usuario a cada pregunta
    const questionsWithNames = questions.map((q) => ({
      ...q,
      nombre_usuario: userMap[q.user_id] || "Anónimo",
    }));

    res.json(questionsWithNames);
  } catch (error) {
    console.error("❌ Error al obtener preguntas:", error);
    res.status(500).json({ error: "Error al obtener las preguntas" });
  }
});

// ✅ Insertar una nueva pregunta (solo usuarios autenticados)
router.post("/questions", verificarToken, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.usuario?.id;

    if (!text || !userId) {
      return res
        .status(400)
        .json({ error: "El texto y usuario_id son obligatorios" });
    }

    const { data, error } = await supabase
      .from("questions")
      .insert([{ text, user_id: userId, created_at: new Date() }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("❌ Error al insertar pregunta:", error);
    res.status(500).json({ error: "Error al insertar la pregunta" });
  }
});

// ✅ Obtener respuestas de una pregunta con nombres de usuario desde auth.users
router.get("/answers/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;

    const { data: answers, error } = await supabase
      .from("answers")
      .select("id, text, created_at, user_id")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Obtener los nombres de usuario desde Supabase Auth
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    const userMap = users.users.reduce((acc, user) => {
      acc[user.id] = user.user_metadata?.nombre || "Anónimo";
      return acc;
    }, {});

    // Agregar el nombre de usuario a cada respuesta
    const answersWithNames = answers.map((a) => ({
      ...a,
      nombre_usuario: userMap[a.user_id] || "Anónimo",
    }));

    res.json(answersWithNames);
  } catch (error) {
    console.error("❌ Error al obtener respuestas:", error);
    res.status(500).json({ error: "Error al obtener respuestas" });
  }
});

// ✅ Insertar una respuesta (solo usuarios autenticados)
router.post("/answers", verificarToken, async (req, res) => {
  try {
    const { text, question_id } = req.body;
    const userId = req.usuario?.id;

    if (!text || !question_id || !userId) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from("answers")
      .insert([{ text, question_id, user_id: userId, created_at: new Date() }]);

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("❌ Error al insertar respuesta:", error);
    res.status(500).json({ error: "Error al insertar la respuesta" });
  }
});

export default router;
