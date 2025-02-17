import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GraficoBarras = ({ titulo, datos, dataKey, color }) => (
  <div>
    <h2 className="text-white font-bold mt-5">{titulo}</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={datos}>
        <XAxis dataKey="tipo" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

GraficoBarras.propTypes = {
  titulo: PropTypes.string.isRequired,
  datos: PropTypes.array.isRequired,
  dataKey: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default GraficoBarras;
