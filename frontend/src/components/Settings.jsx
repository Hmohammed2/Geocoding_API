import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";
import Alert from "./Alert";
import { useAlert } from "./contexts/AlertContext";
import { useNavigate } from "react-router-dom";
/**
 * Settings component allows users to update profile information, manage subscriptions,
 * view API keys, and delete their account.
 *
 * @component
 * @returns {JSX.Element} The rendered Settings component.
 */
const Settings = () => {
  const { user, loading, logout } = useAuth()
  const { alert, showAlert } = useAlert()
  const [formData, setFormData] = useState(
    {
      userName: user.userName,
      email: user.email,
    }); // Separate form state
  const [showApiKey, setShowApiKey] = useState(false); // Toggle API key visibility
  const navigate = useNavigate()
  /**
   * Handles input changes in the form.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handles form submission to update user profile.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/update`,
        { userId: user.userId, userName: formData.userName, email: formData.email }
      );
      console.log("Profile updated!", response.data)
      // Show success alert
      showAlert('Profile has been successfully updated!', 'success');

    } catch (error) {
      console.error("Error creating checkout session:", error);
      // Show error alert
      showAlert(error.message, 'error');
    }
    console.log("Updated Profile:", formData);
  };
  /**
   * Handles account deletion confirmation and request.
   */
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/delete`, {
        data: { userId: user.userId },
      });

      if (response.status === 200) {
        showAlert("Your account has been deleted successfully.", "success");
        logout(); // Log out the user after deletion
        navigate("/login")
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showAlert(error.response?.data?.message || "Failed to delete account", "error");
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  // Fallback in case user is null (e.g., failed auth)
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Error loading user data</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
      {/* Render alert component */}
      {alert && <Alert />}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
      {/* Profile Update Form */}
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-2" htmlFor="userName">Name</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">Save Changes</button>
      </form>

      {/* Delete Account */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-red-600">Danger Zone</h3>
        <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition">Delete My Account</button>
      </div>
    </div>
  );
};

export default Settings;
