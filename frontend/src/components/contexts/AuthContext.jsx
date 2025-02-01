import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure Axios sends cookies with every request
  axios.defaults.withCredentials = true;

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-token`);
      if (response.status === 200 && response.data.valid) {
        const { userId, username, email, customerId } = response.data;
        const verifiedUser = { userId, username, email, customerId };
        setUser(verifiedUser); // Update user state
        console.log("Token verification successful:", verifiedUser);
        return verifiedUser; // Return verified user object
      } else {
        throw new Error("Token verification failed");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setUser(null); // Clear user on failure
      return null;
    }
  };

  const verifyTokenAndFetchData = async () => {
    setLoading(true); // Start loading
    const verifiedUser = await verifyToken();
    if (verifiedUser) {
      try {
        const results = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/data/${verifiedUser.userId}`);
        setUser({ ...verifiedUser, ...results.data }); // Merge verified user and fetched data
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null); // Clear user data if fetching fails
      }
    }
    setLoading(false); // End loading
  };

  useEffect(() => {
    verifyTokenAndFetchData();
  }, []);

  const login = async (email, password) => {
    console.log(`${import.meta.env.VITE_BACKEND_URL}`)
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });
      if (response.status === 200) {
        await verifyTokenAndFetchData(); // Re-verify token and fetch user data after login
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
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`);
      setUser(null); // Clear user state
      console.log("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
