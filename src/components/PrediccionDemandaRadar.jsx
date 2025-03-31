import { useMemo } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../components/ui/card";

export default function PrediccionDemandaRadar({ pedidosPorProducto = [] }) {
  const prediccionDemanda = useMemo(() => {
    const agrupado = {}; 

    pedidosPorProducto.forEach((p) => {
      if (!agrupado[p.nombre]) agrupado[p.nombre] = [];
      agrupado[p.nombre].push(p.cantidad);
    });

    return Object.entries(agrupado).map(([nombre, cantidades]) => {
      const promedio = cantidades.reduce((a, b) => a + b, 0) / cantidades.length;
      return {
        nombre,
        prediccion: Math.round(promedio),
      };
    });
  }, [pedidosPorProducto]);

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-800">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          🔮 Predicción de Demanda por Producto
        </h2>

        {prediccionDemanda.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={prediccionDemanda} outerRadius={150}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="nombre" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Radar
                name="Predicción"
                dataKey="prediccion"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderRadius: "8px",
                  border: "none",
                  color: "#fff",
                  fontSize: "0.875rem",
                }}
                formatter={(value, name) => [`${value} uds`, name]}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400">No hay suficientes datos para generar una predicción.</p>
        )}
      </CardContent>
    </Card>
  );
}
