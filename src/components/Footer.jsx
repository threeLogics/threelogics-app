import { useState } from "react";
import supabase from "../supabaseClient"; 

import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Mail, MapPin, Linkedin, Github, Instagram, BookOpen  } from "lucide-react";



export default function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("❌ Introduce un correo válido");
      return;
    }

    setIsLoading(true);

    try {
    
      const { data: existe, error: errorExiste } = await supabase
        .from("suscriptors")
        .select("email")
        .eq("email", email)
        .single();

      if (existe) {
        toast.error("❌ Este correo ya está suscrito");
        setIsLoading(false);
        return;
      }

      if (errorExiste && errorExiste.code !== "PGRST116") {
        throw errorExiste;
      }

      // 🔹 Insertar el email en Supabase
      const { error } = await supabase.from("suscriptors").insert([{ email }]);

      if (error) throw error;

      toast.success("✅ ¡Gracias por suscribirte!");
      setEmail("");
    } catch (error) {
      toast.error(error.message || "Error al suscribirse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-black text-white py-16" id="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Sección de Newsletter */}
        <div className="text-center max-w-2xl mx-auto mb-20 px-4">
  <h3 className="text-4xl font-bold mb-4 text-white">
    Suscríbete a nuestro <span className="text-teal-400">newsletter</span>
  </h3>
  <p className="text-gray-400 text-lg leading-relaxed">
    Recibe <span className="text-white font-medium">actualizaciones</span> y noticias sobre 
    <span className="text-teal-400 font-medium"> gestión de almacenes</span>, directamente en tu correo.
  </p>

  <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
    <input
      type="email"
      placeholder="Tu correo electrónico"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full sm:w-80 px-5 py-3 rounded-lg text-lg bg-gray-800 text-white placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-teal-500 transition
        hover:ring-2 hover:ring-teal-300 hover:shadow-md"
    />
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="bg-teal-500 px-6 py-3 text-lg font-semibold text-black rounded-lg w-full sm:w-auto 
        transition-all duration-300 ease-in-out
        hover:bg-teal-400 hover:scale-105 hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {isLoading ? "⏳ Enviando..." : "Suscribirse"}
    </button>
  </div>
</div>



        {/* Información y enlaces */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
          {/* Contacto */}
          <div className="md:text-left">
  <h4 className="text-2xl font-semibold mb-6 text-teal-400">Contacto</h4>

  <div className="space-y-4 text-lg text-gray-300">
    {/* Email */}
    <a
      href="mailto:threelogicsapp@gmail.com"
      className="flex items-center gap-2 hover:text-teal-300 transition"
    >
      <Mail className="w-5 h-5 text-teal-400" />
      threelogicsapp@gmail.com
    </a>

    {/* Dirección */}
    <p className="flex items-center gap-2">
      <MapPin className="w-5 h-5 text-teal-400" />
      Fuenlabrada, España
    </p>
  </div>

  {/* Redes sociales */}
  <div className="flex items-center space-x-6 mt-6 text-gray-400 text-xl">
    <a
      href="https://github.com/threeLogics"
      className="flex items-center gap-2 hover:text-teal-400 transition"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Github className="w-6 h-6" />
      GitHub
    </a>

    <a
      href="https://www.instagram.com/threelogicsenterprise/"
      className="flex items-center gap-2 hover:text-teal-400 transition"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Instagram className="w-6 h-6" />
      Instagram
    </a>

    <a
  href="https://github.com/threeLogics/threelogics-app/tree/main/documentacion"
  className="flex items-center gap-2 hover:text-teal-400 transition"
  target="_blank"
  rel="noopener noreferrer"
>
  <BookOpen className="w-6 h-6" />
  Docs
</a>

  </div>
</div>


          {/* Soluciones */}
          <div className="md:text-center">
            <h4 className="text-2xl font-semibold mb-6 text-teal-400">
             Soporte
            </h4>
            <ul className="text-gray-300 text-lg space-y-4">
              <li>
              <Link to="/terms" className="hover:text-teal-400">
                 Terminos y Condiciones
                </Link>
              </li>
              <li>
              <Link to="/privacy" className="hover:text-teal-400">
                 Politicas de privacidad
                </Link>
              </li>
              <li>
              <Link to="/estado-sistema" className="hover:text-teal-400">
                 Estado del Sistema
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div className="md:text-right">
            <h4 className="text-2xl font-semibold mb-6 text-teal-400">
              Recursos
            </h4>
            <ul className="text-gray-300 text-lg space-y-4">
              <li>
                <Link to="/faq" className="hover:text-teal-400">
                  Preguntas Frecuentes (FAQ)
                </Link>
              </li>

              <li>
          <Link to="/comunidad" className="hover:text-teal-400">Comunidad</Link>
        </li>
              <li>
                <a href="/webinars" className="hover:text-teal-400">
                  Webinars
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Marca y derechos */}
        <div className="text-center text-gray-500 text-m py-4 border-t border-gray-700 mt-6">
  © {new Date().getFullYear()} <span className="text-teal-400 font-semibold">ThreeLogics</span> — Todos los derechos reservados.
</div>

      </div>
    </footer>
  );
}
