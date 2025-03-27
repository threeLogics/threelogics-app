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
        <motion.img
    src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//webDevelopment2.png"
    alt="Web Development"
    className="rounded-2xl shadow-2xl w-full max-w-6xl mx-auto transition-transform duration-500 hover:scale-125  hover:-translate-y-1"
    whileHover={{ scale: 1.05 }}
  />
        </motion.div>

        {/* Columna de Texto */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-left"
        >
        <h3 className="text-5xl font-semibold mb-6">
  <span className="text-gray-500">Web</span> <span className="text-white">Development</span>
</h3>

<p className="text-gray-400 text-lg leading-relaxed space-y-4">
  <span className="block">
    Desarrollamos <span className="text-teal-400 font-medium">software a medida</span> con tecnologías modernas como
    <span className="text-white font-medium"> React</span>, 
    <span className="text-white font-medium"> Supabase</span> y 
    <span className="text-white font-medium"> Tailwind</span>.
  </span>

  <span className="block">
    Nuestro enfoque en <span className="text-white font-medium">clean code</span>, 
    <span className="text-white font-medium"> rendimiento</span> y 
    <span className="text-white font-medium"> accesibilidad</span> nos permite ofrecer 
    <span className="text-teal-400 font-medium"> soluciones robustas, seguras y escalables</span>.
  </span>

  <span className="block mt-4">
    🚀 <span className="text-white font-medium">Despliegue optimizado</span>, 
    <span className="text-white font-medium"> paneles interactivos</span> y 
    <span className="text-white font-medium"> control total</span> sobre tu inventario, pedidos y usuarios.
  </span>
</p>


          {/* Tecnologías utilizadas */}
          <div className="flex space-x-6 mt-6">
            <img
              src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//react.png"
              alt="React"
              className="w-8 h-8 transition duration-300 hover:scale-110 hover:text-teal-400"
            />
            <img
              src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//tailwind_logo.png"
              alt="Tailwind"
              className="w-8 h-8 transition duration-300 hover:scale-110 hover:text-teal-400"
            />
            <img
  src="https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//supabase_logo.png"
  alt="Supabase"
  className="w-8 h-8 rounded-full transition duration-300 hover:scale-110 hover:text-teal-400 "
 />

          </div>
        </motion.div>
      </div>
    </section>
  );
}
