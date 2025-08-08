import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Range } from 'react-range';
import { addDays, addHours, format } from 'date-fns';
import { Button } from 'antd';
import useStore from '@/store/useStore';
import { formatDateTime } from '@/lib/utils';

const TimeSlider: React.FC = () => {
  const {
    selectedTimeRange,
    currentTime,
    sliderMode,
    setTimeRange,
    setCurrentTime,
    setSliderMode
  } = useStore();

  // All useState hooks must be called first
  const [isClient, setIsClient] = useState(false);
  const [singleValues, setSingleValues] = useState([360]); // Default to center
  const [rangeValues, setRangeValues] = useState([336, 384]); // Default 48-hour range around center

  // Calculate the total hours in the range (-15 days to +15 days = 30 days = 720 hours)
  const totalHours = 720; // 30 days * 24 hours
  
  // Use a fixed date to avoid hydration issues, then update on client
  const centerDate = useMemo(() => {
    return isClient ? new Date() : new Date('2024-01-01T12:00:00Z');
  }, [isClient]);

  // All useEffect hooks must be called before any early returns
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setSingleValues([getCurrentSliderValue()]);
      setRangeValues(getRangeSliderValues());
    }
  }, [currentTime, selectedTimeRange, isClient]);
  
  // Helper functions - moved before useEffect to fix dependency warnings
  const getCurrentSliderValue = useCallback((): number => {
    try {
      let timeToUse: Date;
      if (!currentTime) {
        timeToUse = new Date();
      } else if (currentTime instanceof Date) {
        timeToUse = currentTime;
      } else {
        timeToUse = new Date(currentTime);
      }
      
      if (isNaN(timeToUse.getTime())) {
        return Math.floor(totalHours / 2);
      }
      
      const diffInMs = timeToUse.getTime() - centerDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      return Math.max(0, Math.min(totalHours - 1, diffInHours));
    } catch (error) {
      console.error('Error in getCurrentSliderValue:', error);
      return Math.floor(totalHours / 2);
    }
  }, [currentTime, centerDate, totalHours]);

  const getRangeSliderValues = useCallback((): [number, number] => {
    try {
      if (!selectedTimeRange?.start || !selectedTimeRange?.end) {
        const center = Math.floor(totalHours / 2);
        return [center - 24, center + 24];
      }
      
      let startDate_range: Date, endDate_range: Date;
      
      if (selectedTimeRange.start instanceof Date) {
        startDate_range = selectedTimeRange.start;
      } else {
        startDate_range = new Date(selectedTimeRange.start);
      }
      
      if (selectedTimeRange.end instanceof Date) {
        endDate_range = selectedTimeRange.end;
      } else {
        endDate_range = new Date(selectedTimeRange.end);
      }
      
      if (isNaN(startDate_range.getTime()) || isNaN(endDate_range.getTime())) {
        const center = Math.floor(totalHours / 2);
        return [center - 24, center + 24];
      }
      
      const startDiffInMs = startDate_range.getTime() - centerDate.getTime();
      const endDiffInMs = endDate_range.getTime() - centerDate.getTime();
      
      const startHours = Math.max(0, Math.floor(startDiffInMs / (1000 * 60 * 60)));
      const endHours = Math.min(totalHours - 1, Math.floor(endDiffInMs / (1000 * 60 * 60)));
      
      return [startHours, endHours];
    } catch (error) {
      console.error('Error in getRangeSliderValues:', error);
      const center = Math.floor(totalHours / 2);
      return [center - 24, center + 24];
    }
  }, [selectedTimeRange, centerDate, totalHours]);

  // Validate center date
  if (isNaN(centerDate.getTime())) {
    console.error('Invalid center date');
    return <div className="p-4 text-red-500">Error: Invalid date</div>;
  }
  
  const startDate = addDays(centerDate, -15);
  const endDate = addDays(centerDate, 15);
  
  // Validate calculated dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Invalid start or end date');
    return <div className="p-4 text-red-500">Error: Invalid date range</div>;
  }

  if (!isClient) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Time Control</h2>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const sliderValueToDate = (value: number): Date => {
    return addHours(startDate, value);
  };

  const handleSingleValueChange = (values: number[]) => {
    setSingleValues(values);
    const newTime = sliderValueToDate(values[0]);
    setCurrentTime(newTime);
  };

  const handleRangeValueChange = (values: number[]) => {
    setRangeValues(values);
    const startTime = sliderValueToDate(values[0]);
    const endTime = sliderValueToDate(values[1]);
    setTimeRange({ start: startTime, end: endTime });
  };

  const toggleSliderMode = () => {
    setSliderMode(sliderMode.type === 'single'
      ? { type: 'range', rangeValues: [0, 720] }
      : { type: 'single', singleValue: 360 }
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Time Control</h2>
          <Button onClick={toggleSliderMode} size="small">
            {sliderMode.type === 'single' ? 'Switch to Range' : 'Switch to Single'}
          </Button>
        </div>

        <div className="space-y-4">
          {sliderMode.type === 'single' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Time</span>
                <span className="text-sm text-gray-500">
                  {formatDateTime(sliderValueToDate(singleValues[0]))}
                </span>
              </div>
              <Range
                step={1}
                min={0}
                max={totalHours - 1}
                values={singleValues}
                onChange={handleSingleValueChange}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    className="w-full h-2 bg-gray-200 rounded-full"
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    className="w-4 h-4 bg-blue-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  />
                )}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Time Range</span>
                <span className="text-sm text-gray-500">
                  {formatDateTime(sliderValueToDate(rangeValues[0]))} - {formatDateTime(sliderValueToDate(rangeValues[1]))}
                </span>
              </div>
              <Range
                step={1}
                min={0}
                max={totalHours - 1}
                values={rangeValues}
                onChange={handleRangeValueChange}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    className="w-full h-2 bg-gray-200 rounded-full"
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props, index }) => (
                  <div
                    {...props}
                    className={`w-4 h-4 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      index === 0 
                        ? 'bg-green-500 focus:ring-green-500' 
                        : 'bg-red-500 focus:ring-red-500'
                    }`}
                  />
                )}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{format(startDate, 'MMM dd, yyyy')}</span>
            <span>{format(endDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
