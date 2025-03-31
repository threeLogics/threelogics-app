import express from "express";
import supabase from "../supabaseClient.js";
import os from "os";

const router = express.Router();

// 🔹 Función para determinar estado según tiempo de respuesta
const determinarEstado = (tiempoRespuesta, error, enMantenimiento) => {
  if (enMantenimiento) return "mantenimiento";
  if (error) return "error";
  if (tiempoRespuesta > 1000) return "lento";
  if (tiempoRespuesta > 500) return "degradado";
  return "operativo";
};

// 🔹 Verificar estado del sistema
router.get("/", async (req, res) => {
  try {
    const servicios = [];

    // 🔹 Verificar si el servidor está en mantenimiento
    const { data: mantenimientoData, error: mantenimientoError } =
      await supabase
        .from("estado_sistema")
        .select("estado")
        .eq("nombre", "Servidor")
        .single();

    const servidorEnMantenimiento =
      mantenimientoData?.estado === "mantenimiento";

    // 🔹 Verificar si el servidor está corriendo
    let servidorEstado = "operativo";
    let servidorTiempo = "N/A";

    const inicioAPI = Date.now();
    try {
      await fetch("https://tu-backend.onrender.com");
      servidorTiempo = `${Date.now() - inicioAPI}ms`;
    } catch {
      servidorEstado = "error";
    }

    servidorEstado = determinarEstado(
      parseInt(servidorTiempo),
      servidorEstado === "error",
      servidorEnMantenimiento
    );

    servicios.push({
      servicio: "Servidor",
      estado: servidorEstado,
      tiempo_respuesta: servidorTiempo,
    });

    // 🔹 Verificar la conexión con la Base de Datos
    let dbEstado = "operativo";
    let dbTiempo = "N/A";

    const inicioDB = Date.now();
    const { error: dbError } = await supabase
      .from("auth.users") // ✅ una tabla válida
      .select("id")
      .limit(1);

    if (dbError) {
      console.error("Error al conectar con Supabase:", dbError.message);
      dbEstado = "error";
    } else {
      dbTiempo = `${Date.now() - inicioDB}ms`;
      dbEstado = determinarEstado(parseInt(dbTiempo), false, false);
    }

    servicios.push({
      servicio: "Base de Datos",
      estado: dbEstado,
      tiempo_respuesta: dbTiempo,
    });

    // 🔹 Verificar API Externa
    let apiExternaEstado = "operativo";
    let apiExternaTiempo = "N/A";

    const inicioAPIExterna = Date.now();
    try {
      await fetch("https://threelogics-app.onrender.com/api/ping", {
        method: "GET",
      });
      apiExternaTiempo = `${Date.now() - inicioAPIExterna}ms`;
    } catch {
      apiExternaEstado = "error";
    }

    servicios.push({
      servicio: "API Backend",
      estado: apiExternaEstado,
      tiempo_respuesta: apiExternaTiempo,
    });

    // 🔹 Verificar carga del servidor
    const cargaCPU = os.loadavg()[0]; // Promedio de carga del CPU en los últimos 5 minutos
    servicios.push({
      servicio: "Carga del Servidor",
      estado: cargaCPU > 2 ? "degradado" : "operativo",
      tiempo_respuesta: `${cargaCPU.toFixed(2)} CPU Load`,
    });

    res.json(servicios);
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
