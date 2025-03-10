import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Clock, RefreshCcw } from "lucide-react";

const EstadoSistema = () => {
  const [sistema, setSistema] = useState([
    { servicio: "API Principal", estado: "operativo", tiempo: "120ms" },
    { servicio: "Autenticación", estado: "operativo", tiempo: "98ms" },
    { servicio: "Base de Datos", estado: "mantenimiento", tiempo: "300ms" },
    { servicio: "Pasarela de Pago", estado: "error", tiempo: "N/A" },
  ]);

  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  const [historial, setHistorial] = useState([
    { fecha: "10 Mar 2025", incidente: "Mantenimiento de la Base de Datos", estado: "Resuelto" },
    { fecha: "5 Mar 2025", incidente: "Caída del servidor de pagos", estado: "Pendiente" },
    { fecha: "1 Mar 2025", incidente: "Problemas en la autenticación", estado: "Resuelto" },
  ]);

  useEffect(() => {
    // Simulación de actualización de estado del sistema cada 15 segundos
    const interval = setInterval(() => {
      setUltimaActualizacion(new Date());

      setSistema((prevSistema) =>
        prevSistema.map((servicio) => ({
          ...servicio,
          estado:
            Math.random() > 0.9
              ? "error"
              : servicio.estado === "mantenimiento"
              ? "operativo"
              : servicio.estado,
          tiempo: servicio.estado === "error" ? "N/A" : `${Math.floor(Math.random() * 200) + 50}ms`,
        }))
      );
    }, 15000);

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
        <button
          onClick={() => setUltimaActualizacion(new Date())}
          className="text-teal-400 hover:text-teal-300 transition"
        >
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
            {sistema.map((servicio, index) => (
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
                        : "text-red-400"
                    }`}
                  >
                    {servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center font-semibold">{servicio.tiempo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historial de Incidentes */}
      <div className="max-w-3xl w-full bg-gray-900 p-6 rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-semibold text-teal-400 mb-4">📜 Historial de Incidentes</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-teal-400 border-b border-gray-700">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Incidente</th>
              <th className="py-3 px-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((incidente, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-800 transition">
                <td className="py-4 px-4">{incidente.fecha}</td>
                <td className="py-4 px-4">{incidente.incidente}</td>
                <td
                  className={`py-4 px-4 text-center font-semibold ${
                    incidente.estado === "Resuelto" ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {incidente.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstadoSistema;
