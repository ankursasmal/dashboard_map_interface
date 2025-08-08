import { WeatherData, LatLng } from '@/types';

export interface WeatherApiParams {
  latitude: number;
  longitude: number;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  hourlyParams: string[]; // e.g., ['temperature_2m', 'relative_humidity_2m']
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    temperature_2m?: string;
    relative_humidity_2m?: string;
    precipitation?: string;
    wind_speed_10m?: string;
    surface_pressure?: string;
  };
  hourly: {
    time: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    surface_pressure?: number[];
  };
}

/**
 * Fetches weather data from Open-Meteo API
 */
export async function fetchWeatherData(params: WeatherApiParams): Promise<WeatherData> {
  const { latitude, longitude, startDate, endDate, hourlyParams } = params;
  
  // Build the API URL
  const baseUrl = 'https://archive-api.open-meteo.com/v1/archive';
  const searchParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    start_date: startDate,
    end_date: endDate,
    hourly: hourlyParams.join(','),
    timezone: 'UTC'
  });

  const url = `${baseUrl}?${searchParams.toString()}`;
  
  try {
    console.log('Fetching weather data from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: OpenMeteoResponse = await response.json();
    
    // Transform the API response to our WeatherData format
    const weatherData: WeatherData = {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: {
        time: data.hourly.time,
        temperature_2m: data.hourly.temperature_2m || [],
        relative_humidity_2m: data.hourly.relative_humidity_2m,
        precipitation: data.hourly.precipitation,
        wind_speed_10m: data.hourly.wind_speed_10m,
      }
    };
    
    console.log('Weather data fetched successfully:', weatherData);
    return weatherData;
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches weather data for a polygon (uses centroid of polygon)
 */
export async function fetchWeatherDataForPolygon(
  coordinates: LatLng[],
  dataSource: string,
  startDate: string,
  endDate: string
): Promise<WeatherData> {
  // Validate input parameters
  if (!coordinates || !Array.isArray(coordinates)) {
    throw new Error('Invalid coordinates: must be an array');
  }

  if (!dataSource || typeof dataSource !== 'string') {
    throw new Error('Invalid data source: must be a non-empty string');
  }

  if (!startDate || !endDate) {
    throw new Error('Invalid date range: start and end dates are required');
  }

  // Calculate centroid of polygon
  const centroid = calculatePolygonCentroid(coordinates);
  
  // Map data source to API parameter
  const hourlyParams = [dataSource];
  
  // Add additional common parameters that might be useful
  if (dataSource === 'temperature_2m') {
    hourlyParams.push('relative_humidity_2m');
  }
  
  return fetchWeatherData({
    latitude: centroid.lat,
    longitude: centroid.lng,
    startDate,
    endDate,
    hourlyParams
  });
}

/**
 * Calculate the centroid (center point) of a polygon
 */
export function calculatePolygonCentroid(coordinates: LatLng[]): LatLng {
  if (coordinates.length === 0) {
    console.warn('Empty polygon coordinates, using default center point');
    // Return a default center point (roughly center of world map)
    return {
      lat: 0,
      lng: 0
    };
  }

  let latSum = 0;
  let lngSum = 0;

  for (const coord of coordinates) {
    // Validate individual coordinates
    if (typeof coord.lat !== 'number' || typeof coord.lng !== 'number' ||
        isNaN(coord.lat) || isNaN(coord.lng)) {
      console.warn('Invalid coordinate found, skipping:', coord);
      continue;
    }
    latSum += coord.lat;
    lngSum += coord.lng;
  }

  // Check if we have valid coordinates after filtering
  const validCoords = coordinates.filter(coord =>
    typeof coord.lat === 'number' && typeof coord.lng === 'number' &&
    !isNaN(coord.lat) && !isNaN(coord.lng)
  );

  if (validCoords.length === 0) {
    console.warn('No valid coordinates found, using default center point');
    return {
      lat: 0,
      lng: 0
    };
  }

  return {
    lat: latSum / validCoords.length,
    lng: lngSum / validCoords.length
  };
}

/**
 * Get weather value for a specific time from weather data
 */
export function getWeatherValueAtTime(
  weatherData: WeatherData,
  dataSource: string,
  targetTime: Date
): number | null {
  const { hourly } = weatherData;
  
  // Find the closest time index
  const targetTimeStr = targetTime.toISOString();
  let closestIndex = 0;
  let minDiff = Infinity;
  
  for (let i = 0; i < hourly.time.length; i++) {
    const timeStr = hourly.time[i];
    const timeDiff = Math.abs(new Date(timeStr).getTime() - targetTime.getTime());
    
    if (timeDiff < minDiff) {
      minDiff = timeDiff;
      closestIndex = i;
    }
  }
  
  // Get the value for the data source
  switch (dataSource) {
    case 'temperature_2m':
      return hourly.temperature_2m[closestIndex] ?? null;
    case 'relative_humidity_2m':
      return hourly.relative_humidity_2m?.[closestIndex] ?? null;
    case 'precipitation':
      return hourly.precipitation?.[closestIndex] ?? null;
    case 'wind_speed_10m':
      return hourly.wind_speed_10m?.[closestIndex] ?? null;
    default:
      return null;
  }
}

/**
 * Generate cache key for weather data
 */
export function generateCacheKey(
  coordinates: LatLng[],
  dataSource: string,
  startDate: string,
  endDate: string
): string {
  // Validate inputs
  if (!coordinates || !Array.isArray(coordinates)) {
    console.warn('Invalid coordinates for cache key, using default');
    coordinates = [];
  }

  const centroid = calculatePolygonCentroid(coordinates);
  return `${centroid.lat.toFixed(4)}_${centroid.lng.toFixed(4)}_${dataSource}_${startDate}_${endDate}`;
}
