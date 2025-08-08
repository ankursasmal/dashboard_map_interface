'use client';

import React, { useState } from 'react';
import { Input, Button, Card, Space, Tooltip, message, Popover } from 'antd';
import { SearchOutlined, BgColorsOutlined, EyeOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import useStore from '@/store/useStore';

const { Search } = Input;

const PolygonManager: React.FC = () => {
  const { 
    polygons, 
    setPolygonCustomColor, 
    clearPolygonCustomColor, 
    highlightPolygon, 
    clearAllHighlights,
    findPolygonsByLabel,
    deletePolygon
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Predefined color palette
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      const results = findPolygonsByLabel(value);
      setSearchResults(results.map(p => p.id));
      
      if (results.length > 0) {
        message.success(`Found ${results.length} polygon(s)`);
        // Highlight first result
        highlightPolygon(results[0].id);
      } else {
        message.info('No polygons found');
        clearAllHighlights();
      }
    } else {
      setSearchResults([]);
      clearAllHighlights();
    }
  };

  const handleColorSelect = (polygonId: string, color: string) => {
    setPolygonCustomColor(polygonId, color);
    message.success('Color applied to polygon');
  };

  const handleClearColor = (polygonId: string) => {
    clearPolygonCustomColor(polygonId);
    message.success('Custom color cleared');
  };

  const handleHighlight = (polygonId: string) => {
    highlightPolygon(polygonId);
    message.success('Polygon highlighted on map');
  };

  const ColorPicker = ({ polygonId, currentColor }: { polygonId: string; currentColor?: string }) => (
    <div className="p-3">
      <div className="text-sm font-medium mb-2">Choose Color:</div>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {colorPalette.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
              currentColor === color ? 'border-gray-800' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(polygonId, color)}
            title={color}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          className="w-full h-8 rounded border cursor-pointer"
          onChange={(e) => handleColorSelect(polygonId, e.target.value)}
          title="Custom color picker"
        />
        <Button 
          size="small" 
          onClick={() => handleClearColor(polygonId)}
          title="Clear custom color"
        >
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Polygon Manager</h3>
        <Button 
          size="small" 
          onClick={clearAllHighlights}
          icon={<ClearOutlined />}
          title="Clear all highlights"
        >
          Clear Highlights
        </Button>
      </div>

      {/* Search Section */}
      <div className="mb-4">
        <Search
          placeholder="Search polygons by name..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              setSearchTerm('');
              setSearchResults([]);
              clearAllHighlights();
            }
          }}
        />
        {searchResults.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Found {searchResults.length} polygon(s) matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {/* Polygons List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {polygons.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No polygons created yet. Draw some polygons on the map!
          </div>
        ) : (
          polygons.map((polygon) => (
            <Card
              key={polygon.id}
              size="small"
              className={`transition-all duration-200 ${
                polygon.isHighlighted 
                  ? 'ring-2 ring-yellow-400 bg-yellow-50' 
                  : searchResults.includes(polygon.id)
                  ? 'ring-2 ring-blue-400 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ 
                        backgroundColor: polygon.customColor || polygon.currentColor || '#808080' 
                      }}
                    />
                    <span className="font-medium">{polygon.label}</span>
                    {polygon.customColor && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        Custom
                      </span>
                    )}
                    {polygon.isHighlighted && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                        📍 Found
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Source: {polygon.dataSource} • {polygon.coordinates.length} points
                  </div>
                </div>
                
                <Space>
                  <Popover
                    content={<ColorPicker polygonId={polygon.id} currentColor={polygon.customColor} />}
                    title="Polygon Color"
                    trigger="click"
                    placement="left"
                  >
                    <Tooltip title="Change color">
                      <Button 
                        size="small" 
                        icon={<BgColorsOutlined />}
                        type={polygon.customColor ? "primary" : "default"}
                      />
                    </Tooltip>
                  </Popover>
                  
                  <Tooltip title="Find on map">
                    <Button 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => handleHighlight(polygon.id)}
                      type={polygon.isHighlighted ? "primary" : "default"}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Delete polygon">
                    <Button 
                      size="small" 
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => {
                        deletePolygon(polygon.id);
                        message.success('Polygon deleted');
                      }}
                    />
                  </Tooltip>
                </Space>
              </div>
            </Card>
          ))
        )}
      </div>

      {polygons.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            Total: {polygons.length} polygon(s) • 
            {polygons.filter(p => p.customColor).length} with custom colors
          </div>
        </div>
      )}
    </div>
  );
};

export default PolygonManager;
