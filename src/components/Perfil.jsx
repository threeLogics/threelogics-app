  import { useState, useContext, useEffect } from "react";
  import { api } from "../services/api";
  import { AuthContext } from "../context/AuthContext";
  import { toast } from "react-toastify";
  import { useNavigate } from "react-router-dom";
  import { Eye, EyeOff, ArrowLeft } from "lucide-react"; // Iconos para mostrar/ocultar contraseña
  import zxcvbn from "zxcvbn"; // Biblioteca para evaluar la seguridad de la contraseña

  export default function Perfil() {
    const { usuario, actualizarPerfil, logout } = useContext(AuthContext);

    const navigate = useNavigate();
    const [user, setUser] = useState({ nombre: "", email: "" });
    const [nuevoPassword, setNuevoPassword] = useState(""); // Nueva contraseña
    const [confirmarPassword, setConfirmarPassword] = useState(""); // Confirmar contraseña
    const [passwordStrength, setPasswordStrength] = useState(0); // Nivel de seguridad
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(null); // Mensaje de error en tiempo real
    const [isFormValid, setIsFormValid] = useState(false); // Control de validación
    const [imagenPerfil, setImagenPerfil] = useState(null); // Imagen del usuario
    const [imagenPreview, setImagenPreview] = useState(null); // Previsualización de imagen
   
    
    // Cargar datos del usuario autenticado al montar el componente
    useEffect(() => {
      async function fetchUserData() {
        if (!usuario) return;
    
        try {
          const response = await api.get("/usuarios/perfil");
          
          // 🔹 Validar que el usuario existe antes de actualizar el estado
          if (!response.data || !response.data.usuario) {
            console.error("❌ No se encontró información del usuario en la respuesta.");
            return;
          }
    
          setUser({
            nombre: response.data.usuario.nombre || "",
            email: response.data.usuario.email || "",
          });
    
          // 🔹 Manejar imagen de perfil
          if (response.data.usuario.imagen_perfil) {
            setImagenPerfil(response.data.usuario.imagen_perfil);
          }
    
        } catch (error) {
          console.error("❌ Error al obtener perfil:", error);
    
          if (error.response?.status === 404 || error.response?.status === 403) {
            logout(); // Cerrar sesión si el usuario no existe
            navigate("/loading", { state: { mensaje: "Estamos procesando tu salida..." } });
            return;
          }
    
          toast.error("❌ Error al obtener el perfil. Intenta de nuevo.");
        }
      }
    
      fetchUserData();
    }, [usuario]);
    
    // Manejar la subida de imágenes y previsualización
    const handleImagenChange = (e) => {
      const file = e.target.files[0];
      const MAX_SIZE_MB = 16; // Tamaño máximo permitido en MB

      if (file) {
        // Verificar que el archivo sea una imagen
        if (!file.type.startsWith("image/")) {
          toast.error("❌ El archivo debe ser una imagen.");
          return;
        }

        // Verificar que el tamaño no exceda 16MB
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(
            `❌ La imagen es demasiado grande. Máximo permitido: ${MAX_SIZE_MB}MB.`
          );
          return;
        }

        setImagenPreview(URL.createObjectURL(file)); // Mostrar imagen antes de subirla
        setImagenPerfil(file); // Guardar el archivo en el estado
      }
    };

    // Validar contraseña en tiempo real
    const validarPassword = (password) => {
      const regexMayuscula = /[A-Z]/; // Al menos una mayúscula
      const regexSimbolo = /[!@#$%^&*(),.?":{}|<>]/; // Al menos un símbolo

      if (password.length < 8) {
        return "❌ La contraseña debe tener al menos 8 caracteres.";
      }
      if (!regexMayuscula.test(password)) {
        return "❌ La contraseña debe incluir al menos una letra mayúscula.";
      }
      if (!regexSimbolo.test(password)) {
        return "❌ La contraseña debe incluir al menos un símbolo (@, #, $, etc.).";
      }
      return null; // Si todo está bien, retorna null
    };

    // Manejar cambios en la contraseña nueva y calcular la seguridad
    const handlePasswordChange = (e) => {
      const password = e.target.value;
      setNuevoPassword(password);
      const result = zxcvbn(password);
      setPasswordStrength(result.score); // 0 (débil) - 4 (fuerte)

      const error = validarPassword(password);
      setPasswordError(error);
      validarFormulario(password, confirmarPassword);
    };

    // Manejar cambios en la confirmación de contraseña
    const handleConfirmPasswordChange = (e) => {
      setConfirmarPassword(e.target.value);
      validarFormulario(nuevoPassword, e.target.value);
    };

    // Validar si el formulario es válido
    const validarFormulario = (password, confirmPassword) => {
      const isValid =
        password && !validarPassword(password) && password === confirmPassword;
      setIsFormValid(isValid);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (nuevoPassword !== confirmarPassword) {
        toast.error("❌ Las contraseñas no coinciden.");
        return;
      }
    
      try {
        const formData = new FormData();
        formData.append("nombre", user.nombre);
        formData.append("email", user.email);
        if (nuevoPassword) {
          formData.append("nuevoPassword", nuevoPassword);
        }
        if (imagenPerfil instanceof File) {
          formData.append("imagenPerfil", imagenPerfil);
        }
    
        const response = await api.put("/usuarios/perfil", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    
        const updatedUser = {
          ...usuario,
          nombre: user.nombre,
          email: user.email,
          imagenPerfil: response.data.usuario.imagen_perfil, // ✅ Corrección aquí
        };
        actualizarPerfil(updatedUser);

        localStorage.setItem("usuario", JSON.stringify(updatedUser));
    
        toast.success("✅ Perfil actualizado con éxito");
    
        setTimeout(() => {
          if (usuario) navigate("/perfil");
        }, 1500);
      } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
        toast.error(error.response?.data?.error || "❌ No se pudo actualizar el perfil");
      }
    };
    
    const handleBajaUsuario = async () => {
      if (!window.confirm("⚠️ ¿Estás seguro de que quieres darte de baja? Esta acción no se puede deshacer.")) {
        return;
      }
    
      navigate("/loading", { state: { mensaje: "Estamos eliminando tu cuenta..." } });
    
      try {
        await api.delete("/usuarios/perfil");
    
        logout(); // ✅ Cerrar sesión correctamente
    
        setTimeout(() => {
          navigate("/"); // ✅ Redirigir al usuario a la página principal
        }, 1500); // Esperar 1.5s antes de redirigir (sin que el usuario lo haga manualmente)
      } catch (error) {
        console.error("❌ Error al dar de baja:", error);
        toast.error(error.response?.data?.error || "❌ No se pudo dar de baja la cuenta.");
      }
    };
    
    
    
    
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white pt-12">
  <div className="bg-gray-900 p-8 px-6 rounded-lg shadow-lg max-w-lg w-full text-center relative">
        {/* Botón para volver atrás */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:text-white flex items-center cursor-pointer"
        >
          <ArrowLeft size={20} className="mr-2" /> Volver
        </button>
    
        <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
    
        {/* Imagen de perfil */}
        <div className="mb-4">
          <label className="block text-gray-400 mt-4">Imagen de Perfil</label>
          <div className="flex justify-center mt-4">
            <img
              src={imagenPreview || imagenPerfil || "src/assets/avatar.png"}
              alt="Perfil"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-500"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            className="mt-4 text-gray-300 cursor-pointer"
          />
        </div>
    
        {/* FORMULARIO - Dos columnas */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="text-left">
            <label className="text-gray-400 block">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={user.nombre}
              onChange={(e) => setUser({ ...user, nombre: e.target.value })}
              className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
              required
            />
          </div>
    
          {/* Email */}
          <div className="text-left">
            <label className="text-gray-400 block">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full p-2 mt-1 rounded bg-gray-800 text-white"
              required
            />
          </div>
    
          {/* Nueva Contraseña */}
          <div className="text-left relative">
            <label className="text-gray-400 block">Nueva Contraseña (opcional)</label>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 símbolo"
              value={nuevoPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 mt-1 rounded bg-gray-800 text-white pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-200"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {passwordError && (
              <p className="text-red-400 text-sm mt-1">{passwordError}</p>
            )}
          </div>
    
          {/* Confirmar Nueva Contraseña */}
          <div className="text-left relative">
            <label className="text-gray-400 block">Confirmar Nueva Contraseña</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite la nueva contraseña"
              value={confirmarPassword}
              onChange={handleConfirmPasswordChange}
              onPaste={(e) => e.preventDefault()}
              className="w-full p-2 mt-1 rounded bg-gray-800 text-white pr-10"
            />
          </div>
    
          {/* BOTONES (ocupan las 2 columnas) */}
          <div className="col-span-2 flex flex-col gap-3 mt-4">
            <button
              type="submit"
              className="w-full bg-teal-500 text-black py-2 rounded-lg hover:bg-teal-400 transition disabled:opacity-50 cursor-pointer"
            >
              Guardar Cambios
            </button>
    
            <button
      onClick={handleBajaUsuario}
      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
    >
      Dar de Baja Cuenta
    </button>
          </div>
        </form>
      </div>
    </div>
    
    );
  }
