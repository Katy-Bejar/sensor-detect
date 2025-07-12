'use client';
import { useState, useEffect } from 'react';

export default function DeteccionesTiempoReal() {
  const [deteccion, setDeteccion] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/detecciones');
    
    eventSource.onmessage = (e) => {
      try {
        const newData = JSON.parse(e.data);
        setDeteccion(newData);
        setHistorial(prev => [newData, ...prev.slice(0, 10)]); // Mantener último 10 registros
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Detecciones en Tiempo Real</h2>
      
      {deteccion ? (
        <div className="mb-6 p-4 border rounded-lg bg-white shadow">
          <h3 className="font-semibold">Última Detección</h3>
          <p>Dispositivo: {deteccion.device}</p>
          <p>Fecha: {deteccion.date} - Hora: {deteccion.time}</p>
          <p className={`font-bold ${
            deteccion.distance < 20 ? 'text-red-500' : 'text-green-500'
          }`}>
            Distancia: {deteccion.distance} cm
          </p>
          {deteccion.alert && (
            <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
              {deteccion.alert}
            </div>
          )}
        </div>
      ) : (
        <p>Cargando datos del sensor...</p>
      )}

      <div>
        <h3 className="font-semibold mb-2">Historial (últimas 10)</h3>
        <ul className="space-y-2">
          {historial.map((item, index) => (
            <li key={index} className="p-2 border-b">
              {item.time} - {item.distance} cm
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}