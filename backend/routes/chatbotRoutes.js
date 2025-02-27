import express from "express";
import supabase from "../supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 🛠 Función para limpiar y normalizar texto (quita signos, tildes y espacios extra)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina tildes
    .replace(/[¿?.,!]/g, "") // Elimina signos de puntuación
    .replace(/\s+/g, " ") // Evita espacios dobles
    .trim();
};

// 🚀 API Chatbot mejorada con búsqueda flexible
router.post("/chat", async (req, res) => {
  try {
    let { message } = req.body;
    if (!message)
      return res.status(400).json({ error: "El mensaje está vacío." });

    // 🔍 Normalización del mensaje
    let cleanMessage = normalizeText(message);

    // 🔎 1. Intentamos encontrar una coincidencia exacta
    let { data: exactMatch, error: exactError } = await supabase
      .from("conocimientos")
      .select("respuesta")
      .eq("pregunta", cleanMessage)
      .limit(1);

    if (exactError) throw exactError;
    if (exactMatch.length > 0)
      return res.json({ reply: exactMatch[0].respuesta });

    // 🔎 2. Búsqueda aproximada usando ILIKE
    let { data: partialMatch, error: partialError } = await supabase
      .from("conocimientos")
      .select("respuesta")
      .ilike("pregunta", `%${cleanMessage}%`)
      .order("pregunta", { ascending: true })
      .limit(1);

    if (partialError) throw partialError;
    if (partialMatch.length > 0)
      return res.json({ reply: partialMatch[0].respuesta });

    // 🛑 3. Si no encuentra nada, intentar con palabras clave
    let shortMessage = cleanMessage.split(" ").slice(0, 3).join(" "); // Solo 3 primeras palabras
    let { data: keywordMatch, error: keywordError } = await supabase
      .from("conocimientos")
      .select("respuesta")
      .ilike("pregunta", `%${shortMessage}%`)
      .limit(1);

    if (keywordError) throw keywordError;
    if (keywordMatch.length > 0)
      return res.json({ reply: keywordMatch[0].respuesta });

    // 🚨 4. Si no encuentra nada, responder con mensaje predeterminado
    return res.json({
      reply: "No tengo información sobre eso. ¿Puedes reformular la pregunta?",
    });
  } catch (error) {
    console.error("❌ Error en el chatbot:", error);
    res.status(500).json({ error: "Error en el chatbot" });
  }
});

export default router;
