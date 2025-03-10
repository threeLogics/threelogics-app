
const TermsConditions = () => {
    return (
      <div className="bg-black text-white min-h-screen p-10 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-teal-400 mb-6">Términos y Condiciones</h1>
          <p className="text-gray-300 mb-4">
            Bienvenido a <span className="text-teal-400 font-semibold">ThreeLogics</span>. 
            Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones.
          </p>
  
          <h2 className="text-2xl text-teal-400 font-semibold mt-6">1. Uso del Servicio</h2>
          <p className="text-gray-400">
            Al acceder a nuestro sitio web, garantizas que tienes al menos 18 años de edad o cuentas 
            con el consentimiento de un tutor legal.
          </p>
  
          <h2 className="text-2xl text-teal-400 font-semibold mt-6">2. Propiedad Intelectual</h2>
          <p className="text-gray-400">
            Todo el contenido, logotipos y materiales disponibles en nuestra plataforma son propiedad de ThreeLogics.
          </p>
  
          <h2 className="text-2xl text-teal-400 font-semibold mt-6">3. Cambios en los Términos</h2>
          <p className="text-gray-400">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Se notificará a los usuarios sobre cualquier cambio significativo.
          </p>
  
          <p className="text-gray-500 mt-6">Última actualización: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  };
  
  export default TermsConditions;
  