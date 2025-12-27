'use client';
import { useEffect } from 'react';

export const useMapMarker = () => {
  useEffect(() => {
    let L;

    // Import dinámico SOLO en cliente
    import('leaflet').then((leaflet) => {
      L = leaflet.default;

      delete L.Icon.Default.prototype._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    });
  }, []);
};
