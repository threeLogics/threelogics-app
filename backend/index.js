import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Configuración de variables de entorno
dotenv.config();

// Importar rutas (ya no importamos modelos)
import categoriasRoutes from "./routes/categorias.js";
import productosRoutes from "./routes/productos.js";
import movimientosRoutes from "./routes/movimientos.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import pedidosRoutes from "./routes/pedidos.js";
import usuarioRoutes from "./routes/usuarios.js";
import newsletterRoutes from "./routes/newsletter.js";
import communityRoutes from "./routes/communityRoutes.js"; // 🔹 Importar las rutas
import chatbotRoutes from "./routes/chatbotRoutes.js";

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
app.use("/api/community", communityRoutes);
app.use("/api/chatbot", chatbotRoutes); // ✅ Agregar el chatbot

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente con Supabase 🚀");
});

// 🔹 Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
