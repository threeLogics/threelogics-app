import express from "express";
import supabase from "../supabaseClient.js"; 
import { verificarToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/questions", async (req, res) => {
  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, text, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    const userMap = users.users.reduce((acc, user) => {
      acc[user.id] = user.user_metadata?.nombre || "Anónimo";
      return acc;
    }, {});

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

router.get("/answers/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;

    const { data: answers, error } = await supabase
      .from("answers")
      .select("id, text, created_at, user_id")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    const userMap = users.users.reduce((acc, user) => {
      acc[user.id] = user.user_metadata?.nombre || "Anónimo";
      return acc;
    }, {});

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
