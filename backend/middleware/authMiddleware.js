import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export const verificarToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    // ✅ Obtener el usuario desde la base de datos
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: ["id", "nombre", "email", "rol"], // 🔹 Se añade email
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre, // ✅ Ahora el usuario tiene nombre
      email: usuario.email, // ✅ También tiene email
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Acceso solo para administradores" });
  }
  next();
};
