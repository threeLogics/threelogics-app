import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 🔹 Verificar estado del sistema
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Verificar si el servidor está corriendo
    const servidor = {
      servicio: "Servidor",
      estado: "operativo",
      tiempo_respuesta: "N/A",
    };

    // 2️⃣ Probar API con un simple ping
    const inicioAPI = Date.now();
    try {
      await fetch("http://localhost:5000"); // Cambia si tu API está en otro puerto
      servidor.tiempo_respuesta = `${Date.now() - inicioAPI}ms`;
    } catch {
      servidor.estado = "error";
    }

    // 3️⃣ Probar conexión a Supabase
    const inicioDB = Date.now();
    const { error: dbError } = await supabase
      .from("usuarios")
      .select("id")
      .limit(1);

    const baseDatos = {
      servicio: "Base de Datos",
      estado: dbError ? "error" : "operativo",
      tiempo_respuesta: dbError ? "N/A" : `${Date.now() - inicioDB}ms`,
    };

    res.json([servidor, baseDatos]);
  } catch (error) {
    console.error("❌ Error en estado del sistema:", error);
    res
      .status(500)
      .json([
        { servicio: "Sistema", estado: "error", tiempo_respuesta: "N/A" },
      ]);
  }
});

export default router;
