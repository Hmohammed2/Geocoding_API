import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../components/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';
import Alert from "../components/Alert";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { resetPassword } = useAuth(); // Assumes you have a resetPassword function in your Auth context
  const { alert, showAlert } = useAlert();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      showAlert("Password reset email sent. Please check your inbox.", "success");
      // Optionally, navigate back to the login page after successful request
      navigate('/login');
    } catch (error) {
      showAlert(error.message, "error");
      console.error("Password reset failed:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Your Password - SimpleGeoAPI</title>
        <meta name="description" content="Reset your password on SimpleGeoApi. Enter your email address to receive password reset instructions." />
        <meta name="keywords" content="password reset, forgot password, SimpleGeoAPI" />
        <meta property="og:title" content="Reset Your Password - SimpleGeoAPI" />
        <meta property="og:description" content="Reset your password on SimpleGeoApi. Enter your email address to receive password reset instructions." />
        <meta property="og:image" content="URL_to_image" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://simplegeoapi.com/forgot-password" />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        {alert && <Alert />}
        <div className="w-96 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
          <h1 className="text-4xl text-center font-semibold text-gray-800 mb-6">
            Reset Password
          </h1>
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-200"
              >
                Send Reset Instructions
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
