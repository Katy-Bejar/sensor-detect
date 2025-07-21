'use client';
import { useState, useEffect } from 'react';

export default function DeteccionesTiempoReal() {
  const [sensorData, setSensorData] = useState(null);
  const [alertStatus, setAlertStatus] = useState('normal');

  useEffect(() => {
    const eventSource = new EventSource('/api/detecciones');
    
    eventSource.onmessage = (e) => {
      try {
        const newData = JSON.parse(e.data);
        
        // Actualizar datos del sensor
        setSensorData(newData);
        
        // Manejar estados de alerta
        if (newData.distancia_cm < 20 && newData.distancia_cm > 0) {
          setAlertStatus('alerta');
        } else if (e.data.includes('ALARMA')) {
          setAlertStatus('alerta-critica');
        } else {
          setAlertStatus('normal');
        }
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className={`p-6 rounded-xl border-2 ${
      alertStatus === 'alerta' ? 'border-yellow-500 bg-yellow-50' :
      alertStatus === 'alerta-critica' ? 'border-red-500 bg-red-50 animate-pulse' :
      'border-gray-200 bg-white'
    }`}>
      <h2 className="text-xl font-semibold mb-4">Detección en Tiempo Real</h2>
      
      {sensorData ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Dispositivo:</span>
            <span className="font-medium">{sensorData.device_id}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha y Hora:</span>
            <span>{sensorData.fecha}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Distancia:</span>
            <span className={`font-bold ${
              sensorData.distancia_cm < 20 ? 'text-red-600' : 'text-green-600'
            }`}>
              {sensorData.distancia_cm} cm
            </span>
          </div>
          
          {alertStatus !== 'normal' && (
            <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-800 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              {alertStatus === 'alerta-critica' 
                ? '¡ALARMA! Objeto detectado cerca' 
                : 'Objeto cercano - Precaución'}
            </div>
          )}
        </div>
      ) : (
        <p>Cargando datos del sensor...</p>
      )}
    </div>
  );
}