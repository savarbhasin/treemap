import { TreemapDataItem, LayoutDataPoint } from './types';

// Helper (same as before)
function getWorstAspectRatio(row: { scaledValue: number }[], length: number): number {
  if (!row.length || length === 0) return Infinity;
  const sumScaledValue = row.reduce((sum, item) => sum + item.scaledValue, 0);
  if (sumScaledValue === 0) return Infinity;

  let maxRatio = 0;
  for (const item of row) {
    const itemArea = item.scaledValue;
    const stripWidth = sumScaledValue / length;
    if (stripWidth === 0) continue;
    const itemLength = itemArea / stripWidth;
    const ratio = Math.max(itemLength / stripWidth, stripWidth / itemLength);
    if (ratio > maxRatio) {
      maxRatio = ratio;
    }
  }
  return maxRatio;
}

// Main squarify recursive function
export function squarify<T extends TreemapDataItem>(
  nodes: (T & { scaledValue: number })[],
  x: number,
  y: number,
  w: number,
  h: number,
  outputLayout: LayoutDataPoint<T>[]
): void {
  if (!nodes.length) return;

  if (nodes.length === 1) {
    outputLayout.push({ ...nodes[0], x, y, width: w, height: h });
    return;
  }

  let currentRow: (T & { scaledValue: number })[] = [];
  const shortSideLength = Math.min(w, h);
  const isHorizontalLayout = w >= h;

  let sumValueCurrentRow = 0;
  let worstRatio = Infinity;

  let i = 0;
  for (; i < nodes.length; i++) {
    const node = nodes[i];
    const potentialRow = [...currentRow, node];
    const sumValuePotentialRow = sumValueCurrentRow + node.scaledValue;

    if (sumValuePotentialRow === 0 && potentialRow.length > 0) {
      currentRow.push(node);
      continue;
    }
    if (sumValuePotentialRow === 0 && potentialRow.length === 0) {
      continue;
    }

    const newWorstRatioSimple = getWorstAspectRatio(potentialRow, shortSideLength);

    if (currentRow.length === 0 || newWorstRatioSimple <= worstRatio) {
      currentRow.push(node);
      sumValueCurrentRow += node.scaledValue;
      worstRatio = newWorstRatioSimple;
    } else {
      break;
    }
  }

  const remainingNodes = nodes.slice(i);
  const totalScaledValueInRow = currentRow.reduce((sum, item) => sum + item.scaledValue, 0);
  const totalScaledValueForThisRect = nodes.reduce((sum, item) => sum + item.scaledValue, 0);
  
  const proportion = totalScaledValueForThisRect > 0 ? totalScaledValueInRow / totalScaledValueForThisRect : 0;

  if (isHorizontalLayout) {
    const stripWidth = proportion * w;
    let currentYOffset = y;
    currentRow.forEach(node => {
      const nodeHeight = totalScaledValueInRow > 0 
        ? (node.scaledValue / totalScaledValueInRow) * h 
        : ( (stripWidth > 0 && currentRow.length > 0) ? h / currentRow.length : 0);

      if (stripWidth > 0 || nodeHeight > 0) {
          outputLayout.push({ ...node, x, y: currentYOffset, width: stripWidth, height: nodeHeight });
      }
      currentYOffset += nodeHeight;
    });
    if (w - stripWidth > 0.001 && h > 0.001 && remainingNodes.length > 0) {
        squarify(remainingNodes, x + stripWidth, y, w - stripWidth, h, outputLayout);
    } else if (remainingNodes.length > 0) {
        remainingNodes.forEach(remNode => outputLayout.push({...remNode, x: x + stripWidth, y, width: 0, height: 0}))
    }

  } else {
    const stripHeight = proportion * h;
    let currentXOffset = x;
    currentRow.forEach(node => {
      const nodeWidth = totalScaledValueInRow > 0 
        ? (node.scaledValue / totalScaledValueInRow) * w 
        : ( (stripHeight > 0 && currentRow.length > 0) ? w / currentRow.length : 0);

      if (stripHeight > 0 || nodeWidth > 0) {
          outputLayout.push({ ...node, x: currentXOffset, y, width: nodeWidth, height: stripHeight });
      }
      currentXOffset += nodeWidth;
    });

    if (w > 0.001 && h - stripHeight > 0.001 && remainingNodes.length > 0) {
        squarify(remainingNodes, x, y + stripHeight, w, h - stripHeight, outputLayout);
    } else if (remainingNodes.length > 0) {
        remainingNodes.forEach(remNode => outputLayout.push({...remNode, x, y: y + stripHeight, width: 0, height: 0}))
    }
  }
}