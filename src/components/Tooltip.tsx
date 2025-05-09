import React from 'react';
import { TooltipRenderProps, LayoutDataPoint, TreemapDataItem, TreemapTheme } from '../lib/types';

interface InternalTooltipProps<T extends TreemapDataItem> {
  item: LayoutDataPoint<T> | null;
  mouseX: number;
  mouseY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  theme: TreemapTheme; // Resolved theme
  renderTooltip?: (props: TooltipRenderProps<T>) => React.ReactNode;
  tooltipWrapperClassName?: string;
  tooltipWrapperStyle?: React.CSSProperties;
}

// Default Tooltip Content (very basic)
const DefaultTooltipContent = <T extends TreemapDataItem>({ item, theme }: { item: LayoutDataPoint<T>; theme: TreemapTheme }) => {
  if (!item) return null;
  // Access 'value' directly as it's part of LayoutDataPoint
  const displayValue = typeof item.value === 'number' ? item.value.toFixed(2) : String(item.value);
  
  return (
    <div style={{ fontFamily: theme.fontFamily, color: theme.tooltipTextColor, fontSize: theme.tooltipFontSize }}>
      <div>ID: {String(item.id)}</div>
      <div>Value: {displayValue}</div>
      {/* User can access item.anyOtherCustomData here if they write their own renderTooltip */}
    </div>
  );
};

const Tooltip = <T extends TreemapDataItem>({
  item,
  mouseX,
  mouseY,
  containerRef,
  theme,
  renderTooltip,
  tooltipWrapperClassName,
  tooltipWrapperStyle,
}: InternalTooltipProps<T>) => {
  if (!item) return null;

  const containerRect = containerRef.current?.getBoundingClientRect();
  let left = mouseX + 15;
  let top = mouseY + 15;

  // Basic boundary detection (can be improved or made configurable)
  // For now, assume a fixed default tooltip width/height for adjustment
  const tooltipEstimatedWidth = 200; 
  const tooltipEstimatedHeight = 80;

  if (containerRect) {
    if (left + tooltipEstimatedWidth > containerRect.right) {
      left = mouseX - tooltipEstimatedWidth - 15;
    }
    if (top + tooltipEstimatedHeight > containerRect.bottom) {
      top = mouseY - tooltipEstimatedHeight - 15;
    }
    left = Math.max(containerRect.left, left); // Don't go off left
    top = Math.max(containerRect.top, top);   // Don't go off top
  }

  const wrapperFinalStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    padding: theme.tooltipPadding,
    background: theme.tooltipBackgroundColor,
    border: `${theme.nodeBorderWidth}px solid ${theme.tooltipBorderColor}`,
    borderRadius: theme.tooltipBorderRadius,
    boxShadow: theme.tooltipShadow,
    zIndex: 1000,
    pointerEvents: 'none',
    minWidth: '100px', // Minimum sensible width
    ...tooltipWrapperStyle, // User-provided inline styles
  };

  return (
    <div style={wrapperFinalStyle} className={tooltipWrapperClassName}>
      {renderTooltip ? 
        renderTooltip({ item, mouseX, mouseY, containerRef, theme }) :
        <DefaultTooltipContent item={item} theme={theme} />
      }
    </div>
  );
};

export default Tooltip;