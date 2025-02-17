import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Producto from "./Producto.js";
import Usuario from "./Usuario.js";

const Movimiento = sequelize.define("Movimiento", {
  tipo: {
    type: DataTypes.ENUM("entrada", "salida"),
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Movimiento;
