import PropTypes from "prop-types";

const PanelEstadistica = ({ titulo, valor, color = "bg-gray-100" }) => {
  return (
    <div className={`p-4 border rounded ${color} text-center`}>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="text-3xl font-bold">{valor}</p>
    </div>
  );
};

PanelEstadistica.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.number.isRequired,
  color: PropTypes.string,
};

export default PanelEstadistica;
