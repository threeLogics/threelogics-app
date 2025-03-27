import { motion } from "framer-motion";

export default function WorkProcess() {
  return (
    <section
      id="work-process"
      className="py-16 bg-black text-white text-center"
    >
      {/* Título */}
      <h2 className="text-5xl font-bold mb-6 text-center">
  Conoce nuestro <span className="text-teal-400">proceso de trabajo</span>
</h2>
<p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto mb-16 text-center">
  Nos especializamos en ofrecer <span className="text-white font-medium">soluciones logísticas inteligentes</span> para 
  <span className="text-teal-400 font-medium"> pequeñas y medianas empresas</span>. Nuestro proceso combina 
  <span className="text-white font-medium"> análisis, diseño y tecnología</span> para crear productos 
  <span className="text-white font-medium"> eficientes, escalables y fáciles de usar</span>.
</p>


      {/* Contenedor Principal */}
      <div className="relative max-w-5xl mx-auto flex flex-col space-y-24">
  {/* Paso 1 - Izquierda */}
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="relative flex items-start md:items-center justify-start text-left"
  >
    <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-md">
      1
    </div>
    <div className="ml-6 space-y-3 max-w-xl">
      <h3 className="text-3xl font-semibold text-white">Investigación</h3>
      <p className="text-gray-400 text-lg leading-relaxed">
        Nos sumergimos en el funcionamiento de tu almacén, <span className="text-white font-medium">analizamos procesos</span>, flujos de datos y necesidades específicas para diseñar una solución <span className="text-teal-400 font-medium">totalmente adaptada</span> a tu negocio.
      </p>
    </div>
    <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 ml-6"></div>
  </motion.div>

  {/* Paso 2 - Derecha */}
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="relative flex items-start md:items-center justify-end text-right"
  >
    <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 mr-6"></div>
    <div className="mr-6 space-y-3 max-w-xl">
      <h3 className="text-3xl font-semibold text-white">Creación de Diseño</h3>
      <p className="text-gray-400 text-lg leading-relaxed">
        Diseñamos una interfaz <span className="text-white font-medium">clara, intuitiva y visualmente atractiva</span>, pensada para <span className="text-teal-400 font-medium">facilitar la gestión</span> diaria y reducir errores operativos, alineada con tu identidad corporativa.
      </p>
    </div>
    <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-md">
      2
    </div>
  </motion.div>

{/* Paso 3 - Izquierda */}
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6 }}
  className="relative flex items-start md:items-center justify-start text-left"
>
  <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-md">
    3
  </div>
  <div className="ml-6 space-y-3 max-w-xl">
    <h3 className="text-3xl font-semibold text-white">Desarrollo</h3>
    <p className="text-gray-400 text-lg leading-relaxed">
      Implementamos <span className="text-teal-400 font-medium">tecnología moderna</span> como 
      <span className="text-white font-medium"> React</span>, 
      <span className="text-white font-medium"> Supabase</span> y 
      <span className="text-white font-medium"> Tailwind</span> para garantizar un software 
      <span className="text-white font-medium"> robusto, rápido y seguro</span>, preparado para escalar junto a tu empresa.
    </p>
  </div>
  <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 ml-6"></div>
</motion.div>

{/* Paso 4 - Derecha */}
<motion.div
  initial={{ opacity: 0, x: 50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6 }}
  className="relative flex items-start md:items-center justify-end text-right"
>
  <div className="hidden md:block w-1 h-16 bg-teal-500 opacity-40 mr-6"></div>
  <div className="mr-6 space-y-3 max-w-xl">
    <h3 className="text-3xl font-semibold text-white">Lanzamiento y Soporte</h3>
    <p className="text-gray-400 text-lg leading-relaxed">
      Aseguramos una implementación <span className="text-white font-medium">sin complicaciones</span> y te acompañamos con 
      <span className="text-teal-400 font-medium"> soporte continuo</span>, actualizaciones constantes y mejoras basadas en el 
      <span className="text-white font-medium"> análisis del uso real del sistema</span>.
    </p>
  </div>
  <div className="w-12 h-12 bg-teal-500 text-black flex items-center justify-center rounded-full text-lg font-bold shadow-md">
    4
  </div>
</motion.div>

      </div>
    </section>
  );
}
