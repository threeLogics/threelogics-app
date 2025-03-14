import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react"; // Iconos para menú móvil

export default function Navbar() {
  const { usuario, logout } = useContext(AuthContext);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState(null);

  // 📌 Definir imágenes de perfil predeterminadas
  const AVATARS = {
    default: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/avatars/avatar_default.png",
    avatar4: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/avatars/avatar4.png",
    avatar5: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/avatars/avatar5.png",
  };

  // 📌 Función para obtener la imagen de perfil desde localStorage o usar una predeterminada
  const obtenerImagenPerfil = () => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return AVATARS[parsedUser.imagenPerfil] || AVATARS.default;
    }
    return AVATARS.default;
  };

  // 📌 Actualiza la imagen de perfil cuando el usuario cambia
  useEffect(() => {
    const obtenerImagenPerfil = () => {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.imagenPerfil || AVATARS.default;
      }
      return AVATARS.default;
    };
  
    setImagenPerfil(obtenerImagenPerfil());
  }, [usuario]);

  // 📌 Manejo de scroll para ocultar/mostrar navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setShowNavbar(currentScrollY < lastScrollY || currentScrollY < 50);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  

  const handleScrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-black text-white px-8 py-4 flex justify-between items-center transition-transform duration-300 z-50 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
       {/* Logo con imagen */}
       <div className="flex items-center space-x-3">
        <button
          onClick={() => handleScrollToSection("hero")}
          className="flex items-center space-x-3 bg-transparent border-none cursor-pointer"
        >
          <img
            src="/LogoBlancoSobreNegro.png"
            alt="ThreeLogics Logo"
            className="h-10 w-auto"
          />
          <span className="text-2xl font-bold text-teal-400">ThreeLogics</span>
        </button>
      </div>

      {/* Menú en escritorio (oculto en móviles) */}
      <div className="hidden md:flex items-center space-x-6 text-gray-300">
        {!usuario ? (
          <>
            <button
              onClick={() => handleScrollToSection("testimonial-slider")}
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Nosotros
            </button>
            <button
              onClick={() => handleScrollToSection("services")}
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Servicios
            </button>
            <button
              onClick={() => handleScrollToSection("work-process")}
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Proceso
            </button>
            <span className="text-gray-500">|</span>
            <a
              href="mailto:threelogicsapp@gmail.com"
              className="text-teal-400 hover:text-teal-300 transition"
            >
              threelogicsapp@gmail.com
            </a>
          </>
        ) : (
          <>
            <Link to="/productos" className="hover:text-teal-400 transition">
              Productos
            </Link>
            <Link to="/movimientos" className="hover:text-teal-400 transition">
              Movimientos
            </Link>
            <Link to="/categorias" className="hover:text-teal-400 transition">
              Categorías
            </Link>
            <Link to="/pedidos" className="hover:text-teal-400 transition">
              Pedidos
            </Link>
            <Link to="/dashboard" className="hover:text-teal-400 transition">
              Dashboard
            </Link>
          </>
        )}
      </div>

      {/* Botones de autenticación con imagen de usuario */}
      <div className="hidden md:flex space-x-4 items-center relative">
        {usuario ? (
          <>
            {/* Imagen de usuario + Nombre */}
            <button
  onClick={() => setIsModalOpen(!isModalOpen)}
  className="text-sm flex items-center space-x-2 hover:text-teal-400 transition cursor-pointer"
>
<img src={usuario?.imagenPerfil || "src/assets/avatar.png"} alt="Perfil" className="w-8 h-8 rounded-full border-2 border-teal-500" />

  <span>{usuario?.nombre || "Usuario"}</span> {/* Asegura que se usa `nombre` */}
</button>


            {/* Modal en la esquina superior derecha */}
            {isModalOpen && window.location.pathname !== "/perfil" && (
              <div className="absolute top-14 right-4 bg-gray-900 p-4 rounded-lg shadow-lg w-64 transition-opacity">
                <div className="mt-3 flex flex-col space-y-2">
                  <Link
                    to="/perfil"
                    className="w-full text-center bg-teal-500 text-black py-2 rounded-lg hover:bg-teal-400 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Editar Perfil
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition cursor-pointer" 
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
  <Link
  to="/login"
  className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
>
  Iniciar sesión
</Link>

<Link
  to="/register"
  className="px-6 py-2 border-2 border-teal-500 text-teal-400 font-semibold rounded-lg shadow-md hover:bg-teal-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
>
  Registrarse
</Link>


          </>
        )}
      </div>

      {/* Menú hamburguesa para móviles */}
      <button
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black text-white py-6 flex flex-col items-center space-y-4 shadow-lg md:hidden">
          {!usuario ? (
            <>
              <button
                onClick={() => handleScrollToSection("testimonial-slider")}
                className="hover:text-teal-400 transition"
              >
                Nosotros
              </button>
              <button
                onClick={() => handleScrollToSection("services")}
                className="hover:text-teal-400 transition"
              >
                Servicios
              </button>
              <button
                onClick={() => handleScrollToSection("work-process")}
                className="hover:text-teal-400 transition"
              >
                Proceso
              </button>
              <a
                href="mailto:info@threelogics.com"
                className="text-teal-400 hover:text-teal-300 transition"
              >
                Contacto
              </a>
              <Link
  to="/login"
  className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
>
  Iniciar sesión
</Link>

<Link
  to="/register"
  className="px-6 py-2 border-2 border-teal-500 text-teal-400 font-semibold rounded-lg shadow-md hover:bg-teal-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
>
  Registrarse
</Link>
            </>
          ) : (
            <>
              <Link to="/productos" className="hover:text-teal-400 transition">
                Productos
              </Link>
              <Link
                to="/movimientos"
                className="hover:text-teal-400 transition"
              >
                Movimientos
              </Link>
              <Link to="/categorias" className="hover:text-teal-400 transition">
                Categorías
              </Link>
              <Link to="/pedidos" className="hover:text-teal-400 transition">
                Pedidos
              </Link>
              <Link to="/dashboard" className="hover:text-teal-400 transition">
                Dashboard
              </Link>
            </>
          )}

          {/* Botones de autenticación en móvil con modal */}
          {usuario && (
            <>
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="text-sm flex items-center space-x-2 hover:text-teal-400 transition"
              >
                <img
                  src={imagenPerfil}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full border-2 border-teal-500"
                />
                <span>{usuario?.nombre || "Usuario"}</span>
              </button>

              {/* Modal en móvil */}
              {isModalOpen && (
                <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-64 transition-opacity mt-2">
                  <div className="mt-3 flex flex-col space-y-2">
                    <Link
                      to="/perfil"
                      className="w-full text-center bg-teal-500 text-black py-2 rounded-lg hover:bg-teal-400 transition"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Editar Perfil
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
