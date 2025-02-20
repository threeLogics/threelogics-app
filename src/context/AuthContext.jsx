import { createContext } from "react";

export const AuthContext = createContext({
  usuario: null,
  login: () => {},
  logout: () => {},
  actualizarPerfil: () => {},
});
