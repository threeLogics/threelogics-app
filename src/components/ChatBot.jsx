import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X } from "lucide-react";

// Función para sanitizar mensajes 
const sanitizeMessage = (text) => {
  return text.trim().replace(/\s+/g, " ").slice(0, 200); 
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

 
  const quickReplies = [
    "Hola",
    "¿Cómo inicio sesión?",
    "¿Cómo me pongo en contacto?",
    "¿Qué es ThreeLogics?",
    "¿Es seguro almacenar mis datos en ThreeLogics?",
    "¿Puedo exportar mis datos?",
    "¿Qué diferencia hay entre un pedido de entrada y uno de salida?",
    "¿Cómo puedo ver los movimientos de inventario?"

  ];

  const API_URL = import.meta.env.VITE_API_URL;

  const sendMessage = async (msg = input) => {
    const sanitizedMessage = sanitizeMessage(msg);
    if (!sanitizedMessage) return;
  
    const userMessage = { role: "user", content: sanitizedMessage };
    setMessages((prev) => [...prev, userMessage]);
  
    try {
      const res = await fetch(`${API_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sanitizedMessage }),
      });
  
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: sanitizeMessage(data.reply) }
      ]);
    } catch (error) {
      console.error("❌ Error en el chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Ocurrió un error, inténtalo más tarde." }
      ]);
    }
  
    setInput(""); 
  };
  

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-teal-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
      <div className="absolute bottom-16 right-0 w-80 bg-gray-900 border border-teal-500 rounded-xl shadow-2xl p-4 flex flex-col text-white">

          <h3 className="text-lg font-bold text-white-700">Chat de Soporte</h3>

          {/* Sugerencias solo al abrir (si no hay mensajes previos) */}
          {messages.length === 0 && (
            <div className="mt-2 mb-2 flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="bg-gray-800 text-white-200 px-2 py-1 text-xs rounded hover:bg-teal-600 hover:text-white transition"

                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Historial de mensajes */}
          <div className="h-60 overflow-y-auto mt-1 space-y-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  msg.role === "user" ? "bg-teal-600/30 text-white self-end text-right" : "bg-gray-800 text-white self-start text-left"
                }`}
              >
                <p className="text-white-700">
                  {msg.role === "user" ? "🧑‍💻" : "🤖"} {msg.content}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Enviar mensaje */}
          <div className="flex mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-gray-800 border border-teal-500 text-white p-2 w-full rounded-l-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
              placeholder="Escribe tu mensaje..."
            />
            <button
              onClick={() => sendMessage()}
              className="bg-teal-600 hover:bg-teal-500 text-white px-3 rounded-r-lg transition"

            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
