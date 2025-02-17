import express from "express";
import {
  register,
  login,
  recoverPassword,
  verificarCuenta, // ✅ Agregamos esta función al router
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/recover-password", recoverPassword);
router.get("/verificar/:token", verificarCuenta);

export default router; // ✅ Exportamos por defecto
