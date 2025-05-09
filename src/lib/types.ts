import React from 'react';

// --- Core Data Item ---
// User provides an array of items that conform to this (or extend it)
export interface TreemapDataItem {
  id: string | number; // Unique identifier for keys and tracking
  value: number;       // Used for calculating area
  [key: string]: any;  // Allow any other custom data user wants to associate
}

// --- Layout Data Point (Internal) ---
// This is what the squarify algorithm and node/tooltip renderers will receive
export type LayoutDataPoint<T extends TreemapDataItem = TreemapDataItem> = T & {
  x: number;
  y: number;
  width: number;
  height: number;
  scaledValue: number; // Area this item occupies based on its original value
};

// --- Theme ---
// Defines all customizable style properties
export interface TreemapTheme {
  // Container
  containerBackground: string;
  fontFamily: string; // A general font family for default elements

  // Node
  nodeDefaultBackgroundColor: string; // Fallback if not positive/negative
  nodePositiveBackgroundColor: string;
  nodeNegativeBackgroundColor: string;
  nodeBorderColor: string;
  nodeBorderWidth: number;
  nodeHoverBorderColor: string; // Optional: for hover effects on the wrapper
  nodeHoverBackgroundColor?: string; // Optional: for hover effects on the wrapper
  nodeTextColor: string; // For default node's text content
  nodeFontSize: string;  // For default node's text content

  // Tooltip (for default tooltip)
  tooltipBackgroundColor: string;
  tooltipBorderColor: string;
  tooltipBorderRadius: string;
  tooltipShadow: string;
  tooltipTextColor: string;
  tooltipFontSize: string;
  tooltipPadding: string;
}

// --- Props for Custom Renderers ---
export interface NodeRenderProps<T extends TreemapDataItem = TreemapDataItem> {
  item: LayoutDataPoint<T>;
  isHovered: boolean;
  isPositive: boolean; // Based on positiveThreshold
  width: number;       // Actual display width of the node content area (after gap)
  height: number;      // Actual display height of the node content area (after gap)
  theme: TreemapTheme; // The resolved theme object
}

export interface TooltipRenderProps<T extends TreemapDataItem = TreemapDataItem> {
  item: LayoutDataPoint<T> | null; // The hovered item, or null
  mouseX: number;
  mouseY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  theme: TreemapTheme; // The resolved theme object
}

// --- Main Component Props ---
export interface TreeMapVisualizationProps<T extends TreemapDataItem = TreemapDataItem> {
  data: T[];
  valueAccessor: (item: T) => number; // How to get the numeric value for area calculation
  idAccessor: (item: T) => string | number; // How to get a unique ID

  positiveThreshold?: number;
  gap?: number;

  width?: string | number;
  height?: string | number;

  theme?: Partial<TreemapTheme>; // User can override parts of the default theme

  // Custom class and style props
  containerClassName?: string;
  containerStyle?: React.CSSProperties;

  nodeWrapperClassName?: string | ((item: LayoutDataPoint<T>) => string);
  nodeWrapperStyle?: React.CSSProperties | ((item: LayoutDataPoint<T>) => React.CSSProperties);

  tooltipWrapperClassName?: string; // For the default tooltip wrapper
  tooltipWrapperStyle?: React.CSSProperties; // For the default tooltip wrapper

  // Custom render functions
  renderNode?: (props: NodeRenderProps<T>) => React.ReactNode;
  renderTooltip?: (props: TooltipRenderProps<T>) => React.ReactNode;

  // Optional: For identifying what is 'positive'/'negative' if not using value directly
  // For example, if `item.value` is an absolute number, but `item.change` determines color.
  valueForColoring?: (item: T) => number;
}