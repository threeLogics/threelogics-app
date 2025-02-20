import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usa la clave segura de Supabase

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; // 🔹 Exportación por defecto
