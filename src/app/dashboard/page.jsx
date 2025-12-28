"use client";
import { useState, useEffect } from "react";
import { FaBell, FaChartLine, FaCog, FaHome, FaMapMarkerAlt, FaCloud } from "react-icons/fa";
import { Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  LineElement,
  LineController,
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Registra los componentes necesarios
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  TimeScale
);


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sensorData, setSensorData] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [sensorStatus, setSensorStatus] = useState("activo");

  const [cloudInfo, setCloudInfo] = useState(null);
  const [cloudLoading, setCloudLoading] = useState(false);



  // Obtener datos en tiempo real del sensor
  useEffect(() => {
    const eventSource = new EventSource('/api/detecciones');
    
    eventSource.onmessage = (e) => {
      try {
        const newData = JSON.parse(e.data);

        const now = new Date();

        setSensorData({
          ...newData,
          date: now.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          time: now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        });

        
        // Actualizar historial (últimas 10 detecciones)
        setDetectionHistory(prev => [{
          id: crypto.randomUUID(),

          sensor_id: "sensor1",
          fecha_hora: new Date().toISOString(),
          tipo_evento: "deteccion",
          valor: newData.distance,
          ubicacion: "Sumidero",
          nivel: newData.nivel === 'CRITICO'
            ? 'critico'
            : (newData.distance < 20 ? 'alto' : 'normal'),
          tipo_evento: newData.evento ?? "deteccion",

        }, ...prev.slice(0, 9)]);
        
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  // Obtener datos reales desde AWS (DynamoDB)
  useEffect(() => {
    if (activeTab !== "cloud") return;

    let alive = true;
    setCloudLoading(true);

    const loadCloudData = async () => {
      try {
        const res = await fetch("/api/cloud");
        const data = await res.json();
        if (alive) setCloudInfo(data);
      } catch (err) {
        console.error("Error leyendo AWS:", err);
      } finally {
        if (alive) setCloudLoading(false);
      }
    };

    loadCloudData();
    const interval = setInterval(loadCloudData, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [activeTab]);





 

  const nombreUsuario = "Demo";

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
      case "analiticas": {
        // ===== CÁLCULOS =====
        const totalDetecciones = detectionHistory.length;
        const totalAlertas = detectionHistory.filter(d => d.nivel === 'alto').length;

        const distanciaPromedio =
          totalDetecciones > 0
            ? Math.round(
                detectionHistory.reduce((sum, d) => sum + d.valor, 0) /
                totalDetecciones
              )
            : 0;

        // ===== DATA DEL GRÁFICO =====
        const chartData = {
          datasets: [
            {
              label: 'Detecciones',
              data: detectionHistory.map(d => ({
                x: new Date(d.fecha_hora),
                y: d.valor,
              })),
              backgroundColor: detectionHistory.map(d =>
                d.nivel === 'alto'
                  ? 'rgba(239,68,68,0.8)'   // rojo
                  : 'rgba(59,130,246,0.8)' // azul
              ),
              pointRadius: 7,
              pointHoverRadius: 9,
            },
            {
              label: 'Umbral de alerta (20 cm)',
              type: 'line',
              data: detectionHistory.map(d => ({
                x: new Date(d.fecha_hora),
                y: 20,
              })),
              borderColor: 'rgba(239,68,68,0.6)',
              borderDash: [6, 6],
              pointRadius: 0,
            },
          ],
        };

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                displayFormats: { hour: 'HH:mm' },
              },
              title: {
                display: true,
                text: 'Hora de detección',
              },
            },
            y: {
              min: 0,
              title: {
                display: true,
                text: 'Distancia (cm)',
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: (context) => `Distancia: ${context.parsed.y} cm`,
              },
            },
          },
        };

        // ===== UI =====
        return (
          <div className="w-full space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Análisis de Datos
            </h2>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-5 rounded-xl">
                <p className="text-sm text-blue-700">Total detecciones</p>
                <p className="text-3xl font-bold text-blue-900">
                  {totalDetecciones}
                </p>
              </div>

              <div className="bg-red-50 p-5 rounded-xl">
                <p className="text-sm text-red-700">Alertas (≤20 cm)</p>
                <p className="text-3xl font-bold text-red-900">
                  {totalAlertas}
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-xl">
                <p className="text-sm text-green-700">Distancia promedio</p>
                <p className="text-3xl font-bold text-green-900">
                  {distanciaPromedio} cm
                </p>
              </div>
            </div>

            {/* GRÁFICO */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {totalDetecciones > 0 ? (
                <div className="h-[420px]">
                  <Scatter data={chartData} options={options} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-20">
                  No hay suficientes datos para mostrar análisis
                </p>
              )}

              {/* Insight */}
              <div className="mt-4 text-sm text-gray-600">
                {totalAlertas > 0
                  ? 'Se detectaron objetos peligrosamente cerca del sensor.'
                  : 'No se detectaron eventos críticos en este período.'}
              </div>
            </div>
          </div>
        );
      }


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
      
      case "cloud": {
        if (cloudLoading) {
          return (
            <div className="text-gray-600 text-sm">
              Consultando AWS...
            </div>
          );
        }

        if (!cloudInfo) {
          return (
            <div className="text-gray-500">
              No hay datos disponibles desde la nube.
            </div>
          );
        }

        const { total, counts, last, items } = cloudInfo;

        return (
          <div className="space-y-6 w-full">
            <h2 className="text-2xl font-bold text-gray-800">
              Estado de la Nube (AWS)
            </h2>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-5 rounded-xl border">
                <p className="text-sm font-semibold text-indigo-800">Eventos almacenados</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {total}
                </p>
              </div>

              <div className="bg-red-50 p-5 rounded-xl border">
                <p className="text-sm font-semibold text-red-800">Eventos críticos</p>
                <p className="text-3xl font-bold text-red-900">
                  {counts?.CRITICO ?? 0}
                </p>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border">
                <p className="text-sm font-semibold text-yellow-800">Notificación</p>
                <p className="text-lg font-bold text-yellow-900">
                  Amazon SNS (Email)
                </p>
              </div>
            </div>

            {/* Último evento */}
            {last && (
              <div className="bg-white p-5 rounded-xl border shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Último evento registrado en DynamoDB
                </h4>
                <pre className="text-xs bg-gray-900 text-green-200 p-4 rounded border overflow-auto">
      {JSON.stringify(last, null, 2)}
                </pre>
              </div>
            )}

            {/* Tabla */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b font-semibold text-gray-800">
                Últimos eventos (AWS)
              </div>
              <div className="divide-y">
                {items.map((e, i) => (
                  <div key={i} className="p-3 text-sm flex justify-between text-gray-800">
                    <span className="font-medium text-gray-900">
                      {e.evento}
                    </span>
                    <span className="text-gray-700">
                      {new Date(e.timestamp).toLocaleString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }







      
        default:
        return (
          <>
            {/* Bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Bienvenido, {nombreUsuario}!</h1>
              <p className="text-blue-100">Monitoreo en tiempo real - {sensorData ? `${sensorData.distance} cm` : 'Conectando...'}</p>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 w-full gap-6 mb-6">


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
                    <p className="text-gray-900 text-sm">Distancia actual</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
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
                    <p className="text-gray-900 text-sm">Estado del sistema</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {sensorStatus === 'activo' ? 'Activo' : 'Inactivo'}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                    <FaCog className="text-xl" />
                  </div>
                </div>
                <div className={`text-sm mt-2 flex items-center ${
                  sensorStatus === 'activo' ? 'text-green-500' : 'text-gray-900'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    sensorStatus === 'activo' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></span>
                  <span>{sensorStatus === 'activo' ? 'Conectado' : 'Sin conexión'}</span>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">

                        <p className="text-sm text-gray-700 font-medium">Distancia</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {sensorData.distance} cm
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium">Fecha</p>
                        <p className="text-lg text-gray-900 font-semibold">{sensorData.date}</p>

                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium">Hora</p>
                        <p className="text-lg text-gray-900 font-semibold">{sensorData.time}</p>

                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      sensorData.distance < 20 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                      <p className="font-semibold text-gray-900">
                        {sensorData.distance < 20 ? '¡ALERTA! Objeto detectado cerca' : 'Todo normal'}
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
         
          <h1 className="text-xl font-bold">Sensor Detect</h1>
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
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
              {detectionHistory.filter(d => d.nivel === 'alto').length}
            </span>
          </button>

          {/* BOTON AWS */}
          <button 
            onClick={() => navigateTo("cloud")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              activeTab === "cloud" ? 'bg-blue-800/50' : 'hover:bg-white/10'
            }`}
          >
            <FaCloud className="text-lg" />
            <span>Cloud</span>
          </button>

                  
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="md:hidden">
            <button className="text-gray-900">
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
        <main className="p-4 lg:p-6 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}