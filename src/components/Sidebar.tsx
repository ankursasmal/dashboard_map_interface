'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Edit3, Settings, GripVertical } from 'lucide-react';
import useStore from '@/store/useStore';
import { DATA_SOURCES, ColorRule, Polygon } from '@/types';
import { generateId, getDefaultColorRules } from '@/lib/utils';

interface ColorRuleEditorProps {
  rule: ColorRule;
  onUpdate: (rule: ColorRule) => void;
  onDelete: () => void;
}

const ColorRuleEditor: React.FC<ColorRuleEditorProps> = ({ rule, onUpdate, onDelete }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Drag Handle */}
      <div className="cursor-move text-gray-400 hover:text-gray-600">
        <GripVertical size={16} />
      </div>

      {/* Color Circle */}
      <div
        className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        style={{ backgroundColor: rule.color }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = rule.color;
          input.onchange = (e) => {
            onUpdate({ ...rule, color: (e.target as HTMLInputElement).value });
          };
          input.click();
        }}
        title="Click to change color"
      />

      {/* Operator Selector */}
      <select
        value={rule.operator}
        onChange={(e) => onUpdate({ ...rule, operator: e.target.value as ColorRule['operator'] })}
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="<">&lt;</option>
        <option value="<=">&le;</option>
        <option value=">">&gt;</option>
        <option value=">=">&ge;</option>
        <option value="=">=</option>
        <option value="!=">&ne;</option>
      </select>

      {/* Value Input */}
      <input
        type="number"
        value={rule.value}
        onChange={(e) => onUpdate({ ...rule, value: parseFloat(e.target.value) || 0 })}
        className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        step="0.1"
        placeholder="Value"
      />

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
        title="Delete rule"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

interface PolygonConfigProps {
  polygon: Polygon;
  onUpdate: (updates: Partial<Polygon>) => void;
  onDelete: () => void;
}

const PolygonConfig: React.FC<PolygonConfigProps> = ({ polygon, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(polygon.label);

  const handleLabelSave = () => {
    onUpdate({ label: labelValue });
    setIsEditingLabel(false);
  };

  const addColorRule = () => {
    const newRule: ColorRule = {
      id: generateId(),
      operator: '>=',
      value: 0,
      color: '#3b82f6'
    };
    onUpdate({ colorRules: [...polygon.colorRules, newRule] });
  };

  const updateColorRule = (ruleId: string, updatedRule: ColorRule) => {
    onUpdate({
      colorRules: polygon.colorRules.map(rule =>
        rule.id === ruleId ? updatedRule : rule
      )
    });
  };

  const deleteColorRule = (ruleId: string) => {
    onUpdate({
      colorRules: polygon.colorRules.filter(rule => rule.id !== ruleId)
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isEditingLabel ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                className="text-sm border rounded px-2 py-1 w-24"
                onBlur={handleLabelSave}
                onKeyPress={(e) => e.key === 'Enter' && handleLabelSave()}
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm">{polygon.label}</span>
              <button
                onClick={() => setIsEditingLabel(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 size={12} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Data Source
        </label>
        <select
          value={polygon.dataSource}
          onChange={(e) => onUpdate({ dataSource: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        >
          {DATA_SOURCES.map(source => (
            <option key={source.id} value={source.apiField}>
              {source.label} ({source.unit})
            </option>
          ))}
        </select>
      </div>

      {isExpanded && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">
              Color Rules
            </label>
            <button
              onClick={addColorRule}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <Plus size={12} />
            </button>
          </div>
          
          <div className="space-y-2">
            {polygon.colorRules.map(rule => (
              <ColorRuleEditor
                key={rule.id}
                rule={rule}
                onUpdate={(updatedRule) => updateColorRule(rule.id, updatedRule)}
                onDelete={() => deleteColorRule(rule.id)}
              />
            ))}
          </div>

          {polygon.colorRules.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">Example rules:</div>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <span className="text-red-600 font-mono">{'< 10'}</span>
                  <span className="mx-2">→</span>
                  <span className="text-red-600">Red</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-blue-600 font-mono">{'≥ 10 and < 25'}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600">Blue</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-green-600 font-mono">{'≥ 25'}</span>
                  <span className="mx-2">→</span>
                  <span className="text-green-600">Green</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const {
    isDrawing,
    setIsDrawing
  } = useStore();

  const handleStartDrawing = () => {
    setIsDrawing(true);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Polygon Controls
        </h2>
        
        <button
          onClick={handleStartDrawing}
          disabled={isDrawing}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isDrawing
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={16} />
          {isDrawing ? 'Drawing Mode Active' : 'Start Drawing Polygon'}
        </button>

        {isDrawing && (
          <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-2">📍 Drawing Instructions:</p>
            <ul className="text-xs space-y-1">
              <li>• Click on the map to add vertices</li>
              <li>• Double-click to complete the polygon</li>
              <li>• Need at least 3 vertices</li>
              <li>• Configure data source after creation</li>
            </ul>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Quick Tips:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use the search above to find polygons</li>
            <li>• Click the color button to customize colors</li>
            <li>• Click the eye button to highlight on map</li>
            <li>• Weather data updates automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
