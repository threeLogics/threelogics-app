import { Link } from "react-router-dom";
const PrivacyPolicy = () => {
    return (
      <div className="bg-black text-white min-h-screen p-10  pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-teal-400 mb-6">Política de Privacidad</h1>
          <p className="text-gray-300 mb-4">
            En <span className="text-teal-400 font-semibold">ThreeLogics</span>, valoramos tu privacidad. 
            Aquí explicamos cómo recopilamos, usamos y protegemos tu información personal.
          </p>
  
          <h2 className="text-2xl text-teal-400 font-semibold mt-6">1. Información que Recopilamos</h2>
          <p className="text-gray-400">
            Podemos recopilar información personal como nombre, dirección de correo electrónico y otros datos 
            necesarios para el uso de nuestros servicios.
          </p>
  
          <h2 className="text-2xl text-teal-400 font-semibold mt-6">2. Uso de la Información</h2>
          <p className="text-gray-400">
            Utilizamos tu información para mejorar nuestros servicios, enviarte actualizaciones y 
            cumplir con nuestras obligaciones legales.
          </p>
  
          <h2 className="text-2xl text-teal-400 font-semibold mt-6">3. Seguridad</h2>
          <p className="text-gray-400">
            Implementamos medidas de seguridad avanzadas para proteger tu información contra accesos no autorizados.
          </p>
  
          <p className="text-gray-500 mt-6">Última actualización: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  };
  
  export default PrivacyPolicy;
  