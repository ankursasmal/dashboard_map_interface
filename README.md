# Weather Dashboard 🌍

An interactive weather data visualization dashboard built with Next.js, TypeScript, and Leaflet. Draw polygons on a map and visualize weather data with customizable color coding based on real-time weather information from the Open-Meteo API.

## ✨ Features

- **Interactive Map**: Click and draw polygons with 3-12 vertices
- **Time Control**: Navigate through a 30-day window (-15 to +15 days) with hourly precision
- **Dynamic Coloring**: Polygons change color based on weather data and user-defined rules
- **Multiple Data Sources**: Temperature, humidity, precipitation, and wind speed
- **Customizable Rules**: Define color thresholds with operators (<, <=, >, >=, =, !=)
- **Real-time Updates**: Weather data fetched from Open-Meteo API
- **Persistent State**: Polygons and settings saved in localStorage
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd weather-dashboard
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### 1. Drawing Polygons
1. Click the "Draw New Polygon" button in the sidebar
2. Click on the map to add vertices (minimum 3, maximum 12)
3. Double-click to finish drawing
4. Configure the polygon label and data source in the modal

### 2. Time Navigation
- Use the **Single Time** mode to view data at a specific hour
- Use the **Time Range** mode to select a time period
- Drag the slider handles to navigate through the 30-day window
- Timeline shows 15 days before and after the current date

### 3. Configuring Color Rules
1. Click the settings icon on any polygon in the sidebar
2. Add/edit color rules with different operators and thresholds
3. Click the color box to change colors
4. Rules are applied in order - first matching rule determines the color

### 4. Data Sources
Choose from multiple weather parameters:
- **Temperature (2m)**: Air temperature at 2 meters above ground
- **Relative Humidity (2m)**: Humidity percentage at 2 meters
- **Precipitation**: Rainfall amount in mm
- **Wind Speed (10m)**: Wind speed at 10 meters above ground

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Tailwind CSS
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── Map.tsx              # Interactive Leaflet map with polygon drawing
│   ├── TimeSlider.tsx       # Time navigation slider component
│   ├── Sidebar.tsx          # Polygon management and configuration
│   └── DataSourceModal.tsx  # Modal for configuring new polygons
├── lib/
│   ├── api.ts               # Open-Meteo API integration
│   └── utils.ts             # Utility functions and color rule logic
├── store/
│   └── useStore.ts          # Zustand state management
└── types/
    └── index.ts             # TypeScript type definitions
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet + React-Leaflet
- **State Management**: Zustand with persistence
- **UI Components**: Custom components with Lucide React icons
- **Slider**: RC-Slider for time navigation
- **API**: Open-Meteo Historical Weather API
- **HTTP Client**: Axios

## 🌐 API Integration

The dashboard uses the [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api) to fetch weather data:

- **No API key required** - Free and open access
- **Historical data** available for the past years
- **Hourly resolution** for precise time-based visualization
- **Multiple parameters** including temperature, humidity, precipitation, and wind

Example API call:
```
https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2025-07-18&end_date=2025-08-01&hourly=temperature_2m
```

## 💾 State Management

The application uses Zustand for state management with the following features:

- **Persistent storage**: Polygons and settings saved to localStorage
- **Real-time updates**: State changes trigger immediate UI updates
- **Data caching**: Weather API responses cached to minimize requests
- **Type safety**: Full TypeScript integration

### Key State Properties:
- `polygons`: Array of drawn polygons with their configurations
- `currentTime`: Selected time for data visualization
- `selectedTimeRange`: Time range for range mode
- `dataCache`: Cached weather API responses
- `isDrawing`: Drawing mode state

## 🎨 Customization

### Adding New Data Sources
1. Add new data source to `DATA_SOURCES` in `src/types/index.ts`
2. Update the API integration in `src/lib/api.ts`
3. Ensure the Open-Meteo API supports the new parameter

### Modifying Color Rules
- Default rules are defined in `src/lib/utils.ts`
- Color application logic in `applyColorRules` function
- Supports all comparison operators: `<`, `<=`, `>`, `>=`, `=`, `!=`

### Styling Changes
- Global styles in `src/app/globals.css`
- Component-specific styles using Tailwind CSS classes
- Custom slider styles for the time navigation component

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for providing free weather data API
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
- [Zustand](https://github.com/pmndrs/zustand) for simple state management
- [Next.js](https://nextjs.org/) for the amazing React framework
