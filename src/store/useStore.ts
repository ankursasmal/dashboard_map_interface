
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Polygon, TimeRange, WeatherData, SliderMode, LatLng } from '@/types';
import { addDays, format } from 'date-fns';
import { fetchWeatherDataForPolygon, generateCacheKey, getWeatherValueAtTime } from '@/services/weatherApi';

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      polygons: [],
      selectedTimeRange: {
        start: addDays(new Date(), -15),
        end: addDays(new Date(), 15)
      },
      currentTime: new Date(),
      dataCache: {},
      isDrawing: false,
      selectedPolygon: null,
      sliderMode: { type: 'single', singleValue: 360 }, // Default to current hour (360 = 15 days * 24 hours)
      mapCenter: { lat: 51.505, lng: -0.09 }, // Default to London
      mapZoom: 10,

      addPolygon: (polygon: Polygon) => {
        set((state) => ({
          polygons: [...state.polygons, polygon]
        }));
      },

      updatePolygon: (id: string, updates: Partial<Polygon>) => {
        set((state) => ({
          polygons: state.polygons.map(polygon =>
            polygon.id === id ? { ...polygon, ...updates } : polygon
          )
        }));
      },

      deletePolygon: (id: string) => {
        set((state) => ({
          polygons: state.polygons.filter(polygon => polygon.id !== id),
          selectedPolygon: state.selectedPolygon === id ? null : state.selectedPolygon
        }));
      },

      setTimeRange: (range: TimeRange) => {
        set({ selectedTimeRange: range });
      },

      setCurrentTime: (time: Date) => {
        set({ currentTime: time });
      },

      setIsDrawing: (drawing: boolean) => {
        set({ isDrawing: drawing });
      },

      setSelectedPolygon: (id: string | null) => {
        set({ selectedPolygon: id });
      },

      setSliderMode: (mode: SliderMode) => {
        set({ sliderMode: mode });
      },

      setMapCenter: (center: LatLng) => {
        set({ mapCenter: center });
      },

      setMapZoom: (zoom: number) => {
        set({ mapZoom: zoom });
      },

      cacheWeatherData: (key: string, data: WeatherData) => {
        set((state) => ({
          dataCache: { ...state.dataCache, [key]: data }
        }));
      },

      // Fetch weather data for a polygon
      fetchWeatherDataForPolygon: async (polygonId: string) => {
        const state = get();
        const polygon = state.polygons.find(p => p.id === polygonId);

        if (!polygon) {
          console.error('Polygon not found:', polygonId);
          return;
        }

        // Validate dates before formatting
        const startDateObj = state.selectedTimeRange.start instanceof Date
          ? state.selectedTimeRange.start
          : new Date(state.selectedTimeRange.start);
        const endDateObj = state.selectedTimeRange.end instanceof Date
          ? state.selectedTimeRange.end
          : new Date(state.selectedTimeRange.end);

        if (!state.selectedTimeRange.start || !state.selectedTimeRange.end ||
            isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
          console.warn('Invalid time range in fetchWeatherDataForPolygon, skipping fetch');
          return;
        }

        const startDate = format(startDateObj, 'yyyy-MM-dd');
        const endDate = format(endDateObj, 'yyyy-MM-dd');
        const cacheKey = generateCacheKey(polygon.coordinates, polygon.dataSource, startDate, endDate);

        // Check if data is already cached
        if (state.dataCache[cacheKey]) {
          console.log('Using cached weather data for polygon:', polygonId);
          return state.dataCache[cacheKey];
        }

        try {
          console.log('Fetching weather data for polygon:', polygonId);
          const weatherData = await fetchWeatherDataForPolygon(
            polygon.coordinates,
            polygon.dataSource,
            startDate,
            endDate
          );

          // Cache the data
          state.cacheWeatherData(cacheKey, weatherData);

          // Update polygon color based on current time
          state.updatePolygonColor(polygonId);

          return weatherData;
        } catch (error) {
          console.error('Failed to fetch weather data for polygon:', polygonId, error);
          throw error;
        }
      },

      // Update polygon color based on current weather data
      updatePolygonColor: (polygonId: string) => {
        const state = get();
        const polygon = state.polygons.find(p => p.id === polygonId);

        if (!polygon) return;

        // Validate dates before formatting
        const startDateObj = state.selectedTimeRange.start instanceof Date
          ? state.selectedTimeRange.start
          : new Date(state.selectedTimeRange.start);
        const endDateObj = state.selectedTimeRange.end instanceof Date
          ? state.selectedTimeRange.end
          : new Date(state.selectedTimeRange.end);

        if (!state.selectedTimeRange.start || !state.selectedTimeRange.end ||
            isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
          console.warn('Invalid time range in updatePolygonColor, skipping update');
          return;
        }

        const startDate = format(startDateObj, 'yyyy-MM-dd');
        const endDate = format(endDateObj, 'yyyy-MM-dd');
        const cacheKey = generateCacheKey(polygon.coordinates, polygon.dataSource, startDate, endDate);
        const weatherData = state.dataCache[cacheKey];

        if (!weatherData) return;

        // Validate current time before using it
        const currentTimeObj = state.currentTime instanceof Date
          ? state.currentTime
          : new Date(state.currentTime);

        if (!state.currentTime || isNaN(currentTimeObj.getTime())) {
          console.warn('Invalid current time in updatePolygonColor, skipping update');
          return;
        }

        const currentValue = getWeatherValueAtTime(weatherData, polygon.dataSource, currentTimeObj);

        if (currentValue === null) return;

        // Find matching color rule
        let matchingColor = '#gray-400'; // Default color

        for (const rule of polygon.colorRules) {
          let matches = false;

          switch (rule.operator) {
            case '<':
              matches = currentValue < rule.value;
              break;
            case '<=':
              matches = currentValue <= rule.value;
              break;
            case '>':
              matches = currentValue > rule.value;
              break;
            case '>=':
              matches = currentValue >= rule.value;
              break;
            case '=':
              matches = Math.abs(currentValue - rule.value) < 0.1;
              break;
            case '!=':
              matches = Math.abs(currentValue - rule.value) >= 0.1;
              break;
          }

          if (matches) {
            matchingColor = rule.color;
            break;
          }
        }

        // Update polygon with current color (only if no custom color is set)
        if (!polygon.customColor) {
          state.updatePolygon(polygonId, { currentColor: matchingColor });
        }
      },

      // Fetch weather data for all polygons
      fetchAllPolygonsWeatherData: async () => {
        const state = get();
        const promises = state.polygons.map(polygon =>
          state.fetchWeatherDataForPolygon(polygon.id).catch(error => {
            console.error(`Failed to fetch data for polygon ${polygon.id}:`, error);
            return null;
          })
        );

        await Promise.all(promises);
      },

      // Update all polygon colors based on current time
      updateAllPolygonColors: () => {
        const state = get();
        state.polygons.forEach(polygon => {
          state.updatePolygonColor(polygon.id);
        });
      },

      // Set custom color for a polygon
      setPolygonCustomColor: (polygonId: string, color: string) => {
        set((state) => ({
          polygons: state.polygons.map(polygon =>
            polygon.id === polygonId
              ? { ...polygon, customColor: color, currentColor: color }
              : polygon
          )
        }));
      },

      // Clear custom color for a polygon (revert to rule-based color)
      clearPolygonCustomColor: (polygonId: string) => {
        set((state) => ({
          polygons: state.polygons.map(polygon =>
            polygon.id === polygonId
              ? { ...polygon, customColor: undefined }
              : polygon
          )
        }));
        // Update color based on rules
        get().updatePolygonColor(polygonId);
      },

      // Highlight a polygon (for finding)
      highlightPolygon: (polygonId: string) => {
        set((state) => ({
          polygons: state.polygons.map(polygon =>
            polygon.id === polygonId
              ? { ...polygon, isHighlighted: true }
              : { ...polygon, isHighlighted: false }
          )
        }));
      },

      // Clear all polygon highlights
      clearAllHighlights: () => {
        set((state) => ({
          polygons: state.polygons.map(polygon => ({
            ...polygon,
            isHighlighted: false
          }))
        }));
      },

      // Find polygon by label (case-insensitive search)
      findPolygonsByLabel: (searchTerm: string) => {
        const state = get();
        return state.polygons.filter(polygon =>
          polygon.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }),
    {
      name: 'weather-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        polygons: state.polygons,
        selectedTimeRange: state.selectedTimeRange,
        currentTime: state.currentTime
      })
    }
  )
);

export default useStore;
