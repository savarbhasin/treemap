# Treemap Customizable for React

[![npm version](https://badge.fury.io/js/treemap-customizable.svg)](https://badge.fury.io/js/treemap-customizable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A highly flexible and customizable treemap visualization component for React, built with TypeScript. It allows you to visualize hierarchical data as a set of nested rectangles, where the area of each rectangle is proportional to its value.

This library offers deep customization through:
*   **Generic Data Handling**: Use your own data structures.
*   **Accessor Props**: Define how to extract IDs and values from your data.
*   **Custom Rendering**: Provide your own React components to render individual treemap nodes and tooltips.
*   **Theming**: Easily customize colors, fonts, and other styles with a theme object.
*   **CSS Classes & Styles**: Apply custom CSS classes and inline styles to various elements.

## Features

*   **Squarified Algorithm**: Optimizes for aspect ratios close to 1, making rectangles more square-like.
*   **Responsive**: Adapts to the size of its container.
*   **Customizable Nodes**: Full control over the appearance and content of each treemap cell.
*   **Customizable Tooltips**: Design tooltips to display any information from your data.
*   **Theming Support**: Easily override default styles.
*   **TypeScript Support**: Written in TypeScript, providing strong typing.
*   **No External CSS Dependencies**: Styles are managed via inline styles and a theme object, making it framework-agnostic.

## Installation

```bash
npm install treemap-customizable
# or
yarn add treemap-customizable

## Basic Usage

```tsx
import React from 'react';
import { CustomTreeMapVisualization, TreemapDataItem } from 'treemap-customizable';

// 1. Define your data structure
interface MyDataType extends TreemapDataItem {
  name: string;
}

const App = () => {
  const data: MyDataType[] = [
    { id: 'a1', value: 100, name: 'Alpha' },
    { id: 'b1', value: 75, name: 'Beta' },
    { id: 'c1', value: 50, name: 'Gamma' },
  ];

  // 2. Define accessor functions
  const valueAccessor = (item: MyDataType) => item.value;
  const idAccessor = (item: MyDataType) => item.id;

  return (
    // Ensure parent has defined dimensions for the treemap
    <div className="w-full h-[500px] border border-gray-300 p-2 rounded-lg shadow">
      <CustomTreeMapVisualization<MyDataType>
        data={data}
        valueAccessor={valueAccessor}
        idAccessor={idAccessor}
        gap={4} // Gap between cells
        // Example: Override default container styling
        // containerClassName="bg-blue-50 rounded-md"
      />
    </div>
  );
};

export default App;
```

## Advanced Customization Example

```tsx
import React from 'react';
import {
  CustomTreeMapVisualization,
  TreemapDataItem,
  NodeRenderProps,
  TooltipRenderProps,
} from 'treemap-customizable';

interface ProductData extends TreemapDataItem {
  productName: string;
  department: string;
  sales: number;
  imageUrl?: string;
  change: number; // For conditional styling
}

const productDataset: ProductData[] = [
  { id: 'P101', sales: 1200, productName: 'SuperWidget', department: 'Electronics', imageUrl: 'https://via.placeholder.com/60', change: 5.2 },
  { id: 'P102', sales: 850, productName: 'MegaGear', department: 'Appliances', imageUrl: 'https://via.placeholder.com/60', change: -1.5 },
  // ... more products
];

// Custom Node Renderer using Tailwind CSS
const ProductNode: React.FC<NodeRenderProps<ProductData>> = ({ item, width, height, isHovered }) => {
  // Conditional Tailwind classes
  const baseClasses = "p-2 h-full flex flex-col items-center justify-around box-border text-center overflow-hidden rounded transition-all duration-200";
  const colorClasses = item.change > 0 
    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
    : "bg-rose-500 hover:bg-rose-600 text-white";
  const hoverEffectClasses = isHovered ? "ring-2 ring-offset-1 ring-sky-400 shadow-xl transform scale-105" : "shadow-md";
  
  const showImage = width > 70 && height > 60;

  return (
    <div className={`${baseClasses} ${colorClasses} ${hoverEffectClasses}`}>
      <strong className="text-xs md:text-sm font-semibold truncate w-full px-1">
        {item.productName}
      </strong>
      {showImage && item.imageUrl && 
        <img 
          src={item.imageUrl} 
          alt={item.productName} 
          className="max-h-[40%] max-w-[40%] my-1 object-contain rounded-sm"
        />
      }
      <span className="text-xxs md:text-xs opacity-90">Dept: {item.department}</span>
      <span className="text-sm md:text-base font-bold">${item.sales.toLocaleString()}</span>
    </div>
  );
};

// Custom Tooltip Renderer using Tailwind CSS
const ProductTooltip: React.FC<TooltipRenderProps<ProductData>> = ({ item }) => {
  if (!item) return null;
  return (
    // This content will be wrapped by the library's tooltip wrapper
    // The wrapper itself can be styled via tooltipWrapperBaseClass or tooltipWrapperClassName
    <div className="p-3 text-sm">
      <h4 className="text-base font-bold mb-2">{item.productName} <span className="text-xs opacity-70">({item.id})</span></h4>
      <p className="mb-1">Sales: <span className="font-semibold">${item.sales.toLocaleString()}</span></p>
      <p className="mb-1">Department: {item.department}</p>
      <p className={`font-medium ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
        Change: {item.change.toFixed(1)}%
      </p>
    </div>
  );
};

const MyAdvancedApp = () => {
  return (
    <div className="w-full h-[600px] p-4 bg-slate-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4 text-slate-700">Product Performance Treemap</h2>
      <CustomTreeMapVisualization<ProductData>
        data={productDataset}
        valueAccessor={d => d.sales}
        idAccessor={d => d.id}
        valueForColoring={d => d.change} // Used by default node logic if renderNode not provided
        positiveThreshold={0}
        gap={6}
        renderNode={ProductNode}
        renderTooltip={ProductTooltip}
        // Override base classes for main container and default tooltip wrapper
        containerBaseClass="relative overflow-hidden w-full h-full bg-slate-200 rounded-lg"
        tooltipWrapperBaseClass="fixed py-2 px-4 shadow-2xl rounded-lg z-[1000] pointer-events-none bg-slate-800 text-slate-100 border border-slate-700"
        // Add specific classes for node wrappers (applied to the div TreeMapNode creates)
        nodeWrapperClassName={(item) => item.sales > 1000 ? "border-2 border-amber-400" : "border border-slate-300"}
      />
    </div>
  );
};
```
## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
data | T[] (where T extends TreemapDataItem) | Required | Array of your data items. |
valueAccessor | (item: T) => number | Required | Function to extract the numeric value (>= 0) for area calculation from each item. |
idAccessor | (item: T) => string | number | Required | Function to extract a unique ID from each item for keys and tracking. |
positiveThreshold | number | 0 | Value above which an item is considered "positive" for default node coloring if valueForColoring is used. |
valueForColoring | (item: T) => number | undefined | Optional. Function to extract the value used for determining positive/negative node coloring (uses theme's positive/negative colors). If not provided, the main valueAccessor result is used with positiveThreshold. |
gap | number | 4 | Gap between treemap cells in pixels. |
width | string | number | '100%' | Width of the treemap container (e.g., '100%', 500, '50em'). |
height | string | number | '600px' | Height of the treemap container (e.g., '600px', 400). |
theme | Partial<TreemapTheme> | {...} | Object to customize default colors, fonts, etc. Merged with defaultTreemapTheme. |
containerClassName | string | undefined | CSS class for the main container div. |
containerStyle | React.CSSProperties | undefined | Inline styles for the main container div. |
nodeWrapperClassName | string | ((item: LayoutDataPoint<T>) => string) | undefined | CSS class(es) for each node's wrapping div. Can be a function. |
nodeWrapperStyle | React.CSSProperties | ((item: LayoutDataPoint<T>) => React.CSSProperties) | undefined | Inline style(s) for each node's wrapping div. Can be a function. |
tooltipWrapperClassName | string | undefined | CSS class for the default tooltip's wrapping div. |
tooltipWrapperStyle | React.CSSProperties | undefined | Inline styles for the default tooltip's wrapping div. |
renderNode | (props: NodeRenderProps<T>) => React.ReactNode | undefined | Custom function to render the content of each treemap node. Takes precedence over default node rendering.
renderTooltip | (props: TooltipRenderProps<T>) => React.ReactNode | undefined | Custom function to render the content of the tooltip. Takes precedence over default tooltip.


## Data Item Structure

Your data items should at least provide a unique id and a numeric value accessible via your accessor functions.

```ts
interface TreemapDataItem {
  id: string | number;
  value: number;       // Non-negative for area calculation
  [key: string]: any;  // Your custom fields
}
```

## Custom Rendering Props

- NodeRenderProps<T>:
```ts
interface NodeRenderProps<T extends TreemapDataItem> {
  item: LayoutDataPoint<T>; // Processed data item with layout info (x, y, width, height)
  isHovered: boolean;
  isPositive: boolean;      // Based on positiveThreshold & valueForColoring/valueAccessor
  width: number;            // Actual display width of the node content area (after gap)
  height: number;           // Actual display height of the node content area (after gap)
}
```

- TooltipRenderProps<T>:
```ts
interface TooltipRenderProps<T extends TreemapDataItem> {
  item: LayoutDataPoint<T> | null; // The hovered item, or null
  mouseX: number;                  // ClientX of mouse
  mouseY: number;                  // ClientY of mouse
  containerRef: React.RefObject<HTMLDivElement | null>; // Ref to treemap container
}
```