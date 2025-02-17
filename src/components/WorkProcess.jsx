import { motion } from "framer-motion";

export default function WorkProcess() {
  return (
    <section
      id="work-process"
      className="py-16 bg-black text-white text-center"
    >
      {/* Título */}
      <h2 className="text-4xl font-bold mb-4">
        Conoce nuestro <span className="text-teal-400">proceso de trabajo</span>
      </h2>
      <p className="text-gray-400 max-w-2xl mx-auto mb-12">
        Nos enfocamos en un flujo de trabajo preciso y eficiente para lograr los
        mejores resultados.
      </p>

      {/* Contenedor Principal */}
      <div className="relative max-w-5xl mx-auto flex flex-col space-y-16">
        {/* Paso 1 - Izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-start text-left"
        >
          <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
            1
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-semibold">Investigación</h3>
            <p className="text-gray-400 max-w-md">
              Nos sumergimos en la documentación de tu producto, analizamos sus
              características clave y su propuesta de valor.
            </p>
          </div>
          <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 ml-6"></div>
        </motion.div>

        {/* Paso 2 - Derecha */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-end text-right"
        >
          <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 mr-6"></div>
          <div className="mr-4">
            <h3 className="text-2xl font-semibold">Creación de Diseño</h3>
            <p className="text-gray-400 max-w-md">
              Nuestros diseñadores crean una identidad visual impactante que se
              alinea con la esencia de tu negocio.
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
            2
          </div>
        </motion.div>

        {/* Paso 3 - Izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-start text-left"
        >
          <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
            3
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-semibold">Desarrollo</h3>
            <p className="text-gray-400 max-w-md">
              Implementamos código limpio y optimizado para garantizar un
              software robusto, seguro y escalable.
            </p>
          </div>
          <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 ml-6"></div>
        </motion.div>

        {/* Paso 4 - Derecha */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-end text-right"
        >
          <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 mr-6"></div>
          <div className="mr-4">
            <h3 className="text-2xl font-semibold">Lanzamiento y Soporte</h3>
            <p className="text-gray-400 max-w-md">
              Garantizamos un lanzamiento impecable y ofrecemos mantenimiento
              continuo para tu éxito digital.
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
            4
          </div>
        </motion.div>
      </div>
    </section>
  );
}
