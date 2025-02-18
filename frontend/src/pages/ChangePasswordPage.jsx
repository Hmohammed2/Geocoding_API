import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../components/contexts/AuthContext';
import { useAlert } from '../components/contexts/AlertContext';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';

const ChangePasswordPage = () => {
  const { token } = useParams()
  const { changePassword } = useAuth(); // Ensure changePassword is implemented in your Auth context
  const { alert, showAlert } = useAlert();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // Validate new password and confirmation match
    if (newPassword !== confirmPassword) {
      showAlert("New password and confirmation do not match.", "error");
      return;
    }

    try {
      await changePassword(token, newPassword);
      showAlert("Password updated successfully.", "success");
      // Redirect to a desired page, e.g., profile or login
      navigate('/login');
    } catch (error) {
      showAlert(error.message, "error");
      console.error("Error changing password:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Change Password - SimpleGeoApi</title>
        <meta name="description" content="Change your account password." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center">Change Password</h2>
          {alert && <Alert />}
          <form onSubmit={handleChangePassword} className="mt-8 space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                placeholder="Re-enter your new password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-indigo-500"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;
