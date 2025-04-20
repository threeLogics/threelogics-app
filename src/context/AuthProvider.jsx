import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [mensajeExpiracion, setMensajeExpiracion] = useState("");
  const logoutTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsuario(parsedUser);

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.warn("⚠️ Token expirado, cerrando sesión...");
          cerrarSesionAutomatica();
        } else {
          const tiempoRestante = (decodedToken.exp - currentTime) * 1000;
          console.log(
            "⏳ Token válido por:",
            tiempoRestante / 1000,
            "segundos"
          );

          if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
          }

          logoutTimeoutRef.current = setTimeout(() => {
            cerrarSesionAutomatica();
          }, tiempoRestante);
        }
      } catch (error) {
        console.error("❌ Error al decodificar el token:", error);
        logout();
      }
    } else {
      logout();
    }
  }, []);

  const cerrarSesionAutomatica = () => {
    console.warn("⚠️ Token expirado. Cerrando sesión...");

    setMensajeExpiracion("⚠️ Token expirado. Cerrando sesión en 2 segundos...");

    setTimeout(() => {
      logout();
      setMensajeExpiracion("⚠️ Token expirado. Inicia sesión nuevamente.");
    }, 2000);
  };

  const login = (data) => {
    if (!data.usuario || !data.token) {
      console.error("❌ Datos inválidos en login:", data);
      return;
    }

    try {
      const decodedToken = jwtDecode(data.token);

      const usuario = {
        id: decodedToken.sub,
        nombre: decodedToken.user_metadata?.nombre || "Usuario",
        email: decodedToken.email,
        rol: decodedToken.user_metadata?.rol || "usuario",
        imagenPerfil:
          decodedToken.user_metadata?.imagenPerfil || "src/assets/avatar.png",
      };

      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }

      logoutTimeoutRef.current = setTimeout(() => {
        cerrarSesionAutomatica();
      }, (decodedToken.exp - Date.now() / 1000) * 1000);

      setMensajeExpiracion("");
      setUsuario(usuario);
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      console.log("✅ Usuario autenticado:", usuario);
    } catch (error) {
      console.error("❌ Error al decodificar el token:", error);
      return;
    }
  };

  const logout = () => {
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);

    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  const actualizarPerfil = (datosActualizados) => {
    if (!usuario) return;

    const usuarioActualizado = {
      ...usuario,
      ...datosActualizados,
      imagenPerfil: datosActualizados.imagenPerfil || usuario.imagenPerfil,
    };

    if (datosActualizados.lastPasswordChange) {
      usuarioActualizado.lastPasswordChange =
        datosActualizados.lastPasswordChange;
    }

    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, actualizarPerfil }}>
      {children}
      {mensajeExpiracion && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "red",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {mensajeExpiracion}
        </div>
      )}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
