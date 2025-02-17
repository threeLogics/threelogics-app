import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

export default function PasarelaPago() {
  const { id } = useParams();
  const pedidoId = isNaN(parseInt(id, 10)) ? null : parseInt(id, 10);
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const { usuario } = useContext(AuthContext);
  const cardHolderName = usuario?.nombre || "Usuario Desconocido";
  


  // Datos correctos que deben coincidir
  const validCardNumber = "4000-1234-5678-9010";
  const validExpiryDate = "12/25";
  const validCvv = "123";

  if (!pedidoId) {
    console.error("❌ ID del pedido no es válido.");
    return <p className="text-center text-red-500">Pedido no válido.</p>;
  }

  // 📌 Formatear número de tarjeta (####-####-####-####)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Solo números
    value = value.replace(/(\d{4})/g, "$1-").trim(); // Agrega guion cada 4 números
    value = value.slice(0, 19); // Limita a 19 caracteres (16 números + 3 guiones)
    setCardNumber(value);
  };

  // 📌 Formatear fecha de expiración (MM/YY)
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4); // Agrega '/' después de los primeros 2 dígitos
    }
    value = value.slice(0, 5); // Limita a 5 caracteres (MM/YY)
    setExpiryDate(value);
  };

  const procesarPago = async () => {
    if (cardNumber !== validCardNumber || expiryDate !== validExpiryDate || cvv !== validCvv) {
      toast.error("❌ Error: Los datos de la tarjeta son incorrectos.");
      return;
    }

    setProcesando(true);
    toast.info("💳 Procesando pago...");

    setTimeout(async () => {
      try {
        const response = await api.get(`/pedidos/${pedidoId}`);
        if (response.data.estado !== "pagar") {
          toast.error("❌ Error: El pedido no está listo para pagar.");
          setProcesando(false);
          return;
        }

        await api.put(`/pedidos/${pedidoId}/estado`, { estado: "enviado" });
        toast.success("✅ Pago realizado con éxito. Pedido enviado.");
        navigate("/pedidos");
      } catch (error) {
        console.error("❌ Error al procesar el pago:", error);
        toast.error("❌ Error al procesar el pago.");
      } finally {
        setProcesando(false);
      }
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-black flex justify-center items-center pt-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="p-8 max-w-md w-full bg-gray-900 text-white rounded-lg shadow-2xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-3xl font-bold text-teal-400 mb-6 text-center"
        >
          💳 Simulación de Pago
        </motion.h1>

        <p className="text-gray-400 text-center mb-4">
          Estás a punto de pagar el pedido{" "}
          <span className="font-bold text-white">#{id}</span>. Ingresa los datos
          de tu tarjeta y confirma el pago.
        </p>

      {/* 💳 Tarjeta de crédito interactiva */}
<motion.div
  className="relative w-full h-40 cursor-pointer"
  onClick={() => setIsFlipped(!isFlipped)}
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6 }}
  style={{ transformStyle: "preserve-3d", perspective: 1000 }} // Agregar perspectiva para el efecto 3D
>
  {/* Lado frontal */}
  <div
    className="absolute w-full h-full bg-gradient-to-r from-gray-800 to-gray-700 p-5 rounded-lg shadow-lg"
    style={{ backfaceVisibility: "hidden" }}
  >
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-white">Visa</h2>
      <img src="./visa.webp" alt="Visa Logo" className="w-12 h-8 opacity-75" />
    </div>
    <p className="text-lg font-mono tracking-widest text-white mt-2">
      4000 1234 5678 9010
    </p>
    <div className="flex justify-between items-center mt-3">
      <p className="text-sm text-gray-300">
        Titular:{" "}
        <span className="font-semibold text-white">{cardHolderName}</span>
      </p>
      <p className="text-sm text-gray-300">
        Exp: <span className="font-semibold text-white">12/25</span>
      </p>
    </div>
  </div>

  {/* Lado trasero - CVV */}
  <div
    className="absolute w-full h-full bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-lg shadow-lg flex flex-col justify-center"
    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
  >
    <div className="w-full h-8 bg-gray-700"></div> {/* Barra negra */}
    <p className="text-sm text-gray-300 mt-4">Código de Seguridad (CVV)</p>
    <p className="text-xl font-bold tracking-wider text-white bg-gray-600 p-2 rounded-md text-center w-20 mx-auto">
      {cvv || "123"}
    </p>
  </div>
</motion.div>

        {/* 📌 Formulario de pago */}
        <form className="grid gap-4 mt-6">
          <input
            type="text"
            placeholder="👤 Nombre del titular"
            className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            value={cardHolderName}
            readOnly
          />

          <input
            type="text"
            placeholder="💳 Número de tarjeta"
            className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            required
          />

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="📅 Expiración (MM/YY)"
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg w-1/2 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              maxLength={5}
              required
            />

            <input
              type="text"
              placeholder="🔐 CVV"
              className="border border-gray-700 bg-gray-800 text-white p-3 rounded-lg w-1/2 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              maxLength={3}
              required
            />
          </div>
        </form>

        {/* 🔥 Botón de Confirmar Pago */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={procesarPago}
          className="mt-5 w-full bg-green-500 text-black py-3 rounded-lg hover:bg-green-600 transition cursor-pointer" 
          disabled={procesando}
        >
          {procesando ? "Procesando..." : "💳 Confirmar Pago"}
        </motion.button>
      </motion.div>
    </div>
  );
}
