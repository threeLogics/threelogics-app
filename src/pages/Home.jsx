import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import TrustedBy from "../components/TrustedBy";
import WorkProcess from "../components/WorkProcess";
import TestimonialSlider from "../components/TestimonialSlider";
import Footer from "../components/Footer";
import Services from "../components/Services";
import WebDevelopment from "../components/WebDevelopment";
import UltimosClientes from "../components/UltimosClientes";
import GoBackUp from "../components/GoBackUp"; // 🔹 Importamos el botón
import InstagramGallery from "../components/InstragramGallery";
import { motion } from "framer-motion";

const Home = () => {
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    // 📌 Comprobar si la cookie ya existe
    if (!Cookies.get("visitor_id")) {
      // 📌 Generar un identificador único para el visitante
      const visitorId = `visitor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // 📌 Guardar la cookie con duración de 30 días
      Cookies.set("visitor_id", visitorId, {
        expires: 30, // Expira en 30 días
        secure: true,
        sameSite: "Strict",
      });

      console.log("✅ Nueva cookie creada:", visitorId);
      setShowCookie(true); // Mostrar la notificación de cookies
    } else {
      console.log("🔹 Cookie existente:", Cookies.get("visitor_id"));
    }
  }, []);

  const handleAcceptCookie = () => {
    setShowCookie(false); // Ocultar la cookie al hacer clic en "Aceptar"
  };

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden relative">
      {/* 🍪 Notificación de Cookie Mejorada */}
      {showCookie && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-5 right-5 bg-gray-900 text-white p-4 rounded-lg shadow-xl flex flex-col gap-2 w-72 z-50 border border-gray-700"
        >
          <span className="text-sm font-semibold">🍪 Este sitio usa cookies</span>
          <p className="text-xs text-gray-400">
            Solo usamos cookies para obtener un registro del uso de visitas en la web. No guardamos datos personales.
          </p>
          <button
            onClick={handleAcceptCookie}
            className="bg-teal-500 hover:bg-teal-400 text-black px-4 py-2 rounded-md text-sm font-semibold transition-all transform hover:scale-105 shadow-md cursor-pointer"
          >
            Aceptar
          </button>
        </motion.div>
      )}

      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <TrustedBy />
      <div id="work-process">
        <WorkProcess />
      </div>
      <div id="services">
        <Services />
      </div>
      <WebDevelopment />
      <InstagramGallery />
      <div id="testimonial-slider">
        <TestimonialSlider />
      </div>
      <UltimosClientes />
      <Footer />
      <GoBackUp />
    </div>
  );
};

export default Home;
