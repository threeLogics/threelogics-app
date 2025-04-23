import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import supabase from "../supabaseClient";

const sanitizeMessage = (text) => {
  return text.trim().replace(/\s+/g, " ").slice(0, 200);
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasLoadedInitialSuggestions, setHasLoadedInitialSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchSugerencias = async () => {
    try {
      const { data, error } = await supabase
        .from("conocimientos")
        .select("pregunta")
        .order("pregunta", { ascending: false });

      if (!error && data.length > 0) {
        const random = data.sort(() => 0.5 - Math.random()).slice(0, 3);
        setSugerencias(random.map((item) => item.pregunta));
        setHasLoadedInitialSuggestions(true);
      }
    } catch (err) {
      console.error("❌ Error al cargar sugerencias:", err);
    }
  };

  const sendMessage = async (msg = input) => {
    const sanitizedMessage = sanitizeMessage(msg);
    if (!sanitizedMessage) return;

    const userMessage = { role: "user", content: sanitizedMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true); // Comienza "escribiendo..."

    try {
      const res = await fetch(`${API_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sanitizedMessage }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: sanitizeMessage(data.reply) },
      ]);
      fetchSugerencias();
    } catch (error) {
      console.error("❌ Error en el chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Ocurrió un error, inténtalo más tarde." },
      ]);
    } finally {
      setIsTyping(false); // Finaliza "escribiendo..."
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasLoadedInitialSuggestions) {
      fetchSugerencias();
    }
  }, [isOpen]);

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

          {((messages.length === 0 && sugerencias.length > 0) ||
            (messages.length > 0 && messages[messages.length - 1]?.role === "bot")) && (
            <div className="mt-2 mb-2 flex flex-wrap gap-2">
              {sugerencias.map((text, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(text)}
                  className="bg-gray-800 text-white-200 px-2 py-1 text-xs rounded hover:bg-teal-600 hover:text-white transition"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <div className="h-60 overflow-y-auto mt-1 space-y-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-teal-600/30 text-white self-end text-right"
                    : "bg-gray-800 text-white self-start text-left"
                }`}
              >
                <p className="text-white-700">
                  {msg.role === "user" ? "🧑‍💻" : "🤖"} {msg.content}
                </p>
              </div>
            ))}
            {isTyping && (
              <div className="text-sm italic text-gray-400 text-left">
                🤖 Escribiendo...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
              className="bg-teal-600 hover:bg-teal-500 text-white px-3 rounded-r-lg transition cursor-pointer"
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
