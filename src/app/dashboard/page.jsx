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
  const [alertStatus, setAlertStatus] = useState("normal"); // 'normal', 'alerta', 'critico'

  // Datos simulados para sensores
  const [sensores, setSensores] = useState([
    { id: "sensor1", nombre: "Sensor Ultrasónico", estado: "activo", ultima_lectura: "Ahora", ubicacion: "Sumidero", tipo: "movimiento" }
  ]);

  useEffect(() => {
  let eventSource;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const connect = () => {
    console.log(`Intentando conexión SSE (intento ${reconnectAttempts + 1})`);
    eventSource = new EventSource('/api/detecciones');

    eventSource.onopen = () => {
      console.log('Conexión SSE establecida');
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (e) => {
      try {
        const eventData = JSON.parse(e.data);
        console.log('Dato recibido:', eventData);
        
        // Procesar fecha y hora correctamente
        const fechaHora = new Date(eventData.data.timestamp);
        const fecha = fechaHora.toLocaleDateString('es-ES');
        const hora = fechaHora.toLocaleTimeString('es-ES');
        
        // Determinar estado de alerta basado en la distancia
        let nivelAlerta = 'normal';
        if (eventData.data.distance < 10) nivelAlerta = 'critico';
        else if (eventData.data.distance < 20) nivelAlerta = 'alerta';

        // Actualizar estado del sensor
        setSensorData({
          distance: eventData.data.distance,
          status: eventData.data.status,
          date: fecha,
          time: hora,
          raw: eventData.data // Para debug
        });

        // Actualizar estado de alerta
        setAlertStatus(nivelAlerta);

        // Solo agregar al historial si es una alerta
        if (nivelAlerta !== 'normal') {
          setDetectionHistory(prev => [{
            id: Date.now(),
            sensor_id: eventData.data.device_id || 'SENSOR_01',
            fecha_hora: eventData.data.timestamp,
            valor: eventData.data.distance,
            ubicacion: "Sumidero", // Puedes hacerlo dinámico si tienes múltiples sensores
            nivel: nivelAlerta,
            tipo_animal: "rata" // O cualquier otro dato que necesites
          }, ...prev.slice(0, 19)]); // Mantener solo las últimas 20 alertas
        }

      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(connect, 3000 * reconnectAttempts);
      } else {
        console.error('Máximos intentos de reconexión alcanzados');
        setSensorData(null);
      }
    };
  };

  connect();

  return () => {
    if (eventSource) {
      console.log('Limpiando conexión SSE');
      eventSource.close();
    }
  };
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

  const [timeFilter, setTimeFilter] = useState('today');

  const filteredAlerts = detectionHistory.filter(alert => {
    const alertDate = new Date(alert.fecha_hora);
    const today = new Date();
    
    if (timeFilter === 'today') {
      return alertDate.toDateString() === today.toDateString();
    } else if (timeFilter === 'week') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return alertDate >= oneWeekAgo && alertDate <= today;
    }
    return true; // 'all' filter
  });

  const renderContent = () => {
    switch (activeTab) {
      case "analiticas":
        const chartData = {
          datasets: [
            {
              label: 'Detecciones',
              data: detectionHistory.map(d => ({
                x: new Date(d.fecha_hora),
                y: d.valor
              })),
              backgroundColor: detectionHistory.map(d => 
                d.nivel === 'critico' ? 'rgba(255, 51, 51, 0.7)' : 
                d.nivel === 'alto' ? 'rgba(255, 153, 51, 0.7)' : 'rgba(54, 162, 235, 0.7)'
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
                    <h3 className="font-medium text-red-800">Alertas críticas</h3>
                    <p className="text-2xl font-bold">
                      {detectionHistory.filter(d => d.nivel === 'critico').length}
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
                      deteccion.nivel === 'critico' ? 'bg-red-50' : 
                      deteccion.nivel === 'alto' ? 'bg-yellow-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 mt-1 mr-3 flex items-center justify-center h-8 w-8 rounded-full ${
                        deteccion.nivel === 'critico' ? 'bg-red-100 text-red-600' : 
                        deteccion.nivel === 'alto' ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-green-100 text-green-600'
                      }`}>
                        <FaBell className="text-sm" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {deteccion.nivel === 'critico' ? 'ALERTA CRÍTICA' : 
                             deteccion.nivel === 'alto' ? 'Advertencia' : 'Lectura normal'}
                          </p>
                          <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {new Date(deteccion.fecha_hora).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                            <span className="mx-1">•</span>
                            {new Date(deteccion.fecha_hora).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="mt-1 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deteccion.nivel === 'critico' ? 'bg-red-100 text-red-800' : 
                            deteccion.nivel === 'alto' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {deteccion.ubicacion}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Distancia: {deteccion.valor} cm
                          </span>
                        </div>
                        
                        {(deteccion.nivel === 'critico' || deteccion.nivel === 'alto') && (
                          <div className={`mt-2 flex items-center text-sm ${
                            deteccion.nivel === 'critico' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {deteccion.nivel === 'critico' 
                              ? `¡Objeto detectado a ${deteccion.valor} cm! (Alarma activada)` 
                              : `Objeto detectado a ${deteccion.valor} cm del sensor`}
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
              <div>
                <label className="block text-gray-700 mb-2">Nivel de sensibilidad</label>
                <select className="border rounded-lg px-3 py-2">
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
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
              {/* Estado del sensor */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Estado del sensor</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {alertStatus === 'normal' ? 'Normal' : 
                       alertStatus === 'alerta' ? 'Advertencia' : '¡Alerta!'}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    alertStatus === 'normal' ? 'bg-green-100 text-green-600' :
                    alertStatus === 'alerta' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600 animate-pulse'
                  }`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      {alertStatus === 'normal' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      )}
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  {alertStatus === 'normal' ? (
                    <span className="text-green-500 text-sm">Todo normal</span>
                  ) : alertStatus === 'alerta' ? (
                    <span className="text-yellow-500 text-sm">Objeto detectado cerca</span>
                  ) : (
                    <span className="text-red-500 text-sm">¡Alarma activa!</span>
                  )}
                </div>
              </div>

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
                  detectionHistory[0]?.nivel === 'critico' ? 'text-red-500' : 
                  detectionHistory[0]?.nivel === 'alto' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    detectionHistory[0]?.nivel === 'critico' ? 'bg-red-500' : 
                    detectionHistory[0]?.nivel === 'alto' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                  <span>
                    {detectionHistory[0]?.nivel === 'critico' ? '¡Alarma activa!' : 
                     detectionHistory[0]?.nivel === 'alto' ? 'Objeto cercano' : 'Todo normal'}
                  </span>
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
                  sensorData?.distance < 10 ? 'text-red-500' : 
                  sensorData?.distance < 20 ? 'text-yellow-500' : 'text-gray-500'
                }`}>
                  {sensorData?.distance < 10 ? '¡Alarma activa!' : 
                   sensorData?.distance < 20 ? 'Advertencia: Objeto cercano' : 'Rango seguro'}
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
                      sensorData.distance < 10 ? 'bg-red-50 border border-red-200 animate-pulse' : 
                      sensorData.distance < 20 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}>
                      <p className={`font-medium ${
                        sensorData.distance < 10 ? 'text-red-600' : 
                        sensorData.distance < 20 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {sensorData.distance < 10 ? '¡ALERTA CRÍTICA!' : 
                         sensorData.distance < 20 ? 'Advertencia: Objeto detectado cerca' : 'Todo normal'}
                      </p>
                      <p className="text-sm mt-1">
                        {sensorData.distance < 10 
                          ? `¡Objeto a ${sensorData.distance} cm! (Alarma activada)` 
                          : `Distancia actual: ${sensorData.distance} cm`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                    <p>Esperando datos del sensor...</p>
                    <p className="text-sm">Verifica la conexión con el dispositivo</p>
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
                          <p className={`${
                            sensorData.distance < 10 ? 'text-red-500' : 
                            sensorData.distance < 20 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            Estado: {
                              sensorData.distance < 10 ? 'Crítico' : 
                              sensorData.distance < 20 ? 'Advertencia' : 'Normal'
                            }
                          </p>
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
            {detectionHistory.filter(d => d.nivel === 'critico' || d.nivel === 'alto').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                {detectionHistory.filter(d => d.nivel === 'critico' || d.nivel === 'alto').length}
              </span>
            )}
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
                {detectionHistory.filter(d => d.nivel === 'critico' || d.nivel === 'alto').length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
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

        {/* Debug Console - Colócalo aquí */}
      <div className="px-6 pt-4">
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">Debug Console</h3>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-40 overflow-auto">
            {sensorData?.raw ? (
              <pre>{JSON.stringify(sensorData.raw, null, 2)}</pre>
            ) : (
              <p>Esperando datos del sensor...</p>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Estado conexión: {sensorData ? '✅ Activa' : '❌ Desconectado'}
          </div>
        </div>
      </div>


        {/* Contenido del dashboard */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}