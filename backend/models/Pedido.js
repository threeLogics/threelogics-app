import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Usuario from "./Usuario.js";

const Pedido = sequelize.define("Pedido", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM(
      "pendiente",
      "pagar",
      "enviado",
      "completado",
      "cancelado"
    ),
    defaultValue: "pendiente",
    allowNull: false,
  },
});

export default Pedido;
