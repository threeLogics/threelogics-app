import { useEffect, useState, useContext, useMemo } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PanelEstadistica from "../components/PanelEstadistica";
import GraficoBarras from "../components/GraficoBarras";

export default function Dashboard() {
  const { usuario } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modoOscuro, setModoOscuro] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    setLoading(true);

    api
      .get("/dashboard/estadisticas")
      .then((response) => {
        if (!response.data) throw new Error("Datos no disponibles");
        setEstadisticas(response.data);
      })
      .catch((error) => {
        console.error("❌ Error al obtener estadísticas:", error);
        setError("❌ No se pudieron cargar los datos.");
      })
      .finally(() => setLoading(false));
  }, [usuario]);

  const contenidoDashboard = useMemo(() => {
    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!estadisticas)
      return <p className="text-red-500">❌ No hay datos disponibles.</p>;
    return null;
  }, [loading, error, estadisticas]);

  if (contenidoDashboard) return contenidoDashboard;

  // ✅ Validación de valores numéricos
  const movimientosEntrada = Number(estadisticas?.movimientosEntrada) || 0;
  const movimientosSalida = Number(estadisticas?.movimientosSalida) || 0;

  // 📊 Datos para el gráfico de Entradas vs Salidas
  const datosMovimientos = [
    { tipo: "Entrada", cantidad: movimientosEntrada },
    { tipo: "Salida", cantidad: movimientosSalida },
  ];

  // 📊 Datos para productos más movidos
  const productosMasMovidos = Array.isArray(estadisticas?.productosMasMovidos)
    ? estadisticas.productosMasMovidos.map((prod) => ({
        nombre: prod?.Producto?.nombre || "Desconocido",
        total: Number(prod.total) || 0,
      }))
    : [];

  // 📥 Descargar PDF
  const descargarPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("⚠️ No tienes permisos para descargar el PDF.");
        return;
      }

      const response = await api.get("/dashboard/reporte-pdf", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte_movimientos.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ PDF descargado correctamente");
    } catch (error) {
      console.error("❌ Error al descargar el PDF:", error);
      setError("❌ No se pudo descargar el reporte.");
      alert("❌ No se pudo descargar el reporte. Inténtalo de nuevo más tarde.");
    }
  };

  return (
    <div
      className={`relative pt-20 p-5 ${
        modoOscuro ? "bg-gray-900 text-gray-300" : "bg-white text-gray-900"
      }`}
    >
      {/* Contenedor del título y el botón en la misma fila */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Dashboard de Estadísticas</h1>

        {/* Botón de Modo Claro/Oscuro */}
        <button
          onClick={() => setModoOscuro(!modoOscuro)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md"
        >
          {modoOscuro ? "🌞 Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </div>

      {/* 📌 Estadísticas principales */}
      <div className="grid grid-cols-3 gap-6">
        <PanelEstadistica
          titulo="📦 Total Productos"
          valor={estadisticas?.totalProductos || 0}
          color="bg-blue-100"
        />
        <PanelEstadistica
          titulo="📊 Movimientos en 30 días"
          valor={estadisticas?.totalMovimientos || 0}
          color="bg-green-100"
        />
        <PanelEstadistica
          titulo="📦 Stock Total"
          valor={estadisticas?.totalStock || 0}
          color="bg-yellow-100"
        />
      </div>

      {/* 📥 Botón para generar reporte PDF */}
      <button
        onClick={descargarPDF}
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg shadow-md focus:ring-2 focus:ring-blue-300 cursor-pointer"
      >
        📥 Descargar Reporte PDF
      </button>

      {/* 📊 Comparación de Entradas vs Salidas */}
      <div className="mt-6 border-b border-gray-700 pb-6">
        <h2 className="text-2xl font-semibold">🔄 Entradas vs Salidas</h2>
        <GraficoBarras
          titulo="🔄 Entradas vs Salidas"
          datos={datosMovimientos}
          dataKey="cantidad"
          color="#4CAF50"
          aria-label="Gráfico de comparación de Entradas y Salidas"
        />
      </div>

      {/* 📊 Productos Más Movidos */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold">🔝 Productos Más Movidos</h2>
        <GraficoBarras
          titulo="🔝 Productos Más Movidos"
          datos={productosMasMovidos}
          dataKey="total"
          color="#F44336"
          aria-label="Gráfico de los productos más movidos"
        />
      </div>

      {/* 🔥 Categoría Más Popular */}
      <div className="mt-6 p-4 border rounded bg-yellow-100">
        <h2 className="text-xl font-semibold">🔥 Categoría Más Popular</h2>
        <p className="text-4xl font-bold">
          {estadisticas?.categoriaMasPopular || "N/A"}
        </p>
      </div>
    </div>
  );
}
