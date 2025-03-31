import supabase from "../supabaseClient.js";

export const suscribirse = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    const { data: existe, error } = await supabase
      .from("suscriptors")
      .select("email")
      .eq("email", email)
      .single();

    if (existe) {
      return res.status(400).json({ error: "Este correo ya está suscrito" });
    }

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error al buscar suscriptor:", error);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    const { error: insertError } = await supabase
      .from("suscriptors")
      .insert([{ email }]);

    if (insertError) {
      console.error("❌ Error al suscribirse:", insertError);
      return res.status(500).json({ error: "Error al suscribirse" });
    }

    res.status(201).json({ mensaje: "¡Gracias por suscribirte!" });
  } catch (error) {
    console.error("❌ Error en suscripción:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
