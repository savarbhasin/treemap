import React from 'react';
import {
  LayoutDataPoint,
  NodeRenderProps,
  TreemapDataItem,
  TreemapTheme,
} from '../lib/types';

interface InternalTreeMapNodeProps<T extends TreemapDataItem> {
  item: LayoutDataPoint<T>;
  isHovered: boolean;
  isPositive: boolean;
  onMouseEnter: (item: LayoutDataPoint<T>, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  gap: number;
  theme: TreemapTheme; // Resolved theme
  renderNode?: (props: NodeRenderProps<T>) => React.ReactNode;
  nodeWrapperClassName?: string | ((item: LayoutDataPoint<T>) => string);
  nodeWrapperStyle?: React.CSSProperties | ((item: LayoutDataPoint<T>) => React.CSSProperties);
}

// Default Node Content (very basic)
const DefaultNodeContent = <T extends TreemapDataItem>({ item, theme }: { item: LayoutDataPoint<T>; theme: TreemapTheme }) => {
  const displayValue = typeof item.value === 'number' ? item.value.toFixed(2) : String(item.value);
  return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        textAlign: 'center',
        overflow: 'hidden',
        padding: '4px',
        boxSizing: 'border-box',
     }}>
      <div style={{ fontFamily: theme.fontFamily, color: theme.nodeTextColor, fontSize: theme.nodeFontSize, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
        ID: {String(item.id)}
      </div>
      <div style={{ fontFamily: theme.fontFamily, color: theme.nodeTextColor, fontSize: theme.nodeFontSize, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
        Val: {displayValue}
      </div>
    </div>
  );
};

const TreeMapNode = <T extends TreemapDataItem>({
  item,
  isHovered,
  isPositive,
  onMouseEnter,
  onMouseLeave,
  gap,
  theme,
  renderNode,
  nodeWrapperClassName,
  nodeWrapperStyle,
}: InternalTreeMapNodeProps<T>) => {
  const displayWidth = Math.max(0, item.width - gap);
  const displayHeight = Math.max(0, item.height - gap);
  const displayX = item.x + gap / 2;
  const displayY = item.y + gap / 2;

  if (displayWidth <= 0 || displayHeight <= 0) {
    return null; // Don't render zero-size nodes
  }

  let backgroundColor = theme.nodeDefaultBackgroundColor;
  if (isPositive) {
    backgroundColor = theme.nodePositiveBackgroundColor;
  } else if (item.value < 0) { // Assuming negative values exist and are distinct from positiveThreshold
    backgroundColor = theme.nodeNegativeBackgroundColor;
  }
  
  if (isHovered && theme.nodeHoverBackgroundColor) {
    backgroundColor = theme.nodeHoverBackgroundColor;
  }

  const borderColor = isHovered ? theme.nodeHoverBorderColor : theme.nodeBorderColor;

  const wrapperStyleBase: React.CSSProperties = {
    position: 'absolute',
    left: `${displayX}px`,
    top: `${displayY}px`,
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    backgroundColor: backgroundColor,
    border: `${theme.nodeBorderWidth}px solid ${borderColor}`,
    boxSizing: 'border-box',
    overflow: 'hidden', // Content should not overflow the node wrapper
    transition: 'background-color 0.2s ease, border-color 0.2s ease', // Smooth hover
    cursor: 'pointer',
  };

  // Resolve user-provided styles/classes
  const resolvedWrapperStyle = typeof nodeWrapperStyle === 'function' ? nodeWrapperStyle(item) : nodeWrapperStyle;
  const finalWrapperStyle = { ...wrapperStyleBase, ...resolvedWrapperStyle };
  const resolvedWrapperClassName = typeof nodeWrapperClassName === 'function' ? nodeWrapperClassName(item) : nodeWrapperClassName;


  // Props for custom renderer or default content
  const nodeContentProps: NodeRenderProps<T> = {
    item,
    isHovered,
    isPositive,
    width: displayWidth, // Pass the actual content area dimensions
    height: displayHeight,
    theme,
  };

  return (
    <div
      style={finalWrapperStyle}
      className={resolvedWrapperClassName}
      onMouseEnter={(e) => onMouseEnter(item, e)}
      onMouseLeave={onMouseLeave}
    >
      {renderNode ? 
        renderNode(nodeContentProps) : 
        (displayWidth > 20 && displayHeight > 15 ? <DefaultNodeContent item={item} theme={theme} /> : null) // Basic check to hide default content if too small
      }
    </div>
  );
};

export default TreeMapNode;