'use client';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useMapMarker } from './MapMarker';

// Componentes dinámicos para evitar SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export const SafeMap = () => {
  useMapMarker(); // Configura los iconos
  const position = [-16.39889, -71.535]; // Coordenadas exactas

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={position}
        zoom={17}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup className="custom-popup">
            <div className="flex items-center text-sm">
              <FaMapMarkerAlt className="text-red-500 mr-1" />
              <span>Residencial Huaranguillo</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};