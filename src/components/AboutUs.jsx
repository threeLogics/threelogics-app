import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section className="relative py-20 bg-black text-white text-center">
      {/* Encabezado */}
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-5 py-2 bg-teal-600 text-black text-sm font-bold uppercase tracking-wider rounded-full mb-6 shadow-md"
        >
          Quiénes somos
        </motion.div>

        <h2 className="text-5xl font-bold mb-6">
          Nuestro equipo <span className="text-teal-400">ThreeLogics</span>
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed">
          Somos tres desarrolladores con una misión clara: digitalizar la logística de las pequeñas empresas con
          <span className="text-white font-medium"> soluciones simples, eficientes y escalables</span>.  
          Este proyecto comenzó como un Trabajo Final de Grado, pero ha evolucionado para convertirse en una iniciativa
          <span className="text-teal-400 font-medium"> con visión de futuro</span>.
        </p>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto mt-16 flex flex-col md:flex-row items-center gap-12 px-6 md:px-12">
        {/* Columna de Texto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-left"
        >
          <h3 className="text-4xl font-semibold mb-6">
            Conócenos
          </h3>

          <p className="text-gray-400 text-lg leading-relaxed space-y-4">
            <span className="block">
              <span className="text-white font-medium">Iker Domínguez</span> lidera el desarrollo del frontend, con especial enfoque en usabilidad, diseño e interacción.
            </span>
            <span className="block">
              <span className="text-white font-medium">Adrián Vaquero</span> se encarga del backend y las integraciones lógicas, asegurando rendimiento y robustez.
            </span>
            <span className="block">
              <span className="text-white font-medium">Daniel Ramiro</span> gestiona la base de datos y la seguridad, asegurando integridad, trazabilidad y fiabilidad.
            </span>

            <span className="block mt-4">
              🤝 Unimos nuestras habilidades para construir <span className="text-white font-medium">una solución real para problemas reales</span> en la gestión de almacenes.
            </span>
          </p>

          <div className="flex space-x-6 mt-6">
            <img src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider//Iker.png" alt="Iker Domínguez" className="w-14 h-14 rounded-full hover:scale-110" />
            <img src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider//adrii.png" alt="Adrián Vaquero" className="w-14 h-14 rounded-full hover:scale-110" />
            <img src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/testimonialSlider//dani%20(1).png" alt="Daniel Ramiro" className="w-14 h-14 rounded-full hover:scale-110" />
          </div>
        </motion.div>

        {/* Imagen del equipo o mockup motivacional */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 50 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <motion.img
            src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//equipo.png"
            alt="Equipo de desarrollo"
            className="rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transition-transform duration-500 hover:scale-105 hover:-translate-y-1"
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>
      </div>
    </section>
  );
}
