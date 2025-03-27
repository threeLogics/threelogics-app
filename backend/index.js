import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Configuración de variables de entorno
dotenv.config();

// Importar rutas
import categoriasRoutes from "./routes/categorias.js";
import productosRoutes from "./routes/productos.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import pedidosRoutes from "./routes/pedidos.js";
import usuarioRoutes from "./routes/usuarios.js";
import newsletterRoutes from "./routes/newsletter.js";
import communityRoutes from "./routes/communityRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import estadoRoutes from "./routes/estado.js";
import productosVistaRoutes from "./routes/productos.js";
import movimientos from "./routes/movimientos.js";

const app = express();

// 📌 Configurar CORS correctamente
app.use(
  cors({
    origin: "http://localhost:5173", // Permitir peticiones desde el frontend
    credentials: true, // Habilita el envío de cookies o tokens
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos HTTP permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos en las peticiones
  })
);

app.use(express.json());

// Rutas
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/estado", estadoRoutes);
app.use("/api/movimientos", movimientos);
app.use("/api", productosVistaRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente con Supabase 🚀");
});

// 🔹 Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
