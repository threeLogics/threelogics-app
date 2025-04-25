import { motion } from "framer-motion";

export default function Services() {
  return (
    <section className="relative pb-12 bg-black text-white text-center">

      {/* Encabezado */}
      <div className="max-w-3xl mx-auto text-center">
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="inline-block px-5 py-2 bg-teal-600 text-black text-sm font-bold uppercase tracking-wider rounded-full mb-6 shadow-md"
  >
    Servicios
  </motion.div>

  <h2 className="text-5xl font-bold mb-6">
    Cómo podemos <span className="text-teal-400">ayudarte</span>
  </h2>

  <p className="text-gray-400 text-lg leading-relaxed">
    ¿Qué hace que tu empresa se destaque? En <span className="text-white font-medium">ThreeLogics</span>, 
    potenciamos tu logística con <span className="text-teal-400 font-medium">soluciones digitales innovadoras</span> 
    que combinan <span className="text-white font-medium">eficiencia, escalabilidad</span> y un enfoque completamente adaptado a las necesidades de las pequeñas y medianas empresas.
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
  <span className="text-gray-500">Optimización</span> <span className="text-white">& UX/UI Design</span>
</h3>

<p className="text-gray-400 text-lg leading-relaxed space-y-4">
  <span className="block">
    Creamos <span className="text-teal-400 font-medium">interfaces intuitivas y atractivas</span> centradas en la
    <span className="text-teal-400 font-medium"> experiencia de usuario</span>.
  </span>

  <span className="block">
    Diseñamos cada pantalla pensando en <span className="text-white font-medium">facilitar el trabajo diario</span> en almacenes,
    <span className="text-white font-medium"> simplificando procesos complejos</span> y
    <span className="text-white font-medium"> mejorando la productividad</span>.
  </span>

  <span className="block mt-4">
    💡 <span className="text-white font-medium">Navegación clara</span>, <span className="text-white font-medium">diseño responsive</span> y
    <span className="text-white font-medium"> animaciones</span> que convierten tareas rutinarias en experiencias eficientes.
  </span>
</p>


          {/* Íconos representando tecnologías */}
          <div className="flex space-x-6 mt-6">
  <img src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//triangulo.webp" alt="Diseño UI" className="w-14 h-14 rounded-full hover:scale-110" />
  <img src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//paleta.webp" alt="Precisión" className="w-14 h-14 rounded-full hover:scale-110" />
  <img src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//rayo.webp" alt="Velocidad" className="w-14 h-14 rounded-full hover:scale-110" />
</div>



        </motion.div>

        {/* Mockup a la derecha */}
        <motion.div
  initial={{ opacity: 0, scale: 0.95, x: 50 }}
  whileInView={{ opacity: 1, scale: 1, x: 0 }}
  transition={{ duration: 0.8 }}
  className="md:w-1/2"
>
  <motion.img
    src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//dashboard.png"
    alt="Dashboard de optimización"
    className="rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transition-transform duration-500 hover:scale-125  hover:-translate-y-1"
    whileHover={{ scale: 1.05 }}
  />
</motion.div>

      </div>
    </section>
  );
}
