import { useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";
import { AuthContext } from "../context/AuthContext"; // ✅ Importar el contexto de autenticación

import { MessageCircle, User, Send, Clock } from "lucide-react";

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
  const { usuario } = useContext(AuthContext); // Asegurar que el contexto de autenticación está disponible


  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/community/questions");
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error("❌ Error al recuperar preguntas:", error);
    }
  };
  
  
  
  const handleSendQuestion = async () => {
    if (!newQuestion.trim()) return;
  
    try {
      const res = await fetch("http://localhost:5000/api/community/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Token de autenticación
        },
        body: JSON.stringify({ text: newQuestion }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setNewQuestion("");
        fetchQuestions(); // Recargar preguntas
      } else {
        console.error("❌ Error al insertar pregunta:", data.error);
      }
    } catch (error) {
      console.error("❌ Error de red:", error);
    }
  };
  
  
  

  const fetchAnswers = async (questionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/community/answers/${questionId}`);
      const data = await res.json();
      setAnswers((prev) => ({ ...prev, [questionId]: data }));
    } catch (error) {
      console.error("❌ Error al recuperar respuestas:", error);
    }
  };
  
  

  const handleSendAnswer = async (questionId) => {
    if (!newAnswers[questionId]?.trim()) return;
  
    const userId = usuario ? usuario.id : null; // Tomar el ID del usuario autenticado
  
    const { data, error } = await supabase.from("answers").insert([
      {
        text: newAnswers[questionId],
        question_id: questionId,
        usuario_id: userId,
        created_at: new Date(),
      },
    ]);
  
    if (error) console.error("❌ Error al insertar respuesta:", error);
    else {
      setNewAnswers({ ...newAnswers, [questionId]: "" });
      fetchAnswers(questionId);
    }
  };
  

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-6 mt-14">
      <div className="max-w-3xl w-full mx-auto p-5 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-teal-400 mb-6 mt-6">Comunidad</h1>

        <div className="mb-6 flex items-center border-b pb-4">
          <input
            type="text"
            className="flex-1 p-3 border rounded-lg text-gray-700"
            placeholder="Escribe una pregunta..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <button 
            onClick={handleSendQuestion}
            className="ml-3 bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-teal-400 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-start">
                <User className="w-6 h-6 text-teal-400 mr-3" />
                <div>
                <p className="font-semibold">{question.usuarios?.nombre || "Anónimo"}</p>
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
                Ver respuestas
              </button>

              {answers[question.id] && (
                <div className="mt-4 space-y-2">
                  {answers[question.id].map((answer) => (
                    <div key={answer.id} className="p-3 bg-gray-200 rounded-lg text-sm">
    <p className="font-semibold">{answer.usuarios?.nombre || "Anónimo"}</p>
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
                  className="flex-1 p-2 border rounded-lg text-gray-700 text-sm"
                  placeholder="Responde aquí..."
                  value={newAnswers[question.id] || ""}
                  onChange={(e) => setNewAnswers({ ...newAnswers, [question.id]: e.target.value })}
                />
                <button 
                  onClick={() => handleSendAnswer(question.id)}
                  className="ml-2 bg-teal-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-teal-400 transition text-sm"
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
