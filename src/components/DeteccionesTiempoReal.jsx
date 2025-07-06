"use client";
import { useEffect, useState } from 'react';

export default function DeteccionesTiempoReal({ initialData }) {
  const [detecciones, setDetecciones] = useState(initialData);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/sse`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const newDetection = JSON.parse(event.data);
      setDetecciones(prev => [newDetection, ...prev.slice(0, 9)]);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm">{isConnected ? 'Conectado en tiempo real' : 'Desconectado'}</span>
      </div>
      
      <div className="space-y-3">
        {detecciones.map((deteccion, index) => (
          <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-medium">{deteccion.ubicacion}</span>
              <span className="text-sm text-gray-500">
                {new Date(deteccion.fecha_hora).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {deteccion.tipo_evento === 'deteccion' ? 'Movimiento detectado' : 'Evento registrado'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}