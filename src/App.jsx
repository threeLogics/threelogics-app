import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
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
import Ubicaciones from "./pages/Ubicaciones";
import Page404 from "./components/Page404";
import LoadingScreen from "./components/LoadingScreen";
import Perfil from "./components/Perfil";
import VerificarCuenta from "./pages/VerificarCuenta";
import FAQ from "./components/FAQ";
import Community from "./components/Community";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatBot from "./components/ChatBot";
import TermsConditions from "./components/TermsConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import EstadoSistema from "./components/EstadoSistema";
import ResetPassword from "./components/ResetPassword";
import supabase from "./supabaseClient";
import ConfiguracionInicial from "./pages/ConfiguracionInicial";





const PrivateRoute = () => {
  const { usuario } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [configuracionCompleta, setConfiguracionCompleta] = useState(false);

  useEffect(() => {
    const verificarConfiguracion = async () => {
      if (!usuario) return;

      const { data, error } = await supabase
        .from("usuario_ubicaciones")
        .select("*")
        .eq("user_id", usuario.id)
        .single();

      if (error) {
        console.error("Error al verificar configuración:", error);
      }

      setConfiguracionCompleta(!!data);
      setLoading(false);
    };

    verificarConfiguracion();
  }, [usuario]);

  if (loading) return <LoadingScreen />;

  if (!configuracionCompleta) {
    return <Navigate to="/configuracion-inicial" />;
  }

  return usuario ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  const { usuario } = useContext(AuthContext);

  return (
    <div>
      <Navbar />
      <ChatBot /> 
      <Routes>
        {/* 🔹 Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />{" "}
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Página de Preguntas Frecuentes */}
        <Route path="/comunidad" element={<Community />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/estado-sistema" element={<EstadoSistema />} />
        

        <Route
          path="/login"
          element={usuario ? <Navigate to="/productos" /> : <Login />}
        />
        <Route
          path="/register"
          element={usuario ? <Navigate to="/productos" /> : <Register />}
        />
        <Route path="/verificar-cuenta" element={<VerificarCuenta />} />
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
          <Route path="/ubicaciones" element={<Ubicaciones />} />
        </Route>
        <Route path="/configuracion-inicial" element={<ConfiguracionInicial />} />
        {/* 🔹 Ruta 404 */}
        <Route path="*" element={<Page404 />} />
      </Routes>
      {/* Notificaciones con react-toastify */}
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default App;
