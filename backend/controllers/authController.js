import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import nodemailer from "nodemailer";
import crypto from "crypto"; // ✅ Para generar el token de verificación

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      lastPasswordChange: usuario.lastPasswordChange || new Date(), // ✅ Asegura que no sea NULL
    },
    process.env.JWT_SECRET,
    { expiresIn: "1m" }
  );
};

// ✅ Registro de usuario
export const register = async (req, res) => {
  try {
    console.log("Datos recibidos en backend:", req.body);

    let { nombre, email, password, rol } = req.body;

    if (!rol || (rol !== "admin" && rol !== "usuario")) {
      rol = "usuario";
    }

    const usuarioExistente = await Usuario.findOne({
      where: { email },
      paranoid: false,
    });

    if (usuarioExistente) {
      if (usuarioExistente.deletedAt) {
        return res.status(400).json({
          error:
            "Este correo está asociado a un usuario dado de baja. Contacta con soporte.",
        });
      }
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Generar token único de verificación
    const tokenVerificacion = crypto.randomBytes(32).toString("hex"); // ✅ Genera el token único

    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol,
      verificado: false, // ❌ El usuario NO podrá loguearse aún
      tokenVerificacion, // 🔹 Se guarda el token en la base de datos
    });

    // 🔹 Enlace de verificación
    const verificationLink = `${process.env.FRONTEND_URL}/verificar/${tokenVerificacion}`;
    console.log("✅ Enlace de verificación generado:", verificationLink);

    // 🔹 Configurar email
    const mailOptions = {
      from: `"ThreeLogics Soporte" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: "Verifica tu cuenta en ThreeLogics",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2DD4BF; text-align: center;">ThreeLogics</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Gracias por registrarte en <strong>ThreeLogics</strong>. Para activar tu cuenta, por favor verifica tu correo haciendo clic en el siguiente botón:</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${verificationLink}" style="background-color: #2DD4BF; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Verificar Cuenta</a>
          </div>
          <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
          <p style="text-align: center; font-size: 12px; color: #777;">El equipo de ThreeLogics</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      mensaje: "Registro exitoso. Revisa tu correo para verificar la cuenta.",
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};
export const verificarCuenta = async (req, res) => {
  try {
    console.log("🔍 Token recibido en backend:", req.params.token); // ✅ Verifica que el token llega

    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token no proporcionado." });
    }

    const usuario = await Usuario.findOne({
      where: { tokenVerificacion: token },
    });

    if (!usuario) {
      return res.status(400).json({ error: "Token inválido o expirado." });
    }

    usuario.verificado = true;
    usuario.tokenVerificacion = null; // Elimina el token después de verificar
    await usuario.save();

    res.json({
      mensaje: "Cuenta verificada con éxito. Ahora puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("❌ Error al verificar cuenta:", error);
    res.status(500).json({ error: "Error al verificar la cuenta." });
  }
};

// ✅ Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({
      where: { email },
      paranoid: false,
    });

    if (!usuario) {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos." });
    }

    // Caso 1: Usuario ha sido eliminado (soft delete)
    if (usuario.deletedAt !== null) {
      return res.status(403).json({
        error:
          "Esta cuenta ha sido dada de baja. Contacta con soporte si deseas recuperarla.",
        tipoError: "cuenta_eliminada",
      });
    }

    // Caso 2: Usuario no ha verificado su cuenta
    if (!usuario.verificado) {
      return res.status(403).json({
        error: "Debes verificar tu correo antes de iniciar sesión.",
        tipoError: "correo_no_verificado",
      });
    }

    // Verificar contraseña
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos." });
    }

    // Generar token
    const token = generarToken(usuario);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

// ✅ Actualización de perfil (nombre, email y opcionalmente contraseña)
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, nuevoPassword } = req.body;

    // 🔹 Buscar usuario incluyendo eliminados
    const usuario = await Usuario.findByPk(req.usuario.id, { paranoid: false });

    if (!usuario) {
      return res.status(404).json({ error: "❌ Usuario no encontrado." });
    }

    // 🔹 Verificar si el usuario fue eliminado
    if (usuario.deletedAt) {
      return res.status(403).json({
        error:
          "❌ Esta cuenta ha sido dada de baja. Contacta con soporte para recuperarla.",
      });
    }

    // ✅ Verificar si el nuevo email ya está en uso por otro usuario
    if (email !== usuario.email) {
      const emailExistente = await Usuario.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(400).json({ error: "❌ El email ya está en uso." });
      }
    }

    // ✅ Actualizar nombre y email sin modificar la contraseña
    usuario.nombre = nombre;
    usuario.email = email;

    // ✅ Si se proporciona nueva contraseña, verificar antes de actualizar
    if (nuevoPassword) {
      const hashedPassword = await bcrypt.hash(nuevoPassword, 10);
      usuario.password = hashedPassword;
      usuario.lastPasswordChange = new Date();
    }

    await usuario.save();

    res.json({
      mensaje: "✅ Perfil actualizado con éxito",
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        lastPasswordChange: usuario.lastPasswordChange || new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: "❌ Error al actualizar perfil." });
  }
};

// ✅ Cambio de contraseña desde el perfil
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, nuevoPassword } = req.body;

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const esValido = await bcrypt.compare(passwordActual, usuario.password);
    if (!esValido) {
      return res.status(400).json({ error: "Contraseña actual incorrecta" });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevoPassword, 10);
    usuario.password = hashedPassword;
    usuario.lastPasswordChange = new Date();

    await usuario.save();

    res.json({
      mensaje: "✅ Contraseña cambiada con éxito",
      lastPasswordChange: usuario.lastPasswordChange,
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// ✅ Recuperación de contraseña
// ✅ Recuperación de contraseña (Versión mejorada)
export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔹 Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res
        .status(404)
        .json({ error: "❌ No existe una cuenta con este correo." });
    }

    // 🔹 Generar una contraseña temporal más segura
    const tempPassword = Math.random().toString(36).slice(-6) + "A@";
    usuario.password = await bcrypt.hash(tempPassword, 10);
    await usuario.save();

    // 🔹 Configurar email
    const mailOptions = {
      from: `"ThreeLogics Soporte" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: "🔑 Recuperación de Contraseña - ThreeLogics",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <!-- Logo de la empresa -->
          <div style="text-align: center; padding-bottom: 20px;">
            <h2 style="color: #2DD4BF; margin-top: 10px;">ThreeLogics</h2>
          </div>
    
          <!-- Contenido del email -->
          <p style="color: #333;">Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña en <strong>ThreeLogics</strong>. Se ha generado una nueva contraseña temporal para ti:</p>
    
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; border-radius: 5px;">
            ${tempPassword}
          </div>
    
          <p style="margin-top: 15px;">Por favor, utiliza esta contraseña para iniciar sesión y cambia tu contraseña en la configuración de tu perfil lo antes posible.</p>
    
          <!-- Firma -->
          <p style="color: #555; margin-top: 20px; font-size: 14px;">Si no has solicitado este cambio, puedes ignorar este mensaje.</p>
          <p style="color: #888; font-size: 12px;">Atentamente,<br>El equipo de <strong>ThreeLogics</strong></p>
        </div>
      `,
    };

    // 🔹 Enviar correo y manejar errores
    await transporter.sendMail(mailOptions);

    res.json({ mensaje: "✅ Se ha enviado una nueva contraseña a tu correo." });
  } catch (error) {
    console.error("❌ Error en recuperación de contraseña:", error);
    res.status(500).json({
      error: "❌ Error al recuperar la contraseña. Inténtalo más tarde.",
    });
  }
};
