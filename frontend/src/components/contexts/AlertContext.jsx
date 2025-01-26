import React, { createContext, useState, useContext } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

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

// Custom hook for using alert
export const useAlert = () => useContext(AlertContext);
