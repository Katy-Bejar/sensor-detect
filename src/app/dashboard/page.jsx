"use client";
import { SafeMap } from '../../components/SafeMap';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaChartLine, FaCog, FaSignOutAlt, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import { Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Registra los componentes necesarios
ChartJS.register(LinearScale, PointElement, Tooltip, Legend, TimeScale);


export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [email, setEmail] = useState("ismael@gmail.com");
  const [sensorData, setSensorData] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [sensorStatus, setSensorStatus] = useState("activo");

  // Datos simulados para sensores (puedes reemplazar con datos reales si tienes múltiples sensores)
  const [sensores, setSensores] = useState([
    { id: "sensor1", nombre: "Sensor Ultrasónico", estado: "activo", ultima_lectura: "Ahora", ubicacion: "Sumidero", tipo: "movimiento" }
  ]);

  // Obtener datos en tiempo real del sensor
  useEffect(() => {
    const eventSource = new EventSource('/api/detecciones');
    
    eventSource.onmessage = (e) => {
      try {
        const newData = JSON.parse(e.data);
        setSensorData(newData);
        
        // Actualizar historial (últimas 10 detecciones)
        setDetectionHistory(prev => [{
          id: Date.now(),
          sensor_id: "sensor1",
          fecha_hora: new Date().toISOString(),
          tipo_evento: "deteccion",
          valor: newData.distance,
          ubicacion: "Sumidero",
          nivel: newData.distance < 20 ? "alto" : "normal",
          tipo_animal: "rata"
        }, ...prev.slice(0, 9)]);
        
        // Actualizar estado del sensor
        setSensores(prev => prev.map(sensor => ({
          ...sensor,
          ultima_lectura: "Ahora",
          estado: "activo"
        })));
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  if (!email) {
    router.push("/login");
    return null;
  }

  const nombreUsuario = email.split('@')[0];

  const handleLogout = () => {
    router.push("/login");
  };

  const navigateTo = (tab) => {
    setActiveTab(tab);
  };

  // Calcular estadísticas
  const deteccionesHoy = detectionHistory.filter(d => 
    new Date(d.fecha_hora).toDateString() === new Date().toDateString()
  ).length;

  //para que aparezcan todos los filtros
  const [timeFilter, setTimeFilter] = useState('today');

  const filteredAlerts = detectionHistory.filter(alert => {
    const alertDate = new Date(alert.fecha_hora);
    const today = new Date();
    
    if (timeFilter === 'today') {
      return alertDate.toDateString() === today.toDateString();
    } else if (timeFilter === 'week') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return alertDate >= oneWeekAgo;
    }
    return true; // 'all' filter
  });

  const renderContent = () => {
    switch (activeTab) {
      case "analiticas":
      // Prepara los datos para el gráfico
      const chartData = {
        datasets: [
          {
            label: 'Detecciones',
            data: detectionHistory.map(d => ({
              x: new Date(d.fecha_hora),
              y: d.valor
            })),
            backgroundColor: detectionHistory.map(d => 
              d.nivel === 'alto' ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.7)'
            ),
            pointRadius: 8,
            pointHoverRadius: 10
          }
        ]
      };

      const options = {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              tooltipFormat: 'PPpp',
              displayFormats: {
                hour: 'HH:mm'
              }
            },
            title: {
              display: true,
              text: 'Hora de detección'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Distancia (cm)'
            },
            min: 0,
            max: Math.max(100, ...detectionHistory.map(d => d.valor)) + 20
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Distancia: ${context.parsed.y} cm`;
              },
              title: function(context) {
                return new Date(context[0].parsed.x).toLocaleString('es-ES');
              }
            }
          },
          legend: {
            display: false
          }
        }
      };

      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Análisis de Datos</h2>
          
          {detectionHistory.length > 0 ? (
            <>
              <div className="h-80">
                <Scatter 
                  data={chartData} 
                  options={options} 
                />
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800">Total detecciones</h3>
                  <p className="text-2xl font-bold">{detectionHistory.length}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-red-800">Alertas (≤20cm)</h3>
                  <p className="text-2xl font-bold">
                    {detectionHistory.filter(d => d.nivel === 'alto').length}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800">Distancia promedio</h3>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      detectionHistory.reduce((sum, d) => sum + d.valor, 0) / 
                      detectionHistory.length
                    )} cm
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No hay suficientes datos para mostrar análisis</p>
          )}
        </div>
      );

      case "alertas":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaBell className="text-red-500 mr-2" />
                Historial de Alertas
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setTimeFilter('today')} 
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeFilter === 'today' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                  } hover:bg-blue-100`}
                >
                  Hoy
                </button>
                <button 
                  onClick={() => setTimeFilter('week')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeFilter === 'week' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                  } hover:bg-gray-100`}
                >
                  Esta semana
                </button>
                <button 
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                  } hover:bg-gray-100`}
                >
                  Todos
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((deteccion) => (
                  <div 
                    key={deteccion.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      deteccion.nivel === 'alto' ? 'bg-red-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 mt-1 mr-3 flex items-center justify-center h-8 w-8 rounded-full ${
                        deteccion.nivel === 'alto' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        <FaBell className="text-sm" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {deteccion.nivel === 'alto' ? 'Alerta: Objeto detectado' : 'Lectura normal'}
                          </p>
                          <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {new Date(deteccion.fecha_hora).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                            <span className="mx-1">•</span>
                            {new Date(deteccion.fecha_hora).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="mt-1 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deteccion.nivel === 'alto' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {deteccion.ubicacion}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Distancia: {deteccion.valor} cm
                          </span>
                        </div>
                        
                        {deteccion.nivel === 'alto' && (
                          <div className="mt-2 flex items-center text-sm text-red-600">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
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

      case "ubicaciones":
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaMapMarkerAlt className="text-blue-600 mr-2" />
          Ubicación del Sensor
        </h2>
      </div>
      
      <div className="p-6">
        <div className="h-96 w-full rounded-lg overflow-hidden relative">
          <SafeMap />
        </div>
        
        <div className="mt-6 space-y-2">
          <h3 className="font-medium text-lg">Residencial Huaranguillo</h3>
          <p className="text-gray-600">HCPF+MJR, Arequipa 04013</p>
          <a 
            href="https://maps.app.goo.gl/HnVY75qF6LMpHns39?g_st=iw" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Ver en Google Maps
          </a>
        </div>
      </div>
    </div>
  );

      case "configuracion":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Sistema</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Umbral de alerta (cm)</label>
                <input 
                  type="number" 
                  defaultValue="20"
                  className="border rounded-lg px-3 py-2 w-full max-w-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Notificaciones</label>
                <select className="border rounded-lg px-3 py-2">
                  <option>Activadas</option>
                  <option>Desactivadas</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Bienvenido, {nombreUsuario}!</h1>
              <p className="text-blue-100">Monitoreo en tiempo real - {sensorData ? `${sensorData.distance} cm` : 'Conectando...'}</p>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Sensores activos</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{sensores.filter(s => s.estado === 'activo').length}</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <FiActivity className="text-xl" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-2">En línea</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Detecciones hoy</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{deteccionesHoy}</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 text-red-600">
                    <FaBell className="text-xl" />
                  </div>
                </div>
                <div className={`text-sm mt-2 flex items-center ${
                  detectionHistory[0]?.nivel === 'alto' ? 'text-red-500' : 'text-green-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    detectionHistory[0]?.nivel === 'alto' ? 'bg-red-500' : 'bg-green-500'
                  }`}></span>
                  <span>{detectionHistory[0]?.nivel === 'alto' ? 'Objeto cercano' : 'Todo normal'}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Distancia actual</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {sensorData ? sensorData.distance : '--'} cm
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                </div>
                <div className={`text-sm mt-2 ${
                  sensorData?.distance < 20 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {sensorData?.distance < 20 ? '¡Alerta! Objeto cercano' : 'Rango seguro'}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Estado del sistema</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {sensorStatus === 'activo' ? 'Activo' : 'Inactivo'}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                    <FaCog className="text-xl" />
                  </div>
                </div>
                <div className={`text-sm mt-2 flex items-center ${
                  sensorStatus === 'activo' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    sensorStatus === 'activo' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></span>
                  <span>{sensorStatus === 'activo' ? 'Conectado' : 'Sin conexión'}</span>
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
                    Datos en Tiempo Real
                  </h2>
                </div>
                {sensorData ? (
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Distancia</p>
                        <p className="text-2xl font-bold">{sensorData.distance} cm</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p className="text-lg">{sensorData.date}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500">Hora</p>
                        <p className="text-lg">{sensorData.time}</p>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      sensorData.distance < 20 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                      <p className="font-medium">
                        {sensorData.distance < 20 ? '¡ALERTA! Objeto detectado cerca' : 'Todo normal'}
                      </p>
                      <p className="text-sm mt-1">
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
                      {sensorData && (
                        <div className="mt-2 ml-6 text-sm">
                          <p>Última lectura: {sensorData.distance} cm</p>
                          <p>Hora: {sensorData.time}</p>
                        </div>
                      )}
                    </div>
                  ))}
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