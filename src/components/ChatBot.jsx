import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X } from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null); // 📌 Referencia para el scroll

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const res = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prevMessages) => [...prevMessages, { role: "bot", content: data.reply }]);
    } catch (error) {
      console.error("❌ Error en el chatbot:", error);
    }

    setInput("");
  };

  // 📌 Hacer scroll automático al final cuando hay un nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Función para enviar mensaje con "Enter"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Botón flotante para abrir/cerrar el chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-teal-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105 cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Contenedor del chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border rounded-lg shadow-2xl p-4 flex flex-col">
          <h3 className="text-lg font-bold text-gray-700">Chat de Soporte</h3>
          
          {/* Contenedor de mensajes con scroll automático */}
          <div className="h-60 overflow-y-auto mt-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  msg.role === "user" ? "bg-blue-100 self-end text-right" : "bg-gray-100 self-start text-left"
                }`}
              >
                <p className="text-gray-700">{msg.role === "user" ? "🧑‍💻" : "🤖"} {msg.content}</p>
              </div>
            ))}
            {/* 📌 Último mensaje como referencia para hacer scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input para escribir mensaje */}
          <div className="flex mt-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress} // 🔹 Detectar tecla "Enter"
              className="border p-2 w-full rounded-l-lg text-gray-700"
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={sendMessage} className="bg-teal-500 text-white px-4 rounded-r-lg flex items-center">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
