import { useEffect, useState, useContext, useMemo } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import supabase from "../supabaseClient";

import { AreaChart,Area,CartesianGrid , BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell , RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
  } from "recharts";

export default function Dashboard() {
  const { usuario } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (!usuario) return;
    setLoading(true);
    api
      .get("/dashboard/estadisticas")
      .then((res) => {
        if (!res.data) throw new Error("Datos no disponibles");
        setEstadisticas(res.data);
      })
      .catch((err) => {
        console.error("❌ Error al obtener estadísticas:", err);
        setError("❌ No se pudieron cargar los datos.");
      })
      .finally(() => setLoading(false));
  }, [usuario]);
  

  useEffect(() => {
    const obtenerEventos = async () => {
      try {
        const { data, error } = await supabase
          .from("movimientos")
          .select(`
            id,
            tipo,
            fecha,
            productos (nombre)
          `);
  
        if (error) throw error;
  
        const eventosFormateados = data.map((mov) => ({
          title: `${mov.tipo === "entrada" ? "Entrada" : "Salida"} - ${mov.productos?.nombre || "Producto"}`,
          date: mov.fecha.split("T")[0],
          color: mov.tipo === "entrada" ? "#00C49F" : "#FF8042",
        }));
  
        setEventos(eventosFormateados);
      } catch (err) {
        console.error("❌ Error cargando eventos desde Supabase:", err);
      }
    };
  
    obtenerEventos();
  }, []);
  const movimientosEntrada = Number(estadisticas?.movimientosEntrada) || 0;
  const movimientosSalida = Number(estadisticas?.movimientosSalida) || 0;
  
  const colores = [
    "#0088FE", 
    "#00C49F", 
    "#FFBB28",
    "#FF8042", 
    "#AA00FF", 
    "#FF4B4B", 
    "#4B0082",
    "#00BFFF", 
    "#32CD32", 
    "#FFD700", 
    "#FF69B4", 
    "#8A2BE2", 
    "#A52A2A", 
    "#40E0D0", 
    "#FF7F50"  
  ];
  

  const datosMovimientos = useMemo(
    () => [
      { tipo: "Entrada", cantidad: movimientosEntrada },
      { tipo: "Salida", cantidad: movimientosSalida },
    ],
    [movimientosEntrada, movimientosSalida]
  );

  const productosMasMovidos = useMemo(
    () =>
      Array.isArray(estadisticas?.productosMasMovidos)
        ? estadisticas.productosMasMovidos.map((prod) => ({
          nombre: prod?.nombre || "Desconocido",

            total: Number(prod.total) || 0,
          }))
        : [],
    [estadisticas]
  );
  const stockDistribucion = useMemo(() => {
    return Array.isArray(estadisticas?.productosStock)
      ? estadisticas.productosStock.map((prod) => ({
          nombre: prod.nombre || "Desconocido",
          total: Number(prod.cantidad) || 0,
        }))
      : [];
  }, [estadisticas]);
  
  const distribucionCategorias = estadisticas?.distribucionCategorias || [];

  const ultimaFechaMovimiento = eventos.length > 0
  ? eventos.reduce((max, ev) => ev.date > max ? ev.date : max, eventos[0].date)
  : null;
  const productoMasMovido = productosMasMovidos.length > 0 ? productosMasMovidos[0] : null;
  const productosBajoStock = estadisticas?.productosStock?.filter(prod => prod.cantidad <= 5) || [];
  const movimientosEntradaMesAnterior = Number(estadisticas?.movimientosEntradaMesAnterior) || 0;

  const variacionMensual = ((movimientosEntrada - movimientosEntradaMesAnterior) / Math.max(1, movimientosEntradaMesAnterior) * 100).toFixed(1);

  const descargarPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/dashboard/reporte-pdf", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte_movimientos.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("❌ Error al descargar el PDF:", err);
      setError("❌ No se pudo descargar el reporte.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl"
        >
          🔄 Cargando estadísticas...
        </motion.div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen p-6 pt-20 bg-black text-white space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-teal-400">📊 Dashboard</h1>
        <Button onClick={descargarPDF} className="bg-blue-600 hover:bg-blue-700">
          📥 Descargar PDF
        </Button>
      </div>

{/* 🔹 Métricas Rápidas */}
<div className="grid md:grid-cols-3 gap-4">
  <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
    <CardContent className="p-6">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">📦 Total Productos</h2>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas?.totalProductos}</p>
    </CardContent>
  </Card>

  <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
    <CardContent className="p-6">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">📊 Movimientos (30 días)</h2>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas?.totalMovimientos}</p>
    </CardContent>
  </Card>

  <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
    <CardContent className="p-6">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">📦 Stock Total</h2>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas?.totalStock}</p>
    </CardContent>
  </Card>
</div>

      <Card className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg rounded-xl">
  <CardContent className="p-8">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
      📈 Productos Más Movidos
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={productosMasMovidos}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6600" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#ff6600" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
        <XAxis
  dataKey="nombre"
  stroke="#9ca3af"
  tick={{ fontSize: 12 }}
  angle={-25}                 // 👈 Inclina las etiquetas
  textAnchor="end"            // 👈 Las alinea al final
  tickMargin={12}             // 👈 Añade separación
  height={50}                 // 👈 Da más espacio para etiquetas largas
/>


        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "0.875rem",
          }}
          formatter={(value, name) => [`${value} movimientos`, "Total"]}
        />

        <Area
          type="monotone"
          dataKey="total"
          stroke="#ff6600"
          strokeWidth={2.5}
          fill="url(#areaGradient)"
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  {/* 🔄 Entradas vs Salidas */}
  <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
    <CardContent className="p-6">
      <h2 className="text-2xl font-bold mb-12 text-gray-800 dark:text-white flex items-center gap-2">
        🔄 Entradas vs Salidas
      </h2>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={datosMovimientos}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          barCategoryGap={20}
        >
          <XAxis type="number" stroke="#cbd5e1" />
          <YAxis
            type="category"
            dataKey="tipo"
            stroke="#cbd5e1"
            width={80}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "gray",
              borderRadius: "8px",
              border: "none",
              color: "#fff",
              fontSize: "0.875rem",
            }}
          />
          <Bar
            dataKey="cantidad"
            radius={[8, 8, 8, 8]}
            isAnimationActive={true}
            label={{
              position: "right",
              fill: "#334155",
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            {datosMovimientos.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.tipo === "Entrada" ? "#10b981" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* 📦 Distribución de Stock */}
  <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
    <CardContent className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        📦 Distribución de Stock
      </h2>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            <linearGradient id="stockGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00C49F" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#0088FE" stopOpacity={0.9} />
            </linearGradient>
          </defs>

          <Pie
            data={stockDistribucion}
            dataKey="total"
            nameKey="nombre"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            labelLine={false}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(1)}%)`
            }
            stroke="#fff"
            strokeWidth={1}
          >
            {stockDistribucion.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colores[index % colores.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "gray",
              borderRadius: "8px",
              border: "none",
              color: "#fff",
              fontSize: "0.875rem",
            }}
            formatter={(value, name) => [`${value} unidades`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>

<Card>
  <CardContent className="p-6">
  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">📚 Stock por Categoría</h2>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={distribucionCategorias}>
        <defs>
          <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="nombre" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#00C49F"
          fillOpacity={1}
          fill="url(#colorStock)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


<Card className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-xl rounded-lg">
  <CardContent className="p-6 space-y-3">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      📈 Resumen del Mes
    </h2>

    {/* Movimientos */}
    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">📥 Entradas</span>
      <span className="font-semibold">{movimientosEntrada}</span>
    </div>

    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">📤 Salidas</span>
      <span className="font-semibold">{movimientosSalida}</span>
    </div>

    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">📦 Total Movimientos</span>
      <span className="font-bold text-lg">{estadisticas?.totalMovimientos}</span>
    </div>

    {/* Promedio diario */}
    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">🔁 Promedio diario</span>
      <span className="font-semibold">{(estadisticas?.totalMovimientos / 30).toFixed(1)}</span>
    </div>

    {/* Último movimiento */}
    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">⏳ Último movimiento</span>
      <span className="font-semibold">{ultimaFechaMovimiento ? new Date(ultimaFechaMovimiento).toLocaleString() : "-"}</span>
    </div>

    {/* Ratio entrada/salida */}
    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">🧮 Ratio entrada/salida</span>
      <span className="font-semibold">{(movimientosEntrada / Math.max(1, movimientosSalida)).toFixed(2)} : 1</span>
    </div>

    {/* Producto más movido */}
    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">🛒 Más movido</span>
      <span className="font-semibold">{productoMasMovido?.nombre || "-"}</span>
    </div>



    {/* Bajo stock */}
    <div className="flex justify-between text-sm border-b border-white/30 pb-2">
      <span className="flex items-center gap-2">🚨 Bajo stock</span>
      <span className="font-semibold">{productosBajoStock?.length || 0} productos</span>
    </div>

    {/* Comparativa con el mes anterior (simulada) */}
    <div className="flex justify-between text-sm">
      <span className="flex items-center gap-2">📉 Variación mensual</span>
      <span className="font-semibold">{variacionMensual > 0 ? `+${variacionMensual}% más entradas` : `${variacionMensual}% menos entradas`}</span>

    </div>
  </CardContent>
</Card>



    
{/* 📅 Mini Calendario de Actividad */}
<Card className="bg-white dark:bg-gray-900 text-black dark:text-white mt-6 shadow-xl rounded-lg">
  <CardContent className="p-6">
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📅 Calendario de Actividad</h2>
    <div className="rounded-lg overflow-hidden">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        weekends={true}
        dateClick={(info) => alert(`📅 Has hecho clic en: ${info.dateStr}`)}
        events={eventos} // ← Asegúrate que esto venga del useEffect
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        dayMaxEventRows={2}
        eventDisplay="block"
        eventClassNames={() =>
          "bg-blue-500 text-white px-2 py-1 rounded shadow-md text-xs font-medium"
        }
        className="text-sm bg-white dark:bg-gray-900"
      />
    </div>
  </CardContent>
</Card>


    </div>
  );
}