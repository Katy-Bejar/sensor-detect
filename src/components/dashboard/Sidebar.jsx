"use client";
import { FaBell, FaChartLine, FaHome, FaCloud } from "react-icons/fa";

export default function Sidebar({ activeTab, navigateTo, alertCount }) {
  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-blue-900 text-white p-4 hidden md:block">
      <div className="flex items-center justify-center mb-8 mt-4">
        <h1 className="text-xl font-bold">Sensor Detect</h1>
      </div>

      <nav className="space-y-2">
        <button
          onClick={() => navigateTo("dashboard")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
            activeTab === "dashboard"
              ? "bg-blue-800/50"
              : "hover:bg-white/10 text-white/80"
          }`}
        >
          <FaHome />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigateTo("analiticas")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
            activeTab === "analiticas"
              ? "bg-blue-800/50"
              : "hover:bg-white/10 text-white/80"
          }`}
        >
          <FaChartLine />
          <span>Analíticas</span>
        </button>

        <button
          onClick={() => navigateTo("alertas")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
            activeTab === "alertas"
              ? "bg-blue-800/50"
              : "hover:bg-white/10 text-white/80"
          }`}
        >
          <FaBell />
          <span>Alertas</span>
          {alertCount > 0 && (
            <span className="ml-auto bg-red-500 text-xs px-2 py-1 rounded-full">
              {alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigateTo("cloud")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
            activeTab === "cloud"
              ? "bg-blue-800/50"
              : "hover:bg-white/10 text-white/80"
          }`}
        >
          <FaCloud />
          <span>Cloud</span>
        </button>
      </nav>
    </div>
  );
}
