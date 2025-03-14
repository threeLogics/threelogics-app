import supabase from "../supabaseClient.js";

// ✅ Registro de usuario con Supabase Auth
export const register = async (req, res) => {
  try {
    console.log("📩 Datos recibidos en backend:", req.body);

    let { nombre, email, password, rol } = req.body;
    if (!rol || (rol !== "admin" && rol !== "usuario")) rol = "usuario";

    // 📌 1️⃣ Verificar si el usuario ya existe en Supabase
    const { data: existingUser, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("❌ Error al verificar usuario existente:", userError);
      return res.status(500).json({ error: "Error al verificar el usuario." });
    }

    // 📌 2️⃣ Buscar si ya existe el email en la lista de usuarios
    const usuarioEncontrado = existingUser.users.find(
      (user) => user.email === email
    );

    if (usuarioEncontrado) {
      // 📌 3️⃣ Si el usuario tiene `deleted_at`, impedir registro y pedir contacto con soporte
      if (usuarioEncontrado.user_metadata?.deleted_at) {
        return res.status(403).json({
          error:
            "Tu cuenta fue dada de baja. Contacta con soporte para más información.",
        });
      }

      // 📌 4️⃣ Si el usuario ya existe, evitar duplicados
      return res.status(400).json({
        error: "Este correo ya está registrado. Intenta iniciar sesión.",
      });
    }

    // 📌 5️⃣ Si el usuario no existe, proceder con el registro
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, rol },
        emailRedirectTo: "http://localhost:5173/verificar-cuenta",
      },
    });

    if (error) {
      console.error("❌ Error en Supabase:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      mensaje: "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
    });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// ✅ Inicio de sesión con Supabase Auth
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Error en login:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data.session || !data.user) {
      return res.status(400).json({ error: "Error en la autenticación." });
    }

    // 📌 Verificar si el usuario ha sido dado de baja
    if (data.user.user_metadata?.deleted_at) {
      return res.status(403).json({
        error:
          "Tu cuenta ha sido dada de baja. Contacta con soporte para más información.",
      });
    }

    res.json({
      token: data.session.access_token,
      usuario: data.user,
    });
  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

// ✅ Cerrar sesión con Supabase Auth
export const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });

    res.json({ mensaje: "Sesión cerrada correctamente." });
  } catch {
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
};

// ✅ Obtener usuario autenticado con Supabase Auth
export const getUser = async (req, res) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return res.status(400).json({ error: error.message });

    res.json({ usuario: user });
  } catch {
    res.status(500).json({ error: "Error al obtener usuario." });
  }
};
// ✅ Recuperación de contraseña con Supabase Auth
export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      mensaje:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    console.error("❌ Error en recuperación de contraseña:", error);
    res.status(500).json({ error: "Error al recuperar la contraseña." });
  }
};

// ✅ Cambiar la contraseña después de recibir el token
export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar contraseña:", error);
    res.status(500).json({ error: "Error al actualizar la contraseña." });
  }
};
