import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM("admin", "usuario"),
      allowNull: false,
      defaultValue: "usuario",
    },
    lastPasswordChange: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    imagenPerfil: {
      type: DataTypes.BLOB("medium"),
      allowNull: true,
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // ✅ Inicialmente el usuario NO está verificado
    },
    tokenVerificacion: {
      type: DataTypes.STRING, // Guarda el token único
      allowNull: true,
    },
  },
  {
    timestamps: true, // ✅ createdAt, updatedAt
    paranoid: true, // ✅ Habilita deletedAt para soft deletes
  }
);

export default Usuario;
