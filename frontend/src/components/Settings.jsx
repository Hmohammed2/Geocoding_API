import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";
import Alert from "./Alert";
import { useAlert } from "./contexts/AlertContext";

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
    const activeSubscription = user?.subscription?.find(sub => sub.status_type === "active");

    const [formData, setFormData] = useState(
        {
            userName: user.userName,
            email: user.email,
            plan: activeSubscription ? activeSubscription.subscription_type : "free" // Default to 'Free Plan' if no subscription is available 
        }); // Separate form state
    const [showApiKey, setShowApiKey] = useState(false); // Toggle API key visibility
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
     * Handles subscription upgrade requests.
     * @param {string} newPlan - The new subscription plan.
     */
    const handleUpgrade = async (newPlan) => {
        if (formData.plan === "pro" && newPlan === "premium") {
            const confirmUpgrade = window.confirm("You are currently on the Pro plan. Are you sure you want to upgrade to Premium?");
            if (!confirmUpgrade) return;
        }

        console.log("Upgrading to:", newPlan);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-checkout-session/`,
                { userId: user.userId, subscriptionType: newPlan }
            );

            console.log("Response data:", response.data);

            if (response.data.message === "Subscription upgraded successfully to Premium!") {
                showAlert("Your subscription has been upgraded to Premium!", "success");
                setFormData({ ...formData, plan: "premium" }); // Update plan state
            }

            if (response.data.url) {
                window.location.href = response.data.url; // Redirect to Stripe checkout
            } else {
                console.log("No URL returned from server");
                showAlert('Failed to get checkout session URL', 'error');
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            showAlert(error.response?.data?.message || 'Something went wrong', 'error');
        }
    };
    /**
     * Handles redirection to manage the user's subscription.
     */
    const handleManageSubscription = async () => {
        const activeSubscription = user?.subscription?.find(sub => sub.status_type !== "canceled");

        if (!activeSubscription || !activeSubscription.customer_id) {
            showAlert("No active subscription to manage.", "error");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/customers/${user.subscription[0].customer_id}`,
                { userId: user.userId }
            );

            if (response.data.url) {
                // Redirect the browser to the billing portal
                window.location.href = response.data.url;
            } else {
                console.error("Failed to retrieve billing portal URL");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
        }
    }
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
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            showAlert(error.response?.data?.message || "Failed to delete account", "error");
        }
    };

    // Fetch decrypted API key when button is clicked
    const handleShowApiKey = () => {
        setShowApiKey(prevState => !prevState); // Toggle the current state
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

      {/* API Key Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-gray-800">API Key</h3>
        <div className="relative">
          <input type={showApiKey ? "text" : "password"} value={user.apiKey} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-md" />
          <button onClick={handleShowApiKey} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">{showApiKey ? "Hide API Key" : "Show API Key"}</button>
        </div>
      </div>

      {/* Plan Upgrade Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-gray-800">Upgrade Plan</h3>
        <div className="space-y-3">
          {["Free", "Pro - £19.99/month", "Premium - £69.99/month"].map((plan, index) => (
            <button
              key={index}
              onClick={() => handleUpgrade(plan.split(" ")[0].toLowerCase())}
              className={`w-full text-left px-4 py-3 border rounded-md transition ${formData.plan.toLowerCase() === plan.split(" ")[0].toLowerCase() ? "bg-blue-200" : "hover:bg-blue-100"}`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-gray-800">Manage Plan</h3>
        <button
          onClick={handleManageSubscription}
          className={`w-full py-3 rounded-md text-white ${user?.subscription?.some(sub => sub.status_type !== "canceled") ? "bg-blue-600 hover:bg-blue-700 transition" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!user?.subscription?.some(sub => sub.status_type !== "canceled")}
        >
          Manage Subscription
        </button>
      </div>

      {/* Delete Account */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-red-600">Danger Zone</h3>
        <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition">Delete My Account</button>
      </div>
    </div>
    );
};

export default Settings;
