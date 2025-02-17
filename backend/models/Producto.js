import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Categoria from "./Categoria.js";
import Usuario from "./Usuario.js";
const Producto = sequelize.define("Producto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stockMinimo: {
    type: DataTypes.INTEGER,
    defaultValue: 5, // 🚨 Alertar si baja de 5
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    references: {
      model: Categoria, // Relación con Categoria
      key: "id",
    },
    onDelete: "CASCADE", // 🔹 Eliminar productos si se elimina la categoría
    onUpdate: "CASCADE",
  },
  usuarioId: {
    // 🔹 También aseguramos el usuario
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "id",
    },
  },
});

export default Producto;
