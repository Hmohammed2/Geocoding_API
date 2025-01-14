import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Initial check to see if the user is authenticated
//     verifyToken();
//   }, []);

  // Set up Axios to send cookies with every request
  axios.defaults.withCredentials = true;

  const login = async (userName, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, { userName, password});

      if (response.status === 200) {
        verifyToken(); // Verifies token and fetches user data
      } else {
        throw new Error("Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login process failed!");
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out...");
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`);
      setUser(null);
      console.log("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-token`);
      if (response.status === 200 && response.data.valid) {
        const { userId, username, usertype} = response.data;
        const userData = { userId, username, usertype};
        setUser(userData); // Update user state
        console.log("Token verification successful:", userData);
      } else {
        throw new Error("Token verification failed");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setUser(null); // Ensure user is logged out on error
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};