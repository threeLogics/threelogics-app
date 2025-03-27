import { useEffect } from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  useEffect(() => {
    // Desplazar la vista al inicio al cargar el componente
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-10 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-400 mb-6 text-center">
          Política de Privacidad
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          En <span className="text-teal-400 font-semibold">ThreeLogics</span>, valoramos tu privacidad. 
          Aquí explicamos cómo recopilamos, usamos y protegemos tu información personal.
        </p>

        {/* Sección 1 - Información que Recopilamos */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">1. Información que Recopilamos</h2>
          <p className="text-gray-400 mt-2">
            Podemos recopilar información personal como:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2">
            <li>Nombre y apellidos</li>
            <li>Dirección de correo electrónico</li>
            <li>Datos de contacto</li>
            <li>Información de uso del servicio</li>
          </ul>
          <p className="text-gray-400 mt-2">
            Esta información es necesaria para brindarte una experiencia personalizada y mejorar nuestros servicios.
          </p>
        </section>

        {/* Sección 2 - Uso de la Información */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">2. Uso de la Información</h2>
          <p className="text-gray-400 mt-2">
            Utilizamos tu información para:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2">
            <li>Mejorar nuestros servicios y funcionalidades</li>
            <li>Enviarte notificaciones y actualizaciones relevantes</li>
            <li>Cumplir con nuestras obligaciones legales y de seguridad</li>
          </ul>
        </section>

        {/* Sección 3 - Seguridad */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">3. Seguridad</h2>
          <p className="text-gray-400 mt-2">
            Implementamos medidas de seguridad avanzadas para proteger tu información contra accesos no autorizados. 
            Estas medidas incluyen:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2">
            <li>Encriptación de datos</li>
            <li>Autenticación segura con Supabase</li>
            <li>Protección contra ataques cibernéticos</li>
          </ul>
        </section>

        {/* Sección 4 - Derechos del Usuario */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">4. Derechos del Usuario</h2>
          <p className="text-gray-400 mt-2">
            Como usuario, tienes derecho a:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2">
            <li>Solicitar acceso a tus datos personales</li>
            <li>Modificar o eliminar tu información</li>
            <li>Restringir el procesamiento de tus datos</li>
          </ul>
          <p className="text-gray-400 mt-2">
            Para ejercer estos derechos, puedes contactarnos en <span className="text-teal-400">threelogicsapp@gmail.com</span>.
          </p>
        </section>

        {/* Sección 5 - Almacenamiento y Retención de Datos */}
        <section className="mb-6">
          <h2 className="text-2xl text-teal-400 font-semibold">5. Almacenamiento y Retención de Datos</h2>
          <p className="text-gray-400 mt-2">
            Tus datos serán almacenados de manera segura en servidores en la nube (Google Cloud o AWS). 
            Mantendremos tu información solo durante el tiempo necesario para cumplir con nuestras obligaciones legales y mejorar la experiencia del usuario.
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


export default PrivacyPolicy;
