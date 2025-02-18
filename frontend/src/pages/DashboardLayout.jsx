import React, { useState } from "react";
import { FaTachometerAlt, FaCog, FaUpload, FaMapMarkerAlt } from "react-icons/fa";
import Dashboard from "../components/Dashboard";
import Settings from "../components/Settings";
import { Helmet } from "react-helmet-async";
import FilePreviewToggle from "./FilePreviewToggle";
import { useAuth } from "../components/contexts/AuthContext";
import MapComponent from "../components/MapComponent";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  const activeSubscription = user?.subscription?.find(sub => sub.status_type === "active");

  // Check if the user has a premium subscription
  const isPremium = activeSubscription?.subscription_type === "premium";

  return (
    <>
      <Helmet>
        <title>
        {activeTab === "dashboard"
            ? "Dashboard - User Panel"
            : activeTab === "settings"
            ? "Settings - User Panel"
            : activeTab === "batch-geocode"
            ? "Batch Geocode - User Panel"
            : "POI Analysis - User Panel"}
        </title>
        <meta
          name="description"
          content={
            activeTab === "dashboard"
              ? "Manage and view your user dashboard. Track your activity, view insights, and manage your settings."
              : activeTab === "settings"
              ? "Adjust your preferences and settings. Customize your account and application settings."
              : activeTab === "batch-geocode"
              ? "Upload an Excel or flat file for batch geocoding."
              : "Analyze points of interest on an interactive map."
          }
        />
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
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "settings" && <Settings />}
            {/* Conditionally render Batch Geocode content */}
            {activeTab === "batch-geocode" && isPremium && <FilePreviewToggle />}
            {activeTab === "poi-analysis" && isPremium && <MapComponent />}
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
