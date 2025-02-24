import React, { useState, useEffect } from "react";
import Subscription from "./pages/Subscription"
import LandingPage from "./pages/LandingPage"
import Register from "./pages/Register"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Documentation from "./pages/Documentation"
import ContactPage from "./pages/ContactPage"
import Footer from "./components/Footer"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginConfirmation from "./pages/LoginConfirmation"
import PaymentConfirmation from "./pages/PaymentConfirmation"
import RegisterConfirmation from "./pages/RegisterConfirmation"
import TermsAndServices from "./pages/TermsAndServices"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ChangePasswordPage from "./pages/ChangePasswordPage"
import UserPanel from "./pages/UserPanel"
import FeedbackModal from "./components/FeedbackModal"

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Set a timer to open the modal after 60 seconds
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 60000); // 60000ms = 60 seconds

    // Cleanup timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitFeedback = () => {
    alert("Thank you for your feedback!");
    setIsModalOpen(false);
  };

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />{" "}
          <Route path="/change-password/:token" element={<ChangePasswordPage />} />{" "}
          <Route path="/payment-confirm" element={<PaymentConfirmation />} />{" "}
          <Route path="/register-confirm" element={<RegisterConfirmation />} />{" "}
          <Route path="/documentation" element={<Documentation />} />{" "}
          <Route path="/contact" element={<ContactPage />} />{" "}
          <Route path="/profile" element={<UserPanel />} />{" "}
          <Route path="/terms" element={<TermsAndServices />} />{" "}
        </Routes>
        <Footer />
        {/* Render the feedback modal if open */}
        {isModalOpen && (
          <FeedbackModal 
            onClose={handleCloseModal} 
            onSubmit={handleSubmitFeedback} 
          />
        )}
      </>
    </BrowserRouter>
  )
}

export default App
