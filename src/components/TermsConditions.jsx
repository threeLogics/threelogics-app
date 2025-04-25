import { useEffect } from "react";
import MetaData from '../components/MetaData';

const TermsConditions = () => {
  useEffect(() => {
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-10 pt-20">
         <MetaData
        title="Términos y Condiciones | ThreeLogics"
        description="Lee los términos y condiciones de uso de ThreeLogics. Conoce las responsabilidades del usuario, la propiedad intelectual y nuestras políticas de servicio."
        imageUrl="https://threelogicsapp.vercel.app/og-image.png"
        keywords="términos y condiciones, política de privacidad, uso de servicio, propiedad intelectual, responsabilidad del usuario"
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-400 mb-6 text-center">
          Términos y Condiciones
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          Bienvenido a <span className="text-teal-400 font-semibold">ThreeLogics</span>. 
          Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones.
        </p>

        {/* Sección 1 - Uso del Servicio */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">1. Uso del Servicio</h2>
          <p className="text-gray-400 mt-2">
            Al acceder a nuestro sitio web, garantizas que tienes al menos <span className="font-semibold">18 años</span> 
            de edad o cuentas con el consentimiento de un tutor legal. 
            El uso indebido del servicio puede resultar en la suspensión de tu cuenta.
          </p>
        </section>

        {/* Sección 2 - Propiedad Intelectual */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">2. Propiedad Intelectual</h2>
          <p className="text-gray-400 mt-2">
            Todo el contenido, logotipos y materiales disponibles en nuestra plataforma son propiedad de 
            <span className="text-teal-400 font-semibold"> ThreeLogics</span> y están protegidos por derechos de autor y leyes de propiedad intelectual. 
            No está permitida su reproducción sin consentimiento expreso.
          </p>
        </section>

        {/* Sección 3 - Cambios en los Términos */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">3. Cambios en los Términos</h2>
          <p className="text-gray-400 mt-2">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            En caso de cambios significativos, te notificaremos a través de nuestros canales oficiales. 
            Te recomendamos revisar esta sección periódicamente.
          </p>
        </section>

        {/* Sección 4 - Responsabilidades del Usuario */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">4. Responsabilidades del Usuario</h2>
          <p className="text-gray-400 mt-2">
            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de cualquier actividad que ocurra bajo tu cuenta. 
            No debes utilizar nuestro servicio para actividades ilegales o fraudulentas.
          </p>
        </section>

        {/* Sección 5 - Limitación de Responsabilidad */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">5. Limitación de Responsabilidad</h2>
          <p className="text-gray-400 mt-2">
            ThreeLogics no será responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso de nuestros servicios. 
            No garantizamos que el servicio esté libre de errores o interrupciones.
          </p>
        </section>

        {/* Última actualización */}
        <p className="text-gray-500 text-sm text-center mt-8 border-t border-gray-700 pt-4">
          Última actualización: <span className="font-semibold text-teal-400">{new Date().toLocaleDateString()}</span>
        </p>
      </div>
    </div>
  );
};

export default TermsConditions;
