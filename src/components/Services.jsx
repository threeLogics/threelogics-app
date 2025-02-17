import { motion } from "framer-motion";

export default function Services() {
  return (
    <section className="relative py-20 bg-black text-white text-center">
      {/* Encabezado */}
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-4 py-2 bg-teal-600 text-black text-sm font-bold uppercase rounded-full mb-4"
        >
          Servicios
        </motion.div>
        <h2 className="text-5xl font-bold">
          Cómo podemos <span className="text-teal-400">ayudarte</span>
        </h2>
        <p className="text-gray-400 text-lg mt-4">
          ¿Qué hace que tu empresa se destaque? Nosotros te ayudamos a
          potenciarlo con soluciones digitales innovadoras.
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
          <h3 className="text-4xl font-semibold">
            <span className="text-gray-500">Optimización</span> & UX/UI Design
          </h3>
          <p className="text-gray-400 mt-4 text-lg">
            Diseñamos interfaces que cautivan a los usuarios y explican
            claramente lo que hace tu producto. Nos enfocamos en
            <span className="text-teal-400"> experiencia de usuario</span>,
            diseño de interfaz y animaciones que convierten visitantes en
            clientes.
          </p>

          {/* Íconos representando tecnologías */}
          <div className="flex space-x-6 mt-6">
  <img src="src/assets/paleta.webp" alt="Diseño UI" className="w-14 h-14 rounded-full" />
  <img src="src/assets/triangulo.webp" alt="Precisión" className="w-14 h-14 rounded-full" />
  <img src="src/assets/rayo.webp" alt="Velocidad" className="w-14 h-14 rounded-full" />
</div>



        </motion.div>

        {/* Mockup a la derecha */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <img
            src="/images/mockup.png"
            alt="Dashboard de optimización"
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
