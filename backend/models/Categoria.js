import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Usuario from "./Usuario.js"; // Asegúrate de importar el modelo de Usuario

const Categoria = sequelize.define(
  "Categoria",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario, // Relación con el modelo Usuario
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "categorias",
    timestamps: true,
  }
);

export default Categoria;
