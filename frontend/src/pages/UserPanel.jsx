import React, { useState } from "react";
import { FaTachometerAlt, FaCog, FaUpload, FaMapMarkerAlt, FaHome } from "react-icons/fa";
import Dashboard from "../components/Dashboard";
import Settings from "../components/Settings";
import FilePreviewToggle from "./FilePreviewToggle";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../components/contexts/AuthContext";
import MapComponent from "../components/MapComponent";
import PropertySearch from "../components/PropertySearch";
import ManageSubscriptions from "../components/ManageSubscriptions";

const UserPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  // Find the user's active or trialing subscription, preferring trial first
  const subscriptions = user?.subscription || [];
  const trialSubscription = subscriptions.find(sub => sub.status_type === "trialing");
  const activeSubscription = subscriptions.find(sub => sub.status_type === "active");

  // Determine the effective subscription (prioritizing trial)
  const effectiveSubscription = trialSubscription || activeSubscription;

  // Check if the user has a premium subscription
  const isPremium = effectiveSubscription?.subscription_type === "premium";

  // Helper function to get page title and description
  const getMetaInfo = (tab) => {
    switch (tab) {
      case "dashboard":
        return {
          title: "Dashboard - User Panel",
          description: "Manage and view your user dashboard. Track your activity, view insights, and manage your settings."
        };
      case "settings":
        return {
          title: "Settings - User Panel",
          description: "Adjust your preferences and settings. Customize your account and application settings."
        };
      case "batch-geocode":
        return {
          title: "Batch Geocode - User Panel",
          description: "Upload an Excel or flat file for batch geocoding."
        };
      case "poi-analysis":
        return {
          title: "POI Analysis - User Panel",
          description: "Analyze points of interest on an interactive map."
        };
      case "property-finder":
        return {
          title: "Property Finder - User Panel",
          description: "Search for properties based on your preferences and location."
        };
      case "manage-subscription":
        return {
          title: "Manage Subscription - User Panel",
          description: "View and manage your subscription details."
        };
      default:
        return {
          title: "User Panel",
          description: "Explore and manage your user panel."
        };
    }
  };

  const metaInfo = getMetaInfo(activeTab);

  return (
    <>
      <Helmet>
        <title>{metaInfo.title}</title>
        <meta name="description" content={metaInfo.description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://simplegeoapi.com/dashboard/${activeTab}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar (Visible on md and larger) */}
        <aside className="hidden md:flex flex-col w-80 min-h-screen shadow-lg p-6 text-black">
          <h2 className="text-2xl font-bold text-center mb-6">User Panel</h2>
          <nav className="space-y-4">
            <button
              className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-300 
                ${activeTab === "dashboard" ? "bg-white text-blue-700 shadow-lg" : "hover:bg-blue-600/50"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaTachometerAlt className="mr-3 text-lg" />
              <span className="text-lg">Dashboard</span>
            </button>
            <button
              className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-300 
                ${activeTab === "settings" ? "bg-white text-blue-700 shadow-lg" : "hover:bg-blue-600/50"}`}
              onClick={() => setActiveTab("settings")}
            >
              <FaCog className="mr-3 text-lg" />
              <span className="text-lg">Settings</span>
            </button>
            <button
              className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-300 
                ${activeTab === "manage-subscription" ? "bg-white text-blue-700 shadow-lg" : "hover:bg-blue-600/50"}`}
              onClick={() => setActiveTab("manage-subscription")}
            >
              <FaCog className="mr-3 text-lg" />
              <span className="text-lg">Manage Subscription</span>
            </button>

            {/* Conditionally render Batch Geocode tab */}
            {isPremium && (
              <>
                <button
                  className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-300 
                  ${activeTab === "batch-geocode" ? "bg-white text-blue-700 shadow-lg" : "hover:bg-blue-600/50"}`}
                  onClick={() => setActiveTab("batch-geocode")}
                >
                  <FaUpload className="mr-3 text-lg" />
                  <span className="text-lg">Batch Geocode</span>
                </button>
                <button
                  className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-300 
                            ${activeTab === "poi-analysis"
                      ? "bg-white text-blue-700 shadow-lg"
                      : "hover:bg-blue-600/50"
                    }`}
                  onClick={() => setActiveTab("poi-analysis")}
                >
                  <FaMapMarkerAlt className="mr-3 text-lg" />
                  <span className="text-lg">POI Analysis</span>
                </button>
                <button
                  className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-300 
                            ${activeTab === "property-finder"
                      ? "bg-white text-blue-700 shadow-lg"
                      : "hover:bg-blue-600/50"
                    }`}
                  onClick={() => setActiveTab("property-finder")}
                >
                  <FaHome className="mr-3 text-lg" />
                  <span className="text-lg">Property Finder</span>
                </button>
              </>
            )}

          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Navigation (Visible on small screens only) */}
          <header className="md:hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <nav className="space-x-4">
                <button
                  className={`${activeTab === "dashboard" ? "text-blue-300" : "text-white"} flex items-center`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <FaTachometerAlt className="mr-2" /> Dashboard
                </button>
                <button
                  className={`${activeTab === "settings" ? "text-blue-300" : "text-white"} flex items-center`}
                  onClick={() => setActiveTab("settings")}
                >
                  <FaCog className="mr-2" /> Settings
                </button>
                <button
                  className={`${activeTab === "manage-subscription" ? "text-blue-300" : "text-white"} flex items-center`}
                  onClick={() => setActiveTab("manage-subscription")}
                >
                  <FaCog className="mr-2" /> Manage Subscription
                </button>

                {/* Conditionally render Batch Geocode tab on small screens */}
                {isPremium && (
                  <button
                    className={`${activeTab === "batch-geocode" ? "text-blue-300" : "text-white"} flex items-center`}
                    onClick={() => setActiveTab("batch-geocode")}
                  >
                    <FaUpload className="mr-2" /> Batch Geocode
                  </button>
                )}
                {isPremium && (
                  <button
                    className={`${activeTab === "poi-analysis"
                      ? "text-blue-300"
                      : "text-white"
                      } flex items-center`}
                    onClick={() => setActiveTab("poi-analysis")}
                  >
                    <FaMapMarkerAlt className="mr-2" /> POI Analysis
                  </button>
                )}
                {isPremium && (
                  <button
                    className={`${activeTab === "property-finder"
                      ? "text-blue-300"
                      : "text-white"
                      } flex items-center`}
                    onClick={() => setActiveTab("property-finder")}
                  >
                    <FaHome className="mr-2" /> Property Finder
                  </button>
                )}
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-2 py-8">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "settings" && <Settings />}
            {activeTab === "manage-subscription" && <ManageSubscriptions />}
            {/* Conditionally render Batch Geocode content */}
            {activeTab === "batch-geocode" && isPremium && <FilePreviewToggle />}
            {activeTab === "poi-analysis" && isPremium && <MapComponent />}
            {activeTab === "property-finder" && isPremium && <PropertySearch />}
          </main>
        </div>
      </div>
    </>
  );
};

export default UserPanel;
