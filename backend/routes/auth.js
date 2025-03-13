import express from "express";
import {
  register,
  login,
  logout,
  getUser,
  recoverPassword,
  updatePassword, // ✅ Agregamos esta función al router
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user", getUser);
router.post("/recover-password", recoverPassword);
router.post("/update-password", updatePassword);

export default router; // ✅ Exportamos por defecto
