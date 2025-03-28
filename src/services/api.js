import axios from "axios";

// Usar la URL de producción desde el .env
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
