'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Map = () => {
  const MapComponent = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => {
      const { MapContainer, TileLayer, Marker, Popup } = mod;
      return function MapWrapper() {
        const position = [-16.39889, -71.535];
        
        return (
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
              <Popup>
                Residencial Huaranguillo <br /> HCPF+MJR, Arequipa 04013
              </Popup>
            </Marker>
          </MapContainer>
        );
      };
    }),
    { 
      ssr: false, // Esto desactiva el renderizado en el servidor
      loading: () => <p>Cargando mapa...</p>
    }
  ), []);

  return <MapComponent />;
};

export default Map;