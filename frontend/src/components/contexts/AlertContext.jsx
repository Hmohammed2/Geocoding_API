import React, { createContext, useState, useContext } from "react";


/**
 * Context to provide alert-related state and methods to the app.
 * @typedef {Object} AlertContextType
 * @property {Object|null} alert - The current alert message and type, or null if no alert is active.
 * @property {function} showAlert - Function to show an alert with a message and type.
 * @property {function} hideAlert - Function to hide the currently displayed alert.
 */
const AlertContext = createContext();

/**
 * AlertProvider component that provides alert state and methods to child components.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The children components to render inside the provider.
 * @returns {React.ReactNode} - The provider component wrapping the children.
 */
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

    /**
   * Shows an alert with a given message and type.
   * @param {string} message - The alert message to display.
   * @param {string} [type="info"] - The type of alert (e.g., "info", "success", "error").
   */
  const showAlert = (message, type = "info") => {
    setAlert({ message, type });

    // Auto-hide alert after 3 seconds
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

/**
 * Custom hook to access alert state and methods.
 * @returns {AlertContextType} - The current alert context values.
 */
export const useAlert = () => useContext(AlertContext);
