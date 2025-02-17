import express from "express";
import { suscribirse } from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/suscribirse", suscribirse);

export default router;
