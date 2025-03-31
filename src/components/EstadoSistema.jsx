import { useState, useEffect } from "react";
import { api } from "../services/api";
import { CheckCircle, AlertTriangle, XCircle, Clock, RefreshCcw, Loader, HelpCircle } from "lucide-react";

const EstadoSistema = () => {
  const [sistema, setSistema] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const { data } = await api.get("/estado");
        setSistema(data);
        setUltimaActualizacion(new Date());
      } catch (error) {
        console.error("Error al obtener estado del sistema:", error);
        setSistema([{ servicio: "Error en el sistema", estado: "error", tiempo_respuesta: "N/A" }]);
      }
    };

    fetchEstado();
    const interval = setInterval(fetchEstado, 15000);
    return () => clearInterval(interval);
  }, []);

  const getEstado = (estado) => {
    switch (estado) {
      case "operativo":
        return <CheckCircle className="text-green-400 w-5 h-5" />;
      case "mantenimiento":
        return <AlertTriangle className="text-yellow-400 w-5 h-5" />;
      case "error":
        return <XCircle className="text-red-400 w-5 h-5" />;
      case "lento":
        return <Loader className="text-orange-400 w-5 h-5 animate-spin" />;
      case "degradado":
        return <AlertTriangle className="text-orange-400 w-5 h-5" />;
      case "reiniciando":
        return <Loader className="text-blue-400 w-5 h-5 animate-spin" />;
      case "desconocido":
        return <HelpCircle className="text-gray-400 w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <h1 className="text-4xl font-bold text-teal-400 mb-4">Estado del Sistema</h1>
      <p className="text-gray-400 text-lg mb-6">Monitoreo en tiempo real de nuestros servicios.</p>

      {/* Última actualización */}
      <div className="flex items-center gap-2 mb-6 text-gray-400">
        <Clock className="w-5 h-5 text-gray-500" />
        <span>Última actualización: {ultimaActualizacion.toLocaleTimeString()}</span>
        <button onClick={() => setUltimaActualizacion(new Date())} className="text-teal-400 hover:text-teal-300 transition">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabla de Estado */}
      <div className="max-w-3xl w-full bg-gray-900 p-6 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-teal-400 border-b border-gray-700">
              <th className="py-3 px-4">Servicio</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Tiempo de Respuesta</th>
            </tr>
          </thead>
          <tbody>
            {sistema.length > 0 ? (
              sistema.map((servicio, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="py-4 px-4 text-lg">{servicio.servicio}</td>
                  <td className="py-4 px-4 flex justify-center items-center gap-2">
                    {getEstado(servicio.estado)}
                    <span
                      className={`font-semibold ${
                        servicio.estado === "operativo"
                          ? "text-green-400"
                          : servicio.estado === "mantenimiento"
                          ? "text-yellow-400"
                          : servicio.estado === "lento"
                          ? "text-orange-400"
                          : servicio.estado === "degradado"
                          ? "text-orange-400"
                          : servicio.estado === "reiniciando"
                          ? "text-blue-400"
                          : "text-red-400"
                      }`}
                    >
                      {servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-semibold">
                    {servicio.tiempo_respuesta || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 px-4 text-center text-gray-400">
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstadoSistema;
