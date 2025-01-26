import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './components/contexts/AuthContext.jsx'
import { AlertProvider } from './components/contexts/AlertContext.jsx'
import './index.css'
import App from './App.jsx'

// Allows deeply nested context objects
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
