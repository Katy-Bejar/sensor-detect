"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaChartLine, FaCog, FaSignOutAlt, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

// Datos simulados para pruebas
const deteccionesSimuladas = [
  {
    id: 1,
    sensor_id: "sensor1",
    fecha_hora: new Date().toISOString(),
    tipo_evento: "deteccion",
    valor: 1,
    ubicacion: "Cocina",
    nivel: "alto",
    tipo_animal: "rata" // Nuevo campo para tu proyecto
  },
  {
    id: 2,
    sensor_id: "sensor1",
    fecha_hora: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    tipo_evento: "deteccion",
    valor: 1,
    ubicacion: "Cocina",
    nivel: "medio",
    tipo_animal: "rata"
  },
  {
    id: 3,
    sensor_id: "sensor2",
    fecha_hora: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    tipo_evento: "temperatura",
    valor: 32.5,
    ubicacion: "Almacén",
    nivel: "critico"
  },
];

const sensores = [
  { id: "sensor1", nombre: "Sensor Cocina", estado: "activo", ultima_lectura: "2 min ago", ubicacion: "Cocina", tipo: "movimiento" },
  { id: "sensor2", nombre: "Sensor Almacén", estado: "activo", ultima_lectura: "15 min ago", ubicacion: "Almacén", tipo: "temperatura" },
  { id: "sensor3", nombre: "Sensor Entrada", estado: "inactivo", ultima_lectura: "1 hr ago", ubicacion: "Entrada Principal", tipo: "movimiento" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [email, setEmail] = useState("ismael@gmail.com"); // Simulamos el usuario

  if (!email) {
    router.push("/login");
    return null;
  }

  // Extraer el nombre del email para el saludo
  const nombreUsuario = email.split('@')[0];

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión
    router.push("/login");
  };

  // Función para navegar entre pestañas
  const navigateTo = (tab) => {
    setActiveTab(tab);
  };

  // Renderizar contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "analiticas": {/* ----------------------------------------- SECCION ANALITICAS ----------------------------------------- */}
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Análisis de Datos</h2>
            <p className="text-gray-600">Gráficos y estadísticas de detecciones.</p>
            {/* Aquí irían los gráficos */}
          </div>
        );
    {/* ----------------------------------------- SECCION ALERTAS ----------------------------------------- */}
      case "alertas":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Alertas</h2>
            <p className="text-gray-600">Registro completo de todas las alertas.</p>
          </div>
        );
    {/* ----------------------------------------- SECCION UBICACIONES ----------------------------------------- */}
      case "ubicaciones":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mapa de Ubicaciones</h2>
            <p className="text-gray-600">Visualización de sensores en el mapa.</p>
          </div>
        );
    {/* ----------------------------------------- SECCION CONFIGURACION ----------------------------------------- */}
      case "configuracion":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Sistema</h2>
            <p className="text-gray-600">Ajustes y preferencias.</p>
          </div>
        );
      default:
        return (
          <>
            {/* Bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Bienvenido, {nombreUsuario}!</h1>
              <p className="text-blue-100">Sistema de detección de ratas en tiempo real</p>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Sensores activos</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">2</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <FiActivity className="text-xl" />
                  </div>
                </div>
                <div className="text-green-500 text-sm mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  <span>+1 desde ayer</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Detecciones hoy</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">2</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 text-red-600">
                    <FaBell className="text-xl" />
                  </div>
                </div>
                <div className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                  <span>+2 desde ayer</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Ubicaciones</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">3</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-2">Monitoreadas</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Estado del sistema</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">Activo</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                    <FaCog className="text-xl" />
                  </div>
                </div>
                <div className="text-green-500 text-sm mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  <span>Todo normal</span>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detecciones recientes */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaBell className="text-blue-600 mr-2" />
                    Detecciones Recientes
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {deteccionesSimuladas.map((deteccion) => (
                    <div 
                      key={deteccion.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        deteccion.nivel === 'critico' ? 'bg-red-50/50 hover:bg-red-50' : 
                        deteccion.nivel === 'alto' ? 'bg-orange-50/50 hover:bg-orange-50' : 
                        'bg-blue-50/50 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            deteccion.nivel === 'critico' ? 'bg-red-500' : 
                            deteccion.nivel === 'alto' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="font-medium">{deteccion.ubicacion}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(deteccion.fecha_hora).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 ml-6">
                        {deteccion.tipo_evento === 'deteccion' 
                          ? `Rata detectada (${deteccion.tipo_animal})` 
                          : `Temperatura alta: ${deteccion.valor}°C`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 text-center">
                  <button 
                    onClick={() => navigateTo("alertas")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todas las detecciones
                  </button>
                </div>
              </div>

              {/* Estado de sensores */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiActivity className="text-blue-600 mr-2" />
                    Estado de Sensores
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {sensores.map((sensor) => (
                    <div key={sensor.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            sensor.estado === 'activo' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="font-medium">{sensor.nombre}</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {sensor.ultima_lectura}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 ml-6">
                        {sensor.ubicacion} · {sensor.tipo}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 text-center">
                  <button 
                    onClick={() => navigateTo("configuracion")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Gestionar sensores
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-blue-900 text-white p-4 hidden md:block">
        <div className="flex items-center justify-center mb-8 mt-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mr-3">
            <FiActivity className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold">Rata Detect</h1>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => navigateTo("dashboard")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${activeTab === "dashboard" ? 'bg-blue-800/50 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
          >
            <FaHome className="text-lg" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => navigateTo("analiticas")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${activeTab === "analiticas" ? 'bg-blue-800/50 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
          >
            <FaChartLine className="text-lg" />
            <span>Analíticas</span>
          </button>
          <button 
            onClick={() => navigateTo("alertas")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${activeTab === "alertas" ? 'bg-blue-800/50 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
          >
            <FaBell className="text-lg" />
            <span>Alertas</span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">3</span>
          </button>
          <button 
            onClick={() => navigateTo("ubicaciones")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${activeTab === "ubicaciones" ? 'bg-blue-800/50 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
          >
            <FaMapMarkerAlt className="text-lg" />
            <span>Ubicaciones</span>
          </button>
          <button 
            onClick={() => navigateTo("configuracion")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${activeTab === "configuracion" ? 'bg-blue-800/50 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
          >
            <FaCog className="text-lg" />
            <span>Configuración</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="md:hidden">
            <button className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="text-gray-500 hover:text-gray-700">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {nombreUsuario.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 hidden sm:inline">{nombreUsuario}</span>
            </div>
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}