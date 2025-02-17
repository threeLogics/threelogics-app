import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Suscriptor = sequelize.define(
  "Suscriptor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true, // Guardará `createdAt` automáticamente
  }
);

export default Suscriptor;
