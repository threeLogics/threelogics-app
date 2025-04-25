import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Settings,
  Cpu,
  Briefcase,
  PackageSearch,
} from "lucide-react";

const faqData = [
  {
    category: "General",
    questions: [
      {
        question: "¿Qué es ThreeLogics?",
        answer:
          "**ThreeLogics** es una solución de software creada para digitalizar y automatizar la gestión de almacenes. Está diseñada para **pymes que buscan modernizar su logística sin complicaciones**, permitiendo gestionar productos, pedidos, ubicaciones y movimientos desde un único panel centralizado.",
      },
      {
        question: "¿A quién está dirigido ThreeLogics?",
        answer:
          "Está enfocado en **pequeñas y medianas empresas** del sector retail, logística, distribución, ecommerce, o cualquier organización que trabaje con inventarios físicos. Su interfaz intuitiva permite que cualquier usuario pueda utilizarlo sin necesidad de conocimientos técnicos.",
      },
      {
        question: "¿En qué se diferencia ThreeLogics de un ERP tradicional?",
        answer:
          "A diferencia de un ERP tradicional como SAP o Dynamics 365, **ThreeLogics no requiere procesos de implementación complejos ni licencias costosas**. Su enfoque es ágil, modular, y centrado exclusivamente en el control y optimización de almacenes.",
      },
      {
        question: "¿ThreeLogics es compatible con dispositivos móviles?",
        answer:
          "Sí, cuenta con una interfaz totalmente **responsive**. Puedes acceder a la plataforma desde ordenadores, tablets o móviles sin perder funcionalidad ni usabilidad.",
      },
      {
        question: "¿Puedo probar ThreeLogics gratuitamente?",
        answer:
          "Actualmente ofrecemos una **demo pública bajo petición**, donde podrás explorar las funcionalidades sin compromiso. Muy pronto implementaremos un modelo freemium con cuentas de prueba limitadas.",
      },
    ],
  },
  {
    category: "Funcionalidades",
    questions: [
      {
        question: "¿Qué funcionalidades ofrece ThreeLogics?",
        answer:
          "ThreeLogics incluye:\n- **Gestión de inventario en tiempo real** con stock por ubicación.\n- **Entradas y salidas de productos** (pedidos).\n- **Creación, edición y eliminación de productos** con control por categorías.\n- **Control de múltiples almacenes** en una sola cuenta.\n- **Calendario de movimientos** y eventos.\n- **Informes automáticos en PDF**.\n- **Notificaciones automáticas** por cambios en productos o pedidos.",
      },
      {
        question: "¿Se pueden modificar los pedidos una vez creados?",
        answer:
          "Sí, los pedidos pueden ser modificados mientras estén en estado **Pendiente** o **Pagar**. Una vez **Enviado** o **Completado**, ya no se puede editar.",
      },
      {
        question: "¿Cómo funciona el sistema de notificaciones?",
        answer:
          "Cada vez que se realiza una acción relevante (crear/modificar productos o pedidos), **ThreeLogics genera una notificación visual** y próximamente también por correo o push.",
      },
      {
        question: "¿Cómo se actualiza el estado de un pedido?",
        answer:
          "- **Pendiente**: Está en el carrito.\n- **Pagar**: El usuario accede a la pasarela de pago.\n- **Enviado**: Se ha completado el pago.\n- **Completado**: Pasa automáticamente después de 24h.",
      },
      {
        question: "¿ThreeLogics permite gestionar múltiples almacenes?",
        answer:
          "Sí, puedes gestionar **tantos almacenes físicos como necesites**, asignar productos por ubicación y visualizar movimientos separados por almacén.",
      },
    ],
  }
  ,
  {
    category: "Tecnología",
    questions: [
      {
        question: "¿Qué tecnologías usa ThreeLogics?",
        answer:
          "Utilizamos un stack moderno:\n- **Frontend**: React + Tailwind CSS.\n- **Backend**: Node.js con Express.\n- **Base de datos**: Supabase (PostgreSQL + Auth).\n- **Infraestructura**: Render, Railway y Vercel.\n- **Control de versiones**: GitHub.\n- **Analítica y monitoreo**: Grafana, Google Analytics y Sentry.",
      },
      {
        question: "¿ThreeLogics es escalable?",
        answer:
          "Sí, la arquitectura es totalmente escalable. Usamos **bases de datos relacionales**, servicios cloud y estructura modular para soportar múltiples usuarios y almacenes sin pérdida de rendimiento.",
      },
      {
        question: "¿Es posible integrar ThreeLogics con otras plataformas?",
        answer:
          "Sí. Contamos con una **API REST** que permite integrar ThreeLogics con ERP, CRMs u otros sistemas. En el futuro también incluiremos **webhooks y conectores nativos**.",
      },
      {
        question: "¿ThreeLogics es seguro?",
        answer:
          "Sí, implementamos:\n- **Autenticación segura con Supabase**.\n- **Protección de rutas según rol** (admin o cliente).\n- **Backups automáticos**.\n- **Protección contra ataques comunes** (OWASP ZAP).\n- **Encriptación en tránsito**.",
      },
    ],
  }
  ,
  {
    category: "Negocio y Soporte",
    questions: [
      {
        question: "¿Qué diferencia a ThreeLogics de la competencia?",
        answer:
          "Nos diferenciamos por:\n- **Foco exclusivo en pymes**.\n- **Interfaz intuitiva sin curva de aprendizaje**.\n- **Análisis predictivo**.\n- **Coste accesible** comparado con SAP, Zoho Inventory o Dynamics 365.\n- **Soporte personalizado**.",
      },
      {
        question: "¿ThreeLogics ofrece soporte técnico?",
        answer:
          "Sí, ofrecemos:\n- Soporte por correo electrónico.\n- Chat en vivo integrado en la app.\n- Documentación oficial y base de conocimientos.\n- Posibilidad de soporte premium para integraciones personalizadas.",
      },
      {
        question: "¿ThreeLogics tiene un modelo de pago?",
        answer:
          "Sí. Actualmente se ofrece bajo **modelo freemium**, con un plan gratuito y **suscripciones mensuales o anuales** según necesidades (básico, pro y enterprise).",
      },
      {
        question: "¿Qué ventajas ofrece frente a soluciones gratuitas?",
        answer:
          "Las soluciones gratuitas carecen de muchas funciones críticas:\n- No ofrecen **integración con APIs**.\n- No permiten múltiples almacenes.\n- No tienen **soporte real** ni predicción de demanda.\n- ThreeLogics es más confiable, seguro y escalable.",
      },
    ],
  }
  ,
  {
    category: "Casos de Uso",
    questions: [
      {
        question: "¿En qué sectores puede utilizarse ThreeLogics?",
        answer:
          "ThreeLogics está pensado para:\n- **Comercios minoristas**.\n- **Logística y distribución**.\n- **Ecommerce**.\n- **Fabricación y ensamblaje**.\n- **Empresas de insumos médicos, tecnología y ferretería**.",
      },
      {
        question: "¿Puede ThreeLogics ayudar en la toma de decisiones?",
        answer:
          "Sí. Gracias al **dashboard interactivo y estadísticas** de producto, stock y movimientos, puedes tomar decisiones basadas en datos reales (ej. qué productos reponer, en qué almacén, cuándo comprar más, etc.).",
      },
      {
        question: "¿ThreeLogics permite roles de usuario con distintos permisos?",
        answer:
          "Sí. Hay dos roles principales:\n- **Administrador**: Puede ver todos los datos del sistema.\n- **Cliente**: Solo ve sus propios productos, ubicaciones y movimientos.",
      },
    ],
  }
  ,
];

const categoryIcons = {
  General: HelpCircle,
  Funcionalidades: Settings,
  Tecnología: Cpu,
  "Negocio y Soporte": Briefcase,
  "Casos de Uso": PackageSearch,
};

// Función para resaltar palabras clave
const processAnswer = (text) => {
  const keywords = ["React", "Supabase", "API", "pedidos", "almacén", "usuarios", "seguridad"];
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Negrita con **
    .replace(keywordRegex, "<span class='text-teal-400 font-medium'>$1</span>") // Palabras clave
    .replace(/\n/g, "<br>"); // Saltos de línea
};

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState(new Set());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleFAQ = (index) => {
    const newOpenQuestions = new Set(openQuestions);
    newOpenQuestions.has(index)
      ? newOpenQuestions.delete(index)
      : newOpenQuestions.add(index);
    setOpenQuestions(newOpenQuestions);

    setTimeout(() => {
      const element = document.getElementById(`faq-${index}`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div className="bg-black min-h-screen text-white p-10">
      <div className="max-w-4xl mx-auto bg-gray-950 p-6 rounded-lg shadow-lg mt-12">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Preguntas <span className="text-teal-400">Frecuentes (FAQ)</span>
        </h1>

        {faqData.map((section, index) => {
          const Icon = categoryIcons[section.category] || HelpCircle;

          return (
            <div key={index} className="mb-8">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-teal-400" />
                {section.category}
              </h2>

              {section.questions.map((faq, i) => {
                const key = `${index}-${i}`;
                const isOpen = openQuestions.has(key);
                const isEven = i % 2 === 0;

                return (
                  <div
                    key={i}
                    id={`faq-${key}`}
                    className={`border-b border-gray-700 py-3 px-2 rounded ${
                      isEven ? "bg-white/5" : "bg-white/10"
                    }`}
                  >
                    <button
                      aria-expanded={isOpen}
                      aria-controls={`faq-${key}`}
                      onClick={() => toggleFAQ(key)}
                      className="w-full text-left flex justify-between items-center text-lg font-semibold text-gray-200 focus:outline-none transition duration-300 hover:text-teal-400 cursor-pointer"
                    >
                      {faq.question}
                      <span className="text-teal-400">{isOpen ? "−" : "+"}</span>
                    </button>

                    <div
                      id={`faq-${key}`}
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                      }`}
                    >
                  <p
  className="text-gray-400 text-sm"
  dangerouslySetInnerHTML={{ __html: processAnswer(faq.answer) }}
/>

             

                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="mt-8 text-center">
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