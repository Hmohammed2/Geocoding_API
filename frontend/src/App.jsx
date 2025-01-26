import Subscription from "./pages/Subscription"
import LandingPage from "./pages/LandingPage"
import Register from "./pages/Register"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Documentation from "./pages/Documentation"
import ContactPage from "./pages/ContactPage"
import Footer from "./components/Footer"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout"
import LoginConfirmation from "./pages/LoginConfirmation"
import PaymentConfirmation from "./pages/PaymentConfirmation"
import RegisterConfirmation from "./pages/RegisterConfirmation"

function App() {

  return (
    <BrowserRouter>
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />{" "}
          <Route path="/home" element={<LandingPage />} />{" "}
          <Route path="/pricing" element={<Subscription />} />{" "}
          <Route path="/register" element={<Register />} />{" "}
          <Route path="/login" element={<LoginPage />} />{" "}
          <Route path="/login-confirm" element={<LoginConfirmation />} />{" "}
          <Route path="/payment-confirm" element={<PaymentConfirmation />} />{" "}
          <Route path="/register-confirm" element={<RegisterConfirmation />} />{" "}
          <Route path="/documentation" element={<Documentation />} />{" "}
          <Route path="/contact" element={<ContactPage />} />{" "}
          <Route path="/profile" element={<DashboardLayout />} />{" "}
        </Routes>
        <Footer />
      </>
    </BrowserRouter>
  )
}

export default App
