import React from 'react';

const Webinars = () => {
  return (
    <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      
      {/* Título */}
      <h1 className="text-3xl sm:text-5xl font-bold text-teal-400 mb-4 text-center pd-4">
        Descubre cómo ThreeLogics revoluciona la gestión de tu almacén
      </h1>

      {/* Subtítulo */}
      <p className="text-sm sm:text-lg text-gray-400 mb-10 text-center max-w-3xl">
        Una plataforma intuitiva para controlar productos, pedidos, categorías, ubicaciones y estadísticas en tiempo real.
      </p>

      {/* Vídeo */}
      <div className="w-full max-w-5xl mb-10 rounded-2xl overflow-hidden shadow-lg relative pb-[56.25%]">
        <iframe 
          className="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/0c87dGV6rNA?rel=0&modestbranding=1&showinfo=0&controls=1"
          title="Demo ThreeLogics"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Cuerpo del texto */}
      <div className="text-base sm:text-lg text-gray-400 max-w-3xl mb-8 text-center">
        <p className="mb-4">
          ThreeLogics está diseñado para pequeñas y medianas empresas que buscan digitalizar y optimizar su almacén de forma sencilla y eficiente.
        </p>
        <p className="mb-4">
          En este breve vídeo te mostramos cómo:
        </p>
        <ul className="text-left list-disc list-inside mb-4">
          <li>✅ Gestionar productos y stock en tiempo real</li>
          <li>✅ Organizar artículos por categorías y ubicaciones</li>
          <li>✅ Controlar entradas, salidas y movimientos históricos</li>
          <li>✅ Visualizar estadísticas y descargar informes</li>
          <li>✅ Planificar acciones desde un calendario interactivo</li>
        </ul>
        <p>
          Escanea el QR o haz clic aquí para probar ThreeLogics. ¡Empieza a transformar tu almacén hoy mismo!
        </p>
      </div>

      {/* Botón */}
      <a 
        href="/solicitar-demo" 
        className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-2xl hover:bg-teal-400 transition"
      >
        Solicitar Demo Personalizada
      </a>
    </section>
  );
};

export default Webinars;
