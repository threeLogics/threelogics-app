import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dirname } from "path";
// Importar base de datos
import sequelize from "./config/database.js";
import usuarioRoutes from "./routes/usuarios.js";

//Comentario para Prueba GITHUB

// Importar modelos desde indexModels.js (Evita problemas de importaciones circulares)
// Importar base de datos y modelos
import {
  Usuario,
  Producto,
  Categoria,
  Movimiento,
  Pedido,
  DetallePedido,
} from "./models/indexModels.js";
import Suscriptor from "./models/Suscriptor.js";
// Configuración de variables de entorno
dotenv.config();

// Importar modelos

// Importar rutas
import categoriasRoutes from "./routes/categorias.js";
import productosRoutes from "./routes/productos.js";
import movimientosRoutes from "./routes/movimientos.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import pedidosRoutes from "./routes/pedidos.js";
import newsletterRoutes from "./routes/newsletter.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// 🔹 Función para inicializar la BD correctamente
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos realizada exitosamente");

    // 🔄 Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log("🔄 Base de datos sincronizada.");

    // 👤 Verifica si hay un usuario Admin antes de crearlo
    const usuarioExistente = await Usuario.findOne();
    if (!usuarioExistente) {
      await Usuario.create({
        nombre: "Admin",
        email: "admin@example.com",
        password: "admin123",
        rol: "admin",
      });
      console.log("👤 Usuario Admin creado");
    }

    // 🚀 Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error en la inicialización del servidor:", error);
  }
};

// Llamamos a la función para iniciar
startServer();
