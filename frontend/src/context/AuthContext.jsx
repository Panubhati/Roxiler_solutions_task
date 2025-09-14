import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  // ADD TOKEN STATE
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = (userData, tokenValue) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
    setUser(userData);
    setToken(tokenValue);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}