import React, { useState } from "react";
import Dashboard from "../components/Dashboard";
import { Helmet } from "react-helmet-async";
import Settings from "../components/Settings";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      <Helmet>
        <title>{activeTab === "dashboard" ? "Dashboard - User Panel" : "Settings - User Panel"}</title>
        <meta
          name="description"
          content={
            activeTab === "dashboard"
              ? "Manage and view your user dashboard. Track your activity, view insights, and manage your settings."
              : "Adjust your preferences and settings. Customize your account and application settings."
          }
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://simplegeoapi.com/dashboard/${activeTab}`} />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <nav className="space-x-4">
              <button
                className={`${activeTab === "dashboard" ? "text-blue-300" : "text-white"
                  }`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`${activeTab === "settings" ? "text-blue-300" : "text-white"
                  }`}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "settings" && <Settings />}
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
