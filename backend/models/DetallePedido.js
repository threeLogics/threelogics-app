import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Pedido from "./Pedido.js";
import Producto from "./Producto.js";

const DetallePedido = sequelize.define("DetallePedido", {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

export default DetallePedido;
