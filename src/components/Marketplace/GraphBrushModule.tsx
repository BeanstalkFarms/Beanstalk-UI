import React, { useRef, useState, useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { LinearGradient } from '@visx/gradient';
import { max, extent } from 'd3-array';

import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { PodListing } from 'state/marketplace/reducer';
import AreaChart from './AreaChart';

// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const accentColor = '#f6acc8';
export const background = '#584153';
export const background2 = '#af8baf';
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: 'white',
};

// accessors
const getDate = (d: AppleStock) => new Date(d.date);
const getStockValue = (d: AppleStock) => d.close;
const getIndex = (l: PodListing) => l.index.toNumber();
const getPrice = (l: PodListing) => l.pricePerPod.toNumber();

export type BrushProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
};

function BrushChart({
  compact = false,
  width = 400,
  height =  300,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 20,
  },
}: BrushProps) {
  const brushRef = useRef<BaseBrush | null>(null);
  
  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const [filteredListings, setFilteredListings] = useState(listings);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const listingsCopy = listings.filter((s) => {
      const x = getIndex(s);
      const y = getPrice(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredListings(listingsCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact ? chartSeparation / 2 : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  // scales
  const indexScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, xMax],
        domain: extent(filteredListings, getIndex) as [number, number],
      }),
    [xMax, filteredListings],
  );
  const priceScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredListings, getPrice) || 0],
        nice: true,
      }),
    [yMax, filteredListings],
  );
  const brushIndexScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, xBrushMax],
        domain: extent(listings, getIndex) as [number, number],
      }),
    [xBrushMax, listings],
  );
  const brushPriceScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(listings, getPrice) || 0],
        nice: true,
      }),
    [yBrushMax, listings],
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: 0 },
      end: { x: 0.5 },
    }),
    [/* brushIndexScale */],
  );

  // event handlers
  const handleClearClick = () => {
    if (brushRef?.current) {
      setFilteredListings(listings);
      brushRef.current.reset();
    }
  };

  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater: UpdateBrush = (prevBrush) => {
        const newExtent = brushRef.current!.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end,
        );

        const newState: BaseBrushState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient id={GRADIENT_ID} from={background} to={background2} rotate={45} />
        <rect x={0} y={0} width={width} height={height} fill={`url(#${GRADIENT_ID})`} rx={14} />
        {/* Main chart */}
        <AreaChart
          hideBottomAxis={compact}
          data={filteredListings}
          width={width}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          xScale={indexScale}
          yScale={priceScale}
          gradientColor={background2}
        />
        {/* Brush */}
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={listings}
          width={width}
          yMax={yBrushMax}
          xScale={brushIndexScale}
          yScale={brushPriceScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushIndexScale}
            yScale={brushPriceScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredListings(listings)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
          />
        </AreaChart>
      </svg>
      <button onClick={handleClearClick}>Clear</button>&nbsp;
      <button onClick={handleResetClick}>Reset</button>
    </div>
  );
}

export default BrushChart;
