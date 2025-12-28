"use client";

import { FaBell } from "react-icons/fa";

export default function AlertsSection({
  filteredAlerts,
  timeFilter,
  setTimeFilter,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaBell className="text-red-500 mr-2" />
          Historial de Alertas
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setTimeFilter("today")}
            className={`px-3 py-1 text-sm rounded-lg ${
              timeFilter === "today"
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-50 text-gray-600"
            } hover:bg-blue-100`}
          >
            Hoy
          </button>

          <button
            onClick={() => setTimeFilter("week")}
            className={`px-3 py-1 text-sm rounded-lg ${
              timeFilter === "week"
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-50 text-gray-600"
            } hover:bg-gray-100`}
          >
            Esta semana
          </button>

          <button
            onClick={() => setTimeFilter("all")}
            className={`px-3 py-1 text-sm rounded-lg ${
              timeFilter === "all"
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-50 text-gray-600"
            } hover:bg-gray-100`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-gray-200">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((deteccion) => (
            <div
              key={deteccion.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                deteccion.nivel === "alto"
                  ? "bg-red-50/50"
                  : "bg-white"
              }`}
            >
              <div className="flex items-start">
                
                <div
                  className={`flex-shrink-0 mt-1 mr-3 flex items-center justify-center h-8 w-8 rounded-full ${
                    deteccion.nivel === "alto"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <FaBell className="text-sm" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {deteccion.nivel === "alto"
                        ? "Alerta: Objeto detectado"
                        : "Lectura normal"}
                    </p>

                    <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {new Date(deteccion.fecha_hora).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                      <span className="mx-1">•</span>
                      {new Date(deteccion.fecha_hora).toLocaleTimeString(
                        "es-ES",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>

                  <div className="mt-1">
                    <span className="text-sm text-gray-500">
                      Distancia: {deteccion.valor} cm
                    </span>
                  </div>

                  {deteccion.nivel === "alto" && (
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      ¡Objeto detectado a {deteccion.valor} cm del sensor!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No hay alertas registradas
          </div>
        )}
      </div>
    </div>
  );
}
