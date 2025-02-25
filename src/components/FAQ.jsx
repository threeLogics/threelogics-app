import { useState } from "react";
import { Link } from "react-router-dom";

const faqData = [
  {
    category: "General",
    questions: [
      {
        question: "¿Qué es ThreeLogics?",
        answer:
          "ThreeLogics es un sistema de gestión de almacenes diseñado para optimizar y simplificar las tareas logísticas. Permite gestionar inventarios, visualizar y controlar productos de manera eficiente, mejorando la operativa empresarial.",
      },
      {
        question: "¿A quién está dirigido ThreeLogics?",
        answer:
          "Está diseñado principalmente para pequeñas y medianas empresas (pymes) que buscan una solución intuitiva, escalable y asequible para gestionar su inventario y mejorar la logística de sus almacenes.",
      },
    ],
  },
  {
    category: "Funcionalidades",
    questions: [
      {
        question: "¿Qué funcionalidades ofrece ThreeLogics?",
        answer:
          "Gestión de inventario, estados de pedidos, modificación de productos, interfaz intuitiva, autenticación segura y escalabilidad.",
      },
      {
        question: "¿Se pueden modificar los pedidos una vez creados?",
        answer:
          "Sí, ThreeLogics permite modificar los pedidos siempre que estos no hayan sido enviados o completados.",
      },
      {
        question: "¿Cómo funciona el sistema de notificaciones?",
        answer:
          "Cada vez que se agrega o modifica un producto, se genera una notificación automática para alertar a los usuarios sobre los cambios.",
      },
      {
        question: "¿Cómo se actualiza el estado de un pedido?",
        answer:
          "Pendiente: Cuando el pedido está en el carrito.\nPagar: Al ingresar a la pasarela de pago ficticia.\nEnviado: Una vez completado el pago.\nCompletado: Automáticamente después de 24 horas de haber sido enviado.",
      },
    ],
  },
  {
    category: "Tecnología",
    questions: [
      {
        question: "¿Qué tecnologías usa ThreeLogics?",
        answer:
          "Frontend: React con Tailwind CSS.\nBackend: Node.js con Express.\nBase de datos: Supabase.\nInfraestructura: Servidores en la nube con Google Cloud o AWS.",
      },
      {
        question: "¿Es posible integrar ThreeLogics con otras plataformas?",
        answer:
          "Sí, ThreeLogics puede integrarse con otros sistemas mediante APIs para sincronización de datos.",
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
