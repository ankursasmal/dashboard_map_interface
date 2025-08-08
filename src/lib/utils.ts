import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ColorRule } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const applyColorRules = (value: number, rules: ColorRule[]): string => {
  // Sort rules by value to apply them in order
  const sortedRules = [...rules].sort((a, b) => a.value - b.value);

  for (const rule of sortedRules) {
    const { operator, value: ruleValue, color } = rule;

    switch (operator) {
      case '<':
        if (value < ruleValue) return color;
        break;
      case '<=':
        if (value <= ruleValue) return color;
        break;
      case '>':
        if (value > ruleValue) return color;
        break;
      case '>=':
        if (value >= ruleValue) return color;
        break;
      case '=':
        if (Math.abs(value - ruleValue) < 0.01) return color;
        break;
      case '!=':
        if (Math.abs(value - ruleValue) >= 0.01) return color;
        break;
    }
  }

  return '#808080'; // Default gray color
};

export const formatDateTime = (date: Date): string => {
  try {
    // Use a more predictable formatting approach to avoid hydration issues
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${month} ${day}, ${year}, ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const getDefaultColorRules = (): ColorRule[] => [
  {
    id: generateId(),
    operator: '<',
    value: 10,
    color: '#ef4444' // Red
  },
  {
    id: generateId(),
    operator: '>=',
    value: 10,
    color: '#3b82f6' // Blue
  },
  {
    id: generateId(),
    operator: '>=',
    value: 25,
    color: '#22c55e' // Green
  }
];
