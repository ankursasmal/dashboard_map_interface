'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Polygon, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import { LatLng as LeafletLatLng, Map as LeafletMap } from 'leaflet';
import { Button, message } from 'antd';
import { Edit, Trash2, RotateCcw } from 'lucide-react';
import useStore from '@/store/useStore';
import { LatLng, Polygon as PolygonType } from '@/types';
import { generateId, applyColorRules } from '@/lib/utils';
import { calculatePolygonCentroid, getWeatherValueAtTime } from '@/services/weatherApi';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Controller Component
const MapController: React.FC = () => {
  const map = useMap();
  const { mapCenter, mapZoom, setMapCenter, setMapZoom } = useStore();

  useEffect(() => {
    if (map) {
      map.setView([mapCenter.lat, mapCenter.lng], mapZoom);
    }
  }, [map, mapCenter, mapZoom]);

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
    },
    zoomend: () => {
      setMapZoom(map.getZoom());
    }
  });

  return null;
};

interface DrawingHandlerProps {
  onPolygonComplete: (coordinates: LatLng[]) => void;
}

const DrawingHandler: React.FC<DrawingHandlerProps> = ({ onPolygonComplete }) => {
  const { isDrawing, setIsDrawing } = useStore();
  const [drawingCoords, setDrawingCoords] = useState<LatLng[]>([]);

  useMapEvents({
    click: (e) => {
      if (!isDrawing) return;

      const newCoord: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      const newCoords = [...drawingCoords, newCoord];

      setDrawingCoords(newCoords);

      // Show progress message
      if (newCoords.length >= 3) {
        message.info(`${newCoords.length} vertices added. Double-click to finish or continue adding (max 12).`);
      } else {
        message.info(`${newCoords.length} vertices added. Need at least 3 vertices.`);
      }

      // Auto-complete polygon when we have max vertices
      if (newCoords.length >= 12) {
        message.success('Maximum vertices reached. Polygon completed!');
        console.log('Auto-completing polygon with max vertices:', newCoords);
        onPolygonComplete(newCoords);
        setDrawingCoords([]);
        setIsDrawing(false);
      }
    },
    dblclick: (e) => {
      if (!isDrawing) return;

      e.originalEvent.preventDefault();

      if (drawingCoords.length < 3) {
        message.warning('Need at least 3 vertices to create a polygon!');
        return;
      }

      message.success(`Polygon created with ${drawingCoords.length} vertices!`);
      console.log('Double-click polygon completion:', drawingCoords);
      onPolygonComplete(drawingCoords);
      setDrawingCoords([]);
      setIsDrawing(false);
    }
  });

  return drawingCoords.length > 0 ? (
    <Polygon
      positions={drawingCoords.map(coord => [coord.lat, coord.lng])}
      pathOptions={{
        color: '#1890ff',
        fillColor: '#1890ff',
        fillOpacity: 0.3,
        weight: 3,
        dashArray: '8, 8'
      }}
    />
  ) : null;
};

// Map Controls Component
const MapControls: React.FC = () => {
  const { mapCenter, setMapCenter, setMapZoom, isDrawing, setIsDrawing } = useStore();

  const resetMapView = () => {
    setMapCenter({ lat: 51.505, lng: -0.09 });
    setMapZoom(10);
    message.info('Map view reset to default');
  };

  const startDrawing = () => {
    setIsDrawing(true);
    message.info('Drawing mode activated. Click on map to add vertices.');
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    message.info('Drawing mode deactivated.');
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        type="primary"
        icon={<Edit size={16} />}
        onClick={isDrawing ? stopDrawing : startDrawing}
        className={isDrawing ? 'bg-red-500 hover:bg-red-600' : ''}
      >
        {isDrawing ? 'Stop Drawing' : 'Draw Polygon'}
      </Button>
      <Button
        icon={<RotateCcw size={16} />}
        onClick={resetMapView}
      >
        Reset View
      </Button>
    </div>
  );
};

interface MapComponentProps {
  onPolygonCreate: (coordinates: LatLng[]) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onPolygonCreate }) => {
  const {
    polygons,
    currentTime,
    selectedTimeRange,
    sliderMode,
    mapCenter,
    mapZoom,
    updateAllPolygonColors,
    fetchAllPolygonsWeatherData
  } = useStore();

  // Fetch weather data for all polygons when they change
  useEffect(() => {
    if (polygons.length > 0) {
      fetchAllPolygonsWeatherData().catch(error => {
        console.error('Error fetching weather data for polygons:', error);
      });
    }
  }, [polygons, selectedTimeRange, fetchAllPolygonsWeatherData]);

  // Update polygon colors when time changes
  useEffect(() => {
    updateAllPolygonColors();
  }, [currentTime, updateAllPolygonColors]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        doubleClickZoom={false} // Disable to prevent interference with polygon drawing
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController />
        <DrawingHandler onPolygonComplete={onPolygonCreate} />

        {polygons.map((polygon) => {
          // Determine the color to use (custom color takes priority)
          const displayColor = polygon.customColor || polygon.currentColor || '#808080';

          // Apply highlighting effects
          const isHighlighted = polygon.isHighlighted;
          const strokeWeight = isHighlighted ? 5 : 3;
          const fillOpacity = isHighlighted ? 0.9 : 0.7;

          return (
            <Polygon
              key={polygon.id}
              positions={polygon.coordinates.map(coord => [coord.lat, coord.lng])}
              pathOptions={{
                color: displayColor,
                fillColor: displayColor,
                fillOpacity: fillOpacity,
                weight: strokeWeight,
                opacity: 1,
                // Add dashed border for highlighted polygons
                dashArray: isHighlighted ? '10, 5' : undefined
              }}
            >
              <Tooltip permanent>
                <div className="text-sm">
                  <div className="font-semibold">{polygon.label}</div>
                  <div className="text-gray-600">Source: {polygon.dataSource}</div>
                  {polygon.customColor && (
                    <div className="text-blue-600 text-xs">🎨 Custom Color</div>
                  )}
                  {isHighlighted && (
                    <div className="text-yellow-600 text-xs font-bold">📍 Found</div>
                  )}
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      <MapControls />
    </div>
  );
};

// Export as dynamic component to avoid SSR issues
const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default Map;
