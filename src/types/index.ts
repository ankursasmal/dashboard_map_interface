export interface LatLng {
  lat: number;
  lng: number;
}

export interface ColorRule {
  id: string;
  operator: '<' | '<=' | '>' | '>=' | '=' | '!=';
  value: number;
  color: string;
}

export interface Polygon {
  id: string;
  coordinates: LatLng[];
  label: string;
  dataSource: string;
  colorRules: ColorRule[];
  currentColor?: string;
  customColor?: string; // Manual color override
  isHighlighted?: boolean; // For finding/highlighting polygons
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
  };
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface SliderMode {
  type: 'single' | 'range';
  singleValue?: number;
  rangeValues?: [number, number];
}

export interface AppState {
  polygons: Polygon[];
  selectedTimeRange: TimeRange;
  currentTime: Date;
  dataCache: { [key: string]: WeatherData };
  isDrawing: boolean;
  selectedPolygon: string | null;
  sliderMode: SliderMode;
  mapCenter: LatLng;
  mapZoom: number;

  // Actions
  addPolygon: (polygon: Polygon) => void;
  updatePolygon: (id: string, updates: Partial<Polygon>) => void;
  deletePolygon: (id: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setCurrentTime: (time: Date) => void;
  setIsDrawing: (drawing: boolean) => void;
  setSelectedPolygon: (id: string | null) => void;
  setSliderMode: (mode: SliderMode) => void;
  setMapCenter: (center: LatLng) => void;
  setMapZoom: (zoom: number) => void;
  cacheWeatherData: (key: string, data: WeatherData) => void;
  fetchWeatherDataForPolygon: (polygonId: string) => Promise<WeatherData | undefined>;
  updatePolygonColor: (polygonId: string) => void;
  fetchAllPolygonsWeatherData: () => Promise<void>;
  updateAllPolygonColors: () => void;
  setPolygonCustomColor: (polygonId: string, color: string) => void;
  clearPolygonCustomColor: (polygonId: string) => void;
  highlightPolygon: (polygonId: string) => void;
  clearAllHighlights: () => void;
  findPolygonsByLabel: (searchTerm: string) => Polygon[];
}

export interface DataSource {
  id: string;
  label: string;
  unit: string;
  apiField: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'temperature_2m',
    label: 'Temperature (2m)',
    unit: '°C',
    apiField: 'temperature_2m'
  },
  {
    id: 'relative_humidity_2m',
    label: 'Relative Humidity (2m)',
    unit: '%',
    apiField: 'relative_humidity_2m'
  },
  {
    id: 'precipitation',
    label: 'Precipitation',
    unit: 'mm',
    apiField: 'precipitation'
  },
  {
    id: 'wind_speed_10m',
    label: 'Wind Speed (10m)',
    unit: 'km/h',
    apiField: 'wind_speed_10m'
  }
];
