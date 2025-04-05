import React from 'react';

const Webinars = () => {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-12 text-center bg-white">
      
      {/* Título */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Descubre cómo ThreeLogics revoluciona la gestión de tu almacén
      </h1>

      {/* Subtítulo */}
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
        Una plataforma intuitiva para controlar productos, pedidos, categorías, ubicaciones y estadísticas en tiempo real.
      </p>

      {/* Vídeo */}
      <div className="w-full max-w-4xl mb-8 relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-lg">
        <iframe 
          className="absolute top-0 left-0 w-full h-full rounded-2xl"
          src="https://www.youtube.com/embed/0c87dGV6rNA" 
          title="Demo ThreeLogics" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>

      {/* Cuerpo del texto */}
      <div className="text-base md:text-lg text-gray-700 max-w-3xl mb-8">
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
        className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
      >
        Solicitar Demo Personalizada
      </a>
    </section>
  );
};

export default Webinars;
