
import { useState, useEffect, useContext, useRef } from "react";
import supabase from "../supabaseClient"; 
import { AuthContext } from "../context/AuthContext"; 
import { MessageCircle, User, Send, Clock } from "lucide-react";
import { toast } from "react-toastify";

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
};

const Community = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [answers, setAnswers] = useState({});
  const [newAnswers, setNewAnswers] = useState({});
  const { usuario } = useContext(AuthContext); 
  const questionRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/community/questions`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("La API no devolvió un array válido");
      setQuestions(data);
    } catch (error) {
      console.error("❌ Error al recuperar preguntas:", error);
      setQuestions([]); 
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/community/answers/${questionId}`);
      const data = await res.json();
      setAnswers((prev) => ({ ...prev, [questionId]: data }));
    } catch (error) {
      console.error("❌ Error al recuperar respuestas:", error);
    }
  };

  const handleSendQuestion = async () => {
    if (!newQuestion.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No hay token, usuario no autenticado.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/community/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newQuestion }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido al insertar pregunta");

      setNewQuestion("");
      toast.success("✅ Pregunta enviada");
      fetchQuestions();

      setTimeout(() => {
        questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (error) {
      console.error("❌ Error al insertar pregunta:", error.message);
    }
  };

  const handleSendAnswer = async (questionId) => {
    if (!newAnswers[questionId]?.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No hay token, usuario no autenticado.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/community/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          text: newAnswers[questionId],
          question_id: questionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido al insertar respuesta");

      setNewAnswers({ ...newAnswers, [questionId]: "" });
      toast.success("✅ Respuesta publicada");
      if (!answers[questionId]) await fetchAnswers(questionId);
    } catch (error) {
      console.error("❌ Error al insertar respuesta:", error.message);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-6">
      <div className="max-w-3xl w-full mx-auto p-5 bg-white rounded-lg shadow-lg mt-14">
        <h1 className="text-3xl font-bold text-center text-teal-400 mb-6 mt-6">Comunidad</h1>

        {!usuario && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            ❌ Debes iniciar sesión para enviar preguntas o respuestas.
          </div>
        )}

        <div className="mb-6 flex items-center border-b pb-4">
          <input
            type="text"
            disabled={!usuario}
            className="flex-1 p-3 border rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Escribe una pregunta..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            aria-label="Campo para nueva pregunta"
          />
          <button
            disabled={!usuario}
            onClick={handleSendQuestion}
            className="ml-3 bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((question, idx) => (
            <div
              key={question.id}
              ref={idx === 0 ? questionRef : null}
              className="p-4 bg-gray-100 rounded-lg shadow-sm"
            >
              <div className="flex items-start">
                <User className="w-6 h-6 text-teal-400 mr-3" />
                <div>
                  <p className="font-semibold">{question.nombre_usuario || "Anónimo"}</p>
                  <p className="text-gray-700">{question.text}</p>
                  <p className="text-gray-500 flex items-center text-xs mt-1">
                    <Clock className="w-4 h-4 mr-1" /> {formatDate(question.created_at)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchAnswers(question.id)}
                className="text-teal-500 mt-2 text-sm underline"
              >
                Ver respuestas ({answers[question.id]?.length || 0})
              </button>

              {answers[question.id] && (
                <div className="mt-4 space-y-2 transition-all duration-300">
                  {answers[question.id].map((answer, i) => (
                    <div key={answer.id} className={`p-3 ${i % 2 === 0 ? "bg-white" : "bg-gray-200"} rounded-lg text-sm`}>
                      <p className="font-semibold">{answer.nombre_usuario || "Anónimo"}</p>
                      <p className="text-gray-700">{answer.text}</p>
                      <p className="text-gray-500 flex items-center text-xs mt-1">
                        <Clock className="w-4 h-4 mr-1" /> {formatDate(answer.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center border-t pt-2">
                <input
                  type="text"
                  disabled={!usuario}
                  className="flex-1 p-2 border rounded-lg text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Responde aquí..."
                  value={newAnswers[question.id] || ""}
                  onChange={(e) =>
                    setNewAnswers({ ...newAnswers, [question.id]: e.target.value })
                  }
                  aria-label="Campo de respuesta"
                />
                <button
                  disabled={!usuario}
                  onClick={() => handleSendAnswer(question.id)}
                  className="ml-2 bg-teal-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-teal-400 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
