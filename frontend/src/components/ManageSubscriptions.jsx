import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios';
import { useAlert } from './contexts/AlertContext';
import Alert from './Alert';

const ManageSubscriptions = () => {
    const { user, loading } = useAuth();
    const { alert, showAlert } = useAlert();

    // Get all subscriptions
    const subscriptions = user?.subscription || [];
    
    // Find the trial or active subscription (prioritizing trial)
    const trialSubscription = subscriptions.find(sub => sub.status_type === "trialing");
    const activeSubscription = subscriptions.find(sub => sub.status_type === "active");
    const effectiveSubscription = trialSubscription || activeSubscription; // Prefer trial if available

    // Determine the plan type
    const planType = effectiveSubscription?.subscription_type || "free";

    // State to track selected plan
    const [formData, setFormData] = useState({ plan: planType });

    const handleUpgrade = async (newPlan) => {
        if (formData.plan === "pro" && newPlan === "premium") {
            if (!window.confirm("Upgrade to Premium?")) return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-checkout-session/`,
                { userId: user.userId, subscriptionType: newPlan }
            );

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                showAlert('Failed to get checkout session URL', 'error');
            }
        } catch (error) {
            showAlert(error.response?.data?.message || 'Something went wrong', 'error');
        }
    };

    const handleManageSubscription = async () => {
        if (!effectiveSubscription?.customer_id) {
            showAlert("No active subscription to manage.", "error");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/customers/${effectiveSubscription.customer_id}`,
                { userId: user.userId }
            );

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                showAlert("Failed to retrieve billing portal URL", "error");
            }
        } catch (error) {
            showAlert("Error retrieving subscription data", "error");
        }
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">Error loading user data</div>;

    return (
        <div className="max-w-lg mx-auto py-10">
            {alert && <Alert />}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Manage Subscription</h3>
                <div className="space-y-4">
                    {/* Upgrade Plan Section */}
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Upgrade Plan</h4>
                        <div className="grid gap-2">
                            {["Free", "Pro - £19.99/month", "Premium - £69.99/month"].map((plan, index) => {
                                const planName = plan.split(" ")[0].toLowerCase();
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleUpgrade(planName)}
                                        className={`w-full px-4 py-2 border rounded-md transition ${
                                            formData.plan === planName ? "bg-blue-600 text-white" : "border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        {plan}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Manage Subscription Section */}
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Manage Plan</h4>
                        <button
                            onClick={handleManageSubscription}
                            disabled={!effectiveSubscription}
                            className={`w-full px-4 py-2 rounded-md transition ${
                                effectiveSubscription ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Manage Subscription
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSubscriptions;
