import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

// ==================================================
// 🔥 Initialize Context
// ==================================================
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ==================================================
  // 🔥 Load Token on Startup
  // ==================================================
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_data");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ==================================================
  // 🔥 Login Action
  // ==================================================
  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    navigate("/dashboard");
  };

  // ==================================================
  // 🔥 Logout Action
  // ==================================================
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth anywhere easily
export const useAuth = () => useContext(AuthContext);
