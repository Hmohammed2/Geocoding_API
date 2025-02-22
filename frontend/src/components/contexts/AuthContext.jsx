import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Context to provide authentication-related data and methods to the app.
 * @typedef {Object} AuthContextType
 * @property {Object|null} user - The current authenticated user or null if not authenticated.
 * @property {boolean} loading - A boolean indicating if the authentication state is still being loaded.
 * @property {function} login - Function to log in a user with email and password.
 * @property {function} logout - Function to log out the user.
 */
const AuthContext = createContext();

/**
 * AuthProvider component that provides authentication state and methods to child components.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The children components to render inside the provider.
 * @returns {React.ReactNode} - The provider component wrapping the children.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure Axios sends cookies with every request
  axios.defaults.withCredentials = true;
  /**
   * Verifies the authentication token by making a request to the backend API.
   * @returns {Promise<Object|null>} - A promise that resolves to the verified user object if valid, or null if verification fails.
   */
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
  /**
   * Verifies the token and fetches additional user data from the backend.
   * @returns {Promise<void>} - Resolves once the user data has been fetched or failed.
   */
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

  /**
   * Logs in the user with email and password.
   * @param {string} email - The email address of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<void>} - Resolves once login is successful and token verification is done.
   * @throws {Error} - Throws an error if the login fails.
   */

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
    /**
   * Logs out the current user and clears the user state.
   * @returns {Promise<void>} - Resolves once the user has been logged out.
   * @throws {Error} - Throws an error if logout fails.
   */
  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`);
      setUser(null); // Clear user state
      console.log("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

   /**
   * Sends a password reset email by calling the backend endpoint.
   * The backend endpoint should handle email generation and sending.
   *
   * @param {string} email - The email address of the user who wants to reset their password.
   * @returns {Promise<Object>} - Returns response data if successful.
   * @throws {Error} - Throws an error if the process fails.
   */
   const resetPassword = async (email) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
        { email }
      );
      if (response.status === 200) {
        console.log("Reset password email sent");
        return response.data;
      } else {
        throw new Error("Reset password failed!");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      throw new Error("Reset password process failed!");
    }
  };

  /**
   * Changes the user's password.
   *
   * @param {string} oldPassword - The user's current password.
   * @param {string} newPassword - The new password the user wants to set.
   * @returns {Promise<Object>} - The response data from the backend.
   * @throws {Error} - Throws an error if the password change process fails.
   */
  const changePassword = async (token, newPassword) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password/${token}`,
        { newPassword }
      );
      if (response.status === 200) {
        console.log("Password changed successfully");
        return response.data;
      } else {
        throw new Error("Change password failed!");
      }
    } catch (error) {
      console.error("Change password error:", error);
      throw new Error("Change password process failed!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication state and methods.
 * @returns {AuthContextType} - The current authentication context values.
 */
export const useAuth = () => useContext(AuthContext);
