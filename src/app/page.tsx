'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import DataSourceModal from '@/components/DataSourceModal';
import PolygonManager from '@/components/PolygonManager';

// Import TimeSlider with no SSR to avoid hydration issues
const TimeSlider = dynamic(() => import('@/components/TimeSlider'), {
  ssr: false,
  loading: () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Time Control</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    </div>
  )
});

import useStore from '@/store/useStore';
import { LatLng } from '@/types';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default function Home() {
  const { addPolygon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<LatLng[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to modal when it opens
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        modalRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isModalOpen]);

  const handlePolygonCreate = (coordinates: LatLng[]) => {
    console.log('handlePolygonCreate called with coordinates:', coordinates);

    if (coordinates.length < 3) {
      alert('Polygon must have at least 3 vertices');
      return;
    }

    if (coordinates.length > 12) {
      alert('Polygon cannot have more than 12 vertices');
      return;
    }

    console.log('Setting modal open and pending coordinates');
    setPendingCoordinates(coordinates);
    setIsModalOpen(true);
  };

  // Test function to manually trigger modal (temporary)
  const testModal = () => {
    console.log('Test modal triggered');
    setPendingCoordinates([
      { lat: 51.505, lng: -0.09 },
      { lat: 51.51, lng: -0.1 },
      { lat: 51.51, lng: -0.08 }
    ]);
    setIsModalOpen(true);
  };

  const handleModalConfirm = (polygon: any) => {
    addPolygon(polygon);
    setPendingCoordinates([]);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingCoordinates([]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Weather Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Interactive weather data visualization with polygon mapping
            </p>
          </div>
          <div>
            <button
              onClick={testModal}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
Create New Polygon
            </button>
          </div>
        </div>
      </header>

      {/* Time Slider */}
      <TimeSlider />

      {/* Polygon Configuration Panel */}
      {isModalOpen && (
        <div ref={modalRef} className="bg-blue-50 border-b-2 border-blue-200 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  Polygon Configuration Active
                </span>
              </div>
            </div>
            <DataSourceModal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onConfirm={handleModalConfirm}
              coordinates={pendingCoordinates}
              inline={true}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Sidebar and Polygon Manager */}
        <div className="w-80 flex flex-col bg-gray-50 border-r border-gray-200 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <PolygonManager />
            <Sidebar />
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <Map onPolygonCreate={handlePolygonCreate} />
        </div>
      </div>
    </div>
  );
}
