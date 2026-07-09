import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./api";

// Create the context
const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    loading: true,
});

// Provider component - wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // current logged in user
  const [loading, setLoading] = useState(true); // checking if user is logged in

  // On app load, check if there's a saved token and fetch user
useEffect(() => {
  async function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  checkAuth();
}, []);

  // Called after successful login
  function login(token, userData) {
    localStorage.setItem("token", token);
    setUser(userData);
    setLoading(false);
  }

  // Called on logout
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook - use this in any component to get auth state
export function useAuth() {
  return useContext(AuthContext);
}
