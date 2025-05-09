import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Tooltip from './components/Tooltip';
import {
  TreemapDataItem,
  LayoutDataPoint,
  TreeMapVisualizationProps,
  TreemapTheme,
} from './lib/types';
import { defaultTreemapTheme } from './constants/theme';
import { squarify } from './lib/algorithms';
import TreeMapNode from './components/TreeMapNode';

const CustomTreeMapVisualization = <T extends TreemapDataItem>({
  data,
  valueAccessor,
  idAccessor,
  positiveThreshold = 0,
  gap = 4,
  width = '100%',
  height = '600px',
  theme: customTheme,
  containerClassName,
  containerStyle,
  nodeWrapperClassName,
  nodeWrapperStyle,
  tooltipWrapperClassName,
  tooltipWrapperStyle,
  renderNode,
  renderTooltip,
  valueForColoring, // New prop
}: TreeMapVisualizationProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [layout, setLayout] = useState<LayoutDataPoint<T>[]>([]);
  const [hoveredItem, setHoveredItem] = useState<LayoutDataPoint<T> | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const resolvedTheme = useMemo((): TreemapTheme => {
    return { ...defaultTreemapTheme, ...customTheme };
  }, [customTheme]);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      const resizeObserver = new ResizeObserver(entries => {
        if (entries && entries.length > 0) {
          const { width: w, height: h } = entries[0].contentRect;
          setDimensions({ width: w, height: h });
        }
      });
      resizeObserver.observe(currentRef);
      const { width: initialW, height: initialH } = currentRef.getBoundingClientRect();
      setDimensions({ width: initialW, height: initialH });
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
      setLayout([]);
      return;
    }

    const processedData = data.map(item => ({
        ...item, // Spread original item data
        id: idAccessor(item), // Ensure ID is accessed
        value: valueAccessor(item), // Ensure value for area is accessed
    })).filter(item => typeof item.value === 'number' && isFinite(item.value) && item.value >= 0) // Squarify needs positive values for area
       .sort((a, b) => b.value - a.value); // Sort by value for squarify

    const totalValue = processedData.reduce((sum, item) => sum + item.value, 0);
    
    if (totalValue === 0) {
        setLayout(processedData.map(d => ({
            ...d, x: 0, y: 0, width: 0, height: 0, scaledValue: 0
        })));
        return;
    }

    const availableWidth = dimensions.width;
    const availableHeight = dimensions.height;
    const totalArea = availableWidth * availableHeight;
    
    const nodesWithScaledValue = processedData.map(item => ({
      ...item,
      scaledValue: (item.value / totalValue) * totalArea,
    }));

    const newLayout: LayoutDataPoint<T>[] = [];
    if (nodesWithScaledValue.length > 0) {
        squarify<T>(nodesWithScaledValue, 0, 0, availableWidth, availableHeight, newLayout);
    }
    setLayout(newLayout);

  }, [data, dimensions, valueAccessor, idAccessor]);

  const handleMouseEnter = useCallback((item: LayoutDataPoint<T>, event: React.MouseEvent) => {
    setHoveredItem(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (hoveredItem) { 
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredItem]);

  const finalContainerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    background: resolvedTheme.containerBackground,
    fontFamily: resolvedTheme.fontFamily,
    ...containerStyle,
  };

  return (
    <div
      ref={containerRef}
      style={finalContainerStyle}
      className={containerClassName}
      onMouseMove={handleMouseMove}
    >
      {layout.map((item) => {
        // Determine 'isPositive' based on `valueForColoring` or fallback to `item.value`
        const valueToCompare = valueForColoring ? valueForColoring(item) : item.value;
        const isPositive = valueToCompare > positiveThreshold;

        return (
          <TreeMapNode<T>
            key={item.id} // Use the unique ID from idAccessor
            item={item}
            isPositive={isPositive}
            isHovered={hoveredItem?.id === item.id}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            gap={gap}
            theme={resolvedTheme}
            renderNode={renderNode}
            nodeWrapperClassName={nodeWrapperClassName}
            nodeWrapperStyle={nodeWrapperStyle}
          />
        );
      })}
      <Tooltip<T>
        item={hoveredItem}
        mouseX={mousePosition.x}
        mouseY={mousePosition.y}
        containerRef={containerRef}
        theme={resolvedTheme}
        renderTooltip={renderTooltip}
        tooltipWrapperClassName={tooltipWrapperClassName}
        tooltipWrapperStyle={tooltipWrapperStyle}
      />
    </div>
  );
};

export default CustomTreeMapVisualization;