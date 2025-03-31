import supabase from "../supabaseClient.js";

export const verificarToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    return res.status(403).json({ error: "⚠️ Token no proporcionado" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error("❌ Error en autenticación:", error);
      return res.status(401).json({ error: "⚠️ Token inválido o expirado" });
    }

    req.usuario = {
      id: data.user.id,
      email: data.user.email,
      rol: data.user.user_metadata?.rol || "usuario", 
    };

    next();
  } catch (error) {
    console.error("❌ Error en verificación de token:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res
      .status(403)
      .json({ error: "⚠️ Acceso solo para administradores" });
  }
  next();
};
