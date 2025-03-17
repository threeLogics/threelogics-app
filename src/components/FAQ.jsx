import { useState } from "react";
import { Link } from "react-router-dom";

const faqData = [
  {
    category: "General",
    questions: [
      {
        question: "¿Qué es ThreeLogics?",
        answer:
          "ThreeLogics es un sistema de gestión de almacenes diseñado para optimizar y simplificar las tareas logísticas. Permite gestionar inventarios, visualizar y controlar productos, realizar análisis de datos y mejorar la eficiencia operativa. Su enfoque se basa en tres pilares: lógica, organización y eficiencia.",
      },
      {
        question: "¿A quién está dirigido ThreeLogics?",
        answer:
          "Está diseñado principalmente para pequeñas y medianas empresas (pymes) que buscan una solución asequible, escalable y fácil de usar para gestionar su inventario, mejorar la logística de sus almacenes y optimizar sus recursos.",
      },
      {
        question: "¿En qué se diferencia ThreeLogics de un ERP tradicional?",
        answer:
          "A diferencia de los ERP tradicionales como SAP o Microsoft Dynamics, ThreeLogics está diseñado específicamente para pymes. Se enfoca en la facilidad de uso, sin necesidad de una implementación costosa ni procesos complejos de configuración.",
      },
      {
        question: "¿ThreeLogics es compatible con dispositivos móviles?",
        answer:
          "Sí, ThreeLogics cuenta con una interfaz responsive que permite gestionar el inventario desde cualquier dispositivo, ya sea un ordenador, tablet o móvil.",
      },
    ],
  },
  {
    category: "Funcionalidades",
    questions: [
      {
        question: "¿Qué funcionalidades ofrece ThreeLogics?",
        answer:
          "Entre sus principales funcionalidades se incluyen:\n- Gestión de inventario en tiempo real.\n- Control y actualización de estados de pedidos.\n- Creación, modificación y eliminación de productos.\n- Notificaciones automáticas sobre cambios en productos y pedidos.\n- Autenticación segura de usuarios.\n- Integración con sistemas externos mediante APIs.\n- Análisis predictivo de demanda para optimizar el stock.\n- Gestión de múltiples almacenes en una misma plataforma.",
      },
      {
        question: "¿Se pueden modificar los pedidos una vez creados?",
        answer:
          "Sí, ThreeLogics permite modificar los pedidos siempre que estos no hayan sido enviados o completados.",
      },
      {
        question: "¿Cómo funciona el sistema de notificaciones?",
        answer:
          "Cada vez que se agrega, modifica o elimina un producto o pedido, ThreeLogics genera una notificación automática para informar a los usuarios correspondientes sobre los cambios en tiempo real.",
      },
      {
        question: "¿Cómo se actualiza el estado de un pedido?",
        answer:
          "- **Pendiente**: Cuando el pedido está en el carrito.\n- **Pagar**: Al ingresar a la pasarela de pago ficticia.\n- **Enviado**: Una vez completado el pago.\n- **Completado**: Automáticamente después de 24 horas de haber sido enviado.",
      },
      {
        question: "¿ThreeLogics permite gestionar múltiples almacenes?",
        answer:
          "Sí, permite gestionar múltiples almacenes desde una sola plataforma, optimizando la distribución del inventario entre diferentes ubicaciones.",
      },
    ],
  },
  {
    category: "Tecnología",
    questions: [
      {
        question: "¿Qué tecnologías usa ThreeLogics?",
        answer:
          "ThreeLogics utiliza un stack tecnológico moderno y escalable:\n- **Frontend**: React con Tailwind CSS.\n- **Backend**: Node.js con Express.\n- **Base de datos**: Supabase, que ofrece autenticación y almacenamiento seguro.\n- **Infraestructura**: Servidores en la nube con Google Cloud o AWS.\n- **Control de versiones**: GitHub para gestión eficiente del código fuente.\n- **Análisis y monitoreo**: Herramientas como Grafana y Google Analytics para medir el rendimiento del sistema.",
      },
      {
        question: "¿ThreeLogics es escalable?",
        answer:
          "Sí, ThreeLogics está diseñado para crecer con las necesidades del cliente. Su arquitectura en la nube y su uso de tecnologías modernas permiten escalar tanto en volumen de datos como en número de usuarios sin afectar el rendimiento.",
      },
      {
        question: "¿Es posible integrar ThreeLogics con otras plataformas?",
        answer:
          "Sí, ThreeLogics permite la integración con otros sistemas mediante APIs para sincronización de datos con ERPs, CRMs y otros software de gestión.",
      },
      {
        question: "¿ThreeLogics es seguro?",
        answer:
          "Sí, ThreeLogics implementa medidas de seguridad avanzadas, incluyendo:\n- **Autenticación segura** con Supabase.\n- **Encriptación de datos** en tránsito y en reposo.\n- **Firewalls y protección contra ataques cibernéticos**.\n- **Backups automáticos** para garantizar la disponibilidad de los datos.",
      },
    ],
  },
  {
    category: "Negocio y Soporte",
    questions: [
      {
        question: "¿Qué diferencia a ThreeLogics de la competencia?",
        answer:
          "ThreeLogics se diferencia de otros sistemas como SAP, Zoho Inventory y Microsoft Dynamics 365 en varios aspectos:\n- **Enfoque adaptativo**: Personalización para pymes sin necesidad de configuraciones complejas.\n- **Rentabilidad**: Solución escalable y asequible sin costes elevados de mantenimiento.\n- **Análisis predictivo**: Predicción de demanda para optimización de stock.\n- **Facilidad de uso**: Interfaz intuitiva, sin necesidad de formación especializada.",
      },
      {
        question: "¿ThreeLogics ofrece soporte técnico?",
        answer:
          "Sí, ThreeLogics ofrece soporte técnico en distintas modalidades:\n- Base de conocimientos con guías y tutoriales.\n- Soporte por correo electrónico para consultas generales.\n- Chat en vivo para asistencia rápida.",
      },
      {
        question: "¿ThreeLogics tiene un modelo de pago?",
        answer:
          "Actualmente, ThreeLogics ofrece un modelo flexible de pago basado en suscripción mensual o anual, con distintos planes según el tamaño y necesidades de la empresa.",
      },
      {
        question: "¿Qué ventajas ofrece ThreeLogics frente a soluciones gratuitas?",
        answer:
          "Las soluciones gratuitas suelen ser limitadas en funcionalidades y soporte. ThreeLogics ofrece integración avanzada, análisis de datos, mayor seguridad y personalización para cada empresa.",
      },
    ],
  },
  {
    category: "Casos de Uso",
    questions: [
      {
        question: "¿En qué sectores puede utilizarse ThreeLogics?",
        answer:
          "ThreeLogics es ideal para una variedad de sectores que manejan inventario, incluyendo:\n- Comercio minorista\n- Empresas de logística y distribución\n- Fábricas y manufactura\n- Ecommerce y tiendas online\n- Proveedores de insumos médicos",
      },
      {
        question: "¿Puede ThreeLogics ayudar en la toma de decisiones?",
        answer:
          "Sí, gracias a su sistema de análisis de datos y predicción de demanda, ThreeLogics permite optimizar la compra de inventario y evitar faltantes o excesos de stock.",
      },
      {
        question: "¿ThreeLogics permite roles de usuario con distintos permisos?",
        answer:
          "Sí, la plataforma permite asignar distintos roles y niveles de acceso para garantizar una gestión segura y eficiente del inventario.",
      },
    ],
  },
];

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState(new Set());

  const toggleFAQ = (index) => {
    const newOpenQuestions = new Set(openQuestions);
    newOpenQuestions.has(index)
      ? newOpenQuestions.delete(index)
      : newOpenQuestions.add(index);
    setOpenQuestions(newOpenQuestions);
  };

  return (
    <div className="bg-black min-h-screen text-white p-10">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mt-12">
        <h1 className="text-4xl font-bold text-center text-teal-400 mb-6">
          Preguntas Frecuentes (FAQ)
        </h1>

        {faqData.map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              {section.category}
            </h2>
            {section.questions.map((faq, i) => {
              const isOpen = openQuestions.has(`${index}-${i}`);
              return (
                <div key={i} className="border-b border-gray-700 py-3">
                  <button
                    className="w-full text-left flex justify-between items-center text-lg font-semibold text-gray-200 focus:outline-none transition duration-300 hover:text-teal-400"
                    onClick={() => toggleFAQ(`${index}-${i}`)}
                  >
                    {faq.question}
                    <span className="text-teal-400">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="mt-2 text-gray-400">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Botón para Volver a Inicio */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-lg font-semibold text-teal-400 hover:underline"
          >
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
