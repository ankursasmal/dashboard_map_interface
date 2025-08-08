'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DATA_SOURCES, LatLng, Polygon } from '@/types';
import { generateId, getDefaultColorRules } from '@/lib/utils';
import useStore from '@/store/useStore';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (polygon: Polygon) => void;
  coordinates: LatLng[];
  inline?: boolean;
}

export default function DataSourceModal({
  isOpen,
  onClose,
  onConfirm,
  coordinates,
  inline = false
}: DataSourceModalProps) {
  const [selectedDataSource, setSelectedDataSource] = useState(DATA_SOURCES[0].apiField);
  const [polygonLabel, setPolygonLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fetchWeatherDataForPolygon = useStore(state => state.fetchWeatherDataForPolygon);

  const handleConfirm = async () => {
    if (!polygonLabel.trim()) {
      alert('Please enter a label for the polygon');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const newPolygon: Polygon = {
        id: generateId(),
        coordinates,
        label: polygonLabel.trim(),
        dataSource: selectedDataSource,
        colorRules: getDefaultColorRules()
      };

      // Create the polygon first
      onConfirm(newPolygon);

      // Then fetch weather data for it
      console.log('Fetching weather data for new polygon:', newPolygon.id);
      await fetchWeatherDataForPolygon(newPolygon.id);

      setPolygonLabel('');
      setSelectedDataSource(DATA_SOURCES[0].apiField);
      onClose();
    } catch (error) {
      console.error('Error creating polygon or fetching weather data:', error);
      alert('Failed to fetch weather data. The polygon was created but weather data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPolygonLabel('');
    setSelectedDataSource(DATA_SOURCES[0].apiField);
    onClose();
  };

  if (!isOpen) return null;

  if (inline) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configure New Polygon
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Polygon Label
              </label>
              <input
                type="text"
                value={polygonLabel}
                onChange={(e) => setPolygonLabel(e.target.value)}
                placeholder="Enter polygon name..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Source
              </label>
              <select
                value={selectedDataSource}
                onChange={(e) => setSelectedDataSource(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATA_SOURCES.map(source => (
                  <option key={source.id} value={source.apiField}>
                    {source.label} ({source.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating & Loading Data...' : 'Create Polygon'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Configure New Polygon
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Polygon Label
            </label>
            <input
              type="text"
              value={polygonLabel}
              onChange={(e) => setPolygonLabel(e.target.value)}
              placeholder="Enter polygon name..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Source
            </label>
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DATA_SOURCES.map(source => (
                <option key={source.id} value={source.apiField}>
                  {source.label} ({source.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Default Color Rules
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>&lt; 10 → Red</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>≥ 10 and &lt; 25 → Blue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>≥ 25 → Green</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can customize these rules after creating the polygon.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Vertices:</strong> {coordinates.length}</p>
            <p><strong>Area:</strong> Polygon with {coordinates.length} points</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating & Loading Data...' : 'Create Polygon'}
          </button>
        </div>
      </div>
    </div>
  );
}