import React, { useState } from "react";
import { FaTachometerAlt, FaCog } from "react-icons/fa";
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
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "settings" && <Settings />}
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
