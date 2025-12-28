"use client";
import { FaBell } from "react-icons/fa";

export default function Header({ nombreUsuario }) {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="md:hidden">
        <button className="text-gray-900">
          ☰
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700">
          <FaBell className="text-xl" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700 hidden sm:inline">
            {nombreUsuario}
          </span>
        </div>
      </div>
    </header>
  );
}
