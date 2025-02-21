import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const logoutTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        console.log(
          "🔍 Token expira en:",
          decodedToken.exp,
          "| Tiempo actual:",
          currentTime
        );

        if (!decodedToken.exp || decodedToken.exp < currentTime) {
          console.warn("⚠️ Token expirado, cerrando sesión...");
          cerrarSesionAutomatica();
          return;
        }

        const tiempoRestante = (decodedToken.exp - currentTime) * 1000;
        console.log(
          "⏳ Cerrando sesión en:",
          tiempoRestante / 1000,
          "segundos"
        );

        // Limpiar cualquier timeout previo
        if (logoutTimeoutRef.current) {
          clearTimeout(logoutTimeoutRef.current);
        }

        // Programar cierre de sesión
        logoutTimeoutRef.current = setTimeout(() => {
          cerrarSesionAutomatica();
        }, tiempoRestante);

        setUsuario(parsedUser);
      } catch (error) {
        console.error("❌ Error al procesar el token:", error);
        logout();
      }
    }
  }, []);

  const cerrarSesionAutomatica = () => {
    if (!usuario) return; // Evita múltiples llamadas innecesarias
    console.warn("⚠️ Tu sesión ha expirado.");
    logout();
  };

  const login = (data) => {
    if (!data.usuario || !data.token) {
      console.error("❌ Datos inválidos en login:", data);
      return;
    }

    try {
      const decodedToken = jwtDecode(data.token);
      const tiempoRestante = (decodedToken.exp - Date.now() / 1000) * 1000;
      console.log("⏳ Token válido por:", tiempoRestante / 1000, "segundos");

      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }

      logoutTimeoutRef.current = setTimeout(() => {
        cerrarSesionAutomatica();
      }, tiempoRestante);
    } catch (error) {
      console.error("❌ Error al decodificar el token:", error);
      return;
    }

    setUsuario(data.usuario);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
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
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
