import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Particles } from "@tsparticles/react";
import warehouseImage from "../assets/map3.webp";

export default function Hero() {
  const footerRef = useRef(null);
  const [text, setText] = useState("");
  const fullText = "Gestión de almacenes";
  const typingSpeed = 100; 

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen flex items-center bg-black px-6 md:px-10">
      {/* Partículas en el fondo */}
      <Particles
        id="particles"
        options={{
          fullScreen: { enable: false },
          background: { color: "black" },
          particles: {
            number: { value: 60 },
            color: { value: "#00d4ff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 0.5, direction: "none", random: true },
          },
        }}
        className="absolute inset-0 z-0 w-full h-full"
      />

      {/* Contenedor del contenido */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
        }}
        className="relative w-full md:w-1/2 text-center md:text-left md:ml-12 z-10"
      >
        {/* Texto estático */}
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 1 }}
          className="font-dm text-4xl sm:text-5xl md:text-6xl drop-shadow-lg bg-gradient-to-r from-white via-gray-300 to-gray-600 bg-clip-text text-transparent inline-block tracking-tight leading-tight"
        >
          Optimiza tu
        </motion.h1>

        {/* Efecto de escritura en "Gestión de almacenes" */}
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2 drop-shadow-lg bg-gradient-to-r from-teal-200 via-teal-400 to-teal-600 bg-clip-text text-transparent"
        >
          <span className="whitespace-nowrap">{text}</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="border-r-4 border-teal-400"
          >
            &nbsp;
          </motion.span>
        </motion.h2>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-4 text-gray-300 text-base sm:text-lg font-fira"
        >
          ThreeLogics mejora la eficiencia y control en la logística
          empresarial.
        </motion.p>

        {/* Botón animado */}
        <motion.div
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 1, delay: 0.6 }}
  className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start"
>
  <motion.button
    whileHover={{
      scale: 1.1,
      boxShadow: "0px 0px 20px rgba(45, 212, 191, 0.8)",
    }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      const footer = document.getElementById("footer");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      }
    }}
    className="px-4 py-2 sm:px-6 sm:py-3 border border-teal-500 text-white rounded-lg font-medium transition-all hover:bg-teal-500 cursor-pointer text-sm sm:text-base"
  >
    Más Información
  </motion.button>

  {/* 🔽 Botón para ver el webinar */}
  <motion.a
  href="/webinars"
  whileHover={{
    scale: 1.1,
    boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.3)",
  }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 sm:px-6 sm:py-3 bg-teal-500 text-black rounded-lg font-medium transition-all hover:bg-teal-400 cursor-pointer text-sm sm:text-base"
>
  Ver Demo en Vídeo
</motion.a>

</motion.div>

      </motion.div>

      {/* Contenedor de la imagen */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="absolute right-0 top-0 h-full w-full md:w-[45vw] hidden sm:flex justify-end z-10"
      >
        {/* Degradados */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/85 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-transparent to-transparent"></div>

        <img
          src={warehouseImage}
          alt="Almacén"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Referencia para el scroll */}
      <div ref={footerRef} className="absolute bottom-0 w-full"></div>
    </section>
  );
}
