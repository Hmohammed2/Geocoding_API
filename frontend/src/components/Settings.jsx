import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";
import Alert from "./Alert";
import { useAlert } from "./contexts/AlertContext";

const Settings = () => {
    const { user, loading } = useAuth()
    const { alert, showAlert } = useAlert()
    const [formData, setFormData] = useState(
        {
            userName: user.userName,
            email: user.email,
            plan: user?.isPayingCustomer === 'no' ? 'free plan' : user?.subscription?.[0]?.subscription_type || 'free plan', // Default to 'Free Plan' if no subscription is available 
        }); // Separate form state
    const [apiKey, setApiKey] = useState(""); // Store decrypted API key
    const [showApiKey, setShowApiKey] = useState(false); // Toggle API key visibility
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/users/update`,
                { userId: user.userId, userName: formData.name, email: formData.email }
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

    const handleUpgrade = async (newPlan) => {
        // Call API to update plan
        console.log("Upgrading to:", newPlan);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/payment/create-checkout-session/`,
                { userId: user.userId, subscriptionType: newPlan }
            );

            console.log("Response data:", response.data); // Debugging line
            if (response.data.url) {
                window.location.href = response.data.url; // Redirect to Stripe checkout
            } else {
                console.log("No URL returned from server");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
        }
    };

    const handleManageSubscription = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/payment/customers/${user.subscription[0].customer_id}`,
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

    // Fetch decrypted API key when button is clicked
    const handleShowApiKey = async () => {
        if (showApiKey) {
            setShowApiKey(false); // Hide API key if already visible
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/get-api-key`, {
                params: { userId: user.userId },
            });

            if (response.data.apiKey) {
                setApiKey(response.data.apiKey);
                setShowApiKey(true);
            } else {
                showAlert("Failed to retrieve API Key", "error");
            }
        } catch (error) {
            console.error("Error fetching API key:", error);
            showAlert("Error retrieving API Key", "error");
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
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            {/* Render alert component */}
            {alert && <Alert />}
            {/* Profile Update Form */}
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                    <label className="block font-semibold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </form>

            {/* API Key Section */}
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-2">API Key</h3>
                <div className="relative">
                    <input type={showApiKey ? "text" : "password"} value={user.apiKey} readOnly className="w-full px-4 py-2 border rounded-md" />
                    <button onClick={handleShowApiKey} className="mt-2 bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700">
                        {showApiKey ? "Hide API Key" : "Show API Key"}
                    </button>
                </div>
            </div>

            {/* Plan Upgrade Section */}
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-2">Upgrade Plan</h3>
                <div className="space-y-2">
                    <button
                        className={`w-full text-left px-4 py-2 border rounded-md hover:bg-blue-100 ${formData.plan === "free plan" ? "bg-blue-200" : ""
                            }`}
                    >
                        Free Plan
                    </button>
                    <button
                        onClick={() => handleUpgrade("pro")}
                        className={`w-full text-left px-4 py-2 border rounded-md hover:bg-blue-100 ${formData.plan === "pro" ? "bg-blue-200" : ""
                            }`}
                    >
                        Pro Plan - £19.99/month
                    </button>
                    <button
                        onClick={() => handleUpgrade("premium")}
                        className={`w-full text-left px-4 py-2 border rounded-md hover:bg-blue-100 ${formData.plan === "premium" ? "bg-blue-200" : ""
                            }`}
                    >
                        Premium Plan - £69.99/month
                    </button>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-2">Manage Plan</h3>
                <div className="space-y-2">
                    <button
                        onClick={handleManageSubscription}
                        type="button"
                        className={`py-2 px-4 rounded-md w-full ${user?.isPayingCustomer === 'no'
                            ? 'bg-gray-400 cursor-not-allowed' // Disabled styling
                            : 'bg-blue-600 text-white hover:bg-blue-700' // Active styling
                            }`}
                        disabled={user?.isPayingCustomer === 'no'} // Disables button if the user is not a paying customer
                    >
                        Manage Subscription
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
