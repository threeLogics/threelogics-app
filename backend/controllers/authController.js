import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";
import nodemailer from "nodemailer";
import crypto from "crypto"; // ✅ Para generar el token de verificación

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      lastPasswordChange: usuario.lastPasswordChange || new Date(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // 🔹 Token válido por 1 hora
  );
};

// ✅ Registro de usuario
// ✅ Registro de usuario
export const register = async (req, res) => {
  try {
    console.log("📩 Datos recibidos en backend:", req.body);

    let { nombre, email, password, rol } = req.body;
    if (!rol || (rol !== "admin" && rol !== "usuario")) rol = "usuario";

    // Verificar si el usuario ya existe
    const { data: usuarioExistente, error: errorExistente } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle(); // ✅ Usa `maybeSingle()` para evitar errores

    if (errorExistente) {
      console.error("❌ Error en consulta a Supabase:", errorExistente);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token_verificacion = crypto.randomBytes(32).toString("hex");

    const { error } = await supabase.from("usuarios").insert([
      {
        nombre,
        email,
        password: hashedPassword,
        rol,
        verificado: false,
        token_verificacion,
        last_password_change: new Date().toISOString(), // 🔹 Asegura que se inserte un valor
      },
    ]);

    if (error) throw error;

    // ✅ Corregir el enlace de verificación
    const verificationLink = `${process.env.FRONTEND_URL}/verificar/${token_verificacion}`;
    console.log("✅ Enlace de verificación generado:", verificationLink);

    // 📩 Configurar email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ThreeLogics Soporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verifica tu cuenta en ThreeLogics",
      html: `<p>Hola <strong>${nombre}</strong>,</p>
            <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
            <a href="${verificationLink}" target="_blank">Verificar Cuenta</a>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({
      mensaje: "Registro exitoso. Revisa tu correo para verificar la cuenta.",
    });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// ✅ Verificación de cuenta

export const verificarCuenta = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("🔍 Token recibido en el backend:", token);

    if (!token) {
      return res
        .status(400)
        .json({ error: "Token de verificación requerido." });
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("token_verificacion", token)
      .maybeSingle(); // ✅ Usa `maybeSingle()` para evitar errores

    if (error) {
      console.error("❌ Error en consulta de verificación:", error);
      return res.status(500).json({ error: "Error en la base de datos." });
    }

    if (!usuario) {
      return res.status(400).json({ error: "Token inválido o ya utilizado." });
    }

    // ✅ Verificar si ya estaba activada antes
    if (usuario.verificado) {
      return res
        .status(200)
        .json({ mensaje: "Esta cuenta ya estaba verificada." });
    }

    await supabase
      .from("usuarios")
      .update({ verificado: true, token_verificacion: null })
      .eq("id", usuario.id);

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

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos." });
    }

    if (!usuario.verificado) {
      return res
        .status(403)
        .json({ error: "Debes verificar tu correo antes de iniciar sesión." });
    }

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
    console.error("❌ Error en login:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

// ✅ Recuperación de contraseña
export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (!usuario)
      return res
        .status(404)
        .json({ error: "No existe una cuenta con este correo." });

    const tempPassword = Math.random().toString(36).slice(-6) + "A@";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await supabase
      .from("usuarios")
      .update({ password: hashedPassword })
      .eq("id", usuario.id);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ThreeLogics Soporte" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: "Recuperación de Contraseña - ThreeLogics",
      html: `<p>Hola <strong>${usuario.nombre}</strong>,</p>
             <p>Tu nueva contraseña temporal es: <strong>${tempPassword}</strong></p>
             <p>Cambia tu contraseña lo antes posible.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ mensaje: "Se ha enviado una nueva contraseña a tu correo." });
  } catch (error) {
    console.error("❌ Error en recuperación de contraseña:", error);
    res.status(500).json({ error: "Error al recuperar la contraseña." });
  }
};
