import { useEffect, useState } from "react";
import { api } from "../services/api";

function TarjetaResumen() {
  const [resumen, setResumen] = useState({
    totalPedidos: 0,
    totalVendido: 0,
    totalProductosMovidos: 0,
  });

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await api.get("/pedidos/resumen");

        setResumen(res.data);
      } catch (error) {
        console.error("❌ Error al cargar el resumen:", error);
      }
    };

    fetchResumen();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-900 p-6 rounded-xl shadow-md text-center border border-teal-500">
        <h3 className="text-teal-400 text-lg font-bold">📦 Total Pedidos</h3>
        <p className="text-white text-2xl mt-2">{resumen.totalPedidos}</p>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl shadow-md text-center border border-blue-500">
        <h3 className="text-blue-400 text-lg font-bold">💰 Total Vendido</h3>
        <p className="text-white text-2xl mt-2">${resumen.totalVendido.toFixed(2)}</p>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl shadow-md text-center border border-green-500">
      <h3 className="text-green-400 text-lg font-bold">📥 Total Comprado</h3>
      <p className="text-white text-2xl mt-2">
  ${resumen.totalProductosMovidos.toFixed(2)}
</p>

      </div>
    </div>
  );
}

export default TarjetaResumen;