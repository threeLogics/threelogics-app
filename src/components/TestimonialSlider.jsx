import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    companyLogo:
      "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider/github1.png",
    companyName: "GitHub",
    quote:
      "Trabajar junto a ThreeLogics ha sido una experiencia transformadora. Su enfoque estratégico, claridad técnica y compromiso con la excelencia han marcado la diferencia en el desarrollo de nuestras soluciones.",
    author: "Adrián Vaquero",
    position: "CoFundador · ThreeLogics",
    avatar:
      "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider/adri.png",
  },
  {
    companyLogo:
      "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider/google.png",
    companyName: "Google",
    quote:
      "El equipo de ThreeLogics destaca por su capacidad de adaptación, profesionalismo y visión orientada a resultados. Han sabido entender nuestras necesidades y convertirlas en soluciones escalables y funcionales.",
    author: "Iker Domínguez",
    position: "CoFundador · ThreeLogics",
    avatar:
      "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider/ftoiker.png",
  },
  {
    companyLogo:
      "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider/github1.png",
    companyName: "GitHub",
    quote:
      "Desde la ideación hasta la entrega final, ThreeLogics ha demostrado una ejecución impecable. Son un equipo comprometido, eficiente y con una atención al detalle que genera confianza desde el primer día.",
    author: "Daniel Ramiro",
    position: "CoFundador · ThreeLogics",
    avatar:
      "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider/dani.png",
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef(null);

  const nextTestimonial = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(nextTestimonial, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, nextTestimonial]);

  const handlePause = () => {
    setIsPaused(true);
    clearInterval(intervalRef.current);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const slideVariants = {
    hidden: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 100 : -100,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir < 0 ? 100 : -100,
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

  return (
    <div className="flex flex-col items-center text-center px-6 py-16 bg-black text-white">
      <h2 className="text-4xl font-bold mb-4">
        Únete al <span className="text-teal-400">ThreeLogics Club</span>
      </h2>
      <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
        Estamos construyendo una{" "}
        <span className="text-white font-medium">comunidad empresarial extraordinaria</span>, basada en{" "}
        <span className="text-teal-400 font-medium">valores compartidos</span> y{" "}
        <span className="text-white font-medium">estándares profesionales</span>.
      </p>

      <div className="relative w-full max-w-3xl bg-gray-800/60 backdrop-blur-md px-8 py-10 rounded-2xl shadow-2xl overflow-hidden">
        <button
          className="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition duration-300"
          onClick={() => {
            prevTestimonial();
            handlePause();
          }}
        >
          <ChevronLeft className="text-white w-6 h-6" />
        </button>

        <div className="relative h-60 flex justify-center items-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              className="absolute flex flex-col items-center px-4 text-center"
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonials[current].avatar}
                  alt={testimonials[current].author}
                  className="w-20 h-20 rounded-full border border-gray-600 shadow-lg transition-transform hover:scale-105"
                />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <img
                      src={testimonials[current].companyLogo}
                      alt={testimonials[current].companyName}
                      className="w-6 h-6 object-contain"
                    />
                    <p className="font-semibold">
                      {testimonials[current].author}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {testimonials[current].position}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                  </div>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-base md:text-lg italic text-gray-300 mb-6 max-w-xl leading-relaxed"
              >
                {testimonials[current].quote}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition duration-300"
          onClick={() => {
            nextTestimonial();
            handlePause();
          }}
        >
          <ChevronRight className="text-white w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
