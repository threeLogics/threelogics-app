import { motion } from "framer-motion";

export default function WebDevelopment() {
  return (
    <section className="relative py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6 md:px-12">
        {/* Columna de Imagen */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <img
            src="/images/webdev-mockup.png"
            alt="Código y dashboard web"
            className="rounded-lg shadow-lg"
          />
        </motion.div>

        {/* Columna de Texto */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-left"
        >
          <h3 className="text-5xl font-semibold">
            <span className="text-gray-500">Web</span> Development
          </h3>
          <p className="text-gray-400 mt-4 text-lg">
            Código limpio, gestión de contenido flexible y despliegue optimizado
            para garantizar el mejor rendimiento y accesibilidad. Ofrecemos
            soluciones web robustas para una{" "}
            <span className="text-teal-400">experiencia excepcional</span> para
            tus clientes.
          </p>

          {/* Tecnologías utilizadas */}
          <div className="flex space-x-6 mt-6">
            <img
              src="./react.svg"
              alt="React"
              className="w-8 h-8 transition duration-300 hover:scale-110 hover:text-teal-400"
            />
            <img
              src="./typescript.svg"
              alt="TypeScript"
              className="w-8 h-8 transition duration-300 hover:scale-110 hover:text-teal-400"
            />
            <img
  src="./next-js.svg"
  alt="Next.js"
  className="w-8 h-8 rounded-full transition duration-300 hover:scale-110 hover:text-teal-400 bg-white"
 />

          </div>
        </motion.div>
      </div>
    </section>
  );
}
