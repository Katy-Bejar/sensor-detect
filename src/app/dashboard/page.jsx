"use client";

import AnalyticsSection from "../../components/dashboard/AnalyticsSection";
import AlertsSection from "../../components/dashboard/AlertsSection";
import CloudSection from "../../components/dashboard/CloudSection";
import DashboardHomeSection from "../../components/dashboard/DashboardHomeSection";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";

import { useState, useEffect } from "react";
import { Chart as ChartJS,   LinearScale,   PointElement,   LineElement,  LineController,  Tooltip,   Legend,  TimeScale} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Registra los componentes necesarios
ChartJS.register(  LinearScale,  PointElement,  LineElement,  LineController,  Tooltip,  Legend,  TimeScale);

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


  const nombreUsuario = "Edson";

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
        return (
          <AnalyticsSection detectionHistory={detectionHistory} />
        );

      case "alertas":
        return (
          <AlertsSection
            filteredAlerts={filteredAlerts}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
          />
        );
        
      case "cloud":
        return (
          <CloudSection
            cloudLoading={cloudLoading}
            cloudInfo={cloudInfo}
          />
        );

      case "dashboard":
        default:
          return (
            <DashboardHomeSection
              nombreUsuario={nombreUsuario}
              sensorData={sensorData}
              detectionHistory={detectionHistory}
              deteccionesHoy={deteccionesHoy}
              sensorStatus={sensorStatus}
            />
          );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        navigateTo={navigateTo}
        alertCount={detectionHistory.filter(d => d.nivel === "alto").length}
      />

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header nombreUsuario={nombreUsuario} />

        {/* Contenido del dashboard */}
        <main className="p-4 lg:p-6 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}