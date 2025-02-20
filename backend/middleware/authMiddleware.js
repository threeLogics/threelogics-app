import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";

export const verificarToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    // ✅ Obtener el usuario desde la base de datos con Supabase
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol")
      .eq("id", decoded.id)
      .single();

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    console.error("❌ Error en la autenticación:", error.message);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Acceso solo para administradores" });
  }
  next();
};
