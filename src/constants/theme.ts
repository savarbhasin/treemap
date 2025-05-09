import { TreemapTheme } from '../lib/types';

export const defaultTreemapTheme: TreemapTheme = {
  // Container
  containerBackground: '#f9f9f9',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",

  // Node
  nodeDefaultBackgroundColor: 'rgba(200, 200, 200, 0.7)',
  nodePositiveBackgroundColor: 'rgba(163, 225, 167, 0.8)', // Softer default green
  nodeNegativeBackgroundColor: 'rgba(245, 169, 169, 0.8)', // Softer default red
  nodeBorderColor: 'rgba(0, 0, 0, 0.1)',
  nodeBorderWidth: 1,
  nodeHoverBorderColor: 'rgba(0, 0, 0, 0.5)',
  // nodeHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)', // Example
  nodeTextColor: '#333333',
  nodeFontSize: '12px',

  // Tooltip (for default tooltip)
  tooltipBackgroundColor: 'rgba(255, 255, 255, 0.98)',
  tooltipBorderColor: 'rgba(0,0,0,0.1)',
  tooltipBorderRadius: '8px',
  tooltipShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  tooltipTextColor: '#2c3e50',
  tooltipFontSize: '13px',
  tooltipPadding: '8px 12px',
};