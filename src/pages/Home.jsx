import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import AboutUs from "../components/AboutUs";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import TrustedBy from "../components/TrustedBy";
import WorkProcess from "../components/WorkProcess";
import TestimonialSlider from "../components/TestimonialSlider";
import Footer from "../components/Footer";
import Services from "../components/Services";
import WebDevelopment from "../components/WebDevelopment";
import UltimosClientes from "../components/UltimosClientes";
import GoBackUp from "../components/GoBackUp";
import InstagramGallery from "../components/InstragramGallery";
import { motion } from "framer-motion";


import MetaData from "../components/MetaData";

const Home = () => {
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    if (!Cookies.get("visitor_id")) {
      const visitorId = `visitor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      Cookies.set("visitor_id", visitorId, {
        expires: 30, 
        secure: true,
        sameSite: "Strict",
      });

      console.log("✅ Nueva cookie creada:", visitorId);
      setShowCookie(true); 
    } else {
      console.log("🔹 Cookie existente:", Cookies.get("visitor_id"));
    }
  }, []);

  const handleAcceptCookie = () => {
    setShowCookie(false); 
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

      {/* Agrega MetaData aquí para Home */}
      <MetaData
        title="Inicio | ThreeLogics"
        description="Bienvenido a ThreeLogics, el software de gestión de almacenes para pymes. Optimiza inventarios, automatiza procesos y mejora la eficiencia logística."
        imageUrl="https://threelogicsapp.vercel.app/og-image.png"
        keywords="gestión de almacenes, software para pymes, logística, optimización de inventarios, transformación digital"
      />

      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <TrustedBy />
      <div id="work-process">
        <WorkProcess />
      </div>
      <div id="about-us">
        <AboutUs />
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
