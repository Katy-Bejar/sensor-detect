"use client";

import { FaBell, FaMapMarkerAlt, FaCog } from "react-icons/fa";

export default function DashboardHomeSection({
  nombreUsuario,
  sensorData,
  detectionHistory,
  deteccionesHoy,
  sensorStatus,
}) {
  return (
    <>
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          ¡Bienvenido, {nombreUsuario}!
        </h1>
        <p className="text-blue-100">
          Monitoreo en tiempo real –{" "}
          {sensorData ? `${sensorData.distance} cm` : "Conectando..."}
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* Detecciones hoy */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Detecciones hoy</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {deteccionesHoy}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <FaBell className="text-xl" />
            </div>
          </div>

          <div
            className={`text-sm mt-2 flex items-center ${
              detectionHistory[0]?.nivel === "alto"
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1 ${
                detectionHistory[0]?.nivel === "alto"
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            ></span>
            <span>
              {detectionHistory[0]?.nivel === "alto"
                ? "Objeto cercano"
                : "Todo normal"}
            </span>
          </div>
        </div>

        {/* Distancia actual */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 text-sm">Distancia actual</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {sensorData ? sensorData.distance : "--"} cm
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FaMapMarkerAlt className="text-xl" />
            </div>
          </div>

          <div
            className={`text-sm mt-2 ${
              sensorData?.distance < 20
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {sensorData?.distance < 20
              ? "¡Alerta! Objeto cercano"
              : "Rango seguro"}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 text-sm">Estado del sistema</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {sensorStatus === "activo" ? "Activo" : "Inactivo"}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <FaCog className="text-xl" />
            </div>
          </div>

          <div
            className={`text-sm mt-2 flex items-center ${
              sensorStatus === "activo"
                ? "text-green-500"
                : "text-gray-900"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1 ${
                sensorStatus === "activo"
                  ? "bg-green-500"
                  : "bg-gray-500"
              }`}
            ></span>
            <span>
              {sensorStatus === "activo"
                ? "Conectado"
                : "Sin conexión"}
            </span>
          </div>
        </div>
      </div>

      {/* Datos en tiempo real */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaBell className="text-blue-600 mr-2" />
            Datos en Tiempo Real
          </h2>
        </div>

        {sensorData ? (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border">
                <p className="text-sm text-gray-700 font-medium">Distancia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sensorData.distance} cm
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">Fecha</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {sensorData.date}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">Hora</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {sensorData.time}
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                sensorData.distance < 20
                  ? "bg-red-50 border border-red-200"
                  : "bg-gray-50"
              }`}
            >
              <p className="font-semibold text-gray-900">
                {sensorData.distance < 20
                  ? "¡ALERTA! Objeto detectado cerca"
                  : "Todo normal"}
              </p>
              <p className="text-sm mt-1 text-gray-700">
                {sensorData.distance < 20
                  ? `Objeto a ${sensorData.distance} cm del sensor`
                  : `Distancia actual: ${sensorData.distance} cm`}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Conectando con el sensor...
          </div>
        )}
      </div>
    </>
  );
}
