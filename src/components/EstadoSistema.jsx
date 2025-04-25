import { useState, useEffect } from "react";
import { api } from "../services/api";
import { CheckCircle, AlertTriangle, XCircle, Clock, RefreshCcw, Loader, HelpCircle } from "lucide-react";
import MetaData from '../components/MetaData'; 


const EstadoSistema = () => {
  const [sistema, setSistema] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        setIsLoading(true); 
        const { data } = await api.get("/estado");
        setSistema(data);
      } catch (error) {
        console.error("Error al obtener estado del sistema:", error);
        setSistema([{ servicio: "Error en el sistema", estado: "error", tiempo_respuesta: "N/A" }]);
      } finally {
        setIsLoading(false);
        setUltimaActualizacion(new Date());
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
           <MetaData
        title="Estado del Sistema | ThreeLogics"
        description="Monitorea en tiempo real el estado de los servicios y la infraestructura de ThreeLogics."
        imageUrl="https://threelogicsapp.vercel.app/og-image.png"
        keywords="estado del sistema, monitoreo, infraestructura, estado de los servicios, ThreeLogics"
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-teal-400 mb-4">Estado del Sistema</h1>
      <p className="text-sm sm:text-lg text-gray-400 mb-6 text-center">
        Monitoreo en tiempo real de nuestros servicios.
      </p>

      <div className="flex items-center gap-2 mb-6 text-sm sm:text-base text-gray-400">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        <span>Última actualización: {ultimaActualizacion.toLocaleTimeString()}</span>
        <button onClick={() => setUltimaActualizacion(new Date())} className="text-teal-400 hover:text-teal-300 transition">
          <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] max-w-3xl mx-auto bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md">
          {isLoading ? ( // <-- aquí el cambio
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-10 h-10 text-teal-400 animate-spin" />
              <p className="mt-4 text-gray-400">Cargando estado del sistema...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm sm:text-base">
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
                      <td className="py-3 px-4">{servicio.servicio}</td>
                      <td className="py-3 px-4 flex justify-center items-center gap-2">
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
                      <td className="py-3 px-4 text-center font-semibold">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadoSistema;
