import Suscriptor from "../models/Suscriptor.js";

// ✅ Función para manejar la suscripción
export const suscribirse = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    // Verificar si el email ya está registrado
    const existe = await Suscriptor.findOne({ where: { email } });

    if (existe) {
      return res.status(400).json({ error: "Este correo ya está suscrito" });
    }

    // Guardar el email en la base de datos
    await Suscriptor.create({ email });

    res.status(201).json({ mensaje: "¡Gracias por suscribirte!" });
  } catch (error) {
    console.error("❌ Error en suscripción:", error);
    res.status(500).json({ error: "Error al suscribirse" });
  }
};
