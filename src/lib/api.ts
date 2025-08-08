import axios from 'axios';
import { format } from 'date-fns';
import { WeatherData, LatLng } from '@/types';

const OPEN_METEO_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface WeatherApiParams {
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  hourlyParams: string[];
}

export const fetchWeatherData = async (params: WeatherApiParams): Promise<WeatherData> => {
  const { latitude, longitude, startDate, endDate, hourlyParams } = params;
  
  const url = new URL(OPEN_METEO_BASE_URL);
  url.searchParams.append('latitude', latitude.toString());
  url.searchParams.append('longitude', longitude.toString());
  url.searchParams.append('start_date', format(startDate, 'yyyy-MM-dd'));
  url.searchParams.append('end_date', format(endDate, 'yyyy-MM-dd'));
  url.searchParams.append('hourly', hourlyParams.join(','));
  url.searchParams.append('timezone', 'auto');

  try {
    const response = await axios.get(url.toString());
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};

export const getPolygonCentroid = (coordinates: LatLng[]): LatLng => {
  if (coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  };
};

export const generateCacheKey = (
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date,
  dataSource: string
): string => {
  return `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}_${dataSource}`;
};

export const getValueAtTime = (weatherData: WeatherData, targetTime: Date, dataSource: string): number | null => {
  const { hourly } = weatherData;
  const targetTimeString = targetTime.toISOString();
  
  const timeIndex = hourly.time.findIndex(time => {
    const timeDate = new Date(time);
    return Math.abs(timeDate.getTime() - targetTime.getTime()) < 30 * 60 * 1000; // 30 minutes tolerance
  });

  if (timeIndex === -1) return null;

  const dataArray = hourly[dataSource as keyof typeof hourly] as number[];
  return dataArray?.[timeIndex] ?? null;
};
