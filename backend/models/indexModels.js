import sequelize from "../config/database.js"; // ✅ Asegura que se importa primero la base de datos
import Usuario from "./Usuario.js";
import Categoria from "./Categoria.js";
import Producto from "./Producto.js";
import Movimiento from "./Movimiento.js";
import Pedido from "./Pedido.js";
import DetallePedido from "./DetallePedido.js";

// Definir asociaciones después de importar todos los modelos

// 🔹 Asociación: Un usuario puede tener muchos productos
Usuario.hasMany(Producto, { foreignKey: "usuarioId", onDelete: "CASCADE" });
Producto.belongsTo(Usuario, { foreignKey: "usuarioId" });

// 🔹 Asociación: Un usuario puede hacer muchos movimientos
Usuario.hasMany(Movimiento, { foreignKey: "usuarioId", onDelete: "CASCADE" });
Movimiento.belongsTo(Usuario, { foreignKey: "usuarioId" });

// 🔹 Asociación: Un producto pertenece a una categoría
Producto.belongsTo(Categoria, {
  foreignKey: "categoriaId",
  onDelete: "CASCADE",
});
Categoria.hasMany(Producto, { foreignKey: "categoriaId" });

// 🔹 Asociación: Un producto puede tener muchos movimientos
Producto.hasMany(Movimiento, { foreignKey: "productoId", onDelete: "CASCADE" });
Movimiento.belongsTo(Producto, { foreignKey: "productoId" });

// Asociación con Usuario (Un usuario puede hacer varios pedidos)
Pedido.belongsTo(Usuario, { foreignKey: "usuarioId" });
Usuario.hasMany(Pedido, { foreignKey: "usuarioId" });

// Asociación: Un pedido tiene varios detalles
DetallePedido.belongsTo(Pedido, { foreignKey: "pedidoId" });
Pedido.hasMany(DetallePedido, { foreignKey: "pedidoId" });

// Asociación: Un producto puede estar en varios detalles de pedido
DetallePedido.belongsTo(Producto, { foreignKey: "productoId" });
Producto.hasMany(DetallePedido, { foreignKey: "productoId" });

// 🔥 Exportar modelos y Sequelize
export {
  sequelize,
  Usuario,
  Producto,
  Categoria,
  Movimiento,
  Pedido,
  DetallePedido,
};
Usuario.hasMany(Categoria, { foreignKey: "usuarioId" });
Categoria.belongsTo(Usuario, { foreignKey: "usuarioId" });
