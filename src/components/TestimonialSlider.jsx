import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import githubLogo from "../assets/github1.png";
import googleLogo from "../assets/google.png";
import avatar1 from "../assets/1.png";
import avatar2 from "../assets/2.png";
import avatar3 from "../assets/3.png";

const testimonials = [
  {
    companyLogo: githubLogo,
    companyName: "Github",
    quote:
      "El profesionalismo y las habilidades organizativas excepcionales hacen que la colaboración sea un placer. El equipo de Serge destaca en cada tarea, superando expectativas. Un verdadero placer trabajar con ellos.",
    author: "Adrián Vaquero",
    position: "CoFounder ThreeLogics",
    avatar: avatar1,
  },
  {
    companyLogo: googleLogo,
    companyName: "Google",
    quote:
      "Un equipo increíblemente dedicado y profesional. Su enfoque meticuloso y atención al detalle elevaron nuestro proyecto a otro nivel.",
    author: "Iker Domínguez",
    position: "CoFounder ThreeLogics",
    avatar: avatar2,
  },
  {
    companyLogo: githubLogo,
    companyName: "Github",
    quote:
      "El profesionalismo y las habilidades organizativas excepcionales hacen que la colaboración sea un placer. El equipo de Serge destaca en cada tarea, superando expectativas. Un verdadero placer trabajar con ellos.",
    author: "Daniel Ramiro",
    position: "CoFounder ThreeLogics",
    avatar: avatar3,
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // Dirección del slider (1 = derecha, -1 = izquierda)
  const intervalRef = useRef(null);

  const nextTestimonial = useCallback(() => {
    setDirection(1); // Se mueve a la derecha
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setDirection(-1); // Se mueve a la izquierda
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(nextTestimonial, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, nextTestimonial]);

  const slideVariants = {
    hidden: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 100 : -100, // Dirección de entrada
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir < 0 ? 100 : -100, // Dirección de salida
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

  return (
    <div className="flex flex-col items-center text-center p-8 bg-black text-white">
      <h2 className="text-3xl font-semibold mb-2">
        Únete al <span className="text-green-400">ThreeLogics Club</span>
      </h2>
      <p className="text-gray-400 mb-6 max-w-lg">
        Estamos construyendo una comunidad empresarial extraordinaria basada en
        valores compartidos y estándares profesionales.
      </p>

      <div className="relative w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-xl overflow-hidden">
        {/* Botón Izquierdo */}
        <button
          className=" cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-all duration-300"
          onClick={() => {
            prevTestimonial();
            setIsPaused(true);
          }}
        >
          <ChevronLeft className="text-white w-6 h-6" />
        </button>

        {/* Contenido del Testimonio con Animación */}
        <div className="relative h-60 flex justify-center items-center overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current} // Clave para que Framer Motion detecte cambios
              className="absolute flex flex-col items-center"
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <img
                src={testimonials[current].companyLogo}
                alt={testimonials[current].companyName}
                className="w-20 mb-4 filter drop-shadow-md"
              />
              <p className="text-base md:text-lg italic text-gray-300 mb-4">
                {testimonials[current].quote}
              </p>

              <div className="flex items-center gap-3">
                <img
                  src={testimonials[current].avatar}
                  alt={testimonials[current].author}
                  className="w-12 h-12 rounded-full border border-gray-700 shadow-lg"
                />
                <div className="text-left">
                  <p className="font-semibold">
                    {testimonials[current].author}
                  </p>
                  <p className="text-sm text-gray-400">
                    {testimonials[current].position}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Botón Derecho */}
        <button
          className=" cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-all duration-300"
          onClick={() => {
            nextTestimonial();
            setIsPaused(true);
          }}
        >
          <ChevronRight className="text-white w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
