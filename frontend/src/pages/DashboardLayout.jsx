import React, { useState } from "react";
import Dashboard from "../components/Dashboard";
import Settings from "../components/Settings";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <nav className="space-x-4">
            <button
              className={`${
                activeTab === "dashboard" ? "text-blue-300" : "text-white"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`${
                activeTab === "settings" ? "text-blue-300" : "text-white"
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
  );
};

export default DashboardLayout;
