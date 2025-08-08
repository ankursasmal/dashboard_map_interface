# Weather Map Dashboard - Features Documentation

## Overview
This is a comprehensive weather map dashboard application built with Next.js, TypeScript, and Leaflet. It provides interactive polygon drawing, data visualization, and timeline controls for weather data analysis.

## Key Features Implemented

### 1. Interactive Map with Polygon Drawing
- **Leaflet-based map** with OpenStreetMap tiles
- **Draggable polygon creation** with 3-12 vertices
- **Real-time polygon editing** and deletion
- **Visual feedback** during drawing mode
- **Polygon labeling** with editable names

### 2. Advanced Timeline Slider (Matches Reference Design)
- **30-day time window** (15 days before/after current date)
- **Dual-mode operation**:
  - Single handle for point-in-time selection
  - Dual-ended range for time period selection
- **Orange/yellow gradient styling** matching reference design
- **Hourly resolution** with visual time markers
- **Real-time value display** with formatted timestamps

### 3. Data Source Selection Sidebar (Matches Reference Design)
- **Multiple data source support**:
  - Temperature (°C)
  - Humidity (%)
  - Wind Speed (m/s)
  - Pressure (hPa)
- **One data source per polygon** constraint
- **Mandatory data source selection** (Open-Meteo as default)

### 4. Color Rule Configuration (Matches Reference Design)
- **Threshold-based coloring rules** with operators:
  - `<` (less than)
  - `<=` (less than or equal)
  - `>` (greater than)
  - `>=` (greater than or equal)
  - `=` (equal)
  - `!=` (not equal)
- **Visual color picker** with click-to-change functionality
- **Drag handle** for rule reordering (GripVertical icon)
- **Add/delete rules** with intuitive UI
- **Example rules display** showing:
  - `< 10` → Red
  - `≥ 10 and < 25` → Blue
  - `≥ 25` → Green

### 5. State Management
- **Zustand store** for global state management
- **Persistent polygon data** with unique IDs
- **Real-time updates** across all components
- **Type-safe interfaces** for all data structures

### 6. UI Components
- **Ant Design integration** for consistent styling
- **Lucide React icons** for modern iconography
- **Responsive design** with Tailwind CSS
- **Smooth animations** and transitions

## Technical Implementation

### Data Sources Configuration
```typescript
const DATA_SOURCES = [
  { id: 'temperature', label: 'Temperature', unit: '°C', apiField: 'temperature_2m' },
  { id: 'humidity', label: 'Humidity', unit: '%', apiField: 'relative_humidity_2m' },
  { id: 'windspeed', label: 'Wind Speed', unit: 'm/s', apiField: 'wind_speed_10m' },
  { id: 'pressure', label: 'Pressure', unit: 'hPa', apiField: 'surface_pressure' }
];
```

### Color Rule Structure
```typescript
interface ColorRule {
  id: string;
  operator: '=' | '<' | '>' | '<=' | '>=' | '!=';
  value: number;
  color: string;
}
```

### Polygon Structure
```typescript
interface Polygon {
  id: string;
  label: string;
  coordinates: [number, number][];
  dataSource: string;
  colorRules: ColorRule[];
}
```

## File Structure
```
src/
├── components/
│   ├── Map.tsx              # Main map component with polygon drawing
│   ├── Sidebar.tsx          # Data source selection and color rules
│   ├── TimeSlider.tsx       # Timeline control component
│   └── DataSourceModal.tsx  # Modal for data source configuration
├── store/
│   └── useStore.ts          # Zustand state management
├── types/
│   └── index.ts             # TypeScript type definitions
├── lib/
│   └── utils.ts             # Utility functions
└── app/
    └── page.tsx             # Main application page
```

## Usage Instructions

### Drawing Polygons
1. Click "Draw New Polygon" in the sidebar
2. Click on the map to add vertices (3-12 vertices required)
3. Double-click to finish drawing
4. Configure the polygon with data source and color rules

### Setting Up Color Rules
1. Select a polygon from the sidebar
2. Click the settings icon to expand configuration
3. Choose a data source from the dropdown
4. Add color rules using the "+" button
5. Configure each rule with:
   - Color (click the color circle)
   - Operator (dropdown selection)
   - Threshold value (numeric input)
6. Use the drag handle to reorder rules

### Timeline Control
1. Choose between single handle or dual-ended range mode
2. Drag handles to select time periods
3. View real-time updates in the value displays
4. Use the 30-day window for comprehensive analysis

## API Integration Ready
The application is structured to easily integrate with weather APIs:
- Open-Meteo API configuration included
- Flexible data source mapping
- Real-time data fetching capabilities
- Error handling and loading states

## Future Enhancements
- Real weather data integration
- Export functionality for polygons and rules
- Advanced filtering options
- Historical data analysis
- Multi-layer visualization
