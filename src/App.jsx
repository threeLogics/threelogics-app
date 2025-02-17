import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Movimientos from "./pages/Movimientos";
import CrearProducto from "./pages/CrearProducto";
import CrearCategoria from "./pages/CrearCategoria";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import PasarelaPago from "./pages/PasarelaPago";
import Pedidos from "./pages/Pedidos";
import CrearPedido from "./pages/CrearPedido";
import Page404 from "./components/Page404";
import LoadingScreen from "./components/LoadingScreen";
import Perfil from "./components/Perfil";
import VerificarCuenta from "./pages/VerificarCuenta"; // ✅ Importación corregida
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Rutas privadas: Solo accesibles si el usuario está autenticado
const PrivateRoute = () => {
  const { usuario } = useContext(AuthContext);
  return usuario ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  const { usuario } = useContext(AuthContext);

  return (
    <div>
      <Navbar />
      <Routes>
        {/* 🔹 Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={usuario ? <Navigate to="/productos" /> : <Login />}
        />
        <Route
          path="/register"
          element={usuario ? <Navigate to="/productos" /> : <Register />}
        />
        <Route path="/verificar/:token" element={<VerificarCuenta />} />

        {/* 🔹 Otras rutas públicas */}
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/pago/:id" element={<PasarelaPago />} />

        {/* 🔒 Rutas privadas dentro de <PrivateRoute> */}
        <Route element={<PrivateRoute />}>
          <Route path="/productos" element={<Productos />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/crear-producto" element={<CrearProducto />} />
          <Route path="/crear-categoria" element={<CrearCategoria />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/crear-pedido" element={<CrearPedido />} />
        </Route>

        {/* 🔹 Ruta 404 */}
        <Route path="*" element={<Page404 />} />
      </Routes>

      {/* Notificaciones con react-toastify */}
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default App;
